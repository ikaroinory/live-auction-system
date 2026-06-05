import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@live-auction/shared': path.resolve(__dirname, '../../shared/src/index.ts'),
      },
    },
    server: {
      port: Number(env.VITE_PORT),
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
        },
        '/socket.io': {
          target: env.VITE_WS_TARGET,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})