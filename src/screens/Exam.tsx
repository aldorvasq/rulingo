import { useMemo } from 'react'
import { colorFor } from '../content'
import { EXAMS, daysUntil, examChapter, examDateEs, examTopics, upcomingExam } from '../content/exams'
import { useStore } from '../state/store'
import { lessonMastery } from '../state/mastery'
import { navigate } from '../lib/router'
import { Icon, ProgressBar, Section, TopicTitle } from '../components/ui'
import { topicMastery } from '../components/TopicList'
import { StreakBadge } from './Home'

// Exam prep for one chapter: what's in it and how ready the learner is (honest: unseen counts as 0),
// an intensive mixed review, practice per grammar point and a mock exam.

export const pct = (x: number) => `${Math.round(x * 100)}%`
export const grade10 = (correct: number, total: number) => (total ? Math.round((correct / total) * 100) / 10 : 0)

export function Exam() {
  const progress = useStore((s) => s.progress)
  const mocks = useStore((s) => s.mocks)
  const exam = upcomingExam() ?? EXAMS[EXAMS.length - 1]
  const ch = exam && examChapter(exam)
  const topics = useMemo(() => (exam ? examTopics(exam) : []), [exam])
  if (!exam || !ch) return <div className="p-6 text-center text-muted">No hay ningún examen programado.</div>

  const color = colorFor(ch.chapter)
  const days = daysUntil(exam)
  const ready = topics.map((g) => ({ g, m: topicMastery(g.lessonId, g.id, progress) }))
  const overall = ready.length ? ready.reduce((a, r) => a + r.m, 0) / ready.length : 0
  // Only once there's something to compare: with nothing practised every topic is equally at 0.
  const weakest = ready.some((r) => r.m > 0) ? [...ready].sort((a, b) => a.m - b.m).slice(0, 3).filter((r) => r.m < 0.75) : []
  const history = mocks[ch.chapter] ?? []
  const last = history.at(-1)
  const best = history.reduce((b, r) => Math.max(b, r.total ? r.correct / r.total : 0), 0)

  return (
    <div className="mx-auto max-w-xl px-4 pb-28">
      <div className="pt-safe flex items-center justify-between py-3">
        <h1 className="text-lg font-bold">Examen</h1>
        <StreakBadge />
      </div>

      {/* The exam */}
      <section className="rise overflow-hidden rounded-xl" style={{ background: color.bg, color: color.fg }}>
        <div className="p-5">
          <div className="text-xs font-bold uppercase tracking-[0.12em] opacity-80">
            {days > 1 ? `Faltan ${days} días` : days === 1 ? 'Es mañana' : days === 0 ? '¡Es hoy!' : 'Ya pasó'}
          </div>
          <div className="mt-1 text-2xl font-bold leading-tight">{exam.title}</div>
          <div className="ru text-lg opacity-95">«{ch.title}»</div>
          <div className="mt-1 text-sm opacity-85">{examDateEs(exam)} · lecciones {ch.lessons[0]?.id}–{ch.lessons.at(-1)?.id}</div>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="opacity-85">Preparación</span>
            <div className="h-2 flex-1 overflow-hidden rounded-sm bg-white/25"><div className="h-full bg-white" style={{ width: pct(overall) }} /></div>
            <span className="font-bold tabular-nums">{pct(overall)}</span>
          </div>
          <p className="mt-1 text-xs opacity-80">Promedio de dominio de los {topics.length} temas del capítulo (lo que no has practicado cuenta como 0).</p>
        </div>
      </section>

      {/* Mock exam */}
      <section className="card rise mt-4 p-5" style={{ animationDelay: '80ms' }}>
        <div className="flex items-center gap-2 text-brand">
          <Icon name="exam" size={22} />
          <span className="text-lg font-bold">Simulacro de examen</span>
        </div>
        <p className="mt-1 text-[15px] text-muted">
          Unas 37 preguntas de todo el capítulo, como en un examen: vocabulario, gramática, verbos, frases, lectura y comprensión auditiva.
          No verás si acertaste hasta el final; ahí tendrás tu calificación y qué repasar.
        </p>
        {last && (
          <div className="mt-3 flex items-center gap-4 rounded-md bg-soft px-3 py-2 text-sm">
            <span>Último: <b className="tabular-nums">{grade10(last.correct, last.total)}</b>/10</span>
            <span>Mejor: <b className="tabular-nums">{Math.round(best * 100) / 10}</b>/10</span>
            <span className="text-muted">{history.length} {history.length === 1 ? 'intento' : 'intentos'}</span>
          </div>
        )}
        <button className="btn btn-primary mt-4 w-full" onClick={() => navigate(`/exam/mock?chapter=${ch.chapter}`)}>
          <Icon name="play" size={18} /> {history.length ? 'Hacer otro simulacro' : 'Empezar el simulacro'}
        </button>
      </section>

      {/* Intensive review */}
      <section className="card rise mt-3 p-5" style={{ animationDelay: '140ms' }}>
        <div className="flex items-center gap-2 text-brick">
          <Icon name="repeat" size={22} />
          <span className="text-lg font-bold">Repaso intensivo</span>
        </div>
        <p className="mt-1 text-[15px] text-muted">20 ejercicios con respuesta inmediata, de todas las lecciones y temas del capítulo, empezando por lo que más te cuesta.</p>
        {weakest.length > 0 && (
          <p className="mt-2 text-sm"><span className="font-bold">Para reforzar: </span>{weakest.map((r, i) => <span key={r.g.id}>{i ? ' · ' : ''}<TopicTitle title={r.g.title} /></span>)}</p>
        )}
        <button className="btn btn-ghost mt-4 w-full" onClick={() => navigate(`/play?mode=exam&chapter=${ch.chapter}`)}>Repasar todo el capítulo {ch.chapter}</button>
      </section>

      {/* Syllabus with readiness per grammar point */}
      <Section id="exam-topics" title="Qué entra en el examen" hint="Toca un tema para practicarlo solo" accent={color.bg}>
        <div className="space-y-3">
          {ch.lessons.map((l) => {
            const rows = ready.filter((r) => r.g.lessonId === l.id)
            return (
              <div key={l.id} className="card overflow-hidden">
                <button className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left hover:bg-soft" onClick={() => navigate(`/lesson/${l.id}`)}>
                  <span className="text-sm font-bold text-muted">{l.id}</span>
                  <span className="ru min-w-0 flex-1 truncate font-bold">{l.title}</span>
                  <span className="text-xs tabular-nums text-muted">{pct(lessonMastery(l, progress))}</span>
                  <Icon name="chevron" size={16} className="shrink-0 text-muted" />
                </button>
                <div className="divide-y divide-line">
                  {rows.map(({ g, m }) => (
                    <button key={g.id} onClick={() => navigate(`/play?mode=topic&id=${l.id}&topic=${encodeURIComponent(g.id)}`)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-soft">
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] leading-snug"><TopicTitle title={g.title} /></div>
                        <div className="mt-1 flex items-center gap-2">
                          <ProgressBar value={m} color={m >= 0.75 ? 'var(--ok)' : m >= 0.4 ? 'var(--gold)' : 'var(--brick)'} className="!h-1.5 max-w-24" />
                          <span className="text-xs tabular-nums text-muted">{m === 0 ? 'Sin practicar' : pct(m)}</span>
                        </div>
                      </div>
                      <Icon name="play" size={16} className="shrink-0 text-brand" />
                    </button>
                  ))}
                  <div className="flex gap-2 px-4 py-2.5">
                    <button className="chip" onClick={() => navigate(`/play?mode=lesson&id=${l.id}`)}>Lección completa</button>
                    <button className="chip" onClick={() => navigate(`/play?mode=topic&id=${l.id}&topic=skill%3Avocab`)}>Vocabulario</button>
                    <button className="chip" onClick={() => navigate(`/play?mode=topic&id=${l.id}&topic=skill%3Alistening`)}>Escucha</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <p className="mt-6 text-center text-xs text-muted">Consejo: haz un simulacro, repasa los temas en rojo y vuelve a intentarlo otro día.</p>
    </div>
  )
}
