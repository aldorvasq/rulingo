// Repaints the route murals with Gemini Nano Banana 2.1, using the SVG murals as layout sketches.
//   node scripts/murals/paint.mjs <workDir> [ch1 ch2 ch3 cap]
// <workDir> holds <name>-layout.png (from export-layouts.ts rendered at 800 px wide). Each chapter is painted in
// overlapping 9:16 sections (the previous painted section is passed as a style reference), then blended into
// public/img/murals/<name>.jpg. Moving things (trains, boats, plane, clouds) are left out: they're animated on top.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [, , WORK, ...only] = process.argv
const ROOT = join(import.meta.dirname, '..', '..')
const OUT = join(ROOT, 'public', 'img', 'murals')
mkdirSync(OUT, { recursive: true })
const KEY = readFileSync([join(homedir(), '.config', 'rulingo', 'gemini-key'), join(homedir(), 'Downloads', 'googleapikey.txt')].find(existsSync), 'utf8').trim()
const SEC = 1422 // 800 × 1422 px = 9:16

const BASE =
  'Repaint this section of an illustrated map as a rich, detailed Russian folk-storybook painting: gouache and watercolour on textured paper, ' +
  'delicate ink outlines, warm soft light, in the spirit of classic Russian fairy-tale book illustrations, seen from a gentle high angle like a storybook map. ' +
  'Keep the overall composition: buildings, landmarks, water, fields and objects stay in the same places at roughly the same size. ' +
  'The winding cream-coloured road MUST keep exactly the same path, width and position, including exactly where it meets the top and bottom edges. ' +
  'The source is a rough sketch with mistakes: straighten crooked or wobbly lines, fix perspective, give every building correct, structurally sensible ' +
  'architecture and proportions (vertical walls, straight rooflines, aligned windows), and turn odd or meaningless shapes into what they are clearly meant to be. ' +
  'Add rich detail, texture and small signs of life (people, pigeons, lamps). This is one section of a tall continuous map: whatever touches the top and ' +
  'bottom edges continues into the neighbouring sections, so keep it consistent there and do not add any border, frame or vignette. ' +
  'Remove all text: signs and banners must be blank. No letters, numbers, labels, logos or watermarks.'
const STYLE_REF = 'The second image is an already-painted neighbouring section of the same map: match its painting style, palette, line work and lighting exactly.'
const EMPTY = 'Leave railway tracks empty (no trains), water without boats, and the sky and runways without aeroplanes or clouds: those are added separately.'

