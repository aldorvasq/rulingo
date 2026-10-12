// Drawing kit for the route murals: palette, shared gradients/patterns and reusable pieces (domes,
// trees, people, lamps…). Murals are built as SVG strings in a 400-unit-wide space; every chapter's road
// enters at the bottom edge and leaves at the top edge at x = 200 so chapters join into one long road.

export const W = 400

export interface Mural {
  height: number
  /** Lesson tiles, first lesson first (bottom of the mural). */
  nodes: [number, number][]
  /** The chapter's goal (its landmark). */
  goal: [number, number]
  goalLabel: { ru: string; es: string }
  /** Where the chapter's name sign stands. */
  sign: [number, number]
  svg: () => string
}

export const P = {
  brick: '#a8402f', brickD: '#7f2f23', brickL: '#c4583f', cream: '#f3e8d2', white: '#fbf6ea',
  green: '#2f6b4f', greenL: '#4f8f6c', gold: '#d9b15a', goldD: '#a8832f', blue: '#2f5d8a', blueL: '#5d8bb5',
  slate: '#3e5a78', stone: '#cfc6b4', stoneD: '#a99f8b', leaf: '#5b7d4e', leafL: '#86a56a', leafD: '#3f5c3a',
  birch: '#b9c27a', water: '#6f93a8', ochre: '#d9b878', peach: '#e9b48a', mint: '#9cc5b0', mintD: '#6f9e88',
  wood: '#8a6446', woodD: '#5f4330', woodL: '#b08560',
}

/** Ground colours where two chapters meet, so the seam is invisible. */
export const EDGE = { north: '#c9cfae', forest: '#c3cca0', meadow: '#cdd2a9' }

