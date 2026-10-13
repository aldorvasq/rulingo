import { lessonsUpTo } from '../content'
import { candidatesFor } from '../engine/generate'
import { SKILL_TOPICS } from '../engine/topics'
import type { Skill } from '../engine/types'
import { hasListening } from '../lib/audio'
import { addDays, dayKey } from '../lib/date'
import type { PersistedState } from './store'

// Weakness analysis. Progress here means measured accuracy on first attempts (a hinted answer is an
// attempt but not a success) — never how many exercises were completed.

/** Fewer answers than this in the window and a skill's accuracy isn't trusted yet. */
export const MIN_ANSWERS = 12
/** A goal is met when recent accuracy holds at this level over enough answers. */
export const GOAL_ACCURACY = 0.85
export const GOAL_MIN_ANSWERS = 30

export interface SkillWindow { attempts: number; correct: number; pct: number | null }
export interface SkillStatus {
  skill: Skill
  title: string
  last30: SkillWindow
  prev30: SkillWindow
  /** Change in accuracy (percentage points) from the previous 30 days, when both are known. */
  trend: number | null
}

type Log = PersistedState['stats']['skillLog']

export function windowOf(log: Log, skill: Skill, from: string, to: string): SkillWindow {
  let attempts = 0, correct = 0
  for (const [day, bySkill] of Object.entries(log)) {
    if (day < from || day > to) continue
    const e = bySkill[skill]
    if (e) { attempts += e[0]; correct += e[1] }
  }
  return { attempts, correct, pct: attempts ? correct / attempts : null }
}

/** Skills that actually have exercises in the lessons covered so far. */
export function availableSkills(coveredUpTo: string): Skill[] {
  const set = new Set<Skill>()
  for (const l of lessonsUpTo(coveredUpTo)) for (const c of candidatesFor(l.id)) {
    if (c.skill === 'listening' && !hasListening(c.items[1])) continue
    set.add(c.skill)
  }
  return (Object.keys(SKILL_TOPICS) as Skill[]).filter((s) => set.has(s))
}

export function skillReport(s: PersistedState): SkillStatus[] {
  const today = dayKey()
  const log = s.stats.skillLog ?? {}
  return availableSkills(s.settings.coveredUpTo).map((skill) => {
    const last30 = windowOf(log, skill, addDays(today, -29), today)
    const prev30 = windowOf(log, skill, addDays(today, -59), addDays(today, -30))
    const known = (w: SkillWindow) => w.attempts >= MIN_ANSWERS && w.pct !== null
    return { skill, title: SKILL_TOPICS[skill].title, last30, prev30,
      trend: known(last30) && known(prev30) ? Math.round((last30.pct! - prev30.pct!) * 100) : null }
  })
}

/** The weakest measured skill (lowest accuracy over the last 30 days with enough answers). */
export function weakestSkill(report: SkillStatus[], except?: Skill | null): SkillStatus | null {
  const measured = report.filter((r) => r.skill !== except && r.last30.attempts >= MIN_ANSWERS)
  if (!measured.length) return null
  return measured.sort((a, b) => a.last30.pct! - b.last30.pct! || a.last30.attempts - b.last30.attempts)[0]
}

/** Skills with exercises available but too few answers to judge — worth trying, not "weak". */
export const unmeasured = (report: SkillStatus[]) => report.filter((r) => r.last30.attempts < MIN_ANSWERS)

export interface GoalProgress {
  skill: Skill
  title: string
  /** Accuracy in the 30 days before the goal was set (null if there wasn't enough data). */
  before: number | null
  /** Accuracy over the last 14 days. */
  now: SkillWindow
  met: boolean
}

export function goalProgress(s: PersistedState): GoalProgress | null {
  const { goal, goalSince } = s.settings
  if (!goal || !goalSince) return null
  const log = s.stats.skillLog ?? {}
  const today = dayKey()
  const beforeW = windowOf(log, goal, addDays(goalSince, -30), addDays(goalSince, -1))
  // Only answers since the goal was set count toward it.
  const from = [addDays(today, -13), goalSince].sort().at(-1)!
  const now = windowOf(log, goal, from, today)
  return {
    skill: goal, title: SKILL_TOPICS[goal].title,
    before: beforeW.attempts >= MIN_ANSWERS ? beforeW.pct : null,
    now,
    met: now.attempts >= GOAL_MIN_ANSWERS && (now.pct ?? 0) >= GOAL_ACCURACY,
  }
}

export const pctText = (p: number | null) => (p === null ? '—' : `${Math.round(p * 100)}%`)
