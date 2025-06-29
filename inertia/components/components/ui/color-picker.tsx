import React, { useRef, useState, useEffect } from 'react'
import { Pipette, X, Palette } from 'lucide-react'
import ColorThief from 'colorthief'

interface ColorPickerProps {
    imageUrl: string
    currentColor: string
    onColorChange: (color: string) => void
    label?: string
}

export default function ColorPicker({
    imageUrl,
    currentColor,
    onColorChange,
    label
}: ColorPickerProps) {
    console.log('ColorPicker props:', { imageUrl, currentColor, label })

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const [isPicking, setIsPicking] = useState(false)
    const [pickedColor, setPickedColor] = useState<string | null>(null)
    const [dominantColors, setDominantColors] = useState<string[]>([])
    const [isExtractingColors, setIsExtractingColors] = useState(false)
    const [backgroundSensitivity, setBackgroundSensitivity] = useState(50) // 0-100
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

    useEffect(() => {
        if (imageUrl && imageRef.current) {
            imageRef.current.src = imageUrl
        }
    }, [imageUrl])

    // Extract dominant colors when image loads
    useEffect(() => {
        if (imageRef.current && imageUrl) {
            const img = imageRef.current
            console.log('ColorPicker: Image URL changed to:', imageUrl)

            if (img.complete) {
                console.log('ColorPicker: Image already loaded, extracting colors...')
                extractDominantColors(img)
            } else {
                console.log('ColorPicker: Image loading, will extract colors on load...')
                img.onload = () => {
                    console.log('ColorPicker: Image loaded successfully, extracting colors...')
                    extractDominantColors(img)
                }
                img.onerror = (error) => {
                    console.error('ColorPicker: Image failed to load:', error)
                    // Try to extract colors anyway, might work with ColorThief
                    if (img.naturalWidth > 0) {
                        console.log('ColorPicker: Trying to extract colors despite load error...')
                        extractDominantColors(img)
                    }
                }
            }
        }
    }, [imageUrl])

    // Initialize color if empty
    useEffect(() => {
        if ((!currentColor || currentColor === '') && dominantColors.length > 0) {
            console.log('ColorPicker: Setting initial color from dominant colors:', dominantColors[0])
            onColorChange(dominantColors[0])
        }
    }, [dominantColors, currentColor, onColorChange])

    // Force color extraction when component mounts with empty color
    useEffect(() => {
        if ((!currentColor || currentColor === '') && imageRef.current && imageRef.current.complete) {
            console.log('ColorPicker: Component mounted with empty color, forcing extraction...')
            extractDominantColors(imageRef.current)
        }
    }, [])

    // Force color extraction when imageUrl changes and currentColor is empty
    useEffect(() => {
        if (imageUrl && (!currentColor || currentColor === '') && imageRef.current) {
            const img = imageRef.current
            if (img.complete && img.naturalWidth > 0) {
                console.log('ColorPicker: Image URL changed with empty color, forcing extraction...')
                extractDominantColors(img)
            }
        }
    }, [imageUrl, currentColor])

    const extractDominantColors = (img: HTMLImageElement) => {
        console.log('ColorPicker: Starting color extraction for image:', img.src)
        setIsExtractingColors(true)

        try {
            // Create a canvas to avoid CORS issues
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                console.error('ColorPicker: Could not get canvas context')
                setIsExtractingColors(false)
                return
            }

            // Set canvas size to match image
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            console.log('ColorPicker: Canvas size set to:', canvas.width, 'x', canvas.height)

            // Try to draw image on canvas
            try {
                ctx.drawImage(img, 0, 0)
                console.log('ColorPicker: Image drawn to canvas successfully')
            } catch (drawError) {
                console.error('ColorPicker: Failed to draw image to canvas (CORS issue?):', drawError)
                // If canvas drawing fails, try ColorThief directly
                throw new Error('Canvas drawing failed, trying ColorThief')
            }

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            console.log('ColorPicker: Got image data, processing', data.length / 4, 'pixels')

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

            console.log('ColorPicker: Extracted colors successfully:', sortedColors)
            setDominantColors(sortedColors)

            // Set the first dominant color as the current color if no color is set
            if (sortedColors.length > 0 && (!currentColor || currentColor === '')) {
                console.log('ColorPicker: Setting initial color from extraction:', sortedColors[0])
                onColorChange(sortedColors[0])
            }
        } catch (error) {
            console.error('ColorPicker: Error extracting colors:', error)
            // Fallback: try to use ColorThief if available
            try {
                console.log('ColorPicker: Trying ColorThief fallback...')
                const colorThief = new ColorThief()
                const palette = colorThief.getPalette(img, 5)
                const colors = palette.map(([r, g, b]) =>
                    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
                )
                console.log('ColorPicker: ColorThief fallback colors:', colors)
                setDominantColors(colors)
                if (colors.length > 0 && (!currentColor || currentColor === '')) {
                    console.log('ColorPicker: Setting initial color from ColorThief:', colors[0])
                    onColorChange(colors[0])
                }
            } catch (fallbackError) {
                console.error('ColorPicker: Fallback color extraction also failed:', fallbackError)
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

    const selectDominantColor = (color: string) => {
        onColorChange(color)
        setPickedColor(color)
    }

    return (
        <div className="space-y-3">
            {label && (
                <label className="block font-medium text-sm text-gray-700">
                    {label}
                </label>
            )}

            {/* Image with color picker */}
            <div className="relative">
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Parte do corpo"
                    crossOrigin="anonymous"
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
                            className="bg-white p-1.5 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                            title="Extrair cor da imagem"
                        >
                            <Pipette size={14} className="text-blue-600" />
                        </button>
                    )}
                    {isPicking && (
                        <button
                            type="button"
                            onClick={cancelColorPicking}
                            className="bg-white p-1.5 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                            title="Cancelar extração de cor"
                        >
                            <X size={14} className="text-red-600" />
                        </button>
                    )}
                </div>
            </div>

            {/* Dominant colors palette */}
            {dominantColors.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Palette size={14} className="text-gray-600" />
                            <span className="text-xs font-medium text-gray-700">
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

                    <div className="flex gap-1.5 flex-wrap">
                        {dominantColors.map((color, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => selectDominantColor(color)}
                                className={`w-6 h-6 rounded border transition-all hover:scale-110 ${currentColor === color
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
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                    style={{ backgroundColor: currentColor }}
                />
                <input
                    type="text"
                    value={currentColor}
                    onChange={handleManualColorChange}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#RRGGBB"
                    maxLength={7}
                    pattern="#?[0-9A-Fa-f]{6}"
                />
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500">
                {isPicking
                    ? "Clique na imagem para extrair a cor do pixel selecionado (cursor em forma de mira)"
                    : "As cores predominantes são extraídas automaticamente da peça de roupa (fundo removido). Clique em uma cor da paleta, use o ícone da lupa para extração manual, ou ajuste a sensibilidade nas opções avançadas."
                }
            </div>

            {/* Hidden canvas for color extraction */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    )
} 