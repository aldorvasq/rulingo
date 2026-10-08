import type { ContentExercise, VocabItem } from '../content/types'
import { lessonById, lessons, type LoadedLesson } from '../content'
import { normalizeRu, pick, sample, shuffle, stripStress } from '../lib/text'
import { fakeVariants } from '../lib/fakes'
import { autoTranslation } from './translate'
import type { Candidate, RunExercise, Skill } from './types'

const GENDER_LABEL: Record<string, string> = { m: 'masculino', f: 'femenino', n: 'neutro', pl: 'plural' }
const GENDER_PRONOUN: Record<string, string> = { m: 'он', f: 'она́', n: 'оно́', pl: 'они́' }
const PRONOUNS = ['я', 'ты', 'он', 'она', 'мы', 'вы', 'они']
const isPronounKey = (k: string) => PRONOUNS.includes(stripStress(k).split(/[/ ,]/)[0].toLowerCase())

/** Unique distractors that don't collide with the correct answer after normalization. */
function distractors(correct: string, pool: string[], n = 3): string[] {
  const seen = new Set([normalizeRu(correct)])
  const out: string[] = []
  for (const p of shuffle(pool)) {
    const k = normalizeRu(p)
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(p)
    if (out.length === n) break
  }
  return out
}

function choiceSet(correct: string, pool: string[], n = 3) {
  const choices = shuffle([correct, ...distractors(correct, pool, n)])
  return { choices, answer: choices.indexOf(correct) }
}

/** How often an exercise mixes made-up look-alikes in with the real options. */
const FAKE_RATE = 0.7

/**
 * Mix made-up variants of the correct Russian word (wrong endings, typical misspellings) into the
 * options, so the answer can't be picked just from its ending. Real distractors are dropped from the
 * end to stay within `maxTotal`; `avoid` lists other accepted answers that must never appear as fakes.
 */
function withFakes(choices: string[], correct: string, nFake: number, maxTotal: number, avoid: string[] = []) {
  const fakes = Math.random() < FAKE_RATE ? fakeVariants(correct, nFake, [...choices, ...avoid]) : []
  const others = choices.filter((c) => c !== correct)
  const keep = others.slice(0, Math.max(0, maxTotal - 1 - fakes.length))
  const out = shuffle([correct, ...keep, ...fakes])
  return { choices: out, answer: out.indexOf(correct) }
}

/** Vocab visible to a lesson for distractors: its own first, then the rest of the book up to it. */
function vocabPool(lesson: LoadedLesson): VocabItem[] {
  const upTo = lessons.filter((l) => l.chapter <= lesson.chapter)
  return [...(lesson.vocab ?? []), ...upTo.flatMap((l) => l.vocab ?? [])]
}

function samePos(pool: VocabItem[], v: VocabItem) {
  const same = pool.filter((p) => p.id !== v.id && p.pos === v.pos)
  return same.length >= 3 ? same : pool.filter((p) => p.id !== v.id)
}

const describe = (v: VocabItem) => {
  const bits: string[] = []
  if (v.pos === 'noun' && v.gender) bits.push(GENDER_PRONOUN[v.gender])
  if (v.pos === 'verb') bits.push('verbo')
  if (v.pos === 'adj') bits.push('adjetivo')
  if (v.pos === 'adv') bits.push('adverbio')
  return bits.join(', ')
}

// ---------------------------------------------------------------- content exercises

