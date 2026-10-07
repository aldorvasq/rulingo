// Flat, muted illustrations for the path: one Russian place per chapter. Everything is drawn in a
// 400-unit-wide coordinate space; the horizon sits at HORIZON and lessons are spaced down the ground.
import type { ReactNode } from 'react'

export const W = 400
export const HORIZON = 190
export const FIRST_NODE = 268
export const STEP = 150

const C = {
  sky1: '#d6dde2', sky2: '#eef0eb', far: '#c7cec9', mid: '#aab5a9', ground: '#e6e2d4',
  road: '#efe9da', roadEdge: '#cdc3ab', roadLine: '#bdb090',
  tree: '#5d6e5a', tree2: '#76866d', trunk: '#6b5644',
  brick: '#9a4a3f', brickD: '#7b3a32', slate: '#4f6478', slateD: '#3d4f62', gold: '#b39250',
  cream: '#efe8d9', white: '#f8f5ee', moss: '#5f7a5a', green: '#4e6a55',
  wood: '#8a6b4f', woodD: '#6b523e', roof: '#6d7276', water: '#b9c7d0', water2: '#d4dde2',
  snow: '#f3f4f1', stone: '#dcd7cb', birch: '#a7b28c', birch2: '#909d78', ochre: '#c9ae6f',
}

export interface SceneInfo {
  place: string
  placeEs: string
  ground: string
  sky?: [string, string]
}

export const SCENES: Record<number, SceneInfo> = {
  1: { place: 'Москва́ · Кра́сная пло́щадь', placeEs: 'Moscú, la Plaza Roja', ground: '#e3dfd6' },
  2: { place: 'Санкт-Петербу́рг · Нева́', placeEs: 'San Petersburgo y el río Nevá', ground: '#e1ddd3' },
  3: { place: 'Дере́вня', placeEs: 'Una aldea rusa', ground: '#e4e5d3' },
  4: { place: 'Во́лга · Золото́е кольцо́', placeEs: 'El Volga y el Anillo de Oro', ground: '#e8e2cf' },
  5: { place: 'Байка́л · Транссиби́рская магистра́ль', placeEs: 'El lago Baikal y el Transiberiano', ground: '#e1e3d8', sky: ['#cfd8de', '#ecefed'] },
  6: { place: 'Камча́тка', placeEs: 'Los volcanes de Kamchatka', ground: '#eceeea', sky: ['#d3dbe1', '#eff1f0'] },
}

// ---------------------------------------------------------------- helpers

