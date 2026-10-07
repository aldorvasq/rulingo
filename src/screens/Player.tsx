import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildSession, type SessionMode } from '../engine/session'
import type { AnswerResult, RunExercise, Skill } from '../engine/types'
import { useStore, type SessionSummary } from '../state/store'
import { dayKey } from '../lib/date'
import { navigate } from '../lib/router'
import { sfx } from '../lib/sound'
import { speak } from '../lib/tts'
import { lessonById, grammarById } from '../content'
import { ProgressBar } from '../components/ui'
import { ChoiceEx } from '../exercises/ChoiceEx'
import { TypedEx } from '../exercises/TypedEx'
import { ConjugateEx } from '../exercises/ConjugateEx'
import { WordOrderEx } from '../exercises/WordOrderEx'
import { MatchEx } from '../exercises/MatchEx'
import { SortEx } from '../exercises/SortEx'
import { ErrorSpotEx } from '../exercises/ErrorSpotEx'
import { Results } from './Results'

const PRAISE = ['¡Correcto!', '¡Muy bien!', '¡Excelente!', 'Отлично!', 'Молодец!', '¡Así se hace!', 'Хорошо!']

function parseMode(params: URLSearchParams): SessionMode {
  const m = params.get('mode')
  if (m === 'lesson' && params.get('id')) return { mode: 'lesson', lessonId: params.get('id')! }
  if (m === 'weak') return { mode: 'weak' }
  if (m === 'drill' && params.get('skill')) return { mode: 'drill', skill: params.get('skill') as Skill }
  return { mode: 'daily' }
}

function Exercise(props: { ex: RunExercise; locked: boolean; ready: (f: (() => AnswerResult) | null) => void; autoSubmit: (r: AnswerResult) => void }) {
  const { ex, ...rest } = props
  switch (ex.kind) {
    case 'choice': return <ChoiceEx ex={ex} {...rest} />
    case 'typed': return <TypedEx ex={ex} {...rest} />
    case 'conjugate': return <ConjugateEx ex={ex} {...rest} />
    case 'word_order': return <WordOrderEx ex={ex} {...rest} />
    case 'match': return <MatchEx ex={ex} {...rest} />
    case 'sort': return <SortEx ex={ex} {...rest} />
    case 'error_spot': return <ErrorSpotEx ex={ex} {...rest} />
  }
}

const XP = (r: AnswerResult) => (r.correct ? (r.almost ? 8 : r.typed ? 15 : 10) : 0)

