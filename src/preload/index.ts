import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IpcChannels } from '@shared/ipc-contract'
import type {
  CocktailMix,
  DailyFinancial,
  DashboardStats,
  Event,
  EventScope,
  Ingredient,
  Recipe,
  SaveTextFileResult,
  ShoppingListItem,
  UpdaterStatus
} from '@shared/types'

const api = {
  ingredients: {
    list: (): Promise<Ingredient[]> => ipcRenderer.invoke(IpcChannels.ingredientsList),
    create: (input: Omit<Ingredient, 'id'>): Promise<Ingredient> => ipcRenderer.invoke(IpcChannels.ingredientsCreate, input),
    update: (input: Ingredient): Promise<Ingredient> => ipcRenderer.invoke(IpcChannels.ingredientsUpdate, input),
    delete: (id: string): Promise<{ id: string }> => ipcRenderer.invoke(IpcChannels.ingredientsDelete, { id })
  },
  recipes: {
    list: (): Promise<Recipe[]> => ipcRenderer.invoke(IpcChannels.recipesList),
    create: (input: Omit<Recipe, 'id'>): Promise<Recipe> => ipcRenderer.invoke(IpcChannels.recipesCreate, input),
    update: (input: Recipe): Promise<Recipe> => ipcRenderer.invoke(IpcChannels.recipesUpdate, input),
    delete: (id: string): Promise<{ id: string }> => ipcRenderer.invoke(IpcChannels.recipesDelete, { id })
  },
  events: {
    list: (): Promise<Event[]> => ipcRenderer.invoke(IpcChannels.eventsList),
    create: (input: { name: string; scope: EventScope; mix: CocktailMix[] }): Promise<Event> =>
      ipcRenderer.invoke(IpcChannels.eventsCreate, input)
  },
  dashboard: {
    stats: (): Promise<DashboardStats> => ipcRenderer.invoke(IpcChannels.dashboardStats),
    timeseries: (): Promise<DailyFinancial[]> => ipcRenderer.invoke(IpcChannels.dashboardTimeseries)
  },
  files: {
    saveText: (input: {
      defaultFileName: string
      content: string
      filterName: string
      filterExtensions: string[]
    }): Promise<SaveTextFileResult> => ipcRenderer.invoke(IpcChannels.filesSaveText, input)
  },
  shoppingList: {
    forEvent: (eventId: string): Promise<ShoppingListItem[]> => ipcRenderer.invoke(IpcChannels.shoppingListForEvent, { id: eventId }),
    togglePurchased: (input: { eventId: string; ingredientId: string; purchased: boolean }): Promise<ShoppingListItem> =>
      ipcRenderer.invoke(IpcChannels.shoppingListTogglePurchased, input)
  },
  updater: {
    onStatus: (callback: (status: UpdaterStatus) => void): (() => void) => {
      const listener = (_event: IpcRendererEvent, status: UpdaterStatus): void => callback(status)
      ipcRenderer.on(IpcChannels.updaterStatus, listener)
      return () => ipcRenderer.removeListener(IpcChannels.updaterStatus, listener)
    },
    installNow: (): Promise<void> => ipcRenderer.invoke(IpcChannels.updaterInstallNow)
  }
}

export type Api = typeof api

try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error(error)
}