/** Sections: [top offset px, description], painted top to bottom. */
const CHAPTERS = {
  ch1: { h: 3800, sections: [
    [0, "Moscow. Top: fields, birch groves and dachas with a road going north beside a railway; a Stalinist wedding-cake high-rise with a star on its spire; Leningradsky railway station with a central clock tower. Then the Kremlin: golden cathedral domes and the white Ivan the Great bell tower behind the red Kremlin wall with swallow-tail battlements; the Spasskaya tower with its clock, tent roof and glowing red star, and an arched gate where the road enters; St Basil's Cathedral with its famous multicoloured patterned onion domes; the cobbled Red Square with lamps and people."],
    [1000, "Moscow: the cobbled Red Square at the top, then the Moscow river with a granite embankment parapet and a stone bridge carrying the road; the colourful 19th-century merchant houses of Zamoskvorechye, a small white church with a golden onion dome, a neoclassical conference hall with white columns and flags, trees and street lamps; at the bottom a street with the Moscow metro entrance pavilion (classical arches; its red round metro sign with the letter М is the only lettering allowed)."],
    [2040, 'A cutaway view showing what lies under a Moscow street. At the top: the street and the classical metro entrance pavilion (its red round sign with the letter М is the only lettering allowed). Below the street, cut-away layers of brown earth with roots and stones, and inside them a magnificent Moscow metro palace station like Komsomolskaya or Mayakovskaya: a long vaulted hall with ornate stucco, golden mosaic panels in the ceiling, glowing bronze chandeliers, rows of marble columns and arches, a polished granite platform with passengers. Along the bottom of the hall a dark rail track runs the FULL width of the image and disappears into black tunnel mouths at the left and right edges; leave the track empty (the train is added separately). An escalator climbs from the hall up to the pavilion. It must feel deep underground and atmospheric: the hall is dim and moody, lit only by the warm amber glow of the chandeliers and wall lamps, with deep shadows between the columns and a dark vaulted ceiling glittering with golden mosaic panels; the tunnels at both ends are pitch black, with tiny red and green signal lights; the earth around the station is dark brown-black with roots, stones, pipes and cables. The underground part is much darker than the sunny street above. Where the cream road crosses the hall, paint it as a polished marble walkway following exactly the same path. Below the station, a park with birch trees and the start of a golden fountain.'],
    [2378, 'Moscow, VDNKh park: the golden Friendship of Peoples fountain (gilded statues of women in a ring around a round basin, water jets, a golden wheat sheaf in the centre), a pavilion with a golden spire, birch trees and flowerbeds. At the bottom an airport: a curved glass terminal with a wave-shaped roof, a control tower, a wide runway with white markings and lights, baggage carts, a windsock, travellers with suitcases. Leave the runway empty (no aeroplane).'],
  ] },
  ch2: { h: 3600, sections: [
    [0, "St Petersburg. Top: birch forest and a country road heading north with a blank road sign. The wide Neva river with the Peter and Paul Fortress and its slender golden needle spire, the raised Palace Bridge (two drawbridge spans lifted), and a stone bridge where the road crosses the river. Then the long mint-green and white Winter Palace with white columns and gold statues on its roof, with a central arched gateway where the road passes through; the cobbled Palace Square with the tall red-granite Alexander Column topped by an angel, a horse carriage, lamps and people."],
    [1089, 'St Petersburg: the Winter Palace facade and Palace Square at the top; the Griboyedov canal with black iron railings and a small bridge; the Church of the Saviour on Spilled Blood with its patterned multicoloured onion domes and tent spire; painters at easels and a street musician with an open guitar case along the canal. Below, a park with a modern silver football stadium bowl seen from above (green pitch with white lines, floodlight masts), a small canal around it, and a kids\' football pitch with children.'],
    [2178, 'St Petersburg: a classic courtyard-well (yellow 19th-century buildings around a small paved yard entered through an archway, laundry lines, a tree, children and a dog); a post office building with a blue blank sign and a dog at the door; the Neva river embankment with a wooden pier jutting into the water and a flea market with striped awnings and a red classic car. At the bottom: Moskovsky railway station with a clock tower, a tall city-entrance stele, a railway track running down to the bottom edge (leave it empty), fields, pines and birches along the road.'],
  ] },
  ch3: { h: 3600, sections: [
    [0, 'Russian countryside. Top: a meadow full of wildflowers with birches and haystacks, the road heading north. Then a lake with Kizhi island: the famous wooden Church of the Transfiguration with many tiers of silver aspen-shingle onion domes, a wooden bell tower beside it, birches on the grassy island, and a wooden boardwalk crossing the water where the road goes. Leave the lake without boats.'],
    [1089, 'A small Russian town: the lake shore at the top; a five-storey Soviet panel apartment block with balconies (on the balconies a guitarist, an actress with flowers, a woman waving), a courtyard with a playground, swings and a bench, several coloured parked cars, an old man fixing his old car; below, an old red-brick factory turned creative office with tall arched windows, a tall brick chimney, a rooftop garden with a hammock, an orange tube slide coming out of the building, a yellow coffee food truck and bicycles.'],
    [2178, 'Russian countryside: a forest lake with a tree-house hotel built in a huge oak (a little wooden cabin with a rope ladder), a wooden bungalow on stilts with a veranda over the water, pines with a hammock; then a village plot with a white picket fence: a wooden izba with carved blue window frames and a porch, a small garage, a little pool with a turtle beside it, vegetable beds, sunflowers and a well-sweep; at the bottom a country road through birch and pine forest with red mushrooms, a fox and haystacks. Leave the lake without boats.'],
  ] },
  cap: { h: 860, aspect: '1:1', sections: [
    [0, 'The road continues across a meadow of wildflowers with birches toward a warm sunset horizon with distant forested hills and a soft sky (no clouds); a wooden signpost with two blank boards beside the road; the road narrows into the distance.'],
  ] },
}

