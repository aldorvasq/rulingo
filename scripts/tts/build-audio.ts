// Pre-generate pronunciation clips with Google Cloud TTS (ru-RU Wavenet, stress marks kept).
//   npx tsx scripts/tts/build-audio.ts            → generate what's missing
//   npx tsx scripts/tts/build-audio.ts --dry-run  → only count texts / characters
// Output: public/audio/c/<key>.mp3 (words & sentences), public/audio/l/<id>-<key>.mp3 (listening),
// and public/audio/manifest.json, which the app reads to know which texts have a recording.
// Auth: your own gcloud login (`gcloud auth login`); nothing secret is stored in the project.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { audioKey, fillGap, normalizeForAudio } from '../../src/lib/audioKey'
import { WORDS, TWISTERS } from '../../src/content/culture'
import type { Chapter, ExtraPack, Listening } from '../../src/content/types'

const ROOT = join(import.meta.dirname, '..', '..')
const OUT = join(ROOT, 'public', 'audio')
const DRY = process.argv.includes('--dry-run')

// Wavenet: A, C, E female; B, D male. Single texts rotate over all five for variety.
const FEMALE = ['ru-RU-Wavenet-A', 'ru-RU-Wavenet-C', 'ru-RU-Wavenet-E']
const MALE = ['ru-RU-Wavenet-B', 'ru-RU-Wavenet-D']
const ALL = [...FEMALE, ...MALE]
const hashNum = (s: string) => parseInt(audioKey(s).slice(-6), 36)

// ---------------------------------------------------------------- collect texts

const texts = new Set<string>()
const add = (t?: string) => {
  if (t && /[а-яё]/i.test(t) && !/_{2,}/.test(t)) texts.add(normalizeForAudio(t))
}
const listening: Listening[] = []

const files = [
  ...readdirSync(join(ROOT, 'content', 'chapters')).map((f) => join(ROOT, 'content', 'chapters', f)),
  ...readdirSync(join(ROOT, 'content', 'extra')).map((f) => join(ROOT, 'content', 'extra', f)),
].filter((f) => f.endsWith('.json'))

for (const f of files) {
  const data = JSON.parse(readFileSync(f, 'utf8')) as Chapter & ExtraPack
  for (const v of data.sneakIns ?? []) add(v.ru)
  for (const l of data.lessons ?? []) {
    for (const v of l.vocab ?? []) { add(v.ru); v.antonyms?.forEach(add) }
    for (const p of l.phrases ?? []) add(p.ru)
    for (const s of l.sentences ?? []) add(s.ru)
    for (const g of l.grammar ?? []) g.examples?.forEach((e) => add(e.ru))
    for (const r of l.readings ?? []) add(r.textRu)
    for (const li of l.listening ?? []) listening.push(li)
    for (const e of l.exercises ?? []) {
      switch (e.type) {
        case 'fill_choice': add(fillGap(e.sentence, e.choices[e.answer])); break
        case 'fill_typed': add(fillGap(e.sentence, e.answers[0])); break
        case 'antonym': case 'synonym': add(e.word); add(e.answers[0]); break
        case 'translate': if (e.direction === 'es-ru') add(e.answers[0]); else add(e.prompt); break
        case 'transform': add(e.prompt); add(e.answers[0]); break
        case 'word_order': add(e.answer); break
        case 'dialogue': e.lines.forEach((x) => add(x.ru.includes('___') ? fillGap(x.ru, e.choices[e.answer]) : x.ru)); break
        case 'conjugate': add(e.verb); break
        case 'error_spot': {
          const w = e.sentence.split(/\s+/)
          w[e.wrongWord] = e.correction
          add(w.join(' '))
          break
        }
      }
    }
  }
}
for (const w of WORDS) add(w.ru)
for (const t of TWISTERS) add(t.ru)
// Seasonal words (defined inline in seasons.ts).
const seasonsSrc = readFileSync(join(ROOT, 'src', 'content', 'seasons.ts'), 'utf8')
for (const m of seasonsSrc.matchAll(/\{ ru: '([^']+)', es:/g)) add(m[1])

const all = [...texts]
const chars = all.reduce((n, t) => n + t.length, 0) + listening.reduce((n, l) => n + l.lines.reduce((m, x) => m + x.ru.length, 0), 0)
console.log(`${all.length} textos + ${listening.length} audios de escucha · ${chars} caracteres`)
if (DRY) process.exit(0)

// ---------------------------------------------------------------- synthesis

const gcloud = '/opt/homebrew/share/google-cloud-sdk/bin/gcloud'
let token = execFileSync(gcloud, ['auth', 'print-access-token']).toString().trim()
const project = execFileSync(gcloud, ['config', 'get-value', 'project']).toString().trim()

async function synth(text: string, voice: string, file: string) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'x-goog-user-project': project, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'ru-RU', name: voice },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9, sampleRateHertz: 24000 },
      }),
    })
    const json = (await res.json()) as { audioContent?: string; error?: { code: number; message: string } }
    if (json.audioContent) return writeFileSync(file, Buffer.from(json.audioContent, 'base64'))
    if (json.error?.code === 401) token = execFileSync(gcloud, ['auth', 'print-access-token']).toString().trim()
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    if (attempt === 3) throw new Error(`${text}: ${json.error?.message}`)
  }
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0
  let done = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const x = items[i++]
      await fn(x)
      if (++done % 50 === 0) process.stdout.write(`${done}/${items.length} `)
    }
  }))
}

