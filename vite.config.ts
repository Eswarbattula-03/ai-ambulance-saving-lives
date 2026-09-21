import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for LifeRescue AI
// The demo runs fully in the browser using a mock API layer (src/api/mockApi.ts).
// A Socket.IO/Express backend is provided in /server for the full-stack variant.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Optional: proxy REST calls to the Express backend when it is running.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});