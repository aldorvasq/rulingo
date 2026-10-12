// Test: can one Gemini 3.8 request read a list of isolated words, which we then split into one clip per word?
// Compares the split clips with the same words recorded one request each (out/gemini38/w<i>-1.mp3, Kore).
//   node scripts/tts/list-test.mjs        → out/list-test/index.html
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const KEY = readFileSync(join(homedir(), 'Downloads', 'googleapikey.txt'), 'utf8').trim()
const out = join(here, 'out', 'list-test')
mkdirSync(out, { recursive: true })

const words = readFileSync(join(here, 'pilot-items.txt'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 21)

// The text carries only the words, one per line, each closed with a full stop so it is said as a complete,
// stand-alone utterance. Everything about *how* to say them lives in the style annotation (never read aloud).
const text = words.map((w) => `${w[0].toUpperCase()}${w.slice(1)}.`).join('\n')
const style = [
  'Recording isolated dictionary headwords for a pronunciation app; native Russian speaker, clear studio voice.',
  'Say every line as its own complete one-word utterance, exactly as if it were the only word being recorded:',
  'the same calm, neutral, gently falling intonation on every word. Never use list intonation: no rising tone,',
  'no trailing off, no speeding up, no change in energy from the first word to the last.',
  'After every word, stay completely silent for about one and a half seconds before the next one.',
  'Pronounce each word in full citation form, following its stress mark (acute accent) exactly.',
  'Neighbouring words may differ only in stress; they are different words, so give each its own stress.',
  'Say each word exactly once. Do not add, skip or repeat anything, and say nothing else.',
].join(' ')

async function tts(voice, file) {
  if (existsSync(file)) return true
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST', headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemini-3.8-flash-tts',
      input: [{ type: 'user_input', content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style }] }] }],
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice }] },
    }),
  }).then((r) => r.json())
  const audio = (res.steps ?? []).filter((s) => s.type === 'model_output').flatMap((s) => s.content ?? []).filter((c) => c.type === 'audio').at(-1)
  if (!audio) { console.log(voice, JSON.stringify(res).slice(0, 300)); return false }
  const wav = file.replace(/\.mp3$/, '.wav')
  writeFileSync(wav, Buffer.from(audio.data, 'base64'))
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '24000', '-b:a', '64k', file])
  return true
}

/** Cut a list recording at its N-1 longest silences; returns the clip files (or null if the word count doesn't fit). */
function split(file, prefix) {
  const err = execFileSync('sh', ['-c', `ffmpeg -hide_banner -i "${file}" -af silencedetect=noise=-38dB:d=0.25 -f null - 2>&1`]).toString()
  const starts = [...err.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1])
  const ends = [...err.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1])
  const gaps = ends.map((e, i) => ({ s: starts[i], e })).filter((g) => g.s > 0.05)
  const total = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString())
  const inner = gaps.filter((g) => g.e < total - 0.05)
  console.log(`${prefix}: ${inner.length} pauses found for ${words.length - 1} expected · ${total.toFixed(1)} s`)
  if (inner.length < words.length - 1) return { clips: null, gaps: inner, total }
  const cuts = [...inner].sort((a, b) => (b.e - b.s) - (a.e - a.s)).slice(0, words.length - 1).sort((a, b) => a.s - b.s)
  const bounds = [[0, cuts[0].s], ...cuts.slice(1).map((c, i) => [cuts[i].e, c.s]), [cuts.at(-1).e, total]]
  const clips = bounds.map(([a, b], i) => {
    const f = `${prefix}-${String(i).padStart(2, '0')}.mp3`
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-ss', String(Math.max(0, a - 0.08)), '-to', String(b + 0.12), '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse', '-b:a', '64k', join(out, f)])
    return f
  })
  return { clips, gaps: cuts, total }
}

const results = {}
for (const voice of ['Kore', 'Puck']) {
  if (await tts(voice, join(out, `${voice}.mp3`))) results[voice] = split(join(out, `${voice}.mp3`), voice)
}
writeFileSync(join(out, 'split.json'), JSON.stringify({ words, results }, null, 1))
console.log('done')
