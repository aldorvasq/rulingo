import { badgeById } from '../state/badges'
import type { SessionSummary } from '../state/store'
import type { SessionMode } from '../engine/session'
import { navigate } from '../lib/router'
import { Confetti, Icon } from '../components/ui'

export function Results({ summary, mode, bestCombo }: { summary: SessionSummary; mode: SessionMode; bestCombo: number }) {
  const accuracy = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0
  const title = summary.perfect ? 'Repaso perfecto' : accuracy >= 80 ? 'Repaso terminado' : 'Buen trabajo, sigue practicando'
  const again = 'lessonId' in mode
    ? `/play?mode=${mode.mode}&id=${mode.lessonId}${mode.mode === 'topic' ? `&topic=${encodeURIComponent(mode.topic)}` : ''}`
    : `/play?mode=${mode.mode}`

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col px-6 py-10">
      {(summary.perfect || summary.newBadges.length > 0) && <Confetti />}
      <div className="label">Resultado</div>
      <h1 className="mt-1 mb-6 text-3xl font-bold">{title}</h1>

      <div className="mb-6 grid grid-cols-3 gap-2.5">
        <Stat label="Aciertos" value={`${summary.correct}/${summary.total}`} />
        <Stat label="Precisión" value={`${accuracy}%`} />
        <Stat label="XP" value={`+${summary.xp}`} />
      </div>
      {bestCombo >= 5 && <p className="mb-4 text-sm text-muted">Mejor serie: {bestCombo} respuestas correctas seguidas.</p>}

      {summary.streakIncreased && (
        <div className="card mb-3 flex items-center gap-3 p-4">
          <Icon name="flame" size={28} className="text-brick" />
          <div>
            <div className="text-lg font-bold">Racha: {summary.streak} {summary.streak === 1 ? 'día' : 'días'}</div>
            <div className="text-sm text-muted">Hoy ya cuenta para tu racha.</div>
          </div>
        </div>
      )}

      {summary.newBadges.map((id) => {
        const b = badgeById.get(id)
        if (!b) return null
        return (
          <div key={id} className="card animate-pop mb-3 flex items-center gap-4 border-gold p-4">
            <span className="text-4xl">{b.icon}</span>
            <div>
              <div className="label !text-gold">Nueva insignia</div>
              <div className="ru text-xl font-bold">{b.ru}</div>
              <div className="text-sm text-muted">{b.es} — {b.desc}</div>
            </div>
          </div>
        )
      })}

      <div className="mt-auto space-y-2.5 pt-6">
        <button className="btn btn-primary w-full" onClick={() => navigate('/', true)}>Volver al inicio</button>
        <button className="btn btn-ghost w-full" onClick={() => navigate(again, true)}>Repasar otra vez</button>
        {!summary.perfect && (
          <button className="btn btn-ghost w-full" onClick={() => navigate('/play?mode=weak', true)}>Practicar mis errores</button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-3 py-3">
      <div className="label">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}
