import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/google-tasks-api': {
        target: 'https://tasks.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-tasks-api/, ''),
      },
    },
  },
})
