// Chapter 4 · «Comida y moda». Down the Volga to Nizhny Novgorod: a paddle steamer at the pier; the
// riverside market with its stalls of fruit, vegetables, bread and a samovar (4.1, food); a wooden
// traktir with tables on its terrace and a chef at the stove (4.2, Russian cuisine); a merchant's house
// turned fashion atelier, dresses in its windows (4.3); the arcades of the Gostiny Dvor with shoppers
// (4.4); and the Nizhny Novgorod Fair on the bank where the Oka meets the Volga.
import { EDGE, P, W, birch, cloud, defs, lamp, onion, patches, person, road, roadSign, seed, smooth, tree, r, type Mural } from './kit'

const H = 1800

// ---------------------------------------------------------------- 1800–1580: the Volga pier
function pier() {
  let s = `<rect x="0" y="1580" width="${W}" height="${H - 1580}" fill="url(#m-water)"/>`
  for (let i = 0; i < 26; i++) s += `<rect x="${r() * W}" y="${1600 + r() * 190}" width="${10 + r() * 26}" height="1.2" fill="#e8f0f0" opacity="${0.2 + r() * 0.4}"/>`
  // sandy bank along the top of the river
  s += `<path d="M0,1580 h${W} v26 Q300,1620 200,1610 Q90,1600 0,1616 Z" fill="#d9caa0"/>`
  // the wooden pier and a white paddle steamer
  s += `<rect x="168" y="1606" width="34" height="120" fill="${P.woodL}"/>${Array.from({ length: 14 }, (_, i) => `<rect x="168" y="${1610 + i * 8}" width="34" height="1.2" fill="${P.woodD}" opacity=".6"/>`).join('')}`
  s += `<g class="m-steamer">
    <path d="M220,1700 h150 l-14,22 h-124 z" fill="#f4efe2"/><path d="M220,1700 h150" stroke="${P.brick}" stroke-width="3"/>
    <rect x="236" y="1678" width="112" height="22" fill="#fbf6ea"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${242 + i * 13}" y="1684" width="8" height="8" fill="#5e7d90"/>`).join('')}
    <rect x="256" y="1664" width="70" height="14" fill="#f4efe2"/><rect x="300" y="1636" width="12" height="28" fill="${P.brick}"/><rect x="300" y="1636" width="12" height="5" fill="#2f3438"/>
    <circle cx="350" cy="1708" r="13" fill="none" stroke="${P.brick}" stroke-width="3"/><path d="M350,1695 v26 M337,1708 h26" stroke="${P.brick}" stroke-width="1.6"/></g>`
  s += `<g class="m-boat"><g transform="translate(40 1720)"><path d="M0,0 h28 l-5,6 h-18 z" fill="${P.wood}"/>${person(14, 0, P.blue, 0.7)}</g></g>`
  s += roadSign(110, 1600, ['Ни́жний', 'Но́вгород'], '#2f5d8a')
  return s
}

// ---------------------------------------------------------------- 1580–1330: the riverside market (4.1)
function market() {
  let s = `<rect x="0" y="1330" width="${W}" height="252" fill="#d8cfb4"/><rect x="0" y="1330" width="${W}" height="252" fill="url(#m-cobble)" opacity=".5"/>`
  const stall = (x: number, y: number, awning: string, goods: string) => `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="70" height="34" fill="${P.woodL}"/><rect x="0" y="0" width="70" height="4" fill="${P.woodD}"/>
    <path d="M-4,-26 h78 l-6,12 h-66 z" fill="${awning}"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${2 + i * 12},-14 h6 l-1,-12 h-4 z" fill="#fbf6ea" opacity=".85"/>`).join('')}
    <path d="M2,-14 v14 M68,-14 v14" stroke="${P.woodD}" stroke-width="2"/>${goods}</g>`
  const heap = (x: number, color: string, n = 7) => Array.from({ length: n }, (_, i) => `<circle cx="${x + (i % 4) * 4.5 + (i > 3 ? 2 : 0)}" cy="${-2 - (i > 3 ? 4 : 0)}" r="2.6" fill="${color}"/>`).join('')
  // fruit and vegetables
  s += stall(220, 1400, '#c8323a', heap(4, '#d9473a') + heap(24, '#f39a2a') + heap(44, '#7fae4a') + heap(58, '#7a3a6a', 4))
  // bread, bliny and pies
  s += stall(220, 1500, '#e8b830', `<ellipse cx="12" cy="-4" rx="9" ry="5" fill="#b07a3a"/><ellipse cx="32" cy="-4" rx="9" ry="5" fill="#c48a46"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="54" cy="${-2 - i * 2}" rx="10" ry="2.5" fill="#e3b25a"/>`).join('')}`)
  // the tea table with a samovar
  s += `<g transform="translate(90 1450)"><rect x="-34" y="0" width="68" height="4" fill="#f3e8d2"/><path d="M-30,4 v18 M30,4 v18" stroke="${P.woodD}" stroke-width="2"/>
    <path d="M-8,0 v-8 q0,-14 8,-14 q8,0 8,14 v8 z" fill="#c8963a"/><rect x="-3" y="-28" width="6" height="6" fill="#a8832f"/><path d="M8,-8 h6" stroke="#a8832f" stroke-width="1.6"/>
    ${[-22, 22].map((x) => `<rect x="${x - 3}" y="-6" width="6" height="6" fill="#d9a04a" opacity=".85"/>`).join('')}
    <circle cx="0" cy="-34" r="3" fill="#efece4" opacity=".6" class="m-drift"/></g>`
  s += person(60, 1480, P.brick, 0.85) + person(120, 1482, P.green, 0.85, true) + person(300, 1452, '#e8b830', 0.85) + person(200, 1560, P.slate, 0.85)
  // baskets of apples, a cart of cabbages
  s += `<g transform="translate(60 1550)"><rect x="-12" y="-8" width="24" height="10" fill="${P.wood}"/>${heap(-10, '#c8323a', 6)}<circle cx="-16" cy="4" r="5" fill="none" stroke="${P.woodD}" stroke-width="1.6"/><circle cx="16" cy="4" r="5" fill="none" stroke="${P.woodD}" stroke-width="1.6"/></g>`
  s += `<g transform="translate(340 1360)">${heap(0, '#8cbf5a', 7)}</g>` + tree(30, 1380, 0.7) + lamp(170, 1420, 0.9)
  return s
}

