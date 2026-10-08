import type { CastMember } from '../content/types'

// Flat portrait drawn from a cast description (no book artwork is reused).

const SKIN = { light: '#f1d3ba', medium: '#d5a27b', dark: '#8f5c3d' }
const HAIR = { black: '#2a2a2c', brown: '#6b4a2f', blond: '#d6b26a', red: '#a65230', gray: '#b9b9b6', none: 'transparent' }
const TOP = { blue: '#3d5a80', red: '#9a4a3f', green: '#56704f', ochre: '#b38b3f', gray: '#6e7377', teal: '#3f7f7a' }
const BG = { blue: '#dfe6ee', red: '#f1e0dc', green: '#e2eadf', ochre: '#f1e8d6', gray: '#e6e6e4', teal: '#dcebe9' }

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

export function Avatar({ member, size = 56, active = false }: { member: CastMember; size?: number; active?: boolean }) {
  const a = withDefaults(member)
  const skin = SKIN[a.skin]
  const hair = HAIR[a.hair === 'none' ? 'none' : a.hair]
  const child = a.age === 'child'
  const old = a.age === 'old'
  // Children: bigger head relative to the body.
  const r = child ? 14.5 : 12.5
  const cy = child ? 30 : 28
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden
      className={`shrink-0 rounded-lg transition-transform duration-200 ${active ? 'scale-110 ring-[3px] ring-brand' : ''}`}>
      <rect width="64" height="64" rx="10" fill={BG[a.top]} />
      {/* long hair behind the shoulders */}
      {(a.hairStyle === 'long') && <path d={`M${32 - r - 2} ${cy - 2} Q${32 - r - 4} ${cy + 22} ${32 - r + 2} ${cy + 24} L${32 + r - 2} ${cy + 24} Q${32 + r + 4} ${cy + 22} ${32 + r + 2} ${cy - 2} Z`} fill={hair} />}
      {a.hairStyle === 'ponytail' && <ellipse cx={32 + r + 1} cy={cy + 6} rx="3.5" ry="9" fill={hair} />}
      {/* body */}
      <path d={child ? 'M14 64 C14 52 22 48 32 48 C42 48 50 52 50 64 Z' : 'M9 64 C9 50 19 45 32 45 C45 45 55 50 55 64 Z'} fill={TOP[a.top]} />
      <path d={`M27 ${child ? 47 : 44} Q32 ${child ? 51 : 49} 37 ${child ? 47 : 44}`} fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.5" />
      <rect x="28.5" y={cy + r - 4} width="7" height="8" rx="3" fill={skin} />
      {/* head */}
      <circle cx="32" cy={cy} r={r} fill={skin} />
      {/* hair on top */}
      {a.hairStyle !== 'bald' && a.hair !== 'none' && (
        <path d={`M${32 - r} ${cy + 1} C${32 - r} ${cy - r - 6} ${32 + r} ${cy - r - 6} ${32 + r} ${cy + 1} C${32 + r - 4} ${cy - 6} ${32 - r + 6} ${cy - 8} ${32 - r} ${cy + 1} Z`} fill={hair} />
      )}
      {a.hairStyle === 'bald' && old && <><ellipse cx={32 - r + 1} cy={cy + 1} rx="2" ry="4" fill={hair} /><ellipse cx={32 + r - 1} cy={cy + 1} rx="2" ry="4" fill={hair} /></>}
      {a.hairStyle === 'bun' && <circle cx="32" cy={cy - r - 2} r="5" fill={hair} />}
      {a.hairStyle === 'curly' && [-9, -4.5, 0, 4.5, 9].map((dx) => <circle key={dx} cx={32 + dx} cy={cy - r + 2 + Math.abs(dx) / 3} r="4.2" fill={hair} />)}
      {/* face */}
      <circle cx="27.5" cy={cy + 1} r={child ? 1.6 : 1.3} fill="#2a2a2c" />
      <circle cx="36.5" cy={cy + 1} r={child ? 1.6 : 1.3} fill="#2a2a2c" />
      <path d={`M28.5 ${cy + 6} Q32 ${cy + 8.5} 35.5 ${cy + 6}`} fill="none" stroke="#7a4a3a" strokeWidth="1.3" strokeLinecap="round" />
      {(child || a.gender === 'f') && <><circle cx="25" cy={cy + 4.5} r="1.8" fill="#e07a6a" opacity=".25" /><circle cx="39" cy={cy + 4.5} r="1.8" fill="#e07a6a" opacity=".25" /></>}
      {old && <path d={`M24 ${cy - 4} h4 M36 ${cy - 4} h4`} stroke="#000" strokeOpacity=".18" strokeWidth="1" />}
      {a.beard && <path d={`M${32 - r + 2} ${cy + 3} Q32 ${cy + r + 6} ${32 + r - 2} ${cy + 3} Q32 ${cy + 9} ${32 - r + 2} ${cy + 3} Z`} fill={hair === 'transparent' ? HAIR.gray : hair} />}
      {a.glasses && (
        <g fill="none" stroke="#2a2a2c" strokeWidth="1.2">
          <circle cx="27.5" cy={cy + 1} r="3.4" /><circle cx="36.5" cy={cy + 1} r="3.4" /><path d={`M30.9 ${cy + 1} h2.2`} />
        </g>
      )}
    </svg>
  )
}
