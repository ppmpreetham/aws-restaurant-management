import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/restaurants': 'http://localhost:8001',
      '/api/reservations': 'http://localhost:8002',
      '/api/orders': 'http://localhost:8003',
      '/api/auth': 'http://localhost:8003',
      '/api/users': 'http://localhost:8003',
      '/api/search': 'http://localhost:8004',
    }
  }
})
