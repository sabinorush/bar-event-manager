import { test, expect } from '../fixtures'

test.describe('seed inicial', () => {
  test('popula ingredientes, receitas, eventos e lista de compras de um banco novo', async ({ appWindow }) => {
    const counts = await appWindow.evaluate(async () => {
      const ingredients = await window.api.ingredients.list()
      const recipes = await window.api.recipes.list()
      const events = await window.api.events.list()
      const shoppingItemCounts = await Promise.all(events.map((e) => window.api.shoppingList.forEvent(e.id)))
      return {
        ingredients: ingredients.length,
        recipes: recipes.length,
        events: events.length,
        shoppingItemsTotal: shoppingItemCounts.reduce((sum, items) => sum + items.length, 0)
      }
    })

    expect(counts.ingredients).toBe(15)
    expect(counts.recipes).toBe(8)
    expect(counts.events).toBe(5)
    // 9 itens por evento (3 receitas × 3 ingredientes cada no mix do seed) × 5 eventos
    expect(counts.shoppingItemsTotal).toBe(45)
  })

  test('cada evento do seed já tem o mix de coquetéis e o breakdown de custo', async ({ appWindow }) => {
    const firstEvent = await appWindow.evaluate(async () => {
      const events = await window.api.events.list()
      return events[0]
    })

    expect(firstEvent.cocktailMix.length).toBeGreaterThan(0)
    expect(firstEvent.ingredientCost).toBeGreaterThan(0)
    expect(firstEvent.operationalCost).toBeGreaterThan(0)
    expect(firstEvent.totalCost).toBeCloseTo(firstEvent.ingredientCost + firstEvent.operationalCost, 2)
  })
})
