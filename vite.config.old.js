import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
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
  },
  
  // Preview configuration (for production)
  preview: {
    host: '0.0.0.0',
    port: 8080,
  },
  
  // Build configuration to handle complex dependencies
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    target: 'es2020',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: (id) => {
        // Handle problematic core-js internal dependencies
        if (id.includes('define-globalThis-property')) {
          return false;
        }
        return false;
      },
      output: {
        manualChunks: undefined, // Let Vite handle chunking automatically
      }
    }
  },
  
  // Global definitions
  define: {
    global: 'globalThis',
  },
  
  // Optimize dependency handling
  optimizeDeps: {
    include: ['ethers', 'react', 'react-dom'],
    exclude: ['@vite/client', '@vite/env']
  }
})
