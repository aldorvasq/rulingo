// Plays pre-generated recordings (public/audio). Only texts listed in the manifest get a play button,
// so the app never falls back to the phone's own (often English) voice.
import { useSyncExternalStore } from 'react'
import { audioKey } from './audioKey'

interface Manifest { v: number; clips: string[]; listening: Record<string, string> }

const BASE = import.meta.env.BASE_URL
let clips: Set<string> | null = null
let listening: Record<string, string> = {}
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const manifestReady = fetch(`${BASE}audio/manifest.json`)
  .then((r) => (r.ok ? r.json() : null))
  .then((m: Manifest | null) => {
    clips = new Set(m?.clips ?? [])
    listening = m?.listening ?? {}
    emit()
  })
  .catch(() => {
    clips = new Set()
    emit()
  })

/** Re-render once the manifest has loaded. */
export function useAudioReady() {
  return useSyncExternalStore((cb) => (listeners.add(cb), () => listeners.delete(cb)), () => clips !== null)
}

export const hasAudio = (text?: string) => !!text && !!clips?.has(audioKey(text))
export const hasListening = (id: string) => !!listening[id]

let current: HTMLAudioElement | null = null
let currentSrc = ''
const playing = new Set<() => void>()
const notifyPlaying = () => playing.forEach((l) => l())

function playSrc(src: string, rate = 1) {
  if (current && currentSrc === src && !current.paused) {
    current.pause()
    current.currentTime = 0
    notifyPlaying()
    return
  }
  current?.pause()
  current = new Audio(src)
  currentSrc = src
  current.playbackRate = rate
  current.onended = current.onpause = notifyPlaying
  current.play().catch(() => {})
  notifyPlaying()
}

export function play(text: string, rate = 1) {
  if (hasAudio(text)) playSrc(`${BASE}audio/c/${audioKey(text)}.mp3`, rate)
}

export function playListening(id: string, rate = 1) {
  if (listening[id]) playSrc(`${BASE}audio/${listening[id]}`, rate)
}

export function stopAudio() {
  current?.pause()
}

/** Whether `text` (or listening id) is the one currently playing. */
export function usePlaying(text?: string, listeningId?: string) {
  return useSyncExternalStore(
    (cb) => (playing.add(cb), () => playing.delete(cb)),
    () => {
      if (!current || current.paused) return false
      if (listeningId) return currentSrc.endsWith(listening[listeningId] ?? '\u0000')
      return !!text && currentSrc.endsWith(`/${audioKey(text)}.mp3`)
    },
  )
}
