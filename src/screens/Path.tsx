import { chapters, colorFor, compareLessonIds } from '../content'
import { useStore } from '../state/store'
import { lessonMastery, MASTERED } from '../state/mastery'
import { navigate } from '../lib/router'
import { StatusBar } from './Home'

const OFFSETS = [0, 52, 72, 52, 0, -52, -72, -52]

export function Path() {
  const progress = useStore((s) => s.progress)
  const { coveredUpTo, focusLessons } = useStore((s) => s.settings)
  let n = 0

  return (
    <div className="mx-auto max-w-xl pb-28">
      <div className="pt-safe sticky top-0 z-20 border-b-2 border-line bg-bg/90 px-4 py-3 backdrop-blur">
        <StatusBar />
      </div>
      {chapters.map((c) => {
        const color = colorFor(c.chapter)
        return (
          <section key={c.chapter} className="px-4 pt-6">
            <div className="rounded-2xl p-4" style={{ background: color.bg, color: color.fg }}>
              <div className="text-xs font-extrabold uppercase tracking-widest opacity-80">Capítulo {c.chapter}</div>
              <div className="ru text-xl font-extrabold">{c.title}</div>
              {c.titleEs && <div className="text-sm font-semibold opacity-90">{c.titleEs}</div>}
            </div>
            <div className="flex flex-col items-center gap-5 py-6">
              {c.lessons.map((l) => {
                const locked = compareLessonIds(l.id, coveredUpTo) > 0
                const m = lessonMastery(l, progress)
                const isFocus = focusLessons.includes(l.id)
                const offset = OFFSETS[n++ % OFFSETS.length]
                const deg = Math.round(m * 360)
                return (
                  <button key={l.id} onClick={() => navigate(`/lesson/${l.id}`)}
                    className="flex flex-col items-center gap-1" style={{ transform: `translateX(${offset}px)` }}>
                    <div className="relative">
                      {isFocus && <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 animate-bounce rounded-lg bg-card px-2 py-0.5 text-[10px] font-extrabold uppercase text-brand shadow">Ahora</span>}
                      <div className="grid h-20 w-20 place-items-center rounded-full p-1.5"
                        style={{ background: locked ? 'var(--line)' : `conic-gradient(var(--gold) ${deg}deg, var(--line) 0)` }}>
                        <div className="grid h-full w-full place-items-center rounded-full text-2xl font-extrabold"
                          style={{
                            background: locked ? 'var(--soft)' : color.bg,
                            color: locked ? 'var(--muted)' : color.fg,
                            boxShadow: locked ? 'none' : `0 5px 0 color-mix(in srgb, ${color.bg} 70%, black)`,
                          }}>
                          {locked ? '🔒' : m >= MASTERED ? '👑' : l.id}
                        </div>
                      </div>
                    </div>
                    <div className="ru max-w-40 text-center text-sm font-bold leading-tight">{l.title}</div>
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
