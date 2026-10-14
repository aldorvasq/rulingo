// Chapter 1 · Moscow. From the airport (start of the whole route) up through VDNKh, the metro,
// Zamoskvorechye and across the river to Red Square; the road enters the Spasskaya gate, crosses the
// Kremlin and leaves Moscow on the northern highway beside the railway to St Petersburg (chapter 2).
import { EDGE, P, W, birch, car, cloud, defs, drum, lamp, onion, patches, person, railway, road, roadSign, seed, smooth, train, tree, r, type Mural } from './kit'

const H = 1900
const O = 200 // the original design's zones sit 200 units lower to make room for the northern exit

// ---------------------------------------------------------------- top: Kremlin grounds and the way north (0–604)
function northGround() {
  let s = `<rect x="0" y="0" width="${W}" height="236" fill="${EDGE.north}"/>`
  // fields
  for (const [x, y, w, h, rot] of [[0, 30, 120, 60, -6], [250, 10, 130, 70, 5], [10, 120, 110, 70, 4], [240, 120, 90, 60, -4]]) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#m-field)" opacity=".8" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"/>`
  s += patches(0, 230, 10)
  // city edge and Kremlin lawn
  s += `<rect x="0" y="236" width="${W}" height="100" fill="#d3cdbb"/>`
  s += `<rect x="0" y="236" width="${W}" height="100" fill="url(#m-paving)" opacity=".5"/>`
  s += `<rect x="0" y="336" width="${W}" height="220" fill="#a9b98c"/>`
  s += patches(340, 550, 12, '#4f6a3f', 0.08)
  // Kremlin lanes
  s += `<path d="M0,470 Q200,430 400,470 M260,560 Q240,470 300,380" fill="none" stroke="#e3dccb" stroke-width="6"/>`
  return s
}

function northObjects() {
  let s = ''
  // railway to St Petersburg from Leningradsky station
  s += railway(340, -2, 262)
  s += `<g class="m-train-up">${train(340, 120, 4)}</g>`
  // Leningradsky station: classical facade with a clock tower
  s += `<g>
    <rect x="262" y="262" width="136" height="44" fill="#e8dcc0"/><rect x="262" y="262" width="136" height="6" fill="#c9b58e"/>
    ${[270, 284, 298, 362, 376, 390].map((x) => `<path d="M${x - 4},306 v-24 a4,4 0 0 1 8,0 v24 z" fill="#5e7d90"/>`).join('')}
    <rect x="318" y="226" width="44" height="80" fill="#efe4c8"/><rect x="348" y="226" width="14" height="80" fill="rgba(0,0,0,.08)"/>
    <circle cx="340" cy="246" r="9" fill="#f8f3e6" stroke="${P.goldD}" stroke-width="1.6"/><path d="M340,246 v-6 M340,246 l4,2" stroke="#2b2b30" stroke-width="1.2"/>
    <path d="M322,226 L340,200 L358,226 Z" fill="#7d8b80"/><line x1="340" y1="200" x2="340" y2="188" stroke="${P.gold}" stroke-width="1.6"/>
    <path d="M330,306 v-22 a10,10 0 0 1 20,0 v22 z" fill="#3a3f45"/></g>`
  // Stalinist high-rise
  s += `<g>
    <rect x="20" y="230" width="70" height="92" fill="#e2d6bd"/><rect x="66" y="230" width="24" height="92" fill="rgba(0,0,0,.1)"/>
    <rect x="34" y="186" width="42" height="44" fill="#e8ddc6"/><rect x="42" y="150" width="26" height="36" fill="#ede3cd"/>
    <path d="M44,150 L55,108 L66,150 Z" fill="#e8ddc6"/><line x1="55" y1="108" x2="55" y2="92" stroke="${P.gold}" stroke-width="1.6"/>
    <path d="M55,84 l2,5 h5 l-4,3 l1.6,5 l-4.6,-3 l-4.6,3 l1.6,-5 l-4,-3 h5 z" fill="url(#m-gold)"/>
    ${Array.from({ length: 6 }, (_, i) => Array.from({ length: 5 }, (_, j) => `<rect x="${25 + j * 13}" y="${238 + i * 13}" width="6" height="8" fill="#6c7f8c"/>`).join('')).join('')}
    ${Array.from({ length: 3 }, (_, i) => Array.from({ length: 3 }, (_, j) => `<rect x="${39 + j * 12}" y="${192 + i * 12}" width="5" height="7" fill="#6c7f8c"/>`).join('')).join('')}
  </g>`
  // shops along the old street
  s += `<rect x="96" y="290" width="40" height="34" fill="#d9b878"/><rect x="96" y="286" width="40" height="5" fill="#b89a5a"/>`
  for (const x of [101, 113, 125]) s += `<rect x="${x}" y="298" width="7" height="10" fill="#5e7d90"/>`
  s += lamp(150, 330, 0.8) + lamp(240, 330, 0.8) + person(232, 326, '#a8402f', 0.9) + person(160, 322, '#3e5a78', 0.9, true)
  s += car(250, 300, '#3e5a78', 0.9) + car(160, 252, '#a8402f', 0.9, true)
  // birch groves, dachas and the highway sign
  for (const [x, y, sc] of [[30, 70, 0.8], [60, 92, 0.7], [18, 112, 0.75], [120, 34, 0.6], [290, 108, 0.65], [262, 70, 0.6], [384, 160, 0.75], [100, 200, 0.7]]) s += birch(x, y, sc)
  s += `<g transform="translate(230 196)"><rect x="-14" y="-14" width="28" height="14" fill="#c9a47a"/><path d="M-17,-14 L0,-26 L17,-14 Z" fill="${P.brick}"/><rect x="-4" y="-9" width="7" height="7" fill="#5e7d90"/></g>`
  s += `<g transform="translate(150 96)"><rect x="-12" y="-12" width="24" height="12" fill="#b5c4b0"/><path d="M-15,-12 L0,-22 L15,-12 Z" fill="#6d5a4a"/><rect x="-3" y="-8" width="6" height="6" fill="#5e7d90"/></g>`
  s += roadSign(250, 150, ['Санкт‑Петербург', '700 км'], '#2f6b4f')
  s += `<g class="m-drift">${cloud(90, 170, 0.55, false)}${cloud(310, 40, 0.5, false)}</g>`
  return s
}

