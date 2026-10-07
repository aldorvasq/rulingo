import { useMemo, useState } from 'react'
import { speak } from '../lib/tts'
import { shuffle } from '../lib/text'
import { sfx } from '../lib/sound'
import { useStore } from '../state/store'
import type { ExProps } from './common'

export function MatchEx({ ex, autoSubmit }: ExProps<'match'>) {
  const left = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ text: p[0], i }))), [ex])
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ text: p[1], i }))), [ex])
  const [selL, setSelL] = useState<number | null>(null)
  const [selR, setSelR] = useState<number | null>(null)
  const [done, setDone] = useState<Set<number>>(new Set())
  const [bad, setBad] = useState<[number, number] | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const sound = useStore((s) => s.settings.sound)

  const attempt = (l: number | null, r: number | null) => {
    if (l === null || r === null) return
    if (l === r) {
      if (sound) sfx.tap()
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
    if (done.has(i)) return '!opacity-30 pointer-events-none !shadow-none'
    if (bad && bad[side === 'l' ? 0 : 1] === i) return 'tile-bad animate-shake'
    return (side === 'l' ? selL : selR) === i ? 'tile-selected' : ''
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-3">
        {left.map(({ text, i }) => (
          <button key={i} className={`tile ru w-full text-center text-lg ${cls(i, 'l')}`}
            onClick={() => { setSelL(i); if (sound) speak(text); attempt(i, selR) }}>
            {text}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {right.map(({ text, i }) => (
          <button key={i} className={`tile w-full text-center ${cls(i, 'r')}`} onClick={() => { setSelR(i); attempt(selL, i) }}>
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}
