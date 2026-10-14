// Renders each chapter mural (without its moving parts) to SVG files used as layout sketches for repainting.
//   npx tsx scripts/murals/export-layouts.ts <outDir>
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { MURALS, CAP } from '../../src/murals'
import { sketch } from '../../src/murals/kit'

sketch.guide = true // the route as a thin red guide line, not a road

const out = process.argv[2]
const HIDE = '<style>.m-train-up,.m-plane,.m-metro,.m-boat,.m-bob,.m-cycle,.m-drift,.m-ball{display:none}</style>'
const all: [string, (typeof MURALS)[number]][] = [...Object.entries(MURALS).map(([n, m]) => [`ch${n}`, m] as [string, typeof m]), ['cap', CAP]]
for (const [name, m] of all) {
  const svg = m.svg().replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${m.height * 2}" `).replace('</svg>', `${HIDE}</svg>`)
  writeFileSync(join(out, `${name}.svg`), svg)
  console.log(name, m.height)
}
