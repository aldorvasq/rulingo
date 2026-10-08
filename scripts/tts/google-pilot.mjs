// Pilot: voice the tricky items with Google Cloud TTS Russian voices, two ways each
// (plain text, and text keeping our stress marks), so we can compare by ear.
// Auth: uses your own gcloud login (`gcloud auth login`); no keys are stored in the project.
//   node scripts/tts/google-pilot.mjs [voice1,voice2]   → writes scripts/tts/out/google/*.mp3 + index.html
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const gcloud = '/opt/homebrew/share/google-cloud-sdk/bin/gcloud'
const token = execFileSync(gcloud, ['auth', 'print-access-token']).toString().trim()
const project = execFileSync(gcloud, ['config', 'get-value', 'project']).toString().trim()
const headers = { Authorization: `Bearer ${token}`, 'x-goog-user-project': project, 'Content-Type': 'application/json' }

const voicesRes = await fetch('https://texttospeech.googleapis.com/v1/voices?languageCode=ru-RU', { headers }).then((r) => r.json())
if (voicesRes.error) throw new Error(JSON.stringify(voicesRes.error))
const all = voicesRes.voices.map((v) => v.name)
console.log('Russian voices:', all.join(', '))
const pick = process.argv[2]?.split(',') ?? [
  all.find((n) => n.includes('Chirp3-HD')), all.find((n) => n.includes('Wavenet')), all.find((n) => n.includes('Standard')),
].filter(Boolean)

const items = readFileSync(join(here, 'pilot-items.txt'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
const out = join(here, 'out', 'google')
mkdirSync(out, { recursive: true })
const rows = []
for (const [i, text] of items.entries()) {
  const cells = []
  for (const voice of pick) {
    for (const mode of ['plain', 'stress']) {
      const input = mode === 'plain' ? text.normalize('NFD').replace(/́/g, '').normalize('NFC') : text
      const body = { input: { text: input }, voice: { languageCode: 'ru-RU', name: voice }, audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 } }
      const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', { method: 'POST', headers, body: JSON.stringify(body) }).then((r) => r.json())
      const file = `${String(i).padStart(2, '0')}-${voice}-${mode}.mp3`
      if (res.audioContent) writeFileSync(join(out, file), Buffer.from(res.audioContent, 'base64'))
      cells.push(res.audioContent ? `<td><audio controls preload="none" src="${file}"></audio></td>` : `<td>${res.error?.message ?? 'error'}</td>`)
    }
  }
  rows.push(`<tr><td style="font:20px Georgia">${text}</td>${cells.join('')}</tr>`)
  process.stdout.write('.')
}
const head = pick.flatMap((v) => [`<th>${v}<br>sin acentos</th>`, `<th>${v}<br>con acentos</th>`]).join('')
writeFileSync(join(out, 'index.html'), `<meta charset="utf-8"><title>Piloto Google TTS</title><table border="1" cellpadding="6"><tr><th>Texto</th>${head}</tr>${rows.join('')}</table>`)
console.log(`\nListo: ${items.length} textos × ${pick.length} voces × 2 → ${join(out, 'index.html')}`)
