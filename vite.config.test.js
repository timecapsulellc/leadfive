import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
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
    'process.env': {}
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
