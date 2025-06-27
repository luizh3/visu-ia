import React, { useRef, useState, useEffect } from 'react'
import { Pipette, X, Upload, Image as ImageIcon, Palette } from 'lucide-react'
import ColorThief from 'colorthief'

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
    const [dominantColors, setDominantColors] = useState<string[]>([])
    const [isExtractingColors, setIsExtractingColors] = useState(false)
    const [backgroundSensitivity, setBackgroundSensitivity] = useState(50) // 0-100
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

    useEffect(() => {
        if (imagePreview && imageRef.current) {
            imageRef.current.src = imagePreview
        }
    }, [imagePreview])

    // Extract dominant colors when image loads
    useEffect(() => {
        if (imageRef.current && imagePreview) {
            const img = imageRef.current
            if (img.complete) {
                extractDominantColors(img)
            } else {
                img.onload = () => extractDominantColors(img)
            }
        }
    }, [imagePreview])

    const extractDominantColors = (img: HTMLImageElement) => {
        setIsExtractingColors(true)
        try {
            // Create a canvas to avoid CORS issues
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                setIsExtractingColors(false)
                return
            }

            // Set canvas size to match image
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight

            // Draw image on canvas
            ctx.drawImage(img, 0, 0)

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            // Background detection and removal
            const { foregroundPixels, backgroundColor } = detectAndRemoveBackground(data, canvas.width, canvas.height)

            // Extract colors only from foreground (clothing)
            const colorMap = new Map<string, number>()

            foregroundPixels.forEach(pixelIndex => {
                const i = pixelIndex * 4
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]

                // Skip transparent pixels
                if (data[i + 3] < 128) return

                // Skip pixels too similar to background
                const distanceToBackground = Math.sqrt(
                    Math.pow(r - backgroundColor.r, 2) +
                    Math.pow(g - backgroundColor.g, 2) +
                    Math.pow(b - backgroundColor.b, 2)
                )

                if (distanceToBackground < 30) return // Skip if too similar to background

                // Quantize colors to reduce similar colors
                const quantizedR = Math.floor(r / 32) * 32
                const quantizedG = Math.floor(g / 32) * 32
                const quantizedB = Math.floor(b / 32) * 32

                const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
                colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
            })

            // Sort colors by frequency and get top 5
            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([colorKey]) => {
                    const [r, g, b] = colorKey.split(',').map(Number)
                    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
                })

            setDominantColors(sortedColors)

            // Set the first dominant color as the current color
            if (sortedColors.length > 0) {
                onColorChange(sortedColors[0])
            }
        } catch (error) {
            console.error('Error extracting colors:', error)
            // Fallback: try to use ColorThief if available
            try {
                const colorThief = new ColorThief()
                const palette = colorThief.getPalette(img, 5)
                const colors = palette.map(([r, g, b]) =>
                    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
                )
                setDominantColors(colors)
                if (colors.length > 0) {
                    onColorChange(colors[0])
                }
            } catch (fallbackError) {
                console.error('Fallback color extraction also failed:', fallbackError)
            }
        } finally {
            setIsExtractingColors(false)
        }
    }

    const detectAndRemoveBackground = (data: Uint8ClampedArray, width: number, height: number) => {
        // Sample border pixels to detect background color
        const borderPixels: number[][] = []

        // Sample top and bottom borders
        for (let x = 0; x < width; x += 10) {
            // Top border
            const topIndex = (x + 0 * width) * 4
            borderPixels.push([data[topIndex], data[topIndex + 1], data[topIndex + 2]])

            // Bottom border
            const bottomIndex = (x + (height - 1) * width) * 4
            borderPixels.push([data[bottomIndex], data[bottomIndex + 1], data[bottomIndex + 2]])
        }

        // Sample left and right borders
        for (let y = 0; y < height; y += 10) {
            // Left border
            const leftIndex = (0 + y * width) * 4
            borderPixels.push([data[leftIndex], data[leftIndex + 1], data[leftIndex + 2]])

            // Right border
            const rightIndex = ((width - 1) + y * width) * 4
            borderPixels.push([data[rightIndex], data[rightIndex + 1], data[rightIndex + 2]])
        }

        // Calculate average background color
        const avgR = Math.round(borderPixels.reduce((sum, pixel) => sum + pixel[0], 0) / borderPixels.length)
        const avgG = Math.round(borderPixels.reduce((sum, pixel) => sum + pixel[1], 0) / borderPixels.length)
        const avgB = Math.round(borderPixels.reduce((sum, pixel) => sum + pixel[2], 0) / borderPixels.length)

        const backgroundColor = { r: avgR, g: avgG, b: avgB }

        // Find foreground pixels (non-background)
        const foregroundPixels: number[] = []
        const tolerance = backgroundSensitivity // Use configurable sensitivity

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (x + y * width) * 4
                const r = data[index]
                const g = data[index + 1]
                const b = data[index + 2]
                const a = data[index + 3]

                // Skip transparent pixels
                if (a < 128) continue

                // Calculate distance to background color
                const distance = Math.sqrt(
                    Math.pow(r - backgroundColor.r, 2) +
                    Math.pow(g - backgroundColor.g, 2) +
                    Math.pow(b - backgroundColor.b, 2)
                )

                // If pixel is significantly different from background, it's foreground
                if (distance > tolerance) {
                    foregroundPixels.push(x + y * width)
                }
            }
        }

        return { foregroundPixels, backgroundColor }
    }

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
            // Reset colors when new image is uploaded
            setPickedColor(null)
            setDominantColors([])
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
                setDominantColors([])
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
        setDominantColors([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const selectDominantColor = (color: string) => {
        onColorChange(color)
        setPickedColor(color)
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

                {/* Dominant colors palette */}
                {imagePreview && dominantColors.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Palette size={16} className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    Cores predominantes extraídas automaticamente:
                                </span>
                                {isExtractingColors && (
                                    <div className="text-xs text-gray-500">Extraindo...</div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                {showAdvancedOptions ? 'Ocultar' : 'Avançado'}
                            </button>
                        </div>

                        {/* Advanced options */}
                        {showAdvancedOptions && (
                            <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Sensibilidade de Detecção de Fundo: {backgroundSensitivity}
                                    </label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={backgroundSensitivity}
                                        onChange={(e) => {
                                            setBackgroundSensitivity(Number(e.target.value))
                                            // Re-extract colors with new sensitivity
                                            if (imageRef.current) {
                                                extractDominantColors(imageRef.current)
                                            }
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Mais sensível</span>
                                        <span>Menos sensível</span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600">
                                    <p>• <strong>Mais sensível:</strong> Remove mais fundo, pode perder detalhes da roupa</p>
                                    <p>• <strong>Menos sensível:</strong> Mantém mais detalhes, pode incluir partes do fundo</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                            {dominantColors.map((color, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => selectDominantColor(color)}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${currentColor === color
                                        ? 'border-blue-500 shadow-lg'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={`Selecionar ${color}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

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
                                    {pickedColor ? 'Cor selecionada' : 'Cor atual'}
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
                            : "As cores predominantes são extraídas automaticamente da peça de roupa (fundo removido). Clique em uma cor da paleta, use o ícone da lupa para extração manual, ou ajuste a sensibilidade nas opções avançadas."
                        }
                    </div>
                )}
            </div>

            {/* Hidden canvas for color extraction */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    )
} 