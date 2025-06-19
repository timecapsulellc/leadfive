import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Server configuration
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    }
  },
  
  // Preview configuration (for production)
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ethers: ['ethers'],
          ui: ['lucide-react', 'framer-motion']
        }
      }
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@contracts': resolve(__dirname, './src/contracts'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets')
    }
  },
  
  // Environment variables
  define: {
    global: 'globalThis',
  },
  
  // Optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'ethers']
  }
})
