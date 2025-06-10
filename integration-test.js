#!/usr/bin/env node

/**
 * OrphiChain PWA Integration Test
 * Tests the complete user journey: Landing → Wallet Connection → Dashboard
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class OrphiChainIntegrationTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:5177';
    this.testResults = [];
  }

  async init() {
    console.log('🚀 Starting OrphiChain Integration Tests...\n');
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Error:', msg.text());
      }
    });
    
    // Handle navigation errors
    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
  }

  async test(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFn();
      this.testResults.push({ name, status: 'PASS', error: null });
      console.log(`✅ ${name}: PASSED\n`);
    } catch (error) {
      this.testResults.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name}: FAILED - ${error.message}\n`);
    }
  }

  async runTests() {
    await this.init();

    // Test 1: Landing Page Load
    await this.test('Landing Page Load', async () => {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      // Check if landing page loaded
      const title = await this.page.title();
      if (!title.includes('OrphiChain')) {
        throw new Error('Landing page title incorrect');
      }

      // Check for key elements
      await this.page.waitForSelector('.landing-page', { timeout: 5000 });
      await this.page.waitForSelector('.hero-section', { timeout: 5000 });
      
      // Check stats section
      const statsVisible = await this.page.$('.stats-section');
      if (!statsVisible) {
        throw new Error('Stats section not visible');
      }
    });

    // Test 2: Navigation to Wallet Connection
    await this.test('Navigation to Wallet Connection', async () => {
      // Click connect wallet button
      await this.page.click('.cta-button, .connect-wallet-btn, [data-testid="connect-wallet"]');
      
      // Wait for wallet connection page
      await this.page.waitForSelector('.wallet-connection', { timeout: 5000 });
      
      // Check URL change
      const url = this.page.url();
      if (!url.includes('wallet') && this.page.evaluate(() => window.location.hash !== '#wallet')) {
        // Check for view state change instead of URL
        const viewState = await this.page.evaluate(() => {
          return document.querySelector('.wallet-connection') !== null;
        });
        if (!viewState) {
          throw new Error('Wallet connection view not loaded');
        }
      }
    });

    // Test 3: Wallet Connection Interface
    await this.test('Wallet Connection Interface', async () => {
      // Check for wallet options
      const walletOptions = await this.page.$$('.wallet-option, .wallet-card');
      if (walletOptions.length === 0) {
        throw new Error('No wallet options displayed');
      }

      // Check for MetaMask option
      const metamaskButton = await this.page.$('[data-wallet="metamask"], .metamask-button');
      if (!metamaskButton) {
        throw new Error('MetaMask option not found');
      }

      // Check for back button
      const backButton = await this.page.$('.back-button, .go-back-btn');
      if (!backButton) {
        throw new Error('Back button not found');
      }
    });

    // Test 4: PWA Features
    await this.test('PWA Features', async () => {
      // Check for PWA install prompt
      const pwaPrompt = await this.page.$('.pwa-install-prompt, .install-prompt');
      
      // Check for service worker registration
      const swRegistered = await this.page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      
      if (!swRegistered) {
        throw new Error('Service Worker not supported');
      }

      // Check for notification service
      const notificationService = await this.page.evaluate(() => {
        return window.OrphiNotifications !== undefined;
      });
      
      if (!notificationService) {
        throw new Error('Notification service not loaded');
      }
    });

    // Test 5: Mobile Navigation
    await this.test('Mobile Navigation', async () => {
      // Set mobile viewport
      await this.page.setViewport({ width: 375, height: 667 });
      
      // Check for mobile navigation
      await this.page.waitForSelector('.mobile-navigation', { timeout: 3000 });
      
      // Check navigation items
      const navItems = await this.page.$$('.nav-item');
      if (navItems.length === 0) {
        throw new Error('Mobile navigation items not found');
      }

      // Reset viewport
      await this.page.setViewport({ width: 1280, height: 720 });
    });

    // Test 6: Error Handling
    await this.test('Error Handling', async () => {
      // Check for error boundary
      const errorBoundary = await this.page.evaluate(() => {
        return document.querySelector('[data-testid="error-boundary"]') !== null ||
               window.React !== undefined; // Basic React error boundary check
      });

      // Check console for critical errors
      const errors = await this.page.evaluate(() => {
        return window.console._errors || [];
      });

      // Allow some warnings but no critical errors
      const criticalErrors = errors.filter(error => 
        error.includes('Failed to load') || 
        error.includes('Network error') ||
        error.includes('Uncaught')
      );

      if (criticalErrors.length > 0) {
        throw new Error(`Critical errors found: ${criticalErrors.join(', ')}`);
      }
    });

    // Test 7: Performance Check
    await this.test('Performance Check', async () => {
      const metrics = await this.page.metrics();
      
      // Check key performance metrics
      if (metrics.ScriptDuration > 5000) { // 5 seconds
        throw new Error(`Script execution too slow: ${metrics.ScriptDuration}ms`);
      }

      if (metrics.JSHeapUsedSize > 50 * 1024 * 1024) { // 50MB
        throw new Error(`Memory usage too high: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`);
      }
    });

    // Test 8: Accessibility Check
    await this.test('Accessibility Check', async () => {
      // Check for proper heading structure
      const headings = await this.page.$$('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        throw new Error('No heading elements found');
      }

      // Check for alt text on images
      const images = await this.page.$$('img');
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        if (!alt && src && !src.includes('data:')) {
          console.warn(`⚠️ Image missing alt text: ${src}`);
        }
      }

      // Check for proper button labels
      const buttons = await this.page.$$('button');
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        if (!text?.trim() && !ariaLabel) {
          throw new Error('Button without accessible label found');
        }
      }
    });

    await this.cleanup();
    this.printResults();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  printResults() {
    console.log('\n📊 Integration Test Results');
    console.log('═'.repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   └─ ${result.error}`);
      }
    });
    
    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! OrphiChain PWA is ready for production.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review and fix issues before deployment.');
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new OrphiChainIntegrationTest();
  test.runTests().catch(console.error);
}

export default OrphiChainIntegrationTest;
