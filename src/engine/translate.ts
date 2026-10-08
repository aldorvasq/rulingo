// Translations shown after a correct answer. Hand-written exercises carry their own (`es` in content);
// for generated ones we derive it from the exercise itself and the vocabulary of all lessons.
import { lessons } from '../content'
import { normalizeRu } from '../lib/text'
import type { RunExercise } from './types'

const glossary = new Map<string, { ru: string; es: string }>()
for (const l of lessons) {
  for (const v of [...(l.vocab ?? []), ...l.sneakIns]) {
    const k = normalizeRu(v.ru)
    if (!glossary.has(k)) glossary.set(k, { ru: v.ru, es: v.es })
    for (const f of Object.values(v.forms ?? {})) {
      const fk = normalizeRu(f as string)
      if (f && !glossary.has(fk)) glossary.set(fk, { ru: f as string, es: v.es })
    }
  }
  for (const p of l.phrases ?? []) {
    const k = normalizeRu(p.ru)
    if (!glossary.has(k)) glossary.set(k, { ru: p.ru, es: p.es })
  }
}

const isRu = (s: string) => /[а-яё]/i.test(s)

/** "слово = palabra · слово2 = palabra2" for every known word (or whole phrase) in the texts. */
export function gloss(...texts: string[]): string | undefined {
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of texts) {
    if (!t) continue
    const whole = glossary.get(normalizeRu(t))
    const hits = whole ? [whole] : t.split(/[\s.,!?¿¡:;«»"()—–]+/).map((w) => glossary.get(normalizeRu(w))).filter(Boolean)
    for (const h of hits as { ru: string; es: string }[]) {
      if (seen.has(h.ru)) continue
      seen.add(h.ru)
      out.push(`${h.ru} = ${h.es}`)
    }
  }
  return out.length ? out.join(' · ') : undefined
}

const fillGap = (s: string, answer: string) => s.replace(/_{2,}/, answer)

export function autoTranslation(ex: RunExercise): string | undefined {
  if (ex.passage?.textEs) return ex.passage.textEs
  switch (ex.kind) {
    case 'choice': {
      const answer = ex.choices[ex.answer]
      if (ex.promptLang === 'es' && ex.choiceLang === 'ru') return `${answer} = ${ex.prompt}`
      if (ex.promptLang === 'ru' && ex.choiceLang === 'es') return `${ex.prompt} = ${answer}`
      if (ex.prompt?.includes('___')) return gloss(fillGap(ex.prompt, answer))
      return gloss(ex.prompt ?? '', answer)
    }
    case 'typed': {
      const answer = ex.answers[0]
      if (ex.promptLang === 'es' && ex.answerLang === 'ru') return `${answer} = ${ex.prompt}`
      if (ex.promptLang === 'ru' && ex.answerLang === 'es') return `${ex.prompt} = ${answer}`
      if (ex.prompt?.includes('___')) return gloss(fillGap(ex.prompt, answer))
      return gloss(ex.prompt ?? '', answer)
    }
    case 'conjugate': return gloss(ex.verb)
    case 'word_order': return ex.translation ? `${ex.answer} = ${ex.translation}` : gloss(ex.answer)
    case 'match': return ex.pairs.every(([, r]) => !isRu(r)) ? ex.pairs.map(([l, r]) => `${l} = ${r}`).join(' · ') : gloss(...ex.pairs.flat())
    case 'sort': return gloss(...ex.entries.map((e) => e.text))
    case 'error_spot': return gloss(ex.sentence)
  }
}
