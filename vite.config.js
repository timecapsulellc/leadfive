import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  
  preview: {
    host: '0.0.0.0',
    port: 8080,
  },
  
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      external: (id) => {
        // Exclude problematic core-js internal modules
        if (id.includes('core-js/internals/')) {
          return true;
        }
        return false;
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ethers: ['ethers']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['ethers'],
    exclude: ['core-js']
  },
})
