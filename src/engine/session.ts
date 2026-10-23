import { chapters, grammarById, lessonsUpTo, lessonById } from '../content'
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
  | { mode: 'exam'; chapter: number }

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
  // Seen in the last few sessions: push back (the more recent, the stronger).
  const r = recent.indexOf(c.id)
  if (r >= 0) s -= r < 40 ? 4 : r < 100 ? 2.5 : 1
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

// ---------------------------------------------------------------- variety

/** Exercises shown in recent sessions (kept in this browser) get pushed back so reviews don't repeat. */
const RECENT_KEY = 'rulingo-recent'
let recent: string[] = (() => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
})()
function remember(ids: string[]) {
  recent = [...ids, ...recent.filter((x) => !ids.includes(x))].slice(0, 160)
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)) } catch { /* private mode: no memory */ }
}

/**
 * Spread a session over as many lessons and sections as possible: lessons take turns (shuffled; every
 * lesson once before any lesson twice), and each turn draws from the lesson's least-used section
 * (a grammar point or an exercise type). Within that, the usual scoring (due, weak…) picks the item.
 * Spreading over lessons also spreads over chapters.
 */
function spreadOut(p: Picker, cands: Candidate[], n: number, weights?: Parameters<typeof score>[2]): Candidate[] {
  const byLesson = new Map<string, Candidate[]>()
  for (const c of cands) byLesson.set(c.lessonId, [...(byLesson.get(c.lessonId) ?? []), c])
  const lessons = shuffle([...byLesson.keys()])
  if (!lessons.length || n <= 0) return []
  const sectionOf = (c: Candidate) => c.items.find((i) => grammarById.has(i)) ?? `skill:${c.skill}`
  const used = new Map<string, number>() // section → times used this session (across lessons)
  const out: Candidate[] = []
  for (let round = 0; out.length < n && round < 12; round++) {
    let progressed = false
    for (const id of lessons) {
      if (out.length >= n) break
      const pool = byLesson.get(id)!.filter((c) => !out.includes(c))
      if (!pool.length) continue
      const sections = shuffle([...new Set(pool.map(sectionOf))]).sort((a, b) => (used.get(a) ?? 0) - (used.get(b) ?? 0))
      for (const sec of sections) {
        const got = p.pick(pool.filter((c) => sectionOf(c) === sec), 1, weights)
        if (got.length) {
          out.push(got[0])
          used.set(sec, (used.get(sec) ?? 0) + 1)
          progressed = true
          break
        }
      }
    }
    if (!progressed) break
  }
  return out
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
    chosen = spreadOut(p, pool(covered).filter((c) => !c.sneak), n, { due: 4, weak: 3, fresh: 0 })
  } else if (mode.mode === 'listening') {
    p.limits = { kind: {}, skill: {}, other: n }
    // A third from the lesson in class, the rest spread over every chapter covered.
    const all = pool(covered).filter((c) => c.skill === 'listening')
    const focus = p.pick(all.filter((c) => ctx.focusLessons.includes(c.lessonId)), Math.ceil(n / 3))
    chosen = [...focus, ...spreadOut(p, all, n - focus.length, undefined)]
  } else if (mode.mode === 'cursive') {
    // Handwriting practice: words from the current lesson and earlier ones, letters, and notes.
    p.limits = { kind: {}, skill: {}, other: n }
    const all = pool(covered).filter((c) => c.skill === 'cursive')
    const near = (cs: Candidate[]) => { const f = cs.filter((c) => ctx.focusLessons.includes(c.lessonId)); return f.length ? f : cs }
    // Always a mix: letters, a few notes, the same word in three hands, then single words.
    const letters = p.pick(near(all.filter((c) => c.kind === 'match')), 1)
    const notes = spreadOut(p, all.filter((c) => c.items[1]?.startsWith('note-')), 3, undefined)
    const three = spreadOut(p, all.filter((c) => c.id.endsWith(':three')), 3, undefined)
    const rest = n - letters.length - notes.length - three.length
    const third = p.pick(near(all.filter((c) => c.kind !== 'match')), Math.ceil(rest / 4))
    chosen = [...letters, ...notes, ...three, ...third, ...spreadOut(p, all, rest - third.length, undefined)]
  } else if (mode.mode === 'skill') {
    // Strengthen one skill across everything covered, shaky and due items first.
    p.limits = { kind: {}, skill: {}, other: n }
    chosen = spreadOut(p, pool(covered).filter((c) => c.skill === mode.skill && !c.sneak), n, { weak: 5, due: 3, fresh: 0.5 })
  } else if (mode.mode === 'exam') {
    // Exam prep: the whole chapter, every lesson and grammar point in turn, shaky items first.
    const ids = chapters.find((c) => c.chapter === mode.chapter)?.lessons.map((l) => l.id) ?? []
    chosen = spreadOut(p, pool(ids).filter((c) => !c.sneak && c.skill !== 'cursive'), n, { weak: 5, due: 3, fresh: 1 })
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
    const review = spreadOut(p, pool(reviewIds).filter((c) => !c.sneak), nReview, { due: 4, weak: 3, fresh: 0 })
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
      const extra = spreadOut(p, pool(ids).filter((c) => c.skill === ctx.goal && !c.sneak && !chosen.includes(c)), want - have, { weak: 4, due: 3 })
      const others = chosen.filter((c) => c.skill !== ctx.goal)
      chosen = [...chosen.filter((c) => c.skill === ctx.goal), ...extra, ...shuffle(others).slice(0, Math.max(0, n - have - extra.length))]
    }
  }

  remember(chosen.map((c) => c.id))

  const levels = new Map<string, number>()
  const exercises = shuffle(chosen).map((c) => {
    const ex = c.make()
    levels.set(ex.key, c.level)
    return ex
  })
  return order(exercises, levels)
}

