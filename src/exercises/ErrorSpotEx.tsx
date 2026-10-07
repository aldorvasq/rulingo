import { useState } from 'react'
import { SpeakButton } from '../components/ui'
import type { ExProps } from './common'

export function ErrorSpotEx({ ex, locked, ready }: ExProps<'error_spot'>) {
  const words = ex.sentence.split(/\s+/)
  const [sel, setSel] = useState<number | null>(null)

  const choose = (i: number) => {
    if (locked) return
    setSel(i)
    ready(() => ({ correct: i === ex.wrongWord, correctAnswer: `${words[ex.wrongWord]} → ${ex.correction}` }))
  }

  return (
    <div>
      <div className="mb-4 flex justify-end"><SpeakButton text={ex.sentence} /></div>
      <div className="flex flex-wrap justify-center gap-2">
        {words.map((w, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            className={`tile ru !px-3 !py-2 text-xl ${
              locked ? (i === ex.wrongWord ? 'tile-ok' : sel === i ? 'tile-bad' : '') : sel === i ? 'tile-selected' : ''
            }`}
          >
            {locked && i === ex.wrongWord ? <><s className="opacity-50">{w}</s> {ex.correction}</> : w}
          </button>
        ))}
      </div>
    </div>
  )
}
