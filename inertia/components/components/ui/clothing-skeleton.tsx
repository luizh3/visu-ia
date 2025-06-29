import React from 'react'

export default function ClothingSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded mb-3 w-1/2 animate-pulse"></div>
                <div className="flex justify-between items-center">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export function ClothingSkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <ClothingSkeleton key={`skeleton-${index}`} />
            ))}
        </div>
    )
} 