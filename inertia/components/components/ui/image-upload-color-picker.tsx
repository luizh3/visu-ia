import React, { useRef, useState, useEffect } from 'react'
import { Pipette, X, Upload, Image as ImageIcon } from 'lucide-react'

interface ImageUploadColorPickerProps {
    imageFile: File | null
    imagePreview: string | null
    currentColor: string
    onImageChange: (file: File | null) => void
    onColorChange: (color: string) => void
    label?: string
}

export default function ImageUploadColorPicker({
    imageFile,
    imagePreview,
    currentColor,
    onImageChange,
    onColorChange,
    label
}: ImageUploadColorPickerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isPicking, setIsPicking] = useState(false)
    const [pickedColor, setPickedColor] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        if (imagePreview && imageRef.current) {
            imageRef.current.src = imagePreview
        }
    }, [imagePreview])

    const getColorFromImage = (event: React.MouseEvent<HTMLImageElement>) => {
        if (!canvasRef.current || !imageRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = imageRef.current.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        // Set canvas size to match image
        canvas.width = imageRef.current.naturalWidth
        canvas.height = imageRef.current.naturalHeight

        // Draw image on canvas
        ctx.drawImage(imageRef.current, 0, 0)

        // Calculate the scale factors
        const scaleX = imageRef.current.naturalWidth / rect.width
        const scaleY = imageRef.current.naturalHeight / rect.height

        // Get the actual pixel coordinates
        const pixelX = Math.floor(x * scaleX)
        const pixelY = Math.floor(y * scaleY)

        // Ensure coordinates are within bounds
        if (pixelX < 0 || pixelX >= canvas.width || pixelY < 0 || pixelY >= canvas.height) {
            return
        }

        // Get pixel data
        const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data
        const color = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`

        setPickedColor(color)
        onColorChange(color)
        setIsPicking(false)
    }

    const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
        if (isPicking) {
            getColorFromImage(event)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        onImageChange(file)
        if (file) {
            const preview = URL.createObjectURL(file)
            // Reset color when new image is uploaded
            setPickedColor(null)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            const file = files[0]
            if (file.type.startsWith('image/')) {
                onImageChange(file)
                setPickedColor(null)
            }
        }
    }

    const startColorPicking = () => {
        setIsPicking(true)
    }

    const cancelColorPicking = () => {
        setIsPicking(false)
        setPickedColor(null)
    }

    const handleManualColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onColorChange(e.target.value)
    }

    const removeImage = () => {
        onImageChange(null)
        setPickedColor(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="relative">
            {label && (
                <label className="block font-medium mb-1 text-sm text-gray-700">
                    {label}
                </label>
            )}

            <div className="space-y-4">
                {/* Image upload area */}
                <div className="relative">
                    {imagePreview ? (
                        // Image preview with color picker
                        <div className="relative">
                            <img
                                ref={imageRef}
                                src={imagePreview}
                                alt="Preview"
                                className={`w-full h-64 object-contain border-2 rounded-lg cursor-pointer transition-all ${isPicking
                                    ? 'border-blue-500 shadow-lg'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                onClick={handleImageClick}
                                style={{
                                    cursor: isPicking ? 'crosshair' : 'pointer',
                                    filter: isPicking ? 'brightness(1.1)' : 'none'
                                }}
                            />

                            {/* Action buttons */}
                            <div className="absolute top-2 right-2 flex gap-2">
                                {!isPicking && (
                                    <button
                                        type="button"
                                        onClick={startColorPicking}
                                        className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                                        title="Extrair cor da imagem"
                                    >
                                        <Pipette size={16} className="text-blue-600" />
                                    </button>
                                )}
                                {isPicking && (
                                    <button
                                        type="button"
                                        onClick={cancelColorPicking}
                                        className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                                        title="Cancelar extração de cor"
                                    >
                                        <X size={16} className="text-red-600" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                                    title="Remover imagem"
                                >
                                    <X size={16} className="text-red-600" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Upload area
                        <div
                            className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={32} className="text-gray-400 mb-2" />
                            <p className="text-gray-600 font-medium mb-1">
                                Clique ou arraste uma imagem
                            </p>
                            <p className="text-gray-400 text-sm">
                                PNG, JPG, GIF até 5MB
                            </p>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Color display and manual input */}
                {imagePreview && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                                style={{ backgroundColor: currentColor }}
                            />
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {pickedColor ? 'Cor extraída' : 'Cor atual'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {currentColor}
                                </div>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={currentColor}
                            onChange={handleManualColorChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="#RRGGBB"
                            maxLength={7}
                            pattern="#?[0-9A-Fa-f]{6}"
                        />
                    </div>
                )}

                {/* Instructions */}
                {imagePreview && (
                    <div className="text-xs text-gray-500">
                        {isPicking
                            ? "Clique na imagem para extrair a cor do pixel selecionado (cursor em forma de mira)"
                            : "Clique no ícone da lupa para extrair a cor diretamente da imagem, ou digite manualmente"
                        }
                    </div>
                )}
            </div>

            {/* Hidden canvas for color extraction */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    )
} 