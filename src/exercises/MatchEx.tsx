import { useMemo, useState } from 'react'
import { shuffle } from '../lib/text'
import type { ExProps } from './common'

const hasCyrillic = (s: string) => /[а-яё]/i.test(s)

export function MatchEx({ ex, autoSubmit }: ExProps<'match'>) {
  const left = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ text: p[0], i }))), [ex])
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ text: p[1], i }))), [ex])
  const [selL, setSelL] = useState<number | null>(null)
  const [selR, setSelR] = useState<number | null>(null)
  const [done, setDone] = useState<Set<number>>(new Set())
  const [bad, setBad] = useState<[number, number] | null>(null)
  const [mistakes, setMistakes] = useState(0)

  const attempt = (l: number | null, r: number | null) => {
    if (l === null || r === null) return
    if (l === r) {
      const next = new Set(done).add(l)
      setDone(next)
      setSelL(null)
      setSelR(null)
      if (next.size === ex.pairs.length) {
        setTimeout(() => autoSubmit({ correct: mistakes <= 1, correctAnswer: mistakes ? `${mistakes} error(es)` : undefined }), 300)
      }
    } else {
      setMistakes((m) => m + 1)
      setBad([l, r])
      setTimeout(() => { setBad(null); setSelL(null); setSelR(null) }, 450)
    }
  }

  const cls = (i: number, side: 'l' | 'r') => {
    if (done.has(i)) return '!opacity-30 pointer-events-none'
    if (bad && bad[side === 'l' ? 0 : 1] === i) return 'tile-bad animate-shake'
    return (side === 'l' ? selL : selR) === i ? 'tile-selected' : ''
  }

  const col = (items: { text: string; i: number }[], side: 'l' | 'r') => (
    <div className="space-y-2.5">
      {items.map(({ text, i }) => (
        <button key={i} className={`tile w-full text-center ${hasCyrillic(text) ? 'ru text-xl' : 'text-base'} ${cls(i, side)}`}
          onClick={() => {
            if (side === 'l') { setSelL(i); attempt(i, selR) } else { setSelR(i); attempt(selL, i) }
          }}>
          {text}
        </button>
      ))}
    </div>
  )

  return <div className="grid grid-cols-2 gap-3">{col(left, 'l')}{col(right, 'r')}</div>
}
