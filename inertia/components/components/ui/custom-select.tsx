import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
    value: string
    label: string
}

interface CustomSelectProps {
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    placeholder?: string
    label?: string
    disabled?: boolean
    disabledMessage?: string
}

export default function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Selecione...",
    label,
    disabled = false,
    disabledMessage = "Selecione uma opção primeiro"
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(option => option.value === value)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredOptions = options.filter(option => {
        const searchLower = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const labelLower = option.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const valueLower = option.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        return labelLower.includes(searchLower) || valueLower.includes(searchLower)
    })

    const handleSelect = (option: SelectOption) => {
        onChange(option.value)
        setIsOpen(false)
        setSearchTerm('')
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange('')
        setSearchTerm('')
    }

    if (disabled) {
        return (
            <div className="relative">
                {label && (
                    <label className="block font-medium mb-1 text-sm text-gray-700">
                        {label}
                    </label>
                )}
                <div className="w-full border border-gray-300 rounded-lg bg-gray-100 p-3 text-gray-500">
                    {disabledMessage}
                </div>
            </div>
        )
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
                {selectedOption ? (
                    <div className="flex items-center justify-between p-3">
                        <span className="font-medium text-gray-900">
                            {selectedOption.label}
                        </span>
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <span className="text-gray-400 text-sm">×</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-3 text-gray-500">
                        <span>{placeholder}</span>
                    </div>
                )}

                <ChevronDown
                    size={20}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    onClick={() => handleSelect(option)}
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">
                                            {option.label}
                                        </div>
                                    </div>
                                    {selectedOption?.value === option.value && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Nenhuma opção encontrada
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
} 