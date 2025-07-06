import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsoleSafe from './vite-plugin-remove-console-safe'
import bundleAnalyzer from './vite-plugin-bundle-analyzer'

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
    // Remove console statements in production (safe version) - TEMPORARILY DISABLED FOR DEBUGGING
    // removeConsoleSafe(),
    // Bundle analyzer for optimization insights
    bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' }),
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
        manualChunks(id) {
          // Core vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Web3 libraries
            if (id.includes('ethers') || id.includes('@ethersproject')) {
              return 'web3-vendor';
            }
            // Charting libraries
            if (id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'charts-vendor';
            }
            // Icon libraries
            if (id.includes('react-icons')) {
              return 'icons-vendor';
            }
            // D3 for genealogy visualization
            if (id.includes('d3')) {
              return 'd3-vendor';
            }
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('yup')) {
              return 'forms-vendor';
            }
            // UI libraries
            if (id.includes('react-toastify') || id.includes('react-modal')) {
              return 'ui-vendor';
            }
            // Everything else from node_modules
            return 'vendor';
          }
          
          // Application code splitting by feature
          if (id.includes('src/')) {
            // Services
            if (id.includes('src/services/')) {
              if (id.includes('Web3') || id.includes('Contract')) {
                return 'services-web3';
              }
              if (id.includes('AI') || id.includes('OpenAI') || id.includes('ElevenLabs')) {
                return 'services-ai';
              }
              return 'services';
            }
            // Components by feature
            if (id.includes('src/components/')) {
              if (id.includes('Genealogy') || id.includes('Tree')) {
                return 'components-genealogy';
              }
              if (id.includes('Wallet') || id.includes('Web3')) {
                return 'components-web3';
              }
              if (id.includes('AI') || id.includes('Chat')) {
                return 'components-ai';
              }
              if (id.includes('enhanced/')) {
                return 'components-enhanced';
              }
              if (id.includes('admin/')) {
                return 'components-admin';
              }
            }
            // Utils
            if (id.includes('src/utils/')) {
              return 'utils';
            }
            // Hooks
            if (id.includes('src/hooks/')) {
              return 'hooks';
            }
          }
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/${chunkInfo.name || facadeModuleId}-[hash].js`;
        },
        // Optimize asset names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          } else {
            return `assets/[name]-[hash][extname]`;
          }
        }
      }
    },
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // TEMPORARILY DISABLED FOR DEBUGGING
        drop_debugger: true,
        // pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'] // DISABLED
      },
      format: {
        comments: false
      }
    }
  },
  
  optimizeDeps: {
    include: ['ethers'],
    exclude: ['core-js']
  },
})
