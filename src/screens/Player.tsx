import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildSession, type SessionMode } from '../engine/session'
import { exerciseTopic, topicTitle } from '../engine/topics'
import type { AnswerResult, RunExercise } from '../engine/types'
import { useStore, type SessionSummary } from '../state/store'
import { dayKey } from '../lib/date'
import { navigate } from '../lib/router'
import { lessonById, grammarById, vocabById } from '../content'
import { Icon, Mixed, ProgressBar, TopicTitle } from '../components/ui'
import { ChoiceEx } from '../exercises/ChoiceEx'
import { TypedEx } from '../exercises/TypedEx'
import { ConjugateEx } from '../exercises/ConjugateEx'
import { WordOrderEx } from '../exercises/WordOrderEx'
import { MatchEx } from '../exercises/MatchEx'
import { SortEx } from '../exercises/SortEx'
import { ErrorSpotEx } from '../exercises/ErrorSpotEx'
import { Results } from './Results'
import { ExampleLine, Speak } from '../components/Speak'
import { fillGap } from '../lib/audioKey'
import { hasAudio, stopAudio } from '../lib/audio'

const PRAISE = ['¡Correcto!', '¡Muy bien!', '¡Excelente!', 'Отли́чно!', 'Молоде́ц!', 'Хорошо́!']

export function parseMode(params: URLSearchParams): SessionMode {
  const m = params.get('mode')
  const id = params.get('id')
  if (m === 'lesson' && id) return { mode: 'lesson', lessonId: id }
  if (m === 'topic' && id && params.get('topic')) return { mode: 'topic', lessonId: id, topic: params.get('topic')! }
  if (m === 'review') return { mode: 'review' }
  if (m === 'weak') return { mode: 'weak' }
  if (m === 'listening') return { mode: 'listening' }
  return { mode: 'daily' }
}

