import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/predict': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/info': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/report': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
