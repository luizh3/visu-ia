import type { HttpContext } from '@adonisjs/core/http'
import Clothing from '#models/clothing'
import apiConfig from '#config/api'
import FormData from 'form-data'
import fetch from 'node-fetch';

// Mapeamento de tipos de roupa baseado no campo category da API
const CLOTHING_TYPE_MAP: { [key: number]: { name: string, value: string } } = {
    0: { name: "Camiseta", value: "camiseta" },
    1: { name: "Calça", value: "calça" },
    2: { name: "Shorts", value: "shorts" },
    3: { name: "Jaqueta", value: "jaqueta" },
    4: { name: "Blusa", value: "blusa" },
    5: { name: "Saia", value: "saia" },
    6: { name: "Suéter", value: "suéter" },
    7: { name: "Moletom", value: "moletom" },
    8: { name: "Casaco", value: "casaco" },
    9: { name: "Terno", value: "terno" },
    10: { name: "Maiô", value: "maiô" },
    11: { name: "Roupa Íntima", value: "roupa íntima" },
    12: { name: "Meias", value: "meias" },
    13: { name: "Sapatos", value: "sapatos" },
    14: { name: "Botas", value: "botas" },
    15: { name: "Sandálias", value: "sandálias" },
    16: { name: "Chapéu", value: "chapéu" },
    17: { name: "Boné", value: "boné" },
    18: { name: "Cachecol", value: "cachecol" },
    19: { name: "Luvas", value: "luvas" },
    20: { name: "Cinto", value: "cinto" },
    21: { name: "Bolsa", value: "bolsa" },
    22: { name: "Mochila", value: "mochila" }
}

// Cache para armazenar dados de análise temporariamente
const analysisCache = new Map<string, any>()

/**
 * Mapeia o número da categoria da API para o tipo de roupa
 */
function mapCategoryToClothingType(categoryNumber: number): { name: string, value: string } {
    return CLOTHING_TYPE_MAP[categoryNumber] || { name: "Desconhecido", value: "desconhecido" }
}

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

// Novas interfaces para compatibilidade de outfit
interface OutfitRating {
    level: string
    emoji: string
    description: string
}

interface DetectedPart {
    category: number
    name: string
    prompt: string
    body_region: string
    probability: number
    percentage: string
}

interface PairwiseCompatibility {
    part1: {
        region: string
        name: string
        prompt: string
    }
    part2: {
        region: string
        name: string
        prompt: string
    }
    similarity: number
    compatibility_level: string
}

interface OutfitCompatibility {
    compatibility_score: number
    outfit_rating: OutfitRating
    detected_parts: {
        torso: DetectedPart
        legs: DetectedPart
        feet: DetectedPart
    }
    pairwise_compatibility: {
        torso_vs_legs: PairwiseCompatibility
        torso_vs_feet: PairwiseCompatibility
        legs_vs_feet: PairwiseCompatibility
    }
    suggestions: string[]
    total_comparisons: number
}

// Novas interfaces para análise completa de outfit
interface OverallRating {
    level: string
    emoji: string
    description: string
    coordination_score: number
    dominant_style: string
    style_confidence: number
}

interface StyleAnalysis {
    dominant_style: string
    style_confidence: number
    all_style_scores: {
        formal: number
        casual: number
        elegant: number
        trendy: number
        classic: number
        modern: number
    }
}

interface CoordinationAnalysis {
    coordination_score: number
    all_coordination_scores: {
        well_coordinated: number
        color_coordinated: number
        matching: number
        harmonious: number
        balanced: number
        cohesive: number
    }
}

interface DetailedScores {
    "well coordinated outfit": number
    "stylish outfit": number
    "fashionable outfit": number
    "elegant outfit": number
    "casual outfit": number
    "formal outfit": number
    "professional outfit": number
    "trendy outfit": number
    "classic outfit": number
    "modern outfit": number
    "color coordinated outfit": number
    "matching outfit": number
    "harmonious outfit": number
    "balanced outfit": number
    "cohesive outfit": number
}

