import { z } from 'zod'

export const IngredientCategorySchema = z.enum(['Spirits', 'Liqueurs', 'Mixers', 'Syrups', 'Fruits', 'Garnish'])
export const RecipeCategorySchema = z.enum(['Classic', 'Signature', 'Premium', 'Mocktail'])

export const IdInputSchema = z.object({ id: z.string().min(1) })

export const IngredientInputSchema = z.object({
  name: z.string().min(1),
  category: IngredientCategorySchema,
  supplier: z.string().min(1),
  costPerBottle: z.number().positive(),
  bottleSize: z.number().positive()
})

export const RecipeIngredientInputSchema = z.object({
  ingredientId: z.string().min(1),
  amount: z.number().positive()
})

export const RecipeInputSchema = z.object({
  name: z.string().min(1),
  category: RecipeCategorySchema,
  glassType: z.string().min(1),
  ingredients: z.array(RecipeIngredientInputSchema).min(1)
})

export const RecipeUpdateSchema = RecipeInputSchema.extend({
  id: z.string().min(1)
})

export const EventScopeSchema = z.object({
  pax: z.number().int().positive(),
  drinksPerPax: z.number().positive(),
  ticketPrice: z.number().nonnegative(),
  staffCost: z.number().nonnegative(),
  iceCost: z.number().nonnegative(),
  transportCost: z.number().nonnegative()
})

export const CocktailMixInputSchema = z.object({
  recipeId: z.string().min(1),
  percentage: z.number().min(0).max(100)
})

export const EventInputSchema = z.object({
  name: z.string().min(1),
  scope: EventScopeSchema,
  mix: z.array(CocktailMixInputSchema).min(1)
})

export const SaveTextFileInputSchema = z.object({
  defaultFileName: z.string().min(1),
  content: z.string(),
  filterName: z.string().min(1),
  filterExtensions: z.array(z.string()).min(1)
})

export const TogglePurchasedInputSchema = z.object({
  eventId: z.string().min(1),
  ingredientId: z.string().min(1),
  purchased: z.boolean()
})

/** Nomes de canal IPC — únicos para main (ipcMain.handle) e preload (ipcRenderer.invoke). */
export const IpcChannels = {
  ingredientsList: 'ingredients:list',
  ingredientsCreate: 'ingredients:create',
  ingredientsDelete: 'ingredients:delete',
  recipesList: 'recipes:list',
  recipesCreate: 'recipes:create',
  recipesUpdate: 'recipes:update',
  recipesDelete: 'recipes:delete',
  eventsList: 'events:list',
  eventsCreate: 'events:create',
  dashboardStats: 'dashboard:stats',
  dashboardTimeseries: 'dashboard:timeseries',
  filesSaveText: 'files:save-text',
  shoppingListForEvent: 'shopping-list:for-event',
  shoppingListTogglePurchased: 'shopping-list:toggle-purchased',
  updaterStatus: 'updater:status',
  updaterInstallNow: 'updater:install-now'
} as const