// ---------------------------------------------------------------- mock exam

export interface MockSection { id: string; title: string; exercises: RunExercise[] }

/**
 * A mock exam over one chapter, in the order of a written test: vocabulary, grammar (every grammar point
 * of the chapter gets a question while there's room), verbs, building sentences, reading and listening.
 * Not adaptive: questions are drawn evenly, so the score says how ready the learner is for the whole chapter.
 */
export function buildMockExam(chapter: number, ctx: SessionContext): MockSection[] {
  const ch = chapters.find((c) => c.chapter === chapter)
  if (!ch) return []
  const ids = ch.lessons.map((l) => l.id)
  const all = ids.flatMap(candidatesFor).filter((c) => !c.sneak && c.skill !== 'cursive' && (c.skill !== 'listening' || hasListening(c.items[1])))
  const p = new Picker(ctx, 60)
  p.limits = { kind: { match: 1, sort: 1 }, skill: {}, other: 60 }
  const even = { due: 0, weak: 0, fresh: 0 }
  const of = (skills: Skill[]) => all.filter((c) => skills.includes(c.skill))

  // Grammar: one question per grammar point (shuffled, so a long chapter rotates which ones come up).
  const nGrammar = 14
  const points = shuffle(ch.lessons.flatMap((l) => (l.grammar ?? []).map((g) => g.id)))
  const gram: Candidate[] = []
  for (const g of points) {
    if (gram.length >= nGrammar) break
    gram.push(...p.pick(all.filter((c) => c.items.includes(g) && (c.skill === 'grammar' || c.skill === 'writing') && c.kind !== 'match' && c.kind !== 'sort'), 1, even))
  }
  gram.push(...spreadOut(p, of(['grammar']).filter((c) => c.kind !== 'match' && c.kind !== 'sort'), nGrammar - gram.length, even))

  // At most one matching exercise (slow, and it says little per minute); reading = questions on a text + a dialogue.
  const readingIds = new Set(ch.lessons.flatMap((l) => (l.readings ?? []).map((r) => r.id)))
  const onText = of(['reading']).filter((c) => readingIds.has(c.items[1]))
  const single = (c: Candidate) => c.kind !== 'match' && c.kind !== 'sort'
  const vocab = [...p.pick(of(['vocab']).filter((c) => c.kind === 'match'), 1, even), ...spreadOut(p, of(['antonym']).filter(single), 2, even)]
  vocab.push(...spreadOut(p, of(['vocab', 'visual']).filter(single), 8 - vocab.length, even))
  const reading = [...spreadOut(p, onText, 3, even)]
  reading.push(...spreadOut(p, of(['reading']).filter((c) => !onText.includes(c)), 4 - reading.length, even))

  const plan: [string, string, Candidate[]][] = [
    ['vocab', 'Vocabulario', vocab],
    ['grammar', 'Gramática', gram],
    ['verbs', 'Verbos', spreadOut(p, of(['conjugation']), 4, even)],
    ['syntax', 'Frases: orden y traducción', spreadOut(p, of(['syntax', 'writing']).filter((c) => c.kind !== 'match' && c.kind !== 'sort'), 4, even)],
    ['reading', 'Lectura', reading],
    ['listening', 'Comprensión auditiva', spreadOut(p, of(['listening']), 3, even)],
  ]
  remember(plan.flatMap(([, , cs]) => cs.map((c) => c.id)))
  return plan.filter(([, , cs]) => cs.length).map(([id, title, cs]) => {
    const levels = new Map<string, number>()
    const exercises = shuffle(cs).map((c) => { const ex = c.make(); levels.set(ex.key, c.level); return ex })
    return { id, title, exercises: order(exercises, levels) }
  })
}
