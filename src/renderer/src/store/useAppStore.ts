import { create } from 'zustand'
import type { CocktailMix, DailyFinancial, DashboardStats, Event, EventScope, Ingredient, Recipe } from '@shared/types'

interface AppState {
  ingredients: Ingredient[]
  recipes: Recipe[]
  events: Event[]
  stats: DashboardStats
  timeseries: DailyFinancial[]
  loaded: boolean
  loadError: string | null

  loadAll: () => Promise<void>
  createIngredient: (input: Omit<Ingredient, 'id'>) => Promise<void>
  deleteIngredient: (id: string) => Promise<void>
  createRecipe: (input: Omit<Recipe, 'id'>) => Promise<void>
  updateRecipe: (input: Recipe) => Promise<void>
  deleteRecipe: (id: string) => Promise<void>
  createEvent: (input: { name: string; scope: EventScope; mix: CocktailMix[] }) => Promise<Event>
}

const emptyStats: DashboardStats = { totalRevenue: 0, netProfit: 0, avgMargin: 0, eventsCount: 0 }

export const useAppStore = create<AppState>((set, get) => ({
  ingredients: [],
  recipes: [],
  events: [],
  stats: emptyStats,
  timeseries: [],
  loaded: false,
  loadError: null,

  loadAll: async () => {
    set({ loadError: null })
    try {
      const [ingredients, recipes, events, stats, timeseries] = await Promise.all([
        window.api.ingredients.list(),
        window.api.recipes.list(),
        window.api.events.list(),
        window.api.dashboard.stats(),
        window.api.dashboard.timeseries()
      ])
      set({ ingredients, recipes, events, stats, timeseries, loaded: true })
    } catch (error) {
      console.error('Falha ao carregar dados do bar', error)
      set({ loadError: error instanceof Error ? error.message : String(error) })
    }
  },

  createIngredient: async (input) => {
    const created = await window.api.ingredients.create(input)
    set({ ingredients: [...get().ingredients, created] })
  },

  deleteIngredient: async (id) => {
    await window.api.ingredients.delete(id)
    set({ ingredients: get().ingredients.filter((i) => i.id !== id) })
  },

  createRecipe: async (input) => {
    const created = await window.api.recipes.create(input)
    set({ recipes: [...get().recipes, created] })
  },

  updateRecipe: async (input) => {
    const updated = await window.api.recipes.update(input)
    set({ recipes: get().recipes.map((r) => (r.id === updated.id ? updated : r)) })
  },

  deleteRecipe: async (id) => {
    await window.api.recipes.delete(id)
    set({ recipes: get().recipes.filter((r) => r.id !== id) })
  },

  createEvent: async (input) => {
    const created = await window.api.events.create(input)
    const [stats, timeseries] = await Promise.all([window.api.dashboard.stats(), window.api.dashboard.timeseries()])
    set({ events: [created, ...get().events], stats, timeseries })
    return created
  }
}))
