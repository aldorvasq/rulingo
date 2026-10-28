import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildMockExam, type MockSection } from '../engine/session'
import type { AnswerResult, RunExercise } from '../engine/types'
import { grammarById } from '../content'
import { useStore } from '../state/store'
import { dayKey } from '../lib/date'
import { navigate } from '../lib/router'
import { Icon, Mixed, ProgressBar, TopicTitle } from '../components/ui'
import { stopAudio } from '../lib/audio'
import { Exercise } from './Player'
import { grade10 } from './Exam'

// A mock exam: questions one after another with no feedback (like the real test), answers still go into
// the learner's progress; at the end a grade, the score per section and what to review.

interface Answered { ex: RunExercise; section: string; r: AnswerResult }

/** The correct answer as text, for the review list. */
function answerText(ex: RunExercise): string {
  switch (ex.kind) {
    case 'choice': return ex.choices[ex.answer]
    case 'typed': return ex.answers[0]
    case 'conjugate': return ex.pronouns.map((p, i) => `${p} ${ex.answers[i]}`).join(', ')
    case 'word_order': return ex.answer
    case 'error_spot': return `${ex.sentence.split(/\s+/)[ex.wrongWord]} → ${ex.correction}`
    case 'match': return ex.pairs.map(([a, b]) => `${a} = ${b}`).join(' · ')
    case 'sort': return ex.entries.map((e) => `${e.text} → ${e.category}`).join(' · ')
  }
}
const questionText = (ex: RunExercise) =>
  ex.kind === 'conjugate' ? ex.verb : ex.kind === 'error_spot' ? ex.sentence : 'prompt' in ex && ex.prompt ? ex.prompt : ex.listen ? `🎧 ${ex.listen.title}` : ex.passage?.title ?? ''

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function MockExam({ params }: { params: URLSearchParams }) {
  const chapter = Number(params.get('chapter')) || 3
  const lesson = params.get('lesson') ?? undefined
  /** Where results are kept and the way back. */
  const key = lesson ?? String(chapter)
  const back = `/exam?chapter=${chapter}`
  const recordAnswer = useStore((s) => s.recordAnswer)
  const saveMock = useStore((s) => s.saveMock)
  const sections = useMemo<MockSection[]>(() => {
    const st = useStore.getState()
    return buildMockExam({ chapter, lesson }, { progress: st.progress, focusLessons: st.settings.focusLessons, coveredUpTo: st.settings.coveredUpTo, length: 40, today: dayKey() })
  }, [chapter, lesson])
  const flat = useMemo(() => sections.flatMap((s) => s.exercises.map((ex) => ({ ex, section: s.id }))), [sections])

  const [started, setStarted] = useState(false)
  const [pos, setPos] = useState(0)
  const [answers, setAnswers] = useState<Answered[]>([])
  const [canSubmit, setCanSubmit] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const [done, setDone] = useState(false)
  const submitRef = useRef<(() => AnswerResult) | null>(null)
  const t0 = useRef(0)
  const [now, setNow] = useState(0)

  useEffect(() => {
    if (!started || done) return
    const id = setInterval(() => setNow(Math.round((Date.now() - t0.current) / 1000)), 1000)
    return () => clearInterval(id)
  }, [started, done])

  const cur = flat[pos]
  const ready = useCallback((f: (() => AnswerResult) | null) => { submitRef.current = f; setCanSubmit(!!f) }, [])

  const commit = useCallback((r: AnswerResult) => {
    if (!cur) return
    recordAnswer(cur.ex, r)
    const all = [...answers, { ...cur, r }]
    setAnswers(all)
    submitRef.current = null
    setCanSubmit(false)
    stopAudio()
    if (pos + 1 >= flat.length) {
      const bySection: Record<string, [number, number]> = {}
      for (const a of all) {
        const [c, t] = bySection[a.section] ?? [0, 0]
        bySection[a.section] = [c + (a.r.correct ? 1 : 0), t + 1]
      }
      saveMock(key, { day: dayKey(), correct: all.filter((a) => a.r.correct).length, total: all.length, sections: bySection, seconds: Math.round((Date.now() - t0.current) / 1000) })
      setDone(true)
    } else setPos(pos + 1)
    window.scrollTo(0, 0)
  }, [cur, answers, pos, flat.length, recordAnswer, saveMock, key])

  // Match and sort finish themselves: give the last tap a moment before moving on.
  const auto = useCallback((r: AnswerResult) => setTimeout(() => commit(r), 600), [commit])

  if (!flat.length) return <div className="p-6 text-center text-muted">No hay preguntas para este capítulo.</div>

  if (!started) {
    return (
      <div className="mx-auto flex min-h-full max-w-xl flex-col px-6 py-8">
        <button className="mb-4 self-start text-muted" aria-label="Volver" onClick={() => navigate(back)}><Icon name="back" size={24} /></button>
        <div className="label">{lesson ? `Lección ${lesson}` : `Capítulo ${chapter}`}</div>
        <h1 className="mt-1 text-3xl font-bold">{lesson ? 'Mini simulacro' : 'Simulacro de examen'}</h1>
        <p className="mt-3 text-[15px] text-muted">{flat.length} preguntas. Contesta como en el examen: aquí no hay pistas ni verás si acertaste hasta el final. Si no sabes una, elige «No sé».</p>
        <div className="card mt-5 divide-y divide-line">
          {sections.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-5 text-sm font-bold text-muted">{i + 1}</span>
              <span className="flex-1 font-bold">{s.title}</span>
              <span className="text-sm tabular-nums text-muted">{s.exercises.length}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{lesson ? 'Toma unos 15 minutos.' : 'Toma unos 25–30 minutos.'} Ten audífonos a la mano para la comprensión auditiva.</p>
        <button className="btn btn-primary mt-auto w-full" onClick={() => { t0.current = Date.now(); setStarted(true) }}>Empezar</button>
      </div>
    )
  }

  if (done) return <MockResults title={lesson ? `lección ${lesson}` : `capítulo ${chapter}`} back={back} sections={sections} answers={answers} seconds={now} />

  const sec = sections.find((s) => s.id === cur.section)!
  const selfCompleting = cur.ex.kind === 'match' || cur.ex.kind === 'sort'
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      <div className="pt-safe px-4 pb-2">
        <div className="flex items-center gap-3 py-2">
          <button className="text-muted" aria-label="Salir" onClick={() => setConfirmQuit(true)}><Icon name="close" size={24} /></button>
          <ProgressBar value={pos / flat.length} color="var(--brand)" />
          <span className="text-sm font-bold tabular-nums text-muted">{pos + 1}/{flat.length}</span>
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>Simulacro · <b>{sec.title}</b></span>
          <span className="tabular-nums">⏱ {fmt(now)}</span>
        </div>
      </div>
      <main className="flex-1 px-4 pb-40 pt-3">
        <h2 className="mb-6 text-lg font-bold text-ink/80">{cur.ex.instruction}</h2>
        <div key={cur.ex.key} className="slide-in">
          <Exercise ex={cur.ex} locked={false} ready={ready} autoSubmit={auto} />
        </div>
      </main>
      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg">
        <div className="mx-auto flex max-w-xl gap-2 px-4 pt-4">
          <button className="btn btn-ghost shrink-0" onClick={() => commit({ correct: false, correctAnswer: answerText(cur.ex) })}>No sé</button>
          {selfCompleting
            ? <p className="flex-1 py-3 text-center text-sm text-muted">Completa el ejercicio para seguir</p>
            : <button className="btn btn-primary flex-1" disabled={!canSubmit} onClick={() => submitRef.current && commit(submitRef.current())}>Siguiente</button>}
        </div>
      </div>
      {confirmQuit && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4" onClick={() => setConfirmQuit(false)}>
          <div className="card animate-slideup w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <p className="mb-1 text-lg font-bold">¿Dejar el simulacro?</p>
            <p className="mb-4 text-sm text-muted">Las respuestas que ya diste cuentan para tu progreso, pero el simulacro no se calificará.</p>
            <button className="btn btn-primary mb-2 w-full" onClick={() => setConfirmQuit(false)}>Seguir</button>
            <button className="btn btn-ghost w-full !text-bad" onClick={() => navigate(back)}>Salir</button>
          </div>
        </div>
      )}
    </div>
  )
}