// ---------------------------------------------------------------- 1330–1060: the wooden traktir (4.2)
function traktir() {
  let s = `<rect x="0" y="1060" width="${W}" height="272" fill="#c9cf9f"/>`
  s += patches(1070, 1320, 8, '#4f6a3f', 0.07)
  s += `<g>
    <rect x="40" y="1130" width="150" height="80" fill="${P.wood}"/>${Array.from({ length: 11 }, (_, i) => `<rect x="40" y="${1133 + i * 7}" width="150" height="1.3" fill="${P.woodD}" opacity=".6"/>`).join('')}
    <path d="M30,1132 L115,1086 L200,1132 Z" fill="#7d5a3e"/><path d="M115,1086 L200,1132 L115,1132 Z" fill="rgba(0,0,0,.15)"/>
    <path d="M94,1132 L115,1108 L136,1132" fill="none" stroke="#f4efe2" stroke-width="2.4"/>
    ${[56, 150].map((x) => `<rect x="${x}" y="1150" width="24" height="26" fill="#ffdf9a" class="m-glow"/><path d="M${x - 3},1150 L${x + 12},1140 L${x + 27},1150 Z" fill="#c8323a"/><path d="M${x + 12},1150 v26 M${x},1163 h24" stroke="${P.woodD}" stroke-width="1.4"/>`).join('')}
    <rect x="104" y="1166" width="22" height="44" fill="${P.woodD}"/>
    <rect x="164" y="1094" width="10" height="24" fill="#8f7e6c"/></g>`
  // terrace with tables, a chef with a pot of borscht
  for (const [x, y] of [[230, 1240], [300, 1250], [250, 1290]]) s += `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="16" ry="6" fill="#f3e8d2"/><path d="M0,0 v12" stroke="${P.woodD}" stroke-width="2"/><circle cx="-6" cy="-2" r="2.4" fill="#c8323a"/><circle cx="6" cy="-1" r="2" fill="#e8b830"/></g>`
  s += person(214, 1236, P.blue, 0.8) + person(318, 1246, '#c8323a', 0.8) + person(270, 1290, P.green, 0.8)
  s += `<g transform="translate(200 1200)">${person(0, 0, '#fbf6ea', 0.9)}<rect x="-4" y="-27" width="8" height="6" fill="#fbf6ea"/><g transform="translate(12 -6)"><rect x="-6" y="-6" width="12" height="9" fill="#55585c"/><rect x="-5" y="-7" width="10" height="2" fill="#a8402f"/></g></g>`
  s += tree(350, 1160, 0.8) + birch(20, 1300, 0.7) + birch(370, 1310, 0.6)
  return s
}

