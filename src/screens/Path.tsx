import { chapters, colorFor, compareLessonIds } from '../content'
import { useStore } from '../state/store'
import { lessonMastery, MASTERED } from '../state/mastery'
import { navigate } from '../lib/router'
import { Icon } from '../components/ui'
import { StreakBadge } from './Home'
import { Scene, SCENES, W, nodePositions, sceneHeight } from './scenes'

export function Path() {
  const progress = useStore((s) => s.progress)
  const { coveredUpTo, focusLessons } = useStore((s) => s.settings)
  let offset = 0

  return (
    <div className="mx-auto max-w-xl pb-24">
      <div className="pt-safe sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold">Ruta del libro</h1>
        <StreakBadge />
      </div>

      {chapters.map((c) => {
        const color = colorFor(c.chapter)
        const scene = SCENES[c.chapter]
        const height = sceneHeight(c.lessons.length)
        const nodes = nodePositions(c.lessons.length, offset)
        offset += c.lessons.length
        return (
          <section key={c.chapter}>
            <div className="px-4 py-3" style={{ background: color.bg, color: color.fg }}>
              <div className="text-xs font-bold uppercase tracking-[0.12em] opacity-80">Capítulo {c.chapter}</div>
              <div className="ru text-2xl font-bold leading-tight">{c.title}</div>
              {c.titleEs && <div className="text-sm opacity-90">{c.titleEs}</div>}
              {scene && (
                <div className="mt-2 border-t border-white/25 pt-1.5 text-xs opacity-85">
                  <span className="ru text-[13px]">{scene.place}</span> · {scene.placeEs}
                </div>
              )}
            </div>

            <div className="relative w-full" style={{ aspectRatio: `${W} / ${height}` }}>
              <Scene chapter={c.chapter} nodes={nodes} height={height} />
              {c.lessons.map((l, i) => {
                const [x, y] = nodes[i]
                const locked = compareLessonIds(l.id, coveredUpTo) > 0
                const m = lessonMastery(l, progress)
                const current = focusLessons.includes(l.id)
                return (
                  <button key={l.id} onClick={() => navigate(`/lesson/${l.id}`)}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                    style={{ left: `${(x / W) * 100}%`, top: `${(y / height) * 100}%` }}>
                    <div className="relative grid h-14 w-14 place-items-center rounded-md border-[3px] border-[#fffdf8] text-lg font-bold shadow-[0_3px_8px_rgba(0,0,0,0.25)]"
                      style={{ background: locked ? '#b9b6ae' : color.bg, color: '#fff' }}>
                      {locked ? <Icon name="lock" size={20} /> : m >= MASTERED ? <Icon name="star" size={24} /> : l.id}
                      {current && <span className="absolute -top-2.5 -right-2.5 rounded-sm bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-white shadow">Aquí</span>}
                    </div>
                    <div className={`mt-1.5 w-max max-w-40 rounded-sm px-2 py-1 text-center shadow-sm ${current ? 'border border-brand bg-card' : 'bg-card/90'}`}>
                      <div className="ru text-[15px] font-bold leading-tight text-ink">{l.title}</div>
                      {!locked && (
                        <div className="mx-auto mt-1 h-1 w-16 overflow-hidden rounded-sm bg-line">
                          <div className="h-full bg-gold" style={{ width: `${m * 100}%` }} />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
      {chapters.length === 0 && <p className="p-6 text-center text-muted">Aún no hay contenido cargado.</p>}
    </div>
  )
}
