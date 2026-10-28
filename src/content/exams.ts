// Class exams: the exam tab appears while an exam is coming up (until the end of its day) and
// gathers the chapter's practice, a readiness check and a mock exam. Edit only EXAMS.
import { chapters, grammarById, type LoadedChapter } from '.'
import { dayKey, daysBetween } from '../lib/date'

export interface Exam {
  /** YYYY-MM-DD (class day). */
  date: string
  chapter: number
  title: string
}

export const EXAMS: Exam[] = [
  { date: '2026-10-27', chapter: 3, title: 'Examen del capítulo 3' },
]

/** The next exam that hasn't happened yet (today counts), or null. */
export function upcomingExam(today = dayKey()): Exam | null {
  return EXAMS.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
}

export const daysUntil = (e: Exam, today = dayKey()) => daysBetween(today, e.date)

export const examChapter = (e: Exam): LoadedChapter | undefined => chapters.find((c) => c.chapter === e.chapter)

/** The chapter's grammar points in book order: what an exam on it covers. */
export function chapterTopics(chapter: number) {
  const ch = chapters.find((c) => c.chapter === chapter)
  return (ch?.lessons ?? []).flatMap((l) => (l.grammar ?? []).map((g) => grammarById.get(g.id)!).filter(Boolean))
}

/** An exam on this chapter that hasn't happened yet, if any. */
export const upcomingExamFor = (chapter: number, today = dayKey()) => EXAMS.find((e) => e.chapter === chapter && e.date >= today) ?? null

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export function examDateEs(e: Exam): string {
  const [y, m, d] = e.date.split('-').map(Number)
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  const day = WEEKDAYS[wd]
  // Capitalised: it always starts a line («Martes 27 de octubre · …»).
  return `${day[0].toUpperCase()}${day.slice(1)} ${d} de ${MONTHS[m - 1]}`
}