export function sessionTitle(mode: SessionMode): string {
  switch (mode.mode) {
    case 'lesson': return `Repaso de la lección ${mode.lessonId}`
    case 'topic': return `${mode.lessonId} · ${topicTitle(mode.topic) ?? 'Tema'}`
    case 'review': return 'Repaso de lecciones vistas'
    case 'weak': return 'Puntos débiles'
    case 'daily': return 'Práctica del día'
    case 'listening': return 'Comprensión auditiva'
  }
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

/** The Russian text worth hearing once an exercise is answered (completed sentence, answer word…). */
function audioTextOf(ex: RunExercise): string | undefined {
  const candidates: (string | undefined)[] = []
  switch (ex.kind) {
    case 'choice': {
      const a = ex.choices[ex.answer]
      if (ex.dialogue) candidates.push(...ex.dialogue.filter((l) => l.ru.includes('___')).map((l) => fillGap(l.ru, a)))
      if (ex.prompt?.includes('___')) candidates.push(fillGap(ex.prompt, a))
      candidates.push(ex.choiceLang === 'ru' ? a : undefined, ex.promptLang === 'ru' ? ex.prompt : undefined)
      break
    }
    case 'typed':
      if (ex.prompt?.includes('___')) candidates.push(fillGap(ex.prompt, ex.answers[0]))
      candidates.push(ex.answerLang === 'ru' ? ex.answers[0] : ex.prompt)
      break
    case 'word_order': candidates.push(ex.answer); break
    case 'conjugate': candidates.push(ex.verb); break
    case 'error_spot': {
      const w = ex.sentence.split(/\s+/)
      w[ex.wrongWord] = ex.correction
      candidates.push(w.join(' '))
      break
    }
  }
  return candidates.find((c) => c && hasAudio(c))
}

const XP = (r: AnswerResult) => (r.correct ? (r.almost ? 8 : r.typed ? 15 : 10) : 0)
const hasCyrillic = (s: string) => /[а-яё]/i.test(s)

export function Player({ params }: { params: URLSearchParams }) {
  const mode = useMemo(() => parseMode(params), [params])
  const recordAnswer = useStore((s) => s.recordAnswer)
  const finishSession = useStore((s) => s.finishSession)

  const [queue, setQueue] = useState<RunExercise[]>(() => {
    const st = useStore.getState()
    return buildSession(mode, {
      progress: st.progress,
      focusLessons: st.settings.focusLessons,
      coveredUpTo: st.settings.coveredUpTo,
      length: st.settings.sessionLength,
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
  const [reveal, setReveal] = useState<'tr' | 'ex' | null>(null)

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
      // Mistakes come back once at the end of the session.
      retried.current.add(ex.key)
      setQueue((q) => [...q, ex])
    }
    setPraise(r.almost ? '¡Casi!' : PRAISE[Math.floor(Math.random() * PRAISE.length)])
    setResult(r)
  }, [ex, result, recordAnswer])

  const check = useCallback(() => {
    if (!submitRef.current || result) return
    apply(submitRef.current())
  }, [apply, result])

  const next = useCallback(() => {
    submitRef.current = null
    setCanSubmit(false)
    setResult(null)
    setReveal(null)
    stopAudio()
    if (pos + 1 >= queue.length) {
      setSummary(finishSession({
        xp: stats.current.xp,
        correct: stats.current.firstTryCorrect,
        total: stats.current.done,
        mode: mode.mode,
        lessonId: 'lessonId' in mode ? mode.lessonId : undefined,
      }))
    } else setPos(pos + 1)
  }, [pos, queue.length, finishSession, mode])

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

  if (summary) return <Results summary={summary} mode={mode} bestCombo={stats.current.bestCombo} />

  if (!ex) {
    return (
      <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-bold">
          {mode.mode === 'weak' ? 'No tienes puntos débiles por ahora. Repasa algunas lecciones primero.' : 'No hay ejercicios para esta selección todavía.'}
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Volver</button>
      </div>
    )
  }

  const selfCompleting = ex.kind === 'match' || ex.kind === 'sort'
  const progress = Math.min(stats.current.done, total.current) / total.current
  const lesson = lessonById.get(ex.lessonId)
  const isRetry = retried.current.has(ex.key) && pos >= total.current
  const ruleOf = ex.items.map((i) => grammarById.get(i)).find(Boolean)
  const answerAudio = result && !ex.listen ? audioTextOf(ex) : undefined
  // Vocabulary exercises also show the word's example sentence (with its own recording).
  const vocabExample = result ? vocabById.get(ex.items[0])?.example : undefined
  const grammarTip = result && !result.correct ? ruleOf : undefined

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      <div className="pt-safe px-4 pb-2">
        <div className="flex items-center gap-3 py-2">
          <button className="text-muted" aria-label="Salir" onClick={() => setConfirmQuit(true)}><Icon name="close" size={24} /></button>
          <ProgressBar value={progress} color="var(--brand)" />
          <span className="text-sm font-bold tabular-nums text-muted">{Math.min(stats.current.done + 1, total.current)}/{total.current}</span>
        </div>
        <div className="truncate text-xs text-muted"><Mixed text={sessionTitle(mode)} /></div>
      </div>

      <main className="flex-1 px-4 pb-44 pt-3">
        <div key={`h${pos}`} className="slide-in mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[15px]">
            <span className="text-muted">Repasando · </span>
            <TopicTitle title={mode.mode === 'topic' ? topicTitle(mode.topic) ?? exerciseTopic(ex) : exerciseTopic(ex)} />
          </span>
          {ex.sneak && <span className="rounded-sm bg-gold/15 px-1.5 py-0.5 text-xs font-bold text-gold">Palabra extra</span>}
          {isRetry && <span className="rounded-sm bg-brick/10 px-1.5 py-0.5 text-xs font-bold text-brick">Repaso de error</span>}
        </div>
        {lesson && mode.mode !== 'lesson' && mode.mode !== 'topic' && (
          <div className="mb-1 text-xs text-muted">Lección {lesson.id} · <span className="ru">{lesson.title}</span></div>
        )}
        <h2 className="mb-6 text-lg font-bold text-ink/80">{ex.instruction}</h2>
        <div key={ex.key + pos} className="slide-in">
          <Exercise ex={ex} locked={!!result} ready={ready} autoSubmit={apply} />
        </div>
      </main>

      <div className={`pb-safe fixed inset-x-0 bottom-0 z-30 border-t ${result ? (result.correct ? 'border-ok/30 bg-ok-soft' : 'border-bad/30 bg-bad-soft') : 'border-line bg-bg'}`}>
        <div className="mx-auto max-w-xl px-4 pt-4">
          {result && (
            <div className="animate-slideup mb-3">
              <div className={`animate-pop text-lg font-bold ${result.correct ? 'text-ok' : 'text-bad'}`}>
                {result.correct ? <span className={hasCyrillic(praise) ? 'ru' : ''}>{praise}</span> : 'Respuesta correcta:'}
              </div>
              {result.correctAnswer && (!result.correct || result.almost) && (
                <div className={`mt-0.5 text-xl font-bold ${hasCyrillic(result.correctAnswer) ? 'ru' : ''} ${result.correct ? 'text-ok' : 'text-bad'}`}>
                  {result.correctAnswer}
                </div>
              )}
              {answerAudio && (
                <div className="mt-2 flex items-center gap-2">
                  <Speak text={answerAudio} size="sm" />
                  <span className="ru min-w-0 truncate text-[15px] text-ink/80">{answerAudio}</span>
                </div>
              )}
              {vocabExample && <ExampleLine example={vocabExample} className="mt-2" />}
              {!result.correct && ex.explanation && <p className="mt-1 text-[15px] text-ink/80"><Mixed text={ex.explanation} /></p>}
              {result.correct && (ex.translation || ex.explanation || ruleOf) && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    {ex.translation && (
                      <button onClick={() => setReveal(reveal === 'tr' ? null : 'tr')}
                        className={`chip !border-ok/40 text-ok ${reveal === 'tr' ? '!bg-ok !text-white' : '!bg-card'}`}>Traducción</button>
                    )}
                    {(ex.explanation || ruleOf) && (
                      <button onClick={() => setReveal(reveal === 'ex' ? null : 'ex')}
                        className={`chip !border-ok/40 text-ok ${reveal === 'ex' ? '!bg-ok !text-white' : '!bg-card'}`}>Explicación</button>
                    )}
                  </div>
                  {reveal && (
                    <div className="animate-pop mt-2 max-h-40 overflow-y-auto rounded-md bg-card px-3 py-2 text-[15px] whitespace-pre-line leading-relaxed text-ink/90">
                      {reveal === 'tr' ? <Mixed text={ex.translation!} ruClass="text-[1.06em]" /> : ex.explanation ? <Mixed text={ex.explanation} /> : (
                        <>Regla: <button className="font-bold text-brand underline" onClick={() => navigate(`/lesson/${ruleOf!.lessonId}`)}>{ruleOf!.title}</button></>
                      )}
                    </div>
                  )}
                </div>
              )}
              {grammarTip && (
                <button className="mt-1 block text-left text-sm font-bold text-brand underline" onClick={() => navigate(`/lesson/${grammarTip.lessonId}`)}>
                  Repasar la regla: {grammarTip.title}
                </button>
              )}
            </div>
          )}
          {result ? (
            <button className={`btn w-full ${result.correct ? 'btn-ok' : 'btn-bad'}`} onClick={next} autoFocus>Continuar</button>
          ) : selfCompleting ? (
            <p className="py-3 text-center text-sm text-muted">Completa el ejercicio para continuar</p>
          ) : (
            <button className="btn btn-primary w-full" disabled={!canSubmit} onClick={check}>Comprobar</button>
          )}
        </div>
      </div>

      {confirmQuit && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4" onClick={() => setConfirmQuit(false)}>
          <div className="card animate-slideup w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <p className="mb-1 text-lg font-bold">¿Salir del repaso?</p>
            <p className="mb-4 text-sm text-muted">Las respuestas que ya diste se guardan, pero no se contará como repaso terminado.</p>
            <button className="btn btn-primary mb-2 w-full" onClick={() => setConfirmQuit(false)}>Seguir repasando</button>
            <button className="btn btn-ghost w-full !text-bad" onClick={() => navigate('/')}>Salir</button>
          </div>
        </div>
      )}
    </div>
  )
}
