const STRESS = /[́̀]/g
const PUNCT = /[.,!?¿¡:;…—–\-"«»“”„'()]/g

export const stripStress = (s: string) => s.replace(STRESS, '')

/** Lowercase, drop stress marks and punctuation, ё→е, collapse spaces. */
export function normalizeRu(s: string): string {
  return stripStress(s.normalize('NFD').replace(/ё/g, 'ё').normalize('NFC'))
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(PUNCT, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Spanish answers: also ignore accents (é→e) and ñ is kept. */
export function normalizeEs(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/ñ/g, 'ñ')
    .replace(/[̀-ͯ]/g, '')
    .replace(PUNCT, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = tmp
    }
  }
  return prev[b.length]
}

export type GradeResult = 'correct' | 'almost' | 'wrong'

/**
 * strict: grammar drills where one letter is the whole point (endings) — no typo tolerance.
 * lenient: vocab/translation — a single typo in a longer word counts as "almost" (accepted).
 */
export function gradeTyped(input: string, answers: string[], lang: 'ru' | 'es', strict: boolean): { result: GradeResult; best: string } {
  const norm = lang === 'ru' ? normalizeRu : normalizeEs
  const given = norm(input)
  if (!given) return { result: 'wrong', best: answers[0] }
  let best = answers[0]
  let bestDist = Infinity
  for (const a of answers) {
    const d = levenshtein(given, norm(a))
    if (d < bestDist) { bestDist = d; best = a }
  }
  if (bestDist === 0) return { result: 'correct', best }
  if (!strict && bestDist === 1 && norm(best).length >= 4) return { result: 'almost', best }
  return { result: 'wrong', best }
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

/** Split "Я ___ дома." into ["Я ", " дома."] */
export const splitGap = (sentence: string) => sentence.split(/_{2,}/)
