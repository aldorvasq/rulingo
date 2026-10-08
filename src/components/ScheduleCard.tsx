import { useEffect, useState } from 'react'
import { activeReminders, CLASS_TZ, classesIcs, pendingHomework, upcomingClasses } from '../content/schedule'
import { Icon } from './ui'

const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
const sameZone = (() => {
  const now = new Date()
  const f = (tz: string) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric' }).format(now)
  return f(localTz) === f(CLASS_TZ)
})()

const fmtTime = (d: Date) => d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
const fmtDay = (d: Date) => d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
const mxTime = (d: Date) => d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: CLASS_TZ })

function dayLabel(d: Date, now: Date) {
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((startOf(d) - startOf(now)) / 86_400_000)
  return diff === 0 ? 'Hoy' : diff === 1 ? 'Mañana' : fmtDay(d).replace(/^./, (c) => c.toUpperCase())
}

function countdown(d: Date, now: Date) {
  const mins = Math.round((d.getTime() - now.getTime()) / 60000)
  if (mins <= 0) return 'En clase ahora'
  if (mins < 60) return `Empieza en ${mins} min`
  const h = Math.floor(mins / 60)
  if (h < 24) return `En ${h} h ${mins % 60 ? `${mins % 60} min` : ''}`.trim()
  const days = Math.round(h / 24)
  return `En ${days} día${days > 1 ? 's' : ''}`
}

async function addToCalendar() {
  const file = new File([classesIcs()], 'clases-de-ruso.ics', { type: 'text/calendar' })
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Clases de ruso' }); return } catch { /* fall back to download */ }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Class times (shown in the user's own time zone), homework and reminders. Always visible. */
export function ScheduleCard() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const classes = upcomingClasses(3, now)
  const next = classes[0]
  const homework = pendingHomework(now)
  const reminders = activeReminders(now)
  const live = next && next.start.getTime() <= now.getTime()

  return (
    <section className="rise mt-4 overflow-hidden rounded-xl border-2 border-brick/70 bg-card shadow-sm" style={{ animationDelay: '120ms' }}>
      <div className="flex items-center justify-between bg-brick px-4 py-2.5 text-white">
        <span className="flex items-center gap-2 text-lg font-bold">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          Clases y tareas
        </span>
        <span className="text-xs opacity-85">{sameZone ? 'Hora de Ciudad de México' : 'En tu hora local'}</span>
      </div>

      {next && (
        <div className="flex items-center gap-4 px-4 pt-4">
          {/* Tear-off calendar page */}
          <div className="w-16 shrink-0 overflow-hidden rounded-md border border-line text-center shadow-sm">
            <div className="bg-brick py-0.5 text-[11px] font-bold uppercase text-white">
              {next.start.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '')}
            </div>
            <div className="bg-card py-1 text-3xl font-bold leading-tight">{next.start.getDate()}</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Próxima clase</div>
            <div className="text-xl font-bold leading-tight">{dayLabel(next.start, now)}, {fmtTime(next.start)}</div>
            <span className={`mt-1 inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-bold ${live ? 'bg-ok text-white' : 'bg-brick/10 text-brick'}`}>
              {live && <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-white" />}
              {countdown(next.start, now)}
            </span>
            {!sameZone && <div className="mt-1 text-xs text-muted">{mxTime(next.start)} en Ciudad de México</div>}
          </div>
        </div>
      )}

      {classes.length > 1 && (
        <div className="mt-3 flex gap-2 px-4">
          {classes.slice(1).map((c) => (
            <div key={c.start.toISOString()} className="flex-1 rounded-md bg-soft px-3 py-1.5 text-sm">
              <span className="font-bold">{dayLabel(c.start, now)}</span> · {fmtTime(c.start)}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-line px-4 py-3">
        <div className="mb-1.5 flex items-center gap-2 text-sm font-bold">
          <Icon name="book" size={18} className="text-brick" /> Tareas
        </div>
        {homework.length === 0 ? (
          <p className="text-sm text-muted">No hay tareas pendientes por ahora.</p>
        ) : (
          <ul className="space-y-2">
            {homework.map((h) => (
              <li key={h.title + h.due} className="rounded-md border-l-[3px] border-brick bg-soft px-3 py-2">
                <div className="font-bold">{h.title}</div>
                {h.detail && <div className="text-sm text-ink/80">{h.detail}</div>}
                <div className="mt-0.5 text-xs font-bold text-brick">Para: {dayLabel(h.dueAt, now)}, {fmtTime(h.dueAt)} · {countdown(h.dueAt, now).replace('Empieza en', 'Quedan').replace('En clase ahora', 'Ahora')}</div>
              </li>
            ))}
          </ul>
        )}
        {reminders.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {reminders.map((r) => (
              <li key={r.text} className="flex gap-2 text-sm"><Icon name="star" size={16} className="mt-0.5 shrink-0 text-gold" /> {r.text}</li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={addToCalendar} className="flex w-full items-center justify-center gap-2 border-t border-line py-2.5 text-sm font-bold text-brand hover:bg-soft">
        <Icon name="plus" size={16} /> Agregar las clases a mi calendario
      </button>
    </section>
  )
}
