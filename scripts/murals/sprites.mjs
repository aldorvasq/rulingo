// Painted cut-outs for the mural animations (Nano Banana 2.1 on a green screen, keyed to transparent PNG).
//   node scripts/murals/sprites.mjs <workDir> [names…]
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [, , WORK, ...only] = process.argv
const OUT = join(import.meta.dirname, '..', '..', 'public', 'img', 'murals', 'sprites')
mkdirSync(OUT, { recursive: true })
const KEY = readFileSync([join(homedir(), '.config', 'rulingo', 'gemini-key'), join(homedir(), 'Downloads', 'googleapikey.txt')].find(existsSync), 'utf8').trim()

const STYLE = 'Painted in a Russian folk-storybook style: gouache and watercolour, delicate dark ink outlines, warm muted colours, matching a children\'s fairy-tale book.'
const SCREEN = 'Isolated on a perfectly flat, uniform pure green (#00FF00) background filling the whole image, with no shadow, ground, scenery or texture on the background. ' +
  'The object itself contains no pure green. No text, letters, numbers or logos.'
/** name → [prompt, aspect, output width px] */
const SPRITES = {
  metro: ['A classic Moscow metro train seen exactly from the side, three dark-blue carriages with a cream stripe, lit warm yellow windows with passengers, the driver\'s cab at the LEFT end with headlights on, moving to the left.', '21:9', 900],
  sapsan: ['A modern white high-speed train with a red stripe seen from directly above (top-down aerial view), four carriages in a straight vertical line, the pointed nose at the TOP.', '9:16', 120],
  plane: ['A white passenger jet aeroplane with a blue stripe seen from the side, nose pointing to the RIGHT and slightly up as it takes off, landing gear down.', '16:9', 360],
  rivertram: ['A small white river tram boat with a blue stripe, an enclosed passenger cabin with windows and a little flag, seen exactly from the side, bow pointing RIGHT, with a little white foam at the waterline.', '16:9', 260],
  yacht: ['An elegant white motor yacht with a blue stripe, two decks and a small mast with a flag, seen exactly from the side, bow pointing RIGHT.', '16:9', 300],
  rowboat: ['A small wooden rowing boat with one person in a red jacket rowing, seen from the side, bow pointing RIGHT.', '16:9', 170],
  sailboat: ['A small wooden sailing boat with a single white sail, seen from the side, bow pointing RIGHT.', '1:1', 130],
  cyclist: ['A person in a yellow jacket riding a red bicycle, seen exactly from the side, moving to the RIGHT.', '1:1', 110],
  cloud1: ['A single soft fluffy white storybook cloud with warm cream shading, wide and low.', '16:9', 300],
  cloud2: ['A small soft white storybook cloud, round and puffy, with gentle grey-blue shading underneath.', '16:9', 220],
}

for (const [name, [desc, aspect, width]] of Object.entries(SPRITES)) {
  if (only.length && !only.includes(name)) continue
  const raw = join(WORK, `sprite-${name}.png`)
  if (!existsSync(raw)) {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent', {
      method: 'POST', headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${desc} ${STYLE} ${SCREEN}` }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } } }),
    }).then((r) => r.json())
    const part = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)
    if (!part) { console.log(name, JSON.stringify(res).slice(0, 300)); continue }
    writeFileSync(raw, Buffer.from(part.inlineData.data, 'base64'))
  }
  // Key out the green (sampled from a corner), clean the green fringe, trim and size for the web.
  const corner = execFileSync('magick', [raw, '-format', '%[pixel:p{3,3}]', 'info:']).toString().trim()
  execFileSync('magick', [raw, '-alpha', 'set', '-fuzz', '28%', '-fill', 'none', '-opaque', corner,
    '-channel', 'G', '-fx', 'min(g, max(r,b)*1.08)', '+channel', '-trim', '+repage', '-resize', `${width}x`, join(OUT, `${name}.png`)])
  console.log('✓', name)
}
