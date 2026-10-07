import { useEffect, useRef, useState } from 'react'
import { RuInput } from '../components/RuInput'
import { CyrillicKeyboard, KeyboardToggle } from '../components/CyrillicKeyboard'
import { gradeTyped } from '../lib/text'
import type { ExProps } from './common'

export function ConjugateEx({ ex, locked, ready }: ExProps<'conjugate'>) {
  const [values, setValues] = useState(() => ex.pronouns.map(() => ''))
  const [rows, setRows] = useState<boolean[] | null>(null)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!matchMedia('(pointer: coarse)').matches) refs.current[0]?.focus()
  }, [])

  const update = (i: number, v: string) => {
    const next = values.map((x, j) => (j === i ? v : x))
    setValues(next)
    ready(next.every((x) => x.trim()) ? () => {
      const ok = next.map((x, j) => gradeTyped(x, [ex.answers[j]], 'ru', true).result === 'correct')
      setRows(ok)
      return {
        correct: ok.every(Boolean),
        typed: true,
        correctAnswer: ex.pronouns.map((p, j) => `${p} ${ex.answers[j]}`).join(' · '),
      }
    } : null)
  }

  return (
    <div>
      <p className="ru mb-5 text-4xl font-bold">{ex.verb}</p>
      <div className="card divide-y divide-line overflow-hidden">
        {ex.pronouns.map((p, i) => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2 ${rows ? (rows[i] ? 'bg-ok-soft' : 'bg-bad-soft') : ''}`}>
            <span className="ru w-14 shrink-0 text-right text-xl text-muted">{p}</span>
            <div className="flex-1">
              <RuInput
                ref={(el) => { refs.current[i] = el }}
                value={values[i]}
                disabled={locked}
                className="ru !py-2 text-xl"
                onChange={(e) => update(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && i < ex.pronouns.length - 1 && !values.every((x) => x.trim())) {
                    e.preventDefault()
                    e.stopPropagation()
                    refs.current[i + 1]?.focus()
                  }
                }}
              />
              {rows && !rows[i] && <div className="ru mt-1 text-lg font-bold text-ok">{ex.answers[i]}</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3"><KeyboardToggle /></div>
      <CyrillicKeyboard disabled={locked} />
    </div>
  )
}
