// Pilot: Gemini TTS (expressive, steerable with a style prompt) vs the Wavenet-A we use now.
// Same tricky items; Gemini with and without our stress marks, so we can hear whether it follows them.
//   node scripts/tts/gemini-pilot.mjs → scripts/tts/out/gemini/index.html
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const gcloud = '/opt/homebrew/share/google-cloud-sdk/bin/gcloud'
const token = execFileSync(gcloud, ['auth', 'print-access-token']).toString().trim()
const project = execFileSync(gcloud, ['config', 'get-value', 'project']).toString().trim()
const headers = { Authorization: `Bearer ${token}`, 'x-goog-user-project': project, 'Content-Type': 'application/json' }

const STYLE = 'Read this in Russian, naturally and warmly, like a friendly native teacher speaking clearly to beginners. Follow the stress marks exactly.'
const items = [
  'за́мок', 'замо́к', 'до́ма', 'дома́', 'пла́чу', 'плачу́', 'ёлка', 'что', 'со́лнце', 'его́',
  'Приве́т! Как дела́?',
  'Каки́е у вас сосе́ди? Шу́мные и́ли ти́хие?',
  'Но́вые сосе́ди о́чень гро́мко слу́шают му́зыку, а пенсионе́ры внизу́ говоря́т ти́хо.',
  'Здра́вствуйте! Я ва́ша сосе́дка, я живу́ внизу́. Извини́те, но вы о́чень гро́мко слу́шаете му́зыку!',
]
const variants = [
  { label: 'Wavenet-A (actual)', voice: { languageCode: 'ru-RU', name: 'ru-RU-Wavenet-A' }, stress: true },
  { label: 'Gemini Flash · Kore · con acentos', voice: { languageCode: 'ru-RU', name: 'Kore', modelName: 'gemini-2.5-flash-tts' }, stress: true, prompt: STYLE },
  { label: 'Gemini Flash · Kore · sin acentos', voice: { languageCode: 'ru-RU', name: 'Kore', modelName: 'gemini-2.5-flash-tts' }, stress: false, prompt: STYLE },
  { label: 'Gemini Pro · Kore · con acentos', voice: { languageCode: 'ru-RU', name: 'Kore', modelName: 'gemini-2.5-pro-tts' }, stress: true, prompt: STYLE },
  { label: 'Gemini Pro · Puck (m) · con acentos', voice: { languageCode: 'ru-RU', name: 'Puck', modelName: 'gemini-2.5-pro-tts' }, stress: true, prompt: STYLE },
  { label: 'Gemini Pro · Charon (m) · con acentos', voice: { languageCode: 'ru-RU', name: 'Charon', modelName: 'gemini-2.5-pro-tts' }, stress: true, prompt: STYLE },
]

const out = join(here, 'out', 'gemini')
mkdirSync(out, { recursive: true })
const rows = []
for (const [i, text] of items.entries()) {
  const cells = []
  for (const [j, v] of variants.entries()) {
    const t = v.stress ? text : text.normalize('NFD').replace(/́/g, '').normalize('NFC')
    const body = { input: { text: t, ...(v.prompt ? { prompt: v.prompt } : {}) }, voice: v.voice, audioConfig: { audioEncoding: 'MP3' } }
    const file = `${i}-${j}.mp3`
    if (existsSync(join(out, file))) { cells.push(`<td><audio controls preload="none" src="${file}"></audio></td>`); continue }
    let res
    for (let attempt = 0; attempt < 6; attempt++) {
      res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', { method: 'POST', headers, body: JSON.stringify(body) }).then((r) => r.json())
      if (res.audioContent || !/quota|rate/i.test(res.error?.message ?? '')) break
      await new Promise((r) => setTimeout(r, 15000)) // per-minute quota: wait and retry
    }
    if (res.audioContent) writeFileSync(join(out, file), Buffer.from(res.audioContent, 'base64'))
    cells.push(res.audioContent ? `<td><audio controls preload="none" src="${file}"></audio></td>` : `<td style="color:#a33">${(res.error?.message ?? 'error').slice(0, 120)}</td>`)
    process.stdout.write(res.audioContent ? '.' : 'x')
  }
  rows.push(`<tr><td style="font:20px Georgia;max-width:280px">${text}</td>${cells.join('')}</tr>`)
}
const head = variants.map((v) => `<th style="font:13px sans-serif">${v.label}</th>`).join('')
writeFileSync(join(out, 'index.html'), `<meta charset="utf-8"><title>Piloto Gemini TTS</title><table border="1" cellpadding="6"><tr><th>Texto</th>${head}</tr>${rows.join('')}</table>`)
console.log(`\n→ ${join(out, 'index.html')}`)
