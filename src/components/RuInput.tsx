import { forwardRef, type InputHTMLAttributes } from 'react'
import { useStore } from '../state/store'
import { translitInsert } from '../lib/translit'

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!

/** Set an input's value so React's onChange fires (used by the on-screen keyboard and translit). */
export function setNativeValue(el: HTMLInputElement, value: string, caret: number) {
  valueSetter.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  requestAnimationFrame(() => el.setSelectionRange(caret, caret))
}

type Props = InputHTMLAttributes<HTMLInputElement> & { lang?: 'ru' | 'es' }

/**
 * Text input for answers. For Russian: optional Latin→Cyrillic transliteration and, when the
 * on-screen keyboard is enabled, inputMode="none" so the phone keyboard stays hidden.
 */
export const RuInput = forwardRef<HTMLInputElement, Props>(function RuInput({ lang = 'ru', className = '', onKeyDown, ...rest }, ref) {
  const translit = useStore((s) => s.settings.translit)
  const cyrKeyboard = useStore((s) => s.settings.cyrKeyboard)
  const isRu = lang === 'ru'
  return (
    <input
      ref={ref}
      lang={lang}
      data-ru-input={isRu ? '' : undefined}
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      spellCheck={false}
      inputMode={isRu && cyrKeyboard ? 'none' : 'text'}
      className={`w-full rounded-md border-[1.5px] border-line bg-card px-4 py-3 outline-none focus:border-brand ${className}`}
      onKeyDown={(e) => {
        if (isRu && translit && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const el = e.currentTarget
          const res = translitInsert(el.value, el.selectionStart ?? el.value.length, e.key)
          if (res) {
            e.preventDefault()
            setNativeValue(el, res.text, res.caret)
          }
        }
        onKeyDown?.(e)
      }}
      {...rest}
    />
  )
})
