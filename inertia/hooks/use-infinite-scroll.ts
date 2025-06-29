import { useEffect, useRef, useState, useCallback } from 'react'

interface UseInfiniteScrollOptions {
    hasMore: boolean
    onLoadMore: () => Promise<void>
    threshold?: number
    rootMargin?: string
    debounceMs?: number
}

export function useInfiniteScroll({
    hasMore,
    onLoadMore,
    threshold = 0.1,
    rootMargin = '100px',
    debounceMs = 300
}: UseInfiniteScrollOptions) {
    const [isLoading, setIsLoading] = useState(false)
    const observerRef = useRef<HTMLDivElement>(null)
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return

        setIsLoading(true)
        try {
            await onLoadMore()
        } catch (error) {
            console.error('Erro ao carregar mais itens:', error)
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, hasMore, onLoadMore])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0]
                if (target.isIntersecting && hasMore && !isLoading) {
                    // Clear any existing timeout
                    if (debounceTimeoutRef.current) {
                        clearTimeout(debounceTimeoutRef.current)
                    }

                    // Debounce the load more call
                    debounceTimeoutRef.current = setTimeout(() => {
                        loadMore()
                    }, debounceMs)
                }
            },
            {
                threshold,
                rootMargin
            }
        )

        const currentRef = observerRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [hasMore, isLoading, loadMore, threshold, rootMargin, debounceMs])

    return {
        observerRef,
        isLoading
    }
} 