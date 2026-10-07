import { useState } from 'react'
import { normalizeRu } from '../lib/text'
import type { ExProps } from './common'

export function WordOrderEx({ ex, locked, ready }: ExProps<'word_order'>) {
  const [placed, setPlaced] = useState<number[]>([])

  const set = (next: number[]) => {
    setPlaced(next)
    ready(next.length ? () => {
      const built = next.map((i) => ex.words[i]).join(' ')
      return { correct: normalizeRu(built) === normalizeRu(ex.answer), correctAnswer: ex.answer }
    } : null)
  }

  return (
    <div>
      {ex.translation && <p className="mb-6 text-2xl font-bold text-ink/85">{ex.translation}</p>}

      <div className="mb-6 flex min-h-[8rem] flex-wrap content-start gap-2 border-y border-line py-3">
        {placed.map((wi, pos) => (
          <button key={`${wi}-${pos}`} disabled={locked} onClick={() => set(placed.filter((_, p) => p !== pos))}
            className="tile ru animate-pop !px-3 !py-2 text-xl">
            {ex.words[wi]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {ex.words.map((w, i) => {
          const used = placed.includes(i)
          return (
            <button key={i} disabled={locked || used} onClick={() => set([...placed, i])}
              className={`tile ru !px-3 !py-2 text-xl ${used ? '!border-transparent !bg-line !text-transparent' : ''}`}>
              {w}
            </button>
          )
        })}
      </div>
    </div>
  )
}
