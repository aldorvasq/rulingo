import { stripStress } from './text'

let voice: SpeechSynthesisVoice | null = null

function pickVoice() {
  if (!('speechSynthesis' in window)) return
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ru'))
  // Prefer higher-quality voices when the platform exposes them.
  voice = voices.find((v) => /premium|enhanced|google/i.test(v.name)) ?? voices[0] ?? null
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice()
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

export const ttsAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export const hasRussianVoice = () => {
  pickVoice()
  return voice !== null
}

export function speak(text: string, rate = 0.9) {
  if (!ttsAvailable()) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(stripStress(text).replace(/_{2,}/g, '…'))
  u.lang = 'ru-RU'
  if (voice) u.voice = voice
  u.rate = rate
  speechSynthesis.speak(u)
}
