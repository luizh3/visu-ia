import React, { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import { Button } from '../../components/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/components/ui/card'
import { Input } from '../../components/components/ui/input'
import CustomTextarea from '../../components/components/ui/custom-textarea'
import CustomSelect from '../../components/components/ui/custom-select'
import SizeSelect from '../../components/components/ui/size-select'
import ColorPicker from '../../components/components/ui/color-picker'
import SuccessModal from '../../components/components/ui/success-modal'
import Navbar from '../../components/components/ui/navbar'
import { useCsrf } from '../../hooks/use-csrf'
import {
    Footprints,
    Shirt,
    Save,
    CheckCircle,
    XCircle
} from 'lucide-react'

interface BodyPartData {
    image: string
    classification: {
        category: string
        name: string
        probability: number
        percentage: string
    }
    detectedName: string
}

interface AnalysisData {
    sessionId: string
    originalImage: string
    bodyParts: {
        torso: BodyPartData
        legs: BodyPartData
        feet: BodyPartData
    }
}

interface ClothingFormData {
    name: string
    description: string
    type: string
    color: string
    size: string
    image: string
    category: string
}

export default function OutfitAnalysisShow({ analysisData }: { analysisData: AnalysisData }) {
    const { fetchWithCsrf } = useCsrf()
    const [savingClothing, setSavingClothing] = useState<string | null>(null)
    const [savedClothing, setSavedClothing] = useState<string[]>([])
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({
        original: true
    })
    const [clothingForms, setClothingForms] = useState<Record<string, ClothingFormData>>({
        torso: {
            name: analysisData.bodyParts.torso.detectedName,
            description: '',
            type: 'camiseta',
            color: '',
            size: 'M',
            image: analysisData.bodyParts.torso.image,
            category: analysisData.bodyParts.torso.classification.category
        },
        legs: {
            name: analysisData.bodyParts.legs.detectedName,
            description: '',
            type: 'calça',
            color: '',
            size: 'M',
            image: analysisData.bodyParts.legs.image,
            category: analysisData.bodyParts.legs.classification.category
        },
        feet: {
            name: analysisData.bodyParts.feet.detectedName,
            description: '',
            type: 'tênis',
            color: '',
            size: 'M',
            image: analysisData.bodyParts.feet.image,
            category: analysisData.bodyParts.feet.classification.category
        }
    })

    const bodyParts = [
        {
            key: 'torso',
            title: 'Torso',
            icon: Shirt,
            description: 'Parte superior do corpo'
        },
        {
            key: 'legs',
            title: 'Pernas',
            icon: Shirt,
            description: 'Parte inferior do corpo'
        },
        {
            key: 'feet',
            title: 'Pés',
            icon: Footprints,
            description: 'Calçados'
        }
    ]

    const handleFormChange = (partKey: string, field: keyof ClothingFormData, value: string) => {
        setClothingForms(prev => ({
            ...prev,
            [partKey]: {
                ...prev[partKey],
                [field]: value
            }
        }))
    }

    const handleImageLoad = (imageKey: string) => {
        setImageLoading(prev => ({
            ...prev,
            [imageKey]: false
        }))
    }

    const handleImageError = (imageKey: string, event: React.SyntheticEvent<HTMLImageElement>) => {
        setImageLoading(prev => ({
            ...prev,
            [imageKey]: false
        }))
        // Fallback para imagem padrão
        event.currentTarget.src = '/defaults/clothing.png'
    }

    // Pré-carregar imagens para melhor performance
    useEffect(() => {
        const preloadImages = () => {
            const images = [
                analysisData.originalImage
            ]

            images.forEach((src, index) => {
                const img = new Image()
                img.onload = () => {
                    const keys = ['original']
                    if (keys[index]) {
                        setImageLoading(prev => ({
                            ...prev,
                            [keys[index]]: false
                        }))
                    }
                }
                img.onerror = () => {
                    const keys = ['original']
                    if (keys[index]) {
                        setImageLoading(prev => ({
                            ...prev,
                            [keys[index]]: false
                        }))
                    }
                }
                img.src = src
            })
        }

        preloadImages()
    }, [analysisData])

    const handleSaveClothing = async (partKey: string) => {
        const formData = clothingForms[partKey]

        if (!formData.name.trim()) {
            alert('Por favor, insira um nome para a roupa')
            return
        }

        setSavingClothing(partKey)

        try {
            const response = await fetchWithCsrf('/outfit-analysis/save-clothing', {
                method: 'POST',
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                setSavedClothing(prev => [...prev, partKey])
                const partNames = { torso: 'Torso', legs: 'Pernas', feet: 'Pés' }
                setSuccessMessage(`${partNames[partKey as keyof typeof partNames]} salvo com sucesso!`)
                setShowSuccessModal(true)
            } else {
                alert('Erro ao salvar a roupa')
            }
        } catch (error) {
            console.error('Erro:', error)
            alert('Erro ao salvar a roupa')
        } finally {
            setSavingClothing(null)
        }
    }

    const getTypeOptions = (partKey: string) => {
        switch (partKey) {
            case 'torso':
                return [
                    { value: 'camiseta', label: 'Camiseta' },
                    { value: 'camisa', label: 'Camisa' },
                    { value: 'suéter', label: 'Suéter' },
                    { value: 'jaqueta', label: 'Jaqueta' },
                    { value: 'casaco', label: 'Casaco' }
                ]
            case 'legs':
                return [
                    { value: 'calça', label: 'Calça' },
                    { value: 'shorts', label: 'Shorts' },
                    { value: 'saia', label: 'Saia' },
                    { value: 'bermuda', label: 'Bermuda' }
                ]
            case 'feet':
                return [
                    { value: 'tênis', label: 'Tênis' },
                    { value: 'sapato', label: 'Sapato' },
                    { value: 'sandália', label: 'Sandália' },
                    { value: 'bota', label: 'Bota' }
                ]
            default:
                return []
        }
    }

    return (
        <>
            <Head title="Resultados da Análise" />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto py-8">
                    <Navbar />

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">Resultados da Análise</h1>
                        <p className="text-gray-600">
                            Análise concluída com sucesso! Veja as roupas detectadas e salve-as se desejar.
                        </p>
                    </div>

                    {/* Imagem Original */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Imagem Original</CardTitle>
                            <CardDescription>Foto do corpo completo enviada para análise</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full max-w-2xl mx-auto bg-gray-100 rounded-lg border overflow-hidden">
                                {imageLoading.original && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                                <img
                                    src={analysisData.originalImage}
                                    alt="Imagem original"
                                    className={`w-full h-auto max-h-96 object-contain transition-opacity duration-300 ${imageLoading.original ? 'opacity-0' : 'opacity-100'
                                        }`}
                                    onLoad={() => handleImageLoad('original')}
                                    onError={(e) => handleImageError('original', e)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Partes do Corpo Detectadas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {bodyParts.map(({ key, title, icon: Icon, description }) => {
                            const partData = analysisData.bodyParts[key as keyof typeof analysisData.bodyParts]
                            const formData = clothingForms[key]
                            const isSaved = savedClothing.includes(key)
                            const isSaving = savingClothing === key

                            return (
                                <Card key={key} className="relative">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-5 w-5" />
                                            <CardTitle>{title}</CardTitle>
                                            {isSaved && (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            )}
                                        </div>
                                        <CardDescription>{description}</CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Classificação */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">
                                                Detectado: {partData.classification.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Confiança: {partData.classification.percentage}
                                            </p>
                                        </div>

                                        {/* Formulário para salvar */}
                                        <div className="space-y-3">
                                            <Input
                                                placeholder="Nome da roupa"
                                                value={formData.name}
                                                onChange={(e) => handleFormChange(key, 'name', e.target.value)}
                                            />

                                            <CustomTextarea
                                                placeholder="Descrição (opcional)"
                                                value={formData.description}
                                                onChange={(value: string) => handleFormChange(key, 'description', value)}
                                            />

                                            <CustomSelect
                                                options={getTypeOptions(key)}
                                                value={formData.type}
                                                onChange={(value: string) => handleFormChange(key, 'type', value)}
                                                placeholder="Tipo de roupa"
                                            />

                                            <ColorPicker
                                                imageUrl={partData.image}
                                                currentColor={formData.color}
                                                onColorChange={(color: string) => handleFormChange(key, 'color', color)}
                                                label="Cor da roupa"
                                            />

                                            <SizeSelect
                                                value={formData.size}
                                                onChange={(value: string) => handleFormChange(key, 'size', value)}
                                                clothingType={formData.type}
                                            />

                                            <Button
                                                onClick={() => handleSaveClothing(key)}
                                                disabled={isSaving || isSaved}
                                                className="w-full"
                                            >
                                                {isSaving ? (
                                                    'Salvando...'
                                                ) : isSaved ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Salvo
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Salvar Roupa
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>

            {showSuccessModal && (
                <SuccessModal
                    open={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    message={successMessage}
                />
            )}
        </>
    )
} 