/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const ClothingController = () => import('#controllers/clothing_controller')
const LookController = () => import('#controllers/look_controller')
const OutfitAnalysisController = () => import('#controllers/outfit_analysis_controller')

router.group(() => {

    router.get('/', [ClothingController, 'index'])
    router.get('/clothing/create', [ClothingController, 'create'])
    router.post('/clothing', [ClothingController, 'store'])
    router.get('/clothing/favorites', [ClothingController, 'favorites'])
    router.get('/clothing/:id', [ClothingController, 'show'])
    router.post('/clothing/:id/favorite', [ClothingController, 'toggleFavorite'])
    router.delete('/clothing/:id', [ClothingController, 'destroy'])

    // API routes
    router.get('/api/search', [ClothingController, 'search'])
    router.get('/api/clothing', [ClothingController, 'paginate'])

    // Look routes
    router.get('/look/create', [LookController, 'create'])
    router.get('/look/options', [LookController, 'groupedByType'])

    // Outfit Analysis routes
    router.get('/outfit-analysis/create', [OutfitAnalysisController, 'create'])
    router.post('/outfit-analysis', [OutfitAnalysisController, 'store'])
    router.get('/outfit-analysis/:sessionId', [OutfitAnalysisController, 'show'])
    router.post('/outfit-analysis/save-clothing', [OutfitAnalysisController, 'saveClothing'])

})

