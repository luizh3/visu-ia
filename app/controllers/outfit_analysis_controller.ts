import { HttpContext } from '@adonisjs/core/http'
import Clothing from '#models/clothing'
import apiConfig from '#config/api'
import FormData from 'form-data'
import fetch from 'node-fetch';

// Cache em memória para dados de análise
const analysisCache = new Map<string, any>()

interface BodyPartAnalysis {
    category: string
    name: string
    probability: number
    percentage: string
}

interface SavedPart {
    filename: string
    url: string
    dimensions: {
        width: number
        height: number
    }
    area: number
}

interface Classification {
    predictions: BodyPartAnalysis[]
    top_prediction: BodyPartAnalysis
    url: string
}

interface ApiResponse {
    success: boolean
    session_id: string
    timestamp: string
    filename: string
    file_size: number
    content_type: string
    device_used: string
    total_parts_saved: number
    body_parts: {
        torso: string
        legs: string
        feet: string
    }
    saved_parts: {
        torso: SavedPart
        legs: SavedPart
        feet: SavedPart
    }
    classifications: {
        torso: Classification
        legs: Classification
        feet: Classification
    }
    summary: {
        total_parts_detected: number
        total_parts_classified: number
        people_detected: number
    }
}

export default class OutfitAnalysisController {
    /**
     * Display form to upload full body image
     */
    async create({ inertia }: HttpContext) {
        return inertia.render('outfit-analysis/create')
    }

    /**
     * Handle image upload and analysis
     */
    async store({ request, response, inertia }: HttpContext) {
        const imageFile = request.file('fullBodyImage')

        if (!imageFile || !imageFile.isValid) {
            if (request.header('X-Inertia')) {
                return response.badRequest('Arquivo de imagem inválido')
            }
            return response.badRequest('Arquivo de imagem inválido')
        }

        try {
            console.log('Arquivo recebido:', {
                fileName: imageFile.clientName,
                fileSize: imageFile.size,
                contentType: imageFile.type,
                tmpPath: imageFile.tmpPath
            })

            // Salvar arquivo no diretório public/uploads
            const uploadPath = `public/uploads/${Date.now()}_${imageFile.clientName || 'image.jpg'}`
            await imageFile.move(process.cwd(), {
                name: uploadPath
            })

            console.log('Arquivo salvo em:', uploadPath)

            // Chamada real para API de terceiros
            const analysisResult = await this.analyzeOutfit(uploadPath, imageFile.clientName || 'image.jpg', imageFile.type || 'image/jpeg')

            console.log('Análise concluída, transformando dados...')

            // Transformar dados da API
            const transformedData = this.transformApiResponse(analysisResult, `/${uploadPath}`)

            console.log('Dados transformados:', transformedData)

            // Se for uma requisição Inertia, salvar dados no cache e redirecionar
            if (request.header('X-Inertia')) {
                console.log('Redirecionando para página de resultados...')
                const sessionId = analysisResult.session_id

                // Salvar dados no cache em memória
                console.log('Salvando dados no cache com chave:', `analysis_${sessionId}`)
                console.log('Dados a serem salvos:', transformedData)
                analysisCache.set(`analysis_${sessionId}`, transformedData)

                // Verificar se foi salvo
                const savedData = analysisCache.get(`analysis_${sessionId}`)
                console.log('Dados salvos no cache:', savedData ? 'SUCESSO' : 'FALHOU')

                // Redirecionar para a página de resultados
                return response.redirect(`/outfit-analysis/${sessionId}`)
            }

            // Se for uma requisição AJAX normal, retornar JSON
            return response.json({
                success: true,
                analysis: analysisResult,
                originalImage: `/${uploadPath}`
            })

        } catch (error) {
            console.error('Erro na análise:', error)

            if (request.header('X-Inertia')) {
                return response.badRequest('Erro ao analisar a imagem')
            }

            return response.internalServerError('Erro ao analisar a imagem')
        }
    }

    /**
     * Show analysis results
     */
    async show({ params, inertia }: HttpContext) {
        const sessionId = params.sessionId

        try {
            console.log('Buscando dados para sessionId:', sessionId)
            console.log('Chave do cache:', `analysis_${sessionId}`)

            // Tentar buscar dados do cache em memória
            const analysisData = analysisCache.get(`analysis_${sessionId}`)
            console.log('Dados encontrados no cache:', analysisData ? 'SIM' : 'NÃO')

            if (analysisData) {
                console.log('Dados encontrados no cache:', analysisData)
                // Limpar dados do cache após uso
                analysisCache.delete(`analysis_${sessionId}`)
                return inertia.render('outfit-analysis/show', { analysisData })
            }

            // Se não encontrar no cache, usar dados simulados
            console.log('Dados não encontrados no cache, usando fallback')
            return this.showFallback(inertia, sessionId)

        } catch (error) {
            console.error('Erro ao buscar dados:', error)
            return this.showFallback(inertia, sessionId)
        }
    }

