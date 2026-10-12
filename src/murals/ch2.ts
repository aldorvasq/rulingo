// Chapter 2 · St Petersburg — «Mis cosas, mi familia y mis pasatiempos». The highway from Moscow arrives
// beside the same railway at Moskovsky station, reaches the Neva pier and its flea market (2.1), a
// courtyard-well full of families and the post office with its dog (2.2), the football stadium (2.3),
// painters and musicians on the Griboyedov canal by the Saviour on Spilled Blood (2.4), and Palace
// Square. The road passes under the Winter Palace arch, crosses the Neva by the fortress and leaves
// north into the birch forest of chapter 3.
import { EDGE, P, W, birch, car, cloud, defs, drum, lamp, onion, patches, person, pine, railway, road, roadSign, seed, smooth, train, tree, r, type Mural } from './kit'

const H = 1800

// ---------------------------------------------------------------- 1800–1560: arriving on the northern highway
function arrival() {
  let s = `<rect x="0" y="1540" width="${W}" height="${H - 1540}" fill="${EDGE.north}"/>`
  for (const [x, y, w, h, rot] of [[0, 1700, 120, 70, 4], [230, 1720, 90, 60, -5], [10, 1590, 100, 60, -3]]) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#m-field)" opacity=".75" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"/>`
  s += patches(1560, 1800, 8)
  s += railway(340, 1600, H + 2)
  s += `<g class="m-train-up">${train(340, 1690, 4)}</g>`
  // Moskovsky station (where trains from Moscow arrive)
  s += `<g>
    <rect x="282" y="1556" width="116" height="44" fill="#ead8b4"/><rect x="282" y="1552" width="116" height="6" fill="#c9b58e"/>
    ${[290, 304, 318, 362, 376, 390].map((x) => `<path d="M${x - 4},1600 v-22 a4,4 0 0 1 8,0 v22 z" fill="#5e7d90"/>`).join('')}
    <rect x="324" y="1520" width="32" height="80" fill="#f0e2c4"/><circle cx="340" cy="1538" r="8" fill="#f8f3e6" stroke="${P.goldD}" stroke-width="1.5"/>
    <path d="M340,1538 v-5 M340,1538 l3,2" stroke="#2b2b30" stroke-width="1.1"/><path d="M326,1520 L340,1500 L354,1520 Z" fill="#7d8b80"/>
    <path d="M330,1600 v-18 a10,10 0 0 1 20,0 v18 z" fill="#3a3f45"/></g>`
  for (const [x, y, sc] of [[30, 1780, 0.8], [70, 1760, 0.7], [24, 1660, 0.75], [262, 1790, 0.7], [380, 1700, 0.6]]) s += pine(x, y, sc)
  for (const [x, y, sc] of [[110, 1770, 0.6], [250, 1660, 0.6], [40, 1720, 0.6]]) s += birch(x, y, sc)
  // city entrance stele
  s += `<g transform="translate(96 1640)"><ellipse cx="0" cy="2" rx="22" ry="4" fill="rgba(0,0,0,.18)"/><rect x="-18" y="-6" width="36" height="6" fill="#bdb3a0"/>
    <rect x="-4" y="-56" width="8" height="50" fill="#e8e1d2"/><path d="M-4,-56 L0,-66 L4,-56 Z" fill="url(#m-gold)"/>
    <rect x="-20" y="-30" width="40" height="11" fill="#2f5d8a"/><text x="0" y="-22" text-anchor="middle" font-family="PT Serif" font-weight="700" font-size="6.5" fill="#fff">ПЕТЕРБУРГ</text></g>`
  return s
}