function MockResults({ title, back, sections, answers, seconds }: { title: string; back: string; sections: MockSection[]; answers: Answered[]; seconds: number }) {
  const correct = answers.filter((a) => a.r.correct).length
  const g = grade10(correct, answers.length)
  const verdict = g >= 9 ? '¡Listo para el examen!' : g >= 8 ? 'Muy bien preparado' : g >= 6 ? 'Vas bien, pero repasa los temas de abajo' : 'Necesitas repasar más antes del examen'
  const wrong = answers.filter((a) => !a.r.correct)
  // Grammar points behind the mistakes, most missed first.
  const missed = new Map<string, number>()
  for (const a of wrong) for (const id of a.ex.items) if (grammarById.has(id)) missed.set(id, (missed.get(id) ?? 0) + 1)
  const topics = [...missed.entries()].sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ g: grammarById.get(id)!, n }))

  return (
    <div className="mx-auto max-w-xl px-5 pb-16 pt-8">
      <div className="label">Simulacro · {title}</div>
      <h1 className="mt-1 text-3xl font-bold">{verdict}</h1>
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <Stat label="Nota" value={`${g}`} sub="/ 10" />
        <Stat label="Aciertos" value={`${correct}/${answers.length}`} />
        <Stat label="Tiempo" value={fmt(seconds)} />
      </div>

      <div className="label mt-7 mb-2">Por sección</div>
      <div className="card divide-y divide-line">
        {sections.map((s) => {
          const mine = answers.filter((a) => a.section === s.id)
          const c = mine.filter((a) => a.r.correct).length
          const v = mine.length ? c / mine.length : 0
          return (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-28 shrink-0 text-[15px] font-bold leading-tight">{s.title}</span>
              <ProgressBar value={v} color={v >= 0.8 ? 'var(--ok)' : v >= 0.6 ? 'var(--gold)' : 'var(--brick)'} className="!h-2" />
              <span className="w-12 shrink-0 whitespace-nowrap text-right text-sm tabular-nums">{c}/{mine.length}</span>
            </div>
          )
        })}
      </div>

      {topics.length > 0 && (
        <>
          <div className="label mt-7 mb-2">Temas para repasar</div>
          <div className="card divide-y divide-line overflow-hidden">
            {topics.map(({ g: t, n }) => (
              <button key={t.id} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-soft"
                onClick={() => navigate(`/play?mode=topic&id=${t.lessonId}&topic=${encodeURIComponent(t.id)}`)}>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] leading-snug"><TopicTitle title={t.title} /></div>
                  <div className="text-xs text-muted">Lección {t.lessonId} · {n} {n === 1 ? 'error' : 'errores'}</div>
                </div>
                <span className="text-sm font-bold text-brand">Practicar</span>
              </button>
            ))}
          </div>
        </>
      )}

      {wrong.length > 0 && (
        <>
          <div className="label mt-7 mb-2">Tus errores ({wrong.length})</div>
          <div className="space-y-2">
            {wrong.map((a, i) => (
              <div key={i} className="card px-4 py-3 text-[15px]">
                <div className="text-xs text-muted">{a.ex.instruction}</div>
                {a.ex.picture?.img && <img src={a.ex.picture.img} alt="" className="mt-1.5 h-20 w-20 rounded-md object-cover" />}
                {questionText(a.ex) && <div className="mt-0.5 text-ink/80"><Mixed text={questionText(a.ex)} /></div>}
                <div className="mt-1 font-bold text-ok"><Mixed text={a.r.correctAnswer ?? answerText(a.ex)} /></div>
                {a.ex.explanation && <div className="mt-1 text-sm text-muted"><Mixed text={a.ex.explanation} /></div>}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 space-y-2.5">
        <button className="btn btn-primary w-full" onClick={() => navigate(back, true)}>Volver al repaso</button>
        {wrong.length > 0 && <button className="btn btn-ghost w-full" onClick={() => navigate('/play?mode=weak', true)}>Practicar mis errores</button>}
        <button className="btn btn-ghost w-full" onClick={() => location.reload()}>Hacer otro simulacro</button>
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card px-3 py-3">
      <div className="label">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}{sub && <span className="ml-1 text-sm font-normal text-muted">{sub}</span>}</div>
    </div>
  )
}