/** The Kremlin behind the wall: cathedral domes, the Grand Palace and the Ivan the Great bell tower. */
function kremlinInside() {
  let s = ''
  s += tree(18, 470, 0.8) + tree(380, 452, 0.7, 2) + tree(205, 414, 0.7) + tree(60, 420, 0.7, 2)
  // Grand Kremlin Palace
  s += `<rect x="236" y="384" width="120" height="40" fill="#efe6d2"/><rect x="236" y="378" width="120" height="7" fill="#7f9a86"/>`
  for (let x = 242; x < 352; x += 10) s += `<rect x="${x}" y="392" width="5" height="10" fill="#7b8d98"/><rect x="${x}" y="408" width="5" height="10" fill="#7b8d98"/>`
  // Arsenal (ochre)
  s += `<rect x="0" y="372" width="54" height="34" fill="#e2c27e"/><rect x="0" y="368" width="54" height="5" fill="#7f9a86"/>`
  for (let x = 4; x < 50; x += 9) s += `<rect x="${x}" y="380" width="5" height="9" fill="#7b8d98"/>`
  // Cathedral of the Assumption: white with five gold domes
  s += `<g>${drum(172, 486, 56, 62, '#f4efe3', '#e8dcc0')}
    ${drum(186, 462, 10, 26, '#f4efe3', '#e8dcc0')}${drum(204, 456, 12, 32, '#f4efe3', '#e8dcc0')}${drum(220, 462, 10, 26, '#f4efe3', '#e8dcc0')}
    ${onion(191, 462, 13, 15, 'url(#m-gold)')}${onion(210, 456, 16, 19, 'url(#m-gold)')}${onion(225, 462, 13, 15, 'url(#m-gold)')}</g>`
  // Ivan the Great bell tower
  s += `<g>
    <rect x="358" y="470" width="26" height="80" fill="#f6f1e5"/><rect x="374" y="470" width="10" height="80" fill="rgba(0,0,0,.08)"/>
    <rect x="361" y="430" width="20" height="40" fill="#f6f1e5"/><rect x="364" y="400" width="14" height="30" fill="#f6f1e5"/>
    ${[478, 500, 522].map((y) => `<path d="M364,${y + 14} v-10 a3,3 0 0 1 6,0 v10 z M372,${y + 14} v-10 a3,3 0 0 1 6,0 v10 z" fill="#8c7a5e"/>`).join('')}
    <path d="M366,438 v-6 a2,2 0 0 1 4,0 v6 z M372,438 v-6 a2,2 0 0 1 4,0 v6 z" fill="#8c7a5e"/>
    <rect x="356" y="466" width="30" height="4" fill="#e3d8bf"/><rect x="359" y="426" width="24" height="4" fill="#e3d8bf"/>
    ${onion(371, 402, 18, 24, 'url(#m-gold)')}</g>`
  return s
}

const nodes: [number, number][] = [[108, 1800], [92, 1498], [176, 1262], [128, 990]]
const goal: [number, number] = [204, 670]
// The road: airport → lessons → Red Square → into the Spasskaya gate (drawn over everything), then
// from behind the wall through the Kremlin and north (drawn under the wall and the Kremlin buildings).
const roadA = smooth([[108, H + 10], nodes[0], [70, 1650], nodes[1], [130, 1390], nodes[2], [300, 1210], [318, 1130], [240, 1080], nodes[3], [168, 840], [176, 740], goal, [118, 640], [80, 612]])
const roadB = smooth([[80, 600], [100, 540], [140, 470], [128, 400], [176, 330], [212, 240], [196, 140], [200, 60], [200, -10]])

