import { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import { BADGES } from '../state/badges'
import { lessonsUpTo, vocabById } from '../content'
import { mastery, masteryLabel, type Mastery } from '../engine/srs'
import { addDays, dayKey } from '../lib/date'
import { normalizeEs, normalizeRu } from '../lib/text'
import { Header, ProgressBar } from '../components/ui'

export function Profile() {
  const [tab, setTab] = useState<'badges' | 'words'>('words')
  const state = useStore()
  const { stats, streak, settings, progress } = state
  const known = useMemo(() => Object.entries(progress).filter(([id, p]) => vocabById.has(id) && p.box >= 2).length, [progress])
  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0

  return (
    <div className="mx-auto max-w-xl pb-28">
      <Header title={settings.name || 'Mi progreso'} />
      <div className="space-y-6 px-4 pt-4">
        <section className="grid grid-cols-2 gap-2.5">
          <Stat value={known} label="Palabras conocidas" />
          <Stat value={stats.sessions} label="Repasos terminados" />
          <Stat value={`${accuracy}%`} label="Precisión total" />
          <Stat value={`${streak.current} / ${streak.best}`} label="Racha actual / mejor" />
        </section>

        <StreakCalendar xpByDay={stats.xpByDay} frozen={streak.frozenDays} />

        <div className="flex gap-1 border-b border-line">
          {([['words', 'Mis palabras'], ['badges', 'Insignias']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-bold ${tab === t ? 'border-brand text-brand' : 'border-transparent text-muted'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'badges' ? (
          <section className="grid grid-cols-3 gap-2.5">
            {BADGES.map((b) => {
              const earned = state.badges[b.id]
              const [cur, target] = b.progress(state)
              return (
                <div key={b.id} className={`card flex flex-col items-center p-3 text-center ${earned ? '!border-gold' : ''}`}>
                  <div className={`text-3xl ${earned ? '' : 'opacity-25 grayscale'}`}>{b.icon}</div>
                  <div className="ru mt-1 text-sm font-bold leading-tight">{b.ru}</div>
                  <div className="mt-0.5 text-[11px] leading-tight text-muted">{b.desc}</div>
                  {!earned && <ProgressBar value={target ? cur / target : 0} color="var(--gold)" className="mt-2 !h-1" />}
                </div>
              )
            })}
          </section>
        ) : (
          <WordBank coveredUpTo={settings.coveredUpTo} />
        )}
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="card p-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  )
}

function StreakCalendar({ xpByDay, frozen }: { xpByDay: Record<string, number>; frozen: string[] }) {
  const today = dayKey()
  // Monday-first grid: 4 full weeks plus the current week (future days left blank).
  const weekday = (new Date().getDay() + 6) % 7
  const start = addDays(today, -weekday - 28)
  const days = Array.from({ length: 35 }, (_, i) => addDays(start, i))
  return (
    <section className="card p-4">
      <div className="label mb-3">Días con repaso · últimas 5 semanas</div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i}>{d}</div>)}
        {days.map((d) => {
          if (d > today) return <div key={d} />
          const practiced = (xpByDay[d] ?? 0) > 0
          const froze = frozen.includes(d)
          return (
            <div key={d} title={d}
              className={`aspect-square rounded-sm ${d === today ? 'ring-2 ring-brand ring-offset-1 ring-offset-card' : ''}`}
              style={{ background: practiced ? 'var(--brick)' : froze ? 'var(--brand-soft)' : 'var(--soft)' }} />
          )
        })}
      </div>
    </section>
  )
}

function WordBank({ coveredUpTo }: { coveredUpTo: string }) {
  const progress = useStore((s) => s.progress)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Mastery | 'all'>('all')
  const words = useMemo(() => lessonsUpTo(coveredUpTo).flatMap((l) => (l.vocab ?? []).map((v) => ({ ...v, lessonId: l.id }))), [coveredUpTo])
  const shown = words.filter((w) => {
    if (filter !== 'all' && mastery(progress[w.id]) !== filter) return false
    if (!q) return true
    return normalizeRu(w.ru).includes(normalizeRu(q)) || normalizeEs(w.es).includes(normalizeEs(q))
  })
  const counts = (m: Mastery) => words.filter((w) => mastery(progress[w.id]) === m).length

  return (
    <section className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en ruso o español…"
        className="w-full rounded-md border-[1.5px] border-line bg-card px-4 py-2.5 outline-none focus:border-brand" />
      <div className="flex flex-wrap gap-1.5">
        <button className={`chip ${filter === 'all' ? 'tile-selected' : ''}`} onClick={() => setFilter('all')}>Todas {words.length}</button>
        {(['dominado', 'conocido', 'aprendiendo', 'nuevo'] as Mastery[]).map((m) => (
          <button key={m} className={`chip ${filter === m ? 'tile-selected' : ''}`} onClick={() => setFilter(m)}>{masteryLabel[m]} {counts(m)}</button>
        ))}
      </div>
      <div className="card divide-y divide-line">
        {shown.slice(0, 300).map((w) => (
          <div key={w.id} className="flex items-baseline gap-3 px-4 py-2">
            <span className="ru text-lg">{w.ru}</span>
            <span className="ml-auto text-right text-sm text-muted">{w.es}</span>
            <span className="w-8 shrink-0 text-right text-[11px] text-muted">{w.lessonId}</span>
          </div>
        ))}
        {shown.length === 0 && <p className="p-4 text-center text-sm text-muted">Sin resultados</p>}
      </div>
    </section>
  )
}
