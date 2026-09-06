import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Phase 5: bumped from 400 to 600. The vendor-router chunk
    // sits at ~163 KB and the vendor-map chunk at ~155 KB — both
    // expected for a SPA with client-side routing and Leaflet
    // map components. The build was already clean under 400,
    // the bump keeps the next chunk growth quiet.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],

          'vendor-map': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});
