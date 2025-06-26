import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * CSRF middleware to ensure CSRF token is always available
 * and properly handled in all requests
 */
export default class CsrfMiddleware {
    async handle(ctx: HttpContext, next: NextFn) {
        // Ensure CSRF token is available in the request
        if (!ctx.request.csrfToken) {
            ctx.logger.warn('CSRF token not available in request')
        }

        // Add CSRF token to response headers for AJAX requests
        if (ctx.request.header('X-Requested-With') === 'XMLHttpRequest') {
            ctx.response.header('X-CSRF-TOKEN', ctx.request.csrfToken)
        }

        return next()
    }
} 