// ---------------------------------------------------------------- 1560–1320: the Neva pier and the flea market (2.1)
function pier() {
  let s = `<rect x="0" y="1440" width="${W}" height="104" fill="#d8d1bf"/><rect x="0" y="1440" width="${W}" height="104" fill="url(#m-paving)" opacity=".45"/>`
  // granite embankment and the river
  s += `<rect x="0" y="1326" width="${W}" height="114" fill="url(#m-water)"/>`
  for (let i = 0; i < 26; i++) s += `<rect x="${r() * W}" y="${1332 + r() * 100}" width="${8 + r() * 26}" height="1.3" rx=".6" fill="#e8f0f0" opacity="${0.2 + r() * 0.4}"/>`
  s += `<rect x="0" y="1432" width="${W}" height="10" fill="#b9a99a"/><rect x="0" y="1440" width="${W}" height="3" fill="#8f8070"/>`
  s += `<rect x="0" y="1318" width="${W}" height="10" fill="#b9a99a"/><rect x="0" y="1326" width="${W}" height="3" fill="#8f8070"/>`
  // wooden pier into the water with bollards
  s += `<rect x="40" y="1360" width="56" height="74" fill="#a98563"/>`
  for (let y = 1362; y < 1432; y += 6) s += `<rect x="40" y="${y}" width="56" height="1" fill="#7f6248"/>`
  for (const [x, y] of [[44, 1364], [92, 1364], [44, 1400], [92, 1400]]) s += `<circle cx="${x}" cy="${y}" r="2.6" fill="#3a3f45"/>`
  // the millionaire's yacht and a little boat
  s += `<g class="m-bob"><g transform="translate(110 1380)">
    <path d="M0,0 h96 l-12,14 h-76 z" fill="#f8f7f2"/><path d="M2,4 h92" stroke="${P.blue}" stroke-width="1.6"/>
    <path d="M18,0 v-12 h50 l10,12 z" fill="#f1efe8"/><rect x="24" y="-9" width="40" height="5" fill="#5a7a90"/>
    <path d="M34,-12 v-8 h22 l6,8 z" fill="#f8f7f2"/><rect x="38" y="-18" width="14" height="4" fill="#5a7a90"/>
    <line x1="46" y1="-20" x2="46" y2="-34" stroke="#55585c" stroke-width="1"/><path d="M46,-34 h9 v6 h-9 z" fill="#fff"/><path d="M46,-30 h9 v2 h-9 z" fill="${P.blue}"/><path d="M46,-28 h9 v2 h-9 z" fill="${P.brick}"/>
    <path d="M-6,13 q22,5 44,0 q22,5 44,0 q10,3 20,0" fill="none" stroke="#e8f0f0" stroke-width="1" opacity=".7"/></g></g>`
  s += `<g class="m-boat"><g transform="translate(250 1352)"><path d="M0,0 h26 l-4,6 h-18 z" fill="${P.brick}"/><rect x="8" y="-6" width="10" height="6" fill="#f1efe8"/></g></g>`
  // flea market stalls with striped awnings
  const stall = (x: number, y: number, c: string) => `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="34" height="16" fill="#e8dcc4"/>
    <path d="M-3,0 h40 l-3,-9 h-34 z" fill="${c}"/>${[0, 8, 16, 24, 32].map((dx) => `<rect x="${dx - 2}" y="-9" width="4" height="9" fill="#f4f1ea" opacity=".85"/>`).join('')}
    ${[4, 12, 20, 27].map((dx, i) => `<rect x="${dx}" y="5" width="5" height="5" fill="${['#c8a24a', '#3e5a78', '#a8402f', '#56704f'][i]}"/>`).join('')}</g>`
  s += stall(250, 1478, P.brick) + stall(296, 1478, P.green) + stall(342, 1478, P.blue) + stall(296, 1516, '#c49a3a')
  s += person(268, 1508, '#3e5a78') + person(320, 1510, '#a8402f', 0.95, true) + person(366, 1506, '#56704f') + person(282, 1540, '#d9b15a', 0.9)
  s += car(200, 1530, '#b23a2e', 1.05) // a cherry-red classic car
  s += lamp(20, 1470, 0.9) + lamp(228, 1468, 0.9) + person(70, 1460, '#5d4a3a')
  return s
}

