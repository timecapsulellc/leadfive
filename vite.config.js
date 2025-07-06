import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsoleSafe from './vite-plugin-remove-console-safe'

// Clear cache plugin for development
const clearCachePlugin = () => {
  return {
    name: 'clear-cache',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Set no-cache headers for development
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        
        // Enhanced security headers with proper API access and fonts
        res.setHeader('Content-Security-Policy', 
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; " +
          "style-src 'self' 'unsafe-inline' https: https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
          "style-src-elem 'self' 'unsafe-inline' https: https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
          "font-src 'self' data: https: https://fonts.gstatic.com; " +
          "img-src 'self' data: https: blob:; " +
          "connect-src 'self' https: wss: ws: https://api.coingecko.com https://*.bsc.org https://*.binance.org https://*.infura.io https://*.alchemy.com; " +
          "frame-ancestors 'none'; " +
          "base-uri 'self'; " +
          "object-src 'none'; " +
          "media-src 'self' blob: data: https:"
        );
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        next();
      });
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Remove console statements in production (safe version)
    removeConsoleSafe(),
    // Only apply clearCache plugin in development when needed
    ...(process.env.NODE_ENV === 'development' ? [] : [])
  ],
  
  server: {
    host: '0.0.0.0',
    port: 5176,
    strictPort: true
  },
  
  preview: {
    host: '0.0.0.0',
    port: 5176,
  },
  
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
    copyPublicDir: true,
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
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['react-icons'],
          web3: ['ethers'],
          charts: ['chart.js', 'react-chartjs-2'],
          // ai: ['openai'] // Removed as we're using secure proxy
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['ethers'],
    exclude: ['core-js']
  },
})
