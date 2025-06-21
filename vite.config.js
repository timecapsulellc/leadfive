import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
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
    port: 3000,
    strictPort: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          blockchain: ['ethers', 'web3'],
          ui: ['lucide-react', 'framer-motion', 'react-icons'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['react-d3-tree', 'html2canvas', 'jspdf']
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
  
  // Optimizations
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'ethers', 
      'web3',
      'buffer',
      'process'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      target: 'esnext'
    }
  },

  // Handle Node.js modules and polyfills
  define: {
    global: 'globalThis',
    'process.env': 'process.env'
  }
})
