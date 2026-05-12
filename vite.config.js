import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // ★ 将 maplibre-gl 单独打包，减少首屏加载体积
          maplibre: ['maplibre-gl'],
        },
      },
    },
  },
});
