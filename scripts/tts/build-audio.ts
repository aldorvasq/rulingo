// Recordings with Gemini 3.8 Flash TTS (Gemini API), checked with local Whisper — on a daily budget.
//   npx tsx scripts/tts/build-audio.ts [--budget 95]   → spend at most N API requests, then write the manifest
//   npx tsx scripts/tts/build-audio.ts --dry-run       → only count what's left
// The project's Tier-1 limit is 100 requests/day, so this runs once a day (see scripts/tts/daily.sh) and
// resumes where it stopped. Priority: listening → readings → sentences → phrases → words & their examples.
// Anything not yet re-recorded keeps its earlier Wavenet recording (public/audio/wavenet-manifest.json).
//
// Clips: public/audio/c2/<key>.mp3 (Kore/Puck). Listening: public/audio/l/<id>-g38-<key>.mp3 — one or two
// speakers → one conversational request; more → consecutive two-speaker stretches joined with pauses.
// Every new file is transcribed with Whisper (qa_check.py): instructions read aloud or extra/missing words
// → regenerated on a later run; Whisper also gives each line's start time for the transcript.
// Key: GEMINI_KEY_FILE, else ~/.config/rulingo/gemini-key, else ~/Downloads/googleapikey.txt (never printed).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { audioKey, fillGap, normalizeForAudio } from '../../src/lib/audioKey'
import { WORDS, TWISTERS } from '../../src/content/culture'
import type { Chapter, ExtraPack, Listening } from '../../src/content/types'

const ROOT = join(import.meta.dirname, '..', '..')
const OUT = join(ROOT, 'public', 'audio')
const CACHE = join(import.meta.dirname, 'cache')
const DRY = process.argv.includes('--dry-run')
const BUDGET = Number(process.argv[process.argv.indexOf('--budget') + 1]) || 95
const MODEL = 'gemini-3.8-flash-tts'
const CLIP_DIR = 'c2'
for (const d of [join(OUT, CLIP_DIR), join(OUT, 'l'), join(CACHE, 'segments')]) mkdirSync(d, { recursive: true })

const FEMALE = ['Kore', 'Aoede', 'Leda']
const MALE = ['Puck', 'Charon']
const hashNum = (s: string) => parseInt(audioKey(s).slice(-6), 36)