// ---------------------------------------------------------------- deterministic randomness
let a = 1
export const seed = (s: number) => { a = s }
export const r = () => {
  a |= 0
  a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// ---------------------------------------------------------------- shared definitions
export const defs = `
<defs>
  <radialGradient id="m-domeShade" cx=".68" cy=".32" r=".75">
    <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".8" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".35"/>
  </radialGradient>
  <radialGradient id="m-lampGlow"><stop offset="0" stop-color="#ffe6a0" stop-opacity=".8"/><stop offset="1" stop-color="#ffe6a0" stop-opacity="0"/></radialGradient>
  <radialGradient id="m-chand"><stop offset="0" stop-color="#fff2c4" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd98a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
  <radialGradient id="m-sun" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff4d6"/><stop offset=".25" stop-color="#ffe2a6" stop-opacity=".9"/><stop offset="1" stop-color="#f4c98c" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="m-water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8fa9b4"/><stop offset=".5" stop-color="#5f8496"/><stop offset="1" stop-color="#47697b"/>
  </linearGradient>
  <linearGradient id="m-lake" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#7fa3b3"/><stop offset="1" stop-color="#4d7385"/>
  </linearGradient>
  <linearGradient id="m-glass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#cfe0ea"/><stop offset=".45" stop-color="#8db0c4"/><stop offset=".55" stop-color="#b9d2df"/><stop offset="1" stop-color="#6a8ea3"/>
  </linearGradient>
  <linearGradient id="m-vault" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d9a2"/><stop offset="1" stop-color="#d9b46c"/></linearGradient>
  <linearGradient id="m-earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6a4c"/><stop offset="1" stop-color="#5e4634"/></linearGradient>
  <linearGradient id="m-tarmac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9b8ae"/><stop offset="1" stop-color="#9c9b92"/></linearGradient>
  <linearGradient id="m-gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f5dc91"/><stop offset=".5" stop-color="#d4a945"/><stop offset="1" stop-color="#9c7425"/>
  </linearGradient>
  <linearGradient id="m-warm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f6c68a" stop-opacity=".35"/><stop offset="1" stop-color="#f6c68a" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="m-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#34506e"/><stop offset=".35" stop-color="#6f8ea6"/>
    <stop offset=".72" stop-color="#e2bf96"/><stop offset="1" stop-color="#f4d9ad"/>
  </linearGradient>
  <pattern id="m-pGY" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
    <rect width="12" height="12" fill="${P.green}"/><rect width="6" height="12" fill="${P.gold}"/></pattern>
  <pattern id="m-pRW" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(-34)">
    <rect width="11" height="11" fill="${P.brick}"/><rect width="5" height="11" fill="${P.cream}"/></pattern>
  <pattern id="m-pBW" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(36)">
    <rect width="10" height="10" fill="${P.blue}"/><rect width="4.5" height="10" fill="#e8eef0"/></pattern>
  <pattern id="m-pZ" width="12" height="8" patternUnits="userSpaceOnUse">
    <rect width="12" height="8" fill="${P.green}"/><path d="M0,6 L3,1 L6,6 L9,1 L12,6 L12,8 L0,8 Z" fill="${P.brick}"/></pattern>
  <pattern id="m-pD" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="9" height="9" fill="${P.goldD}"/><rect width="4.5" height="4.5" fill="${P.gold}"/><rect x="4.5" y="4.5" width="4.5" height="4.5" fill="${P.green}"/></pattern>
  <pattern id="m-pTent" width="8" height="10" patternUnits="userSpaceOnUse">
    <rect width="8" height="10" fill="${P.green}"/><path d="M0,10 L4,2 L8,10" fill="none" stroke="${P.cream}" stroke-width="1"/><circle cx="4" cy="7" r="1" fill="${P.gold}"/></pattern>
  <pattern id="m-shingle" width="6" height="5" patternUnits="userSpaceOnUse">
    <rect width="6" height="5" fill="#8a9a8e"/><path d="M0,5 Q3,1 6,5" fill="none" stroke="#6e7f73" stroke-width=".8"/></pattern>
  <pattern id="m-aspen" width="5" height="4" patternUnits="userSpaceOnUse">
    <rect width="5" height="4" fill="#b7b2a4"/><path d="M0,4 Q2.5,0.5 5,4" fill="none" stroke="#8f8a7d" stroke-width=".7"/></pattern>
  <pattern id="m-cobble" width="14" height="8" patternUnits="userSpaceOnUse">
    <rect width="14" height="8" fill="#9c9183"/><rect x=".6" y=".6" width="6" height="3" rx="1.2" fill="#b3a898"/><rect x="7.6" y=".6" width="5.8" height="3" rx="1.2" fill="#aa9f8f"/>
    <rect x="-3" y="4.4" width="6" height="3" rx="1.2" fill="#ada290"/><rect x="4" y="4.4" width="6" height="3" rx="1.2" fill="#b6ab9b"/><rect x="11" y="4.4" width="6" height="3" rx="1.2" fill="#a59a8a"/></pattern>
  <pattern id="m-paving" width="12" height="12" patternUnits="userSpaceOnUse">
    <rect width="12" height="12" fill="#c9c0ad"/><path d="M0,0 h12 M0,6 h12 M6,0 v6 M0,6 v6 M12,6 v6" stroke="#b5ab96" stroke-width=".6"/></pattern>
  <pattern id="m-mosaic" width="16" height="16" patternUnits="userSpaceOnUse">
    <rect width="16" height="16" fill="#e8c77e"/><circle cx="8" cy="8" r="4" fill="none" stroke="#b8913f" stroke-width="1"/><path d="M8,2 v12 M2,8 h12" stroke="#c9a457" stroke-width=".5"/></pattern>
  <pattern id="m-field" width="10" height="6" patternUnits="userSpaceOnUse">
    <rect width="10" height="6" fill="#d8c98f"/><path d="M0,3 h10" stroke="#c7b77a" stroke-width="1"/></pattern>
  <pattern id="m-brickWall" width="10" height="6" patternUnits="userSpaceOnUse">
    <rect width="10" height="6" fill="#a9553c"/><path d="M0,0 h10 M0,3 h10 M5,0 v3 M0,3 v3 M10,3 v3" stroke="#8a4330" stroke-width=".6"/></pattern>
  <filter id="m-soft"><feGaussianBlur stdDeviation="2.5"/></filter>
</defs>`

// ---------------------------------------------------------------- pieces
export const onionPath = (cx: number, by: number, w: number, h: number) =>
  `M${cx - w * 0.27},${by} C${cx - w * 0.66},${by - h * 0.14} ${cx - w * 0.62},${by - h * 0.58} ${cx},${by - h} ` +
  `C${cx + w * 0.62},${by - h * 0.58} ${cx + w * 0.66},${by - h * 0.14} ${cx + w * 0.27},${by} Z`

export function onion(cx: number, by: number, w: number, h: number, fill: string, cross = true) {
  const d = onionPath(cx, by, w, h)
  return `<path d="${d}" fill="${fill}"/><path d="${d}" fill="url(#m-domeShade)"/>
    <path d="${d}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>
    <rect x="${cx - w * 0.3}" y="${by - 1}" width="${w * 0.6}" height="4" fill="${P.goldD}"/>` + (cross ? `
    <line x1="${cx}" y1="${by - h}" x2="${cx}" y2="${by - h - h * 0.42}" stroke="${P.gold}" stroke-width="1.6"/>
    <line x1="${cx - w * 0.12}" y1="${by - h - h * 0.3}" x2="${cx + w * 0.12}" y2="${by - h - h * 0.3}" stroke="${P.gold}" stroke-width="1.4"/>
    <line x1="${cx - w * 0.08}" y1="${by - h - h * 0.17}" x2="${cx + w * 0.08}" y2="${by - h - h * 0.2}" stroke="${P.gold}" stroke-width="1.1"/>` : '')
}

/** Tower drum with kokoshnik arches on top and arched window slits. */
export function drum(x: number, y: number, w: number, h: number, color = P.brick, trim = P.cream) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>
    <rect x="${x + w * 0.62}" y="${y}" width="${w * 0.38}" height="${h}" fill="rgba(0,0,0,.16)"/>`
  const n = Math.max(2, Math.round(w / 9))
  const aw = w / n
  for (let i = 0; i < n; i++) {
    const ax = x + i * aw
    s += `<path d="M${ax},${y + 6} Q${ax + aw / 2},${y - aw * 0.75} ${ax + aw},${y + 6}" fill="${trim}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>`
    if (h > 26) s += `<path d="M${ax + aw * 0.36},${y + h * 0.62} v${-h * 0.22} a${aw * 0.14},${aw * 0.14} 0 0 1 ${aw * 0.28},0 v${h * 0.22} z" fill="#3a2a22"/>`
  }
  return s + `<rect x="${x - 1}" y="${y + 6}" width="${w + 2}" height="2.2" fill="${trim}"/>`
}