function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smooth curve through points (Catmull-Rom → cubic Bézier). */
export function smoothPath(pts: [number, number][]): string {
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`
  }
  return d
}

const hills = (y: number, amp: number, seed: number, fill: string) => {
  const r = rng(seed)
  const pts: string[] = [`M0,${y}`]
  for (let x = 0; x <= W; x += 50) pts.push(`Q${x + 25},${y - amp * (0.4 + r())} ${x + 50},${y - amp * 0.3 * r()}`)
  return <path d={`${pts.join(' ')} L${W},${HORIZON + 2} L0,${HORIZON + 2} Z`} fill={fill} />
}

// ---------------------------------------------------------------- primitives

function Onion({ x, y, w, fill, cross = true }: { x: number; y: number; w: number; fill: string; cross?: boolean }) {
  const h = w * 1.2
  return (
    <g>
      <path d={`M${x - w * 0.3},${y} C${x - w * 0.62},${y - h * 0.38} ${x - w * 0.46},${y - h * 0.74} ${x},${y - h} C${x + w * 0.46},${y - h * 0.74} ${x + w * 0.62},${y - h * 0.38} ${x + w * 0.3},${y} Z`} fill={fill} />
      {cross && (
        <g stroke={C.gold} strokeWidth={1.2}>
          <line x1={x} y1={y - h} x2={x} y2={y - h - w * 0.55} />
          <line x1={x - w * 0.15} y1={y - h - w * 0.38} x2={x + w * 0.15} y2={y - h - w * 0.38} />
        </g>
      )}
    </g>
  )
}

function Drum({ x, base, w, h, fill = C.cream, dome }: { x: number; base: number; w: number; h: number; fill?: string; dome: string }) {
  return (
    <g>
      <rect x={x - w * 0.3} y={base - h} width={w * 0.6} height={h} fill={fill} />
      <rect x={x - w * 0.34} y={base - h} width={w * 0.68} height={2.5} fill={C.brickD} opacity={0.5} />
      <Onion x={x} y={base - h} w={w} fill={dome} />
    </g>
  )
}

function Pine({ x, y, h = 34, fill = C.tree, snow = false }: { x: number; y: number; h?: number; fill?: string; snow?: boolean }) {
  const w = h * 0.5
  return (
    <g>
      <rect x={x - 1.5} y={y - h * 0.18} width={3} height={h * 0.18} fill={C.trunk} />
      {[0, 1, 2].map((i) => {
        const top = y - h + i * h * 0.24
        const bw = w * (0.55 + i * 0.25)
        return (
          <g key={i}>
            <polygon points={`${x},${top} ${x - bw / 2},${top + h * 0.38} ${x + bw / 2},${top + h * 0.38}`} fill={fill} />
            {snow && <polygon points={`${x},${top} ${x - bw / 5},${top + h * 0.12} ${x + bw / 5},${top + h * 0.12}`} fill={C.snow} />}
          </g>
        )
      })}
    </g>
  )
}

function Birch({ x, y, h = 42 }: { x: number; y: number; h?: number }) {
  return (
    <g>
      <rect x={x - 1.6} y={y - h} width={3.2} height={h} fill={C.white} />
      {[0.25, 0.45, 0.62, 0.8].map((t, i) => (
        <rect key={i} x={x - 1.6 + (i % 2) * 1.2} y={y - h * t} width={2} height={1.4} fill="#3b3b38" />
      ))}
      <ellipse cx={x - 4} cy={y - h * 0.82} rx={9} ry={12} fill={C.birch2} />
      <ellipse cx={x + 4} cy={y - h * 0.9} rx={9} ry={13} fill={C.birch} />
    </g>
  )
}

function RoundTree({ x, y, r = 11, fill = C.tree2 }: { x: number; y: number; r?: number; fill?: string }) {
  return (
    <g>
      <rect x={x - 1.5} y={y - r * 0.9} width={3} height={r * 0.9} fill={C.trunk} />
      <circle cx={x} cy={y - r * 1.5} r={r} fill={fill} />
      <circle cx={x - r * 0.35} cy={y - r * 1.75} r={r * 0.45} fill="#ffffff" opacity={0.08} />
    </g>
  )
}

function Lamp({ x, y }: { x: number; y: number }) {
  return (
    <g fill={C.slateD}>
      <rect x={x - 0.8} y={y - 30} width={1.6} height={30} />
      <rect x={x - 3} y={y - 2} width={6} height={2} />
      <rect x={x - 3} y={y - 36} width={6} height={7} rx={1} fill={C.gold} opacity={0.8} />
      <polygon points={`${x - 4},${y - 36} ${x},${y - 40} ${x + 4},${y - 36}`} />
    </g>
  )
}

function Izba({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const w = 30 * s
  const h = 18 * s
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} fill={C.wood} />
      {[0.25, 0.5, 0.75].map((t) => <line key={t} x1={x - w / 2} x2={x + w / 2} y1={y - h * t} y2={y - h * t} stroke={C.woodD} strokeWidth={0.8} />)}
      <polygon points={`${x - w / 2 - 3 * s},${y - h} ${x},${y - h - 14 * s} ${x + w / 2 + 3 * s},${y - h}`} fill={C.roof} />
      <rect x={x - 4 * s} y={y - h * 0.72} width={8 * s} height={8 * s} fill="#e9dfc6" stroke={C.white} strokeWidth={1.4 * s} />
      <polygon points={`${x - 5.5 * s},${y - h * 0.72} ${x},${y - h * 0.72 - 4 * s} ${x + 5.5 * s},${y - h * 0.72}`} fill={C.white} />
      <rect x={x + w * 0.22} y={y - h - 13 * s} width={3.5 * s} height={8 * s} fill={C.woodD} />
    </g>
  )
}

function Fence({ x, y, n = 6 }: { x: number; y: number; n?: number }) {
  return (
    <g stroke={C.woodD} strokeWidth={1.3}>
      {Array.from({ length: n }, (_, i) => <line key={i} x1={x + i * 5} x2={x + i * 5} y1={y} y2={y - 8} />)}
      <line x1={x - 1} x2={x + (n - 1) * 5 + 1} y1={y - 5} y2={y - 5} />
    </g>
  )
}

function Haystack({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 10},${y} Q${x - 9},${y - 18} ${x},${y - 20} Q${x + 9},${y - 18} ${x + 10},${y} Z`} fill={C.ochre} />
}

