import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sudoku Art',
        short_name: 'Sudoku Art',
        theme_color: '#0F7B6C',
        background_color: '#F7F1E4',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        skipWaiting: true,
        clientsClaim: true,
        // Les pages SEO (scripts/prerender-seo.mjs) sont de vrais fichiers
        // HTML statiques distincts, chacun avec ses propres balises meta.
        // Sans cette exclusion, le service worker redirigerait toute
        // navigation vers ces routes vers le index.html mis en cache (repli
        // SPA par défaut), qui n'a pas les bonnes metas ni le bon contenu.
        navigateFallbackDenylist: [
          /^\/(comment-ca-marche|creer-un-defi-sudoku|sudoku-gratuit|sudoku-facile|sudoku-difficile|sudoku-expert|sudoku-image-cachee|sudoku-art)(\/.*)?$/
        ]
      }
    })
  ],
  build: {
    rollupOptions: { output: { manualChunks: undefined } },
    modulePreload: { polyfill: false }
  }
})