// ---------------------------------------------------------------- 1060–800: the fashion atelier (4.3)
function atelier() {
  let s = `<rect x="0" y="800" width="${W}" height="262" fill="#d6cfbb"/><rect x="0" y="800" width="${W}" height="262" fill="url(#m-paving)" opacity=".45"/>`
  s += `<g>
    <rect x="200" y="840" width="186" height="120" fill="#e9c9a8"/><rect x="200" y="834" width="186" height="8" fill="#b9805a"/>
    ${[214, 262, 310, 358].map((x) => `<rect x="${x - 4}" y="852" width="20" height="26" fill="#f4efe2"/><rect x="${x - 1}" y="855" width="14" height="20" fill="#7fa9bd"/>`).join('')}
    ${[220, 300].map((x) => `<rect x="${x}" y="894" width="62" height="56" fill="#f4efe2"/><rect x="${x + 4}" y="898" width="54" height="52" fill="#fff8ea"/>`).join('')}
    <g transform="translate(236 946)"><path d="M0,0 l-7,-24 h14 z" fill="#c8323a"/><circle cx="0" cy="-28" r="3" fill="#e8d9c8"/></g>
    <g transform="translate(266 946)"><path d="M0,0 l-6,-24 h12 z" fill="#3e6ea0"/><circle cx="0" cy="-28" r="3" fill="#e8d9c8"/></g>
    <g transform="translate(316 946)"><rect x="-6" y="-24" width="12" height="16" fill="#2f6b4f"/><path d="M-6,-8 h12 v8 h-12 z" fill="#3a3f45"/><circle cx="0" cy="-28" r="3" fill="#e8d9c8"/></g>
    <g transform="translate(346 946)"><path d="M0,0 l-8,-24 h16 z" fill="#e8b830"/><circle cx="0" cy="-28" r="3" fill="#e8d9c8"/></g>
    <rect x="286" y="908" width="14" height="52" fill="#5a4a3a"/>
    <path d="M196,890 h194 l-8,-10 h-178 z" fill="#2f6b4f"/></g>`
  // rolls of fabric and a seamstress at the door, a lady trying a hat
  for (const [i, c] of ['#c8323a', '#e8b830', '#3e6ea0', '#7f9a86'].entries()) s += `<rect x="${110 + i * 12}" y="900" width="9" height="40" rx="4" fill="${c}"/>`
  s += person(90, 960, '#a8402f', 0.85) + person(160, 972, '#7a3a6a', 0.85, true) + person(120, 1040, P.slate, 0.85)
  s += tree(30, 900, 0.7, 1) + lamp(190, 1010, 0.9)
  return s
}