function Mountains({ y, fill, snowy, seed, amp = 70 }: { y: number; fill: string; snowy?: boolean; seed: number; amp?: number }) {
  const r = rng(seed)
  const peaks: [number, number][] = []
  for (let x = -20; x <= W + 40; x += 55 + r() * 30) peaks.push([x, y - amp * (0.5 + r() * 0.5)])
  return (
    <g>
      {peaks.map(([px, py], i) => (
        <g key={i}>
          <polygon points={`${px - 60},${y} ${px},${py} ${px + 60},${y}`} fill={fill} />
          {snowy && <polygon points={`${px - 14},${py + 14} ${px},${py} ${px + 14},${py + 14} ${px + 5},${py + 10} ${px},${py + 15} ${px - 6},${py + 10}`} fill={C.snow} />}
        </g>
      ))}
    </g>
  )
}

// ---------------------------------------------------------------- landmarks (sit on the horizon)

function Moscow() {
  const b = HORIZON
  const merlons = []
  for (let x = 0; x < 240; x += 9) merlons.push(<polygon key={x} points={`${x},${b - 20} ${x},${b - 27} ${x + 2.5},${b - 24} ${x + 5},${b - 27} ${x + 5},${b - 20}`} fill={C.brick} />)
  return (
    <g>
      {/* Stalinist high-rise in the haze */}
      <g fill="#c2c7c8">
        <rect x={352} y={b - 70} width={36} height={70} />
        <rect x={360} y={b - 98} width={20} height={28} />
        <rect x={365} y={b - 116} width={10} height={18} />
        <polygon points={`${366},${b - 116} ${370},${b - 140} ${374},${b - 116}`} />
      </g>
      {/* Kremlin wall */}
      <rect x={0} y={b - 20} width={240} height={20} fill={C.brick} />
      {merlons}
      {/* Nikolskaya-style tower */}
      <g>
        <rect x={34} y={b - 52} width={22} height={52} fill={C.brick} />
        <rect x={37} y={b - 66} width={16} height={14} fill={C.brickD} />
        <polygon points={`${36},${b - 66} ${45},${b - 100} ${54},${b - 66}`} fill={C.green} />
        <circle cx={45} cy={b - 103} r={2.5} fill={C.brick} />
      </g>
      {/* Spasskaya tower */}
      <g>
        <rect x={133} y={b - 64} width={34} height={64} fill={C.brick} />
        <rect x={130} y={b - 66} width={40} height={4} fill={C.brickD} />
        <rect x={137} y={b - 92} width={26} height={26} fill={C.brick} />
        <circle cx={150} cy={b - 79} r={7.5} fill={C.white} stroke={C.brickD} strokeWidth={1.5} />
        <line x1={150} y1={b - 79} x2={150} y2={b - 84} stroke={C.slateD} strokeWidth={1} />
        <rect x={141} y={b - 108} width={18} height={16} fill={C.cream} />
        <polygon points={`${140},${b - 108} ${150},${b - 158} ${160},${b - 108}`} fill={C.green} />
        <polygon points={`150,${b - 168} 152,${b - 163} 157,${b - 163} 153,${b - 160} 155,${b - 155} 150,${b - 158} 145,${b - 155} 147,${b - 160} 143,${b - 163} 148,${b - 163}`} fill={C.brick} />
        <rect x={145} y={b - 20} width={10} height={14} rx={5} fill={C.brickD} />
      </g>
      {/* St Basil's */}
      <g>
        <rect x={245} y={b - 30} width={104} height={30} fill={C.cream} />
        <rect x={245} y={b - 30} width={104} height={3} fill={C.brick} />
        {[255, 275, 295, 315, 335].map((x) => <rect key={x} x={x} y={b - 22} width={6} height={14} rx={3} fill={C.brick} opacity={0.75} />)}
        <rect x={290} y={b - 78} width={20} height={48} fill={C.cream} />
        <polygon points={`${289},${b - 78} ${300},${b - 128} ${311},${b - 78}`} fill={C.brick} />
        <Onion x={300} y={b - 128} w={9} fill={C.gold} />
        <Drum x={259} base={b - 30} w={21} h={30} dome={C.moss} />
        <Drum x={278} base={b - 30} w={24} h={46} dome={C.brick} />
        <Drum x={322} base={b - 30} w={24} h={44} dome={C.slate} />
        <Drum x={340} base={b - 30} w={20} h={28} dome={C.gold} />
      </g>
    </g>
  )
}

