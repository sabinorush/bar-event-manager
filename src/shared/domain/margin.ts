import type { CocktailMix, EventScope, Ingredient, Recipe } from '../types'
import { recipeCost } from './cost'

export interface EventFinancials {
  totalDrinks: number
  totalRevenue: number
  ingredientCost: number
  operationalCost: number
  totalCost: number
  netProfit: number
  margin: number
}

/**
 * Calcula o resultado financeiro de um evento a partir do escopo e do mix de
 * coquetéis. Única fonte de verdade para esse cálculo — antes duplicado em
 * event-planner-step2, shopping-list e scenario-comparison-modal.
 */
export function eventFinancials(
  scope: EventScope,
  mix: CocktailMix[],
  recipes: Recipe[],
  ingredients: Ingredient[]
): EventFinancials {
  const totalDrinks = scope.pax * scope.drinksPerPax
  const totalRevenue = scope.pax * scope.ticketPrice
  const operationalCost = scope.staffCost + scope.iceCost + scope.transportCost

  const ingredientCost = mix.reduce((total, mixItem) => {
    const recipe = recipes.find((r) => r.id === mixItem.recipeId)
    if (!recipe) return total
    const numberOfDrinks = (mixItem.percentage / 100) * totalDrinks
    return total + recipeCost(recipe, ingredients) * numberOfDrinks
  }, 0)

  const totalCost = ingredientCost + operationalCost
  const netProfit = totalRevenue - totalCost
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  return { totalDrinks, totalRevenue, ingredientCost, operationalCost, totalCost, netProfit, margin }
}