// ---------------------------------------------------------------- collect texts, with priority
const prio = new Map<string, number>() // lower = sooner
const add = (t: string | undefined, p: number) => {
  if (!t || !/[а-яё]/i.test(t) || /_{2,}/.test(t)) return
  const k = normalizeForAudio(t)
  prio.set(k, Math.min(prio.get(k) ?? 9, p))
}
const READING = 1, SENTENCE = 2, PHRASE = 3, WORD = 4
const listening: Listening[] = []
const files = [
  ...readdirSync(join(ROOT, 'content', 'chapters')).map((f) => join(ROOT, 'content', 'chapters', f)),
  ...readdirSync(join(ROOT, 'content', 'extra')).map((f) => join(ROOT, 'content', 'extra', f)),
].filter((f) => f.endsWith('.json'))
for (const f of files) {
  const data = JSON.parse(readFileSync(f, 'utf8')) as Chapter & ExtraPack
  for (const v of data.sneakIns ?? []) { add(v.ru, WORD); add(v.example?.ru, WORD) }
  for (const l of data.lessons ?? []) {
    for (const v of l.vocab ?? []) { add(v.ru, WORD); add(v.example?.ru, WORD); v.antonyms?.forEach((a) => add(a, WORD)) }
    for (const p of l.phrases ?? []) add(p.ru, PHRASE)
    for (const s of l.sentences ?? []) add(s.ru, SENTENCE)
    for (const g of l.grammar ?? []) g.examples?.forEach((e) => add(e.ru, SENTENCE))
    for (const r of l.readings ?? []) add(r.textRu, READING)
    for (const li of l.listening ?? []) listening.push(li)
    for (const e of l.exercises ?? []) {
      switch (e.type) {
        case 'fill_choice': add(fillGap(e.sentence, e.choices[e.answer]), SENTENCE); break
        case 'fill_typed': add(fillGap(e.sentence, e.answers[0]), SENTENCE); break
        case 'antonym': case 'synonym': add(e.word, WORD); add(e.answers[0], WORD); break
        case 'translate': add(e.direction === 'es-ru' ? e.answers[0] : e.prompt, SENTENCE); break
        case 'transform': add(e.prompt, SENTENCE); add(e.answers[0], SENTENCE); break
        case 'word_order': add(e.answer, SENTENCE); break
        case 'dialogue': e.lines.forEach((x) => add(x.ru.includes('___') ? fillGap(x.ru, e.choices[e.answer]) : x.ru, SENTENCE)); break
        case 'conjugate': add(e.verb, WORD); break
        case 'error_spot': { const w = e.sentence.split(/\s+/); w[e.wrongWord] = e.correction; add(w.join(' '), SENTENCE); break }
      }
    }
  }
}
for (const w of WORDS) add(w.ru, PHRASE)
for (const t of TWISTERS) add(t.ru, PHRASE)
for (const m of readFileSync(join(ROOT, 'src', 'content', 'seasons.ts'), 'utf8').matchAll(/\{ ru: '([^']+)', es:/g)) add(m[1], PHRASE)
const all = [...prio.keys()].sort((a, b) => prio.get(a)! - prio.get(b)! || a.localeCompare(b))

// ---------------------------------------------------------------- QA bookkeeping
const QA_FILE = join(CACHE, 'qa38.json')
const qa: Record<string, { ok: boolean; tries: number; starts?: number[] }> = existsSync(QA_FILE) ? JSON.parse(readFileSync(QA_FILE, 'utf8')) : {}
const clipFile = (t: string) => join(OUT, CLIP_DIR, `${audioKey(t)}.mp3`)
const clipDone = (t: string) => existsSync(clipFile(t)) && qa[clipFile(t)]?.ok
const clipNeeds = (t: string) => !existsSync(clipFile(t)) || (!qa[clipFile(t)]?.ok && (qa[clipFile(t)]?.tries ?? 0) < 3)

// ---------------------------------------------------------------- listening plan
const voiceOf = new Map<string, string>()
const speakerOf = (li: Listening, i: number) => li.lines[i].speaker ?? li.cast?.[0]?.name ?? 'narrador'
function voicesFor(li: Listening): Map<string, string> {
  const m = new Map<string, string>()
  for (const s of new Set(li.lines.map((_, i) => speakerOf(li, i)))) {
    const g = li.lines.find((l) => (l.speaker ?? 'narrador') === s)?.gender ?? li.cast?.find((c) => c.name === s)?.gender ?? 'f'
    const list = g === 'm' ? MALE : FEMALE
    let v = voiceOf.get(s) ?? list[hashNum(s) % list.length]
    if ([...m.values()].includes(v)) v = list.find((x) => ![...m.values()].includes(x)) ?? v
    if (!voiceOf.has(s)) voiceOf.set(s, v)
    m.set(s, v)
  }
  return m
}
/** Consecutive stretches of lines with at most two distinct speakers (each = one request). */
function segments(li: Listening): number[][] {
  const out: number[][] = []
  let cur: number[] = []
  let who = new Set<string>()
  li.lines.forEach((_, i) => {
    const s = speakerOf(li, i)
    if (!who.has(s) && who.size === 2) { out.push(cur); cur = []; who = new Set() }
    cur.push(i)
    who.add(s)
  })
  if (cur.length) out.push(cur)
  return out
}
const pieceFile = (li: Listening) => join(OUT, 'l', `${li.id}-g38-${audioKey(MODEL + JSON.stringify([...voicesFor(li)]) + li.lines.map((l) => `${l.speaker}|${l.tone}|${l.ru}`).join('\n') + (li.scene ?? ''))}.mp3`)
const pieceDone = (li: Listening) => existsSync(pieceFile(li)) && qa[pieceFile(li)]?.ok
const pieceNeeds = (li: Listening) => !existsSync(pieceFile(li)) || (!qa[pieceFile(li)]?.ok && (qa[pieceFile(li)]?.tries ?? 0) < 3)

const leftListening = listening.filter(pieceNeeds)
const leftClips = all.filter(clipNeeds)
const reqListening = leftListening.reduce((n, li) => n + segments(li).length, 0)
console.log(`Pendiente: ${leftListening.length} audios de escucha (${reqListening} solicitudes) + ${leftClips.length} clips · presupuesto de hoy: ${BUDGET}`)
if (DRY) process.exit(0)

// ---------------------------------------------------------------- Gemini 3.8 TTS with a request budget
const keyFile = [process.env.GEMINI_KEY_FILE, join(homedir(), '.config', 'rulingo', 'gemini-key'), join(homedir(), 'Downloads', 'googleapikey.txt')].find((f) => f && existsSync(f))
if (!keyFile) throw new Error('No Gemini API key file found')
const KEY = readFileSync(keyFile, 'utf8').trim()
let requests = 0
let stopped = ''
let audioSeconds = 0
const duration = (f: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim())

type Turn = { text: string; style: string; speaker?: string }
async function tts(turns: Turn[], speech: unknown, mp3: string): Promise<boolean> {
  for (let attempt = 0; attempt < 4; attempt++) {
    if (stopped) return false
    if (requests >= BUDGET) { stopped = 'presupuesto diario usado'; return false }
    requests++
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST', headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        input: [{ type: 'user_input', content: turns.map((t) => ({ type: 'text', text: t.text, annotations: [{ type: 'speech_metadata', style: t.style, ...(t.speaker ? { speaker: t.speaker } : {}) }] })) }],
        response_format: { type: 'audio' },
        generation_config: { speech_config: speech },
      }),
    }).then((r) => r.json()).catch((e) => ({ error: { message: String(e) } }))
    const audio = (res.steps ?? []).filter((s: any) => s.type === 'model_output').flatMap((s: any) => s.content ?? []).filter((c: any) => c.type === 'audio').at(-1)
    if (audio) {
      const wav = mp3.replace(/\.mp3$/, '.wav')
      writeFileSync(wav, Buffer.from(audio.data, 'base64'))
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '24000', '-b:a', '48k', mp3])
      audioSeconds += duration(mp3)
      return true
    }
    const msg = JSON.stringify(res)
    if (/per day|prepayment|billing|PERMISSION|API key/i.test(msg)) { stopped = msg.slice(0, 200); return false }
    await new Promise((r) => setTimeout(r, 8000 * (attempt + 1)))
  }
  return false
}

