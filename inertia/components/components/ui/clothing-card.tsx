import React from 'react'
import { Button } from './button'
import { Heart, Share2 } from 'lucide-react'
import type { Clothing } from '../../../types/clothing'

const defaultImage = '/defaults/clothing.png'

type ClothingCardProps = {
    item: Clothing
    onToggleFavorite?: (id: number) => void
    showFavoriteButton?: boolean
    showShareButton?: boolean
    showDetailsButton?: boolean
}

export default function ClothingCard({
    item,
    onToggleFavorite,
    showFavoriteButton = true,
    showShareButton = true,
    showDetailsButton = true
}: ClothingCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center relative group">
            <div className="absolute top-3 right-3 flex gap-2 opacity-80 group-hover:opacity-100 transition">
                {showFavoriteButton && onToggleFavorite && (
                    <button
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => onToggleFavorite(item.id)}
                    >
                        <Heart
                            size={20}
                            fill={item.favorite ? '#2563eb' : 'none'}
                            color={item.favorite ? '#2563eb' : undefined}
                        />
                    </button>
                )}
                {showShareButton && (
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <Share2 size={20} />
                    </button>
                )}
            </div>
            <img
                src={item.image || defaultImage}
                alt={item.name}
                className="w-48 h-64 object-cover rounded-lg mb-4"
            />
            <div className="font-semibold text-lg mb-1 text-center">{item.name}</div>
            <div className="text-gray-500 mb-1 text-center">{item.type}</div>
            <div className="text-gray-400 text-sm mb-2 text-center">{item.color} • {item.size}</div>
            {showDetailsButton && (
                <Button
                    className="w-full mt-2"
                    variant="default"
                    onClick={() => window.location.href = `/clothing/${item.id}`}
                >
                    Ver detalhes
                </Button>
            )}
        </div>
    )
} 