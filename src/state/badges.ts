import { chapters, lessonById, vocabById } from '../content'
import { lessonMastery, MASTERED } from './mastery'
import type { PersistedState } from './store'

export interface Badge {
  id: string
  icon: string
  ru: string
  es: string
  desc: string
  /** [current, target] for the progress bar on locked badges. */
  progress: (s: PersistedState) => [number, number]
}

const knownWords = (s: PersistedState) =>
  Object.entries(s.progress).filter(([id, st]) => vocabById.has(id) && st.box >= 2).length

const lessonPct = (id: string, s: PersistedState) => {
  const l = lessonById.get(id)
  return l ? lessonMastery(l, s.progress) : 0
}

const counter = (id: string, icon: string, ru: string, es: string, desc: string, target: number, value: (s: PersistedState) => number): Badge => ({
  id, icon, ru, es, desc, progress: (s) => [Math.min(value(s), target), target],
})

export const BADGES: Badge[] = [
  counter('primer-paso', '🐣', 'Первый шаг', 'Primer paso', 'Termina tu primera lección', 1, (s) => s.stats.sessions),
  counter('racha-3', '🔥', 'Три дня', 'Tres días', 'Racha de 3 días', 3, (s) => s.streak.best),
  counter('racha-7', '📅', 'Неделя', 'Una semana', 'Racha de 7 días', 7, (s) => s.streak.best),
  counter('racha-30', '🗓️', 'Месяц', 'Un mes', 'Racha de 30 días', 30, (s) => s.streak.best),
  counter('sin-errores', '💯', 'Без ошибок', 'Sin errores', 'Una lección perfecta', 1, (s) => s.stats.perfect),
  counter('otlichnik', '🏆', 'Отличник', 'Alumno de 10', '10 lecciones perfectas', 10, (s) => s.stats.perfect),
  counter('xp-500', '⭐', 'Пятьсот', 'Quinientos', 'Gana 500 XP', 500, (s) => s.stats.xpTotal),
  counter('xp-2000', '🌟', 'Две тысячи', 'Dos mil', 'Gana 2000 XP', 2000, (s) => s.stats.xpTotal),
  counter('conjugador', '🔁', 'Мастер спряжения', 'Maestro de la conjugación', '100 conjugaciones correctas', 100, (s) => s.stats.bySkill.conjugation ?? 0),
  counter('antonimos', '↔️', 'Наоборот!', '¡Al revés!', '50 antónimos correctos', 50, (s) => s.stats.bySkill.antonym ?? 0),
  counter('escritor', '✍️', 'Писатель', 'Escritor', '100 respuestas escritas correctas', 100, (s) => s.stats.typedCorrect),
  counter('oido', '👂', 'Хоро́ший слух', 'Buen oído', '50 preguntas de comprensión auditiva', 50, (s) => s.stats.bySkill.listening ?? 0),
  counter('lector', '📖', 'Читатель', 'Lector', '30 preguntas de lectura', 30, (s) => s.stats.bySkill.reading ?? 0),
  counter('palabras-50', '📚', 'Пятьдесят слов', '50 palabras', 'Conoce 50 palabras', 50, knownWords),
  counter('palabras-150', '🧠', 'Сто пятьдесят слов', '150 palabras', 'Conoce 150 palabras', 150, knownWords),
  counter('explorador', '✨', 'Исследователь', 'Explorador', '20 palabras extra (✨) correctas', 20, (s) => s.stats.sneakCorrect),
  counter('zhavoronok', '🐦', 'Жаворонок', 'Alondra', 'Practica antes de las 8:00', 1, (s) => s.stats.earlyBird),
  counter('sova', '🦉', 'Сова', 'Búho', 'Practica después de las 23:00', 1, (s) => s.stats.nightOwl),
  {
    id: 'tikho', icon: '🤫', ru: 'Тихо!', es: '¡Silencio!', desc: 'Domina la lección 3.4 «Новые соседи»',
    progress: (s) => [Math.round(lessonPct('3.4', s) * 100), Math.round(MASTERED * 100)],
  },
  ...chapters.map<Badge>((c) => ({
    id: `glava-${c.chapter}`, icon: ['', '👋', '👨‍👩‍👧', '🏠', '🍲', '🚇', '🎁'][c.chapter] ?? '🎓',
    ru: `Глава ${c.chapter}`, es: `Capítulo ${c.chapter}`, desc: `Domina todas las lecciones del capítulo ${c.chapter}`,
    progress: (s) => [c.lessons.filter((l) => lessonMastery(l, s.progress) >= MASTERED).length, c.lessons.length],
  })),
]

export const badgeById = new Map(BADGES.map((b) => [b.id, b]))

export function evaluateBadges(s: PersistedState): string[] {
  return BADGES.filter((b) => {
    const [cur, target] = b.progress(s)
    return target > 0 && cur >= target
  }).map((b) => b.id)
}
