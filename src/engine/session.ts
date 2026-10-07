import { lessonsUpTo, lessonById } from '../content'
import { ttsAvailable } from '../lib/tts'
import { shuffle } from '../lib/text'
import { candidatesFor } from './generate'
import type { ItemState } from './srs'
import type { Candidate, RunExercise, Skill } from './types'

export type SessionMode =
  | { mode: 'daily' }
  | { mode: 'lesson'; lessonId: string }
  | { mode: 'weak' }
  | { mode: 'drill'; skill: Skill }

export interface SessionContext {
  progress: Record<string, ItemState>
  focusLessons: string[]
  focusTopics: string[]
  coveredUpTo: string
  length: number
  listening: boolean
  today: string
}

function desiredLevel(c: Candidate, progress: Record<string, ItemState>): number {
  const boxes = c.items.map((i) => progress[i]?.box).filter((b): b is number => b !== undefined)
  if (!boxes.length) return 1
  const avg = boxes.reduce((a, b) => a + b, 0) / boxes.length
  return avg < 1 ? 1 : avg < 3 ? 2 : 3
}

function score(c: Candidate, ctx: SessionContext, weights: { due?: number; weak?: number; fresh?: number } = {}): number {
  let s = Math.random() * 2
  const diff = Math.abs(desiredLevel(c, ctx.progress) - c.level)
  s += diff === 0 ? 3 : diff === 1 ? 1 : -2
  const states = c.items.map((i) => ctx.progress[i])
  if (states.some((st) => st && st.due <= ctx.today)) s += weights.due ?? 2
  if (states.some((st) => st && st.wrong > st.right)) s += weights.weak ?? 2
  if (c.items.length && states.every((st) => !st)) s += weights.fresh ?? 1.5
  if (c.handmade) s += 1
  // Weekly topics only boost this week's lessons: grammar ids strongly, "skill:x" topics mildly.
  if (ctx.focusLessons.includes(c.lessonId)) {
    if (ctx.focusTopics.some((t) => c.items.includes(t))) s += 3
    else if (ctx.focusTopics.includes(`skill:${c.skill}`)) s += 1.5
  }
  return s
}

/** Session-wide caps so one exercise type can't take over a lesson. */
function caps(n: number) {
  return {
    kind: { match: 2, sort: n >= 20 ? 2 : 1, error_spot: 2 } as Record<string, number>,
    skill: { reading: 3, listening: 3 } as Record<string, number>,
    other: Math.max(2, Math.ceil(n * 0.4)),
  }
}

class Picker {
  used = new Set<string>()
  kinds = new Map<string, number>()
  skills = new Map<string, number>()
  limits: ReturnType<typeof caps>
  constructor(private ctx: SessionContext, n: number) {
    this.limits = caps(n)
  }

  private allowed(c: Candidate) {
    const k = this.kinds.get(c.kind) ?? 0
    const sk = this.skills.get(c.skill) ?? 0
    return k < (this.limits.kind[c.kind] ?? this.limits.other) && sk < (this.limits.skill[c.skill] ?? this.limits.other)
  }

  tags = new Map<string, number>()

  /** items[0] is the exercise's own subject (word, exercise id); the rest are shared tags. */
  private blocked(c: Candidate) {
    if (this.used.has(c.id) || (c.items[0] && this.used.has(c.items[0]))) return true
    return c.items.slice(1).some((t) => (this.tags.get(t) ?? 0) >= 3)
  }

  private take(c: Candidate) {
    this.used.add(c.id)
    if (c.items[0]) this.used.add(c.items[0])
    c.items.slice(1).forEach((t) => this.tags.set(t, (this.tags.get(t) ?? 0) + 1))
    this.kinds.set(c.kind, (this.kinds.get(c.kind) ?? 0) + 1)
    this.skills.set(c.skill, (this.skills.get(c.skill) ?? 0) + 1)
  }

  /** Greedy pick by score, avoiding repeated items and respecting caps; relaxes caps if short. */
  pick(cands: Candidate[], n: number, weights?: Parameters<typeof score>[2]): Candidate[] {
    if (n <= 0) return []
    const scored = cands.map((c) => ({ c, s: score(c, this.ctx, weights) })).sort((a, b) => b.s - a.s)
    const out: Candidate[] = []
    for (const { c } of scored) {
      if (out.length >= n) break
      if (this.blocked(c) || !this.allowed(c)) continue
      out.push(c)
      this.take(c)
    }
    for (const { c } of scored) {
      if (out.length >= n) break
      if (this.used.has(c.id)) continue
      out.push(c)
      this.take(c)
    }
    return out
  }

