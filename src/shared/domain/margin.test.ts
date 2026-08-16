import { describe, expect, it } from 'vitest'
import { eventFinancials } from './margin'
import type { EventScope, Ingredient, Recipe } from '../types'

const gin: Ingredient = { id: 'gin-1', name: 'Gin', category: 'Spirits', supplier: 'A', costPerBottle: 28, bottleSize: 700 }
const vermouth: Ingredient = { id: 'vermouth-1', name: 'Vermute', category: 'Liqueurs', supplier: 'B', costPerBottle: 14, bottleSize: 1000 }
const ingredients = [gin, vermouth]

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
const recipes = [negroni]

const baseScope: EventScope = {
  pax: 100,
  drinksPerPax: 2,
  ticketPrice: 50,
  staffCost: 500,
  iceCost: 100,
  transportCost: 100
}

describe('eventFinancials', () => {
  it('calcula receita, custo e margem para um mix somando 100%', () => {
    const result = eventFinancials(baseScope, [{ recipeId: 'negroni', percentage: 100 }], recipes, ingredients)

    expect(result.totalDrinks).toBe(200)
    expect(result.totalRevenue).toBe(5000)
    expect(result.operationalCost).toBe(700)
    // custo do Negroni por dose: 30*0.04 + 30*0.014 = 1.62; 200 doses
    expect(result.ingredientCost).toBeCloseTo(200 * 1.62, 5)
    expect(result.totalCost).toBeCloseTo(700 + 200 * 1.62, 5)
    expect(result.netProfit).toBeCloseTo(5000 - (700 + 200 * 1.62), 5)
    expect(result.margin).toBeGreaterThan(0)
  })

  it('funciona com mix somando menos de 100% (resto não é preenchido/assumido)', () => {
    const result = eventFinancials(baseScope, [{ recipeId: 'negroni', percentage: 40 }], recipes, ingredients)
    // só 40% dos drinks contam como Negroni; o restante simplesmente não gera custo de ingrediente
    expect(result.ingredientCost).toBeCloseTo(200 * 0.4 * 1.62, 5)
  })

  it('funciona com mix somando mais de 100% (soma tudo, sem normalizar)', () => {
    const result = eventFinancials(
      baseScope,
      [
        { recipeId: 'negroni', percentage: 70 },
        { recipeId: 'negroni', percentage: 60 }
      ],
      recipes,
      ingredients
    )
    // 130% do total de drinks é contabilizado como custo de Negroni — comportamento
    // esperado: a função não valida a soma, só soma o que recebe (a UI que valida 100%)
    expect(result.ingredientCost).toBeCloseTo(200 * 1.3 * 1.62, 5)
  })

  it('ignora receitas do mix que não existem mais', () => {
    const result = eventFinancials(baseScope, [{ recipeId: 'receita-removida', percentage: 100 }], recipes, ingredients)
    expect(result.ingredientCost).toBe(0)
    expect(result.totalCost).toBe(result.operationalCost)
  })

  it('margem fica negativa quando o custo supera a receita', () => {
    const expensiveScope: EventScope = { ...baseScope, ticketPrice: 1, staffCost: 5000, iceCost: 0, transportCost: 0 }
    const result = eventFinancials(expensiveScope, [{ recipeId: 'negroni', percentage: 100 }], recipes, ingredients)

    expect(result.netProfit).toBeLessThan(0)
    expect(result.margin).toBeLessThan(0)
  })

  it('margem é 0 (não NaN/Infinity) quando a receita total é 0', () => {
    const freeScope: EventScope = { ...baseScope, ticketPrice: 0 }
    const result = eventFinancials(freeScope, [{ recipeId: 'negroni', percentage: 100 }], recipes, ingredients)

    expect(result.totalRevenue).toBe(0)
    expect(result.margin).toBe(0)
    expect(Number.isFinite(result.margin)).toBe(true)
  })

  it('mix vazio não gera custo de ingrediente', () => {
    const result = eventFinancials(baseScope, [], recipes, ingredients)
    expect(result.ingredientCost).toBe(0)
    expect(result.totalCost).toBe(result.operationalCost)
  })
})
