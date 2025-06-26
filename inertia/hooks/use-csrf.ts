import { usePage } from '@inertiajs/react'

export function useCsrf() {
    const { props } = usePage()
    const csrfToken = (props as any).csrfToken

    const fetchWithCsrf = async (url: string, options: RequestInit = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
        }

        return fetch(url, {
            ...options,
            headers,
            credentials: 'same-origin',
        })
    }

    return {
        csrfToken,
        fetchWithCsrf,
    }
} 