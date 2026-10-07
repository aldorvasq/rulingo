import { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import { BADGES } from '../state/badges'
import { lessonsUpTo, vocabById } from '../content'
import { mastery, masteryLabel, type Mastery } from '../engine/srs'
import { addDays, dayKey } from '../lib/date'
import { normalizeEs, normalizeRu } from '../lib/text'
import { speak } from '../lib/tts'
import { ProgressBar } from '../components/ui'

export function Profile() {
  const [tab, setTab] = useState<'badges' | 'words'>('badges')
  const state = useStore()
  const { stats, streak, settings, progress } = state
  const known = useMemo(() => Object.entries(progress).filter(([id, p]) => vocabById.has(id) && p.box >= 2).length, [progress])
  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0

  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 pb-28 pt-4">
      <div className="pt-safe flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-3xl font-extrabold text-white">
          {(settings.name || 'Я').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">{settings.name || 'Estudiante'}</h1>
          <p className="text-sm font-semibold text-muted">Точка Ру A1 · lección {settings.coveredUpTo}</p>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <Stat icon="🔥" value={streak.current} label={`Racha (mejor: ${streak.best})`} />
        <Stat icon="⭐" value={stats.xpTotal} label="XP total" />
        <Stat icon="📚" value={known} label="Palabras conocidas" />
        <Stat icon="🎯" value={`${accuracy}%`} label={`Precisión · ${stats.sessions} lecciones`} />
      </section>

      <StreakCalendar xpByDay={stats.xpByDay} goal={settings.dailyGoal} frozen={streak.frozenDays} />

      <div className="flex gap-2">
        <button className={`chip ${tab === 'badges' ? 'tile-selected' : ''}`} onClick={() => setTab('badges')}>🏅 Insignias</button>
        <button className={`chip ${tab === 'words' ? 'tile-selected' : ''}`} onClick={() => setTab('words')}>📖 Mis palabras</button>
      </div>

      {tab === 'badges' ? (
        <section className="grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const earned = state.badges[b.id]
            const [cur, target] = b.progress(state)
            return (
              <div key={b.id} className={`card flex flex-col items-center p-3 text-center ${earned ? 'border-gold' : ''}`}>
                <div className={`text-4xl ${earned ? '' : 'opacity-30 grayscale'}`}>{b.icon}</div>
                <div className="ru mt-1 text-xs font-extrabold leading-tight">{b.ru}</div>
                <div className="mt-0.5 text-[10px] font-semibold leading-tight text-muted">{b.desc}</div>
                {!earned && <ProgressBar value={target ? cur / target : 0} color="var(--gold)" className="mt-2 !h-1.5" />}
              </div>
            )
          })}
        </section>
      ) : (
        <WordBank />
      )}
    </div>
  )
}

function Stat({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="card flex items-center gap-3 p-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <div className="text-xl font-extrabold">{value}</div>
        <div className="text-xs font-semibold text-muted">{label}</div>
      </div>
    </div>
  )
}

function StreakCalendar({ xpByDay, goal, frozen }: { xpByDay: Record<string, number>; goal: number; frozen: string[] }) {
  const today = dayKey()
  // Monday-first grid: 4 full weeks plus the current week (future days left blank).
  const weekday = (new Date().getDay() + 6) % 7
  const start = addDays(today, -weekday - 28)
  const days = Array.from({ length: 35 }, (_, i) => addDays(start, i))
  return (
    <section className="card p-4">
      <h2 className="mb-2 text-sm font-extrabold">Últimas 5 semanas</h2>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-muted">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i}>{d}</div>)}
        {days.map((d) => {
          if (d > today) return <div key={d} />
          const xp = xpByDay[d] ?? 0
          const met = xp >= goal
          return (
            <div key={d} title={`${d}: ${xp} XP`}
              className={`grid aspect-square place-items-center rounded-md text-xs ${d === today ? 'ring-2 ring-brand' : ''}`}
              style={{ background: met ? 'var(--coral)' : xp > 0 ? 'color-mix(in srgb, var(--coral) 35%, var(--card))' : frozen.includes(d) ? '#bae6fd' : 'var(--soft)' }}>
              {met ? '🔥' : frozen.includes(d) ? '🧊' : ''}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function WordBank() {
  const progress = useStore((s) => s.progress)
  const coveredUpTo = useStore((s) => s.settings.coveredUpTo)
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
        className="w-full rounded-2xl border-2 border-line bg-card px-4 py-2 font-semibold outline-none focus:border-brand" />
      <div className="flex flex-wrap gap-2 text-xs">
        <button className={`chip ${filter === 'all' ? 'tile-selected' : ''}`} onClick={() => setFilter('all')}>Todas {words.length}</button>
        {(['dominado', 'conocido', 'aprendiendo', 'nuevo'] as Mastery[]).map((m) => (
          <button key={m} className={`chip ${filter === m ? 'tile-selected' : ''}`} onClick={() => setFilter(m)}>{masteryLabel[m]} {counts(m)}</button>
        ))}
      </div>
      <div className="card divide-y-2 divide-line">
        {shown.slice(0, 300).map((w) => (
          <button key={w.id} onClick={() => speak(w.ru)} className="flex w-full items-center gap-3 px-3 py-2 text-left">
            <span className="ru font-bold">{w.ru}</span>
            <span className="ml-auto text-right text-sm text-muted">{w.es}</span>
            <span className="w-8 text-right text-[10px] font-bold text-muted">{w.lessonId}</span>
          </button>
        ))}
        {shown.length === 0 && <p className="p-4 text-center text-sm text-muted">Sin resultados</p>}
      </div>
    </section>
  )
}
