import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Palette, TrendingUp, Lightbulb, Target, BarChart3, Sparkles } from 'lucide-react'

interface OverallRating {
    level: string
    emoji: string
    description: string
    coordinationScore: number
    dominantStyle: string
    styleConfidence: number
}

interface StyleAnalysis {
    dominantStyle: string
    styleConfidence: number
    allStyleScores: {
        formal: number
        casual: number
        elegant: number
        trendy: number
        classic: number
        modern: number
    }
}

interface CoordinationAnalysis {
    coordinationScore: number
    allCoordinationScores: {
        well_coordinated: number
        color_coordinated: number
        matching: number
        harmonious: number
        balanced: number
        cohesive: number
    }
}

interface DetailedScores {
    "well coordinated outfit": number
    "stylish outfit": number
    "fashionable outfit": number
    "elegant outfit": number
    "casual outfit": number
    "formal outfit": number
    "professional outfit": number
    "trendy outfit": number
    "classic outfit": number
    "modern outfit": number
    "color coordinated outfit": number
    "matching outfit": number
    "harmonious outfit": number
    "balanced outfit": number
    "cohesive outfit": number
}

interface FullImageAnalysis {
    overallRating: OverallRating
    styleAnalysis: StyleAnalysis
    coordinationAnalysis: CoordinationAnalysis
    detailedScores: DetailedScores
    insights: string[]
}

interface StyleAnalysisCardProps {
    fullImageAnalysis: FullImageAnalysis
}

const getRatingColor = (level: string) => {
    switch (level.toLowerCase()) {
        case 'excelente':
        case 'alto':
            return 'text-green-600 bg-green-50 border-green-200'
        case 'bom':
        case 'médio':
            return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'baixo':
        case 'regular':
            return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'ruim':
            return 'text-red-600 bg-red-50 border-red-200'
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-blue-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
}

const getStyleColor = (style: string) => {
    switch (style.toLowerCase()) {
        case 'formal':
            return 'text-purple-600 bg-purple-50 border-purple-200'
        case 'casual':
            return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'elegant':
            return 'text-pink-600 bg-pink-50 border-pink-200'
        case 'trendy':
            return 'text-orange-600 bg-orange-50 border-orange-200'
        case 'classic':
            return 'text-gray-600 bg-gray-50 border-gray-200'
        case 'modern':
            return 'text-indigo-600 bg-indigo-50 border-indigo-200'
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

export default function StyleAnalysisCard({ fullImageAnalysis }: StyleAnalysisCardProps) {
    const { overallRating, styleAnalysis, coordinationAnalysis, detailedScores, insights } = fullImageAnalysis

    // Ordenar estilos por score
    const sortedStyles = Object.entries(styleAnalysis.allStyleScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3) // Top 3 estilos

    // Ordenar scores de coordenação
    const sortedCoordination = Object.entries(coordinationAnalysis.allCoordinationScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3) // Top 3 coordenações

    return (
        <div className="space-y-6">
            {/* Avaliação Geral */}
            <Card className={`border-2 ${getRatingColor(overallRating.level).split(' ')[2]} bg-gradient-to-r from-gray-50 to-gray-100`}>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">{overallRating.emoji}</div>
                        <div>
                            <CardTitle className={`text-xl ${getRatingColor(overallRating.level).split(' ')[0]}`}>
                                {overallRating.level}
                            </CardTitle>
                            <CardDescription className="text-gray-700">
                                {overallRating.description}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Coordenação:</span>
                            <div className={`text-lg font-bold ${getScoreColor(overallRating.coordinationScore)}`}>
                                {Math.round(overallRating.coordinationScore * 100)}%
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">Estilo:</span>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStyleColor(overallRating.dominantStyle)}`}>
                                {overallRating.dominantStyle}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Análise de Estilo */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-purple-600" />
                        Análise de Estilo
                    </CardTitle>
                    <CardDescription>
                        Estilo dominante e distribuição de estilos detectados
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStyleColor(styleAnalysis.dominantStyle)}`}>
                                {styleAnalysis.dominantStyle}
                            </div>
                            <span className="text-sm text-gray-600">Estilo Dominante</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {Math.round(styleAnalysis.styleConfidence * 100)}% confiança
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Top 3 Estilos:</h4>
                        {sortedStyles.map(([style, score]) => (
                            <div key={style} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium capitalize">{style}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${score * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">{Math.round(score * 100)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Análise de Coordenação */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Análise de Coordenação
                    </CardTitle>
                    <CardDescription>
                        Como as peças se coordenam entre si
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Score Geral de Coordenação:</span>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(coordinationAnalysis.coordinationScore)}`}>
                            {Math.round(coordinationAnalysis.coordinationScore * 100)}%
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Top 3 Coordenações:</h4>
                        {sortedCoordination.map(([coordination, score]) => (
                            <div key={coordination} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm font-medium capitalize">
                                    {coordination.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${score * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">{Math.round(score * 100)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Insights */}
            {/* {insights && insights.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-600" />
                            Insights da Análise
                        </CardTitle>
                        <CardDescription>
                            Observações importantes sobre seu outfit
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {insights.map((insight, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-gray-700">{insight}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )} */}
        </div>
    )
} 