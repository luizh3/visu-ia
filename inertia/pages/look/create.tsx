import { useEffect, useState } from 'react'
import Navbar from '../../components/components/ui/navbar'
import ColorHarmonyAnalyzer from '../../components/components/ui/color-harmony-analyzer'
import type { Clothing } from '../../types/clothing'
import { Shirt, User, GripVertical, Footprints, Shuffle } from 'lucide-react'
import ClothingSelect from '~/components/components/ui/clothing-select'
import apiConfig from '../../../config/api'

const PARTS = [
    { key: 'head', label: 'Cabeça', type: 'chapéu', icon: <User size={40} strokeWidth={1.5} /> },
    { key: 'torso', label: 'Tronco', type: 'camiseta', icon: <Shirt size={40} strokeWidth={1.5} /> },
    { key: 'legs', label: 'Pernas', type: 'calça', icon: <GripVertical size={40} strokeWidth={1.5} /> },
    { key: 'feet', label: 'Pés', type: 'tênis', icon: <Footprints size={40} strokeWidth={1.5} /> },
]

export default function LookCreate() {
    const [options, setOptions] = useState<Record<string, Clothing[]>>({})
    const [selected, setSelected] = useState<Record<string, Clothing | null>>({})
    const [loading, setLoading] = useState(true)
    const [suggestions, setSuggestions] = useState<any | null>(null)
    const [suggestionsLoading, setSuggestionsLoading] = useState(false)
    const [lastSuggestedPart, setLastSuggestedPart] = useState<string | null>(null)

    useEffect(() => {
        fetch('/look/options')
            .then(res => res.json())
            .then(data => {
                setOptions(data)
                // Inicializa seleção como null
                const initial: Record<string, Clothing | null> = {}
                PARTS.forEach(part => { initial[part.key] = null })
                setSelected(initial)
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        // Limpa sugestões se nenhuma peça estiver selecionada
        const hasAnySelected = Object.values(selected).some(item => item !== null)
        if (!hasAnySelected) {
            setSuggestions(null)
            return
        }
        // Busca sugestões para a primeira peça selecionada
        const firstSelectedPart = PARTS.find(part => selected[part.key])
        if (firstSelectedPart && selected[firstSelectedPart.key]) {
            fetchSuggestionsForPart(firstSelectedPart.key, selected[firstSelectedPart.key])
        } else {
            setSuggestions(null)
        }
    }, [selected])

    async function fetchSuggestionsForPart(partKey: string, clothing: Clothing | null) {
        if (!clothing) return
        setSuggestionsLoading(true)
        setLastSuggestedPart(partKey)
        try {
            const payload = {
                selected_items: [
                    {
                        prompt: clothing.type, // ou clothing.prompt se existir
                        body_region: partKey,
                        name: clothing.name,
                        probability: 0.95, // valor fixo, pois não temos probabilidade real
                        color: clothing.color,
                    },
                ],
                top_k: 3,
            }
            const res = await fetch(`${apiConfig.outfitAnalysis.baseUrl}/api/v1/clothing/outfit-suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('Erro ao buscar sugestões')
            const data = await res.json()
            setSuggestions(data)
        } catch (err) {
            setSuggestions(null)
        } finally {
            setSuggestionsLoading(false)
        }
    }

    function handleSelect(partKey: string, clothingId: string) {
        const clothing = options[PARTS.find(p => p.key === partKey)!.type]?.find(c => String(c.id) === clothingId) || null
        setSelected(sel => ({ ...sel, [partKey]: clothing }))
        console.log("aaaaa")
        if (clothing) {
            fetchSuggestionsForPart(partKey, clothing)
        }
    }

    function handleRandomLook() {
        const newSelected: Record<string, Clothing | null> = {}
        PARTS.forEach(part => {
            const items = options[part.type] || []
            if (items.length > 0) {
                const randomIdx = Math.floor(Math.random() * items.length)
                newSelected[part.key] = items[randomIdx]
            } else {
                newSelected[part.key] = null
            }
        })
        setSelected(newSelected)
        // Não buscar sugestões aqui
    }

    function handleClear() {
        const cleared: Record<string, Clothing | null> = {}
        PARTS.forEach(part => { cleared[part.key] = null })
        setSelected(cleared)
    }

    // Extrai as cores das peças selecionadas para análise de harmonia
    const selectedColors = Object.values(selected)
        .filter(item => item && item.color)
        .map(item => item!.color)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8">
                <Navbar />
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Montar Look</h1>
                {loading ? (
                    <div>Carregando opções...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Escolha uma peça para cada parte do corpo</h2>
                            <form className="space-y-6">
                                {PARTS.map(part => (
                                    <div key={part.key}>
                                        <ClothingSelect
                                            options={options[part.type] || []}
                                            value={selected[part.key]?.id?.toString() || ''}
                                            onChange={(value) => handleSelect(part.key, value)}
                                            label={part.label}
                                            placeholder={`Selecione um ${part.type}...`}
                                        />
                                    </div>
                                ))}
                            </form>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                                    onClick={handleRandomLook}
                                >
                                    <Shuffle size={18} /> Look Aleatório
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                                    onClick={handleClear}
                                >
                                    Limpar seleção
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Preview do Look */}
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Preview do Look</h2>
                                    <div className="bg-gray-100 rounded-lg shadow p-6 min-h-[400px] w-full relative flex items-center justify-center">
                                        <div className="mx-auto flex flex-col justify-center items-center w-full max-w-md">
                                            <div className="grid grid-cols-1 gap-6 w-full">
                                                {PARTS.map(part => (
                                                    <div key={part.key} className="flex flex-col items-center">
                                                        <h3 className="text-lg font-bold text-gray-800 mb-3">{part.label}</h3>
                                                        {selected[part.key]?.image ? (
                                                            <img
                                                                src={selected[part.key]!.image}
                                                                alt={selected[part.key]!.name}
                                                                className="h-32 object-contain mb-3"
                                                                style={{ maxWidth: 120 }}
                                                            />
                                                        ) : (
                                                            <div className="h-32 w-24 flex flex-col items-center justify-center bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 text-center">
                                                                <span className="mb-2 text-gray-400">{part.icon}</span>
                                                                <span className="text-xs text-gray-500 font-medium">Vazio</span>
                                                            </div>
                                                        )}
                                                        <span className="text-sm text-gray-600 font-medium">{selected[part.key]?.name || 'Nenhuma selecionada'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Análise de Harmonia */}
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Análise de Harmonia</h2>
                                    <ColorHarmonyAnalyzer colors={selectedColors} />

                                    {/* Sugestões de Outfit */}
                                    <div className="mt-8">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sugestões de Peças para o Look</h2>
                                        {suggestionsLoading && (
                                            <div className="text-gray-500">Buscando sugestões...</div>
                                        )}
                                        {!suggestionsLoading && suggestions && (
                                            <div className="space-y-4">
                                                {suggestions.suggestions && suggestions.suggestions.suggestions && Object.entries(suggestions.suggestions.suggestions).map(([region, items]) => {
                                                    const itemsArray = Array.isArray(items) ? items as any[] : [];
                                                    return (
                                                        <div key={region} className="bg-white rounded-lg shadow p-4">
                                                            <h3 className="text-lg font-bold text-gray-700 mb-2">{region === 'legs' ? 'Pernas' : region === 'feet' ? 'Pés' : region}</h3>
                                                            <ul className="space-y-2">
                                                                {itemsArray.map((item, idx) => (
                                                                    <li key={idx} className="flex flex-col gap-1">
                                                                        <span className="font-medium text-gray-800">{item.name} <span className="text-xs text-gray-500">({item.prompt})</span></span>
                                                                        <span className="text-sm text-gray-600 flex items-center gap-1">Cores compatíveis:
                                                                            {(item.compatible_colors ?? []).map((c: any, i: number) => (
                                                                                <span
                                                                                    key={i}
                                                                                    title={c.color}
                                                                                    style={{ backgroundColor: c.color, display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '1px solid #ccc', marginRight: 4 }}
                                                                                />
                                                                            ))}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {!suggestionsLoading && !suggestions && lastSuggestedPart && (
                                            <div className="text-gray-500">Nenhuma sugestão encontrada.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 