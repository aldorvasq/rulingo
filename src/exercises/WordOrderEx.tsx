import { useState } from 'react'
import { SpeakButton } from '../components/ui'
import { normalizeRu } from '../lib/text'
import { useAutoplay, type ExProps } from './common'

export function WordOrderEx({ ex, locked, ready }: ExProps<'word_order'>) {
  const [placed, setPlaced] = useState<number[]>([])
  useAutoplay(ex.audio ? ex.answer : undefined)

  const set = (next: number[]) => {
    setPlaced(next)
    ready(next.length ? () => {
      const built = next.map((i) => ex.words[i]).join(' ')
      return { correct: normalizeRu(built) === normalizeRu(ex.answer), correctAnswer: ex.answer }
    } : null)
  }

  return (
    <div>
      {ex.audio ? (
        <div className="mb-5 flex items-center gap-3">
          <SpeakButton text={ex.answer} size="lg" />
          <SpeakButton text={ex.answer} size="lg" slow />
          {locked && ex.translation && <p className="text-muted">{ex.translation}</p>}
        </div>
      ) : (
        ex.translation && <p className="mb-5 text-2xl font-bold">{ex.translation}</p>
      )}

      <div className="mb-6 flex min-h-[7.5rem] flex-wrap content-start gap-2 border-y-2 border-line py-3">
        {placed.map((wi, pos) => (
          <button
            key={`${wi}-${pos}`}
            disabled={locked}
            onClick={() => set(placed.filter((_, p) => p !== pos))}
            className="tile ru animate-pop !px-3 !py-2 text-lg"
          >
            {ex.words[wi]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {ex.words.map((w, i) => {
          const used = placed.includes(i)
          return (
            <button
              key={i}
              disabled={locked || used}
              onClick={() => set([...placed, i])}
              className={`tile ru !px-3 !py-2 text-lg ${used ? '!bg-line !text-transparent !shadow-none' : ''}`}
            >
              {w}
            </button>
          )
        })}
      </div>
    </div>
  )
}
