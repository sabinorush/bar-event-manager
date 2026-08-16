import { app } from 'electron'
import { existsSync, copyFileSync } from 'fs'
import { join } from 'path'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { getDb, getDbPath } from './client'
import { seed } from './seed'

function migrationsFolder(): string {
  // Em dev, __dirname aponta para out/main (build do electron-vite), duas
  // pastas acima fica a raiz do projeto. Em produção (Fase 5), electron-builder
  // precisa copiar src/main/db/migrations via extraResources e este caminho
  // passa a apontar para process.resourcesPath.
  if (app.isPackaged) {
    return join(process.resourcesPath, 'migrations')
  }
  return join(__dirname, '../../src/main/db/migrations')
}

/** Aplica migrations pendentes, fazendo backup do banco existente antes. */
export function runMigrations(): void {
  const dbPath = getDbPath()
  const dbExisted = existsSync(dbPath)

  if (dbExisted) {
    const backupPath = `${dbPath}.bak-${app.getVersion()}`
    if (!existsSync(backupPath)) {
      copyFileSync(dbPath, backupPath)
    }
  }

  const db = getDb()

  try {
    migrate(db, { migrationsFolder: migrationsFolder() })
  } catch (error) {
    if (dbExisted) {
      const backupPath = `${dbPath}.bak-${app.getVersion()}`
      copyFileSync(backupPath, dbPath)
    }
    throw error
  }

  if (!dbExisted) {
    seed(db)
  }
}
