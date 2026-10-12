// Chapter 3 · «Mi casa». The country road from St Petersburg comes out of the birch forest into a
// village: a dacha with its garden, garage, pool and turtle (3.1); a lake with a tree-house hotel,
// bungalow and hammock (3.2); a creative office in an old brick factory, with a slide (3.3); a block of
// flats with the neighbours on their balconies and coloured cars in the yard (3.4); and the wooden
// church of Kizhi on its island. The road crosses the boardwalk and goes on north.
import { EDGE, P, W, birch, car, cloud, defs, hay, lamp, patches, person, pine, road, roadSign, seed, smooth, tree, r, type Mural } from './kit'

const H = 1800

// ---------------------------------------------------------------- 1800–1600: forest road and fields
function forest() {
  let s = `<rect x="0" y="1560" width="${W}" height="${H - 1560}" fill="${EDGE.forest}"/>`
  s += patches(1570, 1800, 10, '#4f6a3f', 0.08)
  s += `<rect x="250" y="1600" width="140" height="80" fill="url(#m-field)" opacity=".8" transform="rotate(-4 320 1640)"/>`
  for (const [x, y, sc] of [[24, 1790, 0.85], [60, 1770, 0.75], [100, 1795, 0.7], [30, 1700, 0.8], [76, 1690, 0.7], [20, 1620, 0.7], [300, 1790, 0.8], [350, 1780, 0.75], [390, 1740, 0.7]]) s += r() < 0.5 ? birch(x, y, sc) : pine(x, y, sc)
  s += hay(290, 1650, 0.9) + hay(330, 1640, 0.8) + hay(360, 1662, 0.85)
  // mushrooms and a fox at the forest edge
  for (const [x, y] of [[120, 1740], [128, 1744], [60, 1660]]) s += `<path d="M${x - 3},${y} v-3 h6 v3 z" fill="#f4efe2"/><path d="M${x - 5},${y - 3} q5,-6 10,0 z" fill="${P.brick}"/><circle cx="${x - 1}" cy="${y - 5}" r=".7" fill="#fff"/>`
  s += `<g transform="translate(140 1640)"><path d="M-8,0 q8,-8 14,-2 l5,-4 l1,4 l3,1 l-4,2 q-6,6 -12,4 q-6,2 -10,-2 z" fill="#c8662e"/><path d="M-8,0 q-7,-1 -9,-5 q5,1 8,2" fill="#c8662e"/><path d="M-16,-5 l-2,-1" stroke="#fff" stroke-width="1.6"/></g>`
  s += roadSign(255, 1740, ['Берёзовка'], '#2f5d8a')
  return s
}

