import { randomUUID } from 'crypto'
import type { getDb } from './client'
import { ingredients, recipes, recipeIngredients, events, eventCocktailMix, eventFinancialSnapshot, shoppingListItems } from './schema'
import { seedIngredients, seedRecipes, seedEvents, seedEventMix } from './seed-data'
import { shoppingListFor } from '@shared/domain/shopping-list'
import type { Ingredient, Recipe } from '@shared/types'

const domainIngredients: Ingredient[] = seedIngredients.map((ing) => ({
  id: ing.id,
  name: ing.name,
  category: ing.category as Ingredient['category'],
  supplier: ing.supplier,
  costPerBottle: ing.costPerBottle,
  bottleSize: ing.bottleSizeMl
}))

const domainRecipes: Recipe[] = seedRecipes.map((recipe) => ({
  id: recipe.id,
  name: recipe.name,
  category: recipe.category as Recipe['category'],
  glassType: recipe.glassType,
  ingredients: recipe.ingredients.map((ing) => ({ ingredientId: ing.ingredientId, amount: ing.amountMl }))
}))

/** Popula o banco recém-criado com os dados de demonstração. Roda uma única vez, no primeiro boot. */
export function seed(db: ReturnType<typeof getDb>): void {
  db.insert(ingredients).values(seedIngredients).run()

  for (const recipe of seedRecipes) {
    db.insert(recipes)
      .values({ id: recipe.id, name: recipe.name, category: recipe.category, glassType: recipe.glassType })
      .run()

    db.insert(recipeIngredients)
      .values(
        recipe.ingredients.map((ing) => ({
          id: randomUUID(),
          recipeId: recipe.id,
          ingredientId: ing.ingredientId,
          amountMl: ing.amountMl
        }))
      )
      .run()
  }

  for (const event of seedEvents) {
    db.insert(events)
      .values({
        id: event.id,
        name: event.name,
        eventDate: event.eventDate,
        status: event.status,
        pax: event.pax,
        drinksPerPax: event.drinksPerPax,
        ticketPrice: event.ticketPrice,
        staffCost: event.staffCost,
        iceCost: event.iceCost,
        transportCost: event.transportCost
      })
      .run()

    db.insert(eventCocktailMix)
      .values(seedEventMix.map((mix) => ({ id: randomUUID(), eventId: event.id, recipeId: mix.recipeId, percentage: mix.percentage })))
      .run()

    db.insert(eventFinancialSnapshot)
      .values({
        eventId: event.id,
        totalRevenue: event.snapshot.totalRevenue,
        ingredientCost: event.snapshot.ingredientCost,
        operationalCost: event.snapshot.operationalCost,
        totalCost: event.snapshot.totalCost,
        netProfit: event.snapshot.netProfit,
        margin: event.snapshot.margin
      })
      .run()

    const totalDrinks = event.pax * event.drinksPerPax
    const shoppingItems = shoppingListFor(seedEventMix, totalDrinks, domainRecipes, domainIngredients)

    db.insert(shoppingListItems)
      .values(
        Object.values(shoppingItems).map((item) => ({
          id: randomUUID(),
          eventId: event.id,
          ingredientId: item.ingredientId,
          totalMlNeeded: item.totalMl,
          bottlesNeeded: item.bottles,
          totalCost: item.totalCost
        }))
      )
      .run()
  }
}