    /**
     * Show fallback data when API is not available
     */
    private showFallback(inertia: any, sessionId: string) {
        const analysisData = {
            sessionId,
            originalImage: '/defaults/clothing.png',
            bodyParts: {
                torso: {
                    image: '/defaults/clothing.png',
                    classification: {
                        category: 'SWEATER',
                        name: 'Suéter',
                        probability: 0.91,
                        percentage: '91.33%'
                    }
                },
                legs: {
                    image: '/defaults/clothing.png',
                    classification: {
                        category: 'PANTS',
                        name: 'Calça',
                        probability: 0.74,
                        percentage: '73.62%'
                    }
                },
                feet: {
                    image: '/defaults/clothing.png',
                    classification: {
                        category: 'SHOES',
                        name: 'Sapatos',
                        probability: 0.64,
                        percentage: '64.42%'
                    }
                }
            }
        }

        return inertia.render('outfit-analysis/show', { analysisData })
    }

    /**
     * Save clothing item from analysis
     */
    async saveClothing({ request, response }: HttpContext) {
        const data = request.only(['name', 'description', 'type', 'color', 'size', 'image', 'category'])

        try {
            const clothing = await Clothing.create({
                ...data,
                favorite: false
            })

            return response.json({
                success: true,
                clothing,
                message: 'Roupa salva com sucesso!'
            })

        } catch (error) {
            console.error('Erro ao salvar roupa:', error)
            return response.badRequest({
                success: false,
                message: 'Erro ao salvar a roupa'
            })
        }
    }

    /**
     * Real API call to third-party service
     */
    private async analyzeOutfit(imagePath: string, fileName: string, contentType: string): Promise<ApiResponse> {
        try {
            console.log('Enviando imagem para API:', {
                fileName: fileName,
                imagePath: imagePath,
                contentType: contentType
            })

            const formData = new FormData()
            const fs = await import('fs')

            // Verificar se o arquivo existe
            if (!fs.existsSync(imagePath)) {
                throw new Error(`Arquivo não encontrado: ${imagePath}`)
            }

            // Usar createReadStream para enviar o arquivo
            const fileStream = fs.createReadStream(imagePath)

            formData.append('file', fileStream, {
                filename: fileName,
                contentType: "image/png"
            })

            console.log('Enviando FormData para API...')

            const response = await fetch("http://localhost:8000/api/v1/analysis/complete", {
                method: "POST",
                body: formData,
                headers: {
                    ...formData.getHeaders()
                }
            })

            console.log('Status da resposta:', response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('API Error Response:', errorText)
                throw new Error(`API responded with status: ${response.status} - ${errorText}`)
            }

            const result = await response.json()
            console.log('Resposta da API:', result)

            return result as ApiResponse

        } catch (error) {
            console.error('Erro na chamada da API:', error)
            console.log('Usando dados simulados como fallback')
            return this.getFallbackData()
        }
    }

