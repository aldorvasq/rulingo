import { useState } from 'react'
import type { AnswerResult, RunExercise } from '../engine/types'
import { playListening, usePlaying } from '../lib/audio'
import { SpeakerIcon } from '../components/Speak'

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

/** Listening: big play and slow buttons; the text and translation are revealed only after answering. */
export function ListenBlock({ ex, locked }: { ex: RunExercise; locked: boolean }) {
  const [show, setShow] = useState(false)
  const playing = usePlaying(undefined, ex.listen?.id)
  if (!ex.listen) return null
  const li = ex.listen
  return (
    <div className="card mb-5 p-4">
      <div className="mb-3 text-sm font-bold text-muted">{li.title}</div>
      <div className="flex items-center gap-3">
        <button onClick={() => playListening(li.id)} aria-label="Escuchar"
          className={`grid h-16 w-16 place-items-center rounded-xl text-white shadow transition-colors ${playing ? 'bg-brand-dark' : 'bg-brand'}`}>
          <SpeakerIcon size={32} active={playing} />
        </button>
        <button onClick={() => playListening(li.id, 0.75)} className="btn btn-ghost !px-3 !py-2 text-sm">Más lento</button>
        <span className="text-sm text-muted">Puedes escucharlo las veces que quieras.</span>
      </div>
      {locked && (
        <button className="mt-3 text-sm font-bold text-brand" onClick={() => setShow(!show)}>
          {show ? 'Ocultar el texto' : 'Ver el texto'}
        </button>
      )}
      {locked && show && (
        <div className="mt-2 space-y-1.5">
          {li.lines.map((l, i) => (
            <p key={i} className="ru text-lg leading-snug">{l.speaker && <span className="font-bold text-brand">{l.speaker}: </span>}{l.ru}</p>
          ))}
          {li.es && <p className="whitespace-pre-line pt-2 text-sm text-muted">{li.es}</p>}
        </div>
      )}
    </div>
  )
}
