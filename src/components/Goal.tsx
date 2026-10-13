import { useMemo } from 'react'
import { useStore } from '../state/store'
import { GOAL_ACCURACY, GOAL_MIN_ANSWERS, goalProgress, MIN_ANSWERS, pctText, skillReport, weakestSkill } from '../state/skills'
import type { Skill } from '../engine/types'
import { dayKey } from '../lib/date'
import { navigate } from '../lib/router'

const practise = (skill: Skill) => navigate(`/play?mode=skill&skill=${skill}`)

/** Accuracy bar with a tick at the goal level. */
function AccuracyBar({ pct, className = '' }: { pct: number | null; className?: string }) {
  const v = pct ?? 0
  const color = pct === null ? 'var(--line)' : v >= GOAL_ACCURACY ? 'var(--ok)' : v >= 0.65 ? 'var(--gold)' : 'var(--brick)'
  return (
    <div className={`relative h-1.5 flex-1 overflow-hidden rounded-sm bg-line ${className}`}>
      <div className="h-full" style={{ width: `${v * 100}%`, background: color }} />
      <div className="absolute inset-y-0 w-0.5 bg-ink/40" style={{ left: `${GOAL_ACCURACY * 100}%` }} />
    </div>
  )
}

/**
 * One quiet strip under "Continúa": the weakest skill (measured by first-attempt accuracy over 30 days)
 * as a suggestion, or the chosen goal with its real accuracy now vs. before. Never a completion count.
 */
export function GoalStrip() {
  const state = useStore()
  const updateSettings = useStore((s) => s.updateSettings)
  const report = useMemo(() => skillReport(state), [state.stats.skillLog, state.settings.coveredUpTo]) // eslint-disable-line react-hooks/exhaustive-deps
  const gp = goalProgress(state)
  const setGoal = (skill: Skill | null) => updateSettings({ goal: skill, goalSince: skill ? dayKey() : null })

  if (gp) {
    const next = weakestSkill(report, gp.skill)
    return (
      <div className="border-t border-brand/20 px-5 py-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-bold">🎯 {gp.met ? '¡Meta cumplida!' : 'Tu meta'}: {gp.title}</span>
          <button className="text-xs font-bold text-muted underline" onClick={() => setGoal(null)}>Quitar</button>
        </div>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <AccuracyBar pct={gp.now.attempts >= MIN_ANSWERS ? gp.now.pct : null} />
          <span className="tabular-nums">{gp.now.attempts >= MIN_ANSWERS ? pctText(gp.now.pct) : '—'} <span className="text-muted">/ {Math.round(GOAL_ACCURACY * 100)}%</span></span>
        </div>
        <p className="mt-1.5 text-xs leading-snug text-muted">
          {gp.now.attempts < MIN_ANSWERS
            ? `Aciertos al primer intento desde que fijaste la meta: aún pocas respuestas (${gp.now.attempts}).`
            : `Aciertos al primer intento, últimos 14 días (${gp.now.attempts} respuestas)${gp.before !== null ? ` · antes de la meta: ${pctText(gp.before)}` : ''}.`}
          {!gp.met && ` Se cumple al mantener ${Math.round(GOAL_ACCURACY * 100)}% en al menos ${GOAL_MIN_ANSWERS} respuestas.`}
        </p>
        {gp.met ? (
          next && <button className="btn btn-ghost mt-3 w-full" onClick={() => setGoal(next.skill)}>Siguiente meta: {next.title} ({pctText(next.last30.pct)})</button>
        ) : (
          <button className="btn btn-ghost mt-3 w-full" onClick={() => practise(gp.skill)}>Reforzar {gp.title.toLowerCase()} · 15 ejercicios</button>
        )}
      </div>
    )
  }

  const weak = weakestSkill(report)
  if (!weak) {
    return (
      <p className="border-t border-brand/20 px-5 py-3 text-xs text-muted">
        🎯 Cuando respondas más ejercicios, aquí aparecerá tu punto más débil para que lo refuerces.
      </p>
    )
  }
  return (
    <div className="border-t border-brand/20 px-5 py-4">
      <div className="font-bold">🎯 Tu punto más débil: {weak.title}</div>
      <div className="mt-2 flex items-center gap-3 text-sm">
        <AccuracyBar pct={weak.last30.pct} />
        <span className="tabular-nums">{pctText(weak.last30.pct)}</span>
      </div>
      <p className="mt-1.5 text-xs text-muted">Aciertos al primer intento en los últimos 30 días ({weak.last30.attempts} respuestas).</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="btn btn-primary !px-3" onClick={() => setGoal(weak.skill)}>Hacerla mi meta</button>
        <button className="btn btn-ghost !px-3" onClick={() => practise(weak.skill)}>Practicar ahora</button>
      </div>
    </div>
  )
}

/** Progress screen: every skill's real accuracy, its trend, and a way to pick any of them as the goal. */
export function SkillsCard() {
  const state = useStore()
  const updateSettings = useStore((s) => s.updateSettings)
  const report = useMemo(() => skillReport(state), [state.stats.skillLog, state.settings.coveredUpTo]) // eslint-disable-line react-hooks/exhaustive-deps
  const weak = weakestSkill(report)
  const goal = state.settings.goal
  return (
    <section className="card p-4">
      <div className="mb-1 font-bold">Tus habilidades</div>
      <p className="mb-3 text-xs text-muted">Aciertos al primer intento en los últimos 30 días (una respuesta con pista no cuenta como acierto). La rayita marca {Math.round(GOAL_ACCURACY * 100)}%.</p>
      <ul className="space-y-3">
        {[...report].sort((a, b) => (a.last30.pct ?? 2) - (b.last30.pct ?? 2)).map((r) => (
          <li key={r.skill}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-bold">
                {r.title}
                {r.skill === goal && <span className="ml-1.5 rounded-sm bg-brand/10 px-1 text-[11px] text-brand">🎯 meta</span>}
                {r.skill === weak?.skill && r.skill !== goal && <span className="ml-1.5 rounded-sm bg-brick/10 px-1 text-[11px] text-brick">más débil</span>}
              </span>
              <span className="tabular-nums text-muted">
                {r.last30.attempts >= MIN_ANSWERS ? pctText(r.last30.pct) : `pocas respuestas (${r.last30.attempts})`}
                {r.trend !== null && <span className={r.trend >= 0 ? 'text-ok' : 'text-bad'}> {r.trend >= 0 ? '▲' : '▼'}{Math.abs(r.trend)}</span>}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <AccuracyBar pct={r.last30.attempts >= MIN_ANSWERS ? r.last30.pct : null} />
              {r.skill !== goal && (
                <button className="text-[11px] font-bold text-brand" onClick={() => updateSettings({ goal: r.skill, goalSince: dayKey() })}>Hacer meta</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
