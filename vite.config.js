// vite.config.js (Updated: Proxy /api to your hosted Express backend at https://api.merdannotfound.ru)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.merdannotfound.ru',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});