  /** Mix: about a third production (typing, conjugation, ordering), the rest by score. */
  mixed(cands: Candidate[], n: number, weights?: Parameters<typeof score>[2]): Candidate[] {
    const prod = this.pick(cands.filter((c) => c.level >= 2), Math.round(n * 0.35), weights)
    return [...prod, ...this.pick(cands, n - prod.length, weights)]
  }
}

/** Easier items first, then avoid the same exercise kind twice in a row. */
function order(list: RunExercise[], levels: Map<string, number>): RunExercise[] {
  const sorted = [...list].sort((a, b) => (levels.get(a.key) ?? 2) - (levels.get(b.key) ?? 2) + (Math.random() - 0.5) * 1.5)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].kind === sorted[i - 1].kind) {
      const j = sorted.findIndex((x, k) => k > i && x.kind !== sorted[i].kind)
      if (j > 0) [sorted[i], sorted[j]] = [sorted[j], sorted[i]]
    }
  }
  return sorted
}

export function buildSession(mode: SessionMode, ctx: SessionContext): RunExercise[] {
  const covered = lessonsUpTo(ctx.coveredUpTo).map((l) => l.id)
  const usable = (c: Candidate) => (ctx.listening && ttsAvailable()) || c.skill !== 'listening'
  const pool = (ids: string[]) => ids.flatMap(candidatesFor).filter(usable)
  const n = ctx.length
  const p = new Picker(ctx, n)
  let chosen: Candidate[] = []

  if (mode.mode === 'daily') {
    const focus = ctx.focusLessons.filter((id) => lessonById.has(id))
    const focusIds = focus.length ? focus : covered.slice(-1)
    const reviewIds = covered.filter((id) => !focusIds.includes(id))
    // Sneak-ins come from the chapter(s) being studied now.
    const chaptersNow = new Set(focusIds.map((id) => lessonById.get(id)!.chapter))
    const sneakIds = covered.filter((id) => chaptersNow.has(lessonById.get(id)!.chapter))
    const sneaks = pool(sneakIds).filter((c) => c.sneak && c.level === 1)
    const nSneak = sneaks.length ? (Math.random() < 0.5 ? 1 : 2) : 0
    const nReview = reviewIds.length ? Math.round(n * 0.3) : 0
    const review = p.mixed(pool(reviewIds).filter((c) => !c.sneak), nReview, { due: 4, weak: 3, fresh: -1 })
    const sneak = p.pick(sneaks, nSneak)
    const main = p.mixed(pool(focusIds).filter((c) => !c.sneak), n - review.length - sneak.length)
    chosen = [...main, ...review, ...sneak]
  } else if (mode.mode === 'lesson') {
    const all = pool([mode.lessonId])
    const sneak = p.pick(all.filter((c) => c.sneak && c.level === 1), 1)
    chosen = [...p.mixed(all.filter((c) => !c.sneak), n - sneak.length), ...sneak]
  } else if (mode.mode === 'weak') {
    const weak = pool(covered).filter((c) => !c.sneak && c.items.some((i) => {
      const st = ctx.progress[i]
      return st && (st.wrong > 0 || st.box <= 1)
    }))
    chosen = p.pick(weak, n, { weak: 6, due: 3, fresh: -5 })
  } else {
    const ofSkill = pool(covered).filter((c) => !c.sneak && c.skill === mode.skill)
    // Drills ignore the per-type caps; weight the current lessons so they feel relevant.
    p.limits = { kind: {}, skill: {}, other: n }
    const focus = ofSkill.filter((c) => ctx.focusLessons.includes(c.lessonId))
    const half = p.pick(focus, Math.ceil(n / 2))
    chosen = [...half, ...p.pick(ofSkill, n - half.length)]
  }

  const levels = new Map<string, number>()
  const exercises = shuffle(chosen).map((c) => {
    const ex = c.make()
    levels.set(ex.key, c.level)
    return ex
  })
  return order(exercises, levels)
}