function fromContent(ex: ContentExercise, lesson: LoadedLesson): Candidate[] {
  const items = [ex.id, ...(ex.tags ?? [])]
  const base = { lessonId: lesson.id, items, explanation: ex.explanationEs, translation: ex.es }
  const c = (level: 1 | 2 | 3, skill: Skill, make: () => RunExercise, suffix = ''): Candidate => ({
    id: ex.id + suffix, lessonId: lesson.id, items, level, handmade: true, skill, kind: make().kind, make,
  })
  const k = () => `${ex.id}-${Math.random().toString(36).slice(2, 7)}`

  switch (ex.type) {
    case 'fill_choice':
      return [c(1, 'grammar', () => {
        const correct = ex.choices[ex.answer]
        return { ...base, key: k(), skill: 'grammar', kind: 'choice', instruction: ex.instructionEs ?? 'Elige la opción correcta',
          prompt: ex.sentence, promptLang: 'ru', ...withFakes(ex.choices, correct, 1, ex.choices.length + 1), choiceLang: 'ru' }
      })]
    case 'fill_typed':
      return [c(3, 'grammar', () => ({ ...base, key: k(), skill: 'grammar', kind: 'typed', instruction: ex.instructionEs ?? 'Completa la frase',
        prompt: ex.sentence, promptLang: 'ru', answers: ex.answers, answerLang: 'ru', strict: true, hint: ex.hint }))]
    case 'antonym':
    case 'synonym': {
      const label = ex.type === 'antonym' ? 'antónimo' : 'sinónimo'
      const out: Candidate[] = [c(3, 'antonym', () => ({ ...base, key: k(), skill: 'antonym', kind: 'typed',
        instruction: `Escribe el ${label}`, prompt: ex.word, promptLang: 'ru', answers: ex.answers, answerLang: 'ru', strict: false }), '-typed')]
      if (ex.choices?.length) {
        out.push(c(1, 'antonym', () => {
          const correct = ex.choices!.find((x) => ex.answers.some((a) => normalizeRu(a) === normalizeRu(x)))!
          return { ...base, key: k(), skill: 'antonym', kind: 'choice', instruction: ex.instructionEs ?? `Elige el ${label}`,
            prompt: ex.word, promptLang: 'ru', ...withFakes(ex.choices!, correct, 2, 4, [...ex.answers, ex.word]), choiceLang: 'ru' }
        }))
      }
      return out
    }
    case 'conjugate':
      return [c(2, 'conjugation', () => ({ ...base, key: k(), skill: 'conjugation', kind: 'conjugate',
        instruction: ex.instructionEs ?? 'Conjuga el verbo', verb: ex.verb, pronouns: ex.pronouns, answers: ex.answers }))]
    case 'word_order':
      return [c(2, 'syntax', () => ({ ...base, key: k(), skill: 'syntax', kind: 'word_order',
        instruction: ex.instructionEs ?? 'Ordena las palabras', words: shuffle(ex.words), answer: ex.answer, translation: ex.es }))]
    case 'translate':
      return [c(ex.direction === 'es-ru' ? 3 : 2, ex.direction === 'es-ru' ? 'writing' : 'vocab', () => ({ ...base, key: k(),
        skill: ex.direction === 'es-ru' ? 'writing' : 'vocab', kind: 'typed',
        instruction: ex.instructionEs ?? (ex.direction === 'es-ru' ? 'Traduce al ruso' : 'Traduce al español'),
        prompt: ex.prompt, promptLang: ex.direction === 'es-ru' ? 'es' : 'ru', answers: ex.answers,
        answerLang: ex.direction === 'es-ru' ? 'ru' : 'es', strict: false }))]
    case 'match':
      return [c(1, 'vocab', () => ({ ...base, key: k(), skill: 'vocab', kind: 'match', instruction: ex.instructionEs ?? 'Une las parejas', pairs: ex.pairs }))]
    case 'sort':
      return [c(1, 'grammar', () => ({ ...base, key: k(), skill: 'grammar', kind: 'sort', instruction: ex.instructionEs ?? 'Clasifica las palabras',
        categories: ex.categories, entries: shuffle(ex.items) }))]
    case 'error_spot':
      return [c(2, 'grammar', () => ({ ...base, key: k(), skill: 'grammar', kind: 'error_spot', instruction: ex.instructionEs ?? 'Toca la palabra incorrecta',
        sentence: ex.sentence, wrongWord: ex.wrongWord, correction: ex.correction }))]
    case 'transform':
      return [c(3, 'grammar', () => ({ ...base, key: k(), skill: 'grammar', kind: 'typed', instruction: ex.instructionEs ?? 'Transforma la frase',
        prompt: ex.prompt, promptLang: 'ru', answers: ex.answers, answerLang: 'ru', strict: true }))]
    case 'dialogue':
      return [c(1, 'reading', () => {
        const order = shuffle(ex.choices.map((_, i) => i))
        return { ...base, key: k(), skill: 'reading', kind: 'choice', instruction: ex.instructionEs ?? 'Completa el diálogo',
          dialogue: ex.lines, promptLang: 'ru', choices: order.map((i) => ex.choices[i]), choiceLang: 'ru', answer: order.indexOf(ex.answer) }
      })]
    default:
      return []
  }
}

