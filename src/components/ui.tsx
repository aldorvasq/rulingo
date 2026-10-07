import { Fragment, useMemo, type ReactNode } from 'react'
import { speak } from '../lib/tts'
import { splitGap } from '../lib/text'

export function ProgressBar({ value, color = 'var(--ok)', className = '' }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-4 w-full overflow-hidden rounded-full bg-line ${className}`}>
      <div
        className="relative h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }}
      >
        <div className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/35" />
      </div>
    </div>
  )
}

export function SpeakButton({ text, size = 'md', slow = false }: { text: string; size?: 'md' | 'lg'; slow?: boolean }) {
  const big = size === 'lg'
  return (
    <button
      type="button"
      aria-label={slow ? 'Escuchar despacio' : 'Escuchar'}
      onClick={(e) => {
        e.stopPropagation()
        speak(text, slow ? 0.55 : 0.9)
      }}
      className={`btn btn-primary shrink-0 !px-0 ${big ? 'h-20 w-20 !rounded-3xl text-3xl' : 'h-10 w-10 !rounded-xl text-lg'}`}
    >
      {slow ? '🐢' : '🔊'}
    </button>
  )
}

/** Renders a sentence with ___ as a styled blank (optionally filled in after answering). */
export function GapSentence({ text, fill, fillClass = '' }: { text: string; fill?: string; fillClass?: string }) {
  const parts = splitGap(text)
  return (
    <span className="ru">
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p}
          {i < parts.length - 1 && (
            <span className={`mx-1 inline-block min-w-16 border-b-[3px] border-current px-1 text-center ${fill ? fillClass : 'text-transparent'}`}>
              {fill ?? '____'}
            </span>
          )}
        </Fragment>
      ))}
    </span>
  )
}

/** Very small markdown: paragraphs, "- " lists, **bold**, *italic*. Content is our own JSON. */
export function Markdown({ text }: { text: string }) {
  const blocks = useMemo(() => text.split(/\n{2,}/), [text])
  const inline = (s: string): ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) =>
      part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part.startsWith('*') && part.length > 2 ? <em key={i}>{part.slice(1, -1)}</em>
        : <Fragment key={i}>{part}</Fragment>,
    )
  return (
    <div className="space-y-2 leading-relaxed">
      {blocks.map((b, i) => {
        const lines = b.split('\n')
        if (lines.every((l) => /^\s*[-•]\s/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-•]\s/, ''))}</li>)}
            </ul>
          )
        }
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>)}</p>
      })}
    </div>
  )
}

export function Confetti() {
  const pieces = useMemo(
    () => Array.from({ length: 40 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 2 + Math.random() * 1.5,
      color: ['#14b8a6', '#ef4f45', '#f5b70a', '#7cbf3c', '#2b9fc9', '#9b5bb8'][i % 6],
      size: 6 + Math.random() * 6,
    })),
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute -top-4 rounded-sm"
          style={{
            left: `${p.left}%`, width: p.size, height: p.size * 1.6, background: p.color,
            animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}

export function Header({ title, back, right }: { title: string; back?: () => void; right?: ReactNode }) {
  return (
    <header className="pt-safe sticky top-0 z-20 border-b-2 border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
        {back && (
          <button onClick={back} className="text-2xl text-muted" aria-label="Atrás">←</button>
        )}
        <h1 className="flex-1 truncate text-lg font-extrabold">{title}</h1>
        {right}
      </div>
    </header>
  )
}
