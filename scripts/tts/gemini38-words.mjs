// Gemini 3.8 Flash TTS on single words/phrases (same 30 pilot items) vs Wavenet-A, plus one long story.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const KEY = readFileSync(process.env.GEMINI_KEY_FILE ?? join(homedir(), 'Downloads', 'googleapikey.txt'), 'utf8').trim()
const out = join(here, 'out', 'gemini38')

async function tts(text, voice, style, file) {
  if (existsSync(file)) return true
  for (let a = 0; a < 5; a++) {
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
    if (audio) {
      const wav = file.replace(/\.mp3$/, '.wav')
      writeFileSync(wav, Buffer.from(audio.data, 'base64'))
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-b:a', '64k', file])
      return true
    }
    if (!/RESOURCE|quota|rate|UNAVAILABLE|INTERNAL/i.test(JSON.stringify(res))) { console.log('\n', JSON.stringify(res).slice(0, 200)); return false }
    await new Promise((r) => setTimeout(r, 8000))
  }
  return false
}

const items = readFileSync(join(here, 'pilot-items.txt'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
const strip = (s) => s.normalize('NFD').replace(/́/g, '').normalize('NFC')
const WORD_STYLE = 'Clear, natural pronunciation for a language learner; native Russian speaker; follow the stress marks.'
const cols = [
  { label: 'Wavenet-A (actual)', file: (i) => `../google/${String(i).padStart(2, '0')}-ru-RU-Wavenet-A-stress.mp3` },
  { label: '3.8 Kore · con acentos', voice: 'Kore', stress: true },
  { label: '3.8 Kore · sin acentos', voice: 'Kore', stress: false },
  { label: '3.8 Puck (m) · con acentos', voice: 'Puck', stress: true },
]
const rows = []
for (const [i, text] of items.entries()) {
  const cells = []
  for (const [j, c] of cols.entries()) {
    if (c.file) { cells.push(`<td><audio controls preload="none" src="${c.file(i)}"></audio></td>`); continue }
    const f = `w${i}-${j}.mp3`
    const ok = await tts(c.stress ? text : strip(text), c.voice, WORD_STYLE, join(out, f))
    cells.push(ok ? `<td><audio controls preload="none" src="${f}"></audio></td>` : '<td>error</td>')
    process.stdout.write(ok ? '.' : 'x')
  }
  rows.push(`<tr><td style="font:20px Georgia">${text}</td>${cells.join('')}</tr>`)
}

// Long-form stability: a ~1-minute narrated story with shifting mood.
const story = 'Меня́ зову́т Ма́ша. Я живу́ в большо́м до́ме в це́нтре го́рода. Наверху́ живу́т но́вые сосе́ди. Они́ молоды́е и о́чень шу́мные: ка́ждый ве́чер они́ гро́мко слу́шают му́зыку, а их соба́ка ла́ет. Внизу́ живу́т пенсионе́ры, Ве́ра Ива́новна и Пётр Ива́нович. У них всегда́ ти́хо. Ве́ра Ива́новна вку́сно гото́вит, а Пётр Ива́нович ме́дленно и краси́во рису́ет. Одна́жды ве́чером я не могла́ рабо́тать: наверху́ бы́ло о́чень шу́мно. Я пошла́ к сосе́дям и сказа́ла: «Извини́те, пожа́луйста, но вы слу́шаете му́зыку сли́шком гро́мко!» Сосе́ди бы́ли ве́жливые. Они́ сказа́ли: «Ой, извини́те! Тепе́рь бу́дет ти́хо». И пра́вда, ста́ло ти́хо. Как хорошо́!'
await tts(story, 'Aoede', 'Warm storyteller; amused when describing the noisy neighbours, calm and fond about the old couple, relieved at the end.', join(out, 'story.mp3'))
writeFileSync(join(out, 'words.html'), `<meta charset="utf-8"><title>3.8: palabras</title><h3 style="font-family:sans-serif">Gemini 3.8 Flash TTS — palabras y frases</h3>
<p style="font-family:sans-serif"><b>Historia larga (estabilidad):</b><br><audio controls src="story.mp3"></audio></p>
<table border="1" cellpadding="6"><tr><th>Texto</th>${cols.map((c) => `<th style="font:13px sans-serif">${c.label}</th>`).join('')}</tr>${rows.join('')}</table>`)
console.log('\nok')
