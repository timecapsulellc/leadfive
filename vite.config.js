import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
        
        // Comprehensive security headers
        res.setHeader('Content-Security-Policy', 
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
          "style-src 'self' 'unsafe-inline' https: https://fonts.googleapis.com; " +
          "font-src 'self' data: https: https://fonts.gstatic.com; " +
          "img-src 'self' data: https: blob:; " +
          "connect-src 'self' https: wss: ws:; " +
          "frame-ancestors 'self'; " +
          "base-uri 'self'; " +
          "object-src 'none'"
        );
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
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
    react()
  ],
  
  server: {
    host: '0.0.0.0',
    port: 5175,
    strictPort: true
  },
  
  preview: {
    host: '0.0.0.0',
    port: 5175,
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
          ai: ['openai']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['ethers'],
    exclude: ['core-js']
  },
})
