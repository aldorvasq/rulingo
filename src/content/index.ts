import type { Chapter, ExtraPack, Lesson, VocabItem, GrammarPoint } from './types'

const chapterFiles = import.meta.glob<Chapter>('/content/chapters/*.json', { eager: true, import: 'default' })
const extraFiles = import.meta.glob<ExtraPack>('/content/extra/*.json', { eager: true, import: 'default' })

export function compareLessonIds(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d !== 0) return d
  }
  return 0
}

export interface LoadedLesson extends Lesson {
  chapter: number
  /** Thematic extra words for this lesson (✨ sneak-ins). */
  sneakIns: VocabItem[]
}

export interface LoadedChapter extends Omit<Chapter, 'lessons'> {
  lessons: LoadedLesson[]
}

function mergeLesson(target: LoadedLesson, extra: Partial<Lesson>) {
  const arrays = ['grammar', 'vocab', 'phrases', 'sentences', 'readings', 'exercises'] as const
  for (const key of arrays) {
    const add = extra[key]
    if (!add?.length) continue
    // Same-id entries in the extra pack replace the book version.
    const existing = (target[key] ?? []) as { id?: string }[]
    const ids = new Set((add as { id?: string }[]).map((x) => x.id).filter(Boolean))
    ;(target as unknown as Record<string, unknown[]>)[key] = [
      ...existing.filter((x) => !x.id || !ids.has(x.id)),
      ...add,
    ]
  }
  if (extra.story && !target.story) target.story = extra.story
  if (extra.summaryEs && !target.summaryEs) target.summaryEs = extra.summaryEs
}

function load(): LoadedChapter[] {
  const chapters = new Map<number, LoadedChapter>()
  for (const raw of Object.values(chapterFiles)) {
    if (!raw?.lessons) continue
    const sneak = (raw.sneakIns ?? []).map((v) => ({ ...v, sneak: true }))
    const lessons = raw.lessons.map<LoadedLesson>((l) => ({ ...l, chapter: raw.chapter, sneakIns: [] }))
    // Chapter-level sneak-ins are spread across that chapter's lessons.
    sneak.forEach((v, i) => lessons[i % lessons.length]?.sneakIns.push(v))
    chapters.set(raw.chapter, { ...raw, lessons })
  }

  const allLessons = () => [...chapters.values()].flatMap((c) => c.lessons)

  for (const pack of Object.values(extraFiles)) {
    for (const extra of pack.lessons ?? []) {
      let target = allLessons().find((l) => l.id === extra.id)
      if (!target) {
        const chapterNum = Number(extra.id.split('.')[0]) || 0
        let ch = chapters.get(chapterNum)
        if (!ch) {
          ch = { chapter: chapterNum, title: `Глава ${chapterNum}`, lessons: [] }
          chapters.set(chapterNum, ch)
        }
        target = { id: extra.id, title: extra.title ?? extra.id, chapter: chapterNum, sneakIns: [] }
        ch.lessons.push(target)
      }
      if (extra.title && target.title === target.id) target.title = extra.title
      if (extra.titleEs && !target.titleEs) target.titleEs = extra.titleEs
      mergeLesson(target, extra)
    }
    for (const s of pack.sneakIns ?? []) {
      const target = allLessons().find((l) => l.id === s.lessonId) ?? allLessons().at(-1)
      target?.sneakIns.push({ ...s, sneak: true })
    }
  }

  const result = [...chapters.values()].sort((a, b) => a.chapter - b.chapter)
  result.forEach((c) => c.lessons.sort((a, b) => compareLessonIds(a.id, b.id)))
  return result
}

export const chapters: LoadedChapter[] = load()
export const lessons: LoadedLesson[] = chapters.flatMap((c) => c.lessons)
export const lessonById = new Map(lessons.map((l) => [l.id, l]))

export const vocabById = new Map<string, VocabItem & { lessonId: string }>()
export const grammarById = new Map<string, GrammarPoint & { lessonId: string }>()
for (const l of lessons) {
  for (const v of [...(l.vocab ?? []), ...l.sneakIns]) vocabById.set(v.id, { ...v, lessonId: l.id })
  for (const g of l.grammar ?? []) grammarById.set(g.id, { ...g, lessonId: l.id })
}

export function lessonsUpTo(lastId: string): LoadedLesson[] {
  return lessons.filter((l) => compareLessonIds(l.id, lastId) <= 0)
}

/** Book colour bands per chapter, used across the UI. */
export const chapterColors: Record<number, { bg: string; fg: string; soft: string }> = {
  1: { bg: '#ef4f45', fg: '#fff', soft: '#fde3e1' },
  2: { bg: '#2b9fc9', fg: '#fff', soft: '#dbeff7' },
  3: { bg: '#7cbf3c', fg: '#fff', soft: '#e7f4da' },
  4: { bg: '#9b5bb8', fg: '#fff', soft: '#efe2f5' },
  5: { bg: '#f39a1f', fg: '#fff', soft: '#fdecd4' },
  6: { bg: '#9a6b4b', fg: '#fff', soft: '#efe4dc' },
}
export const colorFor = (chapter: number) => chapterColors[chapter] ?? { bg: '#14b8a6', fg: '#fff', soft: '#d5f5f0' }
