import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/archive/**',
      '**/test/CompensationPlanCompliance.test.cjs',
      '**/test/CriticalFixes.test.cjs',
      '**/test/ComprehensiveFeatureAudit.test.cjs',
      '**/archive/legacy-orphi-cleanup/**',
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
