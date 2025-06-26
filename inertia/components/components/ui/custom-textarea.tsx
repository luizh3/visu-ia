import React from 'react'

interface CustomTextareaProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
    required?: boolean
    className?: string
    name?: string
    rows?: number
}

export default function CustomTextarea({
    value,
    onChange,
    placeholder = "",
    label,
    required = false,
    className = "",
    name,
    rows = 4
}: CustomTextareaProps) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value)
    }

    return (
        <div className="relative">
            {label && (
                <label className="block font-medium mb-1 text-sm text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                name={name}
                rows={rows}
                className={`w-full border border-gray-300 rounded-lg p-3 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${className}`}
            />
        </div>
    )
} 