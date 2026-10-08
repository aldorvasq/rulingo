import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { splitGap } from '../lib/text'

export function ProgressBar({ value, color = 'var(--ok)', className = '' }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-sm bg-line ${className}`}>
      <div
        className="h-full rounded-sm transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }}
      />
    </div>
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
            <span className={`mx-1 inline-block min-w-16 border-b-2 border-current px-1 text-center ${fill ? fillClass : 'text-transparent'}`}>
              {fill ?? '____'}
            </span>
          )}
        </Fragment>
      ))}
    </span>
  )
}

/**
 * Very small markdown: paragraphs, "- " lists, **bold**, *italic*. Content is our own JSON.
 * Bold runs that contain Cyrillic are set in the Russian serif so examples stand out.
 */
export function Markdown({ text }: { text: string }) {
  const blocks = useMemo(() => text.split(/\n{2,}/), [text])
  const inline = (s: string): ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
      if (part.startsWith('**')) {
        const inner = part.slice(2, -2)
        return <strong key={i} className={/[а-яё]/i.test(inner) ? 'ru text-[1.08em]' : ''}>{inner}</strong>
      }
      if (part.startsWith('*') && part.length > 2) return <em key={i}><Mixed text={part.slice(1, -1)} /></em>
      return <Mixed key={i} text={part} ruClass="text-[1.06em]" />
    })
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
    () => Array.from({ length: 30 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 2.2 + Math.random() * 1.5,
      color: ['#2f4a6d', '#8f3b32', '#9a7a36', '#56704f'][i % 4],
      size: 5 + Math.random() * 5,
    })),
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute -top-4"
          style={{
            left: `${p.left}%`, width: p.size, height: p.size * 1.6, background: p.color,
            animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}

export function Header({ title, back, right }: { title: ReactNode; back?: () => void; right?: ReactNode }) {
  return (
    <header className="pt-safe sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
        {back && (
          <button onClick={back} className="-ml-1 p-1 text-muted" aria-label="Atrás"><Icon name="back" /></button>
        )}
        <h1 className="flex-1 truncate text-lg font-bold">{title}</h1>
        {right}
      </div>
    </header>
  )
}

const ICONS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8.5-3a8.5 8.5 0 0 0-.2-1.8l2-1.5-2-3.4-2.3.9a8.4 8.4 0 0 0-3.1-1.8L14.5 2h-5l-.4 2.4A8.4 8.4 0 0 0 6 6.2l-2.3-.9-2 3.4 2 1.5a8.6 8.6 0 0 0 0 3.6l-2 1.5 2 3.4 2.3-.9a8.4 8.4 0 0 0 3.1 1.8l.4 2.4h5l.4-2.4a8.4 8.4 0 0 0 3.1-1.8l2.3.9 2-3.4-2-1.5c.1-.6.2-1.2.2-1.8z',
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6 6 18',
  play: 'M7 4v16l13-8z',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zm0 0v16m4-14h7',
  repeat: 'M4 12a8 8 0 0 1 14-5.3L20 9m0-5v5h-5M20 12a8 8 0 0 1-14 5.3L4 15m0 5v-5h5',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  flame: 'M12 22c4 0 7-2.8 7-7 0-4.5-3.5-7-4.5-11-2 2-3 4-3 6-1-1-2-2-2.5-3.5C6.5 9 5 11.6 5 15c0 4.2 3 7 7 7z',
  chevron: 'M9 5l7 7-7 7',
  lock: 'M6 11h12v10H6zm2 0V8a4 4 0 0 1 8 0v3',
  check: 'M5 12.5l4.5 4.5L19 7',
  star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  cloud: 'M7 18a4 4 0 0 1-.6-7.96A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.5 8.5z',
  share: 'M12 3v12m0-12-4 4m4-4 4 4M5 11v9h14v-9',
  plus: 'M4 4h16v16H4zM12 8v8M8 12h8',
  install: 'M12 3v12m0 0-4-4m4 4 4-4M5 21h14',
  down: 'M5 9l7 7 7-7',
  listen: 'M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5a1 1 0 0 1-1-1zm16 0h-3v6h2a1 1 0 0 0 1-1z',
}

export function Icon({ name, size = 22, className = '' }: { name: keyof typeof ICONS | string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  )
}

/** Spanish text with embedded Russian: Cyrillic runs are set in the Russian serif. */
export function Mixed({ text, ruClass = '' }: { text: string; ruClass?: string }) {
  const parts = text.split(/([Ѐ-ӿ́]+(?:[\s\-–/][Ѐ-ӿ́]+)*)/)
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <span key={i} className={`ru ${ruClass}`}>{p}</span> : <Fragment key={i}>{p}</Fragment>))}
    </>
  )
}

/**
 * Topic titles like "Adjetivos: terminaciones (¿Какой?…)": the part before the colon is what gets
 * practised, so it's set bold in the brand colour; the detail after it stays quieter.
 */
export function TopicTitle({ title, className = '' }: { title: string; className?: string }) {
  const m = title.match(/^([^:]{2,60}):\s+(.+)$/)
  const head = m ? m[1] : title
  return (
    <span className={className}>
      <span className="font-bold text-brand"><Mixed text={head} ruClass="text-[1.06em]" /></span>
      {m && <span className="font-normal text-ink/75">: <Mixed text={m[2]} ruClass="text-[1.04em]" /></span>}
    </span>
  )
}

export function readOpen(id: string, fallback: boolean): boolean {
  try {
    const v = JSON.parse(localStorage.getItem('rulingo-ui-sections') ?? '{}')[id]
    return typeof v === 'boolean' ? v : fallback
  } catch {
    return fallback
  }
}

export function saveOpen(id: string, open: boolean) {
  try {
    const all = JSON.parse(localStorage.getItem('rulingo-ui-sections') ?? '{}')
    localStorage.setItem('rulingo-ui-sections', JSON.stringify({ ...all, [id]: open }))
  } catch {
    /* UI preference only */
  }
}

/** Collapsible section with a coloured accent; open/closed is remembered per device. */
export function Section({ id, title, hint, accent = 'var(--brand)', defaultOpen = true, children }: {
  id: string; title: ReactNode; hint?: ReactNode; accent?: string; defaultOpen?: boolean; children: ReactNode
}) {
  const [open, setOpen] = useState(() => readOpen(id, defaultOpen))
  return (
    <section className="rise mt-6">
      <button onClick={() => { setOpen(!open); saveOpen(id, !open) }} aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-md py-1.5 text-left">
        <span className="h-7 w-1.5 shrink-0 rounded-sm" style={{ background: accent }} />
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-bold leading-tight">{title}</span>
          {hint && <span className="block text-sm text-muted">{hint}</span>}
        </span>
        <Icon name="down" size={20} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </section>
  )
}

/** The app's wordmark: lowercase «ру» in the Russian serif with the book's dot. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`ru font-bold tracking-tight ${className}`} aria-label="ру">
      <span className="text-brand">ру</span><span className="text-brick">.</span>
    </span>
  )
}
