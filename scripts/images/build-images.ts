// Pictures for vocabulary with Gemini Nano Banana 2.1, in a Russian storybook painting style.
//   npx tsx scripts/images/build-images.ts [--limit N]      → vocabulary pictures
//   npx tsx scripts/images/build-images.ts --colours [--batch] → colour-exercise objects in every colour (--batch: half price, slower)
//   npx tsx scripts/images/build-images.ts --resize          → re-export all from the originals (no API)
// Every word in src/content/pictures.ts EMOJI gets public/img/vocab/<key>.jpg (480 px) and an entry in
// src/content/photos.json; existing pictures are skipped, so the script resumes where it stopped.
// Stops at the first billing/quota error. Key: ~/.config/rulingo/gemini-key or ~/Downloads/googleapikey.txt.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { COLOURS, EMOJI, OBJECTS } from '../../src/content/pictures'
import { audioKey } from '../../src/lib/audioKey'

const ROOT = join(import.meta.dirname, '..', '..')
const OUT = join(ROOT, 'public', 'img', 'vocab')
const RAW = join(import.meta.dirname, 'out')
const INDEX = join(ROOT, 'src', 'content', 'photos.json')
const COLOUR_OUT = join(ROOT, 'public', 'img', 'colour')
const COLOUR_INDEX = join(ROOT, 'src', 'content', 'colour-photos.json')
const MODEL = 'gemini-nano-banana-2.1'
const LIMIT = process.argv.includes('--limit') ? Number(process.argv[process.argv.indexOf('--limit') + 1]) : Infinity
for (const d of [OUT, RAW]) mkdirSync(d, { recursive: true })
const keyFile = [join(homedir(), '.config', 'rulingo', 'gemini-key'), join(homedir(), 'Downloads', 'googleapikey.txt')].find(existsSync)!
const KEY = readFileSync(keyFile, 'utf8').trim()

// Spanish meaning of each word, from the course vocabulary (disambiguates words like карта or чек).
const gloss = new Map<string, string>()
for (const dir of ['chapters', 'extra']) for (const f of readdirSync(join(ROOT, 'content', dir)).filter((x) => x.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(ROOT, 'content', dir, f), 'utf8'))
  for (const l of data.lessons ?? []) for (const v of l.vocab ?? []) {
    const w = v.ru.normalize('NFD').replace(/́/g, '').normalize('NFC').toLowerCase()
    if (!gloss.has(w)) gloss.set(w, v.es)
  }
}

const STYLE = 'A charming Russian folk-storybook painting, in the spirit of classic Russian fairy-tale book illustrations: ' +
  'gouache and watercolour on textured paper, delicate ink outlines, warm muted natural colours, soft light.'
const RULES = 'Square composition, one clearly recognisable subject centred with generous margin, simple soft background. ' +
  'Show the subject in an ordinary, unmistakable way so a language learner can name it at a glance. ' +
  'Absolutely no text, letters, numbers, labels, signs, logos or watermarks anywhere (flags and objects must have no writing).'

