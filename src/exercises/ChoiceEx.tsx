import { useEffect, useState } from 'react'
import { GapSentence, SpeakButton } from '../components/ui'
import { ContextBlock, tileState, useAutoplay, type ExProps } from './common'

export function ChoiceEx({ ex, locked, ready }: ExProps<'choice'>) {
  const [sel, setSel] = useState<number | null>(null)
  useAutoplay(ex.audio)

  const choose = (i: number) => {
    if (locked) return
    setSel(i)
    ready(() => ({ correct: i === ex.answer, correctAnswer: ex.choices[ex.answer] }))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (n >= 1 && n <= ex.choices.length && !(e.target instanceof HTMLInputElement)) choose(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const long = ex.choices.some((c) => c.length > 18)
  const filled = locked ? ex.choices[ex.answer] : sel !== null ? ex.choices[sel] : undefined

  return (
    <div>
      <ContextBlock ex={ex} />
      {ex.audioOnly ? (
        <div className="my-6 flex justify-center gap-4">
          <SpeakButton text={ex.audio!} size="lg" />
          <SpeakButton text={ex.audio!} size="lg" slow />
        </div>
      ) : ex.prompt ? (
        <div className="mb-6 flex items-center gap-3">
          {ex.promptLang === 'ru' && <SpeakButton text={ex.prompt} />}
          <p className={`text-2xl font-bold ${ex.promptLang === 'es' ? 'text-muted' : ''}`}>
            {ex.prompt.includes('___')
              ? <GapSentence text={ex.prompt} fill={filled} fillClass={locked ? 'text-ok' : 'text-brand'} />
              : <span className={ex.promptLang === 'ru' ? 'ru' : ''}>{ex.prompt}</span>}
          </p>
        </div>
      ) : null}

      <div className={`grid gap-3 ${long ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {ex.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            className={`tile flex items-center gap-3 ${tileState(locked, i === ex.answer, sel === i)}`}
          >
            <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-line text-xs text-muted sm:flex">
              {i + 1}
            </span>
            <span className={`text-lg ${ex.choiceLang === 'ru' ? 'ru' : ''}`}>{c}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
