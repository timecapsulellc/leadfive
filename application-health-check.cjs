#!/usr/bin/env node

/**
 * Comprehensive Application Health Check
 * Tests all major fixes and verifies the application is working properly
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class ApplicationHealthChecker {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(type, test, status, details = '') {
    const result = { test, status, details, timestamp: new Date().toISOString() };
    this.results.details.push(result);
    
    const icons = { pass: '✅', fail: '❌', warn: '⚠️', info: 'ℹ️' };
    console.log(`${icons[status]} ${test}${details ? ` - ${details}` : ''}`);
    
    if (status === 'pass') this.results.passed++;
    else if (status === 'fail') this.results.failed++;
    else if (status === 'warn') this.results.warnings++;
  }

  async checkServiceWorker() {
    console.log('\n🔧 Service Worker Fixes:');
    
    const swPath = path.join(__dirname, 'public/sw.js');
    if (fs.existsSync(swPath)) {
      const content = fs.readFileSync(swPath, 'utf8');
      
      // Check for safe cache handling
      if (content.includes('safeCacheAdd')) {
        this.log('sw', 'Service Worker: Safe cache handling implemented', 'pass');
      } else {
        this.log('sw', 'Service Worker: Safe cache handling missing', 'fail');
      }
      
      // Check for error recovery
      if (content.includes('Promise.allSettled')) {
        this.log('sw', 'Service Worker: Error recovery implemented', 'pass');
      } else {
        this.log('sw', 'Service Worker: Error recovery missing', 'fail');
      }
      
      // Check for reduced asset list
      if (content.includes('STATIC_ASSETS = [') && content.includes('favicon.svg')) {
        this.log('sw', 'Service Worker: Optimized asset list', 'pass');
      } else {
        this.log('sw', 'Service Worker: Asset list not optimized', 'warn');
      }
    } else {
      this.log('sw', 'Service Worker: File missing', 'fail');
    }
  }

  async checkViteConfig() {
    console.log('\n⚡ Vite Configuration Fixes:');
    
    const viteConfigPath = path.join(__dirname, 'vite.config.js');
    if (fs.existsSync(viteConfigPath)) {
      const content = fs.readFileSync(viteConfigPath, 'utf8');
      
      // Check HMR configuration
      if (content.includes('hmr:') && content.includes('clientPort')) {
        this.log('vite', 'Vite: HMR configuration fixed', 'pass');
      } else {
        this.log('vite', 'Vite: HMR configuration missing', 'fail');
      }
      
      // Check optimizeDeps
      if (content.includes('optimizeDeps:')) {
        this.log('vite', 'Vite: Dependency optimization configured', 'pass');
      } else {
        this.log('vite', 'Vite: Dependency optimization missing', 'fail');
      }
      
      // Check cache headers
      if (content.includes('Cache-Control')) {
        this.log('vite', 'Vite: Cache control headers configured', 'pass');
      } else {
        this.log('vite', 'Vite: Cache control headers missing', 'warn');
      }
    } else {
      this.log('vite', 'Vite: Config file missing', 'fail');
    }
  }

  async checkReactHookFixes() {
    console.log('\n⚛️ React Hook Fixes:');
    
    const appPath = path.join(__dirname, 'src/App.jsx');
    if (fs.existsSync(appPath)) {
      const content = fs.readFileSync(appPath, 'utf8');
      
      // Check for error boundaries in imports
      if (content.includes('ErrorFallback')) {
        this.log('react', 'React: Error fallback imports implemented', 'pass');
      } else {
        this.log('react', 'React: Error fallback imports missing', 'fail');
      }
      
      // Check for proper lazy loading
      if (content.includes('.catch(() => import')) {
        this.log('react', 'React: Safe lazy loading implemented', 'pass');
      } else {
        this.log('react', 'React: Safe lazy loading missing', 'fail');
      }
    }
    
    // Check ErrorFallback component exists
    const errorFallbackPath = path.join(__dirname, 'src/components/ErrorFallback.jsx');
    if (fs.existsSync(errorFallbackPath)) {
      this.log('react', 'React: ErrorFallback component created', 'pass');
    } else {
      this.log('react', 'React: ErrorFallback component missing', 'fail');
    }
  }

  async checkSecurityHeaderFixes() {
    console.log('\n🔒 Security Header Fixes:');
    
    const securityPath = path.join(__dirname, 'src/utils/securityHeaders.js');
    if (fs.existsSync(securityPath)) {
      const content = fs.readFileSync(securityPath, 'utf8');
      
      // Check for CSP meta tag fix
      if (content.includes('generateCSPForMetaTag')) {
        this.log('security', 'Security: CSP meta tag fix implemented', 'pass');
      } else {
        this.log('security', 'Security: CSP meta tag fix missing', 'fail');
      }
      
      // Check for frame-ancestors removal
      if (content.includes('delete metaCSPDirectives[\'frame-ancestors\']')) {
        this.log('security', 'Security: Frame-ancestors directive properly handled', 'pass');
      } else {
        this.log('security', 'Security: Frame-ancestors directive not handled', 'fail');
      }
    }
  }

  async checkHTMLFixes() {
    console.log('\n🌐 HTML Fixes:');
    
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      
      // Check for Vite HMR fix
      if (content.includes('__vite_plugin_react_preamble_installed__')) {
        this.log('html', 'HTML: Vite HMR fix script added', 'pass');
      } else {
        this.log('html', 'HTML: Vite HMR fix script missing', 'fail');
      }
      
      // Check for mobile optimizations
      if (content.includes('viewport-fit=cover')) {
        this.log('html', 'HTML: Mobile viewport optimizations present', 'pass');
      } else {
        this.log('html', 'HTML: Mobile viewport optimizations missing', 'warn');
      }
    }
  }

  async checkServerStatus() {
    console.log('\n🚀 Server Status:');
    
    return new Promise((resolve) => {
      exec('lsof -i :5177', (error, stdout, stderr) => {
        if (stdout.includes('LISTEN')) {
          this.log('server', 'Development server running on port 5177', 'pass');
          
          // Try to fetch the homepage
          import('node-fetch').then(fetch => {
            fetch.default('http://localhost:5177')
              .then(response => {
                if (response.ok) {
                  this.log('server', 'Server responding to HTTP requests', 'pass');
                } else {
                  this.log('server', `Server responding with status ${response.status}`, 'warn');
                }
                resolve();
              })
              .catch(err => {
                this.log('server', 'Server not responding to HTTP requests', 'fail', err.message);
                resolve();
              });
          }).catch(() => {
            this.log('server', 'Could not test HTTP response (fetch unavailable)', 'warn');
            resolve();
          });
        } else {
          this.log('server', 'Development server not running on port 5177', 'fail');
          resolve();
        }
      });
    });
  }

  async checkDependencies() {
    console.log('\n📦 Dependencies:');
    
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      this.log('deps', 'Node modules installed', 'pass');
      
      // Check critical dependencies
      const criticalDeps = ['react', 'react-dom', 'vite', 'ethers'];
      criticalDeps.forEach(dep => {
        const depPath = path.join(nodeModulesPath, dep);
        if (fs.existsSync(depPath)) {
          this.log('deps', `Critical dependency ${dep} installed`, 'pass');
        } else {
          this.log('deps', `Critical dependency ${dep} missing`, 'fail');
        }
      });
    } else {
      this.log('deps', 'Node modules not installed', 'fail');
    }
  }

  async runAllChecks() {
    console.log('🏥 Application Health Check Starting...\n');
    
    await this.checkServiceWorker();
    await this.checkViteConfig();
    await this.checkReactHookFixes();
    await this.checkSecurityHeaderFixes();
    await this.checkHTMLFixes();
    await this.checkDependencies();
    await this.checkServerStatus();
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n📋 HEALTH CHECK REPORT');
    console.log('=' * 50);
    console.log(`✅ Tests Passed: ${this.results.passed}`);
    console.log(`❌ Tests Failed: ${this.results.failed}`);
    console.log(`⚠️ Warnings: ${this.results.warnings}`);
    
    const total = this.results.passed + this.results.failed;
    const healthScore = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`🏥 Health Score: ${healthScore}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All critical systems operational!');
      console.log('✅ Application should be working properly');
      console.log('🌐 Try accessing: http://localhost:5177');
    } else {
      console.log('\n⚠️ Issues detected:');
      this.results.details
        .filter(detail => detail.status === 'fail')
        .forEach(detail => console.log(`   - ${detail.test}: ${detail.details || 'Check failed'}`));
    }
    
    console.log('\n🔍 Next Steps:');
    console.log('1. Open http://localhost:5177 in browser');
    console.log('2. Check browser console for errors');
    console.log('3. Test mobile responsiveness');
    console.log('4. Verify wallet connection works');
    console.log('5. Test PWA install prompt');
    
    return {
      healthScore: parseFloat(healthScore),
      allSystemsOperational: this.results.failed === 0,
      details: this.results.details
    };
  }
}

// Run the health check
if (require.main === module) {
  const checker = new ApplicationHealthChecker();
  checker.runAllChecks().catch(console.error);
}

module.exports = { ApplicationHealthChecker };
