// Phonetic Latin → Cyrillic typing for people without a Russian keyboard layout.
// Digraphs are resolved against the previous character: s+h → ш, ya → я, ' → ь, '' → ъ …

const SINGLE: Record<string, string> = {
  a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', e: 'е', z: 'з', i: 'и', j: 'й', k: 'к',
  l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', t: 'т', u: 'у', f: 'ф',
  h: 'х', c: 'ц', y: 'ы', x: 'х', w: 'в', q: 'я', "'": 'ь',
}

const COMBOS: Record<string, string> = {
  'зh': 'ж', 'кh': 'х', 'цh': 'ч', 'сh': 'ш', 'шцh': 'щ', 'еh': 'э',
  'ыo': 'ё', 'йo': 'ё', 'ыu': 'ю', 'йu': 'ю', 'ыa': 'я', 'йa': 'я',
  "ь'": 'ъ',
}

export const TRANSLIT_HELP =
  'a→а b→б v→в g→г d→д e→е zh→ж z→з i→и j→й k→к l→л m→м n→н o→о p→п r→р s→с t→т u→у f→ф h/kh→х c→ц ch→ч sh→ш shch→щ y→ы \'→ь \'\'→ъ eh→э yo→ё yu→ю ya→я'

/** Returns the new text and caret after typing `key` at `caret`, or null if the key isn't mapped. */
export function translitInsert(text: string, caret: number, key: string): { text: string; caret: number } | null {
  const lower = key.toLowerCase()
  const upper = key !== lower
  if (!(lower in SINGLE)) return null
  const before = text.slice(0, caret)
  const after = text.slice(caret)

  for (const len of [2, 1]) {
    const prev = before.slice(-len)
    const combo = COMBOS[prev.toLowerCase() + lower]
    if (combo) {
      const wasUpper = prev[0] !== prev[0].toLowerCase()
      const out = wasUpper ? combo.toUpperCase() : combo
      const nb = before.slice(0, -len) + out
      return { text: nb + after, caret: nb.length }
    }
  }
  const ch = SINGLE[lower]
  if (!ch) return null
  const out = upper ? ch.toUpperCase() : ch
  return { text: before + out + after, caret: caret + out.length }
}
