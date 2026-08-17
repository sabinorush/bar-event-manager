import { ipcMain } from 'electron'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { ingredients, recipeIngredients, recipes } from '../db/schema'
import { IdInputSchema, IngredientInputSchema, IngredientUpdateSchema, IpcChannels } from '@shared/ipc-contract'
import type { Ingredient } from '@shared/types'
import { rethrowFriendly } from './errors'

export function loadIngredients(db: ReturnType<typeof getDb>): Ingredient[] {
  return db.select().from(ingredients).all().map(toIngredient)
}

function toIngredient(row: typeof ingredients.$inferSelect): Ingredient {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Ingredient['category'],
    supplier: row.supplier,
    costPerBottle: row.costPerBottle,
    bottleSize: row.bottleSizeMl
  }
}

export function registerIngredientHandlers(): void {
  ipcMain.handle(IpcChannels.ingredientsList, (): Ingredient[] => {
    return loadIngredients(getDb())
  })

  ipcMain.handle(IpcChannels.ingredientsCreate, (_event, payload): Ingredient => {
    const input = IngredientInputSchema.parse(payload)
    const db = getDb()
    const id = randomUUID()

    db.insert(ingredients)
      .values({
        id,
        name: input.name,
        category: input.category,
        supplier: input.supplier,
        costPerBottle: input.costPerBottle,
        bottleSizeMl: input.bottleSize
      })
      .run()

    const [row] = db.select().from(ingredients).where(eq(ingredients.id, id)).all()
    return toIngredient(row)
  })

  ipcMain.handle(IpcChannels.ingredientsUpdate, (_event, payload): Ingredient => {
    const input = IngredientUpdateSchema.parse(payload)
    const db = getDb()

    db.update(ingredients)
      .set({
        name: input.name,
        category: input.category,
        supplier: input.supplier,
        costPerBottle: input.costPerBottle,
        bottleSizeMl: input.bottleSize
      })
      .where(eq(ingredients.id, input.id))
      .run()

    const [row] = db.select().from(ingredients).where(eq(ingredients.id, input.id)).all()
    return toIngredient(row)
  })

  ipcMain.handle(IpcChannels.ingredientsDelete, (_event, payload): { id: string } => {
    const { id } = IdInputSchema.parse(payload)
    const db = getDb()

    const usedIn = db
      .select({ name: recipes.name })
      .from(recipeIngredients)
      .innerJoin(recipes, eq(recipeIngredients.recipeId, recipes.id))
      .where(eq(recipeIngredients.ingredientId, id))
      .all()

    if (usedIn.length > 0) {
      const names = [...new Set(usedIn.map((r) => r.name))].join(', ')
      throw new Error(`Não é possível remover: este ingrediente é usado em ${usedIn.length} receita(s) (${names}).`)
    }

    try {
      db.delete(ingredients).where(eq(ingredients.id, id)).run()
    } catch (error) {
      rethrowFriendly(error)
    }
    return { id }
  })
}