function svg() {
  seed(7)
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${defs}
    ${northGround()}
    ${road(roadB)}
    ${northObjects()}
    ${kremlinInside()}
    <g transform="translate(0 ${O})">${kremlinFront()}${riverside()}${metro()}${vdnkh()}${airport()}</g>
    ${road(roadA)}
    <g transform="translate(0 ${O})">
      <path d="M154,624 L160,536 M196,624 L190,536" stroke="#cfc6b4" stroke-width="4"/>
      <path d="M154,624 L160,536 M196,624 L190,536" stroke="#8f8170" stroke-width="1" stroke-dasharray="3 4"/>
    </g>
  </svg>`
}

export const ch1: Mural = {
  height: H, nodes, goal, svg,
  goalLabel: { ru: 'Кра́сная пло́щадь', es: 'Meta del capítulo' },
  sign: [300, 1830],
}

// ---------------------------------------------------------------- zones from the approved design (original coordinates)
function kremlinFront() {
  let s = ""
  // Kremlin wall with swallowtail merlons
  s += `<rect x="0" y="352" width="${W}" height="52" fill="${P.brick}"/><rect x="0" y="352" width="${W}" height="6" fill="${P.brickL}"/>`
  for (let x = 0; x < W; x += 13) s += `<path d="M${x + 2},352 v-11 l2.5,4 l2.5,-4 l2.5,4 l2.5,-4 v11 z" fill="${P.brick}"/><rect x="${x + 5}" y="346" width="2" height="4" fill="#3a2a22"/>`
  for (let y = 362; y < 404; y += 7) for (let x = (y % 14 ? 0 : 7); x < W; x += 14) s += `<rect x="${x}" y="${y}" width="13" height="6" fill="none" stroke="rgba(0,0,0,.08)" stroke-width=".6"/>`
  // Spasskaya tower
  s += `<g>
    <rect x="52" y="250" width="56" height="154" fill="${P.brick}"/><rect x="88" y="250" width="20" height="154" fill="rgba(0,0,0,.16)"/>
    <path d="M66,404 v-36 a14,14 0 0 1 28,0 v36 z" fill="#3a2a22"/>
    <rect x="50" y="246" width="60" height="7" fill="${P.cream}"/>
    ${[56, 70, 84, 98].map((x) => `<path d="M${x},246 l3,-8 l3,8 z" fill="${P.cream}"/>`).join('')}
    <rect x="60" y="196" width="40" height="50" fill="${P.brick}"/><rect x="86" y="196" width="14" height="50" fill="rgba(0,0,0,.16)"/>
    <circle cx="80" cy="222" r="14" fill="#2c3e57" stroke="${P.gold}" stroke-width="2.4"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<circle cx="${80 + Math.cos(a) * 10.5}" cy="${222 + Math.sin(a) * 10.5}" r=".9" fill="${P.gold}"/>` }).join('')}
    <line x1="80" y1="222" x2="80" y2="213" stroke="${P.gold}" stroke-width="1.6"/><line x1="80" y1="222" x2="86" y2="225" stroke="${P.gold}" stroke-width="1.4"/>
    <rect x="58" y="192" width="44" height="5" fill="${P.cream}"/>
    <rect x="65" y="160" width="30" height="32" fill="${P.white}"/><rect x="84" y="160" width="11" height="32" fill="rgba(0,0,0,.1)"/>
    ${[68, 76, 84].map((x) => `<path d="M${x},188 v-14 a3,3 0 0 1 6,0 v14 z" fill="#8c3a2c"/>`).join('')}
    ${[64, 72, 80, 88, 96].map((x) => `<path d="M${x - 2},160 l2,-9 l2,9 z" fill="${P.white}"/>`).join('')}
    <path d="M66,158 L80,72 L94,158 Z" fill="${P.green}"/><path d="M80,72 L94,158 L86,158 Z" fill="rgba(0,0,0,.2)"/>
    ${[100, 120, 140].map((y) => `<line x1="${80 - (y - 72) * 0.163}" y1="${y}" x2="${80 + (y - 72) * 0.163}" y2="${y}" stroke="${P.gold}" stroke-width=".8"/>`).join('')}
    <line x1="80" y1="74" x2="80" y2="64" stroke="${P.gold}" stroke-width="1.5"/>
    <circle cx="80" cy="54" r="16" fill="#ff8a6a" opacity=".35" class="m-glow"/>
    <path d="M80,43 L83,51 L91.5,51 L84.8,56 L87.3,64 L80,59 L72.7,64 L75.2,56 L68.5,51 L77,51 Z" fill="#c8322a" stroke="${P.gold}" stroke-width="1.2"/>
  </g>`
  // St Basil's Cathedral
  s += `<g>
    <rect x="168" y="382" width="190" height="52" fill="${P.brick}"/><rect x="300" y="382" width="58" height="52" fill="rgba(0,0,0,.14)"/>
    ${Array.from({ length: 11 }, (_, i) => `<path d="M${172 + i * 17},434 v-24 a7,7 0 0 1 14,0 v24 z" fill="${P.cream}"/><path d="M${175 + i * 17},434 v-20 a4,4 0 0 1 8,0 v20 z" fill="#5a2f25"/>`).join('')}
    <rect x="166" y="378" width="194" height="6" fill="${P.cream}"/>
    <path d="M150,434 L168,404 L168,434 Z" fill="${P.brickD}"/>
    ${drum(186, 320, 28, 60)}${drum(316, 320, 28, 60, '#b5543c')}
    ${drum(214, 270, 22, 112, '#b04a35')}${drum(300, 270, 22, 112, '#a3402f')}
    ${drum(244, 222, 36, 160)}
    <path d="M238,224 L262,120 L286,224 Z" fill="url(#m-pTent)"/><path d="M262,120 L286,224 L274,224 Z" fill="rgba(0,0,0,.22)"/>
    ${[160, 190].map((y) => `<path d="M${262 - (y - 120) * 0.23},${y} h${(y - 120) * 0.46}" stroke="${P.gold}" stroke-width="1.6"/>`).join('')}
    ${onion(262, 122, 15, 18, 'url(#m-gold)')}
    ${onion(225, 272, 30, 38, 'url(#m-pRW)')}
    ${onion(311, 272, 30, 38, 'url(#m-pD)')}
    ${onion(200, 322, 38, 48, 'url(#m-pGY)')}
    ${onion(330, 322, 38, 48, 'url(#m-pBW)')}
    ${drum(163, 384, 18, 50, '#b5543c')}${onion(172, 386, 22, 26, 'url(#m-pZ)')}
    ${drum(343, 384, 18, 50, '#9f3e2e')}${onion(352, 386, 22, 26, 'url(#m-pGY)')}
  </g>`
  // Square: cobbles, lamps, people, pigeons
  s += `<rect x="0" y="404" width="${W}" height="120" fill="url(#m-cobble)"/>`
  s += `<rect x="0" y="404" width="${W}" height="120" fill="url(#m-warm)" opacity=".7"/>`
  s += `<path d="M0,404 h400" stroke="#7f2f23" stroke-width="2" opacity=".5"/>`
  s += lamp(140, 470, 1) + lamp(372, 470, 1)
  s += person(110, 488, '#3e5a78') + person(118, 490, '#a8402f', .95) + person(318, 478, '#2f6b4f', .9) + person(330, 480, '#d9b15a', .9, true) + person(60, 505, '#5d4a3a')
  for (const [px, py] of [[240, 500], [248, 503], [256, 499]]) s += `<ellipse cx="${px}" cy="${py}" rx="3" ry="1.8" fill="#7d838a"/><circle cx="${px + 2.4}" cy="${py - 1.4}" r="1.2" fill="#6a7077"/>`
    return s
}

