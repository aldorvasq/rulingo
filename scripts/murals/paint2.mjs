// Route murals in two passes with Gemini Nano Banana 2.1:
//   1. sketch: the rough SVG layout (route drawn as a red dashed guide) → a clean, well-proportioned pencil sketch
//      with a natural walkway along the guide (paths, streets, bridges, stairs) and the guide still visible;
//   2. paint: the sketch → the storybook painting (guide removed). Moving things are left out (animated on top).
// Chapters are separate scenes (a painted ornament band divides them in the app); sections inside a chapter
// continue each other exactly (the painted overlap is pasted into the next section's input).
//   node scripts/murals/paint2.mjs <workDir> <pass: sketch|paint|night|all> [ch1 ch2 ch3 cap]
//   3. night: the painting → the same scene at night (used by the app's day/night cycle).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [, , WORK, PASS = 'all', ...only] = process.argv
const ROOT = join(import.meta.dirname, '..', '..')
const OUT = join(ROOT, 'public', 'img', 'murals')
mkdirSync(OUT, { recursive: true })
const KEY = readFileSync([join(homedir(), '.config', 'rulingo', 'gemini-key'), join(homedir(), 'Downloads', 'googleapikey.txt')].find(existsSync), 'utf8').trim()
const SEC = 1422 // 800 × 1422 px = 9:16

const SKETCH =
  'Turn this rough, flat layout into a clean, careful pencil composition sketch for a storybook map illustration: confident graphite line drawing ' +
  'with light grey wash shading on white paper, seen from a gentle high angle. Keep every landmark, building, body of water, field and object in the ' +
  'same place and at roughly the same size, but redraw each one properly: straight lines, correct perspective, sensible architecture and proportions, ' +
  'and symmetric, even shapes wherever they should be (runways, bridges, facades, platforms). The red dashed line marks the route a traveller walks ' +
  'through the scene. Along it draw a natural, walkable way that fits each spot: a dirt footpath across fields and parks, a paved street in town, ' +
  'paving across squares, a bridge over water, stairs or an escalator underground, a wooden boardwalk over a lake. The way must never run across ' +
  'rooftops, walls or buildings: where the line meets a building, the way passes through an open gate, archway or door, or goes around it. ' +
  'Keep the red dashed line visible on top of the sketch exactly where it is. Lettering on buildings can stay. No border or frame.'
const PAINT =
  'Paint this pencil sketch as a rich, detailed Russian folk-storybook painting: gouache and watercolour on textured paper, delicate ink outlines, ' +
  'warm soft light, in the spirit of classic Russian fairy-tale book illustrations. Follow the sketch faithfully: the same composition, outlines, ' +
  'buildings and the same walkway along the route. Remove the red dashed guide line completely (paint the path, street, bridge or stairs it lies on ' +
  'instead). Add colour, texture and small signs of life (people, pigeons, lamps). Lettering on buildings can stay. No border, frame or vignette.'
const NIGHT =
  'Repaint this exact painting as the same scene at night. Keep every shape, building, path, tree and object exactly where and as it is: ' +
  'change only the light. Deep blue night tones and soft moonlight; warm yellow light glowing from windows; street lamps lit with soft halos; ' +
  'lit station clocks and signs; underground halls stay warmly lit inside; a few stars and a pale moon wherever open sky shows. ' +
  'Same Russian folk-storybook gouache and ink style. Do not add vehicles, boats, aeroplanes or clouds. No border or frame.'
const EMPTY = 'Leave railway tracks empty (no trains), water without boats, and the sky and runway without aeroplanes or clouds: those are added separately.'
const CONT = (pct) => ` The top ${pct}% of the first image is ALREADY DONE: reproduce that part exactly as it is and continue seamlessly below it.`
/** A full-colour painting in the target style (from the first painted version of the murals). */
const COLOUR_REF = join(import.meta.dirname, 'colour-reference.jpg')

