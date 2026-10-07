import { useEffect, useState } from 'react'
import type { AnswerResult, RunExercise } from '../engine/types'
import { speak } from '../lib/tts'
import { useStore } from '../state/store'
import { SpeakButton } from '../components/ui'

export interface ExProps<K extends RunExercise['kind']> {
  ex: Extract<RunExercise, { kind: K }>
  locked: boolean
  /** Register the grader once an answer is ready (null = not ready, Check disabled). */
  ready: (submit: (() => AnswerResult) | null) => void
  /** For self-completing exercises (match, sort). */
  autoSubmit: (r: AnswerResult) => void
}

export function useAutoplay(text: string | undefined) {
  const sound = useStore((s) => s.settings.sound)
  useEffect(() => {
    if (text && sound) {
      const t = setTimeout(() => speak(text), 250)
      return () => clearTimeout(t)
    }
  }, [text, sound])
}

/** Reading passage / dialogue shown above a question. */
export function ContextBlock({ ex }: { ex: RunExercise }) {
  const [showEs, setShowEs] = useState(false)
  if (ex.passage) {
    return (
      <div className="card mb-4 max-h-[40vh] overflow-y-auto p-4">
        <div className="mb-2 flex items-center gap-2">
          {ex.passage.title && <h3 className="ru flex-1 font-extrabold">{ex.passage.title}</h3>}
          <SpeakButton text={ex.passage.text} />
        </div>
        <p className="ru whitespace-pre-line leading-relaxed">{ex.passage.text}</p>
        {ex.passage.textEs && (
          <button className="mt-2 text-sm font-bold text-brand" onClick={() => setShowEs(!showEs)}>
            {showEs ? 'Ocultar traducción' : 'Ver traducción'}
          </button>
        )}
        {showEs && <p className="mt-1 whitespace-pre-line text-sm text-muted">{ex.passage.textEs}</p>}
      </div>
    )
  }
  if (ex.dialogue) {
    return (
      <div className="mb-4 space-y-2">
        {ex.dialogue.map((l, i) => (
          <div key={i} className={`flex ${i % 2 ? 'justify-end' : ''}`}>
            <div className={`max-w-[85%] rounded-2xl border-2 border-line px-3 py-2 ${i % 2 ? 'bg-soft' : 'bg-card'}`}>
              <div className="text-xs font-bold text-muted">{l.speaker}</div>
              <div className="ru">{l.ru.includes('___') ? l.ru.replace(/_{2,}/g, '……') : l.ru}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const tileState = (locked: boolean, isAnswer: boolean, isChosen: boolean) =>
  locked ? (isAnswer ? 'tile-ok' : isChosen ? 'tile-bad' : 'opacity-60') : isChosen ? 'tile-selected' : ''
