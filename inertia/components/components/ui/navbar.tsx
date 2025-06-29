import React, { useState, useEffect, useRef } from 'react'
import { Button } from './button'
import { Home, Shirt, Heart, Search, Plus, Palette, Camera, Menu, X } from 'lucide-react'
import type { Clothing } from '../../../types/clothing'

export default function Navbar() {
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState<Clothing[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    const menuItems = [
        { href: '/', icon: Shirt, label: 'Roupas', color: 'blue' },
        { href: '/clothing/create', icon: Plus, label: 'Adicionar', color: 'green' },
        { href: '/outfit-analysis/create', icon: Camera, label: 'Analisar', color: 'orange' },
        { href: '/clothing/favorites', icon: Heart, label: 'Favoritos', color: 'pink' },
        { href: '/look/create', icon: Palette, label: 'Looks', color: 'purple' }
    ]

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
            green: 'bg-green-50 text-green-700 hover:bg-green-100',
            orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
            pink: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
            purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
        }
        return colors[color as keyof typeof colors] || colors.blue
    }

    // Busca
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

    // Fechar menus ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false)
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setShowMenu(false)
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchTerm.trim()) {
            window.location.href = `/?search=${encodeURIComponent(searchTerm.trim())}`
        }
    }

    const handleItemClick = (item: Clothing) => {
        window.location.href = `/clothing/${item.id}`
    }

    const toggleMenu = () => {
        setShowMenu(!showMenu)
    }

    const closeMenu = () => {
        setShowMenu(false)
    }

    return (
        <nav className="w-full max-w-6xl mx-auto bg-white shadow flex items-center px-8 py-6 mb-8 rounded relative" style={{ borderRadius: 4 }}>
            {/* Menu Desktop */}
            <div className="hidden md:flex gap-3 items-center flex-1">
                {menuItems.map((item) => (
                    <a
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 ${getColorClasses(item.color)} font-semibold rounded transition-colors whitespace-nowrap text-sm`}
                    >
                        <item.icon size={18} /> {item.label}
                    </a>
                ))}
            </div>

            {/* Menu Mobile */}
            <div className="md:hidden flex-1 relative" ref={menuRef}>
                <button
                    onClick={toggleMenu}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded transition-colors w-full whitespace-nowrap text-sm"
                >
                    {showMenu ? <X size={18} /> : <Menu size={18} />}
                    Menu
                </button>
            </div>

            {/* Dropdown Mobile - Posicionado fora do container */}
            {showMenu && (
                <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-200 ease-in-out max-w-6xl mx-auto">
                    <div className="p-3 space-y-2">
                        {menuItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 ${getColorClasses(item.color)} font-semibold rounded transition-all duration-150 w-full hover:scale-105 transform`}
                                onClick={closeMenu}
                            >
                                <item.icon size={20} /> {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSearch} className="flex items-center ml-6">
                <div className="relative" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => searchTerm.trim().length >= 2 && searchResults.length > 0 && setShowDropdown(true)}
                        className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40 md:w-56 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search size={16} className="text-gray-400" />
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
                    className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                    <span className="hidden md:inline">Buscar</span>
                    <Search size={16} className="md:hidden" />
                </button>
            </form>
        </nav>
    )
} 