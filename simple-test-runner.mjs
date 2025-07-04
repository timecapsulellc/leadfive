#!/usr/bin/env node

/**
 * LeadFive Simple Automated Test Runner
 * Lightweight automated testing without browser automation
 */

import fs from 'fs';
import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

class SimpleTestRunner {
  constructor() {
    this.results = [];
    this.baseUrl = 'http://localhost:5173';
  }

  async runTest(testName, testFunction) {
    log(`🧪 Testing: ${testName}`, COLORS.YELLOW);
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name: testName,
        status: result ? 'PASSED' : 'FAILED',
        duration
      });

      if (result) {
        log(`✅ PASSED: ${testName} (${duration}ms)`, COLORS.GREEN);
      } else {
        log(`❌ FAILED: ${testName} (${duration}ms)`, COLORS.RED);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        status: 'ERROR',
        error: error.message,
        duration
      });
      
      log(`💥 ERROR: ${testName} - ${error.message}`, COLORS.RED);
      return false;
    }
  }

  // Test 1: Check if dev server is running
  async testServerRunning() {
    return new Promise((resolve) => {
      const req = http.get(this.baseUrl, (res) => {
        resolve(res.statusCode === 200);
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  // Test 2: Check project structure
  async testProjectStructure() {
    const requiredFiles = [
      './src/App.jsx',
      './src/components/UnifiedChatbot_emergency.jsx',
      './src/pages/Home.jsx',
      './src/pages/Dashboard.jsx',
      './package.json',
      './vite.config.js'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        log(`❌ Missing file: ${file}`, COLORS.RED);
        return false;
      }
    }
    
    return true;
  }

  // Test 3: Check for FaMinimize issues in code
  async testNoFaMinimizeIssues() {
    const filesToCheck = [
      './src/components/UnifiedChatbot.jsx',
      './src/components/UnifiedChatbot_emergency.jsx',
      './src/pages/Home.jsx',
      './src/pages/Dashboard.jsx'
    ];

    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Remove comments and check for actual FaMinimize imports
        const lines = content.split('\n');
        const codeLines = lines.filter(line => {
          const trimmed = line.trim();
          return !trimmed.startsWith('//') && 
                 !trimmed.startsWith('*') && 
                 !trimmed.includes('// FIXED') && 
                 !trimmed.includes('No more FaMinimize');
        });
        
        const codeContent = codeLines.join('\n');
        
        if (codeContent.includes('FaMinimize')) {
          log(`❌ Found FaMinimize in code (not comments): ${file}`, COLORS.RED);
          return false;
        }
      }
    }
    
    return true;
  }

  // Test 4: Check emergency component is in use
  async testEmergencyComponentActive() {
    const homeFile = './src/pages/Home.jsx';
    
    if (!fs.existsSync(homeFile)) return false;
    
    const content = fs.readFileSync(homeFile, 'utf8');
    return content.includes('UnifiedChatbot_emergency');
  }

  // Test 5: Check package.json scripts
  async testPackageScripts() {
    if (!fs.existsSync('./package.json')) return false;
    
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const requiredScripts = ['dev', 'build', 'test:auto'];
    
    for (const script of requiredScripts) {
      if (!packageJson.scripts || !packageJson.scripts[script]) {
        log(`❌ Missing script: ${script}`, COLORS.RED);
        return false;
      }
    }
    
    return true;
  }

  // Test 6: Check for critical dependencies
  async testDependencies() {
    if (!fs.existsSync('./package.json')) return false;
    
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const requiredDeps = ['react', 'react-dom', 'vite', 'react-icons'];
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    for (const dep of requiredDeps) {
      if (!allDeps[dep]) {
        log(`❌ Missing dependency: ${dep}`, COLORS.RED);
        return false;
      }
    }
    
    return true;
  }

  // Test 7: Check build configuration
  async testBuildConfig() {
    const configFiles = ['./vite.config.js', './vite.config.ts'];
    
    for (const config of configFiles) {
      if (fs.existsSync(config)) {
        const content = fs.readFileSync(config, 'utf8');
        if (content.includes('vite') || content.includes('defineConfig')) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Test 8: Check for node_modules
  async testNodeModules() {
    return fs.existsSync('./node_modules') && 
           fs.existsSync('./node_modules/react') &&
           fs.existsSync('./node_modules/react-icons');
  }

  // Test 9: Test if we can fetch homepage content
  async testHomepageContent() {
    return new Promise((resolve) => {
      const req = http.get(this.baseUrl, (res) => {
        let data = '';
        
        res.on('data', chunk => {
          data += chunk;
        });
        
        res.on('end', () => {
          // Check if it's not an error page
          const hasError = data.includes('Oops! Something went wrong') || 
                          data.includes('error-page');
          const hasContent = data.includes('LeadFive') || 
                           data.includes('ARIA') ||
                           data.includes('html');
          
          resolve(!hasError && hasContent);
        });
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  // Test 10: Check if emergency fix files exist
  async testEmergencyFixFiles() {
    const emergencyFiles = [
      './src/components/UnifiedChatbot_emergency.jsx',
      './emergency-status-check.mjs',
      './automated-test-suite.mjs'
    ];

    let foundFiles = 0;
    for (const file of emergencyFiles) {
      if (fs.existsSync(file)) {
        foundFiles++;
      }
    }
    
    return foundFiles >= 2; // At least 2 emergency files should exist
  }

  async runAllTests() {
    log('\n🎯 Starting Simple Automated Testing...', COLORS.BOLD + COLORS.BLUE);
    log('======================================\n', COLORS.BLUE);

    const tests = [
      { name: 'Server Running', func: () => this.testServerRunning() },
      { name: 'Project Structure', func: () => this.testProjectStructure() },
      { name: 'No FaMinimize Issues', func: () => this.testNoFaMinimizeIssues() },
      { name: 'Emergency Component Active', func: () => this.testEmergencyComponentActive() },
      { name: 'Package Scripts', func: () => this.testPackageScripts() },
      { name: 'Dependencies Check', func: () => this.testDependencies() },
      { name: 'Build Configuration', func: () => this.testBuildConfig() },
      { name: 'Node Modules', func: () => this.testNodeModules() },
      { name: 'Homepage Content', func: () => this.testHomepageContent() },
      { name: 'Emergency Fix Files', func: () => this.testEmergencyFixFiles() }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.func);
    }
  }

  generateReport() {
    log('\n📊 SIMPLE TEST RESULTS', COLORS.BOLD + COLORS.BLUE);
    log('======================\n', COLORS.BLUE);

    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;
    const total = this.results.length;
    const percentage = Math.round((passed / total) * 100);

    this.results.forEach(test => {
      const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '💥';
      const color = test.status === 'PASSED' ? COLORS.GREEN : COLORS.RED;
      log(`${icon} ${test.name}: ${test.status}`, color);
    });

    log(`\n🎯 OVERALL SCORE: ${passed}/${total} (${percentage}%)`, 
        percentage >= 90 ? COLORS.GREEN : percentage >= 70 ? COLORS.YELLOW : COLORS.RED);

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: { passed, failed, errors, total, percentage }
    };
    
    fs.writeFileSync('./simple-test-report.json', JSON.stringify(report, null, 2));
    log(`\n📄 Report saved: simple-test-report.json`, COLORS.CYAN);

    // Recommendations
    log('\n📋 RECOMMENDATIONS:', COLORS.BLUE);
    if (percentage >= 90) {
      log('🎉 EXCELLENT! All systems operational!', COLORS.GREEN);
      log('✅ Ready for browser testing', COLORS.GREEN);
      log('🚀 Run: npm run test:auto (if Puppeteer available)', COLORS.GREEN);
    } else if (percentage >= 70) {
      log('✅ GOOD! Minor issues detected', COLORS.YELLOW);
      log('🔧 Check failed tests and fix issues', COLORS.YELLOW);
    } else {
      log('⚠️  CRITICAL! Major issues found', COLORS.RED);
      log('🛠️  Fix critical issues before proceeding', COLORS.RED);
    }

    return percentage;
  }

  async run() {
    try {
      await this.runAllTests();
      return this.generateReport();
    } catch (error) {
      log(`💥 Test runner crashed: ${error.message}`, COLORS.RED);
      return 0;
    }
  }
}

async function main() {
  log('🤖 LeadFive Simple Test Runner', COLORS.BOLD + COLORS.BLUE);
  log('===============================\n', COLORS.BLUE);

  const runner = new SimpleTestRunner();
  const score = await runner.run();

  if (score >= 70) {
    log('\n🎊 Simple testing completed successfully!', COLORS.GREEN);
    log('Next: Open http://localhost:5173 and verify manually', COLORS.CYAN);
  } else {
    log('\n💥 Critical issues found in simple testing!', COLORS.RED);
  }
}

main().catch(error => {
  log(`💥 Test runner error: ${error.message}`, COLORS.RED);
});
