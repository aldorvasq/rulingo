import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/install' // capture the install prompt as early as possible
import './lib/updates' // check for and apply new versions
import App from './App'

declare const __BUILD__: string
;(window as unknown as { __BUILD__: string }).__BUILD__ = __BUILD__

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
