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
      port: 5173,
      // Force clear browser cache on start
      force: true
    },
    
    preview: {
      host: '0.0.0.0',
      port: 8080,
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
    
    optimizeDeps: {
      include: ['ethers'],
      exclude: ['core-js', 'openai']
    },
  }
})
