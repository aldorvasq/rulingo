import { useState } from 'react'
import { isIOS, isIOSSafari, isStandalone, promptInstall, useCanPrompt } from '../lib/install'
import { Icon } from './ui'

const DISMISS_KEY = 'rulingo-install-dismissed'

function dismissedRecently(): boolean {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY))
    return Number.isFinite(t) && Date.now() - t < 10 * 86_400_000
  } catch {
    return false
  }
}

/** Step-by-step sheet for iPhone/iPad (no install API there) and other browsers without one. */
export function InstallGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3" onClick={onClose}>
      <div className="card animate-slideup w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold">Agregar «ру» a tu pantalla de inicio</h2>
        {isIOS ? (
          <>
            {!isIOSSafari && <p className="mt-2 text-sm text-muted">Si no ves la opción, abre este enlace en <b>Safari</b>.</p>}
            <ol className="mt-4 space-y-4">
              <Step n={1} icon="share">Toca el botón <b>Compartir</b> {isIOSSafari ? 'en la barra de abajo (o arriba) de Safari' : 'del navegador'}.</Step>
              <Step n={2} icon="plus">Desliza hacia abajo y elige <b>«Agregar a pantalla de inicio»</b>.</Step>
              <Step n={3} icon="check">Toca <b>Agregar</b>. Abre la app desde el ícono «ру.» de ahora en adelante.</Step>
            </ol>
          </>
        ) : (
          <ol className="mt-4 space-y-4">
            <Step n={1} icon="settings">Abre el <b>menú del navegador</b> (⋮ o ⋯).</Step>
            <Step n={2} icon="install">Elige <b>«Instalar app»</b> o <b>«Agregar a la pantalla principal»</b>.</Step>
          </ol>
        )}
        <p className="mt-4 text-sm text-muted">Así «ру» abre como una app y tu progreso queda mejor protegido en el teléfono.</p>
        <button className="btn btn-primary mt-4 w-full" onClick={onClose}>Entendido</button>
      </div>
    </div>
  )
}

function Step({ n, icon, children }: { n: number; icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand-soft font-bold text-brand">{n}</span>
      <span className="flex-1 pt-1">{children}</span>
      <Icon name={icon} size={22} className="mt-1 shrink-0 text-brand" />
    </li>
  )
}

/** One tap: the real install dialog where the browser allows it, otherwise the guide. */
export function useInstallAction() {
  const [guide, setGuide] = useState(false)
  const open = async () => {
    if (!(await promptInstall())) setGuide(true)
  }
  return { open, guide: guide ? <InstallGuide onClose={() => setGuide(false)} /> : null }
}

/** Banner on Home until the app is installed (dismissable for 10 days). */
export function InstallBanner() {
  const canPrompt = useCanPrompt()
  const [hidden, setHidden] = useState(() => isStandalone() || dismissedRecently())
  const { open, guide } = useInstallAction()
  if (hidden) return null
  return (
    <div className="card mt-2 flex items-center gap-3 border-brand/40 bg-brand-soft p-3">
      <Icon name="install" size={24} className="shrink-0 text-brand" />
      <div className="min-w-0 flex-1 text-sm">
        <div className="font-bold">Instala «ру» en tu teléfono</div>
        <div className="text-muted">Abre como app y protege tu progreso.</div>
      </div>
      <button className="btn btn-primary shrink-0 !px-3 !py-2 text-sm" onClick={open}>
        {canPrompt ? 'Instalar' : 'Cómo'}
      </button>
      <button aria-label="Ocultar" className="shrink-0 p-1 text-muted" onClick={() => {
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* ignore */ }
        setHidden(true)
      }}>
        <Icon name="close" size={18} />
      </button>
      {guide}
    </div>
  )
}
