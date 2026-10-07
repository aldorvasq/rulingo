import type { LoadedLesson } from '../content'
import type { ItemState } from '../engine/srs'

export function lessonItemIds(l: LoadedLesson): string[] {
  return [
    ...(l.vocab ?? []).map((v) => v.id),
    ...(l.grammar ?? []).map((g) => g.id),
    ...(l.exercises ?? []).map((e) => e.id),
  ]
}

/** 0–1: average Leitner box over the lesson's items (unseen = 0, box 4+ counts as full). */
export function lessonMastery(l: LoadedLesson, progress: Record<string, ItemState>): number {
  const ids = lessonItemIds(l)
  if (!ids.length) return 0
  const sum = ids.reduce((acc, id) => acc + Math.min(progress[id]?.box ?? 0, 4) / 4, 0)
  return sum / ids.length
}

export const MASTERED = 0.6
