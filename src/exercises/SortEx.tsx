import { useState } from 'react'
import { normalizeRu } from '../lib/text'
import { sfx } from '../lib/sound'
import { speak } from '../lib/tts'
import { useStore } from '../state/store'
import type { ExProps } from './common'

/** One word at a time; tap the category it belongs to. */
export function SortEx({ ex, autoSubmit }: ExProps<'sort'>) {
  const [idx, setIdx] = useState(0)
  const [flash, setFlash] = useState<{ cat: string; ok: boolean } | null>(null)
  const [wrong, setWrong] = useState<string[]>([])
  const sound = useStore((s) => s.settings.sound)
  const item = ex.entries[idx]
  const same = (a: string, b: string) => normalizeRu(a) === normalizeRu(b)

  const choose = (cat: string) => {
    if (flash || !item) return
    const ok = same(cat, item.category)
    if (sound) (ok ? sfx.tap : sfx.wrong)()
    const nextWrong = ok ? wrong : [...wrong, `${item.text} → ${item.category}`]
    setWrong(nextWrong)
    setFlash({ cat, ok })
    setTimeout(() => {
      setFlash(null)
      if (idx + 1 >= ex.entries.length) {
        autoSubmit({ correct: nextWrong.length === 0, correctAnswer: nextWrong.join(' · ') || undefined })
      } else setIdx(idx + 1)
    }, ok ? 350 : 1100)
  }

  return (
    <div>
      <div className="mb-2 flex justify-center gap-1.5">
        {ex.entries.map((_, i) => (
          <span key={i} className={`h-2 w-6 rounded-full ${i < idx ? 'bg-brand' : i === idx ? 'bg-brand/50' : 'bg-line'}`} />
        ))}
      </div>
      <div className="my-8 flex justify-center">
        {item && (
          <button key={idx} onClick={() => speak(item.text)}
            className={`card ru animate-pop px-8 py-6 text-3xl font-extrabold ${flash ? (flash.ok ? 'tile-ok' : 'tile-bad animate-shake') : ''}`}>
            {item.text}
          </button>
        )}
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${ex.categories.length > 3 ? 2 : ex.categories.length}, minmax(0, 1fr))` }}>
        {ex.categories.map((c) => {
          const isAnswer = flash && !flash.ok && same(c, item.category)
          return (
            <button key={c} onClick={() => choose(c)}
              className={`tile ru py-5 text-center text-xl ${flash?.cat === c ? (flash.ok ? 'tile-ok' : 'tile-bad') : ''} ${isAnswer ? 'tile-ok' : ''}`}>
              {c}
            </button>
          )
        })}
      </div>
    </div>
  )
}
