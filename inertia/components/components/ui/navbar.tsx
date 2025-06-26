import React, { useState, useEffect, useRef } from 'react'
import { Button } from './button'
import { Home, Shirt, Heart, Search, Plus, Palette } from 'lucide-react'
import type { Clothing } from '../../../types/clothing'

export default function Navbar() {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<Clothing[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const searchClothes = async () => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([])
                setShowDropdown(false)
                return
            }

            setIsSearching(true)
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`)
                if (response.ok) {
                    const data = await response.json()
                    setSearchResults(data)
                    setShowDropdown(data.length > 0)
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchTerm.trim()) {
            window.location.href = `/?search=${encodeURIComponent(searchTerm.trim())}`
        }
    }

    const handleItemClick = (item: Clothing) => {
        window.location.href = `/clothing/${item.id}`
    }

    return (
        <nav className="w-full max-w-6xl mx-auto bg-white shadow flex items-center px-6 py-4 mb-8 rounded" style={{ borderRadius: 4 }}>
            <div className="flex gap-3 items-center flex-1">
                <a href="/" className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded transition-colors">
                    <Shirt size={20} /> Guarda-roupas
                </a>
                <a href="/clothing/create" className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-semibold rounded transition-colors">
                    <Plus size={20} /> Cadastrar Roupa
                </a>
                <a href="/clothing/favorites" className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-700 hover:bg-pink-100 font-semibold rounded transition-colors">
                    <Heart size={20} /> Favoritos
                </a>
                <a href="/look/create" className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded transition-colors">
                    <Palette size={20} /> Montar Look
                </a>
            </div>

            <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Buscar roupas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => searchTerm.trim().length >= 2 && searchResults.length > 0 && setShowDropdown(true)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search size={18} className="text-gray-400" />
                    </div>

                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                            <div className="max-h-64 overflow-y-auto">
                                {searchResults.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        onClick={() => handleItemClick(item)}
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Buscar
                </button>
            </form>
        </nav>
    )
} 