import '@fontsource/marck-script/cyrillic-400.css'
import '@fontsource/bad-script/cyrillic-400.css'
import '@fontsource/caveat/cyrillic-500.css'
import '@fontsource/great-vibes/cyrillic-400.css'
import '@fontsource/comforter/cyrillic-400.css'
import { stripStress } from '../lib/text'

// Russian handwriting: five "hands" from neat school cursive to a quick scrawl, each rendered with small
// seeded variations (slant, wobble, weight, ink) so the same word never looks exactly the same twice —
// but stays the same while one exercise is on screen.

export interface Hand { font: string; size: number; weight: number; label: string }

export const HANDS: Hand[] = [
  { font: 'Marck Script', size: 1, weight: 400, label: 'escolar' },
  { font: 'Bad Script', size: 0.9, weight: 400, label: 'cotidiana' },
  { font: 'Great Vibes', size: 1.05, weight: 400, label: 'elegante' },
  { font: 'Caveat', size: 1.05, weight: 500, label: 'rápida' },
  { font: 'Comforter', size: 1.15, weight: 400, label: 'garabato' },
]

/** Hands by difficulty: level 1 = clear school cursive … level 3 = quick adult handwriting. */
const BY_LEVEL: Record<1 | 2 | 3, number[]> = { 1: [0, 0, 1], 2: [1, 2, 3], 3: [3, 4, 2] }
export const handFor = (level: 1 | 2 | 3, seed: number) => BY_LEVEL[level][seed % 3]

function rng(seed: number) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const INKS = ['#24406b', '#1f2a44', '#203a5c', '#2b3346']

export function Handwriting({ text, hand, seed, size = 34 }: { text: string; hand: number; seed: number; size?: number }) {
  const h = HANDS[hand % HANDS.length]
  const r = rng(seed)
  const ink = INKS[Math.floor(r() * INKS.length)]
  const slant = -7 + r() * 10
  // Handwriting has no stress marks, and these fonts don't place them well anyway.
  const chars = [...stripStress(text)]
  return (
    <span lang="ru" className="inline-block whitespace-pre-wrap"
      style={{ fontFamily: `'${h.font}', cursive`, fontWeight: h.weight, fontSize: size * h.size, color: ink, lineHeight: 1.25,
        transform: `skewX(${slant.toFixed(1)}deg)`, WebkitTextStroke: `${(r() * 0.3).toFixed(2)}px ${ink}` }}>
      {chars.map((c, i) => (
        <span key={i} className="inline-block"
          style={{ transform: `translateY(${(r() * 2.4 - 1.2).toFixed(1)}px) rotate(${(r() * 4 - 2).toFixed(1)}deg)` }}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  )
}

/** A word or note on lined notebook paper. */
export function Paper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`paper rounded-sm border border-line px-4 pb-3 pt-2 pl-11 ${className}`}>{children}</div>
}