// ---------------------------------------------------------------- 1600–1330: the dacha (3.1)
function dacha() {
  let s = `<rect x="0" y="1330" width="${W}" height="232" fill="#c6d0a2"/>`
  // picket fence around the plot
  s += `<rect x="180" y="1366" width="214" height="180" fill="#b9c78f"/>`
  for (let x = 182; x < 394; x += 6) s += `<rect x="${x}" y="1540" width="3.4" height="9" fill="#efe8d8"/><rect x="${x}" y="1360" width="3.4" height="9" fill="#efe8d8"/>`
  for (let y = 1366; y < 1546; y += 6) s += `<rect x="178" y="${y}" width="3.4" height="5" fill="#efe8d8"/><rect x="391" y="${y}" width="3.4" height="5" fill="#efe8d8"/>`
  // vegetable beds and sunflowers
  for (let i = 0; i < 4; i++) s += `<rect x="300" y="${1470 + i * 16}" width="82" height="9" fill="#7a5e46"/>${Array.from({ length: 8 }, (_, k) => `<circle cx="${304 + k * 10}" cy="${1474 + i * 16}" r="2.6" fill="#5d8a4a"/>`).join('')}`
  for (const x of [200, 212, 224]) s += `<line x1="${x}" y1="1528" x2="${x}" y2="1500" stroke="#5d7a3a" stroke-width="1.6"/><circle cx="${x}" cy="1498" r="5" fill="#e8b830"/><circle cx="${x}" cy="1498" r="2.2" fill="#6a4a2a"/>`
  // the wooden izba with carved blue window frames
  s += `<g>
    <rect x="232" y="1404" width="98" height="58" fill="${P.wood}"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="232" y="${1406 + i * 7}" width="98" height="1.4" fill="${P.woodD}" opacity=".6"/>`).join('')}
    <path d="M226,1406 L281,1368 L336,1406 Z" fill="#6d5a4a"/><path d="M281,1368 L336,1406 L281,1406 Z" fill="rgba(0,0,0,.18)"/>
    <path d="M264,1404 L281,1384 L298,1404 Z" fill="${P.wood}"/><circle cx="281" cy="1396" r="4" fill="#5e7d90"/><path d="M262,1404 L281,1382 L300,1404" fill="none" stroke="#f4efe2" stroke-width="2"/>
    ${[244, 300].map((x) => `<rect x="${x - 3}" y="1416" width="24" height="30" fill="#f4efe2"/><path d="M${x - 5},1416 L${x + 9},1406 L${x + 23},1416 Z" fill="#3e6ea0"/><rect x="${x}" y="1420" width="18" height="22" fill="#5e7d90"/><path d="M${x + 9},1420 v22 M${x},1431 h18" stroke="#f4efe2" stroke-width="1.4"/><rect x="${x - 3}" y="1446" width="24" height="4" fill="#3e6ea0"/>`).join('')}
    <rect x="272" y="1426" width="18" height="36" fill="${P.woodD}"/><rect x="266" y="1462" width="30" height="4" fill="#8f8170"/>
    <rect x="312" y="1372" width="8" height="18" fill="#8f7e6c"/><circle cx="316" cy="1362" r="4" fill="#e6e2da" opacity=".6" class="m-drift"/></g>`
  s += `<g transform="translate(276 1460)"><path d="M-3,0 q3,-5 6,0 z" fill="#f3a35a"/><circle cx="0" cy="-5" r="2.4" fill="#f3a35a"/><path d="M-1.8,-7 l-.6,-1.6 M1.8,-7 l.6,-1.6" stroke="#f3a35a" stroke-width="1"/></g>`
  // garage and the little pool with a turtle
  s += `<rect x="190" y="1384" width="34" height="30" fill="#bdb3a2"/><path d="M188,1384 h38 l-4,-6 h-30 z" fill="#7d8b80"/><rect x="196" y="1394" width="22" height="20" fill="#8f8a80"/>${Array.from({ length: 5 }, (_, i) => `<rect x="196" y="${1396 + i * 4}" width="22" height="1" fill="#6f6a60"/>`).join('')}`
  s += `<rect x="198" y="1474" width="58" height="32" rx="6" fill="#f4efe2"/><rect x="202" y="1478" width="50" height="24" rx="4" fill="#7fb9c9"/><path d="M208,1486 q8,-3 16,0 M222,1494 q8,-3 16,0" stroke="#e9f6f8" stroke-width="1" fill="none" class="m-twinkle"/>`
  s += `<g transform="translate(266 1514)"><ellipse cx="0" cy="0" rx="6" ry="4" fill="#5e7a3e"/><path d="M-4,-1 q4,-4 8,0" fill="none" stroke="#3f5a2a" stroke-width=".8"/><circle cx="7" cy="0" r="2" fill="#7a8f4e"/><path d="M-4,3 l-1,2 M4,3 l1,2" stroke="#7a8f4e" stroke-width="1.3"/></g>`
  // the well with a sweep (журавль)
  s += `<g transform="translate(70 1430)"><rect x="-8" y="-10" width="16" height="10" fill="${P.wood}"/><rect x="-1" y="-44" width="2.4" height="34" fill="${P.woodD}"/><path d="M-24,-30 L28,-50" stroke="${P.woodD}" stroke-width="2"/><path d="M-22,-30 v18" stroke="#55585c" stroke-width=".8"/><rect x="-25" y="-14" width="6" height="5" fill="#7d8b80"/></g>`
  s += tree(40, 1560, 0.85) + birch(150, 1380, 0.7) + tree(370, 1352, 0.6, 1) + person(330, 1500, '#a8402f', 0.9)
  return s
}

// ---------------------------------------------------------------- 1330–1060: lake, tree-house hotel and bungalow (3.2)
function lake() {
  let s = `<rect x="0" y="1060" width="${W}" height="272" fill="#bccb98"/>`
  s += patches(1070, 1320, 8, '#4f6a3f', 0.08)
  s += `<path d="M186,1300 Q170,1210 220,1140 Q290,1080 380,1100 Q410,1110 400,1180 L400,1300 Q300,1320 186,1300 Z" fill="url(#m-lake)"/>`
  s += `<path d="M186,1300 Q170,1210 220,1140 Q290,1080 380,1100" fill="none" stroke="#d9d2b8" stroke-width="4"/>`
  for (let i = 0; i < 16; i++) s += `<rect x="${220 + r() * 170}" y="${1140 + r() * 150}" width="${8 + r() * 20}" height="1.2" fill="#e8f0f0" opacity="${0.25 + r() * 0.4}"/>`
  // bungalow on stilts with a veranda
  s += `<g><path d="M262,1236 v24 M300,1236 v24 M281,1236 v24" stroke="${P.woodD}" stroke-width="2"/><rect x="254" y="1232" width="54" height="6" fill="${P.woodL}"/>
    <rect x="262" y="1206" width="38" height="26" fill="#d9c49c"/><path d="M256,1208 L281,1188 L306,1208 Z" fill="#a5823e"/>
    <rect x="270" y="1214" width="8" height="10" fill="#5e7d90"/><rect x="286" y="1214" width="8" height="18" fill="${P.woodD}"/>
    <path d="M232,1235 h22" stroke="${P.woodL}" stroke-width="5"/></g>`
  s += `<g class="m-boat"><g transform="translate(210 1170)"><path d="M0,0 h22 l-4,5 h-14 z" fill="${P.wood}"/><path d="M10,0 v-10" stroke="#55585c"/><path d="M10,-10 l8,8 h-8 z" fill="#f4efe2"/></g></g>`
  // the tree-house hotel: a big tree carrying a cabin, with a rope ladder
  s += `<g>
    <ellipse cx="80" cy="1300" rx="40" ry="8" fill="rgba(30,30,10,.2)"/>
    <path d="M70,1300 C72,1260 66,1220 74,1180 L88,1180 C94,1220 88,1260 92,1300 Z" fill="#6a5040"/>
    <path d="M74,1200 L40,1176 M88,1196 L124,1170" stroke="#6a5040" stroke-width="5"/>
    ${[[40, 1150, 26], [120, 1146, 24], [80, 1120, 32], [52, 1112, 20], [110, 1108, 20]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="#3f5c3a"/><circle cx="${x + 3}" cy="${y - 3}" r="${rr * 0.75}" fill="#5b7d4e"/><circle cx="${x + 7}" cy="${y - 8}" r="${rr * 0.35}" fill="#86a56a"/>`).join('')}
    <rect x="48" y="1180" width="68" height="6" fill="${P.woodL}"/>
    <rect x="56" y="1150" width="50" height="30" fill="#c99a68"/>${Array.from({ length: 4 }, (_, i) => `<rect x="56" y="${1153 + i * 7}" width="50" height="1.2" fill="${P.woodD}" opacity=".6"/>`).join('')}
    <path d="M50,1152 L81,1130 L112,1152 Z" fill="#7d5a3e"/><rect x="64" y="1158" width="10" height="9" fill="#ffdf9a" class="m-glow"/><rect x="86" y="1158" width="12" height="22" fill="${P.woodD}"/>
    <path d="M110,1186 L114,1290 M118,1186 L122,1290" stroke="#b08560" stroke-width="1"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${110.4 + i * 0.33},${1194 + i * 8} h8" stroke="#b08560" stroke-width="1"/>`).join('')}
    <path d="M48,1180 v6 M116,1180 v6" stroke="${P.woodD}" stroke-width="2"/></g>`
  // hammock between two pines
  s += pine(150, 1262, 0.7) + pine(196, 1088, 0.6) + `<path d="M146,1240 Q170,1258 194,1236" fill="none" stroke="#e8c25a" stroke-width="3"/>` + pine(196, 1252, 0.7) + birch(20, 1240, 0.7)
  return s
}

// ---------------------------------------------------------------- 1060–800: creative office in an old brick factory (3.3)
function office() {
  let s = `<rect x="0" y="800" width="${W}" height="262" fill="#d4cdb9"/><rect x="0" y="800" width="${W}" height="262" fill="url(#m-paving)" opacity=".45"/>`
  s += `<g>
    <rect x="180" y="850" width="210" height="110" fill="url(#m-brickWall)"/><rect x="180" y="846" width="210" height="6" fill="#7f3a2a"/>
    ${[194, 236, 278, 320, 362].map((x) => `<path d="M${x},${930} v-46 a14,14 0 0 1 28,0 v46 z" fill="#7fa9bd"/><path d="M${x + 14},884 v46 M${x},906 h28" stroke="#3a3f45" stroke-width="1.2"/><rect x="${x + 3}" y="${910}" width="6" height="8" fill="#ffdf9a" opacity=".7"/>`).join('')}
    <rect x="232" y="930" width="40" height="30" fill="#3a3f45"/><rect x="236" y="934" width="32" height="26" fill="url(#m-glass)"/>
    <rect x="356" y="770" width="16" height="80" fill="url(#m-brickWall)"/><rect x="354" y="766" width="20" height="5" fill="#7f3a2a"/>
    <circle cx="364" cy="752" r="6" fill="#e6e2da" opacity=".55" class="m-drift"/>
    <rect x="186" y="836" width="140" height="10" fill="#6ea063"/>${Array.from({ length: 10 }, (_, i) => `<circle cx="${192 + i * 14}" cy="836" r="5" fill="#5b8a4e"/>`).join('')}
    <path d="M300,836 Q320,826 340,836" fill="none" stroke="#e8c25a" stroke-width="2.4"/>
    <rect x="200" y="862" width="120" height="12" fill="#2f3438"/><text x="260" y="871" text-anchor="middle" font-family="PT Sans" font-weight="700" font-size="8" fill="#ffd27a">ОФИС МЕЧТЫ</text>
    <path d="M390,880 C420,900 360,930 392,960 C410,975 380,990 350,996" fill="none" stroke="#e66a3a" stroke-width="6" stroke-linecap="round"/>
    <path d="M390,880 C420,900 360,930 392,960 C410,975 380,990 350,996" fill="none" stroke="#f59a6a" stroke-width="2" stroke-linecap="round"/></g>`
  s += person(340, 998, P.blue, 0.9) + person(212, 990, '#a8402f', 0.9) + person(224, 992, '#2f3438', 0.9, true)
  // bikes, a food truck and a bench with colleagues having breakfast
  for (const x of [40, 54, 68]) s += `<g transform="translate(${x} 1000)"><circle cx="-4" cy="0" r="3.4" fill="none" stroke="#2f3438" stroke-width=".9"/><circle cx="5" cy="0" r="3.4" fill="none" stroke="#2f3438" stroke-width=".9"/><path d="M-4,0 L0,-5 L5,0 M0,-5 h4" stroke="${[P.brick, P.green, P.blue][x % 3]}" stroke-width="1.2" fill="none"/></g>`
  s += `<g transform="translate(40 900)"><rect x="0" y="0" width="54" height="26" rx="3" fill="#e8c25a"/><rect x="6" y="5" width="24" height="10" fill="#5e7d90"/><rect x="34" y="4" width="16" height="16" fill="#f4efe2"/><circle cx="12" cy="28" r="4" fill="#2b2b30"/><circle cx="44" cy="28" r="4" fill="#2b2b30"/><text x="27" y="23" text-anchor="middle" font-family="PT Sans" font-weight="700" font-size="5.5" fill="#7f3a2a">КОФЕ</text></g>`
  s += tree(140, 1050, 0.7, 2) + lamp(160, 960, 0.9) + birch(20, 1052, 0.6)
  return s
}

// ---------------------------------------------------------------- 800–560: the block of flats and its yard (3.4)
function flats() {
  let s = `<rect x="0" y="556" width="${W}" height="246" fill="#cfcab6"/>`
  s += `<g>
    <rect x="196" y="580" width="196" height="150" fill="#e6e1d4"/><rect x="196" y="576" width="196" height="6" fill="#a9a497"/>
    ${Array.from({ length: 5 }, (_, i) => `<rect x="196" y="${600 + i * 28}" width="196" height="1" fill="#c9c3b4"/>`).join('')}`
  for (let fl = 0; fl < 5; fl++) for (let k = 0; k < 6; k++) {
    const x = 204 + k * 31, y = 586 + fl * 28
    const lit = r() < 0.45
    s += `<rect x="${x}" y="${y}" width="14" height="14" fill="${lit ? '#ffdf9a' : '#6f8796'}"/>`
    if (k % 2 === 1) s += `<rect x="${x - 3}" y="${y + 14}" width="22" height="7" fill="${['#c9604a', '#7f9a86', '#e8c25a', '#5e7d90'][(fl + k) % 4]}"/><path d="M${x - 3},${y + 14} h22" stroke="#efe8d8" stroke-width="1"/>`
  }
  s += `<rect x="282" y="702" width="20" height="28" fill="#5a4a3a"/><rect x="278" y="698" width="28" height="4" fill="#8f8a80"/></g>`
  // neighbours: a guitarist on a balcony (the musicians upstairs), an actress with flowers, Masha waving
  s += `<g transform="translate(240 620)">${person(0, 0, '#2f3438', 0.8)}<path d="M-4,-7 l7,3" stroke="#b07a46" stroke-width="2"/></g><g class="m-note"><text x="252" y="604" font-size="8" fill="#3a3f45">♪</text></g>`
  s += `<g transform="translate(364 676)">${person(0, 0, '#c8323a', 0.8)}<circle cx="3" cy="-11" r="1.6" fill="#e66a8a"/><circle cx="4.5" cy="-12.4" r="1.3" fill="#f4c34a"/></g>`
  s += person(302, 648, '#e8c25a', 0.8)
  // the yard: playground, coloured cars and Borís Ivánovich under his old car
  s += `<rect x="20" y="600" width="140" height="110" fill="#b9c79a"/>`
  s += `<g transform="translate(60 650)"><path d="M-14,10 L-6,-12 L2,10 M-6,-12 h28 M22,-12 L30,10" stroke="#c8323a" stroke-width="2" fill="none"/><path d="M4,-12 v14 M14,-12 v14" stroke="#55585c" stroke-width=".8"/><rect x="2" y="2" width="6" height="2" fill="#3e5a78"/><rect x="12" y="2" width="6" height="2" fill="#3e5a78"/></g>`
  s += `<g transform="translate(120 690)"><rect x="-16" y="-8" width="32" height="10" fill="#e8d9a8"/><rect x="-16" y="-10" width="32" height="2" fill="${P.wood}"/></g>`
  s += car(60, 780, '#c8323a') + car(104, 780, '#e8b830') + car(148, 780, '#4f8f6c') + car(240, 776, '#3e6ea0', 1, true)
  s += `<g transform="translate(330 772)">${car(0, 0, '#9aa49a', 1.1)}<g transform="translate(-20 -1) rotate(90)">${person(0, 0, '#3e5a78', 0.8)}</g><path d="M12,-18 l4,-6" stroke="#55585c" stroke-width="1.2"/></g>`
  s += tree(180, 556, 0.7) + tree(20, 800, 0.7, 1) + lamp(176, 760, 0.9) + person(40, 702, '#e8c25a', 0.75) + person(84, 704, '#3e5a78', 0.75)
  return s
}

// ---------------------------------------------------------------- 560–250: Kizhi on its island (goal)
function kizhi() {
  let s = `<rect x="0" y="250" width="${W}" height="310" fill="url(#m-lake)"/>`
  for (let i = 0; i < 30; i++) s += `<rect x="${r() * W}" y="${256 + r() * 300}" width="${10 + r() * 26}" height="1.2" fill="#e8f0f0" opacity="${0.2 + r() * 0.45}"/>`
  s += `<path d="M30,520 Q20,420 120,360 Q220,310 330,350 Q400,380 380,470 Q360,530 260,536 Q120,548 30,520 Z" fill="#a9b98c"/>`
  s += `<path d="M30,520 Q20,420 120,360 Q220,310 330,350 Q400,380 380,470 Q360,530 260,536 Q120,548 30,520 Z" fill="none" stroke="#d9d2b8" stroke-width="3"/>`
  s += patches(370, 530, 8, '#4f6a3f', 0.08)
  // the Transfiguration Church: tiers of silver aspen-shingle domes
  const dome = (x: number, y: number, w: number) => {
    const h = w * 1.15
    return `<path d="M${x - w * 0.27},${y} C${x - w * 0.66},${y - h * 0.14} ${x - w * 0.62},${y - h * 0.58} ${x},${y - h} C${x + w * 0.62},${y - h * 0.58} ${x + w * 0.66},${y - h * 0.14} ${x + w * 0.27},${y} Z" fill="url(#m-aspen)"/>
      <path d="M${x - w * 0.27},${y} C${x - w * 0.66},${y - h * 0.14} ${x - w * 0.62},${y - h * 0.58} ${x},${y - h} C${x + w * 0.62},${y - h * 0.58} ${x + w * 0.66},${y - h * 0.14} ${x + w * 0.27},${y} Z" fill="url(#m-domeShade)"/>
      <line x1="${x}" y1="${y - h}" x2="${x}" y2="${y - h - w * 0.5}" stroke="#6a5a48" stroke-width="1.1"/><line x1="${x - w * 0.15}" y1="${y - h - w * 0.32}" x2="${x + w * 0.15}" y2="${y - h - w * 0.32}" stroke="#6a5a48" stroke-width="1"/>`
  }
  s += `<g>
    <rect x="180" y="420" width="96" height="70" fill="${P.wood}"/>${Array.from({ length: 10 }, (_, i) => `<rect x="180" y="${422 + i * 7}" width="96" height="1.3" fill="${P.woodD}" opacity=".6"/>`).join('')}
    <rect x="252" y="420" width="24" height="70" fill="rgba(0,0,0,.12)"/>
    <path d="M176,422 L228,396 L280,422 Z" fill="url(#m-aspen)"/>
    <rect x="200" y="380" width="56" height="40" fill="${P.wood}"/><rect x="210" y="344" width="36" height="36" fill="${P.wood}"/><rect x="218" y="314" width="20" height="30" fill="${P.wood}"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="200" y="${382 + i * 6}" width="56" height="1.2" fill="${P.woodD}" opacity=".6"/>`).join('')}
    ${[[188, 424, 14], [206, 412, 12], [250, 412, 12], [268, 424, 14], [204, 384, 12], [252, 384, 12], [228, 386, 13], [214, 348, 11], [242, 348, 11], [228, 352, 12], [228, 318, 16]].map(([x, y, w]) => dome(x, y, w)).join('')}
    <path d="M216,490 v-18 a12,12 0 0 1 24,0 v18 z" fill="${P.woodD}"/>
  </g>`
  // bell tower beside it
  s += `<g><rect x="306" y="434" width="22" height="52" fill="${P.wood}"/><path d="M302,436 L317,406 L332,436 Z" fill="url(#m-aspen)"/>${dome(317, 408, 10)}<rect x="311" y="446" width="12" height="12" fill="#3a2a22"/></g>`
  s += birch(110, 470, 0.7) + birch(140, 492, 0.6) + birch(350, 500, 0.6) + pine(80, 440, 0.6)
  // the boardwalk across the water to the island
  s += `<g class="m-boat"><g transform="translate(30 300)"><path d="M0,0 h30 l-5,6 h-20 z" fill="${P.wood}"/>${person(15, 0, '#a8402f', 0.7)}</g></g>`
  return s
}

