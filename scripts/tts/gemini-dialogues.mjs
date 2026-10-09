// Pilot 2: three demanding dialogues (homographs in context, numbers, emotional swings), each line
// with its own situation/emotion direction, voiced by Wavenet (reference) and Gemini Flash/Pro pairs.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const gcloud = '/opt/homebrew/share/google-cloud-sdk/bin/gcloud'
const token = execFileSync(gcloud, ['auth', 'print-access-token']).toString().trim()
const project = execFileSync(gcloud, ['config', 'get-value', 'project']).toString().trim()
const headers = { Authorization: `Bearer ${token}`, 'x-goog-user-project': project, 'Content-Type': 'application/json' }

const D = [
  { title: '1. Las llaves (за́мок / замо́к, pánico → alivio)', scene: 'Morning at home. Masha (teenager) is late for school and can not open the door; her father is calm and amused.', lines: [
    ['f', 'panicked, out of breath, rushing', 'Па́па, где мой ключ? Я не могу́ откры́ть замо́к!'],
    ['m', 'calm, amused, teasing gently', 'Како́й замо́к? Тот, что на две́ри, и́ли за́мок, кото́рый ты рису́ешь?'],
    ['f', 'exasperated, raising her voice', 'Па́па! Замо́к на две́ри! Я опа́здываю!'],
    ['m', 'relaxed, matter-of-fact', 'Ключ лежи́т на столе́, ря́дом с твои́м телефо́ном.'],
    ['f', 'relieved, laughing at herself', 'Ой, пра́вда! Спаси́бо, па́почка!'],
  ] },
  { title: '2. En el mercado (números, vendedor alegre vs. clienta escéptica)', scene: 'A busy outdoor market. A loud, cheerful fruit seller; a skeptical, careful woman customer.', lines: [
    ['m', 'loud street-vendor call, cheerful, energetic', 'Све́жие я́блоки! Сла́дкие! Сто пятьдеся́т рубле́й за килогра́мм!'],
    ['f', 'skeptical, slightly indignant', 'Сто пятьдеся́т? Э́то до́рого. А почему́ так до́рого?'],
    ['m', 'charming, persuasive, smiling', 'Потому́ что они́ о́чень вку́сные! Попро́буйте!'],
    ['f', 'surprised, pleasantly convinced', 'Пра́вда, вку́сно! Хорошо́, два килогра́мма, пожа́луйста.'],
    ['m', 'generous, warm, proud', 'Три́ста рубле́й. И ещё одно́ я́блоко — пода́рок!'],
    ['f', 'touched, warm', 'Спаси́бо! Вы о́чень до́брый челове́к.'],
  ] },
  { title: '3. Llamada (alegría → giro → sorpresa y risa)', scene: 'A phone call between two close friends, Katya and Lena.', lines: [
    ['f', 'excited, talking fast, can barely contain the news', 'Ле́на, приве́т! Ты сиди́шь? У меня́ но́вая рабо́та!'],
    ['f', 'surprised and delighted', 'Что?! Пра́вда? Поздравля́ю! Где?'],
    ['f', 'proud, then hesitating at the end', 'В большо́м о́фисе в це́нтре Москвы́. Но есть одна́ пробле́ма…'],
    ['f', 'suddenly worried', 'Кака́я пробле́ма?'],
    ['f', 'sighing, deflated, a little embarrassed', 'Мой но́вый нача́льник — мой бы́вший муж.'],
    ['f', 'shocked, then bursting into laughter', 'Ёлки-па́лки! Ну, Ка́тя… ничего́ себе́!'],
  ] },
]
// Dialogue 3 is two women: alternate the two female voices of each pair.
const V = [
  { label: 'Wavenet A/B (actual)', f: ['ru-RU-Wavenet-A', 'ru-RU-Wavenet-C'], m: 'ru-RU-Wavenet-B' },
  { label: 'Gemini Flash · Kore/Puck', model: 'gemini-2.5-flash-tts', f: ['Kore', 'Leda'], m: 'Puck' },
  { label: 'Gemini Pro · Kore/Puck', model: 'gemini-2.5-pro-tts', f: ['Kore', 'Leda'], m: 'Puck' },
  { label: 'Gemini Pro · Aoede/Charon', model: 'gemini-2.5-pro-tts', f: ['Aoede', 'Zephyr'], m: 'Charon' },
]

const out = join(here, 'out', 'gemini-dialogues')
mkdirSync(out, { recursive: true })
const silence = join(out, 'sil.mp3')
if (!existsSync(silence)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', '0.45', silence])

async function synth(body, file) {
  if (existsSync(file)) return
  for (let a = 0; a < 8; a++) {
    const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', { method: 'POST', headers, body: JSON.stringify(body) }).then((r) => r.json())
    if (res.audioContent) return writeFileSync(file, Buffer.from(res.audioContent, 'base64'))
    if (!/quota|rate|unavailable/i.test(res.error?.message ?? '')) throw new Error(res.error?.message)
    await new Promise((r) => setTimeout(r, 15000))
  }
}

const rows = []
for (const [di, d] of D.entries()) {
  const cells = []
  for (const [vi, v] of V.entries()) {
    const parts = []
    for (const [li, [g, mood, text]] of d.lines.entries()) {
      const name = g === 'm' ? v.m : v.f[li % 2 === 0 || di !== 2 ? 0 : 1]
      const voice = v.model ? { languageCode: 'ru-RU', name, modelName: v.model } : { languageCode: 'ru-RU', name }
      const input = v.model ? { text, prompt: `Scene: ${d.scene} Say this line in Russian, ${mood}. Natural conversational Russian; follow the stress marks.` } : { text }
      const f = join(out, `${di}-${vi}-${li}.mp3`)
      await synth({ input, voice, audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000 } }, f)
      parts.push(f)
      process.stdout.write('.')
    }
    const list = join(out, `${di}-${vi}.txt`)
    writeFileSync(list, parts.flatMap((p, i) => (i ? [silence, p] : [p])).map((p) => `file '${p}'`).join('\n'))
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', '24000', '-b:a', '64k', join(out, `${di}-${vi}.mp3`)])
    cells.push(`<td><audio controls preload="none" src="${di}-${vi}.mp3"></audio></td>`)
  }
  const text = d.lines.map(([g, mood, t]) => `<div><b>${g === 'm' ? '♂' : '♀'}</b> ${t} <i style="color:#888;font:12px sans-serif">(${mood})</i></div>`).join('')
  rows.push(`<tr><td style="max-width:420px"><b style="font:15px sans-serif">${d.title}</b><div style="font:16px Georgia;margin-top:6px">${text}</div></td>${cells.join('')}</tr>`)
}
const head = V.map((v) => `<th style="font:13px sans-serif">${v.label}</th>`).join('')
writeFileSync(join(out, 'index.html'), `<meta charset="utf-8"><title>Piloto: diálogos</title><table border="1" cellpadding="8"><tr><th>Diálogo</th>${head}</tr>${rows.join('')}</table>`)
console.log(`\n→ ${join(out, 'index.html')}`)
