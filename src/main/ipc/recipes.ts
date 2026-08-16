import { ipcMain } from 'electron'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { recipes, recipeIngredients, events, eventCocktailMix } from '../db/schema'
import { IdInputSchema, IpcChannels, RecipeInputSchema, RecipeUpdateSchema } from '@shared/ipc-contract'
import type { Recipe } from '@shared/types'
import { rethrowFriendly } from './errors'

export function loadRecipes(db: ReturnType<typeof getDb>): Recipe[] {
  const recipeRows = db.select().from(recipes).all()
  const ingredientRows = db.select().from(recipeIngredients).all()

  return recipeRows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as Recipe['category'],
    glassType: row.glassType,
    ingredients: ingredientRows
      .filter((ing) => ing.recipeId === row.id)
      .map((ing) => ({ ingredientId: ing.ingredientId, amount: ing.amountMl }))
  }))
}

function loadRecipeById(db: ReturnType<typeof getDb>, id: string): Recipe {
  const [row] = db.select().from(recipes).where(eq(recipes.id, id)).all()
  const ingredientRows = db.select().from(recipeIngredients).where(eq(recipeIngredients.recipeId, id)).all()

  return {
    id: row.id,
    name: row.name,
    category: row.category as Recipe['category'],
    glassType: row.glassType,
    ingredients: ingredientRows.map((ing) => ({ ingredientId: ing.ingredientId, amount: ing.amountMl }))
  }
}

export function registerRecipeHandlers(): void {
  ipcMain.handle(IpcChannels.recipesList, (): Recipe[] => {
    return loadRecipes(getDb())
  })

  ipcMain.handle(IpcChannels.recipesCreate, (_event, payload): Recipe => {
    const input = RecipeInputSchema.parse(payload)
    const db = getDb()
    const id = randomUUID()

    db.transaction((tx) => {
      tx.insert(recipes).values({ id, name: input.name, category: input.category, glassType: input.glassType }).run()
      tx.insert(recipeIngredients)
        .values(
          input.ingredients.map((ing) => ({
            id: randomUUID(),
            recipeId: id,
            ingredientId: ing.ingredientId,
            amountMl: ing.amount
          }))
        )
        .run()
    })

    return loadRecipeById(db, id)
  })

  ipcMain.handle(IpcChannels.recipesUpdate, (_event, payload): Recipe => {
    const input = RecipeUpdateSchema.parse(payload)
    const db = getDb()

    db.transaction((tx) => {
      tx.update(recipes)
        .set({ name: input.name, category: input.category, glassType: input.glassType })
        .where(eq(recipes.id, input.id))
        .run()
      tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, input.id)).run()
      tx.insert(recipeIngredients)
        .values(
          input.ingredients.map((ing) => ({
            id: randomUUID(),
            recipeId: input.id,
            ingredientId: ing.ingredientId,
            amountMl: ing.amount
          }))
        )
        .run()
    })

    return loadRecipeById(db, input.id)
  })

  ipcMain.handle(IpcChannels.recipesDelete, (_event, payload): { id: string } => {
    const { id } = IdInputSchema.parse(payload)
    const db = getDb()

    const usedIn = db
      .select({ name: events.name })
      .from(eventCocktailMix)
      .innerJoin(events, eq(eventCocktailMix.eventId, events.id))
      .where(eq(eventCocktailMix.recipeId, id))
      .all()

    if (usedIn.length > 0) {
      const names = [...new Set(usedIn.map((e) => e.name))].join(', ')
      throw new Error(`Não é possível remover: esta receita é usada em ${usedIn.length} evento(s) (${names}).`)
    }

    try {
      db.delete(recipes).where(eq(recipes.id, id)).run()
    } catch (error) {
      rethrowFriendly(error)
    }
    return { id }
  })
}
