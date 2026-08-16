import { ipcMain } from 'electron'
import { getDb } from '../db/client'
import { IpcChannels } from '@shared/ipc-contract'
import type { DashboardStats, DailyFinancial } from '@shared/types'
import { loadEvents } from './events'

export function registerDashboardHandlers(): void {
  ipcMain.handle(IpcChannels.dashboardStats, (): DashboardStats => {
    const eventList = loadEvents(getDb())
    const totalRevenue = eventList.reduce((sum, e) => sum + e.totalRevenue, 0)
    const netProfit = eventList.reduce((sum, e) => sum + e.netProfit, 0)
    const avgMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    const eventsCount = eventList.filter((e) => e.status === 'Done').length

    return { totalRevenue, netProfit, avgMargin, eventsCount }
  })

  // Série usada no gráfico "Lucro vs Custos" — um ponto por evento (não há
  // ledger diário no MVP), ordenada por data, últimos 14 eventos.
  ipcMain.handle(IpcChannels.dashboardTimeseries, (): DailyFinancial[] => {
    const eventList = loadEvents(getDb())
    return eventList
      .slice()
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .slice(-14)
      .map((e) => ({ date: e.date, revenue: e.totalRevenue, costs: e.totalCost, profit: e.netProfit }))
  })
}
