import { test, expect } from '../fixtures'

test.describe('eventos e lista de compras (IPC)', () => {
  test('criar evento persiste event + mix + snapshot financeiro + shopping_list_items', async ({ appWindow }) => {
    const result = await appWindow.evaluate(async () => {
      const created = await window.api.events.create({
        name: 'Evento de Teste',
        scope: { pax: 50, drinksPerPax: 2, ticketPrice: 30, staffCost: 100, iceCost: 20, transportCost: 30 },
        mix: [{ recipeId: 'mojito', percentage: 100 }]
      })

      const items = await window.api.shoppingList.forEvent(created.id)
      const eventsList = await window.api.events.list()

      return { created, items, foundInList: eventsList.some((e) => e.id === created.id) }
    })

    expect(result.created.totalRevenue).toBe(1500) // 50 pax * R$30
    expect(result.created.cocktailMix).toEqual([{ recipeId: 'mojito', recipeName: 'Mojito', percentage: 100 }])
    expect(result.foundInList).toBe(true)

    // Mojito usa rum, suco de limão e xarope simples
    const ingredientIds = result.items.map((i) => i.ingredientId).sort()
    expect(ingredientIds).toEqual(['lime-juice-1', 'rum-1', 'simple-syrup-1'])
    expect(result.items.every((i) => i.purchased === false)).toBe(true)
  })

  test('marcar item como comprado persiste e não afeta outros itens', async ({ appWindow }) => {
    const result = await appWindow.evaluate(async () => {
      const created = await window.api.events.create({
        name: 'Evento de Teste 2',
        scope: { pax: 20, drinksPerPax: 1, ticketPrice: 10, staffCost: 0, iceCost: 0, transportCost: 0 },
        mix: [{ recipeId: 'mojito', percentage: 100 }]
      })

      const items = await window.api.shoppingList.forEvent(created.id)
      const target = items[0].ingredientId

      await window.api.shoppingList.togglePurchased({ eventId: created.id, ingredientId: target, purchased: true })
      const afterToggle = await window.api.shoppingList.forEvent(created.id)

      return {
        target,
        targetPurchased: afterToggle.find((i) => i.ingredientId === target)?.purchased,
        othersUntouched: afterToggle.filter((i) => i.ingredientId !== target).every((i) => i.purchased === false)
      }
    })

    expect(result.targetPurchased).toBe(true)
    expect(result.othersUntouched).toBe(true)
  })

  test('financeiro do evento bate com o motor de domínio (receita - custo = lucro)', async ({ appWindow }) => {
    const financials = await appWindow.evaluate(async () => {
      const created = await window.api.events.create({
        name: 'Evento Financeiro',
        scope: { pax: 100, drinksPerPax: 3, ticketPrice: 40, staffCost: 200, iceCost: 50, transportCost: 50 },
        mix: [{ recipeId: 'negroni', percentage: 100 }]
      })
      return created
    })

    expect(financials.totalRevenue).toBe(4000)
    expect(financials.operationalCost).toBe(300)
    expect(financials.totalCost).toBeCloseTo(financials.ingredientCost + 300, 2)
    expect(financials.netProfit).toBeCloseTo(financials.totalRevenue - financials.totalCost, 2)
    expect(financials.margin).toBeCloseTo((financials.netProfit / financials.totalRevenue) * 100, 2)
  })
})