function runQa(jobs: { file: string; text: string; lines?: string[]; single?: boolean }[]) {
  jobs = jobs.filter((j) => existsSync(j.file))
  if (!jobs.length) return
  const jf = join(CACHE, 'qa-jobs.json')
  const rf = join(CACHE, 'qa-results.json')
  writeFileSync(jf, JSON.stringify(jobs))
  execFileSync(join(ROOT, '.venv-transcribe', 'bin', 'python'), [join(import.meta.dirname, 'qa_check.py'), jf, rf], { stdio: ['ignore', 'ignore', 'ignore'] })
  const res = JSON.parse(readFileSync(rf, 'utf8')) as { ok: boolean; starts?: number[] }[]
  jobs.forEach((j, i) => { qa[j.file] = { ok: res[i].ok, tries: (qa[j.file]?.tries ?? 0) + 1, starts: res[i].starts } })
  writeFileSync(QA_FILE, JSON.stringify(qa))
}

// ---------------------------------------------------------------- 1. listening
const styleOf = (li: Listening, tone?: string) => [tone, li.scene].filter(Boolean).join('; ') || 'natural, conversational'
const silence = join(CACHE, 'silence.mp3')
if (!existsSync(silence)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.5', '-q:a', '9', silence])

async function buildPiece(li: Listening): Promise<boolean> {
  const v = voicesFor(li)
  const segs = segments(li)
  const parts: string[] = []
  for (const seg of segs) {
    const who = [...new Set(seg.map((i) => speakerOf(li, i)))]
    const key = audioKey(MODEL + JSON.stringify(who.map((s) => v.get(s))) + seg.map((i) => `${li.lines[i].tone}|${li.lines[i].ru}`).join('\n') + (li.scene ?? ''))
    const part = segs.length === 1 ? pieceFile(li) : join(CACHE, 'segments', `${key}.mp3`)
    if (segs.length > 1 && existsSync(part)) { parts.push(part); continue }
    const turns = seg.map((i) => ({ text: li.lines[i].ru, style: styleOf(li, li.lines[i].tone), speaker: who.length === 2 ? speakerOf(li, i) : undefined }))
    const speech = who.length === 2 ? { mode: 'conversational', speakers: who.map((s) => ({ speaker: s, voice: v.get(s) })) } : [{ voice: v.get(who[0]) }]
    if (!(await tts(turns, speech, part))) return false
    parts.push(part)
  }
  if (segs.length > 1) {
    const list = join(CACHE, `${li.id}.txt`)
    writeFileSync(list, parts.flatMap((p, i) => (i ? [silence, p] : [p])).map((p) => `file '${p}'`).join('\n'))
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', '24000', '-b:a', '56k', pieceFile(li)])
  }
  return true
}

const madePieces: Listening[] = []
for (const li of leftListening) {
  if (stopped) break
  if (await buildPiece(li)) { madePieces.push(li); process.stdout.write('♪') }
}
if (madePieces.length) {
  console.log(`\nRevisando ${madePieces.length} audios de escucha con Whisper…`)
  runQa(madePieces.map((li) => ({ file: pieceFile(li), text: li.lines.map((l) => l.ru).join(' '), lines: li.lines.map((l) => l.ru) })))
}

// ---------------------------------------------------------------- 2. clips (by priority)
const isSingle = (t: string) => t.split(/\s+/).length <= 2
const clipStyle = (t: string) => isSingle(t)
  ? 'Clear, natural pronunciation for a language learner; native Russian speaker; follow the stress marks exactly.'
  : 'Natural, friendly conversational Russian, clear for a learner; follow the stress marks exactly.'
const madeClips: string[] = []
for (const t of leftClips) {
  if (stopped) break
  if (await tts([{ text: t, style: clipStyle(t) }], [{ voice: hashNum(t) % 2 ? 'Puck' : 'Kore' }], clipFile(t))) madeClips.push(t)
}
if (madeClips.length) {
  console.log(`Revisando ${madeClips.length} clips con Whisper…`)
  runQa(madeClips.map((t) => ({ file: clipFile(t), text: t, single: isSingle(t) })))
}

// ---------------------------------------------------------------- manifest: Gemini where verified, else Wavenet
const wavenet = JSON.parse(readFileSync(join(OUT, 'wavenet-manifest.json'), 'utf8')) as { clips: string[]; listening: Record<string, unknown> }
const listeningIndex: Record<string, unknown> = { ...wavenet.listening }
for (const li of listening) {
  if (pieceDone(li)) {
    listeningIndex[li.id] = { file: `l/${pieceFile(li).split('/').pop()}`, starts: qa[pieceFile(li)]?.starts ?? [], speakers: li.lines.map((_, i) => speakerOf(li, i)) }
  }
}
const gemClips = all.filter(clipDone).map(audioKey)
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ v: 3, sets: { [CLIP_DIR]: gemClips, c: wavenet.clips }, listening: listeningIndex }))

const gemListening = listening.filter(pieceDone).length
console.log(`\nHoy: ${requests} solicitudes${stopped ? ` (paró: ${stopped})` : ''} · ${(audioSeconds / 60).toFixed(1)} min de audio ≈ $${((audioSeconds / 10) * 0.00225).toFixed(2)}`)
console.log(`Total con Gemini 3.8: ${gemListening}/${listening.length} audios de escucha · ${gemClips.length}/${all.length} clips`)
