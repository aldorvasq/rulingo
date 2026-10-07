import { useMemo } from 'react'
import { useStore } from '../state/store'
import { lessonById, colorFor, lessonsUpTo } from '../content'
import { topicTitle } from './Settings'
import { candidatesFor } from '../engine/generate'
import type { Skill } from '../engine/types'
import { dayKey, daysBetween } from '../lib/date'
import { navigate } from '../lib/router'
import { ttsAvailable } from '../lib/tts'
import { ProgressBar } from '../components/ui'

const DRILLS: { skill: Skill; icon: string; label: string }[] = [
  { skill: 'vocab', icon: '🗂️', label: 'Vocabulario' },
  { skill: 'antonym', icon: '↔️', label: 'Antónimos' },
  { skill: 'conjugation', icon: '🔁', label: 'Conjugación' },
  { skill: 'grammar', icon: '🧩', label: 'Gramática' },
  { skill: 'writing', icon: '✍️', label: 'Escritura' },
  { skill: 'listening', icon: '👂', label: 'Escucha' },
  { skill: 'syntax', icon: '🧱', label: 'Ordenar frases' },
  { skill: 'reading', icon: '📖', label: 'Lectura' },
]

export function StatusBar() {
  const streak = useStore((s) => s.streak)
  const xpToday = useStore((s) => s.stats.xpByDay[dayKey()] ?? 0)
  const goal = useStore((s) => s.settings.dailyGoal)
  const done = streak.lastGoalDay === dayKey()
  return (
    <div className="flex items-center gap-4 text-lg font-extrabold">
      <span className={done ? 'text-coral' : 'text-muted'} title="Racha">
        <span className={done ? '' : 'grayscale'}>🔥</span> {streak.current}
      </span>
      {streak.freezes > 0 && <span className="text-[#38bdf8]" title="Protectores de racha">🧊 {streak.freezes}</span>}
      <span className="text-gold" title="XP de hoy">⭐ {xpToday}/{goal}</span>
    </div>
  )
}

export function Home() {
  const settings = useStore((s) => s.settings)
  const stats = useStore((s) => s.stats)
  const progress = useStore((s) => s.progress)
  const lastBackup = useStore((s) => s.lastBackup)
  const today = dayKey()
  const xpToday = stats.xpByDay[today] ?? 0
  const dailyDone = stats.dailyDone.includes(today)
  const focus = settings.focusLessons.map((id) => lessonById.get(id)).filter((l) => !!l)
  const main = focus[0]
  const color = colorFor(main?.chapter ?? 0)

  const weakCount = useMemo(() => Object.values(progress).filter((p) => p.wrong > 0 && p.box <= 1).length, [progress])
  const dueCount = useMemo(() => Object.values(progress).filter((p) => p.due <= today).length, [progress, today])
  const availableSkills = useMemo(() => {
    const ids = lessonsUpTo(settings.coveredUpTo).map((l) => l.id)
    const skills = new Set(ids.flatMap(candidatesFor).map((c) => c.skill))
    return DRILLS.filter((d) => skills.has(d.skill) && (d.skill !== 'listening' || (ttsAvailable() && settings.listening)))
  }, [settings.coveredUpTo, settings.listening])

  const needsBackup = stats.sessions >= 3 && (!lastBackup || daysBetween(lastBackup, today) >= 7)

  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 pb-28 pt-4">
      <div className="pt-safe flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">
          <span className="ru">Приве́т</span>{settings.name ? `, ${settings.name}` : ''}! 👋
        </h1>
      </div>
      <StatusBar />

      {/* Daily lesson */}
      <section className="overflow-hidden rounded-3xl" style={{ background: color.bg, color: color.fg }}>
        <div className="p-5">
          <div className="text-xs font-extrabold uppercase tracking-widest opacity-80">Esta semana en clase</div>
          {main ? (
            <>
              <div className="ru mt-1 text-2xl font-extrabold">{main.id} · {main.title}</div>
              {main.titleEs && <div className="font-semibold opacity-90">{main.titleEs}</div>}
              {focus.length > 1 && <div className="mt-1 text-sm opacity-90">+ {focus.slice(1).map((l) => l.id).join(', ')}</div>}
            </>
          ) : (
            <div className="mt-1 text-xl font-extrabold">Elige tu lección actual en Ajustes</div>
          )}
          {settings.focusTopics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {settings.focusTopics.filter((id) => topicTitle(id)).map((id) => (
                <span key={id} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">{topicTitle(id)}</span>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center gap-3">
            <button className="btn flex-1 bg-white !text-[#1f2a2e]" style={{ ['--shadow' as string]: 'rgba(0,0,0,.25)' }}
              onClick={() => navigate('/play?mode=daily')}>
              {dailyDone ? '↺ Otra ronda' : '▶ Lección diaria'}
            </button>
            {dailyDone && <span className="text-sm font-extrabold">✓ Hecha hoy</span>}
          </div>
        </div>
        <button className="block w-full bg-black/10 px-5 py-2 text-left text-sm font-bold" onClick={() => navigate('/settings')}>
          Cambiar lección o temas de la semana →
        </button>
      </section>

      {/* Daily goal */}
      <section className="card p-4">
        <div className="mb-2 flex justify-between text-sm font-extrabold">
          <span>Meta diaria</span>
          <span className="text-gold">{Math.min(xpToday, settings.dailyGoal)} / {settings.dailyGoal} XP</span>
        </div>
        <ProgressBar value={xpToday / settings.dailyGoal} color="var(--gold)" />
      </section>

      {/* Review */}
      <section className="grid grid-cols-2 gap-3">
        <button className="card p-4 text-left active:translate-y-px" onClick={() => navigate('/play?mode=weak')}>
          <div className="text-3xl">🎯</div>
          <div className="mt-1 font-extrabold">Puntos débiles</div>
          <div className="text-sm font-semibold text-muted">{weakCount ? `${weakCount} por reforzar` : 'Nada pendiente'}</div>
        </button>
        <button className="card p-4 text-left active:translate-y-px" onClick={() => main && navigate(`/lesson/${main.id}`)}>
          <div className="text-3xl">📘</div>
          <div className="mt-1 font-extrabold">Gramática de la semana</div>
          <div className="text-sm font-semibold text-muted">{dueCount ? `${dueCount} repasos hoy` : 'Reglas y vocabulario'}</div>
        </button>
      </section>

      {/* Quick drills */}
      <section>
        <h2 className="mb-2 text-lg font-extrabold">Práctica rápida</h2>
        <div className="grid grid-cols-4 gap-2">
          {availableSkills.map((d) => (
            <button key={d.skill} className="card flex flex-col items-center gap-1 px-1 py-3 active:translate-y-px"
              onClick={() => navigate(`/play?mode=drill&skill=${d.skill}`)}>
              <span className="text-2xl">{d.icon}</span>
              <span className="text-center text-[11px] font-extrabold leading-tight">{d.label}</span>
            </button>
          ))}
        </div>
      </section>

      {needsBackup && (
        <button className="card flex w-full items-center gap-3 border-gold p-4 text-left" onClick={() => navigate('/settings')}>
          <span className="text-3xl">☁️</span>
          <span className="text-sm font-bold">Guarda un respaldo de tu progreso en iCloud o Google Drive →</span>
        </button>
      )}
    </div>
  )
}