export function birch(x: number, y: number, s = 1) {
  let g = `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="16" ry="4" fill="rgba(30,30,10,.18)"/>`
  g += `<path d="M-2,0 L-1.5,-58 L1.5,-58 L2.4,0 Z" fill="#f4f1e6"/>`
  for (let i = 0; i < 6; i++) g += `<rect x="${-2 + r() * 2}" y="${-6 - i * 9 - r() * 4}" width="${1.6 + r() * 2}" height="1.4" fill="#2c2a26"/>`
  g += `<path d="M0,-34 L-9,-44 M0,-42 L8,-52" stroke="#e9e5d8" stroke-width="1.3"/>`
  const blobs = [[-10, -52, 12], [9, -58, 11], [0, -68, 13], [-12, -66, 9], [11, -46, 9], [-3, -78, 9]]
  for (const [bx, by, br] of blobs) g += `<circle cx="${bx}" cy="${by}" r="${br}" fill="${P.leaf}"/>`
  for (const [bx, by, br] of blobs) g += `<circle cx="${bx + 2.5}" cy="${by - 3}" r="${br * 0.62}" fill="${P.birch}" opacity=".9"/>`
  for (let i = 0; i < 6; i++) g += `<circle cx="${-12 + r() * 26}" cy="${-80 + r() * 36}" r="1.6" fill="#e8eba6" opacity=".9"/>`
  return g + `</g>`
}

export function tree(x: number, y: number, s = 1, tone = 0) {
  const dark = ['#3f5c3a', '#45603b', '#3b5546'][tone], mid = ['#5b7d4e', '#6b8a4c', '#4f7360'][tone], lite = ['#86a56a', '#9bb56b', '#7aa08a'][tone]
  let g = `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="2" cy="2" rx="20" ry="5" fill="rgba(30,30,10,.2)"/>`
  g += `<rect x="-2.5" y="-24" width="5" height="26" fill="#6a5040"/>`
  const blobs = [[-12, -30, 14], [12, -32, 13], [0, -44, 17], [-8, -50, 11], [10, -52, 10]]
  for (const [bx, by, br] of blobs) g += `<circle cx="${bx}" cy="${by}" r="${br}" fill="${dark}"/>`
  for (const [bx, by, br] of blobs) g += `<circle cx="${bx + 2}" cy="${by - 2}" r="${br * 0.8}" fill="${mid}"/>`
  for (const [bx, by, br] of blobs) g += `<circle cx="${bx + 4}" cy="${by - 5}" r="${br * 0.42}" fill="${lite}"/>`
  return g + `</g>`
}

