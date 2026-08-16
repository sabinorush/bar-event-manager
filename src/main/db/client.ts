import { app } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export function getDbPath(): string {
  // Override usado só pelos testes de integração/E2E (Playwright), para
  // cada execução ter um banco isolado num diretório temporário em vez de
  // sujar o banco real de desenvolvimento.
  const dataDir = process.env.BAR_EVENT_MANAGER_DATA_DIR ?? app.getPath('userData')
  return join(dataDir, 'bar-event-manager.db')
}

let sqlite: Database.Database | undefined
let db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function getDb() {
  if (!db) {
    sqlite = new Database(getDbPath())
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    db = drizzle(sqlite, { schema })
  }
  return db
}

export function closeDb(): void {
  sqlite?.close()
  sqlite = undefined
  db = undefined
}
