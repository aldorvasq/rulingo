import { useEffect, useState } from 'react'
import { GapSentence } from '../components/ui'
import { ContextBlock, ruPromptSize, tileState, type ExProps } from './common'

export function ChoiceEx({ ex, locked, ready }: ExProps<'choice'>) {
  const [sel, setSel] = useState<number | null>(null)

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

  // Two columns only when every option fits comfortably in half the width.
  const long = ex.choices.some((c) => c.length > (ex.choiceLang === 'ru' ? 11 : 16))
  const filled = locked ? ex.choices[ex.answer] : sel !== null ? ex.choices[sel] : undefined

  return (
    <div>
      <ContextBlock ex={ex} />
      {ex.prompt && (
        <p className={`mb-7 ${ex.promptLang === 'ru' ? `ru ${ruPromptSize(ex.prompt)} font-bold leading-snug` : 'text-2xl font-bold text-ink/85'}`}>
          {ex.prompt.includes('___')
            ? <GapSentence text={ex.prompt} fill={filled} fillClass={locked ? 'text-ok' : 'text-brand'} />
            : ex.prompt}
        </p>
      )}

      <div className={`grid gap-2.5 ${long ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {ex.choices.map((c, i) => (
          <button key={i} onClick={() => choose(i)} className={`tile flex items-center gap-3 ${tileState(locked, i === ex.answer, sel === i)}`}>
            <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-line text-xs text-muted sm:flex">{i + 1}</span>
            <span className={`min-w-0 flex-1 ${ex.choiceLang === 'ru' ? 'ru text-xl' : 'text-lg'}`}>{c}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