/** Clearer subjects for words whose picture could be confused with another one. */
const HINTS: Record<string, string> = {
  'кофе': 'coffee: a copper Turkish coffee pot (cezve) pouring dark coffee into a small cup, roasted coffee beans scattered around',
  'чай': 'tea: a brass Russian samovar with a glass of amber tea in an ornate metal glass-holder (podstakannik) and a lemon slice',
  'яхта': 'a modern white sailing yacht with a tall mast on blue water',
  // Buildings: show what happens inside or a telling symbol, so they don't all look like the same house.
  'школа': 'a school classroom: children at wooden desks, a teacher at a green blackboard with chalk drawings (no writing)',
  'почта': 'a post office: a blue postbox, a pile of stamped envelopes and parcels tied with string on a counter',
  'отель': 'a hotel reception: a polished desk with a brass service bell, a wall board of room keys, a guest with a suitcase',
  'магазин': 'a small shop: a counter with scales, shelves of jars, bread and goods, a shopkeeper and a customer with a basket',
  'клиника': 'a clinic: a doctor in a white coat with a stethoscope, an examination bed and a red cross on a white cabinet',
  'аэропорт': 'an airport seen from the apron: a large passenger airplane at a jet bridge, a plain glass terminal behind it with NO signs, banners or lettering of any kind, travellers with suitcases',
  'банк': 'a bank: an open steel safe full of gold coins and banknote bundles behind a counter',
  'визитка': 'a small business card held between two fingers, a neat stack of business cards on a desk (cards are blank)',
  'студент': 'a university student with a backpack and books walking in front of a grand university building',
  // 4.1 food: each must be told apart from its neighbours at a glance.
  'паста': 'Italian short pasta (penne and fusilli) with tomato sauce in a bowl, NOT long spaghetti',
  'масло': 'a block of yellow butter on a small wooden board with a butter knife and a slice of bread spread with butter',
  'мёд': 'a clay pot of golden honey with a wooden honey dipper dripping honey, a honeycomb beside it',
  'хлопья': 'a bowl of breakfast cereal cornflakes with milk, a spoon, cornflakes spilling on the table',
  'сахар': 'white sugar: a sugar bowl full of white sugar cubes, a few cubes and a sugar spoon beside it',
  'соль': 'salt: a wooden salt cellar full of coarse white salt, a pinch of salt scattered on the table',
  'ветчина': 'thin pink slices of cooked ham fanned out on a plate, a piece of whole ham beside them',
  'колбаса': 'a whole Russian salami sausage (kolbasa) and round sliced pieces of it on a cutting board',
  'сосиска': 'two boiled pink frankfurter sausages on a plate with a little mustard',
  'каша': 'a bowl of hot porridge (Russian kasha) with a pat of butter melting on top and a wooden spoon',
  'блины': 'a stack of thin golden Russian crepes (blini) on a plate, one folded into a triangle',
  'варенье': 'a glass jar of red strawberry jam (varenye) with a spoon, fresh strawberries beside it',
  'морепродукты': 'seafood: shrimps, mussels and a squid on crushed ice on a platter',
  'картофель': 'raw brown potatoes, several of them, one cut in half, on a burlap sack',
  'виноград': 'a bunch of green grapes on a vine leaf',
  'киви': 'a kiwi fruit: one whole brown hairy kiwi and one cut in half showing the green flesh with black seeds',
  'помидор': 'two ripe red tomatoes on the vine with green leaves, one cut showing the inside',
  'гриб': 'a single forest mushroom (porcini, brown cap, thick white stem) on moss',
  'апельсин': 'an orange fruit with a leaf, and a cut half showing the juicy segments',
  'огурец': 'two fresh green cucumbers, one sliced into round pieces',
  'лук': 'a brown onion bulb and a cut half showing the white rings, NOT garlic',
  'морковь': 'orange carrots with green leafy tops',
  'капуста': 'a whole round head of green cabbage with outer leaves',
  'свёкла': 'dark red-purple beetroots with leaves, one cut showing the deep red rings',
  'редис': 'a small bunch of red radishes with green leaves, one sliced showing white inside',
  'орехи': 'walnuts and hazelnuts, some cracked open, in a small wooden bowl',
  'шоколад': 'a bar of dark chocolate with its paper peeled back and squares broken off (no writing on the wrapper)',
  'мороженое': 'ice cream: two scoops of vanilla ice cream in a waffle cone',
  'пирожок': 'Russian pirozhki: small golden oval baked buns with filling, one broken open showing cabbage filling',
  'молоко': 'milk: a clay jug pouring white milk into a glass',
  'кефир': 'kefir: a thick white drink in a tall glass next to an old-fashioned glass bottle with a green foil cap (no writing)',
  'горячий шоколад': 'hot chocolate: a big mug of steaming dark hot cocoa with whipped cream on top',
  'квас': 'kvass: a mug of dark amber-brown foamy kvass next to a slice of dark rye bread',
  'морс': 'mors: a glass jug of deep red cranberry drink and a glass, fresh red cranberries scattered around',
  'лёд': 'ice: a bowl of clear ice cubes, a few cubes on the table',
  'соус': 'a small gravy boat of brown sauce being poured over a plate of meat',
  'майонез': 'mayonnaise: a small glass bowl of thick white mayonnaise with a spoon (no jar label)',
  'йогурт': 'a glass of white yogurt with pieces of fruit and berries on top and a spoon',
  'курица': 'a roast chicken, golden brown, on a plate with herbs',
  'мясо': 'a piece of raw red beef steak on a wooden butcher board with a sprig of rosemary',
  'рис': 'a bowl of white boiled rice with chopsticks',
  'яйцо': 'a single brown chicken egg and one boiled egg cut in half beside it',
  'хлеб': 'a loaf of Russian bread (a round rye loaf) with a few slices cut',
  'круассан': 'a single golden flaky French croissant',
  'сыр': 'a wedge of yellow cheese with holes and a few slices',
  'завтрак': 'breakfast: a morning table by a sunny window with porridge, a boiled egg, bread with butter and a cup of tea; morning sunlight',
  'обед': 'lunch at midday: a table with a bowl of soup, a plate of meat with potatoes, bread and a glass of juice; bright midday light',
  'ужин': 'dinner in the evening: a family table with a plate of fish and vegetables, a candle and a lamp lit, dark window with a moon',
  'сметана': 'smetana (sour cream): a small clay bowl of thick white sour cream with a spoon, beside a bowl of red borscht',
  'творог': 'tvorog (cottage cheese): a bowl of crumbly white farmer cheese with a spoon',
  'гречка': 'grechka: a bowl of cooked brown buckwheat with butter, a sack of raw buckwheat grains beside it',
  'сырники': 'syrniki: small round golden fried cottage-cheese pancakes on a plate with sour cream and berries',
  'яичница': 'fried eggs: two sunny-side-up eggs in a black frying pan',
  'чашка': 'an empty porcelain teacup with a saucer, painted with a blue folk pattern',
  'тарелка': 'an empty white plate with a blue folk-pattern rim, a fork and a knife beside it',
}
const DONE_REDO = join(RAW, 'redone.json')
const redone: string[] = existsSync(DONE_REDO) ? JSON.parse(readFileSync(DONE_REDO, 'utf8')) : []
// --once: each word in --redo is repainted a single time (remembered in out/redone.json).
const REDO = new Set((process.argv.includes('--redo') ? process.argv[process.argv.indexOf('--redo') + 1].split(',') : [])
  .filter((w) => !process.argv.includes('--once') || !redone.includes(w)))

