// Painted murals (public/img/murals, made by scripts/murals/paint.mjs from the SVG layouts) and the animated
// layer drawn over each one: painted cut-outs (trains, boats, plane, clouds) plus light effects. Coordinates are in
// the same 400-unit-wide space as the SVG murals, measured on the paintings.

export interface PaintedMural { image: string; overlay: () => string }

const B = import.meta.env.BASE_URL
const sprite = (name: string, x: number, y: number, w: number, h: number, extra = '') =>
  `<image href="${B}img/murals/sprites/${name}.png" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" ${extra}/>`
/** Sprite sizes in mural units (aspect from the PNGs). */
const S = {
  metro: [150, 29], sapsan: [11, 102], plane: [72, 22], rivertram: [46, 22], yacht: [74, 30], rowboat: [40, 19],
  sailboat: [30, 27], cyclist: [24, 22], cloud1: [90, 35], cloud2: [62, 39],
} as const
const put = (name: keyof typeof S, x: number, y: number, cls = '', scale = 1) =>
  `<g class="${cls}">${sprite(name, x, y, S[name][0] * scale, S[name][1] * scale)}</g>`
const glow = (x: number, y: number, r: number, color = '#ffe6a0', delay = 0) =>
  `<circle class="m-glow" style="animation-delay:${delay}s" cx="${x}" cy="${y}" r="${r}" fill="url(#o-glow-${color.slice(1)})"/>`
const twinkles = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `<circle class="m-twinkle" style="animation-delay:${(i * 0.37) % 2.4}s" cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join('')
const birds = (x: number, y: number) => `<g class="m-birds" stroke="#3a3f45" stroke-width="1" fill="none">
  <path d="M${x},${y} q3,-3 6,0 q3,-3 6,0"/><path d="M${x + 14},${y - 6} q2.5,-2.5 5,0 q2.5,-2.5 5,0"/><path d="M${x + 6},${y + 8} q2.5,-2.5 5,0 q2.5,-2.5 5,0"/></g>`
const smoke = (x: number, y: number) =>
  [0, 1.3, 2.6].map((d) => `<circle class="m-smoke" style="animation-delay:${d}s" cx="${x}" cy="${y}" r="4" fill="#efece4"/>`).join('')
const wrap = (h: number, body: string) => `<svg viewBox="0 0 400 ${h}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
  <defs>${['ffe6a0', 'ff7b5c', 'fff4cf'].map((c) => `<radialGradient id="o-glow-${c}"><stop offset="0" stop-color="#${c}" stop-opacity=".85"/><stop offset="1" stop-color="#${c}" stop-opacity="0"/></radialGradient>`).join('')}</defs>
  ${body}</svg>`

export const PAINTED: Record<string, PaintedMural> = {
  ch1: { image: `${B}img/murals/ch1.jpg`, overlay: () => wrap(1900, `
    <clipPath id="o-rail1"><rect x="300" y="0" width="80" height="252"/></clipPath>
    <g clip-path="url(#o-rail1)">${put('sapsan', 334.5, 150, 'm-train-up')}</g>
    ${glow(80, 262, 14, '#ff7b5c')}
    ${put('cloud1', 30, 70, 'm-cloud')}${put('cloud2', 250, 20, 'm-cloud m-slow')}${birds(150, 120)}
    ${put('rivertram', 205, 780, 'm-ferry')}
    ${[[100, 1198], [200, 1196], [300, 1198]].map(([x, y], i) => glow(x, y, 18, '#ffe6a0', i * 0.6)).join('')}
    <clipPath id="o-hall"><rect x="20" y="1296" width="362" height="74"/></clipPath>
    <g clip-path="url(#o-hall)">${put('metro', 390, 1334, 'm-metro2')}</g>
    <circle class="m-twinkle" cx="12" cy="1318" r="1.6" fill="#ff4b3a"/><circle class="m-twinkle" style="animation-delay:1.2s" cx="388" cy="1318" r="1.6" fill="#5adc6a"/>
    ${twinkles([[245, 1470], [262, 1458], [279, 1470], [254, 1490], [270, 1488], [262, 1440]])}
    ${put('cloud2', 40, 1560, 'm-cloud')}
    <g transform="rotate(-28 300 1815)">${put('plane', 264, 1804, 'm-takeoff')}</g>
  `) },
  ch2: { image: `${B}img/murals/ch2.jpg`, overlay: () => wrap(1800, `
    ${put('cloud1', 260, 40, 'm-cloud')}${birds(60, 150)}
    ${put('rivertram', 20, 278, 'm-ferry m-short')}
    ${put('cyclist', 20, 728, 'm-cycle')}
    ${put('cloud2', 300, 860, 'm-cloud m-slow')}
    ${put('yacht', 112, 1392, 'm-bob', 0.95)}
    ${put('rowboat', 262, 1404, 'm-ferry m-short')}
    <clipPath id="o-rail2"><rect x="300" y="1612" width="80" height="200"/></clipPath>
    <g clip-path="url(#o-rail2)">${put('sapsan', 334.5, 1700, 'm-train-up')}</g>
  `) },
  ch3: { image: `${B}img/murals/ch3.jpg`, overlay: () => wrap(1800, `
    ${put('cloud2', 40, 30, 'm-cloud')}${put('cloud1', 280, 90, 'm-cloud m-slow')}${birds(220, 60)}
    ${put('rowboat', 222, 268, 'm-ferry m-short')}
    ${put('sailboat', 275, 1228, 'm-ferry m-short', 1.1)}
    ${smoke(318, 1372)}
    ${put('cloud1', 30, 1500, 'm-cloud m-slow', 0.8)}
  `) },
  cap: { image: `${B}img/murals/cap.jpg`, overlay: () => wrap(430, `
    ${put('cloud1', 40, 40, 'm-cloud')}${put('cloud2', 260, 70, 'm-cloud m-slow')}${birds(150, 60)}
  `) },
}