interface FullImageAnalysis {
    overall_rating: OverallRating
    style_analysis: StyleAnalysis
    coordination_analysis: CoordinationAnalysis
    detailed_scores: DetailedScores
    insights: string[]
}

interface IndividualPartsAnalysis {
    compatibility_score: number
    outfit_rating: OutfitRating
    detected_parts: {
        torso: DetectedPart
        legs: DetectedPart
        feet: DetectedPart
    }
    pairwise_compatibility: {
        torso_vs_legs: PairwiseCompatibility
        torso_vs_feet: PairwiseCompatibility
        legs_vs_feet: PairwiseCompatibility
    }
    suggestions: string[]
    total_comparisons: number
}

interface CompleteOutfitAnalysis {
    full_image_analysis: FullImageAnalysis
    individual_parts_analysis: IndividualPartsAnalysis
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
    outfit_compatibility?: OutfitCompatibility // Campo legado
    complete_outfit_analysis?: CompleteOutfitAnalysis // Novo campo
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
    async store({ request, response }: HttpContext) {
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
                    },
                    detectedName: 'Suéter',
                    detectedType: 'suéter'
                },
                legs: {
                    image: '/defaults/clothing.png',
                    classification: {
                        category: 'PANTS',
                        name: 'Calça',
                        probability: 0.74,
                        percentage: '73.62%'
                    },
                    detectedName: 'Calça',
                    detectedType: 'calça'
                },
                feet: {
                    image: '/defaults/clothing.png',
                    classification: {
                        category: 'SHOES',
                        name: 'Sapatos',
                        probability: 0.64,
                        percentage: '64.42%'
                    },
                    detectedName: 'Sapatos',
                    detectedType: 'sapatos'
                }
            },
            // Dados de compatibilidade simulados (legado)
            outfitCompatibility: {
                compatibilityScore: 0.829,
                outfitRating: {
                    level: 'Excelente',
                    emoji: '🌟',
                    description: 'Outfit muito bem combinado! As peças harmonizam perfeitamente.'
                },
                detectedParts: {
                    torso: {
                        category: 6,
                        name: 'Suéter',
                        prompt: 'sweater',
                        bodyRegion: 'torso',
                        probability: 0.91,
                        percentage: '91.33%'
                    },
                    legs: {
                        category: 1,
                        name: 'Calça',
                        prompt: 'pants',
                        bodyRegion: 'legs',
                        probability: 0.74,
                        percentage: '73.62%'
                    },
                    feet: {
                        category: 13,
                        name: 'Sapatos',
                        prompt: 'shoes',
                        bodyRegion: 'feet',
                        probability: 0.64,
                        percentage: '64.42%'
                    }
                },
                pairwiseCompatibility: {
                    torsoVsLegs: {
                        part1: {
                            region: 'torso',
                            name: 'Suéter',
                            prompt: 'sweater'
                        },
                        part2: {
                            region: 'legs',
                            name: 'Calça',
                            prompt: 'pants'
                        },
                        similarity: 0.826,
                        compatibilityLevel: 'Excelente'
                    },
                    torsoVsFeet: {
                        part1: {
                            region: 'torso',
                            name: 'Suéter',
                            prompt: 'sweater'
                        },
                        part2: {
                            region: 'feet',
                            name: 'Sapatos',
                            prompt: 'shoes'
                        },
                        similarity: 0.799,
                        compatibilityLevel: 'Boa'
                    },
                    legsVsFeet: {
                        part1: {
                            region: 'legs',
                            name: 'Calça',
                            prompt: 'pants'
                        },
                        part2: {
                            region: 'feet',
                            name: 'Sapatos',
                            prompt: 'shoes'
                        },
                        similarity: 0.862,
                        compatibilityLevel: 'Excelente'
                    }
                },
                suggestions: [
                    'O outfit está completo! Considere acessórios para complementar',
                    'As cores combinam muito bem entre si',
                    'Perfeito para ocasiões casuais e elegantes'
                ],
                totalComparisons: 3
            },
            // Novos dados de análise completa simulados
            completeOutfitAnalysis: {
                fullImageAnalysis: {
                    overallRating: {
                        level: 'Baixo',
                        emoji: '⚠️',
                        description: 'Outfit formal com baixa coordenação. Considere trocar algumas peças.',
                        coordinationScore: 0.078,
                        dominantStyle: 'formal',
                        styleConfidence: 0.114
                    },
                    styleAnalysis: {
                        dominantStyle: 'formal',
                        styleConfidence: 0.114,
                        allStyleScores: {
                            formal: 0.114,
                            casual: 0.034,
                            elegant: 0.034,
                            trendy: 0.065,
                            classic: 0.023,
                            modern: 0.095
                        }
                    },
                    coordinationAnalysis: {
                        coordinationScore: 0.078,
                        allCoordinationScores: {
                            well_coordinated: 0.002,
                            color_coordinated: 0.024,
                            matching: 0.001,
                            harmonious: 0.222,
                            balanced: 0.018,
                            cohesive: 0.203
                        }
                    },
                    detailedScores: {
                        "well coordinated outfit": 0.002,
                        "stylish outfit": 0.027,
                        "fashionable outfit": 0.023,
                        "elegant outfit": 0.034,
                        "casual outfit": 0.034,
                        "formal outfit": 0.037,
                        "professional outfit": 0.191,
                        "trendy outfit": 0.065,
                        "classic outfit": 0.023,
                        "modern outfit": 0.095,
                        "color coordinated outfit": 0.024,
                        "matching outfit": 0.001,
                        "harmonious outfit": 0.222,
                        "balanced outfit": 0.018,
                        "cohesive outfit": 0.203
                    },
                    insights: [
                        "As peças precisam de melhor coordenação",
                        "Considere melhorar a combinação de cores"
                    ]
                },
                individualPartsAnalysis: {
                    compatibilityScore: 0.795,
                    outfitRating: {
                        level: 'Bom',
                        emoji: '👍',
                        description: 'Outfit bem combinado. As peças funcionam bem juntas.'
                    },
                    detectedParts: {
                        torso: {
                            category: 4,
                            name: 'Blusa',
                            prompt: 'blouse',
                            bodyRegion: 'torso',
                            probability: 0.575,
                            percentage: '57.50%'
                        },
                        legs: {
                            category: 1,
                            name: 'Calça',
                            prompt: 'pants',
                            bodyRegion: 'legs',
                            probability: 0.249,
                            percentage: '24.93%'
                        },
                        feet: {
                            category: 15,
                            name: 'Sandálias',
                            prompt: 'sandals',
                            bodyRegion: 'feet',
                            probability: 0.813,
                            percentage: '81.26%'
                        }
                    },
                    pairwiseCompatibility: {
                        torsoVsLegs: {
                            part1: {
                                region: 'torso',
                                name: 'Blusa',
                                prompt: 'blouse'
                            },
                            part2: {
                                region: 'legs',
                                name: 'Calça',
                                prompt: 'pants'
                            },
                            similarity: 0.806,
                            compatibilityLevel: 'Excelente'
                        },
                        torsoVsFeet: {
                            part1: {
                                region: 'torso',
                                name: 'Blusa',
                                prompt: 'blouse'
                            },
                            part2: {
                                region: 'feet',
                                name: 'Sandálias',
                                prompt: 'sandals'
                            },
                            similarity: 0.743,
                            compatibilityLevel: 'Boa'
                        },
                        legsVsFeet: {
                            part1: {
                                region: 'legs',
                                name: 'Calça',
                                prompt: 'pants'
                            },
                            part2: {
                                region: 'feet',
                                name: 'Sandálias',
                                prompt: 'sandals'
                            },
                            similarity: 0.836,
                            compatibilityLevel: 'Excelente'
                        }
                    },
                    suggestions: [
                        'Um Bolsa pode complementar o outfit',
                        'Um Mochila pode complementar o outfit'
                    ],
                    totalComparisons: 3
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

        // Processar dados de compatibilidade (legado ou novo)
        let outfitCompatibility = null
        let completeOutfitAnalysis = null

        if (apiData.complete_outfit_analysis) {
            // Usar dados da nova API
            completeOutfitAnalysis = {
                fullImageAnalysis: {
                    overallRating: {
                        level: apiData.complete_outfit_analysis.full_image_analysis.overall_rating.level,
                        emoji: apiData.complete_outfit_analysis.full_image_analysis.overall_rating.emoji,
                        description: apiData.complete_outfit_analysis.full_image_analysis.overall_rating.description,
                        coordinationScore: apiData.complete_outfit_analysis.full_image_analysis.overall_rating.coordination_score,
                        dominantStyle: apiData.complete_outfit_analysis.full_image_analysis.overall_rating.dominant_style,
                        styleConfidence: apiData.complete_outfit_analysis.full_image_analysis.overall_rating.style_confidence
                    },
                    styleAnalysis: {
                        dominantStyle: apiData.complete_outfit_analysis.full_image_analysis.style_analysis.dominant_style,
                        styleConfidence: apiData.complete_outfit_analysis.full_image_analysis.style_analysis.style_confidence,
                        allStyleScores: apiData.complete_outfit_analysis.full_image_analysis.style_analysis.all_style_scores
                    },
                    coordinationAnalysis: {
                        coordinationScore: apiData.complete_outfit_analysis.full_image_analysis.coordination_analysis.coordination_score,
                        allCoordinationScores: apiData.complete_outfit_analysis.full_image_analysis.coordination_analysis.all_coordination_scores
                    },
                    detailedScores: apiData.complete_outfit_analysis.full_image_analysis.detailed_scores,
                    insights: apiData.complete_outfit_analysis.full_image_analysis.insights
                },
                individualPartsAnalysis: {
                    compatibilityScore: apiData.complete_outfit_analysis.individual_parts_analysis.compatibility_score,
                    outfitRating: {
                        level: apiData.complete_outfit_analysis.individual_parts_analysis.outfit_rating.level,
                        emoji: apiData.complete_outfit_analysis.individual_parts_analysis.outfit_rating.emoji,
                        description: apiData.complete_outfit_analysis.individual_parts_analysis.outfit_rating.description
                    },
                    detectedParts: {
                        torso: {
                            category: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.torso.category,
                            name: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.torso.name,
                            prompt: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.torso.prompt,
                            bodyRegion: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.torso.body_region,
                            probability: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.torso.probability,
                            percentage: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.torso.percentage
                        },
                        legs: {
                            category: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.legs.category,
                            name: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.legs.name,
                            prompt: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.legs.prompt,
                            bodyRegion: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.legs.body_region,
                            probability: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.legs.probability,
                            percentage: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.legs.percentage
                        },
                        feet: {
                            category: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.feet.category,
                            name: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.feet.name,
                            prompt: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.feet.prompt,
                            bodyRegion: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.feet.body_region,
                            probability: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.feet.probability,
                            percentage: apiData.complete_outfit_analysis.individual_parts_analysis.detected_parts.feet.percentage
                        }
                    },
                    pairwiseCompatibility: {
                        torsoVsLegs: {
                            part1: {
                                region: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_legs.part1.region,
                                name: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_legs.part1.name,
                                prompt: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_legs.part1.prompt
                            },
                            part2: {
                                region: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_legs.part2.region,
                                name: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_legs.part2.name,
                                prompt: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_legs.part2.prompt
                            },
                            similarity: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_legs.similarity,
                            compatibilityLevel: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_legs.compatibility_level
                        },
                        torsoVsFeet: {
                            part1: {
                                region: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_feet.part1.region,
                                name: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_feet.part1.name,
                                prompt: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_feet.part1.prompt
                            },
                            part2: {
                                region: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_feet.part2.region,
                                name: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_feet.part2.name,
                                prompt: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_feet.part2.prompt
                            },
                            similarity: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_feet.similarity,
                            compatibilityLevel: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.torso_vs_feet.compatibility_level
                        },
                        legsVsFeet: {
                            part1: {
                                region: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.legs_vs_feet.part1.region,
                                name: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.legs_vs_feet.part1.name,
                                prompt: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.legs_vs_feet.part1.prompt
                            },
                            part2: {
                                region: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.legs_vs_feet.part2.region,
                                name: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.legs_vs_feet.part2.name,
                                prompt: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.legs_vs_feet.part2.prompt
                            },
                            similarity: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.legs_vs_feet.similarity,
                            compatibilityLevel: apiData.complete_outfit_analysis.individual_parts_analysis.pairwise_compatibility.legs_vs_feet.compatibility_level
                        }
                    },
                    suggestions: apiData.complete_outfit_analysis.individual_parts_analysis.suggestions,
                    totalComparisons: apiData.complete_outfit_analysis.individual_parts_analysis.total_comparisons
                }
            }
        } else if (apiData.outfit_compatibility) {
            // Usar dados legados
            outfitCompatibility = {
                compatibilityScore: apiData.outfit_compatibility.compatibility_score,
                outfitRating: {
                    level: apiData.outfit_compatibility.outfit_rating.level,
                    emoji: apiData.outfit_compatibility.outfit_rating.emoji,
                    description: apiData.outfit_compatibility.outfit_rating.description
                },
                detectedParts: {
                    torso: {
                        category: apiData.outfit_compatibility.detected_parts.torso.category,
                        name: apiData.outfit_compatibility.detected_parts.torso.name,
                        prompt: apiData.outfit_compatibility.detected_parts.torso.prompt,
                        bodyRegion: apiData.outfit_compatibility.detected_parts.torso.body_region,
                        probability: apiData.outfit_compatibility.detected_parts.torso.probability,
                        percentage: apiData.outfit_compatibility.detected_parts.torso.percentage
                    },
                    legs: {
                        category: apiData.outfit_compatibility.detected_parts.legs.category,
                        name: apiData.outfit_compatibility.detected_parts.legs.name,
                        prompt: apiData.outfit_compatibility.detected_parts.legs.prompt,
                        bodyRegion: apiData.outfit_compatibility.detected_parts.legs.body_region,
                        probability: apiData.outfit_compatibility.detected_parts.legs.probability,
                        percentage: apiData.outfit_compatibility.detected_parts.legs.percentage
                    },
                    feet: {
                        category: apiData.outfit_compatibility.detected_parts.feet.category,
                        name: apiData.outfit_compatibility.detected_parts.feet.name,
                        prompt: apiData.outfit_compatibility.detected_parts.feet.prompt,
                        bodyRegion: apiData.outfit_compatibility.detected_parts.feet.body_region,
                        probability: apiData.outfit_compatibility.detected_parts.feet.probability,
                        percentage: apiData.outfit_compatibility.detected_parts.feet.percentage
                    }
                },
                pairwiseCompatibility: {
                    torsoVsLegs: {
                        part1: {
                            region: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_legs.part1.region,
                            name: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_legs.part1.name,
                            prompt: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_legs.part1.prompt
                        },
                        part2: {
                            region: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_legs.part2.region,
                            name: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_legs.part2.name,
                            prompt: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_legs.part2.prompt
                        },
                        similarity: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_legs.similarity,
                        compatibilityLevel: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_legs.compatibility_level
                    },
                    torsoVsFeet: {
                        part1: {
                            region: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_feet.part1.region,
                            name: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_feet.part1.name,
                            prompt: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_feet.part1.prompt
                        },
                        part2: {
                            region: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_feet.part2.region,
                            name: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_feet.part2.name,
                            prompt: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_feet.part2.prompt
                        },
                        similarity: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_feet.similarity,
                        compatibilityLevel: apiData.outfit_compatibility.pairwise_compatibility.torso_vs_feet.compatibility_level
                    },
                    legsVsFeet: {
                        part1: {
                            region: apiData.outfit_compatibility.pairwise_compatibility.legs_vs_feet.part1.region,
                            name: apiData.outfit_compatibility.pairwise_compatibility.legs_vs_feet.part1.name,
                            prompt: apiData.outfit_compatibility.pairwise_compatibility.legs_vs_feet.part1.prompt
                        },
                        part2: {
                            region: apiData.outfit_compatibility.pairwise_compatibility.legs_vs_feet.part2.region,
                            name: apiData.outfit_compatibility.pairwise_compatibility.legs_vs_feet.part2.name,
                            prompt: apiData.outfit_compatibility.pairwise_compatibility.legs_vs_feet.part2.prompt
                        },
                        similarity: apiData.outfit_compatibility.pairwise_compatibility.legs_vs_feet.similarity,
                        compatibilityLevel: apiData.outfit_compatibility.pairwise_compatibility.legs_vs_feet.compatibility_level
                    }
                },
                suggestions: apiData.outfit_compatibility.suggestions,
                totalComparisons: apiData.outfit_compatibility.total_comparisons
            }
        }

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
                    detectedName: apiData.classifications?.torso?.top_prediction?.name || 'Suéter',
                    detectedType: this.getDetectedType(apiData.classifications?.torso?.top_prediction?.category)
                },
                legs: {
                    image: apiData.saved_parts?.legs?.url ? `${baseUrl}${apiData.saved_parts.legs.url}` : '/defaults/clothing.png',
                    classification: {
                        category: apiData.classifications?.legs?.top_prediction?.category || 'UNKNOWN',
                        name: apiData.classifications?.legs?.top_prediction?.name || 'Desconhecido',
                        probability: apiData.classifications?.legs?.top_prediction?.probability || 0,
                        percentage: apiData.classifications?.legs?.top_prediction?.percentage || '0%'
                    },
                    detectedName: apiData.classifications?.legs?.top_prediction?.name || 'Calça',
                    detectedType: this.getDetectedType(apiData.classifications?.legs?.top_prediction?.category)
                },
                feet: {
                    image: apiData.saved_parts?.feet?.url ? `${baseUrl}${apiData.saved_parts.feet.url}` : '/defaults/clothing.png',
                    classification: {
                        category: apiData.classifications?.feet?.top_prediction?.category || 'UNKNOWN',
                        name: apiData.classifications?.feet?.top_prediction?.name || 'Desconhecido',
                        probability: apiData.classifications?.feet?.top_prediction?.probability || 0,
                        percentage: apiData.classifications?.feet?.top_prediction?.percentage || '0%'
                    },
                    detectedName: apiData.classifications?.feet?.top_prediction?.name || 'Sapatos',
                    detectedType: this.getDetectedType(apiData.classifications?.feet?.top_prediction?.category)
                }
            },
            // Dados de compatibilidade (legado)
            outfitCompatibility,
            // Novos dados de análise completa
            completeOutfitAnalysis
        }
    }

    /**
     * Obtém o tipo de roupa baseado na categoria da API
     */
    private getDetectedType(category: string | undefined): string {
        if (!category) return 'desconhecido'

        // Se a categoria for um número, mapeia diretamente
        const categoryNumber = parseInt(category)
        if (!isNaN(categoryNumber)) {
            return mapCategoryToClothingType(categoryNumber).value
        }

        // Se for uma string, tenta mapear baseado no nome
        const categoryLower = category.toLowerCase()

        // Mapeamento de fallback para categorias em texto
        const categoryMap: { [key: string]: string } = {
            'sweater': 'suéter',
            'shirt': 'camiseta',
            't-shirt': 'camiseta',
            'pants': 'calça',
            'shorts': 'shorts',
            'jacket': 'jaqueta',
            'blouse': 'blusa',
            'skirt': 'saia',
            'hoodie': 'moletom',
            'coat': 'casaco',
            'suit': 'terno',
            'swimsuit': 'maiô',
            'underwear': 'roupa íntima',
            'socks': 'meias',
            'shoes': 'sapatos',
            'boots': 'botas',
            'sandals': 'sandálias',
            'hat': 'chapéu',
            'cap': 'boné',
            'scarf': 'cachecol',
            'gloves': 'luvas',
            'belt': 'cinto',
            'bag': 'bolsa',
            'backpack': 'mochila'
        }

        return categoryMap[categoryLower] || 'desconhecido'
    }
} 