// ---------------------------------------------------------------- generated from vocab

function fromVocab(v: VocabItem, lesson: LoadedLesson, pool: VocabItem[]): Candidate[] {
  const out: Candidate[] = []
  const sneak = !!v.sneak
  const k = (s: string) => `${v.id}:${s}-${Math.random().toString(36).slice(2, 7)}`
  const base = { lessonId: lesson.id, items: [v.id], sneak }
  const add = (id: string, level: 1 | 2 | 3, skill: Skill, make: () => RunExercise) =>
    out.push({ id: `${v.id}:${id}`, lessonId: lesson.id, items: [v.id], level, sneak, skill, kind: make().kind, make })
  const others = samePos(pool, v)
  const extra = describe(v)
  const explain = `${v.ru} = ${v.es}${extra ? ` (${extra})` : ''}`

  add('es-ru', 1, 'vocab', () => ({ ...base, key: k('es-ru'), skill: 'vocab', kind: 'choice', instruction: '¿Cómo se dice en ruso?',
    prompt: v.es, promptLang: 'es', ...withFakes(choiceSet(v.ru, others.map((o) => o.ru)).choices, v.ru, 1, 4), choiceLang: 'ru', explanation: explain }))

  add('ru-es', 1, 'vocab', () => ({ ...base, key: k('ru-es'), skill: 'vocab', kind: 'choice', instruction: '¿Qué significa?',
    prompt: v.ru, promptLang: 'ru', ...choiceSet(v.es, others.map((o) => o.es)), choiceLang: 'es', explanation: explain }))

  add('write', 3, 'writing', () => ({ ...base, key: k('write'), skill: 'writing', kind: 'typed', instruction: 'Escribe en ruso',
    prompt: v.es, promptLang: 'es', answers: [v.ru], answerLang: 'ru', strict: false, hint: extra || undefined, explanation: explain }))

  if (v.antonyms?.length) {
    const ant = v.antonyms
    const antPool = others.map((o) => o.ru).filter((r) => !ant.some((a) => normalizeRu(a) === normalizeRu(r)))
    add('ant', 1, 'antonym', () => ({ ...base, key: k('ant'), skill: 'antonym', kind: 'choice', instruction: 'Elige el antónimo',
      prompt: v.ru, promptLang: 'ru', ...(() => {
        const a = pick(ant)
        return withFakes(choiceSet(a, antPool).choices, a, 2, 4, [...ant, v.ru])
      })(), choiceLang: 'ru',
      explanation: `${v.ru} (${v.es}) ↔ ${ant.join(', ')}` }))
    add('ant-typed', 3, 'antonym', () => ({ ...base, key: k('ant-typed'), skill: 'antonym', kind: 'typed', instruction: 'Escribe el antónimo',
      prompt: v.ru, promptLang: 'ru', answers: ant, answerLang: 'ru', strict: false, hint: v.es,
      explanation: `${v.ru} (${v.es}) ↔ ${ant.join(', ')}` }))
  }

  const present = v.conj?.present
  if (v.pos === 'verb' && present && Object.keys(present).length >= 3) {
    const entries = Object.entries(present)
    const type = v.conj?.type ? ` — conjugación ${v.conj.type === 'irregular' ? 'irregular' : `-${v.conj.type}-`}` : ''
    add('conj', 2, 'conjugation', () => {
      const chosen = sample(entries, 3)
      return { ...base, key: k('conj'), skill: 'conjugation', kind: 'conjugate', instruction: `Conjuga «${v.ru}» (${v.es})`,
        verb: v.ru, pronouns: chosen.map((e) => e[0]), answers: chosen.map((e) => e[1]), explanation: `${v.ru}${type}` }
    })
    add('conj-all', 3, 'conjugation', () => ({ ...base, key: k('conj-all'), skill: 'conjugation', kind: 'conjugate',
      instruction: `Conjuga «${v.ru}» (${v.es})`, verb: v.ru, pronouns: entries.map((e) => e[0]), answers: entries.map((e) => e[1]),
      explanation: `${v.ru}${type}` }))
  }

  const forms = v.forms
  // Invariable words (его, её, их) list identical forms — nothing to agree.
  if ((v.pos === 'adj' || v.pos === 'pron') && forms && new Set(Object.values(forms)).size >= 2) {
    const nouns = pool.filter((p) => p.pos === 'noun' && p.gender && forms[p.gender])
    if (nouns.length >= 3) {
      const formList = Object.values(forms) as string[]
      add('agree', 2, 'grammar', () => {
        const n = pick(nouns)
        const correct = forms[n.gender!]!
        const real = [...new Set(formList)]
        return { ...base, items: [v.id, n.id], key: k('agree'), skill: 'grammar', kind: 'choice',
          instruction: 'Elige la forma correcta', prompt: `___ ${n.ru}`, promptLang: 'ru',
          ...withFakes(real, correct, 1, real.length + 1), choiceLang: 'ru',
          explanation: `${n.ru} es ${GENDER_LABEL[n.gender!]} (${GENDER_PRONOUN[n.gender!]}) → ${correct} ${n.ru} (${v.es} ${n.es})` }
      })
      add('agree-typed', 3, 'grammar', () => {
        const n = pick(nouns)
        const correct = forms[n.gender!]!
        return { ...base, items: [v.id, n.id], key: k('agree-typed'), skill: 'grammar', kind: 'typed',
          instruction: `Escribe la forma correcta de «${forms.m ?? v.ru}»`, prompt: `___ ${n.ru}`, promptLang: 'ru',
          answers: [correct], answerLang: 'ru', strict: true, hint: `${n.es} — ${GENDER_LABEL[n.gender!]}`,
          explanation: `${n.ru} es ${GENDER_LABEL[n.gender!]} → ${correct}` }
      })
    }
  }
  return out
}

