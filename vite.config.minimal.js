import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Server configuration
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  
  // Preview configuration (for production)
  preview: {
    host: '0.0.0.0',
    port: 8080,
  },
  
  // Very basic build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    target: 'es2020',
  },
  
  // Global definitions
  define: {
    global: 'globalThis',
  }
})