export function Player({ params }: { params: URLSearchParams }) {
  const mode = useMemo(() => parseMode(params), [params])
  const settings = useStore((s) => s.settings)
  const recordAnswer = useStore((s) => s.recordAnswer)
  const finishSession = useStore((s) => s.finishSession)

  const [queue, setQueue] = useState<RunExercise[]>(() => {
    const st = useStore.getState()
    return buildSession(mode, {
      progress: st.progress,
      focusLessons: st.settings.focusLessons,
      focusTopics: st.settings.focusTopics,
      coveredUpTo: st.settings.coveredUpTo,
      length: st.settings.sessionLength,
      listening: st.settings.listening,
      today: dayKey(),
    })
  })
  const total = useRef(queue.length)
  const [pos, setPos] = useState(0)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [canSubmit, setCanSubmit] = useState(false)
  const submitRef = useRef<(() => AnswerResult) | null>(null)
  const retried = useRef(new Set<string>())
  const stats = useRef({ xp: 0, firstTryCorrect: 0, done: 0, combo: 0, bestCombo: 0 })
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [praise, setPraise] = useState(PRAISE[0])
  const [confirmQuit, setConfirmQuit] = useState(false)

  const ex = queue[pos]

  const ready = useCallback((f: (() => AnswerResult) | null) => {
    submitRef.current = f
    setCanSubmit(!!f)
  }, [])

  const apply = useCallback((r: AnswerResult) => {
    if (!ex || result) return
    const isRetry = retried.current.has(ex.key)
    if (!isRetry) {
      recordAnswer(ex, r)
      stats.current.done += 1
      if (r.correct) stats.current.firstTryCorrect += 1
    }
    stats.current.xp += isRetry ? Math.round(XP(r) / 2) : XP(r)
    stats.current.combo = r.correct ? stats.current.combo + 1 : 0
    stats.current.bestCombo = Math.max(stats.current.bestCombo, stats.current.combo)
    if (!r.correct && !isRetry) {
      // Mistakes come back once at the end of the lesson, Duolingo-style.
      retried.current.add(ex.key)
      setQueue((q) => [...q, ex])
    }
    if (settings.sound) (r.correct ? sfx.correct : sfx.wrong)()
    setPraise(r.almost ? '¡Casi!' : PRAISE[Math.floor(Math.random() * PRAISE.length)])
    setResult(r)
  }, [ex, result, recordAnswer, settings.sound])

  const check = useCallback(() => {
    if (!submitRef.current || result) return
    apply(submitRef.current())
  }, [apply, result])

  const next = useCallback(() => {
    submitRef.current = null
    setCanSubmit(false)
    setResult(null)
    if (pos + 1 >= queue.length) {
      if (settings.sound) sfx.finish()
      setSummary(finishSession({
        xp: stats.current.xp,
        correct: stats.current.firstTryCorrect,
        total: stats.current.done,
        mode: mode.mode,
        lessonId: mode.mode === 'lesson' ? mode.lessonId : undefined,
      }))
    } else setPos(pos + 1)
  }, [pos, queue.length, finishSession, mode, settings.sound])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || summary) return
      e.preventDefault()
      if (result) next()
      else check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result, next, check, summary])

  if (summary) return <Results summary={summary} bestCombo={stats.current.bestCombo} />

  if (!ex) {
    return (
      <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-6xl">📭</div>
        <p className="text-lg font-bold">
          {mode.mode === 'weak' ? '¡No tienes puntos débiles por ahora! Haz algunas lecciones primero.' : 'No hay ejercicios disponibles para esta selección todavía.'}
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Volver</button>
      </div>
    )
  }

  const selfCompleting = ex.kind === 'match' || ex.kind === 'sort'
  const progress = Math.min(stats.current.done, total.current) / total.current
  const lesson = lessonById.get(ex.lessonId)
  const isRetry = retried.current.has(ex.key) && pos >= total.current
  const grammarTip = result && !result.correct
    ? ex.items.map((i) => grammarById.get(i)).find(Boolean)
    : undefined

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      <div className="pt-safe flex items-center gap-3 px-4 py-3">
        <button className="text-2xl text-muted" aria-label="Salir" onClick={() => setConfirmQuit(true)}>✕</button>
        <ProgressBar value={progress} />
        {stats.current.combo >= 3 && <span className="animate-pop whitespace-nowrap text-sm font-extrabold text-gold">🔥 {stats.current.combo}</span>}
      </div>

      <main className="flex-1 px-4 pb-40 pt-2">
        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-bold text-muted">
          {lesson && <span>{lesson.id} · <span className="ru">{lesson.title}</span></span>}
          {ex.sneak && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-gold">✨ Palabra extra</span>}
          {isRetry && <span className="rounded-full bg-coral/15 px-2 py-0.5 text-coral">↺ Repaso de error</span>}
        </div>
        <h2 className="mb-5 text-xl font-extrabold">{ex.instruction}</h2>
        <Exercise key={ex.key + pos} ex={ex} locked={!!result} ready={ready} autoSubmit={apply} />
      </main>

      {/* Bottom bar: Check button, then the feedback sheet. */}
      <div className={`pb-safe fixed inset-x-0 bottom-0 z-30 border-t-2 ${result ? (result.correct ? 'border-transparent bg-ok-soft' : 'border-transparent bg-bad-soft') : 'border-line bg-bg'}`}>
        <div className="mx-auto max-w-xl px-4 pt-4">
          {result && (
            <div className="animate-slideup mb-3">
              <div className={`flex items-center gap-2 text-xl font-extrabold ${result.correct ? 'text-ok' : 'text-bad'}`}>
                <span className="text-2xl">{result.correct ? '✓' : '✗'}</span>
                {result.correct ? praise : 'Respuesta correcta:'}
              </div>
              {result.correctAnswer && (!result.correct || result.almost) && (
                <button className={`ru mt-1 text-left text-lg font-bold ${result.correct ? 'text-ok' : 'text-bad'}`}
                  onClick={() => speak(result.correctAnswer!)}>
                  {result.correctAnswer} 🔊
                </button>
              )}
              {ex.explanation && <p className="mt-1 text-sm font-semibold text-ink/80">{ex.explanation}</p>}
              {grammarTip && (
                <button className="mt-1 block text-left text-sm font-bold text-brand underline" onClick={() => navigate(`/lesson/${grammarTip.lessonId}`)}>
                  📘 Repasar: {grammarTip.title}
                </button>
              )}
            </div>
          )}
          {result ? (
            <button className={`btn w-full ${result.correct ? 'btn-ok' : 'btn-bad'}`} onClick={next} autoFocus>Continuar</button>
          ) : selfCompleting ? (
            <p className="py-3 text-center text-sm font-bold text-muted">Completa el ejercicio para continuar</p>
          ) : (
            <button className="btn btn-ok w-full" disabled={!canSubmit} onClick={check}>Comprobar</button>
          )}
        </div>
      </div>

      {confirmQuit && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4" onClick={() => setConfirmQuit(false)}>
          <div className="card animate-slideup w-full max-w-md p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 text-4xl">🥺</div>
            <p className="mb-4 text-lg font-extrabold">¿Seguro que quieres salir? Perderás el progreso de esta lección.</p>
            <button className="btn btn-primary mb-3 w-full" onClick={() => setConfirmQuit(false)}>Seguir practicando</button>
            <button className="w-full py-2 font-extrabold uppercase text-bad" onClick={() => navigate('/')}>Salir</button>
          </div>
        </div>
      )}
    </div>
  )
}
