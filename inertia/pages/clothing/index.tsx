import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Navbar from '../../components/components/ui/navbar'
import ClothingCard from '../../components/components/ui/clothing-card'
import { ClothingSkeletonGrid } from '../../components/components/ui/clothing-skeleton'
import { useCsrf } from '../../hooks/use-csrf'
import { useInfiniteScroll } from '../../hooks/use-infinite-scroll'
import type { Clothing } from '../../types/clothing'

type Props = {
    clothes: Clothing[]
    totalClothes: number
    searchTerm?: string
    hasMore: boolean
    currentPage: number
}

export default function ClothingIndex({ clothes: initialClothes, totalClothes, searchTerm, hasMore: initialHasMore, currentPage }: Props) {
    const [items, setItems] = useState<Clothing[]>(initialClothes)
    const [hasMore, setHasMore] = useState(initialHasMore)
    const [currentPageState, setCurrentPageState] = useState(currentPage)
    const { fetchWithCsrf } = useCsrf()

    async function toggleFavorite(id: number) {
        const res = await fetchWithCsrf(`/clothing/${id}/favorite`, { method: 'POST' })
        if (res.ok) {
            setItems(items => items.map(item =>
                item.id === id ? { ...item, favorite: !item.favorite } : item
            ))
        }
    }

    const loadMoreItems = async () => {
        if (!hasMore) return

        const nextPage = currentPageState + 1
        const searchParams = new URLSearchParams()
        searchParams.append('page', nextPage.toString())
        searchParams.append('limit', '12')
        if (searchTerm) {
            searchParams.append('search', searchTerm)
        }

        try {
            const response = await fetch(`/?${searchParams.toString()}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setItems(prev => [...prev, ...data.clothes])
                setHasMore(data.hasMore)
                setCurrentPageState(data.currentPage)
            }
        } catch (error) {
            console.error('Erro ao carregar mais itens:', error)
        }
    }

    const { observerRef, isLoading } = useInfiniteScroll({
        hasMore,
        onLoadMore: loadMoreItems
    })

    // Reset items when search term changes
    useEffect(() => {
        setItems(initialClothes)
        setHasMore(initialHasMore)
        setCurrentPageState(currentPage)
    }, [initialClothes, initialHasMore, currentPage])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8">
                <Navbar />
                <h1 className="text-2xl font-bold mb-6">Guarda-roupas Virtual</h1>

                {searchTerm && (
                    <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <Search size={16} className="text-blue-600" />
                        <span className="text-blue-800">
                            Resultados para: <strong>"{searchTerm}"</strong>
                        </span>
                        <a
                            href="/"
                            className="ml-auto p-1 hover:bg-blue-100 rounded-full transition-colors"
                            title="Limpar busca"
                        >
                            <X size={16} className="text-blue-600" />
                        </a>
                    </div>
                )}

                <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="text-gray-600 text-sm">
                        {searchTerm ? `${totalClothes} resultado(s)` : `${totalClothes} roupa(s) cadastrada(s)`}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <ClothingCard
                            key={item.id}
                            item={item}
                            onToggleFavorite={toggleFavorite}
                        />
                    ))}
                </div>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="mt-6">
                        <ClothingSkeletonGrid count={6} />
                    </div>
                )}

                {/* Intersection observer target */}
                {hasMore && (
                    <div ref={observerRef} className="h-10 mt-6" />
                )}

                {/* End of results */}
                {!hasMore && items.length > 0 && (
                    <div className="text-center mt-8 text-gray-500">
                        Você chegou ao fim da lista!
                    </div>
                )}

                {/* No results */}
                {items.length === 0 && !isLoading && (
                    <div className="text-center mt-8 text-gray-500">
                        {searchTerm ? 'Nenhum resultado encontrado para sua busca.' : 'Nenhuma roupa cadastrada ainda.'}
                    </div>
                )}
            </div>
        </div>
    )
} 