function Petersburg() {
  const b = HORIZON
  return (
    <g>
      {/* far bank: fortress wall + Peter and Paul cathedral */}
      <rect x={0} y={b - 44} width={210} height={14} fill="#c9c4b8" />
      <rect x={0} y={b - 46} width={210} height={2.5} fill="#b5ae9f" />
      <g>
        <rect x={60} y={b - 80} width={70} height={36} fill={C.cream} />
        {[66, 80, 94, 108, 122].map((x) => <rect key={x} x={x} y={b - 72} width={5} height={10} fill="#c8bda6" />)}
        <rect x={100} y={b - 120} width={18} height={76} fill={C.cream} />
        <rect x={103} y={b - 140} width={12} height={20} fill={C.cream} />
        <rect x={106} y={b - 152} width={6} height={12} fill={C.gold} />
        <polygon points={`${106},${b - 152} ${109},${b - 196} ${112},${b - 152}`} fill={C.gold} />
        <Onion x={78} y={b - 80} w={10} fill={C.slate} />
      </g>
      <g>{[10, 24, 150, 166, 182, 196].map((x, i) => <RoundTree key={i} x={x} y={b - 44} r={7} fill={C.mid} />)}</g>
      {/* the Neva */}
      <rect x={0} y={b - 30} width={W} height={30} fill={C.water} />
      {[[30, 12], [140, 20], [250, 8], [330, 18], [80, 24], [200, 26]].map(([x, dy], i) => (
        <rect key={i} x={x} y={b - 30 + dy} width={26} height={1.5} fill={C.water2} />
      ))}
      <g>
        <path d={`M150,${b - 12} L196,${b - 12} L190,${b - 6} L156,${b - 6} Z`} fill={C.slateD} />
        <polygon points={`${172},${b - 13} ${172},${b - 40} ${190},${b - 13}`} fill={C.white} />
        <polygon points={`${170},${b - 13} ${170},${b - 32} ${158},${b - 13}`} fill={C.cream} />
      </g>
      {/* Winter Palace on the near bank */}
      <g>
        <rect x={228} y={b - 74} width={172} height={44} fill="#9fb0a2" />
        <rect x={228} y={b - 76} width={172} height={4} fill="#87998a" />
        {Array.from({ length: 21 }, (_, i) => <rect key={i} x={232 + i * 8} y={b - 70} width={2} height={38} fill={C.white} opacity={0.85} />)}
        {Array.from({ length: 20 }, (_, i) => <rect key={i} x={235 + i * 8} y={b - 62} width={3} height={6} fill="#6f8274" />)}
        {Array.from({ length: 20 }, (_, i) => <rect key={`b${i}`} x={235 + i * 8} y={b - 48} width={3} height={7} fill="#6f8274" />)}
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={234 + i * 15} cy={b - 79} r={1.6} fill="#87998a" />)}
      </g>
      {/* granite embankment */}
      <rect x={0} y={b - 2} width={W} height={4} fill="#b8b1a3" />
    </g>
  )
}