/** Northern spruce: stacked jagged tiers with a lit right side. */
export function pine(x: number, y: number, s = 1) {
  let g = `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="2" cy="2" rx="13" ry="3.5" fill="rgba(30,30,10,.2)"/><rect x="-1.6" y="-8" width="3.2" height="10" fill="#5e4636"/>`
  for (let i = 0; i < 5; i++) {
    const w = 14 - i * 2.4, yb = -6 - i * 11
    g += `<path d="M${-w},${yb} L0,${yb - 18} L${w},${yb} Q0,${yb - 4} ${-w},${yb} Z" fill="#2f4d3c"/>`
    g += `<path d="M0,${yb - 18} L${w},${yb} Q${w * 0.4},${yb - 3} 0,${yb - 2} Z" fill="#46684f"/>`
  }
  return g + `</g>`
}

export function person(x: number, y: number, coat: string, s = 1, hat = false) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="1" cy="0.5" rx="3.6" ry="1.2" fill="rgba(0,0,0,.2)"/>
    <rect x="-1.6" y="-5" width="1.3" height="5" fill="#2b2b30"/><rect x=".4" y="-5" width="1.3" height="5" fill="#2b2b30"/>
    <path d="M-2.6,-5 L-2,-12 Q0,-13.4 2,-12 L2.6,-5 Z" fill="${coat}"/>
    <circle cx="0" cy="-14.6" r="2.1" fill="#e8c4a2"/>
    ${hat ? `<rect x="-2.3" y="-17.4" width="4.6" height="2" rx="1" fill="#2b2b30"/>` : `<path d="M-2.1,-15 Q0,-18 2.1,-15" fill="#4a3426"/>`}
  </g>`
}

export function lamp(x: number, y: number, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-.9" y="-30" width="1.8" height="30" fill="#2f3438"/><rect x="-3" y="-2" width="6" height="2" fill="#2f3438"/>
    <path d="M-5,-30 h10 l-2,-5 h-6 z" fill="#2f3438"/><rect x="-3" y="-35" width="6" height="5" fill="#ffe7a8" class="m-glow"/>
    <circle cx="0" cy="-32" r="9" fill="url(#m-lampGlow)" class="m-glow"/></g>`
}

export function cloud(x: number, y: number, s: number, warm = true) {
  const top = warm ? '#fff6e6' : '#f4f6f6', bot = warm ? '#f0c99a' : '#cdd7dc'
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity=".95">
    <path d="M-40,8 Q-44,-6 -28,-8 Q-24,-24 -6,-20 Q4,-34 22,-22 Q40,-24 40,-8 Q54,-4 46,8 Z" fill="${bot}"/>
    <path d="M-36,2 Q-38,-8 -26,-10 Q-22,-23 -6,-19 Q4,-31 21,-21 Q36,-22 37,-9 Q46,-6 42,2 Z" fill="${top}"/></g>`
}

/** A small car seen from the side. */
export function car(x: number, y: number, color: string, s = 1, flip = false) {
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse cx="0" cy="1" rx="14" ry="2" fill="rgba(0,0,0,.2)"/>
    <path d="M-13,-3 v-5 q0,-2 2,-2 h4 l4,-5 h9 l4,5 h3 q2,0 2,2 v5 z" fill="${color}"/>
    <path d="M-5,-10 l3,-4 h4 v4 z M3,-10 v-4 h3 l3,4 z" fill="#cfe0ea"/>
    <circle cx="-7" cy="-2" r="2.6" fill="#2b2b30"/><circle cx="7" cy="-2" r="2.6" fill="#2b2b30"/>
    <circle cx="-7" cy="-2" r="1" fill="#aaa"/><circle cx="7" cy="-2" r="1" fill="#aaa"/></g>`
}

