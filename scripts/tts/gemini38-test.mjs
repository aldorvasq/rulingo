// Quick test of Gemini 3.8 Flash TTS (Gemini API): two-speaker dialogues in one request,
// style in speech_metadata (never read aloud), inline <sigh>. Key read from a local file, never printed.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const KEY = readFileSync(process.env.GEMINI_KEY_FILE ?? join(homedir(), 'Downloads', 'googleapikey.txt'), 'utf8').trim()
const out = join(dirname(fileURLToPath(import.meta.url)), 'out', 'gemini38')
const api = (path, body) => fetch(`https://generativelanguage.googleapis.com/v1beta/${path}`, {
  method: body ? 'POST' : 'GET', headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body),
}).then((r) => r.json())

// Russian voices in the extended library, if any.
const voices = await api('voices?language_code=ru-RU&page_size=50')
if (voices.error) console.log('voices:', voices.error.message)
else console.log('Voces rusas:', (voices.voices ?? []).map((v) => `${v.name ?? v.voice}(${v.gender ?? '?'})`).join(', ') || 'ninguna')

const D = [
  { file: '1-llaves', speakers: [['Маша', 'Kore'], ['Папа', 'Puck']], lines: [
    ['Маша', 'panicked, out of breath', 'Па́па, где мой ключ? Я не могу́ откры́ть замо́к!'],
    ['Папа', 'calm, gently teasing', 'Како́й замо́к? Тот, что на две́ри, и́ли за́мок, кото́рый ты рису́ешь?'],
    ['Маша', 'exasperated', 'Па́па! Замо́к на две́ри! Я опа́здываю!'],
    ['Папа', 'relaxed, matter-of-fact', 'Ключ лежи́т на столе́, ря́дом с твои́м телефо́ном.'],
    ['Маша', 'relieved, laughing', 'Ой, пра́вда! Спаси́бо, па́почка!'],
  ] },
  { file: '2-mercado', speakers: [['Продавец', 'Charon'], ['Покупательница', 'Leda']], lines: [
    ['Продавец', 'loud street vendor, cheerful', 'Све́жие я́блоки! Сла́дкие! Сто пятьдеся́т рубле́й за килогра́мм!'],
    ['Покупательница', 'skeptical, slightly indignant', 'Сто пятьдеся́т? Э́то до́рого. А почему́ так до́рого?'],
    ['Продавец', 'charming, persuasive', 'Потому́ что они́ о́чень вку́сные! Попро́буйте!'],
    ['Покупательница', 'pleasantly surprised', 'Пра́вда, вку́сно! Хорошо́, два килогра́мма, пожа́луйста.'],
    ['Продавец', 'generous, proud', 'Три́ста рубле́й. И ещё одно́ я́блоко — пода́рок!'],
    ['Покупательница', 'touched, warm', 'Спаси́бо! Вы о́чень до́брый челове́к.'],
  ] },
  { file: '3-llamada', speakers: [['Катя', 'Aoede'], ['Лена', 'Kore']], lines: [
    ['Катя', 'excited, talking fast', 'Ле́на, приве́т! Ты сиди́шь? У меня́ но́вая рабо́та!'],
    ['Лена', 'surprised and delighted', 'Что?! Пра́вда? Поздравля́ю! Где?'],
    ['Катя', 'proud, then hesitant', 'В большо́м о́фисе в це́нтре Москвы́. Но есть одна́ пробле́ма…'],
    ['Лена', 'suddenly worried', 'Кака́я пробле́ма?'],
    ['Катя', 'deflated, embarrassed', '<sigh> Мой но́вый нача́льник — мой бы́вший муж.'],
    ['Лена', 'shocked, then laughing', 'Ёлки-па́лки! Ну, Ка́тя… ничего́ себе́!'],
  ] },
]

for (const d of D) {
  const res = await api('interactions', {
    model: 'gemini-3.8-flash-tts',
    input: [{ type: 'user_input', content: d.lines.map(([speaker, style, text]) => ({ type: 'text', text, annotations: [{ type: 'speech_metadata', speaker, style }] })) }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: { mode: 'conversational', speakers: d.speakers.map(([speaker, voice]) => ({ speaker, voice })) } },
  })
  if (res.error) { console.log(d.file, 'ERROR:', res.error.message); continue }
  const audio = (res.steps ?? []).filter((s) => s.type === 'model_output').flatMap((s) => s.content ?? []).filter((c) => c.type === 'audio').at(-1)
  if (!audio) { console.log(d.file, 'sin audio:', JSON.stringify(res).slice(0, 300)); continue }
  const wav = join(out, `${d.file}.wav`)
  writeFileSync(wav, Buffer.from(audio.data, 'base64'))
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-b:a', '64k', join(out, `${d.file}.mp3`)])
  console.log(d.file, 'OK')
}
writeFileSync(join(out, 'index.html'), `<meta charset="utf-8"><title>Gemini 3.8 Flash TTS</title><h3 style="font-family:sans-serif">Gemini 3.8 Flash TTS — diálogos</h3>` +
  D.map((d) => `<p style="font-family:sans-serif"><b>${d.file}</b><br><audio controls src="${d.file}.mp3"></audio></p>`).join(''))
