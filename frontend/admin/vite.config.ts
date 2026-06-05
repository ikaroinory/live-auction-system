import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import semiTheming from '@douyinfe/semi-vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    semiTheming({
      theme: '@semi-bot/semi-theme-volcano_engine'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@live-auction/shared': path.resolve(__dirname, '../../shared/src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
});