// ---------------------------------------------------------------- 800–560: the Gostiny Dvor arcades (4.4)
function arcades() {
  let s = `<rect x="0" y="556" width="${W}" height="246" fill="#cfc9b4"/><rect x="0" y="556" width="${W}" height="246" fill="url(#m-cobble)" opacity=".4"/>`
  s += `<g>
    <rect x="20" y="590" width="200" height="110" fill="#efe3c4"/><rect x="20" y="584" width="200" height="8" fill="#c9b484"/>
    ${Array.from({ length: 6 }, (_, i) => `<path d="M${30 + i * 32},700 v-50 a12,12 0 0 1 24,0 v50 z" fill="#7a6a54"/><path d="M${33 + i * 32},700 v-48 a9,9 0 0 1 18,0 v48 z" fill="${i % 2 ? '#ffdf9a' : '#e9cf9a'}" opacity=".9"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${32 + i * 32}" y="604" width="20" height="22" fill="#7fa9bd"/>`).join('')}
    <path d="M14,592 L120,560 L226,592 Z" fill="#a9b7a0"/></g>`
  // shoppers with bags
  for (const [x, y, c] of [[250, 690, '#c8323a'], [290, 720, P.blue], [330, 680, '#e8b830'], [270, 760, P.green]] as const)
    s += person(x, y, c, 0.85) + `<rect x="${x + 4}" y="${y - 10}" width="6" height="7" fill="${['#e66a8a', '#7f9fd0', '#f4efe2'][x % 3]}"/>`
  s += tree(360, 620, 0.8, 2) + tree(380, 780, 0.7) + lamp(236, 640, 0.9)
  return s
}

// ---------------------------------------------------------------- 560–250: the Nizhny Novgorod Fair (goal)
function fair() {
  let s = `<rect x="0" y="250" width="${W}" height="310" fill="#d3d5ae"/>`
  s += patches(260, 550, 8, '#4f6a3f', 0.07)
  s += `<g>
    <rect x="110" y="380" width="180" height="110" fill="#f3e8d2"/><rect x="110" y="374" width="180" height="8" fill="#d9b15a"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${122 + i * 24}" y="396" width="12" height="18" fill="#7fa9bd"/><rect x="${122 + i * 24}" y="430" width="12" height="20" fill="#7fa9bd"/>`).join('')}
    <rect x="176" y="336" width="48" height="154" fill="#fbf6ea"/><rect x="176" y="330" width="48" height="8" fill="#d9b15a"/>
    <path d="M186,490 v-30 a14,14 0 0 1 28,0 v30 z" fill="#7a6a54"/>
    <rect x="190" y="300" width="20" height="30" fill="#fbf6ea"/><circle cx="200" cy="350" r="7" fill="#f4efe2" stroke="#a8832f" stroke-width="1.4"/>
    ${onion(200, 300, 22, 26, 'url(#m-gold)', false)}
    <path d="M200,262 v-22" stroke="#55585c" stroke-width="1.2"/><path d="M200,240 h16 v8 h-16 z" fill="#fbf6ea"/><path d="M200,248 h16 v5 h-16 z" fill="#2f5d8a"/><path d="M200,253 h16 v4 h-16 z" fill="#c8323a"/></g>`
  // fair stalls in front and the river behind
  for (const [i, c] of ['#c8323a', '#e8b830', '#2f6b4f', '#3e6ea0', '#c8323a'].entries())
    s += `<g transform="translate(${60 + i * 64} 520)"><rect x="-14" y="-12" width="28" height="12" fill="${P.woodL}"/><path d="M-17,-12 L0,-24 L17,-12 Z" fill="${c}"/></g>`
  s += person(90, 540, P.brick, 0.8) + person(300, 546, P.blue, 0.8) + birch(30, 470, 0.7) + birch(370, 470, 0.7)
  return s
}

// ---------------------------------------------------------------- 250–0: the Volga and the Oka
function rivers() {
  let s = `<rect x="0" y="0" width="${W}" height="254" fill="${EDGE.meadow}"/>`
  s += `<path d="M0,120 Q120,90 220,130 Q320,170 400,150 V230 Q300,240 200,214 Q90,190 0,210 Z" fill="url(#m-water)"/>`
  for (let i = 0; i < 14; i++) s += `<rect x="${r() * W}" y="${140 + r() * 60}" width="${10 + r() * 20}" height="1.2" fill="#e8f0f0" opacity=".4"/>`
  s += `<g class="m-boat"><g transform="translate(260 170)"><path d="M0,0 h30 l-5,6 h-20 z" fill="#f4efe2"/><rect x="8" y="-6" width="14" height="6" fill="#fbf6ea"/></g></g>`
  s += `<g class="m-drift">${cloud(90, 50, 0.5, false)}${cloud(320, 30, 0.45, false)}</g>`
  return s
}

const nodes: [number, number][] = [[150, 1470], [250, 1170], [130, 860], [260, 640]]
const goal: [number, number] = [200, 510]
const roadPts: [number, number][] = [[185, H + 10], [185, 1640], [180, 1580], nodes[0], [180, 1360], [220, 1300], nodes[1], [220, 1080], [170, 1000], nodes[2], [170, 780], nodes[3], [230, 580], goal, [200, 400], [200, 260], [200, -10]]

function svg() {
  seed(44)
  const d = smooth(roadPts)
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${defs}
    ${rivers()}${fair()}${arcades()}${atelier()}${traktir()}${market()}${pier()}
    ${road(d)}
  </svg>`
}

export const ch4: Mural = {
  height: H, nodes, goal, svg,
  goalLabel: { ru: 'Нижегоро́дская я́рмарка', es: 'Meta del capítulo' },
  sign: [320, 1590],
}
