// Recordings with Gemini 3.8 Flash TTS (Gemini API), checked with local Whisper — on a daily budget.
//   npx tsx scripts/tts/build-audio.ts [--budget 95]   → spend at most N API requests, then write the manifest
//   npx tsx scripts/tts/build-audio.ts --dry-run       → only count what's left
// The project's Tier-1 limit is 100 requests/day, so this runs once a day (see scripts/tts/daily.sh) and
// resumes where it stopped. Priority: listening → readings → sentences → phrases → words & their examples.
// Anything not yet re-recorded keeps its earlier Wavenet recording (public/audio/wavenet-manifest.json).
//
// Clips: public/audio/c2/<key>.mp3 (Kore/Puck); single words are read ~20 per request as a list and cut at the pauses. Listening: public/audio/l/<id>-g38-<key>.mp3 — one or two
// speakers → one conversational request; more → consecutive two-speaker stretches joined with pauses.
// Every new file is transcribed with Whisper (qa_check.py): instructions read aloud or extra/missing words
// → regenerated on a later run; Whisper also gives each line's start time for the transcript, and a character
// whose pitch jumps far from their usual voice (voice_check.py) also fails. Every line of a character carries
// the same persona description so the model keeps one voice per person.
// Key: GEMINI_KEY_FILE, else ~/.config/rulingo/gemini-key, else ~/Downloads/googleapikey.txt (never printed).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { audioKey, fillGap, normalizeForAudio } from '../../src/lib/audioKey'
import { WORDS, TWISTERS } from '../../src/content/culture'
import type { Chapter, ExtraPack, Listening } from '../../src/content/types'

const ROOT = join(import.meta.dirname, '..', '..')
const OUT = join(ROOT, 'public', 'audio')
const CACHE = join(import.meta.dirname, 'cache')
const DRY = process.argv.includes('--dry-run')
const budgetArg = process.argv.indexOf('--budget')
const BUDGET = budgetArg >= 0 && Number.isFinite(Number(process.argv[budgetArg + 1])) ? Number(process.argv[budgetArg + 1]) : 95
const MODEL = 'gemini-3.8-flash-tts'
const CLIP_DIR = 'c2'
for (const d of [join(OUT, CLIP_DIR), join(OUT, 'l'), join(CACHE, 'segments'), join(CACHE, 'wav')]) mkdirSync(d, { recursive: true })

const FEMALE = ['Kore', 'Aoede', 'Leda']
const MALE = ['Puck', 'Charon']
const hashNum = (s: string) => parseInt(audioKey(s).slice(-6), 36)