/** Haystack / rick. */
export const hay = (x: number, y: number, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="2" cy="1" rx="12" ry="3" fill="rgba(0,0,0,.18)"/><path d="M-11,0 Q-12,-16 0,-22 Q12,-16 11,0 Z" fill="#d6b56a"/>
  <path d="M0,-22 Q12,-16 11,0 L4,0 Q6,-12 0,-22 Z" fill="#b8954d"/><path d="M-6,-8 q6,-3 12,0 M-8,-3 q8,-3 16,0" stroke="#b8954d" stroke-width=".8" fill="none"/>
  <line x1="0" y1="-22" x2="0" y2="-27" stroke="#6a5040" stroke-width="1.2"/></g>`

/** Railway track running straight up between y0 and y1 at x, with a dotted gravel bed. */
export function railway(x: number, y0: number, y1: number) {
  let s = `<rect x="${x - 9}" y="${y0}" width="18" height="${y1 - y0}" fill="#a39b8c"/>`
  for (let y = y0 + 2; y < y1; y += 6) s += `<rect x="${x - 8}" y="${y}" width="16" height="2.2" fill="#6e5a48"/>`
  return s + `<path d="M${x - 4.5},${y0} V${y1} M${x + 4.5},${y0} V${y1}" stroke="#55585c" stroke-width="1.4"/>`
}

/** High-speed train (Sapsan-like, unbranded) heading up the track. */
export function train(x: number, y: number, cars = 4) {
  let s = `<g transform="translate(${x} ${y})">`
  for (let i = 0; i < cars; i++) {
    const cy = i * 30
    s += `<rect x="-6" y="${cy}" width="12" height="28" rx="2" fill="#e9ecee"/><rect x="-6" y="${cy}" width="3" height="28" fill="#c8323a"/>`
    s += `<rect x="3.5" y="${cy + 3}" width="1.6" height="22" fill="#5e7d90"/>`
  }
  return s + `<path d="M-6,0 Q0,-14 6,0 Z" fill="#e9ecee"/><path d="M-3,-4 Q0,-9 3,-4 Z" fill="#2c3e57"/></g>`
}

/** Catmull-Rom → cubic Bézier through the points. */
export function smooth(p: [number, number][]) {
  let d = `M${p[0][0]},${p[0][1]}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`
  }
  return d
}

/** The cobbled road every chapter shares. */
export function road(d: string, shadow = true) {
  return (shadow ? `<path d="${d}" fill="none" stroke="rgba(40,25,10,.22)" stroke-width="30" stroke-linecap="round" transform="translate(2 4)" filter="url(#m-soft)"/>` : '') + `
  <path d="${d}" fill="none" stroke="#8f8170" stroke-width="27" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="#e9dcc2" stroke-width="22" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="#d2c3a4" stroke-width="22" stroke-linecap="round" stroke-dasharray="1 7"/>
  <path d="${d}" fill="none" stroke="#b9a684" stroke-width="1.6" stroke-dasharray="6 9"/>`
}

/** Faint darker patches so a flat ground reads as terrain. */
export function patches(y0: number, y1: number, n: number, color = '#000', op = 0.04) {
  let s = ''
  for (let i = 0; i < n; i++) s += `<ellipse cx="${r() * W}" cy="${y0 + r() * (y1 - y0)}" rx="${18 + r() * 34}" ry="${4 + r() * 5}" fill="${color}" opacity="${op}"/>`
  return s
}

/** A road sign on a post: a white panel with Russian text. */
export function roadSign(x: number, y: number, lines: string[], color = '#2f5d8a') {
  const w = Math.max(...lines.map((l) => l.length)) * 4.6 + 10, h = lines.length * 9 + 6
  return `<g transform="translate(${x} ${y})"><rect x="-1" y="-${h + 16}" width="2" height="${h + 16}" fill="#55585c"/>
    <rect x="${-w / 2}" y="-${h + 18}" width="${w}" height="${h}" rx="1.5" fill="${color}" stroke="#fff" stroke-width="1"/>
    ${lines.map((l, i) => `<text x="0" y="${-h - 18 + 10 + i * 9}" text-anchor="middle" font-family="PT Sans" font-weight="700" font-size="7.5" fill="#fff">${l}</text>`).join('')}</g>`
}
