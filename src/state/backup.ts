import { dayKey } from '../lib/date'
import { snapshot, useStore, type PersistedState } from './store'

const APP = 'rulingo'

/**
 * Export progress as a JSON file. On phones the share sheet lets the user drop it straight into
 * iCloud Drive / Google Drive / Files; on desktop it downloads.
 */
export async function exportProgress(): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const data = JSON.stringify({ app: APP, version: 1, exportedAt: new Date().toISOString(), state: snapshot() })
  const name = `rulingo-progreso-${dayKey()}.json`
  const file = new File([data], name, { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Progreso РуЛинго' })
      useStore.getState().markBackup()
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'
      // fall through to download
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  useStore.getState().markBackup()
  return 'downloaded'
}

export async function readBackup(file: File): Promise<PersistedState> {
  const parsed = JSON.parse(await file.text())
  if (parsed?.app !== APP || !parsed.state?.settings || !parsed.state?.progress) {
    throw new Error('Este archivo no es un respaldo de РуЛинго.')
  }
  return parsed.state as PersistedState
}