// ---------------------------------------------------------------- collect texts, with priority
const prio = new Map<string, number>() // lower = sooner
const addText = (t: string | undefined, p: number) => {
  if (!t || !/[а-яё]/i.test(t) || /_{2,}/.test(t)) return
  const k = normalizeForAudio(t)
  prio.set(k, Math.min(prio.get(k) ?? 9, p))
}
const add = addText
const READING = 1, SENTENCE = 2, PHRASE = 3, WORD = 4
/** The lesson the class is on: all its texts (words first, then sentences) jump ahead of everything older. */
const FOCUS = new Set(['4.1'])
const FOCUS_BOOST = -10
const listening: Listening[] = []
const files = [
  ...readdirSync(join(ROOT, 'content', 'chapters')).map((f) => join(ROOT, 'content', 'chapters', f)),
  ...readdirSync(join(ROOT, 'content', 'extra')).map((f) => join(ROOT, 'content', 'extra', f)),
].filter((f) => f.endsWith('.json'))
for (const f of files) {
  const data = JSON.parse(readFileSync(f, 'utf8')) as Chapter & ExtraPack
  const chapterBoost = [...FOCUS].some((id) => id.startsWith(`${data.chapter}.`)) ? FOCUS_BOOST : 0
  for (const v of data.sneakIns ?? []) { addText(v.ru, WORD + chapterBoost); addText(v.example?.ru, WORD + chapterBoost) }
  for (const l of data.lessons ?? []) {
    const boost = FOCUS.has(l.id) ? FOCUS_BOOST : 0
    const add = (t: string | undefined, p: number) => addText(t, p + boost)
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
const qa: Record<string, { ok: boolean; tries: number; starts?: number[]; listFail?: boolean; fromList?: boolean }> = existsSync(QA_FILE) ? JSON.parse(readFileSync(QA_FILE, 'utf8')) : {}
const clipFile = (t: string) => join(OUT, CLIP_DIR, `${audioKey(t)}.mp3`)
const clipDone = (t: string) => existsSync(clipFile(t)) && qa[clipFile(t)]?.ok
const clipNeeds = (t: string) => !existsSync(clipFile(t)) || (!qa[clipFile(t)]?.ok && (qa[clipFile(t)]?.tries ?? 0) < 3)

// ---------------------------------------------------------------- listening plan
// v2: persona-anchored styles (v1 described each line from scratch and voices drifted between lines).
const STYLE_V = 'v2'
/** Older pieces whose voices drift (flagged-listening.json); those marked "redo" get re-recorded with the current prompt. */
const flagged = JSON.parse(readFileSync(join(import.meta.dirname, 'flagged-listening.json'), 'utf8')).pieces as Record<string, { file: string; redo: boolean }>
const redo = (li: Listening) => !!flagged[li.id]?.redo
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
const pieceFile = (li: Listening) => join(OUT, 'l', `${li.id}-g38-${audioKey(MODEL + (redo(li) ? STYLE_V : '') + JSON.stringify([...voicesFor(li)]) + li.lines.map((l) => `${l.speaker}|${l.tone}|${l.ru}`).join('\n') + (li.scene ?? ''))}.mp3`)
const pieceDone = (li: Listening) => existsSync(pieceFile(li)) && qa[pieceFile(li)]?.ok
const pieceNeeds = (li: Listening) => !existsSync(pieceFile(li)) || (!qa[pieceFile(li)]?.ok && (qa[pieceFile(li)]?.tries ?? 0) < 3)

const leftListening = listening.filter(pieceNeeds).sort((a, b) => Number(FOCUS.has(b.id.split("-")[0])) - Number(FOCUS.has(a.id.split("-")[0])))
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
      // The raw WAV stays in the private cache; only the mp3 is published.
      const wav = join(CACHE, 'wav', mp3.split('/').pop()!.replace(/\.mp3$/, '.wav'))
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

function runQa(jobs: { file: string; text: string; lines?: string[]; speakers?: string[]; single?: boolean; fromList?: boolean }[]) {
  jobs = jobs.filter((j) => existsSync(j.file))
  if (!jobs.length) return
  const jf = join(CACHE, 'qa-jobs.json')
  const rf = join(CACHE, 'qa-results.json')
  writeFileSync(jf, JSON.stringify(jobs))
  execFileSync(join(ROOT, '.venv-transcribe', 'bin', 'python'), [join(import.meta.dirname, 'qa_check.py'), jf, rf], { stdio: ['ignore', 'ignore', 'ignore'] })
  const res = JSON.parse(readFileSync(rf, 'utf8')) as { ok: boolean; starts?: number[] }[]
  jobs.forEach((j, i) => { qa[j.file] = { ok: res[i].ok, tries: (qa[j.file]?.tries ?? 0) + 1, starts: res[i].starts, ...(j.fromList ? { fromList: true } : {}) } })
  writeFileSync(QA_FILE, JSON.stringify(qa))
}

// ---------------------------------------------------------------- 1. listening
/** Who the speaker is: the same description on every one of their lines, so the voice never turns into someone else. */
function personaOf(li: Listening, s: string): string {
  const c = li.cast?.find((x) => x.name === s)
  const g = c?.gender ?? li.lines.find((l) => l.speaker === s)?.gender ?? 'f'
  const age = c?.age ?? 'adult'
  const who = {
    child: g === 'm' ? 'a boy of about eight' : 'a girl of about eight',
    young: g === 'm' ? 'a young man in his twenties' : 'a young woman in her twenties',
    adult: g === 'm' ? 'a man in his forties' : 'a woman in her forties',
    old: g === 'm' ? 'an elderly man in his seventies' : 'an elderly woman in her seventies',
  }[age]
  return `${s.replace(/\u0301/g, '')}, ${who}, native Russian speaker`
}
const styleOf = (li: Listening, s: string, tone?: string) =>
  `Speaker: ${personaOf(li, s)}. Keep exactly the same voice, age, pitch and timbre as in all of this speaker's other lines; only the feeling changes, and only slightly. ` +
  `Feeling: ${tone ?? 'natural, conversational'}.${li.scene ? ` Scene: ${li.scene}.` : ''} Follow the stress marks exactly.`
const silence = join(CACHE, 'silence.mp3')
if (!existsSync(silence)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.5', '-q:a', '9', silence])

async function buildPiece(li: Listening): Promise<boolean> {
  const v = voicesFor(li)
  const segs = segments(li)
  const parts: string[] = []
  for (const seg of segs) {
    const who = [...new Set(seg.map((i) => speakerOf(li, i)))]
    const key = audioKey(MODEL + STYLE_V + JSON.stringify(who.map((s) => v.get(s))) + seg.map((i) => `${li.lines[i].tone}|${li.lines[i].ru}`).join('\n') + (li.scene ?? ''))
    const part = segs.length === 1 ? pieceFile(li) : join(CACHE, 'segments', `${key}.mp3`)
    if (segs.length > 1 && existsSync(part)) { parts.push(part); continue }
    const turns = seg.map((i) => ({ text: li.lines[i].ru, style: styleOf(li, speakerOf(li, i), li.lines[i].tone), speaker: who.length === 2 ? speakerOf(li, i) : undefined }))
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
  runQa(madePieces.map((li) => ({ file: pieceFile(li), text: li.lines.map((l) => l.ru).join(' '), lines: li.lines.map((l) => l.ru), speakers: li.lines.map((_, i) => speakerOf(li, i)) })))
}

// ---------------------------------------------------------------- 2. clips (by priority)
const isSingle = (t: string) => t.split(/\s+/).length <= 2
const clipStyle = (t: string) => isSingle(t)
  ? 'Clear, natural pronunciation for a language learner; native Russian speaker; follow the stress marks exactly.'
  : 'Natural, friendly conversational Russian, clear for a learner; follow the stress marks exactly.'
const madeClips: string[] = []
const listClips: string[] = []

// 2a. Single words in batches: one request reads ~20 words as a list, cut at the pauses into one clip per word.
// (Tested on 2026-10-12 with stress minimal pairs read back to back: every word clean and correctly stressed.)
const BATCH = 20
const batchable = (t: string) => isSingle(t) && !/[,;:—/()«»]/.test(t.replace(/[.!?]+$/, '')) && !qa[clipFile(t)]?.listFail
const LIST_STYLE = [
  'Recording isolated dictionary headwords for a pronunciation app; native Russian speaker, clear studio voice.',
  'Say every line as its own complete one-word utterance, exactly as if it were the only word being recorded:',
  'the same calm, neutral, gently falling intonation on every word. Never use list intonation: no rising tone,',
  'no trailing off, no speeding up, no change in energy from the first word to the last.',
  'After every word, stay completely silent for about one and a half seconds before the next one.',
  'Pronounce each word in full citation form, following its stress mark (acute accent) exactly.',
  'Neighbouring words may differ only in stress; they are different words, so give each its own stress.',
  'Say each word exactly once. Do not add, skip or repeat anything, and say nothing else.',
].join(' ')
const asLine = (t: string) => `${t[0].toUpperCase()}${t.slice(1)}${/[.!?]$/.test(t) ? '' : '.'}`

/** Cut a list recording at its N-1 longest pauses into the given clip files; false if the pauses don't add up. */
function splitList(file: string, outs: string[]): boolean {
  const log = execFileSync('sh', ['-c', `ffmpeg -hide_banner -i "${file}" -af silencedetect=noise=-38dB:d=0.25 -f null - 2>&1`]).toString()
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1])
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1])
  const total = duration(file)
  const inner = ends.map((e, i) => ({ s: starts[i], e })).filter((g) => g.s > 0.05 && g.e < total - 0.05)
  if (inner.length < outs.length - 1) return false
  const cuts = [...inner].sort((a, b) => (b.e - b.s) - (a.e - a.s)).slice(0, outs.length - 1).sort((a, b) => a.s - b.s)
  const bounds = [[0, cuts[0]?.s ?? total], ...cuts.slice(1).map((c, i) => [cuts[i].e, c.s]), ...(cuts.length ? [[cuts.at(-1)!.e, total]] : [])]
  if (bounds.some(([a, b]) => b - a < 0.25 || b - a > 4)) return false
  // Fade in/out with explicit times (areverse into the mp3 encoder crashes some ffmpeg builds).
  try {
    bounds.forEach(([a, b], i) => {
      const start = Math.max(0, a - 0.08), len = b + 0.12 - start
      // Cut to WAV first, then encode: filtering straight into the mp3 encoder crashes some ffmpeg builds.
      const wav = outs[i].replace(/\.mp3$/, '.cut.wav')
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(start), '-t', String(len), '-i', file,
        '-af', `afade=t=in:d=0.02,afade=t=out:st=${(len - 0.05).toFixed(3)}:d=0.05`, '-ac', '1', '-ar', '24000', wav])
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-b:a', '48k', outs[i]])
      renameSync(wav, join(CACHE, 'segments', 'last-cut.wav'))
    })
  } catch {
    return false
  }
  return true
}

