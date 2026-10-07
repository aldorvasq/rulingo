import { addDays } from '../lib/date'

export interface ItemState {
  /** Leitner box 0–5. */
  box: number
  due: string
  right: number
  wrong: number
  last: string
}

/** Days until the next review after landing in box N. */
const INTERVALS = [0, 1, 2, 4, 8, 16]

export function review(prev: ItemState | undefined, correct: boolean, today: string): ItemState {
  const s = prev ?? { box: 0, due: today, right: 0, wrong: 0, last: today }
  if (correct) {
    const box = Math.min(5, s.box + 1)
    return { box, due: addDays(today, INTERVALS[box]), right: s.right + 1, wrong: s.wrong, last: today }
  }
  return { box: s.box >= 3 ? 1 : 0, due: today, right: s.right, wrong: s.wrong + 1, last: today }
}

export type Mastery = 'nuevo' | 'aprendiendo' | 'conocido' | 'dominado'

export function mastery(s: ItemState | undefined): Mastery {
  if (!s) return 'nuevo'
  if (s.box >= 4) return 'dominado'
  if (s.box >= 2) return 'conocido'
  return 'aprendiendo'
}

export const masteryLabel: Record<Mastery, string> = {
  nuevo: 'Nuevo',
  aprendiendo: 'Aprendiendo',
  conocido: 'Conocido',
  dominado: 'Dominado',
}
