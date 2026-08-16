import { describe, expect, it } from 'vitest'
import { shoppingListFor, groupRequirementsByCategory } from './shopping-list'
import type { Ingredient, Recipe } from '../types'

const gin: Ingredient = { id: 'gin-1', name: 'Gin', category: 'Spirits', supplier: 'A', costPerBottle: 28, bottleSize: 700 }
const vermouth: Ingredient = { id: 'vermouth-1', name: 'Vermute', category: 'Liqueurs', supplier: 'B', costPerBottle: 14, bottleSize: 1000 }
const limeJuice: Ingredient = { id: 'lime-1', name: 'Suco de Limão', category: 'Mixers', supplier: 'C', costPerBottle: 8, bottleSize: 1000 }
const ingredients = [gin, vermouth, limeJuice]

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

const ginFizz: Recipe = {
  id: 'gin-fizz',
  name: 'Gin Fizz',
  category: 'Classic',
  glassType: 'Copo Highball',
  ingredients: [
    { ingredientId: 'gin-1', amount: 45 },
    { ingredientId: 'lime-1', amount: 20 }
  ]
}

const recipes = [negroni, ginFizz]

describe('shoppingListFor', () => {
  it('soma o volume de um ingrediente compartilhado entre duas receitas do mix', () => {
    const mix = [
      { recipeId: 'negroni', percentage: 50 },
      { recipeId: 'gin-fizz', percentage: 50 }
    ]
    const result = shoppingListFor(mix, 100, recipes, ingredients)

    // 50 doses de Negroni (30ml de gin cada) + 50 doses de Gin Fizz (45ml de gin cada)
    expect(result['gin-1'].totalMl).toBeCloseTo(50 * 30 + 50 * 45, 5)
  })

  it('arredonda garrafas sempre para cima, mesmo com sobra mínima', () => {
    // 1 dose de Negroni = 30ml de gin; garrafa de 700ml -> precisa de 1 garrafa mesmo usando quase nada
    const result = shoppingListFor([{ recipeId: 'negroni', percentage: 100 }], 1, recipes, ingredients)
    expect(result['gin-1'].bottles).toBe(1)

    // 70 doses × 30ml = 2100ml = exatamente 3 garrafas de 700ml — não deve virar 4
    const exactMix = shoppingListFor([{ recipeId: 'negroni', percentage: 100 }], 70, recipes, ingredients)
    expect(exactMix['gin-1'].bottles).toBe(3)
  })

  it('calcula o custo total como garrafas inteiras × preço da garrafa (não custo proporcional ao ml)', () => {
    const result = shoppingListFor([{ recipeId: 'negroni', percentage: 100 }], 1, recipes, ingredients)
    expect(result['gin-1'].totalCost).toBe(1 * gin.costPerBottle)
  })

  it('ignora entradas do mix cuja receita não existe', () => {
    const result = shoppingListFor([{ recipeId: 'receita-fantasma', percentage: 100 }], 100, recipes, ingredients)
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('mix vazio não gera nenhum item', () => {
    expect(Object.keys(shoppingListFor([], 100, recipes, ingredients))).toHaveLength(0)
  })

  it('totalDrinks 0 ainda lista os ingredientes da receita, mas com volume/garrafas/custo zerados', () => {
    // comportamento intencional: mostra que o ingrediente faz parte do mix,
    // só que não precisa comprar nada — não os omite da lista
    const result = shoppingListFor([{ recipeId: 'negroni', percentage: 100 }], 0, recipes, ingredients)
    expect(Object.keys(result)).toEqual(['gin-1', 'vermouth-1'])
    expect(result['gin-1']).toEqual({ ingredientId: 'gin-1', totalMl: 0, bottles: 0, totalCost: 0 })
  })
})

describe('groupRequirementsByCategory', () => {
  it('agrupa por categoria do ingrediente, ignorando ingredientes desconhecidos', () => {
    const items = [
      { ingredientId: 'gin-1', totalMl: 100 },
      { ingredientId: 'vermouth-1', totalMl: 50 },
      { ingredientId: 'lime-1', totalMl: 20 },
      { ingredientId: 'inexistente', totalMl: 999 }
    ]

    const grouped = groupRequirementsByCategory(items, ingredients)

    expect(grouped['Spirits']).toHaveLength(1)
    expect(grouped['Liqueurs']).toHaveLength(1)
    expect(grouped['Mixers']).toHaveLength(1)
    expect(grouped['inexistente']).toBeUndefined()
    expect(Object.values(grouped).flat()).toHaveLength(3)
  })

  it('é genérico o bastante para agrupar itens com campos extras (ex.: purchased)', () => {
    const items = [{ ingredientId: 'gin-1', purchased: true }]
    const grouped = groupRequirementsByCategory(items, ingredients)
    expect(grouped['Spirits'][0].purchased).toBe(true)
  })
})
