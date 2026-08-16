import { registerIngredientHandlers } from './ingredients'
import { registerRecipeHandlers } from './recipes'
import { registerEventHandlers } from './events'
import { registerDashboardHandlers } from './dashboard'
import { registerFileHandlers } from './files'
import { registerShoppingListHandlers } from './shopping-list'

export function registerIpcHandlers(): void {
  registerIngredientHandlers()
  registerRecipeHandlers()
  registerEventHandlers()
  registerDashboardHandlers()
  registerFileHandlers()
  registerShoppingListHandlers()
}
