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

            // Simple color extraction without background removal for now
            const colorMap = new Map<string, number>()

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]
                const a = data[i + 3]

                // Skip transparent pixels
                if (a < 128) continue

                // Quantize colors to reduce similar colors
                const quantizedR = Math.floor(r / 32) * 32
                const quantizedG = Math.floor(g / 32) * 32
                const quantizedB = Math.floor(b / 32) * 32

                const colorKey = `${quantizedR},${quantizedG},${quantizedB}`
                colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
            }

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
                    <div className="flex items-center gap-2">
                        <Palette size={14} className="text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">
                            Cores predominantes:
                        </span>
                        {isExtractingColors && (
                            <div className="text-xs text-gray-500">Extraindo...</div>
                        )}
                    </div>

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
                    ? "Clique na imagem para extrair a cor do pixel selecionado"
                    : "As cores são extraídas automaticamente. Clique em uma cor da paleta ou use o ícone da lupa para extração manual."
                }
            </div>

            {/* Hidden canvas for color extraction */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    )
} 