mkdirSync(join(OUT, 'c'), { recursive: true })
mkdirSync(join(OUT, 'l'), { recursive: true })

const missing = all.filter((t) => !existsSync(join(OUT, 'c', `${audioKey(t)}.mp3`)))
console.log(`Generando ${missing.length} clips nuevos…`)
await pool(missing, 6, (t) => synth(t, ALL[hashNum(t) % ALL.length], join(OUT, 'c', `${audioKey(t)}.mp3`)))

// Listening: one voice per speaker (by gender), lines joined with short pauses.
const listeningFiles: Record<string, { file: string; starts: number[]; speakers: string[] }> = {}
const duration = (f: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim())
const GAP = 0.6
const tmp = join(tmpdir(), 'ru-listening')
mkdirSync(tmp, { recursive: true })
for (const li of listening) {
  const key = audioKey(li.lines.map((l) => `${l.speaker}|${l.gender}|${l.ru}`).join('\n'))
  const name = `${li.id}-${key}.mp3`
  // Sidecar with each line's start time (for speaker highlighting and tap-to-seek in the transcript).
  const sidecar = join(OUT, 'l', `${name}.json`)
  const speakersOf = li.lines.map((l) => l.speaker ?? 'narrador')
  if (existsSync(join(OUT, 'l', name)) && existsSync(sidecar)) {
    listeningFiles[li.id] = { file: `l/${name}`, starts: JSON.parse(readFileSync(sidecar, 'utf8')), speakers: speakersOf }
    continue
  }
  const speakers = [...new Set(li.lines.map((l) => l.speaker ?? 'narrador'))]
  const voiceOf = new Map<string, string>()
  let f = hashNum(li.id)
  let m = hashNum(li.id) + 1
  for (const s of speakers) {
    const g = li.lines.find((l) => (l.speaker ?? 'narrador') === s)?.gender ?? 'f'
    voiceOf.set(s, g === 'm' ? MALE[m++ % MALE.length] : FEMALE[f++ % FEMALE.length])
  }
  const parts: string[] = []
  for (const [i, line] of li.lines.entries()) {
    const p = join(tmp, `${li.id}-${i}.mp3`)
    await synth(line.ru, voiceOf.get(line.speaker ?? 'narrador')!, p)
    parts.push(p)
  }
  const silence = join(tmp, 'silence.mp3')
  if (!existsSync(silence)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(GAP), '-q:a', '9', silence])
  const starts: number[] = []
  let t = 0
  for (const p of parts) { starts.push(Math.round(t * 100) / 100); t += duration(p) + duration(silence) }
  const list = join(tmp, `${li.id}.txt`)
  writeFileSync(list, parts.flatMap((p, i) => (i ? [silence, p] : [p])).map((p) => `file '${p}'`).join('\n'))
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', '24000', '-b:a', '48k', join(OUT, 'l', name)])
  writeFileSync(sidecar, JSON.stringify(starts))
  listeningFiles[li.id] = { file: `l/${name}`, starts, speakers: speakersOf }
  process.stdout.write('♪')
}

// Manifest: only what exists on disk.
const clips = all.map(audioKey).filter((k) => existsSync(join(OUT, 'c', `${k}.mp3`)))
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ v: 1, clips, listening: listeningFiles }))
console.log(`\nListo: ${clips.length} clips, ${Object.keys(listeningFiles).length} audios de escucha → public/audio/manifest.json`)
