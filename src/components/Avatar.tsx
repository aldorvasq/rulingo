import { useId } from 'react'
import type { CastMember } from '../content/types'

// Illustrated portrait drawn from a cast description (no book artwork is reused). Every character keeps
// the same look in every story; while speaking the portrait opens its mouth (see .mouth-talk in index.css).

/** Deterministic defaults so a character without full attributes still looks the same everywhere. */
function withDefaults(c: CastMember): Required<Omit<CastMember, 'name'>> {
  let h = 0
  for (const ch of c.name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const pick = <T,>(xs: T[]) => xs[h++ % xs.length]
  const age = c.age ?? 'adult'
  const style = c.hairStyle ?? (c.gender === 'f' ? pick(['long', 'bun', 'ponytail', 'curly'] as const) : pick(['short', 'short', 'curly'] as const))
  return {
    gender: c.gender,
    age,
    skin: c.skin ?? pick(['light', 'light', 'medium'] as const),
    hair: c.hair ?? (age === 'old' ? 'gray' : pick(['brown', 'black', 'blond', 'red'] as const)),
    hairStyle: style,
    glasses: c.glasses ?? false,
    beard: c.beard ?? false,
    top: c.top ?? pick(['blue', 'red', 'green', 'ochre', 'teal', 'gray'] as const),
  }
}

const SKIN: Record<string, string[]> = { light: ['#f3d6bf', '#e2b598', '#c98f73'], medium: ['#d9a77f', '#c18a63', '#9c6a48'], dark: ['#94603f', '#7a4c31', '#5b3822'] }
const HAIR: Record<string, string[]> = { black: ['#26252a', '#45434a'], brown: ['#5e3f27', '#8a6242'], blond: ['#d4ab5e', '#f0d38f'], red: ['#a3492a', '#cf7449'], gray: ['#b4b3ae', '#e2e1dc'], none: ['#b4b3ae', '#e2e1dc'] }
const TOP: Record<string, string[]> = { blue: ['#3d5a80', '#2c4462'], red: ['#9a4a3f', '#783830'], green: ['#56704f', '#41573c'], ochre: ['#b38b3f', '#8e6c2c'], gray: ['#6e7377', '#54585c'], teal: ['#3f7f7a', '#2f625e'] }
const BG: Record<string, string[]> = { blue: ['#e3eaf2', '#c9d6e4'], red: ['#f3e3df', '#e5c8c1'], green: ['#e4ece0', '#cbd9c5'], ochre: ['#f3ead8', '#e5d3ad'], gray: ['#ebebe8', '#d5d5d0'], teal: ['#dfeeec', '#bfdcd8'] }

function portrait(a: Required<Omit<CastMember, 'name'>>, k: string, talking: boolean): string {
  const [sk, skS, skD] = SKIN[a.skin]
  const [hr, hrL] = HAIR[a.hair]
  const [tp, tpD] = TOP[a.top]
  const [bg1, bg2] = BG[a.top]
  const child = a.age === 'child', old = a.age === 'old', f = a.gender === 'f'
  // head geometry (100 × 100 box)
  const cx = 50, cy = child ? 47 : 44, hw = child ? 19 : 17, hh = child ? 21 : 22
  const jaw = f || child ? 0.78 : 0.86
  const head = `M${cx - hw},${cy - 4} C${cx - hw},${cy - hh - 2} ${cx + hw},${cy - hh - 2} ${cx + hw},${cy - 4} ` +
    `C${cx + hw},${cy + hh * 0.55} ${cx + hw * jaw * 0.6},${cy + hh} ${cx},${cy + hh} C${cx - hw * jaw * 0.6},${cy + hh} ${cx - hw},${cy + hh * 0.55} ${cx - hw},${cy - 4} Z`
  const eyeY = cy + 1, eyeDx = child ? 7.5 : 7, eyeR = child ? 2.6 : 2.2
  let s = `<svg viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="bg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>
    <radialGradient id="face${k}" cx=".38" cy=".35" r=".8"><stop offset="0" stop-color="${sk}"/><stop offset=".7" stop-color="${sk}"/><stop offset="1" stop-color="${skS}"/></radialGradient>
    <linearGradient id="hair${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hrL}"/><stop offset=".45" stop-color="${hr}"/><stop offset="1" stop-color="${hr}"/></linearGradient>
    <linearGradient id="top${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tp}"/><stop offset="1" stop-color="${tpD}"/></linearGradient>
    <clipPath id="headClip${k}"><path d="${head}"/></clipPath>
  </defs>
  <rect width="100" height="100" fill="url(#bg${k})"/>
  <circle cx="50" cy="44" r="38" fill="#fff" opacity=".35"/>`
  // hair behind the head
  if (a.hairStyle === 'long') s += `<path d="M${cx - hw - 3},${cy - 6} C${cx - hw - 7},${cy + 20} ${cx - hw - 6},${cy + 38} ${cx - hw + 2},${cy + 44} L${cx + hw - 2},${cy + 44} C${cx + hw + 6},${cy + 38} ${cx + hw + 7},${cy + 20} ${cx + hw + 3},${cy - 6} Z" fill="url(#hair${k})"/>`
  if (a.hairStyle === 'ponytail') s += `<path d="M${cx + hw - 2},${cy - 12} C${cx + hw + 14},${cy - 10} ${cx + hw + 12},${cy + 18} ${cx + hw + 4},${cy + 26} C${cx + hw + 6},${cy + 12} ${cx + hw + 2},${cy} ${cx + hw - 4},${cy - 4} Z" fill="url(#hair${k})"/><rect x="${cx + hw - 1}" y="${cy - 12}" width="4" height="5" rx="1.5" fill="${tp}" transform="rotate(20 ${cx + hw} ${cy - 10})"/>`
  if (a.hairStyle === 'curly') for (let i = 0; i < 9; i++) { const ang = Math.PI * (0.95 + i * 0.137); s += `<circle cx="${cx + Math.cos(ang) * (hw + 3)}" cy="${cy - 4 + Math.sin(ang) * (hh + 2) * 0.9 + 6}" r="7" fill="${hr}"/>` }
  // torso: clothing differs by age/gender
  const sh = child ? 'M18,100 C18,80 30,72 50,72 C70,72 82,80 82,100 Z' : 'M8,100 C8,78 26,69 50,69 C74,69 92,78 92,100 Z'
  s += `<path d="${sh}" fill="url(#top${k})"/>`
  // neck
  s += `<path d="M${cx - 6},${cy + hh - 6} L${cx - 6.5},${cy + hh + 8} Q${cx},${cy + hh + 12} ${cx + 6.5},${cy + hh + 8} L${cx + 6},${cy + hh - 6} Z" fill="${skS}"/>`
  s += `<path d="M${cx - 6},${cy + hh - 2} Q${cx},${cy + hh + 4} ${cx + 6},${cy + hh - 2} L${cx + 6},${cy + hh - 6} L${cx - 6},${cy + hh - 6} Z" fill="${skD}" opacity=".35"/>`
  if (child) {
    s += `<path d="M${cx - 9},71.5 Q${cx},80 ${cx + 9},71.5" fill="none" stroke="${tpD}" stroke-width="3"/>`
    s += `<rect x="18" y="86" width="64" height="4" fill="#fff" opacity=".35"/><rect x="18" y="93" width="64" height="4" fill="#fff" opacity=".35"/>`
  } else if (old) {
    s += `<path d="M${cx - 8},70 L${cx},88 L${cx + 8},70" fill="#efe9dc"/><path d="M${cx - 12},70 L${cx - 2},100 M${cx + 12},70 L${cx + 2},100" stroke="${tpD}" stroke-width="2.4"/>`
    for (const y of [82, 90, 97]) s += `<circle cx="${cx + 4}" cy="${y}" r="1.3" fill="${tpD}"/>`
  } else if (f) {
    s += `<path d="M${cx - 10},70 Q${cx},84 ${cx + 10},70" fill="${skS}"/><path d="M${cx - 10},70 Q${cx},84 ${cx + 10},70" fill="none" stroke="${tpD}" stroke-width="1.4"/>`
    s += `<path d="M${cx - 8},72 Q${cx},82 ${cx + 8},72" fill="none" stroke="#e9cf8a" stroke-width="1"/><circle cx="${cx}" cy="80.5" r="1.8" fill="#e9cf8a"/>`
  } else {
    s += `<path d="M${cx - 7},69 L${cx},79 L${cx + 7},69 L${cx + 5},68 L${cx},74 L${cx - 5},68 Z" fill="#f4f1ea"/>`
    s += `<path d="M${cx - 13},70 L${cx - 2},88 L${cx - 6},100 M${cx + 13},70 L${cx + 2},88 L${cx + 6},100" fill="none" stroke="${tpD}" stroke-width="2.2"/>`
  }
  // ears
  for (const sgn of [-1, 1]) s += `<ellipse cx="${cx + sgn * (hw + 0.5)}" cy="${cy + 2}" rx="3.4" ry="5" fill="${skS}"/><ellipse cx="${cx + sgn * (hw + 0.8)}" cy="${cy + 2}" rx="1.6" ry="2.8" fill="${skD}" opacity=".4"/>`
  // head with shading
  s += `<path d="${head}" fill="url(#face${k})"/>`
  s += `<g clip-path="url(#headClip${k})"><ellipse cx="${cx + hw * 0.9}" cy="${cy + 6}" rx="8" ry="${hh}" fill="${skD}" opacity=".18"/></g>`
  // cheeks
  s += `<ellipse cx="${cx - 9.5}" cy="${cy + 8}" rx="3.6" ry="2.2" fill="#e57a6a" opacity="${f || child ? 0.32 : 0.14}"/><ellipse cx="${cx + 9.5}" cy="${cy + 8}" rx="3.6" ry="2.2" fill="#e57a6a" opacity="${f || child ? 0.32 : 0.14}"/>`
  // eyes
  for (const sgn of [-1, 1]) {
    const ex = cx + sgn * eyeDx
    s += `<ellipse cx="${ex}" cy="${eyeY}" rx="${eyeR + 1.4}" ry="${eyeR + 0.6}" fill="#fff"/>`
    s += `<circle cx="${ex + 0.3}" cy="${eyeY + 0.2}" r="${eyeR}" fill="${a.skin === 'light' && (a.hair === 'blond' || a.hair === 'red') ? '#4a6a7c' : '#3b2a20'}"/>`
    s += `<circle cx="${ex + 0.3}" cy="${eyeY + 0.2}" r="${eyeR * 0.5}" fill="#141414"/><circle cx="${ex + 1}" cy="${eyeY - 0.6}" r="${eyeR * 0.32}" fill="#fff"/>`
    s += `<path d="M${ex - eyeR - 1.6},${eyeY - 0.4} Q${ex},${eyeY - eyeR - 2.2} ${ex + eyeR + 1.6},${eyeY - 0.4}" fill="none" stroke="${skD}" stroke-width="1.1"/>`
    if (f) s += `<path d="M${ex + sgn * (eyeR + 1.2)},${eyeY - 1} l${sgn * 1.6},-1.2" stroke="#2a2420" stroke-width=".9"/>`
    // brows
    const bc = a.hair === 'none' ? HAIR.gray[0] : (a.hair === 'blond' ? '#b08a48' : hr)
    s += `<path d="M${ex - 3.6 * sgn},${eyeY - 6.2 + (old ? 0.6 : 0)} Q${ex},${eyeY - 8.4} ${ex + 3.8 * sgn},${eyeY - 6.4}" fill="none" stroke="${bc}" stroke-width="${f ? 1.3 : 1.9}" stroke-linecap="round"/>`
  }
  // nose
  s += `<path d="M${cx + 0.5},${cy + 3} Q${cx + 2.6},${cy + 9} ${cx + 0.4},${cy + 10.2}" fill="none" stroke="${skD}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>`
  s += `<ellipse cx="${cx - 1.4}" cy="${cy + 10}" rx="1.4" ry=".8" fill="${skD}" opacity=".35"/>`
  // mouth (smile, or open while talking)
  const my = cy + 15
  s += `<path d="M${cx - 5},${my - 1} Q${cx},${my + 3.2} ${cx + 5},${my - 1}" fill="none" stroke="#8a4636" stroke-width="1.5" stroke-linecap="round"/>`
  if (talking) s += `<path class="mouth-talk" d="M${cx - 4.6},${my - 1} Q${cx},${my + 5.5} ${cx + 4.6},${my - 1} Q${cx},${my + 1} ${cx - 4.6},${my - 1} Z" fill="#6a2c24"/><path class="mouth-talk" d="M${cx - 3},${my - .2} Q${cx},${my + 1} ${cx + 3},${my - .2}" stroke="#fff" stroke-width="1.1" fill="none"/>`
  if (f) s += `<path d="M${cx - 4},${my - 1} Q${cx},${my + 2.4} ${cx + 4},${my - 1}" fill="none" stroke="#c45a52" stroke-width="1" opacity=".6"/>`
  // age lines
  if (old) s += `<path d="M${cx - 13},${eyeY + 3} q2,1.5 4,0 M${cx + 9},${eyeY + 3} q2,1.5 4,0 M${cx - 7},${cy - 12} q7,-2 14,0 M${cx - 5},${cy - 9} q5,-1.5 10,0" fill="none" stroke="${skD}" stroke-width=".8" opacity=".55"/><path d="M${cx - 7},${my - 3} q-1.5,3 0,5 M${cx + 7},${my - 3} q1.5,3 0,5" fill="none" stroke="${skD}" stroke-width=".8" opacity=".5"/>`
  // beard + moustache
  if (a.beard) {
    const bc = a.hair === 'none' ? (old ? HAIR.gray : HAIR.brown) : HAIR[a.hair]
    s += `<path d="M${cx - hw + 1},${cy + 2} C${cx - hw + 1},${cy + 18} ${cx - 8},${cy + hh + 5} ${cx},${cy + hh + 5} C${cx + 8},${cy + hh + 5} ${cx + hw - 1},${cy + 18} ${cx + hw - 1},${cy + 2} ` +
      `C${cx + hw - 4},${cy + 10} ${cx + 8},${my - 4} ${cx},${my - 3} C${cx - 8},${my - 4} ${cx - hw + 4},${cy + 10} ${cx - hw + 1},${cy + 2} Z" fill="${bc[0]}"/>`
    s += `<path d="M${cx - 6.5},${my - 1.4} Q${cx},${my - 6} ${cx + 6.5},${my - 1.4} Q${cx},${my - 3} ${cx - 6.5},${my - 1.4} Z" fill="${bc[0]}"/>`
    s += `<path d="M${cx - 4.5},${my + 1} Q${cx},${my + 3.4} ${cx + 4.5},${my + 1}" fill="none" stroke="#8a4636" stroke-width="1.4" stroke-linecap="round"/>`
    for (let i = 0; i < 7; i++) s += `<path d="M${cx - 10 + i * 3.3},${cy + hh - 2 + (i % 2)} l.6,2.4" stroke="${bc[1]}" stroke-width=".7" opacity=".6"/>`
  }
  // hair on top
  const top = cy - hh
  if (a.hairStyle === 'short') {
    s += `<path d="M${cx - hw - 1.5},${cy - 1} C${cx - hw - 3},${top - 6} ${cx + hw + 3},${top - 8} ${cx + hw + 1.5},${cy - 2} C${cx + hw - 2},${top + 8} ${cx + 4},${top + 5} ${cx - 3},${top + 7} C${cx - 8},${top + 9} ${cx - hw + 2},${top + 9} ${cx - hw - 1.5},${cy - 1} Z" fill="url(#hair${k})"/>`
    s += `<path d="M${cx - 5},${top + 1} q8,-4 16,1" fill="none" stroke="${hrL}" stroke-width="1.4" opacity=".7"/>`
  } else if (a.hairStyle === 'curly') {
    for (let i = 0; i < 8; i++) { const x = cx - hw + 1 + i * (2 * hw - 2) / 7; s += `<circle cx="${x}" cy="${top + 3 + Math.abs(i - 3.5) * 1.6}" r="6.4" fill="${hr}"/><circle cx="${x - 1.4}" cy="${top + 1.6 + Math.abs(i - 3.5) * 1.6}" r="2.6" fill="${hrL}" opacity=".55"/>` }
  } else if (a.hairStyle === 'long' || a.hairStyle === 'ponytail' || a.hairStyle === 'bun') {
    s += `<path d="M${cx - hw - 2},${cy + 4} C${cx - hw - 4},${top - 6} ${cx + hw + 4},${top - 6} ${cx + hw + 2},${cy + 4} C${cx + hw - 1},${top + 10} ${cx + 6},${top + 4} ${cx - 2},${top + 9} C${cx - 7},${top + 12} ${cx - hw + 1},${top + 12} ${cx - hw - 2},${cy + 4} Z" fill="url(#hair${k})"/>`
    s += `<path d="M${cx - 9},${top + 1} q9,-4 18,0" fill="none" stroke="${hrL}" stroke-width="1.4" opacity=".75"/>`
    if (a.hairStyle === 'bun') s += `<circle cx="${cx}" cy="${top - 4}" r="7" fill="url(#hair${k})"/><path d="M${cx - 4},${top - 6} q4,-3 8,0" stroke="${hrL}" stroke-width="1.2" fill="none"/>`
  } else if (a.hairStyle === 'bald') {
    s += `<ellipse cx="${cx - 6}" cy="${top + 6}" rx="6" ry="3" fill="#fff" opacity=".28"/>`
    if (old || a.hair !== 'none') for (const sgn of [-1, 1]) s += `<path d="M${cx + sgn * (hw + 0.5)},${cy - 7} q${sgn * 2},6 ${sgn * 0.5},12 l${-sgn * 2.5},-1 q${sgn * 1},-5 ${-sgn * 0.5},-10 z" fill="${HAIR[old ? 'gray' : 'brown'][0]}"/>`
  }
  // glasses
  if (a.glasses) {
    s += `<g fill="rgba(255,255,255,.12)" stroke="#2a2a2c" stroke-width="1.5"><rect x="${cx - eyeDx - 5.2}" y="${eyeY - 4.2}" width="10.4" height="8.4" rx="3"/><rect x="${cx + eyeDx - 5.2}" y="${eyeY - 4.2}" width="10.4" height="8.4" rx="3"/></g>`
    s += `<path d="M${cx - eyeDx + 5.2},${eyeY - 1} q${eyeDx - 5.2},-2 ${2 * (eyeDx - 5.2)},0" stroke="#2a2a2c" stroke-width="1.3" fill="none"/>`
    s += `<path d="M${cx - eyeDx - 3},${eyeY + 2.5} l3,-5 M${cx + eyeDx - 3},${eyeY + 2.5} l3,-5" stroke="#fff" stroke-width="1" opacity=".7"/>`
  }
  return s + `</svg>`
}

export function Avatar({ member, size = 56, active = false }: { member: CastMember; size?: number; active?: boolean }) {
  const k = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <span aria-hidden style={{ width: size, height: size }}
      className={`block shrink-0 overflow-hidden rounded-lg transition-transform duration-200 ${active ? 'scale-110 ring-[3px] ring-brand' : ''}`}
      dangerouslySetInnerHTML={{ __html: portrait(withDefaults(member), k, active) }} />
  )
}
