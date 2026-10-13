// Pictures for vocabulary with Gemini Nano Banana 2.1, in a Russian storybook painting style.
//   npx tsx scripts/images/build-images.ts [--limit N]
// Every word in src/content/pictures.ts EMOJI gets public/img/vocab/<key>.jpg (480 px) and an entry in
// src/content/photos.json; existing pictures are skipped, so the script resumes where it stopped.
// Stops at the first billing/quota error. Key: ~/.config/rulingo/gemini-key or ~/Downloads/googleapikey.txt.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { EMOJI } from '../../src/content/pictures'
import { audioKey } from '../../src/lib/audioKey'

const ROOT = join(import.meta.dirname, '..', '..')
const OUT = join(ROOT, 'public', 'img', 'vocab')
const RAW = join(import.meta.dirname, 'out')
const INDEX = join(ROOT, 'src', 'content', 'photos.json')
const MODEL = 'gemini-nano-banana-2.1'
const LIMIT = process.argv.includes('--limit') ? Number(process.argv[process.argv.indexOf('--limit') + 1]) : Infinity
for (const d of [OUT, RAW]) mkdirSync(d, { recursive: true })
const keyFile = [join(homedir(), '.config', 'rulingo', 'gemini-key'), join(homedir(), 'Downloads', 'googleapikey.txt')].find(existsSync)!
const KEY = readFileSync(keyFile, 'utf8').trim()

// Spanish meaning of each word, from the course vocabulary (disambiguates words like карта or чек).
const gloss = new Map<string, string>()
for (const dir of ['chapters', 'extra']) for (const f of readdirSync(join(ROOT, 'content', dir)).filter((x) => x.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(ROOT, 'content', dir, f), 'utf8'))
  for (const l of data.lessons ?? []) for (const v of l.vocab ?? []) {
    const w = v.ru.normalize('NFD').replace(/́/g, '').normalize('NFC').toLowerCase()
    if (!gloss.has(w)) gloss.set(w, v.es)
  }
}

const STYLE = 'A charming Russian folk-storybook painting, in the spirit of classic Russian fairy-tale book illustrations: ' +
  'gouache and watercolour on textured paper, delicate ink outlines, warm muted natural colours, soft light.'
const RULES = 'Square composition, one clearly recognisable subject centred with generous margin, simple soft background. ' +
  'Show the subject in an ordinary, unmistakable way so a language learner can name it at a glance. ' +
  'Absolutely no text, letters, numbers, labels, signs, logos or watermarks anywhere (flags and objects must have no writing).'

/** Clearer subjects for words whose picture could be confused with another one. */
const HINTS: Record<string, string> = {
  'кофе': 'coffee: a copper Turkish coffee pot (cezve) pouring dark coffee into a small cup, roasted coffee beans scattered around',
  'чай': 'tea: a brass Russian samovar with a glass of amber tea in an ornate metal glass-holder (podstakannik) and a lemon slice',
  'яхта': 'a modern white sailing yacht with a tall mast on blue water',
  // Buildings: show what happens inside or a telling symbol, so they don't all look like the same house.
  'школа': 'a school classroom: children at wooden desks, a teacher at a green blackboard with chalk drawings (no writing)',
  'почта': 'a post office: a blue postbox, a pile of stamped envelopes and parcels tied with string on a counter',
  'отель': 'a hotel reception: a polished desk with a brass service bell, a wall board of room keys, a guest with a suitcase',
  'магазин': 'a small shop: a counter with scales, shelves of jars, bread and goods, a shopkeeper and a customer with a basket',
  'клиника': 'a clinic: a doctor in a white coat with a stethoscope, an examination bed and a red cross on a white cabinet',
  'аэропорт': 'an airport: a large passenger airplane parked by a glass terminal, travellers with suitcases',
  'банк': 'a bank: an open steel safe full of gold coins and banknote bundles behind a counter',
  'визитка': 'a small business card held between two fingers, a neat stack of business cards on a desk (cards are blank)',
  'студент': 'a university student with a backpack and books walking in front of a grand university building',
}
const REDO = new Set(process.argv.includes('--redo') ? process.argv[process.argv.indexOf('--redo') + 1].split(',') : [])

const index: Record<string, string> = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, 'utf8')) : {}
let made = 0, stopped = ''
for (const [word, emoji] of Object.entries(EMOJI)) {
  if (made >= LIMIT || stopped) break
  const file = `${audioKey(word)}.jpg`
  if (index[word] && existsSync(join(OUT, file)) && !REDO.has(word)) continue
  const es = gloss.get(word) ?? word
  const subject = HINTS[word] ? `${HINTS[word]} (Russian word «${word}»)` : `«${es}» (Russian word «${word}»; the thing shown by the emoji ${emoji})`
  const prompt = `${STYLE} Subject: ${subject}. ${RULES}`
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST', headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } } }),
    }).then((r) => r.json()).catch((e) => ({ error: { message: String(e) } }))
    const part = res.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)
    if (part) {
      const raw = join(RAW, `${audioKey(word)}.${part.inlineData.mimeType.includes('png') ? 'png' : 'jpg'}`)
      writeFileSync(raw, Buffer.from(part.inlineData.data, 'base64'))
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', '-Z', '480', raw, '--out', join(OUT, file)], { stdio: 'ignore' })
      index[word] = `img/vocab/${file}`
      writeFileSync(INDEX, JSON.stringify(index, null, 1) + '\n')
      made++
      process.stdout.write(`✓ ${word}\n`)
      break
    }
    const msg = JSON.stringify(res)
    if (/billing|prepay|credit|quota|per day|PERMISSION|API key/i.test(msg)) { stopped = msg.slice(0, 300); break }
    process.stdout.write(`… ${word}: ${msg.slice(0, 160)}\n`)
    await new Promise((r) => setTimeout(r, 15000 * (attempt + 1)))
  }
}
console.log(`\n${made} nuevas · ${Object.keys(index).length}/${Object.keys(EMOJI).length} en total${stopped ? `\nPARÓ: ${stopped}` : ''}`)