// ---------------------------------------------------------------- 250–0: the meadow north of the lake
function meadow() {
  let s = `<rect x="0" y="0" width="${W}" height="254" fill="${EDGE.meadow}"/>`
  s += patches(0, 250, 8, '#4f6a3f', 0.07)
  for (let i = 0; i < 70; i++) s += `<circle cx="${r() * W}" cy="${r() * 240}" r="1.4" fill="${['#e8c25a', '#f4f1ea', '#c8323a', '#7f9fd0'][i % 4]}" opacity=".85"/>`
  for (const [x, y, sc] of [[40, 230, 0.7], [80, 210, 0.6], [330, 220, 0.7], [370, 190, 0.6], [30, 120, 0.6], [360, 90, 0.55], [100, 60, 0.5]]) s += birch(x, y, sc)
  s += hay(290, 140, 0.8) + hay(120, 150, 0.7)
  s += `<g class="m-drift">${cloud(90, 60, 0.5, false)}${cloud(320, 30, 0.45, false)}</g>`
  return s
}

const nodes: [number, number][] = [[140, 1478], [120, 1196], [282, 1000], [120, 674]]
const goal: [number, number] = [150, 502]
const roadPts: [number, number][] = [[200, H + 10], [190, 1700], [150, 1600], nodes[0], [150, 1360], nodes[1], [160, 1100], [250, 1060], nodes[2], [196, 984], [140, 920], [128, 840], nodes[3], [140, 600], goal, [104, 430], [136, 352], [168, 270], [210, 180], [196, 80], [200, -10]]

function svg() {
  seed(33)
  const d = smooth(roadPts)
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${defs}
    ${meadow()}${kizhi()}${flats()}${office()}${lake()}${dacha()}${forest()}
    ${road(d)}
    <path d="M120,346 L154,252 M150,356 L182,262" stroke="${P.woodL}" stroke-width="3"/>
    <path d="M120,346 L154,252 M150,356 L182,262" stroke="${P.woodD}" stroke-width="1" stroke-dasharray="2 3"/>
    <path d="M118,568 L128,540 M156,570 L162,544" stroke="${P.woodL}" stroke-width="3"/>
  </svg>`
}

export const ch3: Mural = {
  height: H, nodes, goal, svg,
  goalLabel: { ru: 'Ки́жи', es: 'Meta del capítulo' },
  sign: [300, 1730],
}
