import { useState } from 'react'
import type { AnswerResult, RunExercise } from '../engine/types'

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
  locked ? (isAnswer ? 'tile-ok' : isChosen ? 'tile-bad' : 'opacity-50') : isChosen ? 'tile-selected' : ''