/** Sections: [top offset px, description], painted top to bottom. */
const CHAPTERS = {
  ch1: { h: 3800, sections: [
    [0, "Moscow. Top: fields, birch groves and dachas with a road going north beside a railway; a Stalinist wedding-cake high-rise with a star on its spire; Leningradsky railway station with a central clock tower. Then the Kremlin: golden cathedral domes and the white Ivan the Great bell tower behind the red Kremlin wall with swallow-tail battlements; the Spasskaya tower with its clock, tent roof and glowing red star, and an arched gate where the road enters; St Basil's Cathedral with its famous multicoloured patterned onion domes; the cobbled Red Square with lamps and people."],
    [1000, "Moscow: the cobbled Red Square at the top, then the Moscow river with a granite embankment parapet and a stone bridge carrying the road; the colourful 19th-century merchant houses of Zamoskvorechye, a small white church with a golden onion dome, a neoclassical conference hall with white columns and flags, trees and street lamps; at the bottom a street with the Moscow metro entrance pavilion (classical arches; its red round metro sign with the letter М is the only lettering allowed)."],
    [2040, 'A cutaway view showing what lies under a Moscow street. At the top: the street and the classical metro entrance pavilion with its red round М metro sign. Below the street, cut-away layers of brown earth with roots and stones, and inside them a magnificent Moscow metro palace station like Komsomolskaya or Mayakovskaya: a long vaulted hall with ornate stucco, golden mosaic panels in the ceiling, glowing bronze chandeliers, rows of marble columns and arches, a polished granite platform with passengers. Along the bottom of the hall a dark rail track runs the FULL width of the image and disappears into black tunnel mouths at the left and right edges; leave the track empty (the train is added separately). An escalator climbs from the hall up to the pavilion. It must feel deep underground and atmospheric: the hall is dim and moody, lit only by the warm amber glow of the chandeliers and wall lamps, with deep shadows between the columns and a dark vaulted ceiling glittering with golden mosaic panels; the tunnels at both ends are pitch black, with tiny red and green signal lights; the earth around the station is dark brown-black with roots, stones, pipes and cables. The underground part is much darker than the sunny street above. The route enters through the pavilion, goes down the escalator into the hall, along the platform, and leaves by a stairway up into the park below. Below the station, a park with birch trees and the start of a golden fountain.'],
    [2378, 'Moscow, VDNKh park: the golden Friendship of Peoples fountain (gilded statues of women in a ring around a round basin, water jets, a golden wheat sheaf in the centre), a pavilion with a golden spire, birch trees and flowerbeds. At the bottom an airport: a curved glass terminal with a wave-shaped roof, a control tower, a straight, even runway running left to right along the bottom with white centre-line markings and edge lights, baggage carts, a windsock, travellers with suitcases. Leave the runway empty (no aeroplane).'],
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


async function gen(images, prompt, aspect) {
  const parts = images.map((f) => ({ inlineData: { mimeType: f.endsWith('.png') ? 'image/png' : 'image/jpeg', data: readFileSync(f).toString('base64') } }))
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

/** One pass over a chapter: `source` is the full-height input (layout or sketch), result → `<name>-<pass>.png`. */
async function runPass(name, ch, pass, source) {
  const canvas = join(WORK, `${name}-${pass}.png`)
  const F = 160
  mk('-size', `800x${ch.h}`, 'xc:#f4efe2', '-colorspace', 'sRGB', '-type', 'TrueColor', canvas) // not greyscale, or the colour is lost when sections are joined
  let ref = null, doneTo = 0
  for (const [i, [top, desc]] of [...ch.sections.entries()].sort((a, b) => a[1][0] - b[1][0])) {
    const hSec = ch.aspect ? ch.h : SEC
    const input = join(WORK, `${name}-${pass}-s${i}-in.png`)
    const result = join(WORK, `${name}-${pass}-s${i}.jpg`)
    const overlap = Math.max(0, doneTo - top)
    mk(source, '-crop', `800x${hSec}+0+${top}`, '+repage', input)
    if (overlap > 0) mk(input, '(', canvas, '-crop', `800x${overlap}+0+${top}`, '+repage', ')', '-geometry', '+0+0', '-composite', input)
    if (ch.aspect) mk(input, '-resize', '800x800!', input)
    if (!existsSync(result)) {
      // The paint pass also gets an earlier full-colour painting as a palette/technique reference (else it stays grey like the sketch).
      const colour = pass === 'paint' ? COLOUR_REF : null
      const images = [input, ...(colour ? [colour] : []), ...(ref ? [ref] : [])]
      const refs = [colour ? `Image ${images.indexOf(colour) + 1} is a COLOUR AND TECHNIQUE REFERENCE: paint in exactly its rich, warm full colours, gouache texture and ink line work (do not copy its layout or content). The result must be in full colour, not grey.` : '',
        ref ? `Image ${images.length} is an already-finished neighbouring section of the same map: match its style, palette, line work and lighting exactly.` : ''].join(' ')
      const prompt = `${pass === 'sketch' ? SKETCH : pass === 'night' ? NIGHT : `${PAINT} ${EMPTY}`} Scene: ${desc}${overlap > 0 ? CONT(Math.round((overlap / hSec) * 100)) : ''} ${refs}`
      writeFileSync(result, await gen(images, prompt, ch.aspect ?? '9:16'))
      console.log(`✓ ${name} ${pass} ${i + 1}/${ch.sections.length}`)
    }
    const fit = result.replace('.jpg', '-fit.png'), mask = join(WORK, `${name}-${pass}-m${i}.png`), withAlpha = join(WORK, `${name}-${pass}-a${i}.png`)
    mk(result, '-resize', `800x${hSec}!`, fit)
    const f = Math.min(F, overlap)
    mk('-size', `800x${hSec}`, 'xc:white', ...(overlap > 0
      ? ['(', '-size', `800x${overlap - f}`, 'xc:black', ')', '-geometry', '+0+0', '-composite', '(', '-size', `800x${f}`, 'gradient:black-white', ')', '-geometry', `+0+${overlap - f}`, '-composite']
      : []), mask)
    mk(fit, mask, '-alpha', 'off', '-compose', 'CopyOpacity', '-composite', withAlpha)
    mk(canvas, withAlpha, '-geometry', `+0+${top}`, '-compose', 'over', '-composite', '-type', 'TrueColor', canvas)
    doneTo = top + hSec
    ref = result
  }
  return canvas
}

for (const [name, ch] of Object.entries(CHAPTERS)) {
  if (only.length && !only.includes(name)) continue
  if (PASS === 'sketch' || PASS === 'all') await runPass(name, ch, 'sketch', join(WORK, `${name}-layout.png`))
  if (PASS === 'paint' || PASS === 'all') {
    const painted = await runPass(name, ch, 'paint', join(WORK, `${name}-sketch.png`))
    mk(painted, '-quality', '62', '-interlace', 'Plane', join(OUT, `${name}.jpg`))
    console.log(`→ public/img/murals/${name}.jpg`)
  }
  if (PASS === 'night' || PASS === 'all') {
    const night = await runPass(name, ch, 'night', join(WORK, `${name}-paint.png`))
    mk(night, '-quality', '60', '-interlace', 'Plane', join(OUT, `${name}-night.jpg`))
    console.log(`→ public/img/murals/${name}-night.jpg`)
  }
}
