// Plays pre-generated recordings (public/audio). Only texts listed in the manifest get a play button,
// so the app never falls back to the phone's own (often English) voice.
import { useSyncExternalStore } from 'react'
import { audioKey } from './audioKey'

export interface ListeningAudio { file: string; starts: number[]; speakers: string[] }
interface Manifest { v: number; clips: string[]; listening: Record<string, ListeningAudio | string> }

const BASE = import.meta.env.BASE_URL
let clips: Set<string> | null = null
let listening: Record<string, ListeningAudio> = {}
const readyListeners = new Set<() => void>()

export const manifestReady = fetch(`${BASE}audio/manifest.json`)
  .then((r) => (r.ok ? r.json() : null))
  .then((m: Manifest | null) => {
    clips = new Set(m?.clips ?? [])
    listening = Object.fromEntries(
      Object.entries(m?.listening ?? {}).map(([id, v]) => [id, typeof v === 'string' ? { file: v, starts: [], speakers: [] } : v]),
    )
  })
  .catch(() => {
    clips = new Set()
  })
  .finally(() => readyListeners.forEach((l) => l()))

/** Re-render once the manifest has loaded. */
export function useAudioReady() {
  return useSyncExternalStore((cb) => (readyListeners.add(cb), () => readyListeners.delete(cb)), () => clips !== null)
}

export const hasAudio = (text?: string) => !!text && !!clips?.has(audioKey(text))
export const hasListening = (id: string) => !!listening[id]
export const listeningInfo = (id: string): ListeningAudio | undefined => listening[id]

// ---------------------------------------------------------------- one shared player

interface PlayerState { src: string; playing: boolean; time: number; duration: number; rate: number }
let el: HTMLAudioElement | null = null
let state: PlayerState = { src: '', playing: false, time: 0, duration: 0, rate: 1 }
const stateListeners = new Set<() => void>()
const setState = (patch: Partial<PlayerState>) => {
  state = { ...state, ...patch }
  stateListeners.forEach((l) => l())
}

function load(src: string) {
  el?.pause()
  el = new Audio(src)
  el.preload = 'auto'
  el.playbackRate = state.rate
  const sync = () => el && setState({ playing: !el.paused && !el.ended, time: el.currentTime, duration: Number.isFinite(el.duration) ? el.duration : state.duration })
  el.addEventListener('timeupdate', sync)
  el.addEventListener('play', sync)
  el.addEventListener('pause', sync)
  el.addEventListener('ended', sync)
  el.addEventListener('loadedmetadata', sync)
  setState({ src, playing: false, time: 0, duration: 0 })
}

/** Start (or restart) `src`; tapping the same short clip while it plays stops it. */
function playSrc(src: string, restartToggle = true) {
  if (el && state.src === src && !el.paused) {
    if (restartToggle) { el.pause(); el.currentTime = 0 }
    return
  }
  if (!el || state.src !== src) load(src)
  el!.play().catch(() => {})
}

export function play(text: string) {
  if (hasAudio(text)) {
    setState({ rate: 1 })
    playSrc(`${BASE}audio/c/${audioKey(text)}.mp3`)
  }
}

export const listeningSrc = (id: string) => (listening[id] ? `${BASE}audio/${listening[id].file}` : '')

/** Play / pause a listening piece (keeps position when paused). */
export function toggleListening(id: string) {
  const src = listeningSrc(id)
  if (!src) return
  if (state.src !== src) load(src)
  if (el!.paused) {
    if (el!.ended) el!.currentTime = 0
    el!.play().catch(() => {})
  } else el!.pause()
}

export function seekListening(id: string, t: number) {
  const src = listeningSrc(id)
  if (!src) return
  if (state.src !== src) load(src)
  el!.currentTime = Math.max(0, t)
  setState({ time: el!.currentTime })
}

export function setRate(rate: number) {
  if (el) el.playbackRate = rate
  setState({ rate })
}

export function stopAudio() {
  el?.pause()
}

export function useAudioState(): PlayerState {
  return useSyncExternalStore((cb) => (stateListeners.add(cb), () => stateListeners.delete(cb)), () => state)
}

/** Whether `text` (or listening id) is the one currently playing. */
export function usePlaying(text?: string, listeningId?: string) {
  const s = useAudioState()
  if (!s.playing) return false
  if (listeningId) return s.src === listeningSrc(listeningId)
  return !!text && s.src.endsWith(`/${audioKey(text)}.mp3`)
}

// Back-compat for earlier callers.
export const playListening = (id: string) => toggleListening(id)
