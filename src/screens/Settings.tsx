import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { lessons, lessonById, grammarById, compareLessonIds } from '../content'
import { exportProgress, readBackup } from '../state/backup'
import { hasRussianVoice, speak } from '../lib/tts'
import { TRANSLIT_HELP } from '../lib/translit'
import { Header } from '../components/ui'

export const SKILL_TOPICS = [
  { id: 'skill:antonym', title: '↔️ Antónimos' },
  { id: 'skill:conjugation', title: '🔁 Conjugación' },
  { id: 'skill:writing', title: '✍️ Escritura' },
  { id: 'skill:listening', title: '👂 Escucha' },
  { id: 'skill:vocab', title: '🗂️ Vocabulario' },
]

export const topicTitle = (id: string) =>
  SKILL_TOPICS.find((t) => t.id === id)?.title ?? grammarById.get(id)?.title

function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-3">
      <div className="flex-1">
        <div className="font-bold">{label}</div>
        {desc && <div className="text-xs font-semibold text-muted">{desc}</div>}
      </div>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}
        className={`relative h-7 w-12 rounded-full transition-colors ${value ? 'bg-brand' : 'bg-line'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </label>
  )
}

export function LessonSelect({ value, onChange, className = '' }: { value: string; onChange: (id: string) => void; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`ru w-full rounded-2xl border-2 border-line bg-card px-3 py-3 font-bold outline-none focus:border-brand ${className}`}>
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

  const focus = settings.focusLessons[0] ?? settings.coveredUpTo
  const focusGrammar = [
    ...settings.focusLessons.flatMap((id) => lessonById.get(id)?.grammar ?? []).map((g) => ({ id: g.id, title: g.title })),
    ...SKILL_TOPICS,
  ]

  const setFocus = (id: string) => {
    update({
      focusLessons: [id],
      focusTopics: [],
      // Moving the weekly focus forward also unlocks everything up to it.
      coveredUpTo: compareLessonIds(id, settings.coveredUpTo) > 0 ? id : settings.coveredUpTo,
    })
  }

  const toggleTopic = (id: string) => {
    const has = settings.focusTopics.includes(id)
    update({ focusTopics: has ? settings.focusTopics.filter((t) => t !== id) : [...settings.focusTopics, id] })
  }

  return (
    <div className="mx-auto max-w-xl pb-28">
      <Header title="Ajustes" />
      <div className="space-y-5 px-4 pt-4">
        <section className="card space-y-3 p-4">
          <h2 className="text-lg font-extrabold">📅 Esta semana en clase</h2>
          <LessonSelect value={focus} onChange={setFocus} />
          {focusGrammar.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-bold text-muted">Temas que vimos (opcional, se practican más):</div>
              <div className="flex flex-wrap gap-2">
                {focusGrammar.map((g) => (
                  <button key={g.id} onClick={() => toggleTopic(g.id)}
                    className={`chip text-left text-xs ${settings.focusTopics.includes(g.id) ? 'tile-selected' : ''}`}>
                    {settings.focusTopics.includes(g.id) ? '✓ ' : ''}{g.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="mb-1 text-sm font-bold text-muted">Lecciones vistas hasta (se repasan y desbloquean):</div>
            <LessonSelect value={settings.coveredUpTo} onChange={(id) => update({ coveredUpTo: id })} />
          </div>
        </section>

        <section className="card space-y-3 p-4">
          <h2 className="text-lg font-extrabold">🎯 Meta y lecciones</h2>
          <div>
            <div className="mb-2 text-sm font-bold text-muted">Meta diaria de XP</div>
            <div className="grid grid-cols-4 gap-2">
              {[[10, 'Relajada'], [30, 'Normal'], [50, 'Seria'], [100, 'Intensa']].map(([xp, label]) => (
                <button key={xp} onClick={() => update({ dailyGoal: xp as number })}
                  className={`tile !px-1 text-center ${settings.dailyGoal === xp ? 'tile-selected' : ''}`}>
                  <div className="font-extrabold">{xp}</div><div className="text-[10px] text-muted">{label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-bold text-muted">Ejercicios por lección</div>
            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 20].map((n) => (
                <button key={n} onClick={() => update({ sessionLength: n })}
                  className={`tile text-center font-extrabold ${settings.sessionLength === n ? 'tile-selected' : ''}`}>{n}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="card divide-y-2 divide-line px-4">
          <label className="block py-3">
            <div className="mb-1 font-bold">Tu nombre</div>
            <input value={settings.name} onChange={(e) => update({ name: e.target.value })}
              className="w-full rounded-xl border-2 border-line bg-card px-3 py-2 font-semibold outline-none focus:border-brand" />
          </label>
          <Toggle label="Sonidos y audio automático" value={settings.sound} onChange={(v) => update({ sound: v })} />
          <Toggle label="Ejercicios de escucha" desc={hasRussianVoice() ? 'Voz rusa disponible ✓' : 'Tu dispositivo no tiene voz rusa; instálala en los ajustes del sistema.'}
            value={settings.listening} onChange={(v) => update({ listening: v })} />
          <Toggle label="Teclado cirílico en pantalla" desc="Útil si tu teléfono no tiene teclado ruso" value={settings.cyrKeyboard} onChange={(v) => update({ cyrKeyboard: v })} />
          <Toggle label="Transliteración (abc→абв)" desc={TRANSLIT_HELP} value={settings.translit} onChange={(v) => update({ translit: v })} />
          <button className="py-3 text-left font-bold text-brand" onClick={() => speak('Приве́т! Как дела́?')}>🔊 Probar voz</button>
        </section>

        <section className="card space-y-3 p-4">
          <h2 className="text-lg font-extrabold">☁️ Respaldo</h2>
          <p className="text-sm font-semibold text-muted">
            Tu progreso se guarda en este dispositivo. Exporta un respaldo y guárdalo en iCloud Drive, Google Drive o donde quieras;
            impórtalo en otro dispositivo para continuar ahí.
            {lastBackup && <> Último respaldo: <b>{lastBackup}</b>.</>}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-primary" onClick={async () => {
              const r = await exportProgress()
              setMsg(r === 'cancelled' ? null : r === 'shared' ? '✓ Respaldo compartido' : '✓ Respaldo descargado')
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
                setMsg('✓ Progreso restaurado')
              }
            } catch (err) {
              setMsg('✗ ' + (err as Error).message)
            }
          }} />
          {msg && <p className="text-sm font-bold">{msg}</p>}
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
