import React from 'react'
import { Palette, Lightbulb, TrendingUp, Eye } from 'lucide-react'
import { analyzeColors, type ColorAnalysis } from '../../../lib/color-harmony'

interface ColorHarmonyAnalyzerProps {
    colors: string[]
    className?: string
}

const harmonyIcons = {
    monochromatic: <Palette size={20} className="text-blue-600" />,
    analogous: <TrendingUp size={20} className="text-green-600" />,
    complementary: <Eye size={20} className="text-purple-600" />,
    triadic: <Lightbulb size={20} className="text-orange-600" />,
    tetradic: <Palette size={20} className="text-red-600" />,
    'split-complementary': <Eye size={20} className="text-indigo-600" />,
    neutral: <Palette size={20} className="text-gray-600" />,
    mixed: <Palette size={20} className="text-gray-500" />
}

const harmonyColors = {
    monochromatic: 'bg-blue-50 border-blue-200 text-blue-800',
    analogous: 'bg-green-50 border-green-200 text-green-800',
    complementary: 'bg-purple-50 border-purple-200 text-purple-800',
    triadic: 'bg-orange-50 border-orange-200 text-orange-800',
    tetradic: 'bg-red-50 border-red-200 text-red-800',
    'split-complementary': 'bg-indigo-50 border-indigo-200 text-indigo-800',
    neutral: 'bg-gray-50 border-gray-200 text-gray-800',
    mixed: 'bg-gray-50 border-gray-200 text-gray-700'
}

export default function ColorHarmonyAnalyzer({ colors, className = '' }: ColorHarmonyAnalyzerProps) {
    const analysis: ColorAnalysis = analyzeColors(colors)

    if (colors.length === 0) {
        return (
            <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${className}`}>
                <div className="flex items-center gap-2 mb-2">
                    <Palette size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">Análise de Harmonia</span>
                </div>
                <p className="text-sm text-gray-500">
                    Adicione peças de roupa para analisar a harmonia de cores do seu look
                </p>
            </div>
        )
    }

    return (
        <div className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                {harmonyIcons[analysis.harmony.type]}
                <span className="font-medium text-gray-900">Análise de Harmonia</span>
                <div className={`ml-auto px-2 py-1 rounded-full text-xs font-medium border ${harmonyColors[analysis.harmony.type]}`}>
                    {analysis.harmony.confidence > 0 ? `${Math.round(analysis.harmony.confidence * 100)}% confiança` : 'Análise básica'}
                </div>
            </div>

            {/* Harmonia Principal */}
            <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tipo de Harmonia</h3>
                <div className={`p-3 rounded-lg border ${harmonyColors[analysis.harmony.type]}`}>
                    <div className="flex items-start gap-3">
                        {harmonyIcons[analysis.harmony.type]}
                        <div>
                            <p className="font-medium text-sm">
                                {getHarmonyTypeName(analysis.harmony.type)}
                            </p>
                            <p className="text-xs mt-1 opacity-80">
                                {analysis.harmony.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                        {Math.round(analysis.contrast * 10) / 10}
                    </div>
                    <div className="text-xs text-gray-500">Contraste</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                        {Math.round(analysis.saturation * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Saturação</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                        {Math.round(analysis.brightness * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Brilho</div>
                </div>
            </div>

            {/* Sugestões */}
            {analysis.harmony.suggestions.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Sugestões</h3>
                    <ul className="space-y-1">
                        {analysis.harmony.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Paleta de Cores */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Paleta do Look</h3>
                <div className="flex gap-2">
                    {colors.map((color, index) => (
                        <div
                            key={index}
                            className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function getHarmonyTypeName(type: string): string {
    const names = {
        monochromatic: 'Monocromática',
        analogous: 'Análoga',
        complementary: 'Complementar',
        triadic: 'Triádica',
        tetradic: 'Tetrádica',
        'split-complementary': 'Complementar Dividida',
        neutral: 'Neutra',
        mixed: 'Mista'
    }
    return names[type as keyof typeof names] || type
} 