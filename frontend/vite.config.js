import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://fundora-ai-z6lg.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