const SIZE = '720' // published width: sharp when shown almost full-width on a phone

/** One painting: returns false (and sets `stopped` on billing/quota errors) if it couldn't be made. */
let stopped = ''
async function paint(prompt: string, rawBase: string, out: string): Promise<boolean> {
  for (let attempt = 0; attempt < 3 && !stopped; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST', headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } } }),
    }).then((r) => r.json()).catch((e) => ({ error: { message: String(e) } }))
    const part = res.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)
    if (part) {
      const raw = join(RAW, `${rawBase}.${part.inlineData.mimeType.includes('png') ? 'png' : 'jpg'}`)
      writeFileSync(raw, Buffer.from(part.inlineData.data, 'base64'))
      publish(raw, out)
      return true
    }
    const msg = JSON.stringify(res)
    if (/billing|prepay|credit|quota|per day|PERMISSION|API key/i.test(msg)) { stopped = msg.slice(0, 300); return false }
    process.stdout.write(`… ${rawBase}: ${msg.slice(0, 160)}\n`)
    await new Promise((r) => setTimeout(r, 15000 * (attempt + 1)))
  }
  return false
}
const publish = (raw: string, out: string) =>
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '55', '-Z', SIZE, raw, '--out', out], { stdio: 'ignore' })
const rawOf = (base: string) => ['jpg', 'png'].map((e) => join(RAW, `${base}.${e}`)).find(existsSync)

/**
 * Batch API: half price, processed in the background (minutes to hours). The job name is kept in
 * out/pending-batch.json so a stopped run resumes waiting for the same job instead of paying twice.
 */
