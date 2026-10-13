import { lessonsUpTo, lessonById } from '../content'
import { shuffle } from '../lib/text'
import { candidatesFor } from './generate'
import type { ItemState } from './srs'
import { lessonTopics, topicMatches } from './topics'
import { hasListening } from '../lib/audio'
import type { Candidate, RunExercise, Skill } from './types'

export type SessionMode =
  | { mode: 'lesson'; lessonId: string }
  | { mode: 'topic'; lessonId: string; topic: string }
  | { mode: 'review' }
  | { mode: 'weak' }
  | { mode: 'daily' }
  | { mode: 'listening' }
  | { mode: 'cursive' }
  | { mode: 'skill'; skill: Skill }

export interface SessionContext {
  progress: Record<string, ItemState>
  /** The lesson the learner is on in class. */
  focusLessons: string[]
  coveredUpTo: string
  length: number
  today: string
  /** The learner's goal skill: mixed sessions give it about a third of the exercises. */
  goal?: Skill | null
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
  return s
}

/** Session-wide caps so one exercise type can't take over a lesson. */
function caps(n: number) {
  return {
    kind: { match: 2, sort: n >= 20 ? 2 : 1, error_spot: 2 } as Record<string, number>,
    skill: { reading: 3 } as Record<string, number>,
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

/** Share a session evenly across chapters, so a general review covers everything seen so far
 *  (otherwise whatever was practised most recently dominates through due/weak scores). */
function acrossChapters(p: Picker, cands: Candidate[], n: number, weights?: Parameters<typeof score>[2], mix = true): Candidate[] {
  const byChapter = new Map<number, Candidate[]>()
  for (const c of cands) {
    const ch = lessonById.get(c.lessonId)?.chapter ?? 0
    byChapter.set(ch, [...(byChapter.get(ch) ?? []), c])
  }
  const groups = shuffle([...byChapter.values()])
  if (groups.length <= 1) return mix ? p.mixed(cands, n, weights) : p.pick(cands, n, weights)
  const out: Candidate[] = []
  groups.forEach((g, i) => {
    const share = Math.floor(n / groups.length) + (i < n % groups.length ? 1 : 0)
    out.push(...(mix ? p.mixed(g, share, weights) : p.pick(g, share, weights)))
  })
  return out.length < n ? [...out, ...p.pick(cands, n - out.length, weights)] : out
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
  // Listening questions only when their recording exists.
  const pool = (ids: string[]) => ids.flatMap(candidatesFor).filter((c) => c.skill !== 'listening' || hasListening(c.items[1]))
  const n = ctx.length
  const p = new Picker(ctx, n)
  let chosen: Candidate[] = []

  if (mode.mode === 'lesson') {
    // Take turns across the lesson's topics so the review covers everything Home says it will.
    const all = pool([mode.lessonId])
    const sneak = p.pick(all.filter((c) => c.sneak && c.level === 1), 1)
    const main = all.filter((c) => !c.sneak)
    const buckets = shuffle(lessonTopics(mode.lessonId)).map((t) => main.filter((c) => topicMatches(c, t.id)))
    const target = n - sneak.length
    const picked: Candidate[] = []
    for (let round = 0; round < 4 && picked.length < target; round++) {
      for (const b of buckets) {
        if (picked.length >= target) break
        picked.push(...p.pick(b, 1))
      }
    }
    chosen = [...picked, ...p.mixed(main, target - picked.length), ...sneak]
  } else if (mode.mode === 'topic') {
    // A single topic may legitimately be all one exercise type, so per-type caps don't apply.
    p.limits = { kind: {}, skill: {}, other: n }
    const all = pool([mode.lessonId]).filter((c) => !c.sneak && topicMatches(c, mode.topic))
    chosen = p.mixed(all, n)
  } else if (mode.mode === 'review') {
    // Spaced repetition across everything covered so far: due and shaky items first.
    chosen = acrossChapters(p, pool(covered).filter((c) => !c.sneak), n, { due: 6, weak: 4, fresh: -2 })
  } else if (mode.mode === 'listening') {
    p.limits = { kind: {}, skill: {}, other: n }
    // A third from the lesson in class, the rest spread over every chapter covered.
    const all = pool(covered).filter((c) => c.skill === 'listening')
    const focus = p.pick(all.filter((c) => ctx.focusLessons.includes(c.lessonId)), Math.ceil(n / 3))
    chosen = [...focus, ...acrossChapters(p, all, n - focus.length, undefined, false)]
  } else if (mode.mode === 'cursive') {
    // Handwriting practice: words from the current lesson and earlier ones, letters, and notes.
    p.limits = { kind: {}, skill: {}, other: n }
    const all = pool(covered).filter((c) => c.skill === 'cursive')
    const near = (cs: Candidate[]) => { const f = cs.filter((c) => ctx.focusLessons.includes(c.lessonId)); return f.length ? f : cs }
    // Always a mix: letters, a few notes, the same word in three hands, then single words.
    const letters = p.pick(near(all.filter((c) => c.kind === 'match')), 1)
    const notes = acrossChapters(p, all.filter((c) => c.items[1]?.startsWith('note-')), 3, undefined, false)
    const three = acrossChapters(p, all.filter((c) => c.id.endsWith(':three')), 3, undefined, false)
    const rest = n - letters.length - notes.length - three.length
    const third = p.pick(near(all.filter((c) => c.kind !== 'match')), Math.ceil(rest / 4))
    chosen = [...letters, ...notes, ...three, ...third, ...acrossChapters(p, all, rest - third.length, undefined, false)]
  } else if (mode.mode === 'skill') {
    // Strengthen one skill across everything covered, shaky and due items first.
    p.limits = { kind: {}, skill: {}, other: n }
    chosen = acrossChapters(p, pool(covered).filter((c) => c.skill === mode.skill && !c.sneak), n, { weak: 5, due: 3, fresh: 0.5 })
  } else if (mode.mode === 'weak') {
    const weak = pool(covered).filter((c) => !c.sneak && c.items.some((i) => {
      const st = ctx.progress[i]
      return st && (st.wrong > 0 || st.box <= 1)
    }))
    chosen = p.pick(weak, n, { weak: 6, due: 3, fresh: -5 })
  } else {
    // Daily mix (optional, keeps the streak): mostly the current lesson, some review, a sneak-in.
    const focus = ctx.focusLessons.filter((id) => lessonById.has(id))
    const focusIds = focus.length ? focus : covered.slice(-1)
    const reviewIds = covered.filter((id) => !focusIds.includes(id))
    const chaptersNow = new Set(focusIds.map((id) => lessonById.get(id)!.chapter))
    const sneakIds = covered.filter((id) => chaptersNow.has(lessonById.get(id)!.chapter))
    const sneaks = pool(sneakIds).filter((c) => c.sneak && c.level === 1)
    const nSneak = sneaks.length ? (Math.random() < 0.5 ? 1 : 2) : 0
    const nReview = reviewIds.length ? Math.round(n * 0.3) : 0
    const review = p.mixed(pool(reviewIds).filter((c) => !c.sneak), nReview, { due: 4, weak: 3, fresh: -1 })
    const sneak = p.pick(sneaks, nSneak)
    const main = p.mixed(pool(focusIds).filter((c) => !c.sneak), n - review.length - sneak.length)
    chosen = [...main, ...review, ...sneak]
  }

  // The goal skill gets about a third of mixed sessions (not all of it: everything else still matters).
  if (ctx.goal && (mode.mode === 'lesson' || mode.mode === 'review' || mode.mode === 'daily')) {
    const ids = mode.mode === 'lesson' ? [mode.lessonId] : mode.mode === 'review' ? covered : [...new Set([...ctx.focusLessons, ...covered.slice(-4)])]
    const want = Math.round(n * 0.3)
    const have = chosen.filter((c) => c.skill === ctx.goal).length
    if (have < want) {
      const extra = acrossChapters(p, pool(ids).filter((c) => c.skill === ctx.goal && !c.sneak && !chosen.includes(c)), want - have, { weak: 4, due: 3 }, false)
      const others = chosen.filter((c) => c.skill !== ctx.goal)
      chosen = [...chosen.filter((c) => c.skill === ctx.goal), ...extra, ...shuffle(others).slice(0, Math.max(0, n - have - extra.length))]
    }
  }

  const levels = new Map<string, number>()
  const exercises = shuffle(chosen).map((c) => {
    const ex = c.make()
    levels.set(ex.key, c.level)
    return ex
  })
  return order(exercises, levels)
}
