import { useEffect, useState } from 'react'
import Navbar from '../../components/components/ui/navbar'
import { Button } from '../../components/components/ui/button'
import ClothingSelect from '../../components/components/ui/clothing-select'
import ColorHarmonyAnalyzer from '../../components/components/ui/color-harmony-analyzer'
import type { Clothing } from '../../types/clothing'
import { Shirt, User, GripVertical, Footprints, Shuffle } from 'lucide-react'

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

    function handleSelect(partKey: string, clothingId: string) {
        const clothing = options[PARTS.find(p => p.key === partKey)!.type]?.find(c => String(c.id) === clothingId) || null
        setSelected(sel => ({ ...sel, [partKey]: clothing }))
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
                                            <div className="grid grid-cols-1 gap-4 w-full">
                                                {PARTS.map(part => (
                                                    <div key={part.key} className="flex flex-col items-center">
                                                        <span className="text-gray-500 text-sm mb-1">{part.label}</span>
                                                        {selected[part.key]?.image ? (
                                                            <img
                                                                src={selected[part.key]!.image}
                                                                alt={selected[part.key]!.name}
                                                                className="h-32 object-contain mb-2"
                                                                style={{ maxWidth: 120 }}
                                                            />
                                                        ) : (
                                                            <div className="h-32 w-24 flex flex-col items-center justify-center bg-gray-200 rounded text-center">
                                                                <span className="mb-2">{part.icon}</span>
                                                                <span className="text-xs text-gray-500 mt-2">{part.label}</span>
                                                            </div>
                                                        )}
                                                        <span className="text-xs text-gray-600">{selected[part.key]?.name || 'Nenhuma selecionada'}</span>
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
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 