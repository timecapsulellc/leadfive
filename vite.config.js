import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  envPrefix: 'VITE_',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      process: "process/browser",
      stream: "stream-browserify",
      util: "util",
      events: "events"
    }
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'events']
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all'
  },
  preview: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all',
    strictPort: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          web3: ['ethers', '@walletconnect/ethereum-provider', '@walletconnect/modal'],
          ui: ['react-toastify']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  base: './'
})
