import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Test utilities and helpers
export const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

export const renderWithRouter = (component, options = {}) => {
  return render(component, {
    wrapper: TestWrapper,
    ...options
  });
};

// Mock Web3 provider for testing
export const createMockProvider = () => ({
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  getNetwork: vi.fn(() => Promise.resolve({ chainId: 56, name: 'bsc' })),
  getBalance: vi.fn(() => Promise.resolve('1000000000000000000')),
  getSigner: vi.fn(() => ({
    getAddress: vi.fn(() => Promise.resolve('0x123...'))
  }))
});

// Mock contract for testing
export const createMockContract = () => ({
  address: '0x123...',
  balanceOf: vi.fn(() => Promise.resolve('1000000000000000000')),
  transfer: vi.fn(() => Promise.resolve({ hash: '0x456...' })),
  estimateGas: {
    transfer: vi.fn(() => Promise.resolve('21000'))
  }
});

// Performance testing helpers
export const measureRenderTime = async (component) => {
  const start = performance.now();
  render(component);
  const end = performance.now();
  return end - start;
};

// Accessibility testing helpers
export const checkAccessibility = async (component) => {
  const { container } = render(component);
  
  // Check for common accessibility issues
  const results = {
    hasAriaLabels: container.querySelectorAll('[aria-label]').length > 0,
    hasSemanticElements: container.querySelectorAll('h1, h2, h3, button, nav, main, section').length > 0,
    hasAltText: Array.from(container.querySelectorAll('img')).every(img => img.hasAttribute('alt')),
    hasKeyboardSupport: container.querySelectorAll('[tabindex], button, input, select, textarea, a').length > 0
  };

  return results;
};

// Error boundary testing
export const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Custom matchers for testing
export const customMatchers = {
  toBeAccessible: (received) => {
    const accessibility = checkAccessibility(received);
    const pass = Object.values(accessibility).every(Boolean);
    
    return {
      message: () => `Expected component to be accessible. Issues: ${JSON.stringify(accessibility)}`,
      pass
    };
  },
  
  toRenderWithinTime: (received, maxTime) => {
    const renderTime = measureRenderTime(received);
    const pass = renderTime <= maxTime;
    
    return {
      message: () => `Expected component to render within ${maxTime}ms, but took ${renderTime}ms`,
      pass
    };
  }
};

// Integration test helpers
export const waitForNetworkResponse = (timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Network response timeout'));
    }, timeout);

    // Simulate network response
    setTimeout(() => {
      clearTimeout(timer);
      resolve({ success: true });
    }, 100);
  });
};

// Smart contract testing helpers
export const simulateContractCall = async (contract, method, args = []) => {
  try {
    const result = await contract[method](...args);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Performance benchmarking
export class PerformanceBenchmark {
  constructor(name) {
    this.name = name;
    this.measurements = [];
  }

  async measure(fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    const measurement = {
      duration: end - start,
      timestamp: Date.now()
    };
    
    this.measurements.push(measurement);
    return { result, measurement };
  }

  getStats() {
    if (this.measurements.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }

    const durations = this.measurements.map(m => m.duration);
    return {
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      count: this.measurements.length
    };
  }
}

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  address: '0x1234567890abcdef1234567890abcdef12345678',
  balance: '1000000000000000000',
  referrals: 5,
  packages: ['basic'],
  joinDate: Date.now(),
  ...overrides
});

export const generateMockTransaction = (overrides = {}) => ({
  hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  from: '0x1234567890abcdef1234567890abcdef12345678',
  to: '0x9876543210fedcba9876543210fedcba98765432',
  value: '1000000000000000000',
  gasUsed: '21000',
  timestamp: Date.now(),
  status: 'confirmed',
  ...overrides
});

export {
  render,
  screen,
  fireEvent,
  waitFor,
  userEvent,
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
};