for (const voice of ['Kore', 'Puck']) {
  const words = leftClips.filter((t) => batchable(t) && (hashNum(t) % 2 ? 'Puck' : 'Kore') === voice)
  for (let i = 0; i < words.length; i += BATCH) {
    const group = words.slice(i, i + BATCH)
    const whole = join(CACHE, 'segments', `list-${audioKey(voice + group.join('|'))}.mp3`)
    // A list already recorded (e.g. by a run that stopped early) is reused without a new request.
    if (!existsSync(whole) && (stopped || !(await tts([{ text: group.map(asLine).join('\n'), style: LIST_STYLE }], [{ voice }], whole)))) continue
    audioSeconds -= 0.4 * group.length // pauses between words aren't speech
    if (splitList(whole, group.map(clipFile))) { listClips.push(...group); process.stdout.write('▤') }
    else { for (const t of group) qa[clipFile(t)] = { ...qa[clipFile(t)], ok: false, tries: qa[clipFile(t)]?.tries ?? 0, listFail: true }; process.stdout.write('×') }
  }
}
writeFileSync(QA_FILE, JSON.stringify(qa))

// 2b. Everything else (and words whose list didn't split cleanly): one request per clip.
const listed = new Set(listClips)
for (const t of leftClips) {
  if (stopped) break
  if (listed.has(t) || batchable(t)) continue
  if (await tts([{ text: t, style: clipStyle(t) }], [{ voice: hashNum(t) % 2 ? 'Puck' : 'Kore' }], clipFile(t))) madeClips.push(t)
}
if (madeClips.length || listClips.length) {
  console.log(`\nRevisando ${madeClips.length + listClips.length} clips con Whisper…`)
  runQa([
    ...listClips.map((t) => ({ file: clipFile(t), text: t, fromList: true })),
    ...madeClips.map((t) => ({ file: clipFile(t), text: t, single: isSingle(t) })),
  ])
}

