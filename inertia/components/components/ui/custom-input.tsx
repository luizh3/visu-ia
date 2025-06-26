import React from 'react'

interface CustomInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
    type?: string
    required?: boolean
    className?: string
    name?: string
    maxLength?: number
    pattern?: string
    autoComplete?: string
}

export default function CustomInput({
    value,
    onChange,
    placeholder = "",
    label,
    type = "text",
    required = false,
    className = "",
    name,
    maxLength,
    pattern,
    autoComplete
}: CustomInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            <input
                type={type}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                name={name}
                maxLength={maxLength}
                pattern={pattern}
                autoComplete={autoComplete}
                className={`w-full border border-gray-300 rounded-lg p-3 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
            />
        </div>
    )
} 