/**
 * Manual polyfills for browser compatibility
 * This replaces the problematic vite-plugin-node-polyfills
 */

// Polyfill global objects
if (typeof globalThis === 'undefined') {
  window.globalThis = window;
}

if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof process === 'undefined') {
  window.process = {
    env: {},
    browser: true,
    version: '',
    versions: { node: '' },
  };
}

// Buffer polyfill for ethers.js
if (typeof Buffer === 'undefined') {
  // Simple Buffer polyfill for browsers
  window.Buffer = {
    isBuffer: () => false,
    from: data => new Uint8Array(data),
    alloc: size => new Uint8Array(size),
    allocUnsafe: size => new Uint8Array(size),
  };
}

console.log('✅ Polyfills loaded successfully');
