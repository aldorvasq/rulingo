import { useMemo } from 'react'
import { dailyItem, nextFunFact } from '../content/culture'
import { Mixed, Section } from './ui'

/** Word of the day (or, every third day, a tongue twister) for Home. */
export function DailyCard() {
  const daily = useMemo(() => dailyItem(), [])
  if (daily.kind === 'word') {
    const w = daily.item
    return (
      <Section id="daily" title="Palabra del día" accent="var(--gold)">
        <div className="card p-4">
          <div className="ru text-3xl font-bold leading-tight">{w.ru}</div>
          <div className="mt-0.5 font-bold text-brand">{w.es}</div>
          <p className="mt-2 text-[15px] leading-relaxed text-ink/85"><Mixed text={w.note} /></p>
        </div>
      </Section>
    )
  }
  const t = daily.item
  return (
    <Section id="daily" title="Trabalenguas del día" hint="Скорогово́рка: léelo en voz alta, cada vez más rápido" accent="var(--gold)">
      <div className="card p-4">
        <p className="ru text-2xl font-bold leading-snug">{t.ru}</p>
        <p className="mt-2 text-[15px] text-muted">{t.es}</p>
        <p className="mt-2 text-sm"><span className="font-bold text-brand">Truco:</span> <Mixed text={t.tip} /></p>
      </div>
    </Section>
  )
}

/** "¿Sabías que…?" reward shown after a finished review. */
export function FunFactCard() {
  const fact = useMemo(() => nextFunFact(), [])
  return (
    <div className="card mb-3 border-l-[4px] !border-l-gold p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-bold">¿Sabías que…?</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gold">{fact.tag}</span>
      </div>
      <p className="mt-1.5 text-[15px] leading-relaxed"><Mixed text={fact.text} ruClass="text-[1.06em]" /></p>
    </div>
  )
}
