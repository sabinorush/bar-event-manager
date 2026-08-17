import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  // Cada teste sobe uma instância inteira do Electron + SQLite real — evitar
  // paralelismo agressivo para não sobrecarregar a máquina/flakiness.
  workers: 2,
  fullyParallel: true,
  // 1 retry só no CI: cache frio do binário do Electron pode gerar corrida
  // entre os 2 workers no primeiro launch em paralelo ("Process failed to
  // launch!"). Local a máquina já tem o binário em cache, então não precisa.
  retries: process.env.CI ? 1 : 0,
  reporter: 'list'
})
