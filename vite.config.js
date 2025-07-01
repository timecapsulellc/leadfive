import { defineConfig, loadEnv } from 'vite'
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
        next();
      });
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(), 
      clearCachePlugin()
    ],
    
    server: {
      host: '0.0.0.0',
      port: 5177,
      force: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5177,
        clientPort: 5177
      },
      // Clear cache headers
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    },
    
    preview: {
      host: '0.0.0.0',
      port: 8080,
    },
    
    // Optimize dependencies to prevent loading issues
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'ethers',
        'react-icons/fa',
        'react-icons/md',
        'react-icons/hi',
        'react-icons/bs',
        'react-chartjs-2',
        'chart.js',
        'chart.js/auto',
        'd3',
        'react-d3-tree',
        'gsap',
        'react-hot-toast'
      ],
      exclude: [
        'openai', // Exclude problematic dependencies
        'fs',
        'path',
        'crypto'
      ],
      force: true // Force dependency optimization
    },
    
    define: {
      'process.env': env,
      global: 'globalThis',
    },
    
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'es2020',
      rollupOptions: {
        external: (id) => {
          // Exclude problematic core-js internal modules
          if (id.includes('core-js/internals/')) {
            return true;
          }
          // Exclude OpenAI module for build issues
          if (id.includes('openai')) {
            return true;
          }
          return false;
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ethers: ['ethers']
          },
          globals: {
            'openai': 'OpenAI'
          }
        }
      }
    },
  }
})
