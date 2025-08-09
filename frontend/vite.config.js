import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Proxy API requests to the Flask backend running on port 5000. This
  // avoids CORS errors when the Vite dev server serves the React app on
  // port 5173. Any request starting with `/api` will
  // be forwarded to the backend.
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  build: {
    assetsInlineLimit: 0,
  },
})
