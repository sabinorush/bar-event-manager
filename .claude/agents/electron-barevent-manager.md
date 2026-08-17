---

name: electron-barevent-manager

description: Especialista em Electron, React e Drizzle/SQLite. Use quando o trabalho envolver o bar-event-manager, incluindo IPC main/renderer, cálculo de custo/margem de eventos, receitas, inventário e o mecanismo de auto-update.

model: sonnet

tools: [Read, Write, Edit, Bash, Glob, Grep]

---

## Stack
- Electron 43 (main / preload / renderer), empacotado com `electron-vite` + `electron-builder`
- React 18 + TypeScript, Tailwind CSS v4 + shadcn/ui (Radix primitives), tema escuro fixo, UI toda em pt-BR, moeda BRL
- Drizzle ORM sobre `better-sqlite3` — banco SQLite local, sem servidor, sem schema de auth
- Zod para validar todo payload que atravessa IPC
- Zustand para estado global do renderer
- Vitest (unit) + Playwright (integração via IPC e e2e via UI, ambos sobem Electron real)
- `electron-updater` + GitHub Releases (`sabinorush/bar-event-manager`) para auto-update
- Sem ESLint/Prettier configurado — não introduzir sem alinhar antes

## Estrutura de pastas
- `src/main/ipc/*` — um arquivo por domínio (`ingredients.ts`, `recipes.ts`, `events.ts`, `dashboard.ts`, `shopping-list.ts`, `files.ts`), cada um com `registerXHandlers()` chamado em `src/main/ipc/index.ts`
- `src/main/db/*` — `client.ts` (conexão), `schema.ts` (Drizzle), `migrate.ts`, `seed.ts`/`seed-data.ts`
- `src/main/updater.ts` — wrapper do `electron-updater`, só ativo em produção (`!is.dev`)
- `src/preload/index.ts` — `contextBridge.exposeInMainWorld('api', ...)`; `sandbox: true` + `contextIsolation: true` + `nodeIntegration: false` no `BrowserWindow` (não afrouxar)
- `src/renderer/src/` — `components/` (telas e widgets), `components/ui/` (shadcn, não editar padrões visuais sem necessidade), `store/useAppStore.ts` (zustand), `lib/` (helpers puros de UI: csv, format)
- `src/shared/` — código compartilhado main/renderer: `types.ts`, `ipc-contract.ts` (canais IPC + schemas Zod, única fonte de verdade dos nomes de canal), `domain/*` (lógica de negócio pura: `cost.ts`, `margin.ts`, `shopping-list.ts`)
- `tests/integration/*.spec.ts` — testes Playwright contra os handlers IPC, Electron real com banco SQLite temporário (`tests/fixtures.ts`)
- `tests/e2e/*.spec.ts` — testes Playwright pela UI

## Convenções

- **Lógica de cálculo financeiro (custo, margem, lista de compras) só em `src/shared/domain/*`.** Já foi refatorado uma vez por estar duplicado em componentes — não repetir esse erro.
- **Todo canal IPC precisa de schema Zod em `ipc-contract.ts` e `.parse(payload)` no handler antes de qualquer uso.** Nunca confiar em input do renderer sem validar, mesmo com TypeScript nos tipos do `preload`.
- **Toda função nova em `src/shared/domain/*` ou `src/renderer/src/lib/*` precisa de teste unitário Vitest** (`*.test.ts` co-localizado no mesmo diretório — ver `csv.test.ts`, `margin.test.ts`, `cost.test.ts` como referência de estilo: `describe`/`it`, casos de borda, dados pt-BR realistas).
- **Todo handler IPC novo ou alterado em `src/main/ipc/*` precisa de teste de integração** em `tests/integration/*.spec.ts`.
- **Todo fluxo de usuário novo ou alterado (nova tela, novo botão, novo modal) precisa de teste e2e** em `tests/e2e/*.spec.ts`.
- Antes de considerar uma mudança pronta: `npm run typecheck` + a suíte de teste relevante (unit/integration/e2e) precisam passar.
- **Commits**: mensagens em português, modo imperativo, começando pelo verbo da ação — sem prefixo `feat:`/`fix:`/`chore:` (não é o padrão deste repo). Exemplos reais do `git log`:
  - `Atualiza electron para 43.4.0 por segurança`
  - `Corrige crash no boot: import ESM de electron-updater`
  - `Implementa auto-update via electron-updater + GitHub Releases`
  - `Neutraliza formula injection na exportação de CSV`
  Corpo do commit (quando necessário) explica o *porquê*, não o *o quê* — o diff já mostra o quê.
- Logs no main process: `electron-log` via `log.error/warn/info` (já injetado globalmente em `console` no `index.ts`) — nunca `console.log` solto pensando em produção.
- Módulo nativo (`better-sqlite3`) precisa recompilar após trocar a versão do Electron: `npx electron-rebuild -f -w better-sqlite3` (exige Visual Studio Build Tools com workload C++ no Windows).
- `electron.vite.config.ts`: o `preload` **não** usa `externalizeDepsPlugin` (sandbox só entende CommonJS/`require`, então deps como `zod` precisam ir bundladas no `.cjs`) — `main` e `renderer` usam. Isso é intencional, não "corrigir".
- Pacotes CJS puros (ex.: `electron-updater`) não expõem named exports via ESM interop — importar o módulo inteiro (`import pkg from 'x'; const { y } = pkg`), não `import { y } from 'x'`.
