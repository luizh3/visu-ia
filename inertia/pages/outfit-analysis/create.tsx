import React, { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button } from '../../components/components/ui/button'
import { Input } from '../../components/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/components/ui/card'
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import Navbar from '../../components/components/ui/navbar'

export default function OutfitAnalysisCreate() {
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const { data, setData, post, processing, errors } = useForm({
        fullBodyImage: null as File | null,
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setData('fullBodyImage', file)

            // Criar preview da imagem
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!data.fullBodyImage) {
            return
        }

        // Usar o sistema de formulários do Inertia que já lida com CSRF
        post('/outfit-analysis', {
            onError: (errors) => {
                console.error('Erro na análise:', errors)
                alert('Erro ao analisar a imagem')
            }
        })
    }

    return (
        <>
            <Head title="Análise de Roupas" />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto py-8">
                    <Navbar />

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-6 w-6" />
                                Análise de Roupas
                            </CardTitle>
                            <CardDescription>
                                Faça upload de uma foto do corpo completo para analisar as roupas que você está vestindo
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Imagem do Corpo Completo
                                    </label>

                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        {previewImage ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="max-w-full h-64 object-contain mx-auto rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setPreviewImage(null)
                                                        setData('fullBodyImage', null)
                                                    }}
                                                >
                                                    Trocar Imagem
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Clique para selecionar ou arraste uma imagem aqui
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        PNG, JPG até 10MB
                                                    </p>
                                                </div>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    id="image-upload"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById('image-upload')?.click()}
                                                >
                                                    Selecionar Imagem
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {errors.fullBodyImage && (
                                        <p className="text-sm text-red-600">{errors.fullBodyImage}</p>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">Dicas para melhor análise:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Tire a foto em um local bem iluminado</li>
                                        <li>• Certifique-se de que todo o corpo esteja visível</li>
                                        <li>• Evite sombras muito fortes</li>
                                        <li>• Use roupas bem definidas e sem muitos padrões</li>
                                    </ul>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!data.fullBodyImage || processing}
                                    className="w-full"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Analisando...
                                        </>
                                    ) : (
                                        'Analisar Roupas'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
} 