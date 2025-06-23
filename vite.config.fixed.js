import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'events', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    })
  ],
  
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
    port: 8080,
    strictPort: true
  },
  
  // Build configuration - SIMPLIFIED TO FIX DEPLOYMENT ERROR
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Simplified chunking to prevent variable initialization errors
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'web3': ['ethers', 'web3'],
          'ui': ['framer-motion', 'lucide-react'],
          'charts': ['chart.js', 'react-chartjs-2']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'stream': 'stream-browserify',
      'util': 'util'
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'ethers',
      'web3',
      'framer-motion',
      'lucide-react',
      'chart.js',
      'react-chartjs-2'
    ],
    exclude: ['@vite/client', '@vite/env'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  
  // Global definitions
  define: {
    global: 'globalThis',
    'process.env': {}
  }
})
