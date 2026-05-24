import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: Number(import.meta.env.VITE_PORT) || 3000,
    proxy: {
      '/api': {
        target: import.meta.env.VITE_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: import.meta.env.VITE_WS_TARGET || 'ws://localhost:8080',
        ws: true,
      },
    },
  },
})