// ---------------------------------------------------------------- 1320–1080: courtyard-well and the post office (2.2)
function courtyard() {
  let s = `<rect x="0" y="1076" width="${W}" height="244" fill="#d6cdb8"/>`
  // the courtyard-well: buildings on three sides around a little yard
  s += `<rect x="180" y="1120" width="214" height="180" fill="#c9bea6"/>`
  const facade = (x: number, y: number, w: number, h: number, c: string) => {
    let f = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/><rect x="${x}" y="${y}" width="${w}" height="5" fill="rgba(255,255,255,.35)"/>`
    for (let wy = y + 10; wy < y + h - 12; wy += 18) for (let wx = x + 6; wx < x + w - 8; wx += 14) {
      const lit = r() < 0.4
      f += `<rect x="${wx}" y="${wy}" width="7" height="11" fill="${lit ? '#ffdf9a' : '#5b6b78'}"/><rect x="${wx - 1}" y="${wy + 11}" width="9" height="1.6" fill="#f4efe2"/>`
      if (lit && r() < 0.5) f += `<circle cx="${wx + 3.5}" cy="${wy + 5}" r="1.6" fill="#6a4a3a"/><rect x="${wx + 2}" y="${wy + 6.4}" width="3" height="4" fill="#6a4a3a"/>`
    }
    return f
  }
  s += facade(180, 1100, 82, 62, '#e3c98e') + facade(300, 1100, 94, 62, '#e3c98e') + facade(180, 1162, 40, 130, '#d9b878') + facade(354, 1162, 40, 130, '#e0c590')
  // the archway into the courtyard (the road goes through it)
  s += `<rect x="262" y="1100" width="38" height="62" fill="#dcc088"/><rect x="262" y="1100" width="38" height="5" fill="rgba(255,255,255,.35)"/>
    <rect x="270" y="1108" width="7" height="11" fill="#ffdf9a"/><rect x="284" y="1108" width="7" height="11" fill="#5b6b78"/>
    <path d="M265,1162 v-22 a16,16 0 0 1 32,0 v22 z" fill="#4a4540"/>`
  s += `<rect x="220" y="1162" width="134" height="130" fill="#bfb49c"/><rect x="220" y="1162" width="134" height="130" fill="url(#m-paving)" opacity=".5"/>`
  // laundry line, a tree, kids and the dog
  s += `<path d="M224,1180 Q287,1192 350,1180" fill="none" stroke="#6b6b6b" stroke-width=".7"/>`
  for (const [x, c] of [[240, '#f4f1ea'], [256, P.blue], [272, '#e8c25a'], [300, P.brick], [318, '#f4f1ea'], [334, P.green]] as [number, string][]) s += `<rect x="${x}" y="${1184 + Math.sin(x) * 1.5}" width="8" height="10" fill="${c}"/>`
  s += tree(330, 1286, 0.7, 1) + person(250, 1262, '#a8402f', 0.9) + person(262, 1264, '#3e5a78', 0.75) + person(238, 1270, '#e8c25a', 0.7)
  s += `<g transform="translate(300 1278)"><ellipse cx="0" cy="1" rx="6" ry="1.6" fill="rgba(0,0,0,.2)"/><path d="M-5,-2 h9 v-4 h-9 z" fill="#8a6446"/><circle cx="5" cy="-7" r="2.6" fill="#8a6446"/><path d="M-5,-4 l-3,-3" stroke="#8a6446" stroke-width="1.4"/><path d="M-4,-2 v2 M3,-2 v2" stroke="#8a6446" stroke-width="1.2"/></g>`
  // post office with the blue sign (and a dog waiting at the door)
  s += `<g>
    <rect x="12" y="1108" width="130" height="70" fill="#efe4cc"/><rect x="12" y="1104" width="130" height="6" fill="#bca97f"/>
    ${[22, 46, 108, 128].map((x) => `<rect x="${x}" y="1124" width="10" height="16" fill="#5e7d90"/><rect x="${x}" y="1148" width="10" height="16" fill="#5e7d90"/>`).join('')}
    <path d="M64,1178 v-28 a13,13 0 0 1 26,0 v28 z" fill="#3a3f45"/>
    <rect x="48" y="1112" width="58" height="12" fill="${P.blue}"/><text x="77" y="1121" text-anchor="middle" font-family="PT Sans" font-weight="700" font-size="8" fill="#fff">ПОЧТА</text>
    <g transform="translate(100 1184)"><path d="M-5,-2 h9 v-4 h-9 z" fill="#3a3330"/><circle cx="-6" cy="-7" r="2.6" fill="#3a3330"/><path d="M4,-4 l3,-4" stroke="#3a3330" stroke-width="1.4"/></g></g>`
  s += person(40, 1200, '#3e5a78', 1, true) + lamp(150, 1240, 0.9) + tree(30, 1300, 0.8)
  return s
}

// ---------------------------------------------------------------- 1080–830: the football stadium (2.3)
function stadium() {
  let s = `<rect x="0" y="830" width="${W}" height="250" fill="#b9c79a"/>`
  s += patches(840, 1070, 10, '#4f6a3f', 0.07)
  // a canal around the stadium island
  s += `<path d="M0,1040 Q120,1060 250,1030 Q300,1018 400,1040 L400,1062 Q300,1040 250,1052 Q120,1082 0,1062 Z" fill="url(#m-water)"/>`
  // the stadium bowl with four masts
  s += `<g>
    <ellipse cx="130" cy="950" rx="118" ry="62" fill="#9aa3a8"/>
    <ellipse cx="130" cy="944" rx="112" ry="56" fill="#cfd6d9"/>
    <ellipse cx="130" cy="948" rx="92" ry="42" fill="#7f8a90"/>
    ${Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return `<line x1="${130 + Math.cos(a) * 92}" y1="${948 + Math.sin(a) * 42}" x2="${130 + Math.cos(a) * 110}" y2="${944 + Math.sin(a) * 55}" stroke="#aab3b8" stroke-width="1"/>` }).join('')}
    <ellipse cx="130" cy="950" rx="70" ry="30" fill="#5e9a5a"/>
    <rect x="80" y="934" width="100" height="32" fill="none" stroke="#e9f2e2" stroke-width="1"/><line x1="130" y1="934" x2="130" y2="966" stroke="#e9f2e2" stroke-width="1"/><circle cx="130" cy="950" r="7" fill="none" stroke="#e9f2e2" stroke-width="1"/>
    ${[[30, 900], [230, 900], [40, 1000], [220, 1000]].map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 52}" stroke="#e8ecee" stroke-width="3"/><circle cx="${x}" cy="${y - 54}" r="2.4" fill="#fff6c8" class="m-glow"/>`).join('')}
    ${Array.from({ length: 30 }, () => { const a = r() * Math.PI * 2; return `<circle cx="${130 + Math.cos(a) * (96 + r() * 10)}" cy="${948 + Math.sin(a) * (45 + r() * 6)}" r="1.1" fill="${['#2f5d8a', '#a8402f', '#f4f1ea'][Math.floor(r() * 3)]}"/>` }).join('')}
  </g>`
  // kids' pitch beside the road
  s += `<rect x="290" y="880" width="96" height="58" fill="#6ea063"/><rect x="294" y="884" width="88" height="50" fill="none" stroke="#eef5e6" stroke-width="1.2"/><line x1="338" y1="884" x2="338" y2="934" stroke="#eef5e6" stroke-width="1"/>`
  s += `<rect x="291" y="902" width="4" height="14" fill="none" stroke="#fff" stroke-width="1"/><rect x="381" y="902" width="4" height="14" fill="none" stroke="#fff" stroke-width="1"/>`
  s += person(318, 912, P.brick, 0.8) + person(352, 922, P.blue, 0.8) + person(330, 930, P.brick, 0.8) + `<circle cx="340" cy="916" r="1.8" fill="#fff" class="m-ball"/>`
  s += tree(270, 1010, 0.75) + tree(380, 1020, 0.7, 1) + birch(260, 870, 0.6)
  return s
}

// ---------------------------------------------------------------- 830–560: Griboyedov canal and the Saviour on Spilled Blood (2.4)
function canal() {
  let s = `<rect x="0" y="556" width="${W}" height="276" fill="#d8cfbb"/><rect x="0" y="556" width="${W}" height="276" fill="url(#m-paving)" opacity=".4"/>`
  // canal running across with railings
  s += `<rect x="0" y="770" width="${W}" height="34" fill="url(#m-water)"/>`
  s += `<path d="M0,770 h400 M0,804 h400" stroke="#3a3f45" stroke-width="1.6"/>`
  for (let x = 4; x < W; x += 8) s += `<path d="M${x},766 v4 M${x},800 v4" stroke="#3a3f45" stroke-width=".8"/>`
  for (let i = 0; i < 10; i++) s += `<rect x="${r() * W}" y="${776 + r() * 22}" width="${10 + r() * 20}" height="1.1" fill="#e8f0f0" opacity=".45"/>`
  // the church: tall tent and patterned onion domes
  s += `<g>
    <rect x="236" y="660" width="150" height="80" fill="#c9604a"/><rect x="236" y="660" width="150" height="80" fill="url(#m-brickWall)" opacity=".35"/>
    ${[246, 270, 294, 342, 366].map((x) => `<path d="M${x},740 v-22 a6,6 0 0 1 12,0 v22 z" fill="#f3e8d2"/><path d="M${x + 2},740 v-18 a4,4 0 0 1 8,0 v18 z" fill="#4a3a30"/>`).join('')}
    ${drum(250, 610, 22, 52, '#c9604a')}${drum(350, 610, 22, 52, '#c9604a')}${drum(296, 596, 30, 66, '#c9604a')}
    <path d="M292,598 L311,520 L330,598 Z" fill="url(#m-pTent)"/><path d="M311,520 L330,598 L320,598 Z" fill="rgba(0,0,0,.2)"/>
    ${onion(311, 522, 12, 14, 'url(#m-gold)')}
    ${onion(261, 612, 26, 30, 'url(#m-pGY)')}${onion(361, 612, 26, 30, 'url(#m-pBW)')}
    ${drum(274, 632, 14, 30, '#d47258')}${drum(334, 632, 14, 30, '#d47258')}
    ${onion(281, 634, 18, 22, 'url(#m-pRW)')}${onion(341, 634, 18, 22, 'url(#m-pD)')}
  </g>`
  // painters with easels, a guitarist with an open case, a cyclist, a photographer
  const easel = (x: number, y: number, c: string) => `<g transform="translate(${x} ${y})"><path d="M-6,0 L0,-20 L6,0 M0,-20 V0" stroke="#6a5040" stroke-width="1.2" fill="none"/>
    <rect x="-7" y="-19" width="14" height="11" fill="#f8f4ea" stroke="#6a5040" stroke-width=".8"/><path d="M-5,-11 q3,-5 6,-2 q2,-3 4,0" stroke="${c}" stroke-width="1.6" fill="none"/></g>`
  s += easel(60, 760, P.blue) + person(72, 762, '#5d4a3a', 0.95, true) + easel(150, 758, P.brick) + person(162, 760, P.green, 0.95)
  s += `<g transform="translate(212 752)">${person(0, 0, '#2f3438', 1)}<path d="M-6,-9 l9,4" stroke="#b07a46" stroke-width="2.4"/><rect x="-14" y="-2" width="10" height="4" fill="#5a3e2c"/></g>`
  s += `<g class="m-cycle"><g transform="translate(40 700)"><circle cx="-6" cy="0" r="4" fill="none" stroke="#2f3438" stroke-width="1"/><circle cx="6" cy="0" r="4" fill="none" stroke="#2f3438" stroke-width="1"/><path d="M-6,0 L-1,-6 L6,0 M-1,-6 h6" stroke="${P.brick}" stroke-width="1.2" fill="none"/>${person(0, -4, '#e8c25a', 0.8)}</g></g>`
  s += person(196, 640, '#3e5a78', 1) + `<rect x="199" y="626" width="5" height="3.6" fill="#2f3438"/>`
  s += lamp(20, 730, 0.9) + lamp(230, 728, 0.9) + tree(130, 690, 0.7, 1)
  return s
}

// ---------------------------------------------------------------- 560–250: Palace Square and the Winter Palace (goal)
function palaceSquare() {
  let s = `<rect x="0" y="420" width="${W}" height="140" fill="url(#m-cobble)"/>`
  // Alexander Column with the angel
  s += `<g><ellipse cx="290" cy="538" rx="22" ry="5" fill="rgba(0,0,0,.2)"/><rect x="276" y="516" width="28" height="22" fill="#8c7f72"/><rect x="278" y="512" width="24" height="5" fill="#a39686"/>
    <rect x="285" y="390" width="10" height="124" fill="#b36e5a"/><rect x="291" y="390" width="4" height="124" fill="rgba(0,0,0,.15)"/>
    <rect x="282" y="384" width="16" height="7" fill="#8c7f72"/><path d="M290,384 v-10" stroke="url(#m-gold)" stroke-width="3"/>
    <path d="M285,376 q5,-12 10,0 z M290,372 l-8,-6 M290,372 l8,-6" stroke="#c9a24a" stroke-width="1.6" fill="#d4a945"/><line x1="290" y1="366" x2="290" y2="356" stroke="#c9a24a" stroke-width="1.4"/><line x1="286" y1="359" x2="294" y2="359" stroke="#c9a24a" stroke-width="1.2"/></g>`
  s += lamp(60, 500, 1) + lamp(370, 520, 1) + person(110, 520, '#3e5a78') + person(124, 524, '#a8402f', 0.95) + person(240, 536, P.green, 0.9) + person(340, 540, '#d9b15a', 0.9, true)
  // horse carriage
  s += `<g transform="translate(70 548)"><ellipse cx="6" cy="1" rx="18" ry="2.4" fill="rgba(0,0,0,.2)"/><path d="M-12,-4 h14 v-8 h-14 z" fill="#2f3438"/><circle cx="-9" cy="-2" r="3" fill="none" stroke="#2f3438"/><circle cx="0" cy="-2" r="3" fill="none" stroke="#2f3438"/>
    <path d="M4,-8 h12 q4,0 4,-4 l2,-3 l-2,-1 l-3,3 h-10 z" fill="#f4f1ea"/><path d="M7,-8 v8 M15,-8 v8" stroke="#f4f1ea" stroke-width="1.6"/></g>`
  return s
}

function winterPalace() {
  // long mint-green facade with white columns, gold statues and the central arch the road passes through
  let s = `<rect x="0" y="330" width="${W}" height="96" fill="${P.mint}"/><rect x="0" y="330" width="${W}" height="8" fill="#e9efe9"/><rect x="0" y="418" width="${W}" height="8" fill="#7d9e8c"/>`
  for (let x = 6; x < W; x += 13) {
    s += `<rect x="${x}" y="340" width="3" height="78" fill="#f6f4ec"/>`
    if (x % 26 < 13) s += `<rect x="${x + 5}" y="350" width="5" height="12" fill="#4e6670"/><path d="M${x + 4},349 q3.5,-4 7,0" fill="#f6f4ec"/><rect x="${x + 5}" y="384" width="5" height="14" fill="#4e6670"/>`
  }
  for (let x = 12; x < W; x += 26) s += `<path d="M${x - 2},330 v-7 a2,2 0 0 1 4,0 v7 z" fill="url(#m-gold)"/><circle cx="${x}" cy="320" r="2" fill="url(#m-gold)"/>`
  s += `<path d="M180,330 h40 v-14 h-40 z" fill="${P.mint}"/><path d="M176,318 L200,302 L224,318 Z" fill="#e9efe9"/>`
  s += `<path d="M186,426 v-46 a14,14 0 0 1 28,0 v46 z" fill="#3a3f45"/><path d="M190,426 v-44 a10,10 0 0 1 20,0 v44 z" fill="#4c5258"/>`
  return s
}

// ---------------------------------------------------------------- 330–0: the Neva, the fortress and the way north
function neva() {
  let s = `<rect x="0" y="0" width="${W}" height="120" fill="${EDGE.forest}"/>`
  s += patches(0, 120, 6, '#4f6a3f', 0.08)
  s += `<rect x="0" y="120" width="${W}" height="70" fill="#c9cfa8"/>`
  s += `<rect x="0" y="190" width="${W}" height="130" fill="url(#m-water)"/>`
  for (let i = 0; i < 24; i++) s += `<rect x="${r() * W}" y="${196 + r() * 118}" width="${8 + r() * 26}" height="1.3" fill="#e8f0f0" opacity="${0.2 + r() * 0.45}"/>`
  s += `<rect x="0" y="312" width="${W}" height="10" fill="#b9a99a"/><rect x="0" y="186" width="${W}" height="8" fill="#b9a99a"/>`
  return s
}

function nevaObjects() {
  let s = ''
  // Peter and Paul Fortress: low bastion walls and the golden needle spire
  s += `<g>
    <path d="M10,190 L30,150 L120,150 L140,190 Z" fill="#c9b9a0"/><path d="M10,190 L30,150 L36,150 L18,190 Z" fill="rgba(0,0,0,.12)"/>
    <rect x="56" y="112" width="40" height="40" fill="#efe1c0"/><rect x="84" y="112" width="12" height="40" fill="rgba(0,0,0,.1)"/>
    <rect x="66" y="80" width="20" height="32" fill="#efe1c0"/><rect x="70" y="60" width="12" height="20" fill="#efe1c0"/>
    <path d="M72,60 L76,40 L80,60 Z" fill="url(#m-gold)"/><path d="M75.4,40 L76,-6 L76.6,40 Z" fill="url(#m-gold)" stroke="#c9a24a" stroke-width=".8"/>
    <path d="M73,-2 l3,-4 l3,4" stroke="#c9a24a" stroke-width="1" fill="none"/></g>`
  // the raised Palace Bridge (white nights)
  s += `<g><rect x="250" y="250" width="18" height="18" fill="#7f8a90"/><rect x="360" y="250" width="18" height="18" fill="#7f8a90"/>
    <path d="M268,262 L300,212 L306,216 L276,266 Z" fill="#5e6a70"/><path d="M360,262 L328,212 L322,216 L352,266 Z" fill="#5e6a70"/>
    ${[278, 286, 294].map((x, i) => `<line x1="${x}" y1="${252 - i * 12}" x2="${x + 6}" y2="${256 - i * 12}" stroke="#3a3f45" stroke-width="1"/>`).join('')}</g>`
  // the bridge the road takes: stone deck with railings
  s += `<path d="M184,322 L190,188 M216,322 L210,188" stroke="#cfc6b4" stroke-width="5"/><path d="M184,322 L190,188 M216,322 L210,188" stroke="#3a3f45" stroke-width=".8" stroke-dasharray="2 3"/>`
  s += `<g class="m-boat"><g transform="translate(20 280)"><path d="M0,0 h40 l-4,6 h-32 z" fill="#f4f1ea"/><rect x="8" y="-7" width="22" height="7" fill="#e3ded2"/><rect x="10" y="-5" width="18" height="3" fill="#5a7a90"/></g></g>`
  // the way north: birches and a road sign to the village
  for (const [x, y, sc] of [[40, 110, 0.75], [80, 90, 0.7], [20, 60, 0.8], [300, 100, 0.7], [340, 70, 0.8], [380, 110, 0.65], [260, 50, 0.6], [130, 40, 0.6]]) s += birch(x, y, sc)
  s += pine(110, 120, 0.6) + pine(370, 40, 0.7)
  s += roadSign(250, 140, ['Берёзовка', '3 км'], '#2f6b4f')
  s += `<g class="m-drift">${cloud(330, 170, 0.5, false)}</g>`
  return s
}

const nodes: [number, number][] = [[118, 1500], [282, 1240], [262, 972], [110, 724]]
const goal: [number, number] = [140, 486]
const roadA = smooth([[200, H + 10], [180, 1690], [150, 1580], nodes[0], [218, 1440], [224, 1330], [250, 1296], nodes[1], [281, 1160], [281, 1110], [272, 1040], nodes[2], [210, 880], [150, 800], nodes[3], [100, 620], goal, [200, 440]])
const roadB = smooth([[200, 420], [200, 330], [200, 190], [205, 110], [196, 50], [200, -10]])

function svg() {
  seed(22)
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${defs}
    ${neva()}${road(roadB)}${nevaObjects()}${winterPalace()}
    ${palaceSquare()}${canal()}${stadium()}${courtyard()}${pier()}${arrival()}
    ${road(roadA)}
    <path d="M206,1442 L210,1326 M234,1442 L238,1326" stroke="#cfc6b4" stroke-width="5"/>
    <path d="M206,1442 L210,1326 M234,1442 L238,1326" stroke="#3a3f45" stroke-width=".8" stroke-dasharray="2 3"/>
    <path d="M122,806 h40 M126,768 h40" stroke="#3a3f45" stroke-width="2"/>
    <path d="M258,1066 L262,1026 M286,1066 L288,1026" stroke="#cfc6b4" stroke-width="4"/>
  </svg>`
}

export const ch2: Mural = {
  height: H, nodes, goal, svg,
  goalLabel: { ru: 'Дворцо́вая пло́щадь', es: 'Meta del capítulo' },
  sign: [300, 1740],
}
