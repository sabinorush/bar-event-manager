import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {
    // Sem externalizeDepsPlugin aqui de propósito: a BrowserWindow usa
    // sandbox: true, e um preload sandboxed só pode `require()` módulos
    // built-in do Node/Electron — pacotes do node_modules (ex.: zod, usado
    // por @shared/ipc-contract) precisam estar empacotados no próprio
    // preload.js, não externalizados.
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    },
    build: {
      rollupOptions: {
        output: {
          // Preload sandboxed só suporta CommonJS (mesmo com "type": "module"
          // no package.json, o loader interno do Electron não entende ESM
          // aqui) — força saída .cjs em vez do .mjs padrão do projeto.
          format: 'cjs',
          entryFileNames: '[name].cjs'
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
