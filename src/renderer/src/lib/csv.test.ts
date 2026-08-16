import { describe, expect, it } from 'vitest'
import { buildShoppingListCsv } from './csv'
import type { Ingredient, IngredientCategory, ShoppingListItem } from '@shared/types'

const gin: Ingredient = { id: 'gin-1', name: 'Gin "Premium"', category: 'Spirits', supplier: 'Fornecedor; Especial', costPerBottle: 28, bottleSize: 700 }
const vermouth: Ingredient = { id: 'vermouth-1', name: 'Vermute', category: 'Liqueurs', supplier: 'B', costPerBottle: 14, bottleSize: 1000 }
const ingredients = [gin, vermouth]

const categoryOrder: IngredientCategory[] = ['Spirits', 'Liqueurs', 'Mixers', 'Syrups', 'Fruits', 'Garnish']
const categoryTranslations: Record<IngredientCategory, string> = {
  Spirits: 'Destilados',
  Liqueurs: 'Licores',
  Mixers: 'Mixers',
  Syrups: 'Xaropes',
  Fruits: 'Frutas',
  Garnish: 'Guarnições'
}

describe('buildShoppingListCsv', () => {
  it('usa ; como delimitador e vírgula como separador decimal (padrão Excel pt-BR)', () => {
    const items: ShoppingListItem[] = [{ ingredientId: 'vermouth-1', totalMlNeeded: 1000, bottlesNeeded: 1, totalCost: 14.5, purchased: false }]
    const grouped = { Liqueurs: items }

    const csv = buildShoppingListCsv(grouped, ingredients, categoryOrder, categoryTranslations)
    const dataRow = csv.split('\r\n')[1]

    expect(dataRow).toContain('14,50')
    expect(dataRow.split(';')).toHaveLength(8)
  })

  it('escapa campos com ; ou aspas, dobrando as aspas internas', () => {
    const items: ShoppingListItem[] = [{ ingredientId: 'gin-1', totalMlNeeded: 700, bottlesNeeded: 1, totalCost: 28, purchased: false }]
    const grouped = { Spirits: items }

    const csv = buildShoppingListCsv(grouped, ingredients, categoryOrder, categoryTranslations)
    const dataRow = csv.split('\r\n')[1]

    expect(dataRow).toContain('"Gin ""Premium"""')
    expect(dataRow).toContain('"Fornecedor; Especial"')
  })

  it('mostra Sim/Não na coluna Comprado', () => {
    const items: ShoppingListItem[] = [{ ingredientId: 'vermouth-1', totalMlNeeded: 1000, bottlesNeeded: 1, totalCost: 14, purchased: true }]
    const grouped = { Liqueurs: items }

    const csv = buildShoppingListCsv(grouped, ingredients, categoryOrder, categoryTranslations)
    expect(csv.split('\r\n')[1].endsWith('Sim')).toBe(true)
  })

  it('respeita a ordem de categorias e pula categorias vazias', () => {
    const items: Record<string, ShoppingListItem[]> = {
      Liqueurs: [{ ingredientId: 'vermouth-1', totalMlNeeded: 1000, bottlesNeeded: 1, totalCost: 14, purchased: false }],
      Spirits: [{ ingredientId: 'gin-1', totalMlNeeded: 700, bottlesNeeded: 1, totalCost: 28, purchased: false }]
    }

    const csv = buildShoppingListCsv(items, ingredients, categoryOrder, categoryTranslations)
    const lines = csv.split('\r\n')
    // Spirits vem antes de Liqueurs em categoryOrder, mesmo que o objeto tenha sido montado na ordem inversa
    expect(lines[1]).toContain('Destilados')
    expect(lines[2]).toContain('Licores')
  })

  it('gera só o cabeçalho quando não há itens', () => {
    const csv = buildShoppingListCsv({}, ingredients, categoryOrder, categoryTranslations)
    expect(csv.split('\r\n')).toHaveLength(1)
  })
})