function Village() {
  const b = HORIZON
  return (
    <g>
      {hills(b - 8, 30, 7, C.far)}
      <g opacity={0.9}>
        {Array.from({ length: 16 }, (_, i) => <Pine key={i} x={i * 26 + 8} y={b - 2} h={22 + (i % 3) * 5} fill={C.mid} />)}
      </g>
      {/* wooden church on the hill */}
      <g>
        <rect x={282} y={b - 46} width={40} height={46} fill={C.woodD} />
        {[0.2, 0.4, 0.6, 0.8].map((t) => <line key={t} x1={282} x2={322} y1={b - 46 * t} y2={b - 46 * t} stroke="#5a4433" strokeWidth={0.8} />)}
        <polygon points={`${278},${b - 46} ${302},${b - 62} ${326},${b - 46}`} fill={C.roof} />
        <rect x={294} y={b - 82} width={16} height={22} fill={C.woodD} />
        <Onion x={302} y={b - 82} w={13} fill="#a5adb1" />
        <Drum x={286} base={b - 50} w={10} h={8} fill={C.woodD} dome="#a5adb1" />
        <Drum x={318} base={b - 50} w={10} h={8} fill={C.woodD} dome="#a5adb1" />
      </g>
      <Izba x={70} y={b} s={0.9} />
      <Izba x={130} y={b + 2} s={0.75} />
      <Izba x={370} y={b + 1} s={0.8} />
    </g>
  )
}

function Volga() {
  const b = HORIZON
  return (
    <g>
      {hills(b - 20, 24, 11, C.far)}
      {/* white-stone church with gold domes */}
      <g>
        <rect x={70} y={b - 66} width={48} height={42} fill={C.white} />
        <rect x={70} y={b - 66} width={48} height={3} fill={C.stone} />
        {[78, 90, 102].map((x) => <rect key={x} x={x} y={b - 56} width={6} height={14} rx={3} fill={C.stone} />)}
        <Drum x={94} base={b - 66} w={22} h={16} fill={C.white} dome={C.gold} />
        <Drum x={76} base={b - 66} w={12} h={8} fill={C.white} dome={C.slate} />
        <Drum x={112} base={b - 66} w={12} h={8} fill={C.white} dome={C.slate} />
        <rect x={130} y={b - 92} width={14} height={68} fill={C.white} />
        <polygon points={`${129},${b - 92} ${137},${b - 118} ${145},${b - 92}`} fill={C.green} />
      </g>
      {/* the Volga with a steamboat */}
      <rect x={0} y={b - 24} width={W} height={24} fill={C.water} />
      {[[20, 8], [160, 16], [300, 6], [360, 18]].map(([x, dy], i) => <rect key={i} x={x} y={b - 24 + dy} width={30} height={1.5} fill={C.water2} />)}
      <g>
        <path d={`M240,${b - 12} L320,${b - 12} L312,${b - 4} L248,${b - 4} Z`} fill={C.white} />
        <rect x={252} y={b - 22} width={52} height={10} fill={C.cream} />
        {[256, 266, 276, 286, 296].map((x) => <rect key={x} x={x} y={b - 19} width={5} height={4} fill={C.slate} />)}
        <rect x={290} y={b - 34} width={6} height={12} fill={C.brick} />
      </g>
    </g>
  )
}

