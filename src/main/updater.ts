import { BrowserWindow, ipcMain } from 'electron'
// electron-updater é CJS puro — o Node não detecta `autoUpdater` como named
// export via ESM interop, precisa importar o pacote inteiro e desestruturar.
import electronUpdater from 'electron-updater'
import log from 'electron-log/main'
import { IpcChannels } from '@shared/ipc-contract'
import type { UpdaterStatus } from '@shared/types'

const { autoUpdater } = electronUpdater

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000

autoUpdater.logger = log
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = false

function broadcast(window: BrowserWindow, status: UpdaterStatus): void {
  if (window.isDestroyed()) return
  window.webContents.send(IpcChannels.updaterStatus, status)
}

function checkForUpdates(): void {
  autoUpdater.checkForUpdates().catch((error) => log.error('Falha ao checar atualização', error))
}

/**
 * Só deve ser chamada em produção (app empacotado): sem `app-update.yml`
 * (gerado pelo electron-builder no publish), o electron-updater falha a
 * checagem em dev.
 */
export function initAutoUpdater(window: BrowserWindow): void {
  autoUpdater.on('checking-for-update', () => broadcast(window, { state: 'checking' }))
  autoUpdater.on('update-available', (info) => broadcast(window, { state: 'available', version: info.version }))
  autoUpdater.on('update-not-available', () => broadcast(window, { state: 'not-available' }))
  autoUpdater.on('download-progress', (progress) =>
    broadcast(window, { state: 'downloading', percent: Math.round(progress.percent) })
  )
  autoUpdater.on('update-downloaded', (info) => broadcast(window, { state: 'downloaded', version: info.version }))
  autoUpdater.on('error', (error) => {
    log.error('Falha ao verificar/baixar atualização', error)
    broadcast(window, { state: 'error', message: error.message })
  })

  ipcMain.handle(IpcChannels.updaterInstallNow, () => {
    autoUpdater.quitAndInstall()
  })

  checkForUpdates()
  setInterval(checkForUpdates, CHECK_INTERVAL_MS)
}
