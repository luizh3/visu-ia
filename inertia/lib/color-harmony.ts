import chroma from 'chroma-js'

export interface ColorHarmonyResult {
    type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary' | 'neutral' | 'mixed'
    confidence: number
    description: string
    suggestions: string[]
    colors: string[]
}

export interface ColorAnalysis {
    primary: string
    secondary: string[]
    harmony: ColorHarmonyResult
    contrast: number
    saturation: number
    brightness: number
}

/**
 * Analisa a harmonia de cores de um conjunto de cores
 */
export function analyzeColorHarmony(colors: string[]): ColorHarmonyResult {
    if (colors.length === 0) {
        return {
            type: 'neutral',
            confidence: 0,
            description: 'Nenhuma cor para analisar',
            suggestions: ['Adicione cores para obter uma análise de harmonia'],
            colors: []
        }
    }

    // Normaliza as cores para HSL usando Chroma.js
    const normalizedColors = colors.map(color => {
        try {
            return chroma(color).hsl()
        } catch {
            // Se não conseguir converter, usa uma cor neutra
            return [0, 0, 0.5] // cinza neutro
        }
    }).filter(color => color !== null)

    if (normalizedColors.length === 0) {
        return {
            type: 'neutral',
            confidence: 0,
            description: 'Não foi possível analisar as cores',
            suggestions: ['Verifique se as cores estão em um formato válido'],
            colors: []
        }
    }

    // Extrai os valores de matiz (hue)
    const hues = normalizedColors.map(color => color[0]).filter(hue => hue !== null && !isNaN(hue))

    if (hues.length === 0) {
        return {
            type: 'neutral',
            confidence: 0.8,
            description: 'Look neutro com tons acromáticos',
            suggestions: ['Adicione cores vibrantes para criar mais contraste'],
            colors
        }
    }

    // Analisa diferentes tipos de harmonia
    const analyses = [
        analyzeMonochromatic(hues, normalizedColors),
        analyzeAnalogous(hues),
        analyzeComplementary(hues),
        analyzeTriadic(hues),
        analyzeTetradic(hues),
        analyzeSplitComplementary(hues)
    ]

    // Retorna a análise com maior confiança
    const bestAnalysis = analyses.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
    )

    return {
        ...bestAnalysis,
        colors
    }
}

/**
 * Analisa harmonia monocromática
 */
function analyzeMonochromatic(hues: number[], colors: number[][]): ColorHarmonyResult {
    const uniqueHues = [...new Set(hues.map(h => Math.round(h / 30) * 30))] // Agrupa por faixas de 30°

    if (uniqueHues.length === 1) {
        const saturations = colors.map(c => c[1])
        const avgSaturation = saturations.reduce((a, b) => a + b, 0) / saturations.length

        return {
            type: 'monochromatic',
            confidence: 0.9,
            description: 'Look monocromático - todas as cores têm a mesma matiz base',
            suggestions: [
                'Harmonia monocromática cria um visual elegante e sofisticado',
                'Perfeito para looks minimalistas e profissionais',
                'Considere adicionar um acessório colorido para destaque'
            ],
            colors: []
        }
    }

    return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }
}

/**
 * Analisa harmonia análoga
 */
function analyzeAnalogous(hues: number[]): ColorHarmonyResult {
    const sortedHues = [...hues].sort((a, b) => a - b)
    const differences = []

    for (let i = 1; i < sortedHues.length; i++) {
        let diff = sortedHues[i] - sortedHues[i - 1]
        if (diff > 180) diff = 360 - diff // Ajusta para diferença menor
        differences.push(diff)
    }

    const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length

    if (avgDifference <= 60 && differences.every(d => d <= 90)) {
        return {
            type: 'analogous',
            confidence: 0.85,
            description: 'Look com cores análogas - cores próximas no círculo cromático',
            suggestions: [
                'Harmonia análoga cria um visual harmonioso e natural',
                'Ideal para looks casuais e confortáveis',
                'Perfeito para transições suaves entre estações'
            ],
            colors: []
        }
    }

    return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }
}

/**
 * Analisa harmonia complementar
 */
function analyzeComplementary(hues: number[]): ColorHarmonyResult {
    if (hues.length < 2) return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }

    for (let i = 0; i < hues.length; i++) {
        for (let j = i + 1; j < hues.length; j++) {
            const diff = Math.abs(hues[i] - hues[j])
            const complementDiff = Math.abs(diff - 180)

            if (complementDiff <= 30) {
                return {
                    type: 'complementary',
                    confidence: 0.8,
                    description: 'Look com cores complementares - cores opostas no círculo cromático',
                    suggestions: [
                        'Harmonia complementar cria alto contraste e impacto visual',
                        'Ideal para looks ousados e chamativos',
                        'Use uma cor como dominante e a outra como destaque'
                    ],
                    colors: []
                }
            }
        }
    }

    return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }
}

