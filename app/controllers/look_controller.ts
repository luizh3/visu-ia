import type { HttpContext } from '@adonisjs/core/http'
import Clothing from '#models/clothing'

export default class LookController {
    /**
     * Roupas agrupadas por tipo para montar look
     */
    async groupedByType({ response }: HttpContext) {
        const clothes = await Clothing.all()
        const grouped: Record<string, any[]> = {}
        for (const item of clothes) {
            if (!grouped[item.type]) grouped[item.type] = []
            grouped[item.type].push(item)
        }
        return response.ok(grouped)
    }

    /**
     * Página de montar look
     */
    async create({ inertia }: HttpContext) {
        return inertia.render('look/create')
    }
} 