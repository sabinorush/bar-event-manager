import type { CocktailMix, Ingredient, Recipe } from '../types'
import { costPerMl } from './cost'

export interface IngredientRequirement {
  ingredientId: string
  totalMl: number
  bottles: number
  totalCost: number
}

/**
 * Calcula, para cada ingrediente presente no mix, o volume total necessário,
 * garrafas a comprar (arredondado para cima) e custo total.
 */
export function shoppingListFor(
  mix: CocktailMix[],
  totalDrinks: number,
  recipes: Recipe[],
  ingredients: Ingredient[]
): Record<string, IngredientRequirement> {
  const requirements: Record<string, IngredientRequirement> = {}

  mix.forEach((mixItem) => {
    const recipe = recipes.find((r) => r.id === mixItem.recipeId)
    if (!recipe) return

    const numberOfDrinks = (mixItem.percentage / 100) * totalDrinks

    recipe.ingredients.forEach((recipeIngredient) => {
      const totalMlNeeded = recipeIngredient.amount * numberOfDrinks

      if (!requirements[recipeIngredient.ingredientId]) {
        requirements[recipeIngredient.ingredientId] = {
          ingredientId: recipeIngredient.ingredientId,
          totalMl: 0,
          bottles: 0,
          totalCost: 0
        }
      }

      requirements[recipeIngredient.ingredientId].totalMl += totalMlNeeded
    })
  })

  Object.keys(requirements).forEach((ingredientId) => {
    const ingredient = ingredients.find((i) => i.id === ingredientId)
    if (!ingredient) return
    const bottles = Math.ceil(requirements[ingredientId].totalMl / ingredient.bottleSize)
    requirements[ingredientId].bottles = bottles
    requirements[ingredientId].totalCost = bottles * ingredient.costPerBottle
  })

  return requirements
}

/**
 * Agrupa itens por categoria de ingrediente, na ordem de exibição padrão.
 * Genérico o bastante para agrupar tanto o cálculo ao vivo (`IngredientRequirement`,
 * usado no preview do Smart Mix) quanto os itens já persistidos no banco
 * (`ShoppingListItem`, que além disso carregam o campo `purchased`).
 */
export function groupRequirementsByCategory<T extends { ingredientId: string }>(
  requirements: T[],
  ingredients: Ingredient[]
): Record<string, T[]> {
  return requirements.reduce<Record<string, T[]>>((acc, req) => {
    const ingredient = ingredients.find((i) => i.id === req.ingredientId)
    if (!ingredient) return acc
    if (!acc[ingredient.category]) acc[ingredient.category] = []
    acc[ingredient.category].push(req)
    return acc
  }, {})
}

// re-exported so callers only need one import for cost-related helpers
export { costPerMl }
