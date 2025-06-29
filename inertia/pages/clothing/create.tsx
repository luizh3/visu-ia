import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '../../components/components/ui/button'
import CustomInput from '../../components/components/ui/custom-input'
import CustomTextarea from '../../components/components/ui/custom-textarea'
import CustomSelect from '../../components/components/ui/custom-select'
import SizeSelect from '../../components/components/ui/size-select'
import ImageUploadColorPicker from '../../components/components/ui/image-upload-color-picker'
import Navbar from '../../components/components/ui/navbar'
import { useCsrf } from '../../hooks/use-csrf'

const CLOTHING_TYPES = [
    { value: 'camiseta', label: 'Camiseta' },
    { value: 'calça', label: 'Calça' },
    { value: 'shorts', label: 'Shorts' },
    { value: 'jaqueta', label: 'Jaqueta' },
    { value: 'blusa', label: 'Blusa' },
    { value: 'saia', label: 'Saia' },
    { value: 'suéter', label: 'Suéter' },
    { value: 'moletom', label: 'Moletom' },
    { value: 'casaco', label: 'Casaco' },
    { value: 'terno', label: 'Terno' },
    { value: 'maiô', label: 'Maiô' },
    { value: 'roupa íntima', label: 'Roupa Íntima' },
    { value: 'meias', label: 'Meias' },
    { value: 'sapatos', label: 'Sapatos' },
    { value: 'botas', label: 'Botas' },
    { value: 'sandálias', label: 'Sandálias' },
    { value: 'chapéu', label: 'Chapéu' },
    { value: 'boné', label: 'Boné' },
    { value: 'cachecol', label: 'Cachecol' },
    { value: 'luvas', label: 'Luvas' },
    { value: 'cinto', label: 'Cinto' },
    { value: 'bolsa', label: 'Bolsa' },
    { value: 'mochila', label: 'Mochila' },
]

export default function ClothingCreate() {
    const [form, setForm] = useState({
        name: '',
        description: '',
        type: '',
        color: '#4F46E5',
        size: '',
    })
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { csrfToken } = useCsrf()

    function handleNameChange(name: string) {
        setForm({ ...form, name })
    }

    function handleDescriptionChange(description: string) {
        setForm({ ...form, description })
    }

    function handleTypeChange(type: string) {
        setForm({ ...form, type, size: '' }) // Reset size when type changes
    }

    function handleSizeChange(size: string) {
        setForm({ ...form, size })
    }

    function handleColorChange(color: string) {
        setForm({ ...form, color })
    }

    function handleImageChange(file: File | null) {
        setImage(file)
        if (file) {
            setImagePreview(URL.createObjectURL(file))
        } else {
            setImagePreview(null)
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!form.name || !form.type || !form.size) {
            alert('Por favor, preencha todos os campos obrigatórios.')
            return
        }

        setIsSubmitting(true)

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('_csrf', csrfToken)
        formData.append('name', form.name)
        formData.append('description', form.description)
        formData.append('type', form.type)
        formData.append('color', form.color)
        formData.append('size', form.size)

        if (image) {
            formData.append('image', image)
        }

        // Use Inertia router to submit the form
        router.post('/clothing', formData, {
            onSuccess: () => {
                setIsSubmitting(false)
            },
            onError: (errors) => {
                setIsSubmitting(false)
                console.error('Erro ao salvar:', errors)
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8">
                <Navbar />
                <div className="flex justify-center">
                    <div className="w-full max-w-6xl">
                        <h1 className="text-2xl font-bold mb-6">Cadastrar nova roupa</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <CustomInput
                                value={form.name}
                                onChange={handleNameChange}
                                placeholder="Nome da roupa"
                                label="Nome"
                                required
                                name="name"
                            />

                            <CustomTextarea
                                value={form.description}
                                onChange={handleDescriptionChange}
                                placeholder="Descreva a roupa..."
                                label="Descrição"
                                name="description"
                                rows={3}
                            />

                            <CustomSelect
                                value={form.type}
                                onChange={handleTypeChange}
                                options={CLOTHING_TYPES}
                                label="Tipo de Roupa"
                                placeholder="Selecione o tipo de roupa..."
                            />

                            <SizeSelect
                                value={form.size}
                                onChange={handleSizeChange}
                                clothingType={form.type}
                                label="Tamanho"
                                placeholder="Selecione o tamanho..."
                            />

                            <ImageUploadColorPicker
                                imageFile={image}
                                imagePreview={imagePreview}
                                currentColor={form.color}
                                onImageChange={handleImageChange}
                                onColorChange={handleColorChange}
                                label="Imagem e Cor da Roupa"
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Salvando...' : 'Salvar Roupa'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
} 