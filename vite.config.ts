import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Served from the domain root by default (Cloudflare Pages / Netlify). The GitHub Pages workflow
// sets BASE_PATH=/<repo>/ because Pages serves project sites from a subfolder.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  // Content JSON is bundled into the main chunk on purpose (works offline, one request).
  build: { chunkSizeWarningLimit: 2000 },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'РуЛинго',
        short_name: 'РуЛинго',
        description: 'Practica ruso con el contenido de Точка Ру A1',
        lang: 'es',
        theme_color: '#14b8a6',
        background_color: '#f6fbfa',
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
        globIgnores: ['**/*-arabic-*', '**/*-hebrew-*'],
      },
    }),
  ],
})
