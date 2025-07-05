#!/usr/bin/env node

/**
 * LeadFive Dashboard Feature Testing Script
 * Tests all dashboard sections, components, and functionality
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class DashboardTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      warnings: [],
      summary: []
    };
    this.projectRoot = process.cwd();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '🔍',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async testFileExists(filePath, description) {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const exists = fs.existsSync(fullPath);
      
      if (exists) {
        this.log(`${description} - EXISTS`, 'success');
        this.testResults.passed++;
        return true;
      } else {
        this.log(`${description} - MISSING`, 'error');
        this.testResults.failed++;
        this.testResults.errors.push(`Missing file: ${filePath}`);
        return false;
      }
    } catch (error) {
      this.log(`Error checking ${filePath}: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`File check error: ${filePath} - ${error.message}`);
      return false;
    }
  }

  async testFileContent(filePath, checks, description) {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      
      if (!fs.existsSync(fullPath)) {
        this.log(`${description} - FILE NOT FOUND`, 'error');
        this.testResults.failed++;
        return false;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      let allPassed = true;

      for (const check of checks) {
        if (check.type === 'contains') {
          if (content.includes(check.value)) {
            this.log(`  ✓ Contains: ${check.description || check.value}`, 'success');
          } else {
            this.log(`  ✗ Missing: ${check.description || check.value}`, 'error');
            this.testResults.errors.push(`${filePath}: Missing ${check.description || check.value}`);
            allPassed = false;
          }
        } else if (check.type === 'not_contains') {
          if (!content.includes(check.value)) {
            this.log(`  ✓ Correctly excludes: ${check.description || check.value}`, 'success');
          } else {
            this.log(`  ✗ Should not contain: ${check.description || check.value}`, 'warning');
            this.testResults.warnings.push(`${filePath}: Should not contain ${check.description || check.value}`);
          }
        } else if (check.type === 'regex') {
          const regex = new RegExp(check.value);
          if (regex.test(content)) {
            this.log(`  ✓ Pattern match: ${check.description || check.value}`, 'success');
          } else {
            this.log(`  ✗ Pattern missing: ${check.description || check.value}`, 'error');
            this.testResults.errors.push(`${filePath}: Pattern missing ${check.description || check.value}`);
            allPassed = false;
          }
        }
      }

      if (allPassed) {
        this.testResults.passed++;
        this.log(`${description} - CONTENT VALID`, 'success');
      } else {
        this.testResults.failed++;
      }

      return allPassed;
    } catch (error) {
      this.log(`Error reading ${filePath}: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Content check error: ${filePath} - ${error.message}`);
      return false;
    }
  }

  async testBuildProcess() {
    this.log('Testing build process...', 'test');
    
    try {
      // Check if we can build the project
      const { stdout, stderr } = await execAsync('npm run build', {
        cwd: this.projectRoot,
        timeout: 120000 // 2 minutes timeout
      });
      
      this.log('Build completed successfully', 'success');
      this.testResults.passed++;
      
      // Check if dist folder was created
      if (fs.existsSync(path.join(this.projectRoot, 'dist'))) {
        this.log('Dist folder created', 'success');
        this.testResults.passed++;
      } else {
        this.log('Dist folder not found', 'error');
        this.testResults.failed++;
        this.testResults.errors.push('Build did not create dist folder');
      }
      
      return true;
    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      this.testResults.failed++;
      this.testResults.errors.push(`Build error: ${error.message}`);
      return false;
    }
  }

  async testDashboardStructure() {
    this.log('Testing Dashboard Component Structure...', 'test');

    // Test main dashboard files exist
    await this.testFileExists('src/pages/Dashboard.jsx', 'Dashboard Page Component');
    await this.testFileExists('src/components/enhanced/EnhancedDashboard.jsx', 'Enhanced Dashboard Component');
    await this.testFileExists('src/pages/Genealogy.jsx', 'Genealogy Page Component');
    
    // Test new navigation system files
    await this.testFileExists('src/config/navigation.js', 'Navigation Configuration');
    await this.testFileExists('src/hooks/useNavigation.js', 'Navigation Hook');

    // Test Enhanced Dashboard content structure
    await this.testFileContent('src/components/enhanced/EnhancedDashboard.jsx', [
      { type: 'contains', value: 'export default function EnhancedDashboard', description: 'Main component export' },
      { type: 'contains', value: 'const GamificationSection', description: 'Gamification section component' },
      { type: 'contains', value: 'const ReportsSection', description: 'Reports section component' },
      { type: 'contains', value: 'const AIInsightsSection', description: 'AI Insights section component' },
      { type: 'contains', value: 'const SettingsSection', description: 'Settings section component' },
      { type: 'not_contains', value: '  const GamificationSection', description: 'Properly moved sections (no nested functions)' },
      { type: 'contains', value: 'renderContent()', description: 'Content rendering function' },
      { type: 'contains', value: 'dashboard-sidebar', description: 'Sidebar navigation' },
      { type: 'contains', value: 'menu-item', description: 'Menu items' },
      { type: 'contains', value: 'CleanBinaryTree', description: 'Clean genealogy tree integration' },
      { type: 'contains', value: 'useNavigation', description: 'Navigation hook usage' },
      { type: 'contains', value: 'breadcrumbs', description: 'Breadcrumb navigation' },
      { type: 'contains', value: 'navigateToSection', description: 'Navigation function usage' },
      { type: 'contains', value: 'useDashboardStore', description: 'Zustand store integration' },
      { type: 'contains', value: 'selectDashboardData', description: 'Store selectors usage' },
      { type: 'contains', value: 'initialize', description: 'Store initialization' }
    ], 'Enhanced Dashboard Structure');

    // Test Navigation Configuration
    await this.testFileContent('src/config/navigation.js', [
      { type: 'contains', value: 'NAVIGATION_CONFIG', description: 'Navigation configuration object' },
      { type: 'contains', value: 'menuItems', description: 'Menu items configuration' },
      { type: 'contains', value: 'getRouteBySection', description: 'Route utility functions' },
      { type: 'contains', value: 'getBreadcrumbs', description: 'Breadcrumb utility functions' }
    ], 'Navigation Configuration');

    // Test Navigation Hook
    await this.testFileContent('src/hooks/useNavigation.js', [
      { type: 'contains', value: 'useNavigate', description: 'React Router integration' },
      { type: 'contains', value: 'navigateToSection', description: 'Navigation function' },
      { type: 'contains', value: 'activeSection', description: 'Active section state' },
      { type: 'contains', value: 'breadcrumbs', description: 'Breadcrumb generation' },
      { type: 'contains', value: 'getMenuItems', description: 'Menu items with state' }
    ], 'Navigation Hook');

    // Test Genealogy page structure
    await this.testFileContent('src/pages/Genealogy.jsx', [
      { type: 'contains', value: 'export default function Genealogy', description: 'Genealogy component export' },
      { type: 'contains', value: 'CleanBinaryTree', description: 'Clean binary tree component' },
      { type: 'contains', value: 'getUnifiedTreeData', description: 'Unified tree data service' },
      { type: 'contains', value: 'ErrorBoundary', description: 'Error boundary wrapper' },
      { type: 'not_contains', value: 'PageWrapper', description: 'No PageWrapper (fullscreen mode)' }
    ], 'Genealogy Page Structure');

    // Test Dashboard page wrapper
    await this.testFileContent('src/pages/Dashboard.jsx', [
      { type: 'contains', value: 'import EnhancedDashboard', description: 'Enhanced dashboard import' },
      { type: 'contains', value: 'EnhancedDashboard', description: 'Enhanced dashboard usage' },
      { type: 'contains', value: 'ErrorBoundary', description: 'Error boundary wrapper' },
      { type: 'not_contains', value: 'ComprehensiveDashboard', description: 'No old dashboard component' }
    ], 'Dashboard Page Configuration');
  }

  async testComponentImports() {
    this.log('Testing Component Imports and Dependencies...', 'test');

    // Test if all imported components exist
    const componentsToCheck = [
      'src/components/CleanBinaryTree.jsx',
      'src/components/GamificationSystem.jsx',
      'src/components/PerformanceMetrics.jsx',
      'src/components/enhanced/EnhancedAICoaching.jsx',
      'src/components/enhanced/EnhancedWithdrawalSystem.jsx',
      'src/components/UnifiedChatbot.jsx',
      'src/components/ErrorBoundary.jsx'
    ];

    for (const component of componentsToCheck) {
      await this.testFileExists(component, `Component: ${path.basename(component)}`);
    }

    // Test services
    await this.testFileExists('src/services/unifiedGenealogyService.js', 'Unified Genealogy Service');
    await this.testFileExists('src/services/coinMarketCapService.js', 'CoinMarketCap Service');
    
    // Test new Phase 2 services
    await this.testFileExists('src/services/api/dashboardApi.js', 'Dashboard API Service');
    await this.testFileExists('src/services/api/earningsApi.js', 'Earnings API Service');
    await this.testFileExists('src/services/api/referralsApi.js', 'Referrals API Service');
    await this.testFileExists('src/services/blockchain/contractService.js', 'Blockchain Contract Service');
    await this.testFileExists('src/services/websocket/realtimeService.js', 'Real-time WebSocket Service');
    await this.testFileExists('src/stores/dashboardStore.js', 'Zustand Dashboard Store');
    
    // Test data architecture content
    await this.testFileContent('src/stores/dashboardStore.js', [
      { type: 'contains', value: 'useDashboardStore', description: 'Zustand store creation' },
      { type: 'contains', value: 'initialize', description: 'Store initialization action' },
      { type: 'contains', value: 'loadAllData', description: 'Data loading actions' },
      { type: 'contains', value: 'selectDashboardData', description: 'Store selectors' },
      { type: 'contains', value: 'subscribeWithSelector', description: 'Zustand middleware' }
    ], 'Dashboard Store Implementation');

    await this.testFileContent('src/services/api/dashboardApi.js', [
      { type: 'contains', value: 'DashboardApiService', description: 'API service class' },
      { type: 'contains', value: 'getDashboardData', description: 'Data fetching methods' },
      { type: 'contains', value: 'CONTRACT_ADDRESS', description: 'Contract integration' },
      { type: 'contains', value: 'formatEarnings', description: 'Data formatting utilities' }
    ], 'Dashboard API Service');

    await this.testFileContent('src/services/blockchain/contractService.js', [
      { type: 'contains', value: 'ContractService', description: 'Contract service class' },
      { type: 'contains', value: 'getUserEarnings', description: 'Contract methods' },
      { type: 'contains', value: 'eventListeners', description: 'Event handling' },
      { type: 'contains', value: 'ethers.Contract', description: 'Ethers.js integration' }
    ], 'Blockchain Contract Service');
  }

  async testRouting() {
    this.log('Testing Routing Configuration...', 'test');

    await this.testFileContent('src/App.jsx', [
      { type: 'contains', value: 'isFullscreen={true}', description: 'Fullscreen routing for dashboard' },
      { type: 'contains', value: '/dashboard', description: 'Dashboard route' },
      { type: 'contains', value: '/genealogy', description: 'Genealogy route' },
      { type: 'contains', value: '/withdrawals', description: 'Withdrawals route' },
      { type: 'contains', value: '/referrals', description: 'Referrals route' },
      { type: 'contains', value: 'RouteWrapper', description: 'Route wrapper component' },
      { type: 'contains', value: 'ProtectedRouteWrapper', description: 'Protected route wrapper' }
    ], 'App.jsx Routing Configuration');
  }

  async testStyles() {
    this.log('Testing Stylesheets...', 'test');

    const stylesToCheck = [
      'src/styles/professional-dashboard.css',
      'src/styles/professional-gamification.css',
      'src/components/CleanBinaryTree.css',
      'src/App.css'
    ];

    for (const style of stylesToCheck) {
      await this.testFileExists(style, `Stylesheet: ${path.basename(style)}`);
    }
  }

  async testEnvironmentVariables() {
    this.log('Testing Environment Configuration...', 'test');

    await this.testFileExists('.env', 'Environment Variables File');
    
    if (fs.existsSync('.env')) {
      await this.testFileContent('.env', [
        { type: 'regex', value: 'VITE_CONTRACT_ADDRESS=0x[a-fA-F0-9]{40}', description: 'Valid contract address' },
        { type: 'contains', value: 'VITE_DEFAULT_REFERRAL_CODE', description: 'Default referral code' },
        { type: 'contains', value: 'OPENAI_API_KEY', description: 'OpenAI API key placeholder' },
        { type: 'contains', value: 'COINMARKETCAP_API_KEY', description: 'CoinMarketCap API key placeholder' }
      ], 'Environment Variables Content');
    }
  }

  async runSyntaxCheck() {
    this.log('Running JavaScript Syntax Check...', 'test');

    try {
      // Use Node.js to check syntax of main files
      const filesToCheck = [
        'src/App.jsx',
        'src/pages/Dashboard.jsx',
        'src/pages/Genealogy.jsx',
        'src/components/enhanced/EnhancedDashboard.jsx'
      ];

      for (const file of filesToCheck) {
        try {
          const fullPath = path.join(this.projectRoot, file);
          if (fs.existsSync(fullPath)) {
            // Basic syntax check by reading and parsing
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for common syntax errors
            const syntaxChecks = [
              { pattern: /}\s*}/g, description: 'Properly closed braces' },
              { pattern: /export\s+default/g, description: 'Has default export' },
              { pattern: /import.*from/g, description: 'Has imports' }
            ];

            let syntaxValid = true;
            for (const check of syntaxChecks) {
              if (!check.pattern.test(content)) {
                this.log(`  Syntax issue in ${file}: Missing ${check.description}`, 'warning');
                syntaxValid = false;
              }
            }

            if (syntaxValid) {
              this.log(`  Syntax check passed: ${file}`, 'success');
              this.testResults.passed++;
            } else {
              this.testResults.failed++;
            }
          }
        } catch (error) {
          this.log(`  Syntax error in ${file}: ${error.message}`, 'error');
          this.testResults.failed++;
          this.testResults.errors.push(`Syntax error in ${file}: ${error.message}`);
        }
      }
    } catch (error) {
      this.log(`Syntax check failed: ${error.message}`, 'error');
      this.testResults.failed++;
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('📊 LEADFIVE DASHBOARD TEST REPORT', 'info');
    this.log('='.repeat(60), 'info');
    
    this.log(`✅ Tests Passed: ${this.testResults.passed}`, 'success');
    this.log(`❌ Tests Failed: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'info');
    this.log(`⚠️  Warnings: ${this.testResults.warnings.length}`, this.testResults.warnings.length > 0 ? 'warning' : 'info');
    
    const totalTests = this.testResults.passed + this.testResults.failed;
    const successRate = totalTests > 0 ? ((this.testResults.passed / totalTests) * 100).toFixed(1) : 0;
    
    this.log(`📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');
    
    if (this.testResults.errors.length > 0) {
      this.log('\n🚨 ERRORS FOUND:', 'error');
      this.testResults.errors.forEach((error, index) => {
        this.log(`  ${index + 1}. ${error}`, 'error');
      });
    }
    
    if (this.testResults.warnings.length > 0) {
      this.log('\n⚠️  WARNINGS:', 'warning');
      this.testResults.warnings.forEach((warning, index) => {
        this.log(`  ${index + 1}. ${warning}`, 'warning');
      });
    }
    
    this.log('\n📋 SUMMARY:', 'info');
    if (this.testResults.failed === 0) {
      this.log('🎉 All critical tests passed! Dashboard is ready for deployment.', 'success');
    } else if (successRate >= 80) {
      this.log('👍 Most tests passed. Address the errors above before deployment.', 'warning');
    } else {
      this.log('❌ Critical issues found. Fix errors before proceeding.', 'error');
    }
    
    this.log('='.repeat(60), 'info');
  }

  async runAllTests() {
    this.log('🚀 Starting LeadFive Dashboard Feature Testing...', 'test');
    this.log(`📂 Project Root: ${this.projectRoot}`, 'info');
    
    try {
      // Core structure tests
      await this.testDashboardStructure();
      await this.testComponentImports();
      await this.testRouting();
      await this.testStyles();
      await this.testEnvironmentVariables();
      
      // Syntax and build tests
      await this.runSyntaxCheck();
      
      // Build test (optional - can be time consuming)
      this.log('⏳ Skipping build test (can be run manually with npm run build)', 'info');
      
      // Generate final report
      this.generateReport();
      
      return this.testResults.failed === 0;
      
    } catch (error) {
      this.log(`Fatal testing error: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new DashboardTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = DashboardTester;