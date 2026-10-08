import { useMemo } from 'react'
import { dailyItem, nextFunFact } from '../content/culture'
import { Mixed } from './ui'
import { Speak } from './Speak'

/** Stylised folk flower (Gzhel-style petals and curls), drawn in currentColor. */
function Ornament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden fill="currentColor">
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-26} rx={7} ry={16} transform={`rotate(${i * 36})`} opacity={0.9} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={`s${i}`} cx={0} cy={-41} rx={2.6} ry={5} transform={`rotate(${i * 36 + 18})`} />
      ))}
      <circle r={13} fill="none" stroke="currentColor" strokeWidth={2.5} />
      <circle r={6} />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={`d${i}`} cx={0} cy={-9.5} r={1.4} transform={`rotate(${i * 36})`} />
      ))}
    </svg>
  )
}

/**
 * Word of the day — the one loud element on Home. Words get a Gzhel palette (cobalt and white),
 * tongue twisters a Khokhloma one (black, red and gold).
 */
export function DailyHero() {
  const daily = useMemo(() => dailyItem(), [])
  const twister = daily.kind === 'twister'
  return (
    <section
      className="daily-hero relative mt-2 overflow-hidden rounded-xl p-5 pb-8 text-white shadow-[0_10px_30px_-12px_rgba(20,30,60,0.6)]"
      style={{
        background: twister
          ? 'radial-gradient(120% 90% at 100% 0%, #b3261e 0%, #6e1712 45%, #1e1210 100%)'
          : 'radial-gradient(120% 90% at 100% 0%, #3f74d4 0%, #1f4ea3 45%, #142d63 100%)',
      }}>
      <Ornament className={`spin-slow pointer-events-none absolute -top-14 -right-14 h-52 w-52 ${twister ? 'text-[#e8b84a]/30' : 'text-white/25'}`} />
      <Ornament className={`spin-slow-rev pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 ${twister ? 'text-[#e8b84a]/20' : 'text-white/15'}`} />

      {/* Gold inner frame and a folk-pattern band along the bottom edge. */}
      <div className={`pointer-events-none absolute inset-1.5 rounded-lg border ${twister ? 'border-[#e8b84a]/45' : 'border-[#f3cf73]/40'}`} />
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-4 w-full" preserveAspectRatio="none" viewBox="0 0 400 16" aria-hidden>
        <rect width="400" height="16" fill={twister ? '#e8b84a' : '#f3cf73'} opacity={0.22} />
        {Array.from({ length: 20 }, (_, i) => (
          <g key={i} transform={`translate(${i * 20 + 10} 8)`} fill={twister ? '#e8b84a' : '#ffffff'} opacity={0.75}>
            <path d="M0 -5 L4 0 L0 5 L-4 0 Z" />
            <circle cx="10" cy="0" r="1.6" />
          </g>
        ))}
      </svg>

      <div className="relative">
        <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.14em] text-[#f3cf73]">
          <span className="inline-block h-px w-6 bg-[#f3cf73]" />
          {twister ? <>Скорогово́рка дня · <span className="normal-case tracking-normal">Trabalenguas del día</span></>
            : <>Сло́во дня · <span className="normal-case tracking-normal">Palabra del día</span></>}
        </div>

        {daily.kind === 'word' && daily.season && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-sm bg-white/15 px-2 py-0.5 text-xs font-bold">
            <span className="ru">{daily.season.ru}</span> · {daily.season.es}
          </div>
        )}
        {daily.kind === 'word' ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              <div className="ru shimmer-text text-[3.2rem] font-bold leading-none [text-shadow:0_2px_12px_rgba(0,0,0,0.25)]">{daily.item.ru}</div>
              <Speak text={daily.item.ru} light size="md" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#f3cf73]">{daily.item.es}</div>
            <p className="mt-3 text-[15px] leading-relaxed text-white/90"><Mixed text={daily.item.note} ruClass="text-[1.06em] font-bold" /></p>
          </>
        ) : (
          <>
            <p className="ru mt-3 text-[1.75rem] font-bold leading-snug [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]">{daily.item.ru}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/85"><Speak text={daily.item.ru} light /> Escúchalo primero, luego repítelo.</div>
            <p className="mt-3 text-[15px] text-white/85">{daily.item.es}</p>
            <p className="mt-3 inline-block rounded-md bg-black/25 px-3 py-1.5 text-sm">
              <span className="font-bold text-[#f3cf73]">Reto:</span> léelo en voz alta tres veces, cada vez más rápido. <Mixed text={daily.item.tip} />
            </p>
          </>
        )}
      </div>
    </section>
  )
}

/** "¿Sabías que…?" reward shown after a finished review. */
export function FunFactCard() {
  const fact = useMemo(() => nextFunFact(), [])
  return (
    <div className="card rise mb-3 border-l-[4px] !border-l-gold p-4" style={{ animationDelay: '250ms' }}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-bold">¿Sabías que…?</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gold">{fact.tag}</span>
      </div>
      <p className="mt-1.5 text-[15px] leading-relaxed"><Mixed text={fact.text} ruClass="text-[1.06em]" /></p>
    </div>
  )
}
