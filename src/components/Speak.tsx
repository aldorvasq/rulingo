import { hasAudio, play, useAudioReady, usePlaying } from '../lib/audio'

/** Small play button for a Russian text; renders nothing if there's no recording for it. */
export function Speak({ text, size = 'md', className = '', light = false }: { text?: string; size?: 'sm' | 'md' | 'lg'; className?: string; light?: boolean }) {
  useAudioReady()
  const active = usePlaying(text)
  if (!text || !hasAudio(text)) return null
  const dim = size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  const icon = size === 'lg' ? 26 : size === 'sm' ? 15 : 19
  return (
    <button type="button" aria-label="Escuchar" onClick={(e) => { e.stopPropagation(); play(text) }}
      className={`inline-grid shrink-0 place-items-center rounded-md transition-colors ${dim} ${light
        ? `bg-white/15 text-white hover:bg-white/25 ${active ? '!bg-white/35' : ''}`
        : `border border-brand/30 bg-brand-soft text-brand hover:bg-brand/15 ${active ? '!bg-brand !text-white' : ''}`} ${className}`}>
      <SpeakerIcon size={icon} active={active} />
    </button>
  )
}

export function SpeakerIcon({ size = 20, active = false }: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none" />
      <path d="M15.5 9a4 4 0 0 1 0 6" className={active ? 'pulse-dot' : ''} />
      <path d="M18 6.5a7.5 7.5 0 0 1 0 11" className={active ? 'pulse-dot' : ''} style={active ? { animationDelay: '0.3s' } : undefined} />
    </svg>
  )
}

/** A vocabulary word's example sentence with its own recording. */
export function ExampleLine({ example, className = '' }: { example?: { ru: string; es: string }; className?: string }) {
  if (!example) return null
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <Speak text={example.ru} size="sm" />
      <div className="min-w-0">
        <div className="ru text-[15px] leading-snug text-ink/85">{example.ru}</div>
        <div className="text-xs text-muted">{example.es}</div>
      </div>
    </div>
  )
}
