import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy all /api requests to the backend
      // This makes requests same-origin, solving cookie issues
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      },
      // Also proxy OAuth callbacks
      '/oauth2': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      },
      // Only proxy the OAuth2 callback path, NOT bare /login (which is a React route)
      '/login/oauth2': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