function Baikal() {
  const b = HORIZON
  return (
    <g>
      <Mountains y={b - 18} fill="#aab6c0" snowy seed={21} amp={90} />
      <rect x={0} y={b - 30} width={W} height={18} fill={C.water} />
      {[[40, 6], [200, 10], [330, 4]].map(([x, dy], i) => <rect key={i} x={x} y={b - 30 + dy} width={34} height={1.5} fill={C.water2} />)}
      <g opacity={0.95}>
        {Array.from({ length: 18 }, (_, i) => <Pine key={i} x={i * 23 + 6} y={b - 6} h={20 + (i % 4) * 4} fill={C.tree} />)}
      </g>
      {/* Trans-Siberian train */}
      <rect x={0} y={b - 3} width={W} height={2} fill="#7c7466" />
      <g>
        <rect x={60} y={b - 17} width={34} height={13} rx={2} fill={C.brick} />
        <rect x={84} y={b - 24} width={10} height={8} fill={C.brickD} />
        {[100, 140, 180, 220].map((x) => (
          <g key={x}>
            <rect x={x} y={b - 16} width={36} height={12} rx={1.5} fill={C.slate} />
            {[4, 12, 20, 28].map((dx) => <rect key={dx} x={x + dx} y={b - 13} width={5} height={4} fill={C.cream} />)}
          </g>
        ))}
      </g>
    </g>
  )
}

function Kamchatka() {
  const b = HORIZON
  const volcano = (x: number, h: number, w: number, fill: string) => (
    <g>
      <polygon points={`${x - w},${b} ${x - 10},${b - h} ${x + 10},${b - h} ${x + w},${b}`} fill={fill} />
      <polygon points={`${x - 26},${b - h + 34} ${x - 10},${b - h} ${x + 10},${b - h} ${x + 26},${b - h + 34} ${x + 12},${b - h + 26} ${x},${b - h + 36} ${x - 12},${b - h + 26}`} fill={C.snow} />
    </g>
  )
  return (
    <g>
      {[0, 1, 2].map((i) => <circle key={i} cx={130 + i * 9} cy={b - 160 - i * 14} r={8 + i * 4} fill="#d9dde0" />)}
      {volcano(270, 120, 110, '#9da7ad')}
      {volcano(120, 150, 120, '#8e989f')}
      <g>{Array.from({ length: 16 }, (_, i) => <Pine key={i} x={i * 26 + 10} y={b - 2} h={18 + (i % 3) * 5} fill={C.tree} snow />)}</g>
    </g>
  )
}

const LANDMARKS: Record<number, () => ReactNode> = { 1: Moscow, 2: Petersburg, 3: Village, 4: Volga, 5: Baikal, 6: Kamchatka }

// ---------------------------------------------------------------- ground decoration per chapter

type Deco = (x: number, y: number, r: () => number) => ReactNode

const DECOR: Record<number, Deco[]> = {
  1: [(x, y) => <Lamp x={x} y={y} />, (x, y, r) => <RoundTree x={x} y={y} r={10 + r() * 4} />, (x, y, r) => <RoundTree x={x} y={y} r={9 + r() * 3} fill={C.tree} />],
  2: [(x, y) => <Lamp x={x} y={y} />, (x, y, r) => <RoundTree x={x} y={y} r={10 + r() * 4} />],
  3: [(x, y, r) => <Birch x={x} y={y} h={38 + r() * 12} />, (x, y) => <Izba x={x} y={y} s={0.85} />, (x, y) => <Haystack x={x} y={y} />, (x, y) => <Fence x={x - 12} y={y} />],
  4: [(x, y) => <Haystack x={x} y={y} />, (x, y, r) => <RoundTree x={x} y={y} r={10 + r() * 3} />, (x, y) => <Izba x={x} y={y} s={0.8} />],
  5: [(x, y, r) => <Pine x={x} y={y} h={34 + r() * 12} />, (x, y, r) => <Birch x={x} y={y} h={36 + r() * 10} />],
  6: [(x, y, r) => <Pine x={x} y={y} h={32 + r() * 12} snow />, (x, y) => <Izba x={x} y={y} s={0.75} />],
}

