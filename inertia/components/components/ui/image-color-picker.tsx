import React, { useRef, useState, useEffect } from 'react'
import { Pipette, X } from 'lucide-react'

interface ImageColorPickerProps {
    imageSrc: string | null
    currentColor: string
    onColorChange: (color: string) => void
    label?: string
}

export default function ImageColorPicker({ imageSrc, currentColor, onColorChange, label }: ImageColorPickerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const [isPicking, setIsPicking] = useState(false)
    const [pickedColor, setPickedColor] = useState<string | null>(null)

    useEffect(() => {
        if (imageSrc && imageRef.current) {
            imageRef.current.src = imageSrc
        }
    }, [imageSrc])

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

        // Get pixel data
        const pixel = ctx.getImageData(x, y, 1, 1).data
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

    if (!imageSrc) {
        return (
            <div className="relative">
                {label && (
                    <label className="block font-medium mb-1 text-sm text-gray-700">
                        {label}
                    </label>
                )}
                <div className="w-full h-40 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">Selecione uma imagem primeiro</span>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            {label && (
                <label className="block font-medium mb-1 text-sm text-gray-700">
                    {label}
                </label>
            )}

            <div className="space-y-4">
                {/* Image with color picker */}
                <div className="relative">
                    <img
                        ref={imageRef}
                        src={imageSrc}
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

                    {/* Color picker overlay */}
                    {isPicking && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                                <Pipette size={16} className="text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    Clique na imagem para escolher a cor
                                </span>
                                <button
                                    onClick={cancelColorPicking}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={16} className="text-gray-400" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Color picker button */}
                    {!isPicking && (
                        <button
                            type="button"
                            onClick={startColorPicking}
                            className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                            title="Extrair cor da imagem"
                        >
                            <Pipette size={16} className="text-blue-600" />
                        </button>
                    )}
                </div>

                {/* Color display and manual input */}
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

                {/* Instructions */}
                <div className="text-xs text-gray-500">
                    {isPicking
                        ? "Clique na imagem para extrair a cor do pixel selecionado"
                        : "Clique no ícone da lupa para extrair a cor diretamente da imagem, ou digite manualmente"
                    }
                </div>
            </div>

            {/* Hidden canvas for color extraction */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    )
} 