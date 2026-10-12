// The end of the road so far: it runs on from the last chapter's meadow toward a sunset horizon, where a
// signpost says the story continues. It always sits above the newest chapter.
import { EDGE, W, birch, cloud, defs, hay, patches, pine, r, seed, type Mural } from './kit'

const H = 430
const HZ = 170 // horizon

function svg() {
  seed(44)
  let s = `<rect x="0" y="0" width="${W}" height="${HZ + 2}" fill="url(#m-sky)"/>`
  s += `<circle cx="250" cy="${HZ - 6}" r="70" fill="url(#m-sun)"/><circle cx="250" cy="${HZ - 6}" r="15" fill="#fff3d2" opacity=".9"/>`
  s += `<g class="m-drift">${cloud(80, 50, 0.9)}${cloud(330, 80, 0.7)}${cloud(190, 30, 0.5, false)}</g>`
  for (const [bx, by] of [[150, 70], [162, 64], [172, 72]]) s += `<path d="M${bx - 4},${by} q4,-3 4,0 q0,-3 4,0" fill="none" stroke="#3a3f45" stroke-width="1"/>`
  // distant hills and forest in haze
  s += `<path d="M0,${HZ} Q60,${HZ - 26} 130,${HZ - 10} Q200,${HZ - 30} 280,${HZ - 12} Q340,${HZ - 24} 400,${HZ - 8} V${HZ + 4} H0 Z" fill="#a6b2ae" opacity=".8"/>`
  for (let x = 0; x < W; x += 9) s += `<path d="M${x},${HZ + 2} l4.5,-${8 + r() * 8} l4.5,${8 + r() * 8} z" fill="#7f938a" opacity=".85"/>`
  // the meadow, getting paler toward the horizon
  s += `<rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="${EDGE.meadow}"/>`
  s += `<rect x="0" y="${HZ}" width="${W}" height="60" fill="#e8dcc0" opacity=".35"/>`
  s += patches(HZ + 30, H, 6, '#4f6a3f', 0.06)
  for (let i = 0; i < 40; i++) s += `<circle cx="${r() * W}" cy="${HZ + 30 + r() * (H - HZ - 30)}" r="1.3" fill="${['#e8c25a', '#f4f1ea', '#c8323a', '#7f9fd0'][i % 4]}" opacity=".85"/>`
  // the road narrowing to the horizon
  const road = (w0: number, w1: number) => `M${200 - w0},${H + 2} C${200 - w0},${H - 90} ${210 - w1 * 4},${HZ + 70} ${214 - w1},${HZ} L${214 + w1},${HZ} C${210 + w1 * 4},${HZ + 70} ${200 + w0},${H - 90} ${200 + w0},${H + 2} Z`
  s += `<path d="${road(13.5, 1.2)}" fill="#8f8170"/><path d="${road(11, 0.8)}" fill="#e9dcc2"/>`
  s += `<path d="M200,${H} C200,${H - 90} 210,${HZ + 70} 214,${HZ}" fill="none" stroke="#b9a684" stroke-width="1.2" stroke-dasharray="5 8"/>`
  // trees at the sides, smaller further away
  s += birch(40, H - 20, 0.85) + birch(80, H - 60, 0.6) + pine(350, H - 30, 0.8) + birch(310, H - 80, 0.5) + birch(130, HZ + 40, 0.3) + birch(290, HZ + 36, 0.3) + hay(90, HZ + 70, 0.5)
  // signpost
  s += `<g transform="translate(286 ${H - 70})"><ellipse cx="0" cy="2" rx="10" ry="3" fill="rgba(0,0,0,.2)"/><rect x="-1.6" y="-52" width="3.2" height="54" fill="#6a5040"/>
    <path d="M-2,-50 h66 l8,7 l-8,7 h-66 z" fill="#b08560"/><text x="32" y="-40" text-anchor="middle" font-family="PT Serif" font-weight="700" font-size="7.5" fill="#3a2a1e">Продолже́ние</text>
    <path d="M2,-32 h-58 l-8,7 l8,7 h58 z" fill="#c99a68"/><text x="-26" y="-22" text-anchor="middle" font-family="PT Serif" font-weight="700" font-size="7.5" fill="#3a2a1e">сле́дует…</text></g>`
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${defs}${s}</svg>`
}

export const cap: Mural = { height: H, nodes: [], goal: [0, 0], goalLabel: { ru: '', es: '' }, sign: [0, 0], svg }
