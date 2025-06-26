import { useState } from 'react'
import Navbar from '../../components/components/ui/navbar'
import ClothingCard from '../../components/components/ui/clothing-card'
import { useCsrf } from '../../hooks/use-csrf'
import type { Clothing } from '../../types/clothing'

type Props = {
    clothes: Clothing[]
}

export default function Favorites({ clothes }: Props) {
    const [items, setItems] = useState<Clothing[]>(clothes)
    const { fetchWithCsrf } = useCsrf()

    async function toggleFavorite(id: number) {
        const res = await fetchWithCsrf(`/clothing/${id}/favorite`, { method: 'POST' })
        if (res.ok) {
            // Remove o item da lista de favoritos quando desfavoritado
            setItems(items => items.filter(item => item.id !== id))
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8">
                <Navbar />
                <h1 className="text-2xl font-bold mb-6">Favoritos</h1>
                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Nenhum item favoritado ainda.</p>
                        <p className="text-gray-400 mt-2">Adicione itens aos favoritos para vê-los aqui.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <ClothingCard
                                key={item.id}
                                item={item}
                                onToggleFavorite={toggleFavorite}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 