function riverside() {
  let s = `<rect x="0" y="520" width="${W}" height="16" fill="#cfc6b4"/><rect x="0" y="534" width="${W}" height="4" fill="#9f9583"/>`
  for (let x = 0; x < W; x += 10) s += `<rect x="${x}" y="514" width="6" height="8" fill="#d8d0bf"/>`
  s += `<rect x="0" y="538" width="${W}" height="86" fill="url(#m-water)"/>`
  for (let i = 0; i < 26; i++) { const y = 546 + r() * 72, x = r() * W; s += `<rect x="${x}" y="${y}" width="${10 + r() * 30}" height="1.4" rx=".7" fill="#f6dfae" opacity="${0.25 + r() * 0.5}"/>` }
  for (let i = 0; i < 18; i++) { const y = 546 + r() * 72, x = r() * W; s += `<rect x="${x}" y="${y}" width="${6 + r() * 18}" height="1" fill="#2e4c5c" opacity=".35"/>` }
  // reflection of the cathedral warmth
  s += `<rect x="190" y="540" width="140" height="80" fill="#f0b67a" opacity=".12"/>`
  // river tram
  s += `<g class="m-boat"><g transform="translate(18 590)">
    <path d="M0,0 h70 l-6,9 h-58 z" fill="#f4f1ea"/><path d="M0,0 h70 l-1,2 h-68 z" fill="${P.blue}"/>
    <rect x="10" y="-11" width="44" height="11" fill="#e8e4d8"/><rect x="12" y="-9" width="40" height="5" fill="#5a7a90"/>
    <rect x="20" y="-16" width="20" height="5" fill="#f4f1ea"/><rect x="50" y="-19" width="2" height="8" fill="#3a3f45"/>
    <path d="M-6,8 q20,5 40,0 q20,5 40,0" fill="none" stroke="#e8f0f0" stroke-width="1.2" opacity=".7"/></g></g>`
  // south embankment
  s += `<rect x="0" y="624" width="${W}" height="10" fill="#cfc6b4"/><rect x="0" y="632" width="${W}" height="3" fill="#9f9583"/>`
  s += `<rect x="0" y="635" width="${W}" height="250" fill="#d9d2bf"/>`
  // merchant houses
  const houses: [number, number, string][] = [[4, 62, '#e3c27f'], [70, 62, '#c9d3b8'], [196, 44, '#efd2b2']] // gap at x≈140–190 for the way through
  for (const [x, w, c] of houses) {
    const top = 660, h = 66
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${c}"/>
      <path d="M${x - 3},${top} L${x + w / 2},${top - 18} L${x + w + 3},${top} Z" fill="#6d5a4a"/><path d="M${x + w / 2},${top - 18} L${x + w + 3},${top} L${x + w / 2},${top} Z" fill="rgba(0,0,0,.18)"/>
      <rect x="${x}" y="${top + h - 4}" width="${w}" height="4" fill="rgba(0,0,0,.12)"/>`
    for (let wx = x + 7; wx < x + w - 10; wx += 14) for (const wy of [top + 10, top + 36]) s += `<rect x="${wx}" y="${wy}" width="8" height="14" fill="#4b5b68"/><rect x="${wx - 1.5}" y="${wy - 3}" width="11" height="3" fill="${P.white}"/><rect x="${wx}" y="${wy}" width="8" height="4" fill="#ffe2a0" opacity=".55"/>`
  }
  // little church with gold dome
  s += `${drum(244, 640, 26, 86, P.white)}${onion(257, 642, 30, 34, 'url(#m-gold)')}`
  // business-conference hall (Stalinist neoclassical) with banner
  s += `<g>
    <rect x="282" y="650" width="114" height="80" fill="#e9dcc0"/><rect x="362" y="650" width="34" height="80" fill="rgba(0,0,0,.1)"/>
    <path d="M278,650 L339,622 L400,650 Z" fill="#d8c8a6"/><path d="M290,648 L339,627 L388,648 Z" fill="#cbb994"/>
    ${[290, 306, 322, 338, 354, 370, 386].map((x) => `<rect x="${x}" y="660" width="6" height="66" fill="#f6efe0"/><rect x="${x + 4}" y="660" width="2" height="66" fill="rgba(0,0,0,.12)"/>`).join('')}
    <rect x="280" y="726" width="118" height="6" fill="#bfae8a"/>
    <rect x="300" y="664" width="78" height="15" fill="${P.brick}"/>
    <text x="339" y="675" text-anchor="middle" font-family="PT Serif" font-weight="700" font-size="8.5" fill="#fff">КОНФЕРЕНЦИЯ</text>
    ${[300, 378].map((x) => `<line x1="${x}" y1="650" x2="${x}" y2="618" stroke="#3a3f45" stroke-width="1"/><path d="M${x},618 h13 v4 h-13 z" fill="#fff"/><path d="M${x},622 h13 v4 h-13 z" fill="${P.blue}"/><path d="M${x},626 h13 v4 h-13 z" fill="${P.brick}"/>`).join('')}
  </g>`
  s += tree(14, 748, .9) + tree(236, 752, .8, 1) + birch(392, 760, .8) + lamp(200, 772, .9)
  s += person(300, 748, '#3e5a78', 1, true) + person(312, 746, '#2a2a2e', 1) + person(352, 750, '#a8402f', 1) + person(326, 752, '#5d4a3a', .95, true)
  return s
}

// ---------------------------------------------------------------- 3. Metro: pavilion + palace-station cutaway (880–1170)
function metro() {
  let s = `<rect x="0" y="870" width="${W}" height="50" fill="#d6cfbc"/>`
  // street & tram rails
  s += `<rect x="0" y="905" width="${W}" height="16" fill="#8e8b84"/><path d="M0,909 h400 M0,917 h400" stroke="#6d6a64" stroke-width="1"/>`
  // pavilion with red M
  s += `<g>
    <rect x="248" y="842" width="124" height="66" fill="#e8dcc4"/><rect x="342" y="842" width="30" height="66" fill="rgba(0,0,0,.1)"/>
    <path d="M244,842 h132 l-8,-12 h-116 z" fill="#cdbd9c"/>
    <path d="M286,908 v-34 a24,24 0 0 1 48,0 v34 z" fill="#3a3f45"/><path d="M292,908 v-32 a18,18 0 0 1 36,0 v32 z" fill="#ffd98a" opacity=".55" class="m-glow"/>
    ${[254, 270, 342, 358].map((x) => `<rect x="${x}" y="850" width="8" height="58" fill="#f6efe0"/>`).join('')}
    <circle cx="310" cy="818" r="15" fill="#c8322a"/><circle cx="310" cy="818" r="22" fill="#ff8a6a" opacity=".25" class="m-glow"/>
    <text x="310" y="824.5" text-anchor="middle" font-family="PT Sans" font-weight="700" font-size="18" fill="#fff">М</text>
    <line x1="310" y1="833" x2="310" y2="830" stroke="#555" stroke-width="2"/>
  </g>`
  s += tree(40, 900, .85, 2) + tree(200, 898, .75) + lamp(110, 904, .9) + person(150, 902, '#2f6b4f', .95) + person(228, 902, '#d9b15a', .9)
  // underground cutaway
  const top = 924, bot = 1168
  s += `<rect x="0" y="${top}" width="${W}" height="${bot - top}" fill="url(#m-earth)"/>`
  for (let i = 0; i < 40; i++) s += `<ellipse cx="${r() * W}" cy="${top + 4 + r() * 20}" rx="${2 + r() * 4}" ry="${1 + r() * 2}" fill="#6e5440" opacity=".7"/>`
  // the hall: vaulted ceiling, arcade, chandeliers, platform, train
  s += `<path d="M14,1148 V990 Q200,920 386,990 V1148 Z" fill="url(#m-vault)"/>`
  s += `<path d="M40,990 Q200,936 360,990 L360,998 Q200,946 40,998 Z" fill="url(#m-mosaic)" opacity=".9"/>`
  s += `<rect x="14" y="1060" width="372" height="50" fill="#6f6250"/><rect x="14" y="1104" width="372" height="6" fill="#3d3a36"/>`
  s += `<clipPath id="m-hallClip"><rect x="14" y="1000" width="372" height="148"/></clipPath>`
  s += `<g clip-path="url(#m-hallClip)"><g class="m-metro"><g transform="translate(330 1106)">
    ${[0, 1, 2, 3, 4].map((k) => `<g transform="translate(${k * 96} 0)"><rect x="0" y="-42" width="92" height="42" rx="6" fill="#3e6b8f"/><rect x="0" y="-14" width="92" height="5" fill="#c8b98d"/>
      ${[8, 30, 52, 72].map((wx) => `<rect x="${wx}" y="-35" width="14" height="14" rx="2" fill="#ffe7ae" opacity=".9"/>`).join('')}</g>`).join('')}
    <rect x="-3" y="-36" width="6" height="18" rx="2" fill="#ffd27a"/></g></g></g>`
  for (let i = 0; i < 6; i++) {
    const x = 34 + i * 66
    s += `<path d="M${x},1110 V1036 Q${x + 33},1000 ${x + 66},1036 V1110" fill="none" stroke="#f8ecd0" stroke-width="7"/>`
    s += `<path d="M${x},1110 V1036 Q${x + 33},1000 ${x + 66},1036 V1110" fill="none" stroke="#c9a457" stroke-width="1.2"/>`
  }
  for (let i = 0; i < 7; i++) { const x = 34 + i * 66; s += `<rect x="${x - 6}" y="1030" width="12" height="82" fill="#efe3cc"/><rect x="${x + 2}" y="1030" width="4" height="82" fill="rgba(0,0,0,.12)"/><rect x="${x - 8}" y="1026" width="16" height="6" fill="#c9a457"/>` }
  for (const x of [100, 200, 300]) {
    s += `<circle cx="${x}" cy="1006" r="30" fill="url(#m-chand)" class="m-glow"/><line x1="${x}" y1="972" x2="${x}" y2="996" stroke="#a8832f" stroke-width="1.2"/>`
    s += `<path d="M${x - 14},1000 q14,14 28,0 z" fill="url(#m-gold)"/>`
    for (const dx of [-14, -7, 0, 7, 14]) s += `<circle cx="${x + dx}" cy="${998 - Math.abs(dx) * 0.2}" r="2.3" fill="#fff6d6"/>`
  }
  s += `<rect x="14" y="1110" width="372" height="38" fill="#cbbfa6"/><rect x="14" y="1110" width="372" height="2" fill="#f4ead2"/>`
  for (let i = 0; i < 12; i++) s += `<path d="M${14 + i * 31},1112 L${4 + i * 31},1148" stroke="#b5a98f" stroke-width=".8"/>`
  for (const x of [100, 200, 300]) s += `<ellipse cx="${x}" cy="1126" rx="26" ry="5" fill="#fff4cf" opacity=".35"/>`
  s += `<path d="M0,${top} h${W}" stroke="#4d3a2c" stroke-width="3"/>`
  // escalator up to the pavilion
  s += `<path d="M290,1000 L318,930" stroke="#6f6a62" stroke-width="12"/><path d="M290,1000 L318,930" stroke="#c9c1b0" stroke-width="8" stroke-dasharray="2 3"/>`
  s += person(80, 1132, '#a8402f', 1) + person(92, 1133, '#3e5a78', 1, true) + person(236, 1136, '#2f6b4f', 1) + person(160, 1130, '#5d4a3a', .95)
  return s
}

// ---------------------------------------------------------------- 4. VDNKh: Friendship of Peoples fountain (1170–1410)
function vdnkh() {
  let s = `<rect x="0" y="1168" width="${W}" height="250" fill="#cfd5b5"/>`
  for (let i = 0; i < 18; i++) s += `<ellipse cx="${r() * W}" cy="${1180 + r() * 220}" rx="${20 + r() * 30}" ry="${5 + r() * 4}" fill="#a9b98c" opacity=".35"/>`
  // central pavilion with star spire in the back
  s += `<g>
    <rect x="300" y="1236" width="96" height="40" fill="#efe4c8"/><path d="M300,1236 L348,1224 L396,1236 Z" fill="#d9c9a2"/>
    ${[306, 320, 334, 362, 376, 390].map((x) => `<rect x="${x - 2}" y="1241" width="4" height="35" fill="#fbf6ea"/>`).join('')}
    <rect x="337" y="1210" width="22" height="26" fill="#efe4c8"/><rect x="341" y="1194" width="14" height="16" fill="#efe4c8"/><rect x="351" y="1194" width="4" height="42" fill="rgba(0,0,0,.08)"/>
    <path d="M343,1194 L348,1170 L353,1194 Z" fill="url(#m-gold)"/>
  </g>`
  // flowerbeds
  for (const [fx, fy] of [[200, 1385], [370, 1385]]) {
    s += `<ellipse cx="${fx}" cy="${fy}" rx="34" ry="9" fill="#6b8a4c"/>`
    for (let i = 0; i < 16; i++) s += `<circle cx="${fx - 28 + r() * 56}" cy="${fy - 5 + r() * 9}" r="1.8" fill="${['#c8322a', '#e8c25a', '#f4f1ea', '#d96a4a'][i % 4]}"/>`
  }
  // fountain basin
  const cx = 262, cy = 1318
  s += `<ellipse cx="${cx}" cy="${cy + 6}" rx="104" ry="34" fill="#9f9583"/>`
  s += `<ellipse cx="${cx}" cy="${cy}" rx="104" ry="32" fill="#e8e0cc"/>`
  s += `<ellipse cx="${cx}" cy="${cy}" rx="96" ry="27" fill="url(#m-water)"/>`
  for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2; s += `<ellipse cx="${cx + Math.cos(a) * 70 * r()}" cy="${cy + Math.sin(a) * 18 * r()}" rx="${6 + r() * 8}" ry="1" fill="#e8f4f6" opacity=".6"/>` }
  // golden figures in a ring (back half first, then the sheaf, then front half)
  const figs = Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return { x: cx + Math.cos(a) * 62, y: cy + Math.sin(a) * 15, back: Math.sin(a) < 0 } })
  const fig = ({ x, y }: { x: number; y: number }) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="4" ry="1.4" fill="#7d6a3a"/><rect x="-3" y="-3" width="6" height="3" fill="#c9b07a"/>
    <path d="M-2.4,-3 L-2,-13 Q0,-15 2,-13 L2.4,-3 Z" fill="url(#m-gold)"/><circle cx="0" cy="-15.5" r="2.1" fill="url(#m-gold)"/><path d="M2,-11 l3,-4" stroke="#d4a945" stroke-width="1.2"/></g>`
  s += figs.filter((f) => f.back).map(fig).join('')
  // water jets
  for (const dx of [-40, -20, 20, 40]) s += `<path class="m-jet" d="M${cx + dx},${cy - 4} Q${cx + dx * 0.5},${cy - 70} ${cx},${cy - 52}" fill="none" stroke="#e6f3f6" stroke-width="2" opacity=".85"/>`
  s += `<path class="m-jet" d="M${cx},${cy - 2} V${cy - 96}" stroke="#e6f3f6" stroke-width="3" opacity=".8"/>`
  // the golden wheat sheaf
  s += `<g><path d="M${cx - 9},${cy} L${cx - 5},${cy - 40} Q${cx},${cy - 68} ${cx + 5},${cy - 40} L${cx + 9},${cy} Z" fill="url(#m-gold)"/>`
  for (let k = 0; k < 6; k++) s += `<path d="M${cx},${cy - 30 - k * 5} q${k % 2 ? 9 : -9},-4 ${k % 2 ? 12 : -12},-12" fill="none" stroke="#e7c56b" stroke-width="2"/>`
  s += `<circle cx="${cx}" cy="${cy - 64}" r="5" fill="url(#m-gold)"/></g>`
  s += figs.filter((f) => !f.back).map(fig).join('')
  for (let i = 0; i < 10; i++) s += `<circle class="m-twinkle" style="animation-delay:${(i * 0.23).toFixed(2)}s" cx="${cx - 60 + r() * 120}" cy="${cy - 90 + r() * 70}" r="1.3" fill="#fff"/>`
  s += birch(26, 1236, .95) + birch(56, 1252, .8) + birch(196, 1222, .75) + tree(388, 1330, .8, 1) + birch(20, 1400, .9)
  s += person(160, 1352, '#a8402f', 1) + person(171, 1354, '#e8c25a', .7) + person(398, 1268, '#3e5a78', .9)
  return s
}

// ---------------------------------------------------------------- 5. Airport (1410–1700)
function airport() {
  let s = `<rect x="0" y="1410" width="${W}" height="290" fill="url(#m-tarmac)"/>`
  s += `<path d="M0,1410 h400" stroke="#8d9a74" stroke-width="10"/>`
  // terminal: glass with a wave roof
  s += `<g>
    <path d="M222,1424 Q300,1404 398,1418 V1500 H222 Z" fill="url(#m-glass)"/>
    <path d="M216,1426 Q300,1402 400,1416 L400,1408 Q300,1394 216,1418 Z" fill="#e8e6de"/>
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${230 + i * 14}" y1="1420" x2="${230 + i * 14}" y2="1500" stroke="#5e7d90" stroke-width="1"/>`).join('')}
    <line x1="222" y1="1456" x2="400" y2="1456" stroke="#5e7d90" stroke-width="1"/>
    <path d="M232,1422 L262,1500 M300,1414 L330,1500" stroke="#fff" stroke-width="5" opacity=".25"/>
    <rect x="222" y="1500" width="178" height="5" fill="#7c7a72"/>
    <rect x="252" y="1440" width="70" height="11" fill="#2a3a48"/><text x="287" y="1448.5" text-anchor="middle" font-family="PT Sans" font-weight="700" font-size="7.5" fill="#ffe2a0">АЭРОПОРТ</text>
  </g>`
  // control tower
  s += `<g><rect x="196" y="1400" width="12" height="102" fill="#d8d4c8"/><rect x="203" y="1400" width="5" height="102" fill="rgba(0,0,0,.12)"/>
    <path d="M184,1400 h36 l-4,-16 h-28 z" fill="#5f8496"/><path d="M186,1384 h32 v-4 h-32 z" fill="#e8e6de"/><line x1="202" y1="1380" x2="202" y2="1366" stroke="#555"/><circle cx="202" cy="1365" r="1.6" fill="#c8322a" class="m-twinkle"/></g>`
  // runway with markings and lights
  // a straight, even runway running left–right along the bottom (the plane takes off along it)
  s += `<rect x="170" y="1636" width="236" height="40" fill="#6e6d68"/><rect x="170" y="1636" width="236" height="3" fill="#f4f1ea"/><rect x="170" y="1673" width="236" height="3" fill="#f4f1ea"/>`
  for (let x = 180; x < 400; x += 22) s += `<rect x="${x}" y="1654.5" width="12" height="3" fill="#f4f1ea"/>`
  for (let x = 174; x < 404; x += 16) s += `<circle class="m-twinkle" style="animation-delay:${((x / 16) * 0.15).toFixed(2)}s" cx="${x}" cy="1632" r="1.4" fill="#ffd27a"/><circle cx="${x}" cy="1680" r="1.4" fill="#ffd27a"/>`
  // the plane taking off
  s += `<g class="m-plane"><g transform="translate(318 1640) rotate(-24) scale(1.45)">
    <ellipse cx="0" cy="22" rx="46" ry="5" fill="rgba(0,0,0,.18)" transform="rotate(24)"/>
    <path d="M-52,0 Q-56,-6 -46,-8 L36,-8 Q52,-8 58,-2 Q52,4 36,4 L-46,4 Q-56,4 -52,0 Z" fill="#f8f7f2"/>
    <path d="M-46,-1 H50" stroke="${P.blue}" stroke-width="2.4"/>
    <path d="M-44,-8 L-56,-28 L-46,-28 L-30,-8 Z" fill="${P.blue}"/>
    <path d="M-6,2 L-26,22 L-14,22 L14,2 Z" fill="#d8d8d0"/><path d="M-6,-6 L-20,-18 L-12,-18 L8,-6 Z" fill="#c9c9c0"/>
    ${Array.from({ length: 10 }, (_, i) => `<circle cx="${-30 + i * 7}" cy="-4" r="1.3" fill="#3e5a78"/>`).join('')}
    <path d="M48,-6 q6,1 8,4 h-8 z" fill="#2c3e57"/>
  </g></g>`
  // apron: baggage cart, windsock, cones, a traveller with a suitcase
  s += `<g transform="translate(150 1478)"><rect x="0" y="0" width="30" height="10" fill="#e8c25a"/><rect x="2" y="-8" width="12" height="8" fill="#a8402f"/><rect x="15" y="-6" width="12" height="6" fill="#3e5a78"/><circle cx="6" cy="11" r="2.6" fill="#2b2b30"/><circle cx="24" cy="11" r="2.6" fill="#2b2b30"/></g>`
  s += `<g transform="translate(30 1450)"><line x1="0" y1="0" x2="0" y2="-26" stroke="#555" stroke-width="1.5"/><path d="M0,-26 l20,3 l-1,6 l-19,-3 z" fill="#e66a3a"/><path d="M7,-25 l0,6 M14,-24 l0,6" stroke="#f4f1ea" stroke-width="2"/></g>`
  for (const [x, y] of [[60, 1660], [80, 1668], [100, 1676]]) s += `<path d="M${x - 3},${y} l3,-8 l3,8 z" fill="#e66a3a"/><rect x="${x - 2}" y="${y - 5}" width="4" height="1.4" fill="#fff"/>`
  s += `<g>${person(48, 1560, '#a8402f', 1.1)}<rect x="52" y="1551" width="7" height="9" rx="1" fill="#3e5a78"/><line x1="55.5" y1="1551" x2="55.5" y2="1546" stroke="#2b2b30"/></g>`
  s += tree(14, 1510, .8, 1) + tree(388, 1530, .7, 1)
  return s
}

