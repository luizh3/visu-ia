import React, { useState } from 'react'
import { Button } from '../../components/components/ui/button'
import CustomInput from '../../components/components/ui/custom-input'
import CustomTextarea from '../../components/components/ui/custom-textarea'
import CustomSelect from '../../components/components/ui/custom-select'
import SizeSelect from '../../components/components/ui/size-select'
import ImageUploadColorPicker from '../../components/components/ui/image-upload-color-picker'
import Navbar from '../../components/components/ui/navbar'
import { useCsrf } from '../../hooks/use-csrf'

const CLOTHING_TYPES = [
    { value: 'chapéu', label: 'Chapéu' },
    { value: 'camiseta', label: 'Camiseta' },
    { value: 'calça', label: 'Calça' },
    { value: 'tênis', label: 'Tênis' },
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8">
                <Navbar />
                <div className="flex justify-center">
                    <div className="w-full max-w-6xl">
                        <h1 className="text-2xl font-bold mb-6">Cadastrar nova roupa</h1>
                        <form method="POST" action="/clothing" className="space-y-6" encType="multipart/form-data">
                            <input type="hidden" name="_csrf" value={csrfToken} />

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
                            <input type="hidden" name="type" value={form.type} />

                            <SizeSelect
                                value={form.size}
                                onChange={handleSizeChange}
                                clothingType={form.type}
                                label="Tamanho"
                                placeholder="Selecione o tamanho..."
                            />
                            <input type="hidden" name="size" value={form.size} />

                            <ImageUploadColorPicker
                                imageFile={image}
                                imagePreview={imagePreview}
                                currentColor={form.color}
                                onImageChange={handleImageChange}
                                onColorChange={handleColorChange}
                                label="Imagem e Cor da Roupa"
                            />
                            <input type="hidden" name="color" value={form.color} />

                            <Button type="submit" className="w-full">Salvar Roupa</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
} 