import { useState } from 'react'
import { useStore } from '../state/store'
import { setNativeValue } from './RuInput'
import { TRANSLIT_HELP } from '../lib/translit'

const ROWS = [
  'йцукенгшщзхъ'.split(''),
  'фывапролджэ'.split(''),
  'ячсмитьбюё'.split(''),
]

/** Types into whichever Russian answer input is focused (or the first one on screen). */
function target(): HTMLInputElement | null {
  const active = document.activeElement
  if (active instanceof HTMLInputElement && active.hasAttribute('data-ru-input')) return active
  return document.querySelector<HTMLInputElement>('input[data-ru-input]:not([disabled])')
}

function insert(text: string | null) {
  const el = target()
  if (!el) return
  el.focus()
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? start
  if (text === null) {
    if (start === end && start === 0) return
    const from = start === end ? start - 1 : start
    setNativeValue(el, el.value.slice(0, from) + el.value.slice(end), from)
  } else {
    setNativeValue(el, el.value.slice(0, start) + text + el.value.slice(end), start + text.length)
  }
}

export function KeyboardToggle() {
  const on = useStore((s) => s.settings.cyrKeyboard)
  const translit = useStore((s) => s.settings.translit)
  const update = useStore((s) => s.updateSettings)
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <button type="button" onClick={() => update({ cyrKeyboard: !on })} className={`chip ${on ? 'tile-selected' : ''}`}>
        Teclado ЙЦУКЕН
      </button>
      <button type="button" title={TRANSLIT_HELP} onClick={() => update({ translit: !translit })} className={`chip ${translit ? 'tile-selected' : ''}`}>
        abc→абв
      </button>
    </div>
  )
}

export function CyrillicKeyboard({ disabled = false }: { disabled?: boolean }) {
  const on = useStore((s) => s.settings.cyrKeyboard)
  const [upper, setUpper] = useState(false)
  if (!on) return null
  const key = (label: string, onPress: () => void, extra = '') => (
    <button
      key={label}
      type="button"
      disabled={disabled}
      // Keep focus (and caret) in the input while tapping keys.
      onPointerDown={(e) => e.preventDefault()}
      onClick={onPress}
      className={`ru h-11 min-w-0 flex-1 rounded-sm border border-line bg-card text-lg active:translate-y-px active:bg-soft disabled:opacity-40 ${extra}`}
    >
      {label}
    </button>
  )
  return (
    <div className="mt-3 select-none space-y-1.5 rounded-md bg-soft p-1.5">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {i === 2 && key(upper ? '⇧' : '⇪', () => setUpper(!upper), 'max-w-12 text-base')}
          {row.map((ch) => {
            const c = upper ? ch.toUpperCase() : ch
            return key(c, () => { insert(c); setUpper(false) })
          })}
          {i === 2 && key('⌫', () => insert(null), 'max-w-12 text-base')}
        </div>
      ))}
      <div className="flex gap-1">
        {key('-', () => insert('-'), 'max-w-14')}
        {key('espacio', () => insert(' '), 'text-sm text-muted')}
        {key(',', () => insert(','), 'max-w-14')}
        {key('?', () => insert('?'), 'max-w-14')}
      </div>
    </div>
  )
}
