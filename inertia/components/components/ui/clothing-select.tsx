import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import type { Clothing } from '../../../types/clothing'

interface ClothingSelectProps {
    options: Clothing[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
}

export default function ClothingSelect({ options, value, onChange, placeholder = "Selecione...", label }: ClothingSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<Clothing[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedItem = options.find(item => String(item.id) === value)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Busca em tempo real na API
    useEffect(() => {
        const searchClothes = async () => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`)
                if (response.ok) {
                    const data = await response.json()
                    setSearchResults(data)
                }
            } catch (error) {
                console.error('Erro na busca:', error)
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }

        const timeoutId = setTimeout(searchClothes, 300)
        return () => clearTimeout(timeoutId)
    }, [searchTerm])

    // Usa os resultados da busca se houver termo de busca, senão usa as opções originais
    const displayOptions = searchTerm.trim().length >= 2 ? searchResults : options

    const handleSelect = (item: Clothing) => {
        onChange(String(item.id))
        setIsOpen(false)
        setSearchTerm('')
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange('')
        setSearchTerm('')
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block font-medium mb-1 text-sm text-gray-700">
                    {label}
                </label>
            )}

            <div
                className="relative w-full border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedItem ? (
                    <div className="flex items-center p-3 pr-12">
                        <img
                            src={selectedItem.image || '/defaults/clothing.png'}
                            alt={selectedItem.name}
                            className="w-12 h-12 object-cover rounded mr-3 border"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/defaults/clothing.png'
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                                {selectedItem.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {selectedItem.color} • {selectedItem.type}
                            </div>
                        </div>
                        <button
                            onClick={handleClear}
                            className="absolute right-8 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={16} className="text-gray-400" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-3 text-gray-500">
                        <span>{placeholder}</span>
                    </div>
                )}

                <ChevronDown
                    size={20}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                            {isSearching && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {displayOptions.length > 0 ? (
                            displayOptions.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    onClick={() => handleSelect(item)}
                                >
                                    <img
                                        src={item.image || '/defaults/clothing.png'}
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded mr-3 border"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.src = '/defaults/clothing.png'
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 truncate">
                                            {item.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {item.color} • {item.type}
                                        </div>
                                    </div>
                                    {selectedItem?.id === item.id && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                {searchTerm.trim().length >= 2 ? 'Nenhum item encontrado' : 'Digite para buscar...'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
} 