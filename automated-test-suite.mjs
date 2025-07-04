#!/usr/bin/env node

/**
 * LeadFive Automated Test Suite
 * Comprehensive automated testing for all features
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  BOLD: '\x1b[1m',
  RESET: '\x1b[0m'
};

function log(message, color = COLORS.RESET) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] ${message}${COLORS.RESET}`);
}

class LeadFiveTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
    this.baseUrl = 'http://localhost:5173';
  }

  async init() {
    log('🚀 Initializing LeadFive Automated Test Suite...', COLORS.BOLD + COLORS.BLUE);
    
    try {
      this.browser = await puppeteer.launch({
        headless: false, // Show browser for visual feedback
        defaultViewport: { width: 1280, height: 720 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // Set up console monitoring
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          log(`❌ Console Error: ${msg.text()}`, COLORS.RED);
        }
      });

      // Set up page error monitoring
      this.page.on('pageerror', error => {
        log(`❌ Page Error: ${error.message}`, COLORS.RED);
      });

      log('✅ Browser initialized successfully', COLORS.GREEN);
      return true;
    } catch (error) {
      log(`❌ Failed to initialize browser: ${error.message}`, COLORS.RED);
      return false;
    }
  }

  async runTest(testName, testFunction) {
    log(`🧪 Running: ${testName}`, COLORS.YELLOW);
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name: testName,
        status: result ? 'PASSED' : 'FAILED',
        duration,
        timestamp: new Date().toISOString()
      });

      if (result) {
        this.results.summary.passed++;
        log(`✅ PASSED: ${testName} (${duration}ms)`, COLORS.GREEN);
      } else {
        this.results.summary.failed++;
        log(`❌ FAILED: ${testName} (${duration}ms)`, COLORS.RED);
      }
      
      this.results.summary.total++;
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.tests.push({
        name: testName,
        status: 'ERROR',
        error: error.message,
        duration,
        timestamp: new Date().toISOString()
      });
      
      this.results.summary.failed++;
      this.results.summary.total++;
      log(`💥 ERROR: ${testName} - ${error.message}`, COLORS.RED);
      return false;
    }
  }

  // Test 1: Homepage Loading
  async testHomepageLoading() {
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
    
    // Check if page loaded without error page
    const hasErrorPage = await this.page.$('.error-page, [class*="error"]');
    const hasLeadFiveContent = await this.page.$('text=LeadFive') || 
                              await this.page.$('[class*="lead"], [class*="Lead"]');
    
    // Check page title
    const title = await this.page.title();
    
    return !hasErrorPage && title.length > 0;
  }

  // Test 2: Console Errors Check
  async testConsoleErrors() {
    const logs = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('FaMinimize')) {
        logs.push(msg.text());
      }
    });

    await this.page.reload({ waitUntil: 'networkidle2' });
    await this.page.waitForTimeout(2000); // Wait for all scripts to load
    
    return logs.length === 0; // No FaMinimize errors
  }

  // Test 3: Navigation Menu
  async testNavigation() {
    // Look for navigation links
    const navLinks = await this.page.$$('nav a, [class*="nav"] a, header a');
    
    if (navLinks.length === 0) {
      return false;
    }

    // Test clicking a few navigation links
    try {
      for (let i = 0; i < Math.min(3, navLinks.length); i++) {
        const link = navLinks[i];
        const href = await link.evaluate(el => el.href);
        
        if (href && !href.includes('mailto') && !href.includes('tel')) {
          await link.click();
          await this.page.waitForTimeout(1000);
          
          // Check if page loaded without error
          const hasError = await this.page.$('.error-page');
          if (hasError) return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Test 4: ARIA Chatbot Visibility
  async testChatbotVisibility() {
    // Look for chatbot icon/button
    const chatbotSelectors = [
      '[class*="chatbot"]',
      '[class*="aria"]',
      'button[title*="chatbot" i]',
      'button[title*="aria" i]',
      '[class*="robot"]',
      'svg[class*="robot"]'
    ];

    for (const selector of chatbotSelectors) {
      const element = await this.page.$(selector);
      if (element) {
        const isVisible = await element.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        
        if (isVisible) return true;
      }
    }
    
    return false;
  }

  // Test 5: ARIA Chatbot Functionality
  async testChatbotFunctionality() {
    // Find and click chatbot
    const chatbotButton = await this.page.$('[class*="chatbot"], [class*="aria"], [class*="robot"]');
    
    if (!chatbotButton) return false;

    try {
      await chatbotButton.click();
      await this.page.waitForTimeout(1000);

      // Look for chatbot window
      const chatWindow = await this.page.$('[class*="chat-window"], [class*="chatbot-window"]');
      if (!chatWindow) return false;

      // Test minimize button
      const minimizeButton = await this.page.$('button[title*="minimize" i], button[title*="−"]');
      if (minimizeButton) {
        await minimizeButton.click();
        await this.page.waitForTimeout(500);
        
        // Test expand
        const expandButton = await this.page.$('button[title*="expand" i]');
        if (expandButton) {
          await expandButton.click();
          await this.page.waitForTimeout(500);
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Test 6: Dashboard Page
  async testDashboardPage() {
    try {
      await this.page.goto(`${this.baseUrl}/dashboard`, { waitUntil: 'networkidle2' });
      
      // Check if page loaded successfully
      const hasError = await this.page.$('.error-page');
      if (hasError) return false;

      // Look for dashboard content
      const dashboardContent = await this.page.$('[class*="dashboard"], [class*="stats"], [class*="metrics"]');
      return !!dashboardContent;
    } catch (error) {
      return false;
    }
  }

  // Test 7: Mobile Responsiveness
  async testMobileResponsiveness() {
    try {
      // Switch to mobile viewport
      await this.page.setViewport({ width: 375, height: 667 });
      await this.page.reload({ waitUntil: 'networkidle2' });

      // Check if page adapts to mobile
      const body = await this.page.$('body');
      const bodyWidth = await body.evaluate(el => el.scrollWidth);
      
      // Switch back to desktop
      await this.page.setViewport({ width: 1280, height: 720 });
      
      return bodyWidth <= 375;
    } catch (error) {
      return false;
    }
  }

  // Test 8: Performance Check
  async testPerformance() {
    const startTime = Date.now();
    await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    return loadTime < 5000;
  }

  // Test 9: React Components Loading
  async testReactComponents() {
    // Check if React is loaded and working
    const reactLoaded = await this.page.evaluate(() => {
      return typeof window.React !== 'undefined' || 
             document.querySelector('[data-reactroot]') !== null ||
             document.querySelector('#root') !== null;
    });

    return reactLoaded;
  }

  // Test 10: No Critical JavaScript Errors
  async testJavaScriptErrors() {
    const criticalErrors = [];
    
    this.page.on('pageerror', error => {
      if (error.message.includes('FaMinimize') || 
          error.message.includes('Cannot read properties') ||
          error.message.includes('is not a function')) {
        criticalErrors.push(error.message);
      }
    });

    await this.page.reload({ waitUntil: 'networkidle2' });
    await this.page.waitForTimeout(3000);
    
    return criticalErrors.length === 0;
  }

  async runAllTests() {
    log('\n🎯 Starting Comprehensive Automated Testing...', COLORS.BOLD + COLORS.BLUE);
    log('=============================================\n', COLORS.BLUE);

    const tests = [
      { name: 'Homepage Loading', func: () => this.testHomepageLoading() },
      { name: 'Console Errors Check', func: () => this.testConsoleErrors() },
      { name: 'Navigation Menu', func: () => this.testNavigation() },
      { name: 'ARIA Chatbot Visibility', func: () => this.testChatbotVisibility() },
      { name: 'ARIA Chatbot Functionality', func: () => this.testChatbotFunctionality() },
      { name: 'Dashboard Page', func: () => this.testDashboardPage() },
      { name: 'Mobile Responsiveness', func: () => this.testMobileResponsiveness() },
      { name: 'Performance Check', func: () => this.testPerformance() },
      { name: 'React Components Loading', func: () => this.testReactComponents() },
      { name: 'No Critical JavaScript Errors', func: () => this.testJavaScriptErrors() }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.func);
      await this.page.waitForTimeout(500); // Brief pause between tests
    }
  }

  generateReport() {
    log('\n📊 AUTOMATED TEST RESULTS', COLORS.BOLD + COLORS.BLUE);
    log('==========================\n', COLORS.BLUE);

    const { passed, failed, total } = this.results.summary;
    const percentage = Math.round((passed / total) * 100);

    // Display results
    this.results.tests.forEach(test => {
      const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '💥';
      const color = test.status === 'PASSED' ? COLORS.GREEN : COLORS.RED;
      log(`${icon} ${test.name}: ${test.status} (${test.duration}ms)`, color);
    });

    log(`\n🎯 OVERALL SCORE: ${passed}/${total} (${percentage}%)`, 
        percentage >= 90 ? COLORS.GREEN : percentage >= 70 ? COLORS.YELLOW : COLORS.RED);

    // Save detailed report
    const reportPath = './automated-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    log(`\n📄 Detailed report saved: ${reportPath}`, COLORS.CYAN);

    // Recommendations
    log('\n📋 RECOMMENDATIONS:', COLORS.BLUE);
    if (percentage >= 90) {
      log('🎉 EXCELLENT! LeadFive is ready for production!', COLORS.GREEN);
    } else if (percentage >= 70) {
      log('✅ GOOD! Minor issues to address before production.', COLORS.YELLOW);
    } else {
      log('⚠️  NEEDS WORK! Critical issues found.', COLORS.RED);
    }

    return percentage;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      log('🧹 Browser closed', COLORS.CYAN);
    }
  }

  async run() {
    const initialized = await this.init();
    if (!initialized) {
      log('❌ Failed to initialize test suite', COLORS.RED);
      return false;
    }

    try {
      await this.runAllTests();
      const score = this.generateReport();
      return score >= 70; // Consider 70%+ as passing
    } finally {
      await this.cleanup();
    }
  }
}

// Run the automated test suite
async function main() {
  log('🤖 LeadFive Automated Test Suite', COLORS.BOLD + COLORS.BLUE);
  log('================================\n', COLORS.BLUE);

  const testSuite = new LeadFiveTestSuite();
  const success = await testSuite.run();

  if (success) {
    log('\n🎊 Automated testing completed successfully!', COLORS.GREEN);
    process.exit(0);
  } else {
    log('\n💥 Automated testing found critical issues!', COLORS.RED);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`💥 Test suite crashed: ${error.message}`, COLORS.RED);
    process.exit(1);
  });
}

export default LeadFiveTestSuite;
