import { describe, expect, it } from 'vitest'
import { costPerMl, recipeCost } from './cost'
import type { Ingredient, Recipe } from '../types'

const gin: Ingredient = {
  id: 'gin-1',
  name: 'Gin',
  category: 'Spirits',
  supplier: 'Fornecedor A',
  costPerBottle: 28,
  bottleSize: 700
}

const vermouth: Ingredient = {
  id: 'vermouth-1',
  name: 'Vermute',
  category: 'Liqueurs',
  supplier: 'Fornecedor B',
  costPerBottle: 14,
  bottleSize: 1000
}

describe('costPerMl', () => {
  it('divide o custo da garrafa pelo tamanho em ml', () => {
    expect(costPerMl(gin)).toBeCloseTo(0.04, 5)
    expect(costPerMl(vermouth)).toBeCloseTo(0.014, 5)
  })
})

describe('recipeCost', () => {
  const negroni: Recipe = {
    id: 'negroni',
    name: 'Negroni',
    category: 'Classic',
    glassType: 'Copo Rocks',
    ingredients: [
      { ingredientId: 'gin-1', amount: 30 },
      { ingredientId: 'vermouth-1', amount: 30 }
    ]
  }

  it('soma o custo de cada ingrediente pela quantidade usada', () => {
    const cost = recipeCost(negroni, [gin, vermouth])
    // 30ml de gin (0.04/ml) + 30ml de vermute (0.014/ml)
    expect(cost).toBeCloseTo(30 * 0.04 + 30 * 0.014, 5)
  })

  it('ignora ingredientes da receita que não existem mais no inventário', () => {
    const recipeWithMissingIngredient: Recipe = {
      id: 'x',
      name: 'X',
      category: 'Classic',
      glassType: 'Copo',
      ingredients: [
        { ingredientId: 'gin-1', amount: 30 },
        { ingredientId: 'ingrediente-removido', amount: 50 }
      ]
    }

    const cost = recipeCost(recipeWithMissingIngredient, [gin])
    expect(cost).toBeCloseTo(30 * 0.04, 5)
  })

  it('retorna 0 para receita sem ingredientes', () => {
    const empty: Recipe = { id: 'x', name: 'X', category: 'Classic', glassType: 'Copo', ingredients: [] }
    expect(recipeCost(empty, [gin, vermouth])).toBe(0)
  })
})
