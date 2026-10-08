#!/usr/bin/env node
// Checks content/chapters/*.json and content/extra/*.json against the rules in content/SCHEMA.md.
// Usage: npm run validate   (exit code 1 on errors; warnings don't fail)
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'content')
const errors = []
const warnings = []
const ids = new Map()
const norm = (s) => String(s).normalize('NFC').replace(/[́̀]/g, '').toLowerCase().replace(/ё/g, 'е').replace(/[.,!?¿¡:;…—–\-"«»“”()]/g, ' ').replace(/\s+/g, ' ').trim()
const VOWELS = /[аеёиоуыэюя]/gi
const needsStress = (w) => (w.match(VOWELS) ?? []).length >= 2 && !/[́ё]/i.test(w)

function claim(id, where) {
  if (!id) return errors.push(`${where}: missing id`)
  if (ids.has(id)) errors.push(`${where}: duplicate id "${id}" (also in ${ids.get(id)})`)
  ids.set(id, where)
}

function checkStress(text, where) {
  for (const w of String(text).split(/[^\p{L}́]+/u)) {
    if (/[а-яё]/i.test(w) && needsStress(w)) { warnings.push(`${where}: no stress mark on "${w}"`); return }
  }
}

function checkExercise(ex, where) {
  claim(ex.id, where)
  const w = `${where} ${ex.id} (${ex.type})`
  const req = (cond, msg) => cond || errors.push(`${w}: ${msg}`)
  const gap = (s) => (String(s).match(/_{2,}/g) ?? []).length
  switch (ex.type) {
    case 'fill_choice':
      req(gap(ex.sentence) === 1, 'sentence needs exactly one ___')
      req(Array.isArray(ex.choices) && ex.choices.length >= 2, 'needs ≥2 choices')
      req(Number.isInteger(ex.answer) && ex.answer >= 0 && ex.answer < ex.choices?.length, 'answer index out of range')
      break
    case 'fill_typed':
      req(gap(ex.sentence) === 1, 'sentence needs exactly one ___')
      req(ex.answers?.length >= 1, 'needs answers')
      break
    case 'antonym': case 'synonym':
      req(ex.word, 'needs word')
      req(ex.answers?.length >= 1, 'needs answers')
      if (ex.choices) req(ex.choices.some((c) => ex.answers.some((a) => norm(a) === norm(c))), 'no choice matches an answer')
      break
    case 'conjugate':
      req(ex.verb && ex.pronouns?.length && ex.pronouns.length === ex.answers?.length, 'pronouns/answers mismatch')
      break
    case 'word_order':
      req(ex.words?.length >= 2 && ex.answer, 'needs words and answer')
      if (ex.words && ex.answer) req(norm(ex.words.join(' ')).split(' ').sort().join(' ') === norm(ex.answer).split(' ').sort().join(' '), 'words don\'t rebuild the answer')
      break
    case 'translate':
      req(['es-ru', 'ru-es'].includes(ex.direction), 'bad direction')
      req(ex.prompt && ex.answers?.length, 'needs prompt and answers')
      break
    case 'match':
      req(ex.pairs?.length >= 3 && ex.pairs.every((p) => p.length === 2), 'needs ≥3 pairs')
      break
    case 'sort':
      req(ex.categories?.length >= 2 && ex.items?.length >= 2, 'needs categories and items')
      ex.items?.forEach((it) => req(ex.categories.some((c) => norm(c) === norm(it.category)), `item "${it.text}" has unknown category "${it.category}"`))
      break
    case 'error_spot': {
      const n = String(ex.sentence ?? '').split(/\s+/).length
      req(Number.isInteger(ex.wrongWord) && ex.wrongWord >= 0 && ex.wrongWord < n, 'wrongWord out of range')
      req(ex.correction, 'needs correction')
      break
    }
    case 'transform':
      req(ex.prompt && ex.answers?.length, 'needs prompt and answers')
      break
    case 'dialogue':
      req(ex.lines?.filter((l) => gap(l.ru) > 0).length === 1, 'exactly one line needs ___')
      req(Number.isInteger(ex.answer) && ex.answer < ex.choices?.length, 'answer index out of range')
      break
    default:
      errors.push(`${w}: unknown type`)
  }
}

function checkLesson(l, where) {
  const at = `${where} ${l.id}`
  for (const g of l.grammar ?? []) claim(g.id, at)
  for (const v of l.vocab ?? []) {
    claim(v.id, at)
    if (!v.ru || !v.es) errors.push(`${at} ${v.id}: vocab needs ru and es`)
    checkStress(v.ru, `${at} ${v.id}`)
    if (v.pos === 'verb' && !v.conj?.present) warnings.push(`${at} ${v.id}: verb without conjugation`)
  }
  for (const r of l.readings ?? []) {
    claim(r.id, at)
    r.questions?.forEach((q, i) => { if (!(q.answer >= 0 && q.answer < q.choices?.length)) errors.push(`${at} ${r.id} q${i}: answer out of range`) })
  }
  for (const ex of l.exercises ?? []) checkExercise(ex, at)
  for (const li of l.listening ?? []) {
    claim(li.id, at)
    if (!li.lines?.length || li.lines.some((x) => !x.ru)) errors.push(`${at} ${li.id}: listening needs lines with ru`)
    li.lines?.forEach((x, i) => { if (x.gender && !['f', 'm'].includes(x.gender)) errors.push(`${at} ${li.id} line ${i}: gender must be f|m`); checkStress(x.ru, `${at} ${li.id}`) })
    if (!(li.questions?.length >= 2)) errors.push(`${at} ${li.id}: needs ≥2 questions`)
    li.questions?.forEach((q, i) => { if (!(q.answer >= 0 && q.answer < q.choices?.length)) errors.push(`${at} ${li.id} q${i}: answer out of range`) })
  }
}

const summary = []
for (const dir of ['chapters', 'extra']) {
  const path = join(root, dir)
  if (!existsSync(path)) continue
  for (const f of readdirSync(path).filter((f) => f.endsWith('.json')).sort()) {
    let data
    try { data = JSON.parse(readFileSync(join(path, f), 'utf8')) } catch (e) { errors.push(`${dir}/${f}: invalid JSON — ${e.message}`); continue }
    for (const l of data.lessons ?? []) {
      checkLesson(l, `${dir}/${f}`)
      summary.push(`${dir}/${f} ${l.id}: ${l.vocab?.length ?? 0} vocab, ${l.grammar?.length ?? 0} grammar, ${l.exercises?.length ?? 0} exercises`)
    }
    for (const v of data.sneakIns ?? []) claim(v.id, `${dir}/${f} sneakIns`)
  }
}

console.log(summary.join('\n'))
if (warnings.length) console.log(`\n${warnings.length} warning(s):\n  ` + warnings.slice(0, 40).join('\n  ') + (warnings.length > 40 ? '\n  …' : ''))
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n  ` + errors.join('\n  '))
  process.exit(1)
}
console.log('\n✓ Content OK')
