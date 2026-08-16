import type { Ingredient, Recipe } from '../types'

/** Custo por ml de um ingrediente, derivado do preço da garrafa (nunca armazenado). */
export function costPerMl(ingredient: Ingredient): number {
  return ingredient.costPerBottle / ingredient.bottleSize
}

/** Custo de uma dose da receita, somando o custo de cada ingrediente pela quantidade em ml. */
export function recipeCost(recipe: Recipe, ingredients: Ingredient[]): number {
  return recipe.ingredients.reduce((total, recipeIngredient) => {
    const ingredient = ingredients.find((i) => i.id === recipeIngredient.ingredientId)
    if (!ingredient) return total
    return total + costPerMl(ingredient) * recipeIngredient.amount
  }, 0)
}
