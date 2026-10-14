import { useEffect, useMemo, useRef } from 'react'
import { chapters, colorFor, compareLessonIds, type LoadedChapter } from '../content'
import { useStore } from '../state/store'
import { lessonMastery, MASTERED } from '../state/mastery'
import { navigate } from '../lib/router'
import { Icon } from '../components/ui'
import { StreakBadge } from './Home'
import { Scene, SCENES, W as SCENE_W, nodePositions, sceneHeight } from './scenes'
import { CAP, MURALS, W, type Mural } from '../murals'
import { PAINTED, type PaintedMural } from '../murals/overlays'

// The route is one long road that climbs: chapter 1 at the bottom, the newest chapter at the top and the
// road's end above it. Each chapter is a mural; lessons are raised blocks on the road.

const svgCache = new Map<Mural, string>()
const svgOf = (m: Mural) => {
  let s = svgCache.get(m)
  if (!s) svgCache.set(m, (s = m.svg()))
  return s
}

/** A painted mural with its animated layer, or the SVG mural where there's no painting yet. */
function MuralArt({ mural, painted }: { mural: Mural; painted?: PaintedMural }) {
  const overlay = useMemo(() => painted?.overlay() ?? '', [painted])
  const html = useMemo(() => (painted ? '' : svgOf(mural)), [mural, painted])
  if (painted) {
    return (
      <>
        <img src={painted.image} alt="" decoding="async" className="absolute inset-0 h-full w-full select-none" draggable={false} />
        <div className="pointer-events-none absolute inset-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: overlay }} />
      </>
    )
  }
  return <div className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: html }} />
}

