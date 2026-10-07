import { badgeById } from '../state/badges'
import type { SessionSummary } from '../state/store'
import { useStore } from '../state/store'
import { navigate } from '../lib/router'
import { Confetti } from '../components/ui'

export function Results({ summary, bestCombo }: { summary: SessionSummary; bestCombo: number }) {
  const goal = useStore((s) => s.settings.dailyGoal)
  const accuracy = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0
  const title = summary.perfect ? '¡Lección perfecta!' : accuracy >= 80 ? '¡Lección completada!' : '¡Buen esfuerzo!'

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col items-center px-6 py-10 text-center">
      {(summary.perfect || summary.newBadges.length > 0 || summary.streakIncreased) && <Confetti />}
      <div className="animate-pop mb-2 text-7xl">{summary.perfect ? '🏆' : accuracy >= 80 ? '🎉' : '💪'}</div>
      <h1 className="mb-6 text-3xl font-extrabold text-gold">{title}</h1>

      <div className="mb-6 grid w-full grid-cols-3 gap-3">
        <Stat label="XP" value={`+${summary.xp}`} color="var(--gold)" />
        <Stat label="Precisión" value={`${accuracy}%`} color="var(--ok)" />
        <Stat label="Mejor racha" value={`${bestCombo}`} color="var(--coral)" />
      </div>

      {summary.streakIncreased && (
        <div className="card animate-pop mb-4 flex w-full items-center gap-4 p-4 text-left">
          <span className="animate-flame text-5xl">🔥</span>
          <div>
            <div className="text-2xl font-extrabold text-coral">{summary.streak} {summary.streak === 1 ? 'día' : 'días'} de racha</div>
            <div className="text-sm font-semibold text-muted">¡Cumpliste tu meta diaria de {goal} XP!</div>
          </div>
        </div>
      )}

      {summary.newBadges.map((id) => {
        const b = badgeById.get(id)
        if (!b) return null
        return (
          <div key={id} className="card animate-pop mb-3 flex w-full items-center gap-4 border-gold p-4 text-left">
            <span className="text-5xl">{b.icon}</span>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wide text-gold">¡Nueva insignia!</div>
              <div className="ru text-xl font-extrabold">{b.ru}</div>
              <div className="text-sm font-semibold text-muted">{b.es} — {b.desc}</div>
            </div>
          </div>
        )
      })}

      <div className="mt-auto w-full space-y-3 pt-6">
        <button className="btn btn-primary w-full" onClick={() => navigate('/', true)}>Continuar</button>
        {!summary.perfect && (
          <button className="btn btn-ghost w-full" onClick={() => navigate('/play?mode=weak', true)}>Practicar puntos débiles</button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2" style={{ borderColor: color }}>
      <div className="py-1 text-xs font-extrabold uppercase text-white" style={{ background: color }}>{label}</div>
      <div className="py-3 text-2xl font-extrabold" style={{ color }}>{value}</div>
    </div>
  )
}
