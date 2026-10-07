import { grammarById, lessonById } from '../content'
import { candidatesFor } from './generate'
import type { Candidate, RunExercise, Skill } from './types'

// A "topic" is one reviewable slice of a lesson: a grammar point (exercises tagged with its id)
// or an exercise skill (antonyms, conjugation…). Topics tell the learner exactly what they'll practise.

export const SKILL_TOPICS: Record<Skill, { title: string; desc: string }> = {
  antonym: { title: 'Antónimos y sinónimos', desc: 'Elige o escribe la palabra opuesta' },
  vocab: { title: 'Vocabulario', desc: 'Traduce palabras y frases en ambos sentidos' },
  conjugation: { title: 'Conjugación', desc: 'Completa las formas de los verbos' },
  writing: { title: 'Escritura en ruso', desc: 'Escribe palabras y frases en cirílico' },
  syntax: { title: 'Orden de palabras', desc: 'Construye frases con las palabras dadas' },
  reading: { title: 'Lectura y diálogos', desc: 'Lee el texto y responde' },
  grammar: { title: 'Formas y concordancia', desc: 'Género, terminaciones y formas correctas' },
}

const SKILL_ORDER: Skill[] = ['antonym', 'vocab', 'conjugation', 'writing', 'syntax', 'reading', 'grammar']

export interface Topic {
  id: string
  title: string
  desc: string
  count: number
  kind: 'grammar' | 'skill'
}

export const topicMatches = (c: Candidate, topicId: string) =>
  topicId.startsWith('skill:') ? c.skill === topicId.slice(6) : c.items.includes(topicId)

const cache = new Map<string, Topic[]>()

export function lessonTopics(lessonId: string): Topic[] {
  const hit = cache.get(lessonId)
  if (hit) return hit
  const lesson = lessonById.get(lessonId)
  if (!lesson) return []
  const cands = candidatesFor(lessonId).filter((c) => !c.sneak)
  const out: Topic[] = []
  for (const g of lesson.grammar ?? []) {
    const count = cands.filter((c) => c.items.includes(g.id)).length
    if (count >= 3) out.push({ id: g.id, title: g.title, desc: 'Gramática', count, kind: 'grammar' })
  }
  for (const sk of SKILL_ORDER) {
    const count = cands.filter((c) => c.skill === sk).length
    if (count >= 3) out.push({ id: `skill:${sk}`, ...SKILL_TOPICS[sk], count, kind: 'skill' })
  }
  cache.set(lessonId, out)
  return out
}

export function topicTitle(id: string): string | undefined {
  if (id.startsWith('skill:')) return SKILL_TOPICS[id.slice(6) as Skill]?.title
  return grammarById.get(id)?.title
}

/** What the current exercise is practising — shown above it in the player. */
export function exerciseTopic(ex: RunExercise): string {
  // These exercise types say more about what's practised than the grammar tag they carry.
  if (ex.skill === 'antonym' || ex.skill === 'conjugation' || ex.skill === 'reading') return SKILL_TOPICS[ex.skill].title
  for (const id of ex.items) {
    const g = grammarById.get(id)
    if (g) return g.title
  }
  return SKILL_TOPICS[ex.skill].title
}
