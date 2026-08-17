import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { UpdaterStatus } from '@shared/types'

const TOAST_ID = 'app-update'

export function UpdateNotifier(): null {
  const downloadedVersion = useRef<string | null>(null)

  useEffect(() => {
    return window.api.updater.onStatus((status: UpdaterStatus) => {
      switch (status.state) {
        case 'downloading':
          toast.loading(`Baixando atualização... ${status.percent}%`, { id: TOAST_ID })
          break
        case 'downloaded':
          downloadedVersion.current = status.version
          toast.success(`Versão ${status.version} pronta para instalar`, {
            id: TOAST_ID,
            duration: Infinity,
            action: {
              label: 'Reiniciar agora',
              onClick: () => window.api.updater.installNow()
            }
          })
          break
        case 'error':
          if (!downloadedVersion.current) toast.dismiss(TOAST_ID)
          break
        default:
          break
      }
    })
  }, [])

  return null
}
