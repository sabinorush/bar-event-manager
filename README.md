# BarEvent Manager Pro

Gestão de bar para eventos — precificação, receitas e inventário. App desktop
(Windows) feito em Electron, com banco SQLite local.

## Stack

- Electron 43 + React 18 + TypeScript, empacotado com `electron-vite`
- Tailwind CSS v4 + shadcn/ui (Radix primitives)
- Drizzle ORM sobre `better-sqlite3` (banco local, sem servidor)
- Zod para validação de todo input que cruza a fronteira IPC
- Zustand para estado global do renderer
- `electron-updater` + GitHub Releases para auto-update

## Rodando localmente

```bash
npm install
npm run dev
```

O `postinstall` recompila o módulo nativo `better-sqlite3` contra a versão
instalada do Electron (`electron-rebuild`). No Windows isso exige as
**Visual Studio Build Tools** com o workload "Desktop development with C++"
instaladas — sem elas o `npm install` falha nesse passo.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Sobe o app em modo desenvolvimento (hot reload) |
| `npm run typecheck` | Checa tipos (main, web e testes) |
| `npm run test:unit` | Testes unitários (Vitest) |
| `npm run test:integration` | Testes de integração via IPC (Playwright + Electron real) |
| `npm run test:e2e` | Testes end-to-end pela UI (Playwright + Electron real) |
| `npm run test` | Roda as três suítes acima em sequência |
| `npm run dist` | Builda o instalador Windows localmente (sem publicar) |
| `npm run release` | Builda **e publica** uma release no GitHub (requer `GH_TOKEN`) |

## Baixando o app (usuário final)

A versão mais recente fica em
**[github.com/sabinorush/bar-event-manager/releases/latest](https://github.com/sabinorush/bar-event-manager/releases/latest)**
— baixe o `.exe` da seção Assets e rode o instalador.

> **Aviso do Windows SmartScreen:** o instalador ainda não é assinado
> digitalmente, então o Windows pode mostrar "Windows protegeu seu PC" /
> editor desconhecido ao abrir. Clique em **"Mais informações" → "Executar
> assim mesmo"** para prosseguir. Isso é esperado e será resolvido quando o
> app for publicado na Microsoft Store (ver `TODO.md` na raiz do
> repositório).

Depois de instalado, o app se atualiza sozinho (checa updates ao abrir e a
cada 4h) — não é necessário voltar ao GitHub para novas versões.

## Publicando uma nova versão

```bash
npm version patch   # ou minor/major — bump + commit + tag
GH_TOKEN=$(gh auth token) npm run release
gh release edit vX.Y.Z --draft=false   # electron-builder publica como draft por padrão
```