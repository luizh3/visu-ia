import React from 'react'
import CustomSelect from './custom-select'

interface SizeOption {
    value: string
    label: string
}

interface SizeSelectProps {
    value: string
    onChange: (value: string) => void
    clothingType: string
    placeholder?: string
    label?: string
}

const SIZE_OPTIONS: Record<string, SizeOption[]> = {
    // Chapéus e acessórios de cabeça
    'chapéu': [
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'boné': [
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],

    // Roupas superiores
    'camiseta': [
        { value: 'PP', label: 'PP - Extra Pequeno' },
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'XG', label: 'XG - Extra Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'blusa': [
        { value: 'PP', label: 'PP - Extra Pequeno' },
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'XG', label: 'XG - Extra Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'suéter': [
        { value: 'PP', label: 'PP - Extra Pequeno' },
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'XG', label: 'XG - Extra Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'moletom': [
        { value: 'PP', label: 'PP - Extra Pequeno' },
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'XG', label: 'XG - Extra Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'jaqueta': [
        { value: 'PP', label: 'PP - Extra Pequeno' },
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'XG', label: 'XG - Extra Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'casaco': [
        { value: 'PP', label: 'PP - Extra Pequeno' },
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'XG', label: 'XG - Extra Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'terno': [
        { value: 'PP', label: 'PP - Extra Pequeno' },
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'XG', label: 'XG - Extra Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'maiô': [
        { value: 'PP', label: 'PP - Extra Pequeno' },
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'XG', label: 'XG - Extra Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'roupa íntima': [
        { value: 'PP', label: 'PP - Extra Pequeno' },
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'XG', label: 'XG - Extra Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],

    // Roupas inferiores
    'calça': [
        { value: '28', label: '28' },
        { value: '30', label: '30' },
        { value: '32', label: '32' },
        { value: '34', label: '34' },
        { value: '36', label: '36' },
        { value: '38', label: '38' },
        { value: '40', label: '40' },
        { value: '42', label: '42' },
        { value: '44', label: '44' },
        { value: '46', label: '46' },
        { value: '48', label: '48' },
        { value: '50', label: '50' },
        { value: '52', label: '52' },
        { value: '54', label: '54' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'shorts': [
        { value: '28', label: '28' },
        { value: '30', label: '30' },
        { value: '32', label: '32' },
        { value: '34', label: '34' },
        { value: '36', label: '36' },
        { value: '38', label: '38' },
        { value: '40', label: '40' },
        { value: '42', label: '42' },
        { value: '44', label: '44' },
        { value: '46', label: '46' },
        { value: '48', label: '48' },
        { value: '50', label: '50' },
        { value: '52', label: '52' },
        { value: '54', label: '54' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'saia': [
        { value: '28', label: '28' },
        { value: '30', label: '30' },
        { value: '32', label: '32' },
        { value: '34', label: '34' },
        { value: '36', label: '36' },
        { value: '38', label: '38' },
        { value: '40', label: '40' },
        { value: '42', label: '42' },
        { value: '44', label: '44' },
        { value: '46', label: '46' },
        { value: '48', label: '48' },
        { value: '50', label: '50' },
        { value: '52', label: '52' },
        { value: '54', label: '54' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'meias': [
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],

    // Calçados
    'sapatos': [
        { value: '33', label: '33' },
        { value: '34', label: '34' },
        { value: '35', label: '35' },
        { value: '36', label: '36' },
        { value: '37', label: '37' },
        { value: '38', label: '38' },
        { value: '39', label: '39' },
        { value: '40', label: '40' },
        { value: '41', label: '41' },
        { value: '42', label: '42' },
        { value: '43', label: '43' },
        { value: '44', label: '44' },
        { value: '45', label: '45' },
        { value: '46', label: '46' },
        { value: '47', label: '47' },
        { value: '48', label: '48' },
    ],
    'botas': [
        { value: '33', label: '33' },
        { value: '34', label: '34' },
        { value: '35', label: '35' },
        { value: '36', label: '36' },
        { value: '37', label: '37' },
        { value: '38', label: '38' },
        { value: '39', label: '39' },
        { value: '40', label: '40' },
        { value: '41', label: '41' },
        { value: '42', label: '42' },
        { value: '43', label: '43' },
        { value: '44', label: '44' },
        { value: '45', label: '45' },
        { value: '46', label: '46' },
        { value: '47', label: '47' },
        { value: '48', label: '48' },
    ],
    'sandálias': [
        { value: '33', label: '33' },
        { value: '34', label: '34' },
        { value: '35', label: '35' },
        { value: '36', label: '36' },
        { value: '37', label: '37' },
        { value: '38', label: '38' },
        { value: '39', label: '39' },
        { value: '40', label: '40' },
        { value: '41', label: '41' },
        { value: '42', label: '42' },
        { value: '43', label: '43' },
        { value: '44', label: '44' },
        { value: '45', label: '45' },
        { value: '46', label: '46' },
        { value: '47', label: '47' },
        { value: '48', label: '48' },
    ],

    // Acessórios
    'cachecol': [
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'luvas': [
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'cinto': [
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'bolsa': [
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
    'mochila': [
        { value: 'P', label: 'P - Pequeno' },
        { value: 'M', label: 'M - Médio' },
        { value: 'G', label: 'G - Grande' },
        { value: 'GG', label: 'GG - Extra Grande' },
        { value: 'ÚNICO', label: 'ÚNICO - Tamanho Único' },
    ],
}

export default function SizeSelect({ value, onChange, clothingType, placeholder = "Selecione o tamanho...", label }: SizeSelectProps) {
    const options = SIZE_OPTIONS[clothingType] || []
    const isDisabled = !clothingType

    return (
        <CustomSelect
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            label={label}
            disabled={isDisabled}
            disabledMessage="Selecione um tipo de roupa primeiro"
        />
    )
} 