async function viaBatch<J extends { key: string; prompt: string }>(jobs: J[], onImage: (job: J, data: string, mime: string) => void) {
  const PENDING = join(RAW, 'pending-batch.json')
  const api = (path: string, init?: RequestInit) => fetch(`https://generativelanguage.googleapis.com/v1beta/${path}`,
    { ...init, headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' } }).then((r) => r.json())
  let pending: { name: string; keys: string[] } | null = existsSync(PENDING) ? JSON.parse(readFileSync(PENDING, 'utf8')) : null
  if (!pending) {
    if (!jobs.length) return
    const res = await api(`models/${MODEL}:batchGenerateContent`, { method: 'POST', body: JSON.stringify({ batch: {
      display_name: `rulingo-${Date.now()}`,
      input_config: { requests: { requests: jobs.map((j) => ({
        request: { contents: [{ parts: [{ text: j.prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } } },
        metadata: { key: j.key } })) } } } }) })
    const name = res.name ?? res.metadata?.name
    if (!name) { stopped = JSON.stringify(res).slice(0, 300); return }
    pending = { name, keys: jobs.map((j) => j.key) }
    writeFileSync(PENDING, JSON.stringify(pending))
    console.log(`Lote enviado: ${name} (${jobs.length} imágenes)`)
  }
  for (;;) {
    const job = await api(pending.name)
    const state = job.metadata?.state ?? job.state
    if (state === 'JOB_STATE_SUCCEEDED' || state === 'BATCH_STATE_SUCCEEDED') {
      writeFileSync(join(RAW, `batch-result-${Date.now()}.json`), JSON.stringify(job)) // keep everything that was paid for
      const items = job.response?.inlinedResponses?.inlinedResponses ?? job.response?.inlinedResponses ?? job.dest?.inlinedResponses ?? []
      items.forEach((it: any, i: number) => {
        const key = it.metadata?.key ?? pending!.keys[i]
        const target = jobs.find((j) => j.key === key)
        const part = it.response?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)
        if (target && part) onImage(target, part.inlineData.data, part.inlineData.mimeType)
        else process.stdout.write(`… ${key}: ${JSON.stringify(it.error ?? it).slice(0, 160)}\n`)
      })
      renameSync(PENDING, join(RAW, `done-${Date.now()}.json`))
      return
    }
    if (/FAILED|CANCELLED|EXPIRED/.test(String(state))) { stopped = `lote ${state}: ${JSON.stringify(job.error ?? '').slice(0, 200)}`; renameSync(PENDING, join(RAW, `failed-${Date.now()}.json`)); return }
    process.stdout.write(`· ${state ?? JSON.stringify(job).slice(0, 120)} ${new Date().toLocaleTimeString()}\n`)
    await new Promise((r) => setTimeout(r, 60_000))
  }
}

let made = 0

// --resize: re-export every published picture from its original at the current SIZE (no API calls).
if (process.argv.includes('--resize')) {
  for (const f of readdirSync(OUT)) { const raw = rawOf(f.replace(/\.jpg$/, '')); if (raw) { publish(raw, join(OUT, f)); made++ } }
  for (const f of existsSync(COLOUR_OUT) ? readdirSync(COLOUR_OUT) : []) { const raw = rawOf(f.replace(/\.jpg$/, '')); if (raw) { publish(raw, join(COLOUR_OUT, f)); made++ } }
  console.log(`${made} imágenes re-exportadas a ${SIZE} px`)
  process.exit(0)
}

// --colours: every colour-exercise object painted in every colour (colour-photos.json: "object|colour" → path).
if (process.argv.includes('--colours')) {
  const OBJECT_EN: Record<string, string> = {
    'машина': 'a small rounded city car seen from the side', 'дом': 'a small house whose walls are painted that colour (roof and windows neutral)',
    'яблоко': 'a single apple', 'цветок': 'a single flower with large petals of that colour on a green stem', 'футболка': 'a plain t-shirt laid flat',
    'зонтик': 'an open umbrella', 'сумка': 'a handbag', 'кресло': 'an upholstered armchair', 'джинсы': 'a pair of trousers laid flat',
  }
  const COLOUR_EN: Record<string, string> = {
    'красный': 'bright red', 'жёлтый': 'bright yellow', 'оранжевый': 'orange', 'синий': 'deep dark blue (navy / royal blue — NOT light blue)',
    'голубой': 'light sky blue (pale blue — NOT dark blue)', 'зелёный': 'green', 'белый': 'white', 'чёрный': 'black', 'серый': 'grey',
    'фиолетовый': 'violet purple', 'розовый': 'pink', 'коричневый': 'brown', 'бежевый': 'beige (light sandy cream)',
  }
  mkdirSync(COLOUR_OUT, { recursive: true })
  const cindex: Record<string, string> = existsSync(COLOUR_INDEX) ? JSON.parse(readFileSync(COLOUR_INDEX, 'utf8')) : {}
  const jobs: { key: string; base: string; prompt: string }[] = []
  for (const obj of OBJECTS) for (const colour of Object.keys(COLOURS)) {
    const plain = obj.ru.normalize('NFD').replace(/\u0301/g, '').normalize('NFC')
    const key = `${plain}|${colour}`
    const base = `c-${audioKey(key)}`
    if (cindex[key] && existsSync(join(COLOUR_OUT, `${base}.jpg`))) continue
    const c = COLOUR_EN[colour]
    jobs.push({ key, base, prompt: `${STYLE} Subject: ${OBJECT_EN[plain]}, coloured entirely ${c}. The object must be clearly, evenly and unmistakably ${c} ` +
      `so that a learner names its colour at a glance. The object is large and fills most of the picture; nothing else in the picture is ${c.split(' (')[0]}, no other strongly coloured objects, ` +
      `plain light neutral paper background. ${RULES}` })
  }
  const save = (job: (typeof jobs)[number]) => {
    cindex[job.key] = `img/colour/${job.base}.jpg`
    writeFileSync(COLOUR_INDEX, JSON.stringify(cindex, null, 1) + '\n')
    made++
    process.stdout.write(`✓ ${job.key}\n`)
  }
  if (process.argv.includes('--batch')) await viaBatch(jobs.slice(0, LIMIT), (job, data, mime) => {
    const raw = join(RAW, `${job.base}.${mime.includes('png') ? 'png' : 'jpg'}`)
    writeFileSync(raw, Buffer.from(data, 'base64'))
    publish(raw, join(COLOUR_OUT, `${job.base}.jpg`))
    save(job)
  })
  else for (const job of jobs.slice(0, LIMIT)) {
    if (stopped) break
    if (await paint(job.prompt, job.base, join(COLOUR_OUT, `${job.base}.jpg`))) save(job)
  }
  console.log(`\n${made} nuevas · ${Object.keys(cindex).length}/${OBJECTS.length * Object.keys(COLOURS).length} en total${stopped ? `\nPARÓ: ${stopped}` : ''}`)
  process.exit(0)
}


// --food [--batch]: dishes "with / without" for the с / без picture exercises (public/img/food/<key>.jpg, the
// `image` field of content exercises). The painting must make the «с …» / «без …» difference obvious.
if (process.argv.includes('--food')) {
  const FOOD: Record<string, string> = {
    'chai-s-limonom': 'a glass of amber tea in a metal glass-holder with a big bright slice of lemon floating in it, a cut lemon beside it',
    'kofe-s-molokom': 'a cup of light milky coffee (café au lait, clearly pale brown) with a small jug of milk being poured into it',
    'kofe-bez-moloka': 'a small cup of pure black coffee, very dark, with no milk anywhere; a few coffee beans beside it',
    'voda-s-gazom': 'a glass of sparkling water full of many lively bubbles rising, fizzing at the top, a glass bottle beside it (no label)',
    'voda-bez-gaza': 'a glass of perfectly still clear water with absolutely no bubbles, calm surface, a glass carafe beside it',
    'buterbrod-s-syrom': 'an open-faced Russian sandwich: a slice of bread topped only with slices of yellow cheese with holes',
    'buterbrod-s-vetchinoj': 'an open-faced Russian sandwich: a slice of bread topped only with pink slices of ham',
    'picca-s-gribami': 'a round pizza topped generously with sliced brown mushrooms and cheese (no other toppings)',
    'bliny-s-myodom': 'a stack of thin Russian crepes with golden honey being drizzled from a honey dipper over them',
    'bliny-s-varenyem': 'thin Russian crepes with bright red strawberry jam spooned over them, a little bowl of jam',
    'kasha-s-fruktami': 'a bowl of porridge topped with slices of banana, strawberries and blueberries',
    'ryba-s-kartofelem': 'a plate with a fried fish fillet and boiled potatoes with dill',
    'morozhenoe-s-fruktami': 'a glass bowl of white ice cream scoops topped with pieces of fresh fruit: strawberries, kiwi, orange',
    'salat-s-pomidorami': 'a bowl of green salad leaves with many bright red cherry tomatoes cut in halves',
  }
  const FOOD_OUT = join(ROOT, 'public', 'img', 'food')
  mkdirSync(FOOD_OUT, { recursive: true })
  const jobs = Object.entries(FOOD).filter(([k]) => !existsSync(join(FOOD_OUT, `${k}.jpg`)))
    .map(([key, d]) => ({ key, prompt: `${STYLE} Subject: ${d}. Seen at a slight angle from above, on a simple wooden table. ${RULES}` }))
  const done = (key: string) => { made++; process.stdout.write(`✓ ${key}\n`) }
  if (process.argv.includes('--batch')) await viaBatch(jobs, (job, data, mime) => {
    const raw = join(RAW, `food-${job.key}.${mime.includes('png') ? 'png' : 'jpg'}`)
    writeFileSync(raw, Buffer.from(data, 'base64'))
    publish(raw, join(FOOD_OUT, `${job.key}.jpg`))
    done(job.key)
  })
  else for (const job of jobs) if (!stopped && await paint(job.prompt, `food-${job.key}`, join(FOOD_OUT, `${job.key}.jpg`))) done(job.key)
  console.log(`\n${made} nuevas${stopped ? `\nPARÓ: ${stopped}` : ''}`)
  process.exit(0)
}

const index: Record<string, string> = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, 'utf8')) : {}
const promptFor = (word: string, emoji: string) => {
  const es = gloss.get(word) ?? word
  const subject = HINTS[word] ? `${HINTS[word]} (Russian word «${word}»)` : `«${es}» (Russian word «${word}»; the thing shown by the emoji ${emoji})`
  return `${STYLE} Subject: ${subject}. ${RULES}`
}
// --batch: the missing vocabulary pictures in one half-price batch job.
if (process.argv.includes('--batch')) {
  const jobs = Object.entries(EMOJI).filter(([w]) => !(index[w] && existsSync(join(OUT, `${audioKey(w)}.jpg`))))
    .slice(0, LIMIT).map(([key, emoji]) => ({ key, prompt: promptFor(key, emoji) }))
  await viaBatch(jobs, (job, data, mime) => {
    const raw = join(RAW, `${audioKey(job.key)}.${mime.includes('png') ? 'png' : 'jpg'}`)
    writeFileSync(raw, Buffer.from(data, 'base64'))
    publish(raw, join(OUT, `${audioKey(job.key)}.jpg`))
    index[job.key] = `img/vocab/${audioKey(job.key)}.jpg`
    writeFileSync(INDEX, JSON.stringify(index, null, 1) + '\n')
    made++
    process.stdout.write(`✓ ${job.key}\n`)
  })
  console.log(`\n${made} nuevas · ${Object.keys(index).length}/${Object.keys(EMOJI).length} en total${stopped ? `\nPARÓ: ${stopped}` : ''}`)
  process.exit(0)
}
for (const [word, emoji] of Object.entries(EMOJI)) {
  if (made >= LIMIT || stopped) break
  const file = `${audioKey(word)}.jpg`
  if (index[word] && existsSync(join(OUT, file)) && !REDO.has(word)) continue
  if (await paint(promptFor(word, emoji), audioKey(word), join(OUT, file))) {
    index[word] = `img/vocab/${file}`
    writeFileSync(INDEX, JSON.stringify(index, null, 1) + '\n')
    made++
    if (REDO.has(word)) { redone.push(word); writeFileSync(DONE_REDO, JSON.stringify(redone)) }
    process.stdout.write(`✓ ${word}\n`)
  }
}
console.log(`\n${made} nuevas · ${Object.keys(index).length}/${Object.keys(EMOJI).length} en total${stopped ? `\nPARÓ: ${stopped}` : ''}`)
