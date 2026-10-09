// Keep installed apps current. Phones often resume the app from the background instead of reloading
// it, so a new version could otherwise wait for days. We check for a new service worker when the app
// comes to the foreground and every 30 minutes, and apply it at a safe moment: right away on browsing
// screens, or as soon as the learner leaves a review (never in the middle of one).
import { registerSW } from 'virtual:pwa-register'

let pending = false
const inReview = () => window.location.hash.startsWith('#/play')

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    pending = true
    applyIfSafe()
  },
  onRegisteredSW(_url, reg) {
    if (!reg) return
    const check = () => { if (navigator.onLine) reg.update().catch(() => {}) }
    setInterval(check, 30 * 60 * 1000)
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check() })
  },
})

function applyIfSafe() {
  if (pending && !inReview()) updateSW(true) // activates the new version and reloads
}

// Leaving a review is a safe moment.
window.addEventListener('hashchange', applyIfSafe)
