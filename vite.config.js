import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    fs: {
      // Allow serving files from the engine directory
      allow: ['..', 'src/engine']
    },
    // Configure CORS to allow subdomain access
    cors: {
      origin: ['http://localhost:5173', 'http://preview.localhost:5173'],
      credentials: true
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    cors: {
      origin: ['http://localhost:4173', 'http://preview.localhost:4173'],
      credentials: true
    }
  },
  build: {
    lib: { entry: 'node_modules/react/index.js', formats: ['es'], fileName: () => 'react.js' },
    rollupOptions: {
      input: {
        main: './index.html',
        sw: './src/engine/sw.ts',
        engine: './src/engine/index.html'
      }
    }
  }
})