import { ipcMain } from 'electron'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { events, eventCocktailMix, eventFinancialSnapshot, recipes, shoppingListItems } from '../db/schema'
import { EventInputSchema, IpcChannels } from '@shared/ipc-contract'
import type { Event } from '@shared/types'
import { eventFinancials } from '@shared/domain/margin'
import { shoppingListFor } from '@shared/domain/shopping-list'
import { loadIngredients } from './ingredients'
import { loadRecipes } from './recipes'

export function loadEvents(db: ReturnType<typeof getDb>): Event[] {
  const eventRows = db.select().from(events).all()
  const snapshotRows = db.select().from(eventFinancialSnapshot).all()
  const mixRows = db
    .select({
      eventId: eventCocktailMix.eventId,
      recipeId: eventCocktailMix.recipeId,
      percentage: eventCocktailMix.percentage,
      recipeName: recipes.name
    })
    .from(eventCocktailMix)
    .innerJoin(recipes, eq(eventCocktailMix.recipeId, recipes.id))
    .all()

  return eventRows
    .map((row) => {
      const snapshot = snapshotRows.find((s) => s.eventId === row.id)
      if (!snapshot) return null
      return {
        id: row.id,
        name: row.name,
        date: row.eventDate,
        status: row.status as Event['status'],
        pax: row.pax,
        drinksPerPax: row.drinksPerPax,
        ticketPrice: row.ticketPrice,
        totalRevenue: snapshot.totalRevenue,
        ingredientCost: snapshot.ingredientCost,
        operationalCost: snapshot.operationalCost,
        totalCost: snapshot.totalCost,
        netProfit: snapshot.netProfit,
        margin: snapshot.margin,
        cocktailMix: mixRows
          .filter((m) => m.eventId === row.id)
          .map((m) => ({ recipeId: m.recipeId, recipeName: m.recipeName, percentage: m.percentage }))
      } satisfies Event
    })
    .filter((event): event is Event => event !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function registerEventHandlers(): void {
  ipcMain.handle(IpcChannels.eventsList, (): Event[] => {
    return loadEvents(getDb())
  })

  ipcMain.handle(IpcChannels.eventsCreate, (_event, payload): Event => {
    const input = EventInputSchema.parse(payload)
    const db = getDb()
    const ingredientList = loadIngredients(db)
    const recipeList = loadRecipes(db)
    const financials = eventFinancials(input.scope, input.mix, recipeList, ingredientList)
    const shoppingItems = shoppingListFor(input.mix, financials.totalDrinks, recipeList, ingredientList)

    const id = randomUUID()
    const eventDate = new Date().toISOString().slice(0, 10)

    db.transaction((tx) => {
      tx.insert(events)
        .values({
          id,
          name: input.name,
          eventDate,
          status: 'Planning',
          pax: input.scope.pax,
          drinksPerPax: input.scope.drinksPerPax,
          ticketPrice: input.scope.ticketPrice,
          staffCost: input.scope.staffCost,
          iceCost: input.scope.iceCost,
          transportCost: input.scope.transportCost
        })
        .run()

      tx.insert(eventCocktailMix)
        .values(input.mix.map((mix) => ({ id: randomUUID(), eventId: id, recipeId: mix.recipeId, percentage: mix.percentage })))
        .run()

      tx.insert(eventFinancialSnapshot)
        .values({
          eventId: id,
          totalRevenue: financials.totalRevenue,
          ingredientCost: financials.ingredientCost,
          operationalCost: financials.operationalCost,
          totalCost: financials.totalCost,
          netProfit: financials.netProfit,
          margin: financials.margin
        })
        .run()

      tx.insert(shoppingListItems)
        .values(
          Object.values(shoppingItems).map((item) => ({
            id: randomUUID(),
            eventId: id,
            ingredientId: item.ingredientId,
            totalMlNeeded: item.totalMl,
            bottlesNeeded: item.bottles,
            totalCost: item.totalCost
          }))
        )
        .run()
    })

    const [row] = db.select().from(events).where(eq(events.id, id)).all()
    const recipeById = new Map(recipeList.map((r) => [r.id, r]))

    return {
      id: row.id,
      name: row.name,
      date: row.eventDate,
      status: row.status as Event['status'],
      pax: row.pax,
      drinksPerPax: row.drinksPerPax,
      ticketPrice: row.ticketPrice,
      totalRevenue: financials.totalRevenue,
      ingredientCost: financials.ingredientCost,
      operationalCost: financials.operationalCost,
      totalCost: financials.totalCost,
      netProfit: financials.netProfit,
      margin: financials.margin,
      cocktailMix: input.mix.map((mix) => ({
        recipeId: mix.recipeId,
        recipeName: recipeById.get(mix.recipeId)?.name ?? mix.recipeId,
        percentage: mix.percentage
      }))
    }
  })
}
