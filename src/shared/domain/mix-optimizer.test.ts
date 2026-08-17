import { describe, expect, it } from 'vitest'
import { optimizeMixForProfit } from './mix-optimizer'
import type { Ingredient, Recipe } from '../types'

const gin: Ingredient = { id: 'gin-1', name: 'Gin', category: 'Spirits', supplier: 'A', costPerBottle: 28, bottleSize: 700 }
const vermouth: Ingredient = { id: 'vermouth-1', name: 'Vermute', category: 'Liqueurs', supplier: 'B', costPerBottle: 14, bottleSize: 1000 }
const limao: Ingredient = { id: 'limao-1', name: 'Limão', category: 'Fruits', supplier: 'C', costPerBottle: 5, bottleSize: 1000 }
const ingredients = [gin, vermouth, limao]

// Custo por dose: 30*0.04 + 30*0.014 = 1.62
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

// Custo por dose: 60*0.005 = 0.3 (bem mais barato que o Negroni)
const caipirinha: Recipe = {
  id: 'caipirinha',
  name: 'Caipirinha',
  category: 'Classic',
  glassType: 'Copo Rocks',
  ingredients: [{ ingredientId: 'limao-1', amount: 60 }]
}

const recipes = [negroni, caipirinha]

describe('optimizeMixForProfit', () => {
  it('retorna vazio quando nenhuma receita está selecionada', () => {
    expect(optimizeMixForProfit([], recipes, ingredients)).toEqual([])
  })

  it('aloca 100% quando só há uma receita selecionada', () => {
    const result = optimizeMixForProfit(['negroni'], recipes, ingredients)
    expect(result).toEqual([{ recipeId: 'negroni', percentage: 100 }])
  })

  it('dá mais percentual à receita mais barata, somando exatamente 100%', () => {
    const result = optimizeMixForProfit(['negroni', 'caipirinha'], recipes, ingredients)
    const total = result.reduce((sum, mix) => sum + mix.percentage, 0)
    expect(total).toBe(100)

    const negroniShare = result.find((mix) => mix.recipeId === 'negroni')!.percentage
    const caipirinhaShare = result.find((mix) => mix.recipeId === 'caipirinha')!.percentage
    expect(caipirinhaShare).toBeGreaterThan(negroniShare)
  })

  it('mantém todas as receitas selecionadas com percentual acima de zero', () => {
    const result = optimizeMixForProfit(['negroni', 'caipirinha'], recipes, ingredients)
    expect(result.every((mix) => mix.percentage > 0)).toBe(true)
  })

  it('cada percentual é múltiplo do passo de alocação de 5%', () => {
    const result = optimizeMixForProfit(['negroni', 'caipirinha'], recipes, ingredients)
    expect(result.every((mix) => mix.percentage % 5 === 0)).toBe(true)
  })

  it('ignora receitas que não existem mais (custo tratado como 0)', () => {
    const result = optimizeMixForProfit(['negroni', 'receita-removida'], recipes, ingredients)
    const total = result.reduce((sum, mix) => sum + mix.percentage, 0)
    expect(total).toBe(100)
    // receita removida tem custo 0 -> peso máximo -> recebe a maior fatia
    const removida = result.find((mix) => mix.recipeId === 'receita-removida')!.percentage
    const negroniShare = result.find((mix) => mix.recipeId === 'negroni')!.percentage
    expect(removida).toBeGreaterThan(negroniShare)
  })
})
