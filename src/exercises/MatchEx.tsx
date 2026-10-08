import { useMemo, useState } from 'react'
import { shuffle } from '../lib/text'
import { Icon } from '../components/ui'
import type { ExProps } from './common'

const hasCyrillic = (s: string) => /[а-яё]/i.test(s)

/**
 * Two visibly different columns (Russian on tinted cards with a blue edge, the answers on white cards
 * with an ochre edge), each with a heading, and connector dots facing each other — so the task reads
 * as "join left with right" without needing the instructions. Matched pairs stay visible, numbered.
 */
export function MatchEx({ ex, autoSubmit }: ExProps<'match'>) {
  const left = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ text: p[0], i }))), [ex])
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ text: p[1], i }))), [ex])
  const [selL, setSelL] = useState<number | null>(null)
  const [selR, setSelR] = useState<number | null>(null)
  const [done, setDone] = useState<number[]>([])
  const [bad, setBad] = useState<[number, number] | null>(null)
  const [mistakes, setMistakes] = useState(0)

  const leftRu = ex.pairs.every((p) => hasCyrillic(p[0]))
  const rightRu = ex.pairs.every((p) => hasCyrillic(p[1]))
  const [leftLabel, rightLabel] = leftRu && rightRu ? ['Palabra', 'Su pareja'] : [leftRu ? 'Ruso' : 'Palabra', rightRu ? 'Ruso' : 'Español']

  const attempt = (l: number | null, r: number | null) => {
    if (l === null || r === null) return
    if (l === r) {
      const next = [...done, l]
      setDone(next)
      setSelL(null)
      setSelR(null)
      if (next.length === ex.pairs.length) {
        setTimeout(() => autoSubmit({ correct: mistakes <= 1, correctAnswer: mistakes ? `${mistakes} error(es)` : undefined }), 400)
      }
    } else {
      setMistakes((m) => m + 1)
      setBad([l, r])
      setTimeout(() => { setBad(null); setSelL(null); setSelR(null) }, 450)
    }
  }

  const state = (i: number, side: 'l' | 'r') => {
    if (done.includes(i)) return 'done'
    if (bad && bad[side === 'l' ? 0 : 1] === i) return 'bad'
    return (side === 'l' ? selL : selR) === i ? 'sel' : 'idle'
  }

  const tile = ({ text, i }: { text: string; i: number }, side: 'l' | 'r') => {
    const st = state(i, side)
    const isL = side === 'l'
    const n = done.indexOf(i) + 1
    const base = isL
      ? 'border-l-[5px] border-l-brand bg-brand-soft'
      : 'border-r-[5px] border-r-gold bg-card'
    const look = st === 'done' ? '!border-ok bg-ok-soft text-ok' : st === 'bad' ? 'tile-bad animate-shake' : st === 'sel' ? (isL ? '!border-brand ring-2 ring-brand/30' : '!border-gold ring-2 ring-gold/30') : ''
    return (
      <button key={i} disabled={st === 'done'}
        onClick={() => (isL ? (setSelL(i), attempt(i, selR)) : (setSelR(i), attempt(selL, i)))}
        className={`relative flex min-h-14 w-full items-center gap-2 rounded-md border-[1.5px] border-line px-3 py-2.5 transition-colors ${base} ${look} ${isL ? 'text-left' : 'flex-row-reverse text-right'}`}>
        <span className={`flex-1 ${hasCyrillic(text) ? 'ru text-xl' : 'text-[15px]'}`}>{text}</span>
        {st === 'done'
          ? <span className="grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-ok text-[11px] font-bold text-white">{n}</span>
          : <span className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 ${isL ? 'border-brand' : 'border-gold'} ${st === 'sel' ? (isL ? 'bg-brand' : 'bg-gold') : 'bg-card'}`} />}
      </button>
    )
  }

  return (
    <div>
      <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm font-bold">
        <span className="rounded-sm bg-brand px-2 py-1 text-center text-white">{leftLabel}</span>
        <Icon name="repeat" size={18} className="text-muted" />
        <span className="rounded-sm bg-gold px-2 py-1 text-center text-white">{rightLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
        <div className="space-y-2.5">{left.map((x) => tile(x, 'l'))}</div>
        <div className="space-y-2.5">{right.map((x) => tile(x, 'r'))}</div>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        Toca una palabra de cada columna para unirlas · {done.length} de {ex.pairs.length}
      </p>
    </div>
  )
}
