import type { CocktailMix, Ingredient, Recipe } from '../types'
import { recipeCost } from './cost'

const ALLOCATION_STEP = 5
const TOTAL_UNITS = 100 / ALLOCATION_STEP

/**
 * Distribui `totalUnits` unidades inteiras entre os pesos brutos, usando o método
 * dos maiores restos — garante que a soma final bate exatamente com `totalUnits`
 * mesmo após arredondar cada peso para baixo.
 */
function largestRemainderRound(rawUnits: number[], totalUnits: number): number[] {
  const floored = rawUnits.map((u) => Math.floor(u))
  let remaining = totalUnits - floored.reduce((sum, u) => sum + u, 0)

  const byRemainder = rawUnits
    .map((u, index) => ({ index, frac: u - Math.floor(u) }))
    .sort((a, b) => b.frac - a.frac)

  const result = [...floored]
  for (let i = 0; i < byRemainder.length && remaining > 0; i++, remaining--) {
    result[byRemainder[i].index] += 1
  }

  return result
}

/**
 * Recalcula a distribuição percentual do mix visando o maior lucro líquido possível:
 * como a receita do evento não varia por receita (é fixa por convidado), lucro máximo
 * equivale a minimizar o custo de ingredientes. Aqui isso é feito ponderando cada
 * receita pelo inverso do seu custo por dose — receitas mais baratas recebem uma fatia
 * maior do mix — mantendo todas as receitas selecionadas presentes no cardápio.
 */
export function optimizeMixForProfit(recipeIds: string[], recipes: Recipe[], ingredients: Ingredient[]): CocktailMix[] {
  const costs = recipeIds.map((recipeId) => {
    const recipe = recipes.find((r) => r.id === recipeId)
    const cost = recipe ? recipeCost(recipe, ingredients) : 0
    return { recipeId, cost }
  })

  if (costs.length === 0) return []
  if (costs.length === 1) return [{ recipeId: costs[0].recipeId, percentage: 100 }]

  // Custo zero é tratado como "infinitamente barato" (peso muito alto), sem dividir por zero.
  const weights = costs.map(({ cost }) => (cost > 0 ? 1 / cost : Number.MAX_SAFE_INTEGER))
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  const rawUnits = weights.map((w) => (w / totalWeight) * TOTAL_UNITS)
  const units = largestRemainderRound(rawUnits, TOTAL_UNITS)

  return costs.map(({ recipeId }, index) => ({ recipeId, percentage: units[index] * ALLOCATION_STEP }))
}
