import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  // Cada teste sobe uma instância inteira do Electron + SQLite real — evitar
  // paralelismo agressivo para não sobrecarregar a máquina/flakiness.
  workers: 2,
  fullyParallel: true,
  retries: 0,
  reporter: 'list'
})
