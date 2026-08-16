import { ipcMain } from 'electron'
import { and, eq } from 'drizzle-orm'
import { getDb } from '../db/client'
import { shoppingListItems } from '../db/schema'
import { IdInputSchema, IpcChannels, TogglePurchasedInputSchema } from '@shared/ipc-contract'
import type { ShoppingListItem } from '@shared/types'

function toShoppingListItem(row: typeof shoppingListItems.$inferSelect): ShoppingListItem {
  return {
    ingredientId: row.ingredientId,
    totalMlNeeded: row.totalMlNeeded,
    bottlesNeeded: row.bottlesNeeded,
    totalCost: row.totalCost,
    purchased: row.purchased
  }
}

export function registerShoppingListHandlers(): void {
  ipcMain.handle(IpcChannels.shoppingListForEvent, (_event, payload): ShoppingListItem[] => {
    const { id } = IdInputSchema.parse(payload)
    const db = getDb()
    return db.select().from(shoppingListItems).where(eq(shoppingListItems.eventId, id)).all().map(toShoppingListItem)
  })

  ipcMain.handle(IpcChannels.shoppingListTogglePurchased, (_event, payload): ShoppingListItem => {
    const input = TogglePurchasedInputSchema.parse(payload)
    const db = getDb()

    db.update(shoppingListItems)
      .set({ purchased: input.purchased })
      .where(and(eq(shoppingListItems.eventId, input.eventId), eq(shoppingListItems.ingredientId, input.ingredientId)))
      .run()

    const [row] = db
      .select()
      .from(shoppingListItems)
      .where(and(eq(shoppingListItems.eventId, input.eventId), eq(shoppingListItems.ingredientId, input.ingredientId)))
      .all()

    return toShoppingListItem(row)
  })
}
