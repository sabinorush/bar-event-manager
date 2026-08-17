export type IngredientCategory = 'Spirits' | 'Liqueurs' | 'Mixers' | 'Syrups' | 'Fruits' | 'Garnish'

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  supplier: string
  costPerBottle: number
  bottleSize: number // ml
}

export type RecipeCategory = 'Classic' | 'Signature' | 'Premium' | 'Mocktail'

export interface RecipeIngredient {
  ingredientId: string
  amount: number // ml
}

export interface Recipe {
  id: string
  name: string
  category: RecipeCategory
  glassType: string
  ingredients: RecipeIngredient[]
}

export type EventStatus = 'Planning' | 'Done' | 'Cancelled'

export interface EventCocktailMixEntry {
  recipeId: string
  recipeName: string
  percentage: number
}

/**
 * Registro histórico de evento exibido no Dashboard (escopo + resultado
 * financeiro já apurado). Corresponde ao join de `events` +
 * `event_financial_snapshot` + `event_cocktail_mix` no banco (ver PLANO_DE_ACAO.md).
 */
export interface Event {
  id: string
  name: string
  date: string
  status: EventStatus
  pax: number
  drinksPerPax: number
  ticketPrice: number
  totalRevenue: number
  ingredientCost: number
  operationalCost: number
  totalCost: number
  netProfit: number
  margin: number
  cocktailMix: EventCocktailMixEntry[]
}

export interface CocktailMix {
  recipeId: string
  percentage: number
}

export interface EventScope {
  pax: number
  drinksPerPax: number
  ticketPrice: number
  staffCost: number
  iceCost: number
  transportCost: number
}

export interface DailyFinancial {
  date: string
  revenue: number
  costs: number
  profit: number
}

export interface DashboardStats {
  totalRevenue: number
  netProfit: number
  avgMargin: number
  eventsCount: number
}

export interface SaveTextFileResult {
  saved: boolean
  path?: string
}

/** Item da lista de compras de um evento, já persistido no banco (congelado no momento da criação do evento). */
export interface ShoppingListItem {
  ingredientId: string
  totalMlNeeded: number
  bottlesNeeded: number
  totalCost: number
  purchased: boolean
}

/** Estado do ciclo de vida de uma checagem de atualização (electron-updater), enviado do main pro renderer. */
export type UpdaterStatus =
  | { state: 'checking' }
  | { state: 'available'; version: string }
  | { state: 'not-available' }
  | { state: 'downloading'; percent: number }
  | { state: 'downloaded'; version: string }
  | { state: 'error'; message: string }