export function sceneHeight(nLessons: number) {
  return FIRST_NODE + (nLessons - 1) * STEP + 95
}

/** Node positions: a gentle zig-zag down the ground. */
export function nodePositions(n: number, offset = 0): [number, number][] {
  const xs = [200, 285, 200, 115]
  return Array.from({ length: n }, (_, i) => [xs[(i + offset) % 4], FIRST_NODE + i * STEP])
}

export function Scene({ chapter, nodes, height }: { chapter: number; nodes: [number, number][]; height: number }) {
  const info = SCENES[chapter] ?? SCENES[3]
  const [s1, s2] = info.sky ?? [C.sky1, C.sky2]
  const Landmark = LANDMARKS[chapter] ?? Village
  const decor = DECOR[chapter] ?? DECOR[3]
  const r = rng(chapter * 97)

  const road: [number, number][] = [[200, HORIZON + 4], ...nodes, [nodes.length ? 400 - nodes[nodes.length - 1][0] : 200, height + 20]]
  const roadD = smoothPath(road)

  // Decorations: the free side of each stretch of road, plus both far edges (the road never reaches them).
  const placed: { y: number; el: ReactNode }[] = []
  const place = (key: string, x: number, y: number, scale = 1.3) => {
    const deco = decor[Math.floor(r() * decor.length)]
    placed.push({ y, el: <g key={key} transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}>{deco(x, y, r)}</g> })
  }
  nodes.forEach(([nx, ny], i) => {
    const freeLeft = nx >= 200
    place(`a${i}`, freeLeft ? 50 + r() * 30 : 320 + r() * 30, ny + 4 + r() * 12)
    place(`e${i}`, freeLeft ? 372 + r() * 14 : 16 + r() * 14, ny - 30 + r() * 30, 1.1)
    if (ny + STEP / 2 < height - 40) {
      place(`b${i}`, freeLeft ? 22 + r() * 30 : 340 + r() * 34, ny + STEP / 2 + 14 + r() * 10)
    }
  })
  // Painter's order: things further down the screen are closer, so draw them last.
  const items = placed.sort((a, b) => a.y - b.y).map((p) => p.el)

  // Faint ground patches so the land doesn't read as a flat fill.
  const patches = Array.from({ length: 14 }, (_, i) => (
    <ellipse key={i} cx={r() * W} cy={HORIZON + 30 + r() * (height - HORIZON - 40)} rx={30 + r() * 40} ry={6 + r() * 6} fill="#000" opacity={0.035} />
  ))

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="scene absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMin slice" aria-hidden>
      <defs>
        <linearGradient id={`sky${chapter}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s1} />
          <stop offset="1" stopColor={s2} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={HORIZON} fill={`url(#sky${chapter})`} />
      <g fill="#ffffff" opacity={0.55}>
        <ellipse cx={70} cy={50} rx={34} ry={8} />
        <ellipse cx={300} cy={34} rx={42} ry={9} />
        <ellipse cx={210} cy={80} rx={26} ry={6} />
      </g>
      <rect x={0} y={HORIZON} width={W} height={height - HORIZON} fill={info.ground} />
      {patches}
      <Landmark />
      <path d={roadD} fill="none" stroke={C.roadEdge} strokeWidth={34} strokeLinecap="round" />
      <path d={roadD} fill="none" stroke={C.road} strokeWidth={29} strokeLinecap="round" />
      <path d={roadD} fill="none" stroke={C.roadLine} strokeWidth={1.6} strokeDasharray="7 9" />
      {items}
    </svg>
  )
}
