import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Proxy API requests to the Flask backend running on port 5001. This
  // avoids CORS errors when the Vite dev server serves the React app on
  // port 5173. Any request starting with `/api` will
  // be forwarded to the backend.
  server: {
    proxy: {
      '/api': 'http://localhost:5001',
    },
    // Configuración para evitar problemas de caché en desarrollo
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