async function paint(layout, ref, prompt, aspect) {
  const parts = [{ inlineData: { mimeType: 'image/png', data: readFileSync(layout).toString('base64') } }]
  if (ref) parts.push({ inlineData: { mimeType: 'image/jpeg', data: readFileSync(ref).toString('base64') } })
  parts.push({ text: prompt })
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana-2.1:generateContent', {
      method: 'POST', headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } } }),
    }).then((r) => r.json()).catch((e) => ({ error: { message: String(e) } }))
    const part = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)
    if (part) return Buffer.from(part.inlineData.data, 'base64')
    const msg = JSON.stringify(res)
    if (/billing|prepay|credit|quota|PERMISSION|API key/i.test(msg)) throw new Error(msg.slice(0, 300))
    console.log('  retry:', msg.slice(0, 160))
    await new Promise((r) => setTimeout(r, 15000))
  }
  throw new Error('no image')
}

const mk = (...a) => execFileSync('magick', a.map(String), { stdio: 'inherit' })

for (const [name, ch] of Object.entries(CHAPTERS)) {
  if (only.length && !only.includes(name)) continue
  const layout = join(WORK, `${name}-layout.png`)
  const canvas = join(WORK, `${name}-canvas.png`)
  const F = 160 // feather where a section meets the painting above it
  mk('-size', `800x${ch.h}`, 'xc:#e9e2cf', canvas)
  let ref = null, paintedTo = 0
  // Top to bottom: each section's sketch gets the already-painted overlap pasted in, so it continues it exactly.
  for (const [i, [top, desc]] of [...ch.sections.entries()].sort((a, b) => a[1][0] - b[1][0])) {
    const hSec = ch.aspect ? ch.h : SEC
    const crop = join(WORK, `${name}-s${i}-layout.png`)
    const painted = join(WORK, `${name}-s${i}.jpg`)
    const overlap = Math.max(0, paintedTo - top)
    mk(layout, '-crop', `800x${hSec}+0+${top}`, '+repage', crop)
    if (overlap > 0) mk(crop, '(', canvas, '-crop', `800x${overlap}+0+${top}`, '+repage', ')', '-geometry', '+0+0', '-composite', crop)
    if (ch.aspect) mk(crop, '-resize', '800x800!', crop)
    if (!existsSync(painted)) {
      const cont = overlap > 0
        ? ` The top ${Math.round((overlap / hSec) * 100)}% of the first image is ALREADY PAINTED: reproduce that part exactly as it is (same road, buildings and colours) and continue the same painting seamlessly below it, with the road continuing from exactly where it leaves the painted part.`
        : ''
      const prompt = `${BASE} ${EMPTY} Scene: ${desc}${cont} ${ref ? STYLE_REF : ''}`
      writeFileSync(painted, await paint(crop, ref, prompt, ch.aspect ?? '9:16'))
      console.log(`✓ ${name} section ${i + 1}/${ch.sections.length}`)
    }
    const fit = painted.replace('.jpg', '-fit.png')
    mk(painted, '-resize', `800x${hSec}!`, fit)
    const mask = join(WORK, `${name}-m${i}.png`)
    const f = Math.min(F, overlap)
    mk('-size', `800x${hSec}`, 'xc:white', ...(overlap > 0
      ? ['(', '-size', `800x${overlap - f}`, 'xc:black', ')', '-geometry', '+0+0', '-composite', '(', '-size', `800x${f}`, 'gradient:black-white', ')', '-geometry', `+0+${overlap - f}`, '-composite']
      : []), mask)
    const withAlpha = join(WORK, `${name}-a${i}.png`)
    mk(fit, mask, '-alpha', 'off', '-compose', 'CopyOpacity', '-composite', withAlpha)
    mk(canvas, withAlpha, '-geometry', `+0+${top}`, '-compose', 'over', '-composite', canvas)
    paintedTo = top + hSec
    ref = painted
  }
  mk(canvas, '-quality', '62', '-interlace', 'Plane', join(OUT, `${name}.jpg`))
  console.log(`→ public/img/murals/${name}.jpg`)
}
