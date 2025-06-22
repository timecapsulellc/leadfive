import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.ethereum for Web3 tests
global.window = global.window || {};
global.window.ethereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  isMetaMask: true
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock crypto for encryption tests
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn(() => new Uint8Array(32)),
    subtle: {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn()
    }
  }
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 50, // 50MB
      jsHeapSizeLimit: 1024 * 1024 * 100, // 100MB
    },
  },
  writable: true,
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock performance for performance monitoring tests
global.performance = global.performance || {
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn(),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
};

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn()
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
};
