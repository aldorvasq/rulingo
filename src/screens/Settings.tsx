import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { lessons, compareLessonIds } from '../content'
import { exportProgress, readBackup } from '../state/backup'
import { TRANSLIT_HELP } from '../lib/translit'
import { Header, Icon } from '../components/ui'
import { useInstallAction } from '../components/InstallPrompt'
import { isStandalone } from '../lib/install'

function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-3">
      <div className="flex-1">
        <div className="font-bold">{label}</div>
        {desc && <div className="text-xs text-muted">{desc}</div>}
      </div>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-brand' : 'bg-line'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

export function LessonSelect({ value, onChange, className = '' }: { value: string; onChange: (id: string) => void; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`ru w-full rounded-md border-[1.5px] border-line bg-card px-3 py-3 text-lg outline-none focus:border-brand ${className}`}>
      {lessons.map((l) => <option key={l.id} value={l.id}>{l.id} · {l.title}</option>)}
    </select>
  )
}

export function Settings() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const replaceState = useStore((s) => s.replaceState)
  const resetAll = useStore((s) => s.resetAll)
  const lastBackup = useStore((s) => s.lastBackup)
  const fileInput = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const install = useInstallAction()

  const current = settings.focusLessons[0] ?? settings.coveredUpTo
  const setCurrent = (id: string) => update({
    focusLessons: [id],
    // Moving forward in the book also unlocks everything up to that lesson.
    coveredUpTo: compareLessonIds(id, settings.coveredUpTo) > 0 ? id : settings.coveredUpTo,
  })

  return (
    <div className="mx-auto max-w-xl pb-28">
      <Header title="Ajustes" />
      <div className="space-y-6 px-4 pt-4">
        <section>
          <div className="label mb-2">Dónde vas en el libro</div>
          <div className="card space-y-4 p-4">
            <div>
              <div className="mb-1 font-bold">Lección que estás viendo en clase</div>
              <LessonSelect value={current} onChange={setCurrent} />
            </div>
            <div>
              <div className="mb-1 font-bold">Lecciones vistas hasta</div>
              <div className="mb-2 text-xs text-muted">Todo hasta aquí se desbloquea y entra en el repaso general.</div>
              <LessonSelect value={settings.coveredUpTo} onChange={(id) => update({ coveredUpTo: id })} />
            </div>
          </div>
        </section>

        <section>
          <div className="label mb-2">Repasos</div>
          <div className="card p-4">
            <div className="mb-2 font-bold">Ejercicios por repaso</div>
            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 20].map((n) => (
                <button key={n} onClick={() => update({ sessionLength: n })}
                  className={`tile text-center font-bold ${settings.sessionLength === n ? 'tile-selected' : ''}`}>{n}</button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="label mb-2">Preferencias</div>
          <div className="card divide-y divide-line px-4">
            <label className="block py-3">
              <div className="mb-1 font-bold">Tu nombre</div>
              <input value={settings.name} onChange={(e) => update({ name: e.target.value })}
                className="w-full rounded-md border-[1.5px] border-line bg-card px-3 py-2 outline-none focus:border-brand" />
            </label>
            <Toggle label="Tema oscuro" value={settings.theme === 'dark'} onChange={(v) => update({ theme: v ? 'dark' : 'light' })} />
            <Toggle label="Teclado cirílico en pantalla" desc="Útil si tu teléfono no tiene teclado ruso" value={settings.cyrKeyboard} onChange={(v) => update({ cyrKeyboard: v })} />
            <Toggle label="Transliteración (abc→абв)" desc={TRANSLIT_HELP} value={settings.translit} onChange={(v) => update({ translit: v })} />
          </div>
        </section>

        {!isStandalone() && (
          <section>
            <div className="label mb-2">App</div>
            <div className="card flex items-center gap-3 p-4">
              <Icon name="install" size={24} className="shrink-0 text-brand" />
              <div className="flex-1 text-sm"><div className="font-bold">Instalar en la pantalla de inicio</div><div className="text-muted">Abre como app y protege tu progreso.</div></div>
              <button className="btn btn-primary shrink-0 !px-3 !py-2 text-sm" onClick={install.open}>Instalar</button>
            </div>
            {install.guide}
          </section>
        )}

        <section>
          <div className="label mb-2">Respaldo</div>
          <div className="card space-y-3 p-4">
            <p className="text-sm text-muted">
              Tu progreso se guarda en este dispositivo. Exporta un respaldo y guárdalo en iCloud Drive, Google Drive o donde quieras;
              impórtalo en otro dispositivo para continuar ahí.
              {lastBackup && <> Último respaldo: <b>{lastBackup}</b>.</>}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn btn-primary" onClick={async () => {
                const r = await exportProgress()
                setMsg(r === 'cancelled' ? null : r === 'shared' ? 'Respaldo compartido.' : 'Respaldo descargado.')
              }}>Exportar</button>
              <button className="btn btn-ghost" onClick={() => fileInput.current?.click()}>Importar</button>
            </div>
            <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (!f) return
              try {
                const data = await readBackup(f)
                if (confirm('¿Reemplazar el progreso de este dispositivo con el respaldo?')) {
                  replaceState(data)
                  setMsg('Progreso restaurado.')
                }
              } catch (err) {
                setMsg((err as Error).message)
              }
            }} />
            {msg && <p className="text-sm font-bold">{msg}</p>}
          </div>
        </section>

        <section className="space-y-2 p-2 text-center">
          <button className="text-sm font-bold text-bad" onClick={() => {
            if (confirm('¿Borrar todo tu progreso? Esto no se puede deshacer (exporta un respaldo antes).')) resetAll()
          }}>Borrar progreso</button>
          <p className="text-xs text-muted">Contenido basado en «Точка Ру A1» (Dolmatova, Novacac). Proyecto personal de práctica.</p>
        </section>
      </div>
    </div>
  )
}
