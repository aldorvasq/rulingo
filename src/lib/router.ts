import { useSyncExternalStore } from 'react'

// Hash routing keeps GitHub Pages happy (no server rewrites needed): #/path?x=1

function read() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, query = ''] = raw.split('?')
  return { path, params: new URLSearchParams(query), raw }
}

let current = read()
const listeners = new Set<() => void>()
window.addEventListener('hashchange', () => {
  current = read()
  listeners.forEach((l) => l())
  window.scrollTo(0, 0)
})

export function useRoute() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}

export function navigate(to: string, replace = false) {
  const hash = '#' + to
  if (replace) window.location.replace(hash)
  else window.location.hash = to
}
