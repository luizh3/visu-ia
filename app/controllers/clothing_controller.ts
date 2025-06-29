import type { HttpContext } from '@adonisjs/core/http'
import Clothing from '#models/clothing'

export default class ClothingController {
  /**
   * Display a list of resource
   */
  async index({ inertia, request }: HttpContext) {
    const searchTerm = request.input('search')
    const page = Number(request.input('page', 1))
    const limit = Number(request.input('limit', 12))

    let clothesQuery = Clothing.query()

    if (searchTerm) {
      clothesQuery = clothesQuery.where('name', 'like', `%${searchTerm}%`)
    }

    const clothes = await clothesQuery.paginate(page, limit)
    const totalClothes = clothes.total
    const hasMore = clothes.hasMorePages

    return inertia.render('clothing/index', {
      clothes: clothes.all(),
      totalClothes,
      searchTerm,
      hasMore,
      currentPage: page
    })
  }

  /**
   * Display form to create a new record
  */
  async create({ inertia }: HttpContext) {
    return inertia.render('clothing/create')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    console.log('=== CLOTHING STORE REQUEST ===')
    console.log('Request headers:', request.headers())
    console.log('Request body:', request.body())

    const data: any = request.only(['name', 'description', 'type', 'color', 'size'])
    console.log('Extracted data:', data)

    const allowedTypes = [
      'camiseta', 'calça', 'shorts', 'jaqueta', 'blusa', 'saia', 'suéter',
      'moletom', 'casaco', 'terno', 'maiô', 'roupa íntima', 'meias',
      'sapatos', 'botas', 'sandálias', 'tênis', 'chapéu', 'boné', 'cachecol',
      'luvas', 'cinto', 'bolsa', 'mochila'
    ]
    if (!allowedTypes.includes(data.type)) {
      console.log('Invalid type:', data.type)
      return response.badRequest('Tipo de roupa inválido.')
    }

    const imageFile = request.file('image')
    console.log('Image file:', imageFile)

    if (imageFile) {
      console.log('Processing image file...')
      const fileName = `${Date.now()}_${imageFile.clientName}`
      console.log('File name:', fileName)

      try {
        await imageFile.move('public/uploads', { name: fileName })
        console.log('File moved successfully to:', `public/uploads/${fileName}`)
        data.image = `/uploads/${fileName}`
      } catch (error) {
        console.error('Error moving file:', error)
        return response.internalServerError('Erro ao salvar a imagem.')
      }
    } else {
      console.log('No image file provided')
    }

    console.log('Final data to save:', data)

    try {
      const clothing = await Clothing.create(data)
      console.log('Clothing created successfully:', clothing.id)

      // Se for uma requisição Inertia, retorna uma resposta JSON
      if (request.header('X-Inertia')) {
        return response.redirect('/')
      }

      return response.redirect('/')
    } catch (error) {
      console.error('Error creating clothing:', error)

      // Se for uma requisição Inertia, retorna uma resposta JSON com erro
      if (request.header('X-Inertia')) {
        return response.badRequest({
          message: 'Erro ao salvar a roupa.',
          errors: error
        })
      }

      return response.internalServerError('Erro ao salvar a roupa.')
    }
  }

  /**
   * Show individual record
   */
  async show({ params, inertia, response }: HttpContext) {
    const id = Number(params.id)
    if (!id || isNaN(id)) {
      return response.badRequest('ID inválido')
    }
    const clothing = await Clothing.find(id)
    if (!clothing) {
      return response.notFound('Roupa não encontrada')
    }
    return inertia.render('clothing/show', { clothing })
  }

  /**
   * Edit individual record
   */
  async edit() { }

  /**
   * Handle form submission for the edit action
   */
  async update() { }

  /**
   * Delete record
   */
  async destroy({ params, response, request }: HttpContext) {
    const id = Number(params.id)
    if (!id || isNaN(id)) {
      return response.badRequest('ID inválido')
    }
    const clothing = await Clothing.find(id)
    if (!clothing) {
      return response.notFound('Roupa não encontrada')
    }
    await clothing.delete()

    // Se for uma requisição AJAX, retorna JSON
    if (request.header('X-Requested-With') === 'XMLHttpRequest') {
      return response.ok({ success: true, message: 'Roupa deletada com sucesso' })
    }

    // Se for uma requisição normal, faz redirect
    return response.redirect('/')
  }

  async toggleFavorite({ params, response }: HttpContext) {
    const id = Number(params.id)
    if (!id || isNaN(id)) {
      return response.badRequest('ID inválido')
    }
    const clothing = await Clothing.find(id)
    if (!clothing) {
      return response.notFound('Roupa não encontrada')
    }
    clothing.favorite = !clothing.favorite
    await clothing.save()
    return response.ok({ favorite: clothing.favorite })
  }

  async favorites({ inertia }: HttpContext) {
    const clothes = await Clothing.query().where('favorite', true)
    return inertia.render('clothing/favorites', { clothes })
  }

  /**
   * API endpoint para busca em tempo real
   */
  async search({ request, response }: HttpContext) {
    const query = request.input('q')

    if (!query || query.trim().length < 2) {
      return response.json([])
    }

    const clothes = await Clothing.query()
      .whereRaw('LOWER(name) LIKE ?', [`%${query.trim().toLowerCase()}%`])
      .limit(10)
      .exec()

    return response.json(clothes)
  }

  /**
   * API endpoint para paginação AJAX
   */
  async paginate({ request, response }: HttpContext) {
    const searchTerm = request.input('search')
    const page = Number(request.input('page', 1))
    const limit = Number(request.input('limit', 12))

    let clothesQuery = Clothing.query()

    if (searchTerm) {
      clothesQuery = clothesQuery.where('name', 'like', `%${searchTerm}%`)
    }

    const clothes = await clothesQuery.paginate(page, limit)

    return response.json({
      clothes: clothes.all(),
      hasMore: clothes.hasMorePages,
      currentPage: page,
      total: clothes.total
    })
  }
}