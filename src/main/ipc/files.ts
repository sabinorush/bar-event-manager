import { ipcMain, dialog, BrowserWindow } from 'electron'
import { writeFileSync } from 'fs'
import { IpcChannels, SaveTextFileInputSchema } from '@shared/ipc-contract'
import type { SaveTextFileResult } from '@shared/types'

export function registerFileHandlers(): void {
  ipcMain.handle(IpcChannels.filesSaveText, async (event, payload): Promise<SaveTextFileResult> => {
    const input = SaveTextFileInputSchema.parse(payload)
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) throw new Error('Janela não encontrada.')

    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      defaultPath: input.defaultFileName,
      filters: [{ name: input.filterName, extensions: input.filterExtensions }]
    })

    if (canceled || !filePath) {
      return { saved: false }
    }

    // BOM no início do arquivo: Excel em pt-BR só detecta UTF-8 corretamente
    // (acentos) em CSV se o arquivo começar com o Byte Order Mark.
    const BOM = '﻿'
    writeFileSync(filePath, BOM + input.content, 'utf-8')
    return { saved: true, path: filePath }
  })
}
