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
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          blockchain: ['ethers', 'web3'],
          ui: ['lucide-react', 'framer-motion', 'react-icons'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['react-d3-tree', 'html2canvas', 'jspdf']
        }
      },
      external: [],
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
      exclude: [/node_modules\/core-js/],
    },
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@contracts': resolve(__dirname, './src/contracts'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
      // Fix for core-js issues
      'core-js-pure': 'core-js',
    }
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'ethers',
      'web3',
      'buffer',
      'process',
    ],
    exclude: ['core-js'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },

  // Handle Node.js modules and polyfills
  define: {
    global: 'globalThis'
  }
})