    /**
     * Fallback data in case API fails
     */
    private getFallbackData(): ApiResponse {

        return {
            success: true,
            session_id: `fallback_${Date.now()}`,
            timestamp: new Date().toISOString().replace(/[-:]/g, '').split('.')[0],
            filename: 'fallback.jpg',
            file_size: 139406,
            content_type: 'image/jpeg',
            device_used: 'cpu',
            total_parts_saved: 3,
            body_parts: {
                torso: '/api/v1/static/body-parts/torso_fallback.jpg',
                legs: '/api/v1/static/body-parts/legs_fallback.jpg',
                feet: '/api/v1/static/body-parts/feet_fallback.jpg'
            },
            saved_parts: {
                torso: {
                    filename: 'torso_fallback.jpg',
                    url: '/api/v1/static/body-parts/torso_fallback.jpg',
                    dimensions: { width: 189, height: 280 },
                    area: 52920
                },
                legs: {
                    filename: 'legs_fallback.jpg',
                    url: '/api/v1/static/body-parts/legs_fallback.jpg',
                    dimensions: { width: 99, height: 420 },
                    area: 41580
                },
                feet: {
                    filename: 'feet_fallback.jpg',
                    url: '/api/v1/static/body-parts/feet_fallback.jpg',
                    dimensions: { width: 65, height: 43 },
                    area: 2795
                }
            },
            classifications: {
                torso: {
                    predictions: [
                        {
                            category: 'SWEATER',
                            name: 'Suéter',
                            probability: 0.9133208394050598,
                            percentage: '91.33%'
                        },
                        {
                            category: 'SHIRT',
                            name: 'Camisa',
                            probability: 0.0866791605949402,
                            percentage: '8.67%'
                        }
                    ],
                    top_prediction: {
                        category: 'SWEATER',
                        name: 'Suéter',
                        probability: 0.9133208394050598,
                        percentage: '91.33%'
                    },
                    url: '/api/v1/static/body-parts/torso_fallback.jpg'
                },
                legs: {
                    predictions: [
                        {
                            category: 'PANTS',
                            name: 'Calça',
                            probability: 0.7361973524093628,
                            percentage: '73.62%'
                        },
                        {
                            category: 'SHORTS',
                            name: 'Shorts',
                            probability: 0.2638026475906372,
                            percentage: '26.38%'
                        }
                    ],
                    top_prediction: {
                        category: 'PANTS',
                        name: 'Calça',
                        probability: 0.7361973524093628,
                        percentage: '73.62%'
                    },
                    url: '/api/v1/static/body-parts/legs_fallback.jpg'
                },
                feet: {
                    predictions: [
                        {
                            category: 'SHOES',
                            name: 'Sapatos',
                            probability: 0.6441813707351685,
                            percentage: '64.42%'
                        },
                        {
                            category: 'SNEAKERS',
                            name: 'Tênis',
                            probability: 0.3558186292648315,
                            percentage: '35.58%'
                        }
                    ],
                    top_prediction: {
                        category: 'SHOES',
                        name: 'Sapatos',
                        probability: 0.6441813707351685,
                        percentage: '64.42%'
                    },
                    url: '/api/v1/static/body-parts/feet_fallback.jpg'
                }
            },
            summary: {
                total_parts_detected: 3,
                total_parts_classified: 3,
                people_detected: 1
            }
        }
    }

    /**
     * Transform API response to frontend format
     */
    private transformApiResponse(apiData: ApiResponse, originalImage: string) {
        const baseUrl = apiConfig.outfitAnalysis.baseUrl

        return {
            sessionId: apiData.session_id,
            originalImage,
            bodyParts: {
                torso: {
                    image: apiData.saved_parts?.torso?.url ? `${baseUrl}${apiData.saved_parts.torso.url}` : '/defaults/clothing.png',
                    classification: {
                        category: apiData.classifications?.torso?.top_prediction?.category || 'UNKNOWN',
                        name: apiData.classifications?.torso?.top_prediction?.name || 'Desconhecido',
                        probability: apiData.classifications?.torso?.top_prediction?.probability || 0,
                        percentage: apiData.classifications?.torso?.top_prediction?.percentage || '0%'
                    },
                    detectedName: apiData.classifications?.torso?.top_prediction?.name || 'Suéter'
                },
                legs: {
                    image: apiData.saved_parts?.legs?.url ? `${baseUrl}${apiData.saved_parts.legs.url}` : '/defaults/clothing.png',
                    classification: {
                        category: apiData.classifications?.legs?.top_prediction?.category || 'UNKNOWN',
                        name: apiData.classifications?.legs?.top_prediction?.name || 'Desconhecido',
                        probability: apiData.classifications?.legs?.top_prediction?.probability || 0,
                        percentage: apiData.classifications?.legs?.top_prediction?.percentage || '0%'
                    },
                    detectedName: apiData.classifications?.legs?.top_prediction?.name || 'Calça'
                },
                feet: {
                    image: apiData.saved_parts?.feet?.url ? `${baseUrl}${apiData.saved_parts.feet.url}` : '/defaults/clothing.png',
                    classification: {
                        category: apiData.classifications?.feet?.top_prediction?.category || 'UNKNOWN',
                        name: apiData.classifications?.feet?.top_prediction?.name || 'Desconhecido',
                        probability: apiData.classifications?.feet?.top_prediction?.probability || 0,
                        percentage: apiData.classifications?.feet?.top_prediction?.percentage || '0%'
                    },
                    detectedName: apiData.classifications?.feet?.top_prediction?.name || 'Sapatos'
                }
            }
        }
    }
} 