const pct = (x: number, y: number, h: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / h) * 100}%` })

export function Path() {
  const progress = useStore((s) => s.progress)
  const { coveredUpTo, focusLessons } = useStore((s) => s.settings)
  const here = useRef<HTMLButtonElement>(null)

  // Open on the lesson the learner is on (the route starts at the bottom).
  useEffect(() => {
    if (here.current) here.current.scrollIntoView({ block: 'center' })
    else window.scrollTo(0, document.body.scrollHeight)
  }, [])

  const newest = chapters[chapters.length - 1]?.chapter
  const block = (state: 'open' | 'done' | 'locked' | 'goal', content: React.ReactNode, current = false) => (
    <div className={`route-block route-${state} ${current ? 'route-current' : ''}`}>
      <div className="route-side" />
      <div className="route-face">{content}</div>
      {current && <span className="absolute -top-3 -right-4 z-10 rounded-sm bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">Aquí</span>}
    </div>
  )

  const chapterOnMural = (c: LoadedChapter, m: Mural) => {
    const color = colorFor(c.chapter)
    const allDone = c.lessons.every((l) => lessonMastery(l, progress) >= MASTERED)
    return (
      <section key={c.chapter} className="mural relative w-full" style={{ aspectRatio: `${W} / ${m.height}` }}>
        <MuralArt mural={m} painted={PAINTED[`ch${c.chapter}`]} />
        {/* soft mist over the seam with the chapter below (paintings of neighbouring chapters differ slightly in tone) */}
        {c.chapter > 1 && PAINTED[`ch${c.chapter}`] && <div className="mural-seam" style={{ bottom: 0 }} />}
        {c.lessons.map((l, i) => {
          const pos = m.nodes[i] ?? m.nodes[m.nodes.length - 1]
          const locked = compareLessonIds(l.id, coveredUpTo) > 0
          const mastery = lessonMastery(l, progress)
          const current = focusLessons.includes(l.id)
          return (
            <button key={l.id} ref={current ? here : undefined} onClick={() => navigate(`/lesson/${l.id}`)}
              className="absolute z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={pct(pos[0], pos[1], m.height)}>
              {block(locked ? 'locked' : mastery >= MASTERED ? 'done' : 'open', locked ? <Icon name="lock" size={20} /> : mastery >= MASTERED ? <Icon name="star" size={24} /> : l.id, current)}
              <div className={`mt-1.5 w-max max-w-40 rounded-sm px-2 py-1 text-center shadow-md ${current ? 'border border-brand bg-card' : 'bg-card/95'}`}>
                <div className="ru text-[15px] font-bold leading-tight text-ink">{l.title}</div>
                {l.titleEs && <div className="text-[11px] leading-tight text-muted">{l.titleEs}</div>}
                {!locked && (
                  <div className="mx-auto mt-1 h-1 w-16 overflow-hidden rounded-sm bg-line">
                    <div className="h-full bg-gold" style={{ width: `${mastery * 100}%` }} />
                  </div>
                )}
              </div>
            </button>
          )
        })}
        {/* the chapter's landmark */}
        <div className="absolute z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={pct(m.goal[0], m.goal[1], m.height)}>
          {block(allDone ? 'done' : 'goal', allDone ? <Icon name="star" size={28} /> : <span className="text-2xl leading-none">♜</span>)}
          <div className="mt-1.5 w-max rounded-sm bg-card/95 px-2 py-1 text-center shadow-md">
            <div className="ru text-[15px] font-bold leading-tight text-ink">{m.goalLabel.ru}</div>
            <div className="text-[11px] leading-tight text-muted">{allDone ? '¡Capítulo dominado!' : `Meta del capítulo ${c.chapter}`}</div>
          </div>
        </div>
        {/* signpost where the chapter begins */}
        <div className="absolute z-[1] -translate-x-1/2 -translate-y-full" style={pct(m.sign[0], m.sign[1], m.height)}>
          <div className="max-w-44 rounded-sm px-3 py-2 shadow-lg" style={{ background: color.bg, color: color.fg }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-80">Capítulo {c.chapter}</div>
            <div className="ru text-lg font-bold leading-tight">{c.title}</div>
            {c.titleEs && <div className="text-xs leading-snug opacity-90">{c.titleEs}</div>}
          </div>
          <div className="mx-auto h-5 w-1.5 bg-[#6a5040]" />
        </div>
      </section>
    )
  }

  // Chapters without a mural yet keep the earlier scene illustration.
  let offset = 0
  const offsets = new Map(chapters.map((c) => { const o = offset; offset += c.lessons.length; return [c.chapter, o] }))
  const chapterOnScene = (c: LoadedChapter) => {
    const color = colorFor(c.chapter)
    const scene = SCENES[c.chapter]
    const height = sceneHeight(c.lessons.length)
    const nodes = nodePositions(c.lessons.length, offsets.get(c.chapter) ?? 0)
    return (
      <section key={c.chapter}>
        <div className="relative w-full" style={{ aspectRatio: `${SCENE_W} / ${height}` }}>
          <Scene chapter={c.chapter} nodes={nodes} height={height} />
          {c.lessons.map((l, i) => {
            const [x, y] = nodes[nodes.length - 1 - i]
            const locked = compareLessonIds(l.id, coveredUpTo) > 0
            const mastery = lessonMastery(l, progress)
            const current = focusLessons.includes(l.id)
            return (
              <button key={l.id} ref={current ? here : undefined} onClick={() => navigate(`/lesson/${l.id}`)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${(x / SCENE_W) * 100}%`, top: `${(y / height) * 100}%` }}>
                {block(locked ? 'locked' : mastery >= MASTERED ? 'done' : 'open', locked ? <Icon name="lock" size={20} /> : l.id, current)}
                <div className="mt-1.5 w-max max-w-40 rounded-sm bg-card/95 px-2 py-1 text-center shadow-sm">
                  <div className="ru text-[15px] font-bold leading-tight text-ink">{l.title}</div>
                </div>
              </button>
            )
          })}
        </div>
        <div className="px-4 py-3" style={{ background: color.bg, color: color.fg }}>
          <div className="text-xs font-bold uppercase tracking-[0.12em] opacity-80">Capítulo {c.chapter}</div>
          <div className="ru text-2xl font-bold leading-tight">{c.title}</div>
          {scene && <div className="text-xs opacity-85"><span className="ru">{scene.place}</span> · {scene.placeEs}</div>}
        </div>
      </section>
    )
  }

  return (
    <div className="mx-auto max-w-xl pb-24">
      <div className="pt-safe sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold">Ruta del libro</h1>
        <StreakBadge />
      </div>
      {newest !== undefined && MURALS[newest] && (
        <section className="mural relative w-full" style={{ aspectRatio: `${W} / ${CAP.height}` }}><MuralArt mural={CAP} painted={PAINTED.cap} /><div className="mural-seam" style={{ bottom: 0 }} /></section>
      )}
      {[...chapters].reverse().map((c) => (MURALS[c.chapter] ? chapterOnMural(c, MURALS[c.chapter]) : chapterOnScene(c)))}
      {chapters.length === 0 && <p className="p-6 text-center text-muted">Aún no hay contenido cargado.</p>}
    </div>
  )
}
