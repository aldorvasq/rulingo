import { useEffect, useRef, useState } from 'react'
import { GapSentence, SpeakButton } from '../components/ui'
import { RuInput } from '../components/RuInput'
import { CyrillicKeyboard, KeyboardToggle } from '../components/CyrillicKeyboard'
import { gradeTyped } from '../lib/text'
import { ContextBlock, useAutoplay, type ExProps } from './common'

export function TypedEx({ ex, locked, ready }: ExProps<'typed'>) {
  const [value, setValue] = useState('')
  const [verdict, setVerdict] = useState<'correct' | 'almost' | 'wrong' | null>(null)
  const input = useRef<HTMLInputElement>(null)
  useAutoplay(ex.audio)

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
      {ex.audioOnly ? (
        <div className="my-6 flex justify-center gap-4">
          <SpeakButton text={ex.audio!} size="lg" />
          <SpeakButton text={ex.audio!} size="lg" slow />
        </div>
      ) : ex.prompt ? (
        <div className="mb-5 flex items-center gap-3">
          {ex.promptLang === 'ru' && <SpeakButton text={ex.prompt} />}
          <p className="text-2xl font-bold">
            {ex.prompt.includes('___')
              ? <GapSentence text={ex.prompt} fill={value || undefined} fillClass={locked ? (verdict === 'wrong' ? 'text-bad' : 'text-ok') : 'text-brand'} />
              : <span className={ex.promptLang === 'ru' ? 'ru' : ''}>{ex.prompt}</span>}
          </p>
        </div>
      ) : null}
      {ex.hint && <p className="mb-2 text-sm font-semibold text-muted">Pista: {ex.hint}</p>}
      <RuInput
        ref={input}
        lang={ex.answerLang}
        value={value}
        disabled={locked}
        placeholder={isRu ? 'Escribe en ruso…' : 'Escribe en español…'}
        onChange={(e) => onChange(e.target.value)}
        className={locked ? (verdict === 'wrong' ? '!border-bad' : '!border-ok') : ''}
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
