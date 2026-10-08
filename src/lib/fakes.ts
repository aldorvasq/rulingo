// Plausible-but-wrong Russian forms for multiple choice, so options can't be ruled out by a glance at
// the ending. Fakes imitate real learner mistakes: wrong ending of the same word, unstressed о/а and
// е/и confusion, ы/и after the wrong consonant, missing or extra ь. Stress marks are kept (and placed
// on the new ending when needed) so the accent never gives the fake away.
import { normalizeRu, shuffle } from './text'

interface Letter { ch: string; s: boolean }

const toLetters = (w: string): Letter[] => {
  const out: Letter[] = []
  for (const ch of w.normalize('NFD').replace(/ё/g, 'ё').normalize('NFC')) {
    if (ch === '́' && out.length) out[out.length - 1].s = true
    else out.push({ ch, s: false })
  }
  return out
}
const fromLetters = (ls: Letter[]) => ls.map((l) => l.ch + (l.s ? '́' : '')).join('')
const VOWELS = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ'

/** Ending families: any member can replace another, which yields real-looking wrong forms. */
const FAMILIES = [
  ['ый', 'ий', 'ой', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие', 'ую', 'ого'], // adjectives
  ['о', 'е', 'ы', 'и', 'а', 'я'], // adverbs / short forms / noun endings
  ['ю', 'у', 'ешь', 'ет', 'ем', 'ете', 'ут', 'ют', 'ишь', 'ит', 'им', 'ите', 'ат', 'ят'], // verbs
]

function endingSwaps(word: string): string[] {
  const ls = toLetters(word)
  const plain = ls.map((l) => l.ch).join('').toLowerCase()
  const out: string[] = []
  for (const fam of FAMILIES) {
    const end = [...fam].sort((a, b) => b.length - a.length).find((e) => plain.endsWith(e) && plain.length > e.length + 1)
    if (!end) continue
    const stem = ls.slice(0, ls.length - end.length)
    // ё is always stressed; words without any mark (one syllable) shouldn't gain one.
    const stressed = (l: Letter) => l.s || l.ch === 'ё' || l.ch === 'Ё'
    const stressInStem = stem.some(stressed) || !ls.some(stressed)
    for (const alt of fam) {
      if (alt === end) continue
      const tail = [...alt].map((ch) => ({ ch, s: false }))
      if (!stressInStem) {
        const v = tail.find((l) => VOWELS.includes(l.ch))
        if (v) v.s = true
      }
      out.push(fromLetters([...stem, ...tail]))
    }
    break
  }
  return out
}

const SWAPS: [string, string][] = [['о', 'а'], ['а', 'о'], ['е', 'и'], ['и', 'е'], ['ы', 'и'], ['и', 'ы'], ['я', 'е']]

function spellingSwaps(word: string): string[] {
  const ls = toLetters(word)
  const out: string[] = []
  // Vowel confusion only on unstressed vowels — exactly where learners hesitate.
  ls.forEach((l, i) => {
    if (l.s) return
    for (const [a, b] of SWAPS) {
      if (l.ch === a) {
        const copy = ls.map((x) => ({ ...x }))
        copy[i].ch = b
        out.push(fromLetters(copy))
      }
    }
  })
  // Soft sign: drop an existing one, or add one before the final consonant.
  const soft = ls.findIndex((l) => l.ch === 'ь')
  if (soft > 0) out.push(fromLetters(ls.filter((_, i) => i !== soft)))
  else if (ls.length > 3 && !VOWELS.includes(ls[ls.length - 1].ch) && /[а-я]/.test(ls[ls.length - 1].ch)) {
    out.push(fromLetters([...ls, { ch: 'ь', s: false }]))
  }
  return out
}

/**
 * Up to `n` fake variants of a single Russian word, none equal (ignoring stress/ё) to the word itself
 * or to anything in `avoid` (other options, accepted answers).
 */
export function fakeVariants(word: string, n: number, avoid: string[] = []): string[] {
  if (!word || /\s/.test(word.trim()) || !/[а-яё]/i.test(word)) return []
  const banned = new Set([word, ...avoid].map(normalizeRu))
  const endings = shuffle(endingSwaps(word))
  const spelling = shuffle(spellingSwaps(word))
  // Prefer a mix: ending errors first (the user's example), then spelling errors.
  const ordered = [...endings.slice(0, 2), ...spelling.slice(0, 2), ...endings.slice(2), ...spelling.slice(2)]
  const out: string[] = []
  for (const f of ordered) {
    const k = normalizeRu(f)
    if (banned.has(k)) continue
    banned.add(k)
    out.push(f)
    if (out.length === n) break
  }
  return out
}
