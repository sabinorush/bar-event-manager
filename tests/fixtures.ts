import { test as base, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const mainEntry = join(__dirname, '../out/main/index.js')

interface Fixtures {
  electronApp: ElectronApplication
  appWindow: Page
}

/**
 * Sobe o app Electron real (build de produção, não o dev server) com um
 * banco SQLite isolado num diretório temporário — cada teste começa do zero
 * com o seed padrão, sem tocar no banco de desenvolvimento nem em outros
 * testes rodando em paralelo.
 */
export const test = base.extend<Fixtures>({
  // eslint-disable-next-line no-empty-pattern
  electronApp: async ({}, use) => {
    const dataDir = mkdtempSync(join(tmpdir(), 'bar-event-manager-test-'))

    const app = await electron.launch({
      args: [mainEntry],
      env: { ...process.env, BAR_EVENT_MANAGER_DATA_DIR: dataDir }
    })

    await use(app)

    await app.close()
    rmSync(dataDir, { recursive: true, force: true })
  },

  appWindow: async ({ electronApp }, use) => {
    const appWindow = await electronApp.firstWindow()
    // Força o viewport via CDP (Emulation.setDeviceMetricsOverride), independente
    // do tamanho real da janela do SO — em runners de CI a tela/DPI virtual pode
    // ser menor que os 1024px do breakpoint `lg`, o que derruba a nav pro modo
    // mobile (hambúrguer) e trava os testes esperando botões que só existem na
    // nav desktop.
    await appWindow.setViewportSize({ width: 1440, height: 900 })
    // espera o loadAll() do useAppStore resolver e sair da tela de "Carregando..."
    await appWindow.waitForSelector('text=Carregando dados do bar...', { state: 'detached', timeout: 15_000 })
    await use(appWindow)
  }
})

export { expect }
