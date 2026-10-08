import { useEffect, useState } from 'react'
import type { AnswerResult, RunExercise } from '../engine/types'
import { listeningInfo, listeningSrc, seekListening, setRate, toggleListening, useAudioState } from '../lib/audio'
import { Avatar } from '../components/Avatar'

export interface ExProps<K extends RunExercise['kind']> {
  ex: Extract<RunExercise, { kind: K }>
  locked: boolean
  /** Register the grader once an answer is ready (null = not ready, Check disabled). */
  ready: (submit: (() => AnswerResult) | null) => void
  /** For self-completing exercises (match, sort). */
  autoSubmit: (r: AnswerResult) => void
}

/** Size Russian prompts by length: single words big, sentences a step smaller. */
export const ruPromptSize = (text: string) => (text.length <= 18 ? 'text-4xl' : text.length <= 48 ? 'text-3xl' : 'text-2xl')

/** Option text size by length, for cards in narrow columns. */
export const optionSize = (text: string, ru: boolean) =>
  ru ? (text.length <= 9 ? 'text-xl' : text.length <= 16 ? 'text-lg' : 'text-base') : text.length <= 16 ? 'text-[15px]' : 'text-sm'

/** Reading passage / dialogue shown above a question. */
export function ContextBlock({ ex }: { ex: RunExercise }) {
  const [showEs, setShowEs] = useState(false)
  if (ex.passage) {
    return (
      <div className="card mb-5 max-h-[42vh] overflow-y-auto p-4">
        {ex.passage.title && <h3 className="ru mb-2 text-xl font-bold">{ex.passage.title}</h3>}
        <p className="ru whitespace-pre-line text-lg leading-relaxed">{ex.passage.text}</p>
        {ex.passage.textEs && (
          <button className="mt-3 text-sm font-bold text-brand" onClick={() => setShowEs(!showEs)}>
            {showEs ? 'Ocultar traducción' : 'Ver traducción'}
          </button>
        )}
        {showEs && <p className="mt-1 whitespace-pre-line text-sm text-muted">{ex.passage.textEs}</p>}
      </div>
    )
  }
  if (ex.dialogue) {
    return (
      <div className="mb-5 space-y-2">
        {ex.dialogue.map((l, i) => (
          <div key={i} className={`flex ${i % 2 ? 'justify-end' : ''}`}>
            <div className={`max-w-[85%] rounded-md border border-line px-3 py-2 ${i % 2 ? 'bg-soft' : 'bg-card'}`}>
              <div className="text-xs font-bold text-muted">{l.speaker}</div>
              <div className="ru text-lg">{l.ru.includes('___') ? l.ru.replace(/_{2,}/g, '……') : l.ru}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const tileState = (locked: boolean, isAnswer: boolean, isChosen: boolean) =>
  locked ? (isAnswer ? 'tile-ok correct-pop' : isChosen ? 'tile-bad animate-shake' : 'opacity-50') : isChosen ? 'tile-selected' : ''

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

/**
 * Listening: cast portraits (the current speaker lights up), a player with seek slider, −5 s and speed,
 * and the transcript, which unlocks only after a correct answer; tapping a line jumps there.
 */
export function ListenBlock({ ex, locked, correct }: { ex: RunExercise; locked: boolean; correct: boolean }) {
  const [show, setShow] = useState(false)
  const s = useAudioState()
  const li = ex.listen
  useEffect(() => {
    // Load (not play) so the slider knows the duration.
    if (li && s.src !== listeningSrc(li.id)) seekListening(li.id, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [li?.id])
  if (!li) return null
  const info = listeningInfo(li.id)
  const mine = s.src === listeningSrc(li.id)
  const time = mine ? s.time : 0
  const dur = mine && s.duration ? s.duration : 0
  const starts = info?.starts ?? []
  const lineIdx = starts.length ? Math.max(0, starts.filter((st) => st <= time + 0.05).length - 1) : -1
  const speaking = mine && s.playing && lineIdx >= 0 ? li.lines[lineIdx]?.speaker ?? li.cast?.[0]?.name : undefined
  const cast = li.cast ?? []

  return (
    <div className="card mb-5 p-4">
      <div className="mb-3 text-sm font-bold text-muted">{li.title}</div>
      {cast.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-4">
          {cast.map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-1">
              <Avatar member={c} size={60} active={speaking === c.name} />
              <span className={`ru text-sm ${speaking === c.name ? 'font-bold text-brand' : 'text-muted'}`}>{c.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => toggleListening(li.id)} aria-label={mine && s.playing ? 'Pausa' : 'Reproducir'}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand text-white shadow active:translate-y-px">
          {mine && s.playing
            ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            : <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>}
        </button>
        <div className="min-w-0 flex-1">
          <input type="range" min={0} max={dur || 1} step={0.1} value={Math.min(time, dur || 1)} aria-label="Posición"
            onChange={(e) => seekListening(li.id, Number(e.target.value))}
            className="audio-slider w-full" style={{ ['--pct' as string]: `${dur ? (time / dur) * 100 : 0}%` }} />
          <div className="mt-0.5 flex justify-between text-xs tabular-nums text-muted">
            <span>{mmss(time)}</span><span>{dur ? mmss(dur) : '–:––'}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button className="chip text-xs" onClick={() => seekListening(li.id, time - 5)}>−5 s</button>
        <button className={`chip text-xs ${s.rate !== 1 ? 'tile-selected' : ''}`} onClick={() => setRate(s.rate === 1 ? 0.75 : 1)}>
          Velocidad {s.rate === 1 ? '1×' : '0.75×'}
        </button>
      </div>

      {locked && !correct && <p className="mt-3 text-sm text-muted">La transcripción se desbloquea al responder correctamente.</p>}
      {locked && correct && (
        <button className="mt-3 text-sm font-bold text-brand" onClick={() => setShow(!show)}>
          {show ? 'Ocultar transcripción' : 'Ver transcripción'}
        </button>
      )}
      {locked && correct && show && (
        <div className="mt-2 space-y-1">
          {li.lines.map((l, i) => (
            <button key={i} onClick={() => { seekListening(li.id, starts[i] ?? 0); if (!(mine && s.playing)) toggleListening(li.id) }}
              className={`ru block w-full rounded-md px-2 py-1 text-left text-lg leading-snug transition-colors ${mine && i === lineIdx ? 'bg-brand-soft' : 'hover:bg-soft'}`}>
              {l.speaker && <span className="font-bold text-brand">{l.speaker}: </span>}{l.ru}
            </button>
          ))}
          {li.es && <p className="whitespace-pre-line px-2 pt-2 text-sm text-muted">{li.es}</p>}
        </div>
      )}
    </div>
  )
}
