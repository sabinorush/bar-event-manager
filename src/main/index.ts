import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import log from 'electron-log/main'
import { runMigrations } from './db/migrate'
import { registerIpcHandlers } from './ipc'
import { initAutoUpdater } from './updater'

log.initialize()
Object.assign(console, log.functions)

// Runners do GitHub Actions (Windows) são VMs sem GPU real — o processo de
// GPU do Chromium crasha e derruba a janela silenciosamente, travando os
// testes e2e em "Target page, context or browser has been closed". CI=true
// é setado automaticamente pelo Actions; nunca afeta o app instalado pelo usuário.
if (process.env.CI) {
  app.disableHardwareAcceleration()
  app.commandLine.appendSwitch('disable-gpu')
  app.commandLine.appendSwitch('disable-software-rasterizer')
}

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0F172A',
    // Em produção o ícone vem embutido no .exe (electron-builder, win.icon);
    // em dev a janela usa o ícone padrão do Electron a menos que apontemos
    // explicitamente para build/icon.png.
    ...(is.dev ? { icon: join(__dirname, '../../build/icon.png') } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.barevent.manager')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  try {
    runMigrations()
    registerIpcHandlers()
  } catch (error) {
    log.error('Falha ao inicializar o banco de dados', error)
    dialog.showErrorBox(
      'Erro ao abrir o banco de dados',
      'Não foi possível preparar o banco de dados local. O aplicativo será encerrado.\n\n' + String(error)
    )
    app.quit()
    return
  }

  const mainWindow = createWindow()
  if (!is.dev) initAutoUpdater(mainWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
