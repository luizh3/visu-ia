/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const ClothingController = () => import('#controllers/clothing_controller')
const LookController = () => import('#controllers/look_controller')

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

    // Look routes
    router.get('/look/create', [LookController, 'create'])
    router.get('/look/options', [LookController, 'groupedByType'])

})

