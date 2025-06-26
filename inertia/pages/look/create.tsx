import { useEffect, useState } from 'react'
import Navbar from '../../components/components/ui/navbar'
import { Button } from '../../components/components/ui/button'
import ClothingSelect from '../../components/components/ui/clothing-select'
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

    function getColorPercentages(selected: Record<string, Clothing | null>) {
        const colorCount: Record<string, number> = {}
        let total = 0
        Object.values(selected).forEach(item => {
            if (item && item.color) {
                const color = item.color.toUpperCase()
                colorCount[color] = (colorCount[color] || 0) + 1
                total++
            }
        })
        return Object.entries(colorCount).map(([color, count]) => ({
            color,
            percent: total > 0 ? Math.round((count / total) * 100) : 0
        }))
    }

    function getContrastYIQ(hexcolor: string) {
        hexcolor = hexcolor.replace('#', '')
        if (hexcolor.length !== 6) return '#000'
        const r = parseInt(hexcolor.substr(0, 2), 16)
        const g = parseInt(hexcolor.substr(2, 2), 16)
        const b = parseInt(hexcolor.substr(4, 2), 16)
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
        return (yiq >= 128) ? '#000' : '#fff'
    }

    const colorPercentages = getColorPercentages(selected)

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8">
                <Navbar />
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Montar Look</h1>
                {loading ? (
                    <div>Carregando opções...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
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
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Preview do Look</h2>
                            <div className="bg-gray-100 rounded-lg shadow p-6 min-h-[400px] w-full relative flex items-center justify-center">
                                {colorPercentages.length > 0 && (
                                    <div className="absolute left-6 top-6 flex flex-col items-start">
                                        {colorPercentages.map(c => (
                                            <div key={c.color} className="flex items-center mb-2">
                                                <div
                                                    className="w-10 h-10 rounded-full border shadow flex items-center justify-center text-sm font-bold mr-2"
                                                    style={{ background: c.color, color: getContrastYIQ(c.color) }}
                                                    title={c.color}
                                                >
                                                    {c.percent}%
                                                </div>
                                                <span className="text-xs">{c.color}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                    </div>
                )}
            </div>
        </div>
    )
} 