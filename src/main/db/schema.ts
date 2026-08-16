import { sql } from 'drizzle-orm'
import { sqliteTable, text, real, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'

const timestamps = {
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),
  updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`)
}

export const ingredients = sqliteTable('ingredients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  supplier: text('supplier').notNull(),
  costPerBottle: real('cost_per_bottle').notNull(),
  bottleSizeMl: real('bottle_size_ml').notNull(),
  ...timestamps
})

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  glassType: text('glass_type').notNull(),
  ...timestamps
})

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  ingredientId: text('ingredient_id')
    .notNull()
    .references(() => ingredients.id, { onDelete: 'restrict' }),
  amountMl: real('amount_ml').notNull()
})

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  eventDate: text('event_date').notNull(),
  status: text('status').notNull().default('Planning'),
  pax: integer('pax').notNull(),
  drinksPerPax: real('drinks_per_pax').notNull(),
  ticketPrice: real('ticket_price').notNull(),
  staffCost: real('staff_cost').notNull().default(0),
  iceCost: real('ice_cost').notNull().default(0),
  transportCost: real('transport_cost').notNull().default(0),
  ...timestamps
})

export const eventCocktailMix = sqliteTable('event_cocktail_mix', {
  id: text('id').primaryKey(),
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  recipeId: text('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'restrict' }),
  percentage: real('percentage').notNull()
})

export const eventFinancialSnapshot = sqliteTable('event_financial_snapshot', {
  eventId: text('event_id')
    .primaryKey()
    .references(() => events.id, { onDelete: 'cascade' }),
  totalRevenue: real('total_revenue').notNull(),
  ingredientCost: real('ingredient_cost').notNull(),
  operationalCost: real('operational_cost').notNull(),
  totalCost: real('total_cost').notNull(),
  netProfit: real('net_profit').notNull(),
  margin: real('margin').notNull(),
  computedAt: text('computed_at').notNull().default(sql`(current_timestamp)`)
})

export const shoppingListItems = sqliteTable(
  'shopping_list_items',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    ingredientId: text('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'restrict' }),
    totalMlNeeded: real('total_ml_needed').notNull(),
    bottlesNeeded: integer('bottles_needed').notNull(),
    totalCost: real('total_cost').notNull(),
    purchased: integer('purchased', { mode: 'boolean' }).notNull().default(false)
  },
  (table) => [uniqueIndex('shopping_list_event_ingredient_idx').on(table.eventId, table.ingredientId)]
)

export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
})