// ---------------------------------------------------------------- lesson-level generated

function lessonLevel(lesson: LoadedLesson, pool: VocabItem[]): Candidate[] {
  const out: Candidate[] = []
  const vocab = lesson.vocab ?? []
  const rnd = () => Math.random().toString(36).slice(2, 7)

  // Match pairs: a few per lesson, words chosen at render time.
  const matchable = vocab.filter((v) => v.ru.length <= 24 && v.es.length <= 28)
  for (let i = 0; i < Math.min(3, Math.floor(matchable.length / 5)); i++) {
    const make = (): RunExercise => {
      const words = sample(matchable, 5)
      return { key: `${lesson.id}:match-${rnd()}`, items: words.map((w) => w.id), lessonId: lesson.id, skill: 'vocab',
        kind: 'match', instruction: 'Une las parejas', pairs: words.map((w) => [w.ru, w.es]) }
    }
    out.push({ id: `${lesson.id}:match${i}`, lessonId: lesson.id, items: [], level: 1, skill: 'vocab', kind: 'match', make })
  }

  // Gender sort with nouns from this lesson (topped up from earlier ones).
  const nouns = vocab.filter((v) => v.pos === 'noun' && v.gender && v.gender !== 'pl')
  if (nouns.length >= 3) {
    const older = pool.filter((v) => v.pos === 'noun' && v.gender && v.gender !== 'pl' && !nouns.includes(v))
    const make = (): RunExercise => {
      const chosen = [...sample(nouns, 4), ...sample(older, 2)].slice(0, 6)
      return { key: `${lesson.id}:gender-${rnd()}`, items: chosen.map((n) => n.id), lessonId: lesson.id, skill: 'grammar',
        kind: 'sort', instruction: 'Clasifica por género', categories: ['он', 'она́', 'оно́'],
        entries: chosen.map((n) => ({ text: n.ru, category: GENDER_PRONOUN[n.gender!] })) }
    }
    out.push({ id: `${lesson.id}:gender`, lessonId: lesson.id, items: nouns.map((n) => n.id), level: 1, skill: 'grammar', kind: 'sort', make })
  }

  // Sentences → build the Russian sentence from its Spanish translation.
  ;(lesson.sentences ?? []).forEach((s, i) => {
    const words = s.ru.replace(/[.!?…]+$/, '').split(/\s+/)
    if (words.length < 3 || words.length > 10) return
    const id = `${lesson.id}:s${i}`
    const items = [id, ...(s.tags ?? [])]
    out.push({ id: `${id}:order`, lessonId: lesson.id, items, level: 2, skill: 'syntax', kind: 'word_order',
      make: () => ({ key: `${id}:order-${rnd()}`, items, lessonId: lesson.id, skill: 'syntax', kind: 'word_order',
        instruction: 'Traduce ordenando las palabras', words: shuffle(words), answer: s.ru, translation: s.es }) })
  })

  // Phrases → meaning.
  const phrases = lesson.phrases ?? []
  phrases.forEach((p, i) => {
    const id = `${lesson.id}:p${i}`
    out.push({ id, lessonId: lesson.id, items: [id], level: 1, skill: 'vocab', kind: 'choice',
      make: () => ({ key: `${id}-${rnd()}`, items: [id], lessonId: lesson.id, skill: 'vocab', kind: 'choice',
        instruction: '¿Qué significa esta frase?', prompt: p.ru, promptLang: 'ru',
        ...choiceSet(p.es, phrases.filter((q) => q !== p).map((q) => q.es)), choiceLang: 'es', explanation: p.noteEs }) })
  })

  // Readings → one question per exercise, passage shown above.
  for (const r of lesson.readings ?? []) {
    ;(r.questions ?? []).forEach((q, i) => {
      const id = `${r.id}:q${i}`
      out.push({ id, lessonId: lesson.id, items: [id, r.id], level: 1, handmade: true, skill: 'reading', kind: 'choice',
        make: () => {
          const order = shuffle(q.choices.map((_, j) => j))
          return { key: `${id}-${rnd()}`, items: [id, r.id], lessonId: lesson.id, skill: 'reading', kind: 'choice',
            instruction: q.qEs ?? 'Lee y responde', passage: { title: r.title, text: r.textRu, textEs: r.textEs },
            prompt: q.q, promptLang: 'ru', choices: order.map((j) => q.choices[j]), choiceLang: 'ru', answer: order.indexOf(q.answer) }
        } })
    })
  }

  // Grammar drill tables → form choice / conjugation.
  for (const g of lesson.grammar ?? []) {
    g.drill?.items.forEach((it, i) => {
      const entries = Object.entries(it.forms)
      if (entries.length < 2) return
      const id = `${g.id}:d${i}`
      const items = [id, g.id]
      if (entries.every(([key]) => isPronounKey(key))) {
        out.push({ id, lessonId: lesson.id, items, level: 2, skill: 'conjugation', kind: 'conjugate',
          make: () => {
            const chosen = entries.length > 4 ? sample(entries, 4) : entries
            return { key: `${id}-${rnd()}`, items, lessonId: lesson.id, skill: 'conjugation', kind: 'conjugate',
              instruction: `Conjuga «${it.base}»`, verb: it.base, pronouns: chosen.map((e) => e[0]), answers: chosen.map((e) => e[1]),
              explanation: g.title }
          } })
        return
      }
      const values = [...new Set(entries.map((e) => e[1]))]
      if (values.length < 2) return
      out.push({ id, lessonId: lesson.id, items, level: 2, skill: 'grammar', kind: 'choice',
        make: () => {
          const [label, correct] = pick(entries)
          return { key: `${id}-${rnd()}`, items, lessonId: lesson.id, skill: 'grammar', kind: 'choice',
            instruction: `Forma «${GENDER_LABEL[label] ?? label}» de «${it.base}»`, prompt: it.base, promptLang: 'ru',
            ...withFakes(values, correct, 1, values.length + 1), choiceLang: 'ru', explanation: g.title }
        } })
    })
  }
  return out
}

// ---------------------------------------------------------------- public

const cache = new Map<string, Candidate[]>()

export function candidatesFor(lessonId: string): Candidate[] {
  const hit = cache.get(lessonId)
  if (hit) return hit
  const lesson = lessonById.get(lessonId)
  if (!lesson) return []
  const pool = vocabPool(lesson)
  const result = [
    ...(lesson.exercises ?? []).flatMap((e) => fromContent(e, lesson)),
    ...(lesson.vocab ?? []).flatMap((v) => fromVocab(v, lesson, pool)),
    ...lesson.sneakIns.flatMap((v) => fromVocab(v, lesson, pool).filter((c) => c.level < 3)),
    ...lessonLevel(lesson, pool),
  ]
  // Every exercise gets a translation: hand-written ones bring theirs, the rest are derived.
  for (const c of result) {
    const make = c.make
    c.make = () => {
      const ex = make()
      ex.translation ??= autoTranslation(ex)
      return ex
    }
  }
  cache.set(lessonId, result)
  return result
}
