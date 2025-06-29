import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Star, TrendingUp, Lightbulb, CheckCircle } from 'lucide-react'

interface OutfitRating {
    level: string
    emoji: string
    description: string
}

interface PairwiseCompatibility {
    part1: {
        region: string
        name: string
        prompt: string
    }
    part2: {
        region: string
        name: string
        prompt: string
    }
    similarity: number
    compatibilityLevel: string
}

interface OutfitCompatibility {
    compatibilityScore: number
    outfitRating: OutfitRating
    detectedParts: {
        torso: any
        legs: any
        feet: any
    }
    pairwiseCompatibility: {
        torsoVsLegs: PairwiseCompatibility
        torsoVsFeet: PairwiseCompatibility
        legsVsFeet: PairwiseCompatibility
    }
    suggestions: string[]
    insights?: string[]
    totalComparisons: number
}

interface OutfitRatingCardProps {
    outfitCompatibility: OutfitCompatibility
}

const getCompatibilityColor = (level: string) => {
    switch (level.toLowerCase()) {
        case 'excelente':
            return 'text-green-600 bg-green-50 border-green-200'
        case 'boa':
            return 'text-blue-600 bg-blue-50 border-blue-200'
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

export default function OutfitRatingCard({ outfitCompatibility }: OutfitRatingCardProps) {
    const { compatibilityScore, outfitRating, pairwiseCompatibility, suggestions, insights } = outfitCompatibility

    return (
        <div className="space-y-6">
            {/* Compatibilidade entre Peças */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        Compatibilidade entre Peças
                    </CardTitle>
                    <CardDescription>
                        Análise detalhada de como cada peça combina com as outras
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(pairwiseCompatibility).map(([key, compatibility]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="text-sm">
                                    <span className="font-medium">{compatibility.part1.name}</span>
                                    <span className="text-gray-500"> + </span>
                                    <span className="font-medium">{compatibility.part2.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-600">
                                    {Math.round(compatibility.similarity * 100)}% similaridade
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCompatibilityColor(compatibility.compatibilityLevel)}`}>
                                    {compatibility.compatibilityLevel}
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Insights e Sugestões */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        Análise e Sugestões
                    </CardTitle>
                    <CardDescription>
                        Insights da análise e dicas para aprimorar seu outfit
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Insights */}
                    {insights && insights.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                Insights da Análise
                            </h4>
                            <ul className="space-y-2">
                                {insights.map((insight, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-gray-700">{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Separador visual */}
                    {(insights && insights.length > 0) && (suggestions && suggestions.length > 0) && (
                        <div className="border-t border-gray-200 pt-4" />
                    )}

                    {/* Sugestões */}
                    {suggestions && suggestions.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Star className="h-4 w-4 text-blue-500" />
                                Sugestões para Melhorar
                            </h4>
                            <ul className="space-y-2">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-gray-700">{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 