/**
 * Analisa harmonia tríade
 */
function analyzeTriadic(hues: number[]): ColorHarmonyResult {
    if (hues.length < 3) return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }

    const sortedHues = [...hues].sort((a, b) => a - b)
    const differences = []

    for (let i = 1; i < sortedHues.length; i++) {
        let diff = sortedHues[i] - sortedHues[i - 1]
        if (diff > 180) diff = 360 - diff
        differences.push(diff)
    }

    const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length

    if (Math.abs(avgDifference - 120) <= 30) {
        return {
            type: 'triadic',
            confidence: 0.75,
            description: 'Look com cores triádicas - três cores equidistantes no círculo cromático',
            suggestions: [
                'Harmonia triádica cria um visual vibrante e equilibrado',
                'Ideal para looks criativos e expressivos',
                'Use uma cor como dominante e as outras como acentos'
            ],
            colors: []
        }
    }

    return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }
}

/**
 * Analisa harmonia tetrádica
 */
function analyzeTetradic(hues: number[]): ColorHarmonyResult {
    if (hues.length < 4) return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }

    const sortedHues = [...hues].sort((a, b) => a - b)
    const differences = []

    for (let i = 1; i < sortedHues.length; i++) {
        let diff = sortedHues[i] - sortedHues[i - 1]
        if (diff > 180) diff = 360 - diff
        differences.push(diff)
    }

    const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length

    if (Math.abs(avgDifference - 90) <= 30) {
        return {
            type: 'tetradic',
            confidence: 0.7,
            description: 'Look com cores tetrádicas - quatro cores formando um retângulo no círculo cromático',
            suggestions: [
                'Harmonia tetrádica cria um visual rico e complexo',
                'Ideal para looks artísticos e criativos',
                'Use com moderação para evitar sobrecarga visual'
            ],
            colors: []
        }
    }

    return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }
}

/**
 * Analisa harmonia complementar dividida
 */
function analyzeSplitComplementary(hues: number[]): ColorHarmonyResult {
    if (hues.length < 3) return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }

    for (let i = 0; i < hues.length; i++) {
        const mainHue = hues[i]
        const others = hues.filter((_, index) => index !== i)

        const hasSplitComplement = others.some(hue => {
            const diff1 = Math.abs(hue - (mainHue + 150))
            const diff2 = Math.abs(hue - (mainHue + 210))
            return Math.min(diff1, diff2) <= 30
        })

        if (hasSplitComplement) {
            return {
                type: 'split-complementary',
                confidence: 0.75,
                description: 'Look com harmonia complementar dividida - uma cor principal e duas complementares',
                suggestions: [
                    'Harmonia complementar dividida oferece contraste sem ser muito intensa',
                    'Ideal para looks equilibrados e sofisticados',
                    'Perfeita para quem quer ousar sem exagerar'
                ],
                colors: []
            }
        }
    }

    return { type: 'mixed', confidence: 0, description: '', suggestions: [], colors: [] }
}

/**
 * Calcula o contraste entre duas cores
 */
export function calculateContrast(color1: string, color2: string): number {
    try {
        return chroma.contrast(color1, color2)
    } catch {
        return 1
    }
}

/**
 * Analisa as propriedades gerais das cores
 */
export function analyzeColors(colors: string[]): ColorAnalysis {
    if (colors.length === 0) {
        return {
            primary: '#000000',
            secondary: [],
            harmony: analyzeColorHarmony([]),
            contrast: 0,
            saturation: 0,
            brightness: 0
        }
    }

    // Encontra a cor mais saturada como primária
    const colorObjects = colors.map(color => {
        try {
            return chroma(color)
        } catch {
            return chroma('#000000')
        }
    })

    const primary = colorObjects.reduce((prev, current) =>
        current.get('hsl.s') > prev.get('hsl.s') ? current : prev
    ).hex()

    const secondary = colorObjects
        .filter(color => color.hex() !== primary)
        .map(color => color.hex())

    const harmony = analyzeColorHarmony(colors)

    // Calcula contraste médio
    let totalContrast = 0
    let contrastCount = 0

    for (let i = 0; i < colorObjects.length; i++) {
        for (let j = i + 1; j < colorObjects.length; j++) {
            totalContrast += chroma.contrast(colorObjects[i], colorObjects[j])
            contrastCount++
        }
    }

    const contrast = contrastCount > 0 ? totalContrast / contrastCount : 0

    // Calcula saturação e brilho médios
    const avgSaturation = colorObjects.reduce((sum, color) => sum + color.get('hsl.s'), 0) / colorObjects.length
    const avgBrightness = colorObjects.reduce((sum, color) => sum + color.get('hsl.l'), 0) / colorObjects.length

    return {
        primary,
        secondary,
        harmony,
        contrast,
        saturation: avgSaturation,
        brightness: avgBrightness
    }
} 