export default {
    outfitAnalysis: {
        baseUrl: 'http://localhost:8000',
        analysisEndpoint: '/api/v1/analysis/complete',
        sessionEndpoint: '/api/v1/analysis/session',
        timeout: 30000, // 30 segundos
        retries: 3,
    }
} 