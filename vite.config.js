import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA désactivé temporairement pour débloquer le crash iPhone
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: { manualChunks: undefined }
    }
  }
})