// ---------------------------------------------------------------- manifest: Gemini where verified, else Wavenet
const wavenet = JSON.parse(readFileSync(join(OUT, 'wavenet-manifest.json'), 'utf8')) as { clips: string[]; listening: Record<string, unknown> }
const listeningIndex: Record<string, unknown> = { ...wavenet.listening }
for (const li of listening) {
  if (pieceDone(li)) {
    listeningIndex[li.id] = { file: `l/${pieceFile(li).split('/').pop()}`, starts: qa[pieceFile(li)]?.starts ?? [], speakers: li.lines.map((_, i) => speakerOf(li, i)) }
  } else if (redo(li) && qa[join(OUT, flagged[li.id].file)]?.ok) { // keep the old recording until the redo passes QA
    listeningIndex[li.id] = { file: flagged[li.id].file, starts: qa[join(OUT, flagged[li.id].file)]?.starts ?? [], speakers: li.lines.map((_, i) => speakerOf(li, i)) }
  }
}
const gemClips = all.filter(clipDone).map(audioKey)
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ v: 3, sets: { [CLIP_DIR]: gemClips, c: wavenet.clips }, listening: listeningIndex }))

const gemListening = listening.filter(pieceDone).length
console.log(`\nHoy: ${requests} solicitudes${stopped ? ` (paró: ${stopped})` : ''} · ${(audioSeconds / 60).toFixed(1)} min de audio ≈ $${((audioSeconds / 10) * 0.00225).toFixed(2)}`)
console.log(`Total con Gemini 3.8: ${gemListening}/${listening.length} audios de escucha · ${gemClips.length}/${all.length} clips`)
