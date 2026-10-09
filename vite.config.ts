import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Served from the domain root by default (Cloudflare Pages / Netlify). The GitHub Pages workflow
// sets BASE_PATH=/<repo>/ because Pages serves project sites from a subfolder.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  // Build stamp (visible as window.__BUILD__) — handy to confirm which version a phone is running.
  define: { __BUILD__: JSON.stringify(new Date().toISOString()) },
  // Content JSON is bundled into the main chunk on purpose (works offline, one request).
  build: { chunkSizeWarningLimit: 2000 },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt': we decide when to apply an update (src/lib/updates.ts), so a review is never interrupted.
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ру · práctica de ruso',
        short_name: 'ру',
        description: 'Practica ruso con el contenido de Точка Ру A1',
        lang: 'es',
        theme_color: '#2f4a6d',
        background_color: '#f3f0e9',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Only the Latin + Cyrillic font subsets are ever needed offline.
        globIgnores: ['**/*-arabic-*', '**/*-hebrew-*', 'audio/**'],
        // Recordings are fetched when first played, then kept for offline use.
        runtimeCaching: [
          { urlPattern: /\/audio\/manifest\.json$/, handler: 'NetworkFirst', options: { cacheName: 'audio-manifest' } },
          { urlPattern: /\/audio\/.*\.mp3$/, handler: 'CacheFirst', options: { cacheName: 'audio', expiration: { maxEntries: 4000 }, rangeRequests: true } },
        ],
      },
    }),
  ],
})
