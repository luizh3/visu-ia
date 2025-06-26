import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'insert_sample_clothings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    await this.db.table('clothing').multiInsert([
      {
        name: 'Chapéu Fedora',
        description: 'Chapéu estiloso para dias ensolarados.',
        type: 'chapéu',
        color: '#8B5E3C',
        size: 'M',
        image: '/defaults/clothing.png',
        favorite: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Camiseta Branca',
        description: 'Camiseta básica de algodão.',
        type: 'camiseta',
        color: '#FFFFFF',
        size: 'G',
        image: '/defaults/clothing.png',
        favorite: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Calça Jeans',
        description: 'Calça jeans azul tradicional.',
        type: 'calça',
        color: '#1E3A8A',
        size: '40',
        image: '/defaults/clothing.png',
        favorite: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Tênis Esportivo',
        description: 'Tênis confortável para corrida.',
        type: 'tênis',
        color: '#000000',
        size: '42',
        image: '/defaults/clothing.png',
        favorite: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Chapéu Panamá',
        description: 'Chapéu leve para o verão.',
        type: 'chapéu',
        color: '#F5DEB3',
        size: 'G',
        image: '/defaults/clothing.png',
        favorite: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  }

  async down() {
    this.schema.dropTable(this.tableName)

    await this.db.from('clothing').whereIn('name', [
      'Chapéu Fedora',
      'Camiseta Branca',
      'Calça Jeans',
      'Tênis Esportivo',
      'Chapéu Panamá',
    ]).delete()
  }
}