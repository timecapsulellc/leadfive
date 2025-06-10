import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 5175,
    strictPort: false,
    open: true,
    host: true,
    hmr: {
      port: 5176,
      protocol: 'ws',
      host: 'localhost',
    },
  },
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
    visualizer({
      filename: 'bundle-stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'OrphiChain Dashboard',
        short_name: 'OrphiChain',
        description: 'OrphiChain Dashboard - Your Web3 Dashboard',
        theme_color: '#00D4FF',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('ethers')) return 'vendor_ethers';
            if (id.includes('react-d3-tree')) return 'vendor_react-d3-tree';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  optimizeDeps: {
    include: ['ethers', 'react', 'react-dom']
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
})
