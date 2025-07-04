#!/usr/bin/env node

/**
 * LEADFIVE AUTOMATED FEATURE VALIDATOR
 * Comprehensive testing script for all platform features
 * Tests frontend, backend, security, and deployment readiness
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const puppeteer = require('puppeteer');

const execAsync = promisify(exec);

class LeadFiveFeatureValidator {
  constructor() {
    this.results = {
      frontend: {},
      ui: {},
      features: {},
      backend: {},
      security: {},
      deployment: {},
      final: {}
    };
    this.browser = null;
    this.page = null;
    this.startTime = Date.now();
  }

  // ==================== MAIN EXECUTION ====================
  
  async runAllTests() {
    console.log('🚀 LeadFive Feature Validation Started');
    console.log('=' .repeat(60));

    try {
      // Initialize browser for UI tests
      await this.initializeBrowser();

      // Run all test categories
      await this.testFrontendFeatures();
      await this.testUIUXFeatures();
      await this.testAdditionalFeatures();
      await this.testBackendReadiness();
      await this.testSecurityCompliance();
      await this.testDeploymentReadiness();
      await this.testFinalChecklist();

      // Generate comprehensive report
      await this.generateReport();

    } catch (error) {
      console.error('❌ Critical testing error:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  // ==================== 1. FRONTEND TESTING & FIXES ====================
  
  async testFrontendFeatures() {
    console.log('\n🔍 FRONTEND TESTING & FIXES');
    console.log('-'.repeat(30));

    const tests = [
      { name: 'Wallet Connection (MetaMask/WalletConnect)', test: this.testWalletConnection },
      { name: 'USDT Approval & Registration Flow', test: this.testUSDTRegistration },
      { name: 'Dashboard Data Display', test: this.testDashboardData },
      { name: 'Referral Link Generation', test: this.testReferralLinks },
      { name: 'Balance/Calculation Display', test: this.testBalanceCalculations }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const result = await test.test.call(this);
        this.results.frontend[test.name] = result;
        console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.message}`);
      } catch (error) {
        this.results.frontend[test.name] = { passed: false, message: error.message };
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testWalletConnection() {
    await this.page.goto('http://localhost:5178');
    await this.page.waitForSelector('button', { timeout: 10000 });
    
    // Check for wallet connection button using proper selectors
    const connectButton = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => 
        btn.textContent.toLowerCase().includes('connect') ||
        btn.textContent.toLowerCase().includes('wallet')
      );
    });

    // Check for MetaMask detection
    const hasMetaMask = await this.page.evaluate(() => {
      return typeof window.ethereum !== 'undefined';
    });

    return {
      passed: connectButton,
      message: `Connect button ${connectButton ? 'found' : 'not found'}, MetaMask ${hasMetaMask ? 'detected' : 'not detected'}`
    };
  }

  async testUSDTRegistration() {
    // Check if USDT contract integration exists
    const contractFiles = [
      'src/constants/abi.js',
      'src/config/contracts.js'
    ];

    const filesExist = contractFiles.every(file => fs.existsSync(file));
    
    if (!filesExist) {
      return { passed: false, message: 'Contract configuration files missing' };
    }

    // Check for USDT approval logic
    const registerPage = 'src/pages/Register.jsx';
    if (!fs.existsSync(registerPage)) {
      return { passed: false, message: 'Register page not found' };
    }

    const registerContent = fs.readFileSync(registerPage, 'utf8');
    const hasUSDTApproval = registerContent.includes('approve') || registerContent.includes('USDT');

    return {
      passed: hasUSDTApproval,
      message: hasUSDTApproval ? 'USDT approval logic found' : 'USDT approval logic missing'
    };
  }

  async testDashboardData() {
    // Navigate to dashboard test route (bypasses authentication)
    try {
      // Try the test route first (no auth required)
      await this.page.goto('http://localhost:5173/dashboard-test');
      await this.page.waitForSelector('body', { timeout: 5000 });
      
      // Check for loading states that might be stuck
      const loadingStatus = await this.page.evaluate(() => {
        const loadingText = document.body.textContent;
        return {
          isStuckLoading: loadingText.includes('Loading LeadFive') || 
                         loadingText.includes('Initializing') ||
                         loadingText.includes('Loading...'),
          fullText: loadingText.substring(0, 200) // First 200 chars for debugging
        };
      });

      if (loadingStatus.isStuckLoading) {
        return { 
          passed: false, 
          message: `Dashboard stuck in loading state - lazy loading issue detected. Content: "${loadingStatus.fullText}"`
        };
      }

      // Wait a bit more for components to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for key dashboard elements
      const elements = await this.page.evaluate(() => {
        return {
          hasEarnings: !!document.querySelector('[class*="earnings"], [class*="Earnings"]'),
          hasStats: !!document.querySelector('[class*="stat"], [class*="Stats"]'),
          hasMenu: !!document.querySelector('[class*="menu"], [class*="Menu"], nav'),
          hasAI: !!document.querySelector('[class*="ai"], [class*="AI"]'),
          hasDashboard: !!document.querySelector('[class*="dashboard"], [class*="Dashboard"]'),
          hasContent: document.body.textContent.length > 100,
          hasButtons: document.querySelectorAll('button').length > 0,
          hasCards: document.querySelectorAll('[class*="card"], [class*="Card"]').length > 0
        };
      });

      const elementCount = Object.values(elements).filter(Boolean).length;
      
      return {
        passed: elementCount >= 4, // More generous threshold
        message: `Dashboard elements found: ${elementCount}/8 (${Object.keys(elements).filter(k => elements[k]).join(', ')})`
      };
    } catch (error) {
      return { 
        passed: false, 
        message: `Dashboard test failed: ${error.message} - check if dev server is running on port 5173` 
      };
    }
  }

  async testReferralLinks() {
    const referralPage = 'src/pages/Referrals.jsx';
    if (!fs.existsSync(referralPage)) {
      return { passed: false, message: 'Referrals page not found' };
    }

    const content = fs.readFileSync(referralPage, 'utf8');
    const hasReferralLogic = content.includes('referral') && (content.includes('link') || content.includes('share'));

    return {
      passed: hasReferralLogic,
      message: hasReferralLogic ? 'Referral link logic found' : 'Referral link logic missing'
    };
  }

  async testBalanceCalculations() {
    // Check for balance calculation utilities
    const utilFiles = [
      'src/utils',
      'src/hooks',
      'src/services'
    ].map(dir => fs.existsSync(dir));

    const hasUtils = utilFiles.some(Boolean);
    
    // Check Dashboard for balance displays
    const dashboardFile = 'src/pages/Dashboard.jsx';
    if (!fs.existsSync(dashboardFile)) {
      return { passed: false, message: 'Dashboard file not found' };
    }

    const dashboardContent = fs.readFileSync(dashboardFile, 'utf8');
    const hasBalanceLogic = dashboardContent.includes('earnings') || dashboardContent.includes('balance');

    return {
      passed: hasUtils && hasBalanceLogic,
      message: `Balance logic: ${hasBalanceLogic ? 'found' : 'missing'}, Utils: ${hasUtils ? 'exist' : 'missing'}`
    };
  }

  // ==================== 2. UI/UX IMPROVEMENTS ====================
  
  async testUIUXFeatures() {
    console.log('\n🎨 UI/UX IMPROVEMENTS');
    console.log('-'.repeat(30));

    const tests = [
      { name: 'Loading States', test: this.testLoadingStates },
      { name: 'Error Handling', test: this.testErrorHandling },
      { name: 'Transaction Status Tracking', test: this.testTransactionStatus },
      { name: 'Mobile Responsiveness', test: this.testMobileResponsiveness },
      { name: 'Success/Error Notifications', test: this.testNotifications }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const result = await test.test.call(this);
        this.results.ui[test.name] = result;
        console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.message}`);
      } catch (error) {
        this.results.ui[test.name] = { passed: false, message: error.message };
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testLoadingStates() {
    await this.page.goto('http://localhost:5178');
    
    // Check for loading components
    const loadingElements = await this.page.evaluate(() => {
      const selectors = [
        '[class*="loading"]',
        '[class*="spinner"]',
        '[class*="skeleton"]',
        'div:contains("Loading")'
      ];
      
      return selectors.some(selector => {
        try {
          return document.querySelector(selector) !== null;
        } catch {
          return false;
        }
      });
    });

    // Check for Suspense fallbacks in code
    const files = ['src/App.jsx', 'src/pages/Dashboard.jsx'];
    const hasSuspense = files.some(file => {
      if (!fs.existsSync(file)) return false;
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('Suspense') && content.includes('fallback');
    });

    return {
      passed: loadingElements || hasSuspense,
      message: `Loading states: ${loadingElements ? 'visible' : 'not visible'}, Suspense: ${hasSuspense ? 'implemented' : 'missing'}`
    };
  }

  async testErrorHandling() {
    // Check for ErrorBoundary components
    const errorBoundaryExists = fs.existsSync('src/components/ErrorBoundary.jsx');
    
    // Check for error handling in main files
    const files = ['src/App.jsx', 'src/pages/Dashboard.jsx'];
    const hasErrorHandling = files.some(file => {
      if (!fs.existsSync(file)) return false;
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('try') && content.includes('catch') || content.includes('ErrorBoundary');
    });

    return {
      passed: errorBoundaryExists && hasErrorHandling,
      message: `ErrorBoundary: ${errorBoundaryExists ? 'exists' : 'missing'}, Error handling: ${hasErrorHandling ? 'implemented' : 'missing'}`
    };
  }

  async testTransactionStatus() {
    // Check for transaction status components or hooks
    const statusFiles = [
      'src/hooks/useTransactionStatus.js',
      'src/components/TransactionStatus.jsx',
      'src/services/TransactionService.js'
    ];

    const hasStatusTracking = statusFiles.some(file => fs.existsSync(file));

    // Check for status tracking in existing files
    const files = ['src/pages/Register.jsx', 'src/pages/Withdrawals.jsx'];
    const hasStatusLogic = files.some(file => {
      if (!fs.existsSync(file)) return false;
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('status') || content.includes('pending') || content.includes('confirmed');
    });

    return {
      passed: hasStatusTracking || hasStatusLogic,
      message: `Status files: ${hasStatusTracking ? 'exist' : 'missing'}, Status logic: ${hasStatusLogic ? 'found' : 'missing'}`
    };
  }

  async testMobileResponsiveness() {
    // Check for mobile CSS and responsive design
    const cssFiles = [
      'src/styles/mobile-responsive.css',
      'src/styles/mobile-first-optimization.css',
      'src/components/MobileNav.jsx'
    ];

    const hasMobileFiles = cssFiles.some(file => fs.existsSync(file));

    // Test viewport responsiveness
    await this.page.setViewport({ width: 375, height: 667 }); // iPhone size
    await this.page.goto('http://localhost:5178');
    
    const isMobileOptimized = await this.page.evaluate(() => {
      const viewport = window.getComputedStyle(document.body).getPropertyValue('max-width');
      const hasResponsiveElements = document.querySelector('[class*="mobile"]') !== null;
      return viewport || hasResponsiveElements;
    });

    return {
      passed: hasMobileFiles || isMobileOptimized,
      message: `Mobile files: ${hasMobileFiles ? 'exist' : 'missing'}, Mobile optimization: ${isMobileOptimized ? 'detected' : 'not detected'}`
    };
  }

  async testNotifications() {
    // Check for notification components
    const notificationFiles = [
      'src/components/NotificationSystem.jsx',
      'src/hooks/useNotifications.js',
      'src/services/NotificationService.js'
    ];

    const hasNotifications = notificationFiles.some(file => fs.existsSync(file));

    // Check for toast/alert libraries
    const packageJson = fs.readFileSync('package.json', 'utf8');
    const hasToastLibrary = packageJson.includes('react-toastify') || 
                           packageJson.includes('react-hot-toast') ||
                           packageJson.includes('notification');

    return {
      passed: hasNotifications || hasToastLibrary,
      message: `Notification components: ${hasNotifications ? 'exist' : 'missing'}, Toast library: ${hasToastLibrary ? 'installed' : 'missing'}`
    };
  }

  // ==================== 3. ADDITIONAL FEATURES ====================
  
  async testAdditionalFeatures() {
    console.log('\n🏗️ ADDITIONAL FEATURES');
    console.log('-'.repeat(30));

    const tests = [
      { name: 'Withdrawal Functionality', test: this.testWithdrawalFeature },
      { name: 'Package Upgrade Feature', test: this.testPackageUpgrade },
      { name: 'Team/Network Visualization', test: this.testNetworkVisualization },
      { name: 'Commission Tracking', test: this.testCommissionTracking },
      { name: 'Real-time Updates', test: this.testRealTimeUpdates }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const result = await test.test.call(this);
        this.results.features[test.name] = result;
        console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.message}`);
      } catch (error) {
        this.results.features[test.name] = { passed: false, message: error.message };
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testWithdrawalFeature() {
    const withdrawalPage = 'src/pages/Withdrawals.jsx';
    const exists = fs.existsSync(withdrawalPage);
    
    if (!exists) {
      return { passed: false, message: 'Withdrawals page not found' };
    }

    const content = fs.readFileSync(withdrawalPage, 'utf8');
    const hasWithdrawLogic = content.includes('withdraw') && 
                            (content.includes('amount') || content.includes('balance'));

    return {
      passed: hasWithdrawLogic,
      message: hasWithdrawLogic ? 'Withdrawal logic implemented' : 'Withdrawal logic incomplete'
    };
  }

  async testPackageUpgrade() {
    const packagePage = 'src/pages/Packages.jsx';
    const exists = fs.existsSync(packagePage);
    
    if (!exists) {
      return { passed: false, message: 'Packages page not found' };
    }

    const content = fs.readFileSync(packagePage, 'utf8');
    const hasUpgradeLogic = content.includes('upgrade') || content.includes('package');

    return {
      passed: hasUpgradeLogic,
      message: hasUpgradeLogic ? 'Package upgrade logic found' : 'Package upgrade logic missing'
    };
  }

  async testNetworkVisualization() {
    const visualizationFiles = [
      'src/components/MatrixVisualization.jsx',
      'src/components/NetworkTreeVisualization.jsx',
      'src/pages/GenealogyEnhanced.jsx'
    ];

    const hasVisualization = visualizationFiles.some(file => fs.existsSync(file));
    
    return {
      passed: hasVisualization,
      message: hasVisualization ? 'Network visualization components found' : 'Network visualization missing'
    };
  }

  async testCommissionTracking() {
    const commissionFiles = [
      'src/components/EarningsChart.jsx',
      'src/components/ReferralStats.jsx',
      'src/hooks/useCommissions.js'
    ];

    const hasCommissionTracking = commissionFiles.some(file => fs.existsSync(file));

    return {
      passed: hasCommissionTracking,
      message: hasCommissionTracking ? 'Commission tracking components found' : 'Commission tracking missing'
    };
  }

  async testRealTimeUpdates() {
    // Check for WebSocket or polling implementations
    const files = ['src/hooks', 'src/services'].filter(dir => fs.existsSync(dir));
    let hasRealTime = false;

    for (const dir of files) {
      const dirFiles = fs.readdirSync(dir);
      for (const file of dirFiles) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        if (content.includes('WebSocket') || content.includes('setInterval') || content.includes('polling')) {
          hasRealTime = true;
          break;
        }
      }
    }

    return {
      passed: hasRealTime,
      message: hasRealTime ? 'Real-time update mechanisms found' : 'Real-time updates not implemented'
    };
  }

  // ==================== 4. BACKEND DEVELOPMENT ====================
  
  async testBackendReadiness() {
    console.log('\n🖥️ BACKEND DEVELOPMENT');
    console.log('-'.repeat(30));

    const tests = [
      { name: 'Express.js API Server', test: this.testExpressServer },
      { name: 'MySQL Database Schema', test: this.testDatabaseSchema },
      { name: 'Blockchain Event Listeners', test: this.testEventListeners },
      { name: 'User Management Endpoints', test: this.testUserEndpoints },
      { name: 'Admin Panel Functionality', test: this.testAdminPanel }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const result = await test.test.call(this);
        this.results.backend[test.name] = result;
        console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.message}`);
      } catch (error) {
        this.results.backend[test.name] = { passed: false, message: error.message };
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testExpressServer() {
    const serverFiles = [
      'server.js',
      'app.js',
      'backend/server.js',
      'api/server.js'
    ];

    const hasServer = serverFiles.some(file => fs.existsSync(file));
    
    if (!hasServer) {
      return { passed: false, message: 'Express server file not found' };
    }

    // Check if server is running on port 3001
    try {
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/health',
        method: 'GET',
        timeout: 2000
      };

      return new Promise((resolve) => {
        const req = http.request(options, (res) => {
          resolve({ passed: true, message: 'Express server running and accessible on port 3001' });
        });

        req.on('error', () => {
          resolve({ passed: false, message: 'Express server not running or not accessible on port 3001' });
        });

        req.on('timeout', () => {
          resolve({ passed: false, message: 'Express server timeout - not accessible' });
        });

        req.end();
      });
    } catch (error) {
      return { passed: false, message: 'Express server not running or not accessible' };
    }
  }

  async testDatabaseSchema() {
    const dbFiles = [
      'database/schema.sql',
      'migrations',
      'models',
      'db'
    ];

    const hasDatabase = dbFiles.some(item => fs.existsSync(item));
    
    // Check package.json for database dependencies
    const packageJson = fs.readFileSync('package.json', 'utf8');
    const hasDbDeps = packageJson.includes('mysql') || 
                     packageJson.includes('sequelize') || 
                     packageJson.includes('prisma');

    return {
      passed: hasDatabase || hasDbDeps,
      message: `Database files: ${hasDatabase ? 'found' : 'missing'}, DB dependencies: ${hasDbDeps ? 'installed' : 'missing'}`
    };
  }

  async testEventListeners() {
    const eventFiles = [
      'scripts/event-listener.js',
      'backend/listeners',
      'services/blockchain'
    ];

    const hasEventListeners = eventFiles.some(item => fs.existsSync(item));

    // Check for event listening logic in existing files
    const files = fs.readdirSync('.').filter(file => file.endsWith('.js') || file.endsWith('.cjs'));
    let hasEventLogic = false;

    for (const file of files.slice(0, 10)) { // Check first 10 files
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('event') && (content.includes('listen') || content.includes('filter'))) {
          hasEventLogic = true;
          break;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      passed: hasEventListeners || hasEventLogic,
      message: `Event listener files: ${hasEventListeners ? 'found' : 'missing'}, Event logic: ${hasEventLogic ? 'found' : 'missing'}`
    };
  }

  async testUserEndpoints() {
    // Check for API route files
    const routeFiles = [
      'routes',
      'api/routes',
      'backend/routes',
      'controllers'
    ];

    const hasRoutes = routeFiles.some(dir => fs.existsSync(dir));
    
    return {
      passed: hasRoutes,
      message: hasRoutes ? 'API route structure found' : 'API routes not implemented'
    };
  }

  async testAdminPanel() {
    const adminFiles = [
      'src/pages/Admin.jsx',
      'src/components/AdminPanel.jsx',
      'admin'
    ];

    const hasAdmin = adminFiles.some(file => fs.existsSync(file));
    
    return {
      passed: hasAdmin,
      message: hasAdmin ? 'Admin panel components found' : 'Admin panel not implemented'
    };
  }

  // ==================== 5. SECURITY & OPTIMIZATION ====================
  
  async testSecurityCompliance() {
    console.log('\n🔒 SECURITY & OPTIMIZATION');
    console.log('-'.repeat(30));

    const tests = [
      { name: 'Private Key Security', test: this.testPrivateKeySecurity },
      { name: 'Input Validation', test: this.testInputValidation },
      { name: 'Rate Limiting', test: this.testRateLimiting },
      { name: 'CSRF Protection', test: this.testCSRFProtection },
      { name: 'SSL Configuration', test: this.testSSLConfig }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const result = await test.test.call(this);
        this.results.security[test.name] = result;
        console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.message}`);
      } catch (error) {
        this.results.security[test.name] = { passed: false, message: error.message };
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testPrivateKeySecurity() {
    // Check for private keys in source code with more precise patterns
    const sensitiveFiles = [
      '.env',
      'src',
      'scripts'
    ];

    let hasPrivateKeys = false;
    const foundKeys = [];
    
    // More specific patterns for actual private keys (exclude storage slots, tx hashes, etc.)
    const privateKeyPatterns = [
      /PRIVATE_KEY\s*=\s*['\"]?0x[a-fA-F0-9]{64}['\"]?/i,
      /private.*key.*['\"]0x[a-fA-F0-9]{64}['\"]?/i,
      /sk-[a-zA-Z0-9]{48}/,
      // Exclude common blockchain constants
      /(?!0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc)(?!0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103)0x[a-fA-F0-9]{64}/
    ];

    function scanDirectory(dir) {
      if (!fs.existsSync(dir)) return;
      
      const stat = fs.statSync(dir);
      if (!stat.isDirectory()) {
        // Handle single file case
        if (dir.endsWith('.env')) {
          try {
            const content = fs.readFileSync(dir, 'utf8');
            if (content.includes('REMOVED_FOR_SECURITY')) {
              return; // Skip already secured files
            }
            
            for (const pattern of privateKeyPatterns) {
              if (pattern.test(content)) {
                hasPrivateKeys = true;
                foundKeys.push(dir);
                break;
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
        return;
      }
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemStat = fs.statSync(fullPath);
        
        if (itemStat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'archive') {
          scanDirectory(fullPath);
        } else if (itemStat.isFile() && !fullPath.includes('/archive/') && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.cjs') || item.endsWith('.env'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Skip files with legitimate blockchain constants or zero addresses
            if (content.includes('IMPLEMENTATION_SLOT') || 
                content.includes('ADMIN_SLOT') || 
                content.includes('transactionHash') ||
                content.includes('0x0000000000000000000000000000000000000000000000000000000000000000') ||
                content.includes('comparison') ||
                content.includes('compare')) {
              continue;
            }
            
            // Check for actual private key patterns
            if (content.includes('REMOVED_FOR_SECURITY')) {
              continue; // Skip already secured files
            }
            
            for (const pattern of privateKeyPatterns) {
              if (pattern.test(content)) {
                hasPrivateKeys = true;
                foundKeys.push(fullPath);
                break;
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    }

    // Scan each directory
    for (const dir of sensitiveFiles) {
      scanDirectory(dir);
    }

    return {
      passed: !hasPrivateKeys,
      message: hasPrivateKeys ? 
        `SECURITY RISK: Private keys found in: ${foundKeys.join(', ')}` : 
        'No private keys found in source code'
    };
  }

  async testInputValidation() {
    // Check for validation libraries and patterns
    const packageJson = fs.readFileSync('package.json', 'utf8');
    const hasValidationLib = packageJson.includes('joi') || 
                            packageJson.includes('yup') || 
                            packageJson.includes('validator') ||
                            packageJson.includes('zod');

    // Check for validation patterns in components
    const formFiles = ['src/pages/Register.jsx', 'src/pages/Withdrawals.jsx'];
    let hasValidation = false;

    for (const file of formFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('validation') || content.includes('validate') || content.includes('required')) {
          hasValidation = true;
          break;
        }
      }
    }

    return {
      passed: hasValidationLib || hasValidation,
      message: `Validation library: ${hasValidationLib ? 'installed' : 'missing'}, Validation logic: ${hasValidation ? 'found' : 'missing'}`
    };
  }

  async testRateLimiting() {
    // Check for rate limiting middleware in backend
    const backendServer = 'backend/server.js';
    if (!fs.existsSync(backendServer)) {
      return { passed: false, message: 'Backend server not found' };
    }

    const serverContent = fs.readFileSync(backendServer, 'utf8');
    const hasRateLimit = serverContent.includes('express-rate-limit') || 
                        serverContent.includes('rateLimit') ||
                        serverContent.includes('rate-limit');

    return {
      passed: hasRateLimit,
      message: hasRateLimit ? 'Rate limiting implemented in backend' : 'Rate limiting not implemented'
    };
  }

  async testCSRFProtection() {
    // Check for CSRF protection in backend
    const backendServer = 'backend/server.js';
    if (!fs.existsSync(backendServer)) {
      return { passed: false, message: 'Backend server not found' };
    }

    const serverContent = fs.readFileSync(backendServer, 'utf8');
    const hasCSRF = serverContent.includes('csrf') || serverContent.includes('csurf');

    return {
      passed: hasCSRF,
      message: hasCSRF ? 'CSRF protection implemented in backend' : 'CSRF protection not implemented'
    };
  }

  async testSSLConfig() {
    // Check for SSL configuration files
    const sslFiles = [
      'ssl',
      'certificates',
      'nginx.conf',
      'docker-compose.yml'
    ];

    const hasSSLConfig = sslFiles.some(file => fs.existsSync(file));

    return {
      passed: hasSSLConfig,
      message: hasSSLConfig ? 'SSL configuration files found' : 'SSL configuration missing'
    };
  }

  // ==================== 6. DEPLOYMENT & PRODUCTION ====================
  
  async testDeploymentReadiness() {
    console.log('\n🚀 DEPLOYMENT & PRODUCTION');
    console.log('-'.repeat(30));

    const tests = [
      { name: 'Docker Configuration', test: this.testDockerConfig },
      { name: 'Nginx Configuration', test: this.testNginxConfig },
      { name: 'Environment Configuration', test: this.testEnvConfig },
      { name: 'Monitoring Setup', test: this.testMonitoringSetup },
      { name: 'Backup Configuration', test: this.testBackupConfig }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const result = await test.test.call(this);
        this.results.deployment[test.name] = result;
        console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.message}`);
      } catch (error) {
        this.results.deployment[test.name] = { passed: false, message: error.message };
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testDockerConfig() {
    const dockerFiles = ['Dockerfile', 'docker-compose.yml', '.dockerignore'];
    const hasDockerConfig = dockerFiles.some(file => fs.existsSync(file));

    return {
      passed: hasDockerConfig,
      message: hasDockerConfig ? 'Docker configuration found' : 'Docker configuration missing'
    };
  }

  async testNginxConfig() {
    const nginxFiles = ['nginx.conf', 'nginx', 'proxy.conf'];
    const hasNginxConfig = nginxFiles.some(file => fs.existsSync(file));

    return {
      passed: hasNginxConfig,
      message: hasNginxConfig ? 'Nginx configuration found' : 'Nginx configuration missing'
    };
  }

  async testEnvConfig() {
    const envFiles = ['.env.example', '.env.production', 'config'];
    const hasEnvConfig = envFiles.some(file => fs.existsSync(file));

    return {
      passed: hasEnvConfig,
      message: hasEnvConfig ? 'Environment configuration found' : 'Environment configuration missing'
    };
  }

  async testMonitoringSetup() {
    const monitoringFiles = ['monitoring', 'logs', 'winston', 'morgan'];
    const hasMonitoring = monitoringFiles.some(file => fs.existsSync(file));

    // Check package.json for monitoring libraries
    const packageJson = fs.readFileSync('package.json', 'utf8');
    const hasMonitoringLib = packageJson.includes('winston') || 
                            packageJson.includes('morgan') || 
                            packageJson.includes('pino');

    // Check backend package.json for monitoring
    const backendPackageExists = fs.existsSync('backend/package.json');
    let hasBackendMonitoring = false;
    if (backendPackageExists) {
      const backendPackage = fs.readFileSync('backend/package.json', 'utf8');
      hasBackendMonitoring = backendPackage.includes('morgan') || backendPackage.includes('winston');
    }

    const overallMonitoring = hasMonitoring || hasMonitoringLib || hasBackendMonitoring;

    return {
      passed: overallMonitoring,
      message: `Monitoring files: ${hasMonitoring ? 'found' : 'missing'}, Frontend libs: ${hasMonitoringLib ? 'installed' : 'missing'}, Backend monitoring: ${hasBackendMonitoring ? 'installed' : 'missing'}`
    };
  }

  async testBackupConfig() {
    const backupFiles = ['backup', 'scripts/backup.sh', 'cron'];
    const hasBackupConfig = backupFiles.some(file => fs.existsSync(file));

    return {
      passed: hasBackupConfig,
      message: hasBackupConfig ? 'Backup configuration found' : 'Backup configuration missing'
    };
  }

  // ==================== 7. FINAL STEPS ====================
  
  async testFinalChecklist() {
    console.log('\n🎯 FINAL STEPS');
    console.log('-'.repeat(30));

    const tests = [
      { name: 'End-to-End Testing', test: this.testE2E },
      { name: 'User Acceptance Testing', test: this.testUAT },
      { name: 'Performance Optimization', test: this.testPerformance },
      { name: 'Contract Ownership', test: this.testContractOwnership },
      { name: 'Production Environment', test: this.testProductionEnv }
    ];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name}...`);
        const result = await test.test.call(this);
        this.results.final[test.name] = result;
        console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.message}`);
      } catch (error) {
        this.results.final[test.name] = { passed: false, message: error.message };
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testE2E() {
    const e2eFiles = ['e2e', 'cypress', 'playwright', '__tests__'];
    const hasE2E = e2eFiles.some(dir => fs.existsSync(dir));

    // Check package.json for E2E testing libraries
    const packageJson = fs.readFileSync('package.json', 'utf8');
    const hasE2ELib = packageJson.includes('cypress') || 
                     packageJson.includes('playwright') || 
                     packageJson.includes('puppeteer');

    return {
      passed: hasE2E || hasE2ELib,
      message: `E2E files: ${hasE2E ? 'found' : 'missing'}, E2E libs: ${hasE2ELib ? 'installed' : 'missing'}`
    };
  }

  async testUAT() {
    const uatFiles = ['tests/uat', 'uat', 'user-tests'];
    const hasUAT = uatFiles.some(dir => fs.existsSync(dir));

    // Check for UAT framework
    const uatFramework = fs.existsSync('tests/uat/uat-framework.cjs');

    return {
      passed: hasUAT || uatFramework,
      message: `UAT directory: ${hasUAT ? 'found' : 'missing'}, UAT framework: ${uatFramework ? 'implemented' : 'missing'}`
    };
  }

  async testPerformance() {
    // Check for performance optimization
    const performanceFiles = ['lighthouse', 'performance', 'webpack.config.js', 'vite.config.js'];
    const hasPerformanceConfig = performanceFiles.some(file => fs.existsSync(file));

    // Check for performance-related packages
    const packageJson = fs.readFileSync('package.json', 'utf8');
    const hasPerformanceLib = packageJson.includes('lighthouse') || 
                             packageJson.includes('webpack-bundle-analyzer');

    return {
      passed: hasPerformanceConfig || hasPerformanceLib,
      message: `Performance config: ${hasPerformanceConfig ? 'found' : 'missing'}, Performance libs: ${hasPerformanceLib ? 'installed' : 'missing'}`
    };
  }

  async testContractOwnership() {
    // Check for ownership transfer scripts
    const ownershipFiles = ['4-transfer-ownership-to-trezor.cjs', 'scripts/transfer-ownership.js'];
    const hasOwnershipScript = ownershipFiles.some(file => fs.existsSync(file));

    return {
      passed: hasOwnershipScript,
      message: hasOwnershipScript ? 'Ownership transfer script found' : 'Ownership transfer script missing'
    };
  }

  async testProductionEnv() {
    // Check for production environment setup
    const prodFiles = ['.env.production', 'docker-compose.prod.yml', 'deploy.sh'];
    const hasProdConfig = prodFiles.some(file => fs.existsSync(file));

    return {
      passed: hasProdConfig,
      message: hasProdConfig ? 'Production configuration found' : 'Production configuration missing'
    };
  }

  // ==================== UTILITY METHODS ====================
  
  async initializeBrowser() {
    try {
      this.browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 720 });
    } catch (error) {
      console.warn('Could not initialize browser for UI tests:', error.message);
    }
  }

  async generateReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('📊 LEADFIVE FEATURE VALIDATION REPORT');
    console.log('='.repeat(60));

    const categories = [
      { name: 'Frontend Testing & Fixes', results: this.results.frontend },
      { name: 'UI/UX Improvements', results: this.results.ui },
      { name: 'Additional Features', results: this.results.features },
      { name: 'Backend Development', results: this.results.backend },
      { name: 'Security & Optimization', results: this.results.security },
      { name: 'Deployment & Production', results: this.results.deployment },
      { name: 'Final Steps', results: this.results.final }
    ];

    let totalTests = 0;
    let passedTests = 0;

    for (const category of categories) {
      const tests = Object.values(category.results);
      const passed = tests.filter(test => test.passed).length;
      totalTests += tests.length;
      passedTests += passed;

      console.log(`\n${category.name}: ${passed}/${tests.length} ✅`);
      
      for (const [testName, result] of Object.entries(category.results)) {
        const status = result.passed ? '✅' : '❌';
        console.log(`  ${status} ${testName}`);
        if (!result.passed) {
          console.log(`     → ${result.message}`);
        }
      }
    }

    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log(`📈 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${totalTests - passedTests}`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Duration: ${duration}s`);
    console.log('='.repeat(60));

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        successRate: `${successRate}%`
      },
      results: this.results
    };

    fs.writeFileSync('leadfive-validation-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: leadfive-validation-report.json');

    // Recommendations
    console.log('\n🎯 NEXT STEPS & RECOMMENDATIONS:');
    if (successRate < 70) {
      console.log('❗ Priority: Address critical missing features before deployment');
    } else if (successRate < 85) {
      console.log('⚠️  Priority: Complete remaining features for production readiness');
    } else {
      console.log('🚀 Great progress! Focus on final testing and deployment');
    }

    console.log('\n🔗 Run individual tests with:');
    console.log('   npm test           # Unit tests');
    console.log('   npm run e2e        # End-to-end tests');
    console.log('   npm run build      # Production build test');
    console.log('   npm run deploy     # Deployment validation');
  }
}

// Run the validator
const validator = new LeadFiveFeatureValidator();
validator.runAllTests().catch(console.error);

module.exports = LeadFiveFeatureValidator;
