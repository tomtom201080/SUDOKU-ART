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
        clientsClaim: true
      }
    })
  ],
  build: {
    rollupOptions: { output: { manualChunks: undefined } },
    modulePreload: { polyfill: false }
  }
})
