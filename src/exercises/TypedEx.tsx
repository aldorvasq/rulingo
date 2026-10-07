import { useEffect, useRef, useState } from 'react'
import { GapSentence } from '../components/ui'
import { RuInput } from '../components/RuInput'
import { CyrillicKeyboard, KeyboardToggle } from '../components/CyrillicKeyboard'
import { gradeTyped } from '../lib/text'
import { ContextBlock, ruPromptSize, type ExProps } from './common'

export function TypedEx({ ex, locked, ready }: ExProps<'typed'>) {
  const [value, setValue] = useState('')
  const [verdict, setVerdict] = useState<'correct' | 'almost' | 'wrong' | null>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!matchMedia('(pointer: coarse)').matches) input.current?.focus()
  }, [])

  const onChange = (v: string) => {
    setValue(v)
    ready(v.trim() ? () => {
      const { result, best } = gradeTyped(v, ex.answers, ex.answerLang, ex.strict)
      setVerdict(result)
      return { correct: result !== 'wrong', almost: result === 'almost', correctAnswer: best, typed: ex.answerLang === 'ru' }
    } : null)
  }

  const isRu = ex.answerLang === 'ru'
  return (
    <div>
      <ContextBlock ex={ex} />
      {ex.prompt && (
        <p className={`mb-6 ${ex.promptLang === 'ru' ? `ru ${ruPromptSize(ex.prompt)} font-bold leading-snug` : 'text-2xl font-bold text-ink/85'}`}>
          {ex.prompt.includes('___')
            ? <GapSentence text={ex.prompt} fill={value || undefined} fillClass={locked ? (verdict === 'wrong' ? 'text-bad' : 'text-ok') : 'text-brand'} />
            : ex.prompt}
        </p>
      )}
      {ex.hint && <p className="mb-2 text-sm text-muted">Pista: <span className={/[а-яё]/i.test(ex.hint) ? 'ru' : ''}>{ex.hint}</span></p>}
      <RuInput
        ref={input}
        lang={ex.answerLang}
        value={value}
        disabled={locked}
        placeholder={isRu ? 'Escribe en ruso…' : 'Escribe en español…'}
        onChange={(e) => onChange(e.target.value)}
        className={`${isRu ? 'ru text-xl' : 'text-lg'} ${locked ? (verdict === 'wrong' ? '!border-bad' : '!border-ok') : ''}`}
      />
      {isRu && (
        <>
          <div className="mt-3"><KeyboardToggle /></div>
          <CyrillicKeyboard disabled={locked} />
        </>
      )}
    </div>
  )
}
