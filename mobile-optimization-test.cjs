#!/usr/bin/env node

/**
 * Mobile Optimization Testing Script for Lead Five
 * Comprehensive mobile UX and performance validation
 */

const fs = require('fs');
const path = require('path');

class MobileOptimizationTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(type, message, details = '') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message, details };
    this.testResults.details.push(logEntry);
    
    const colors = {
      pass: '\x1b[32m✅',
      fail: '\x1b[31m❌',
      warn: '\x1b[33m⚠️',
      info: '\x1b[36mℹ️'
    };
    
    console.log(`${colors[type] || colors.info} ${message}\x1b[0m`);
    if (details) console.log(`   ${details}`);
    
    if (type === 'pass') this.testResults.passed++;
    else if (type === 'fail') this.testResults.failed++;
    else if (type === 'warn') this.testResults.warnings++;
  }

  checkFileExists(filePath, description) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      this.log('pass', `${description} exists`, filePath);
      return true;
    } else {
      this.log('fail', `${description} missing`, filePath);
      return false;
    }
  }

  checkFileContains(filePath, searchString, description) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(searchString)) {
        this.log('pass', description, `Found in ${filePath}`);
        return true;
      } else {
        this.log('fail', description, `Not found in ${filePath}`);
        return false;
      }
    } else {
      this.log('fail', `File not found for ${description}`, filePath);
      return false;
    }
  }

  async testMobileOptimizations() {
    console.log('\n🚀 Starting Lead Five Mobile Optimization Tests\n');

    // 1. Test Core Mobile Files
    this.log('info', '📱 Testing Core Mobile Files');
    this.checkFileExists('src/styles/mobile-responsive.css', 'Mobile responsive CSS');
    this.checkFileExists('src/styles/advanced-mobile-optimization.css', 'Advanced mobile optimization CSS');
    this.checkFileExists('src/styles/next-gen-mobile-optimization.css', 'Next-gen mobile optimization CSS');
    this.checkFileExists('src/components/MobileNav.jsx', 'Mobile navigation component');
    this.checkFileExists('src/components/MobilePWAPrompt.jsx', 'Mobile PWA prompt component');
    this.checkFileExists('src/components/MobilePerformanceMonitor.jsx', 'Mobile performance monitor');

    // 2. Test HTML Meta Tags
    this.log('info', '🏷️ Testing HTML Meta Tags');
    this.checkFileContains('index.html', 'viewport-fit=cover', 'Viewport fit for iPhone X+ notch');
    this.checkFileContains('index.html', 'apple-mobile-web-app-capable', 'iOS web app capability');
    this.checkFileContains('index.html', 'mobile-web-app-capable', 'Mobile web app capability');
    this.checkFileContains('index.html', 'format-detection', 'Format detection disabled');
    this.checkFileContains('index.html', 'msapplication-tap-highlight', 'Tap highlight disabled');

    // 3. Test PWA Configuration
    this.log('info', '📲 Testing PWA Configuration');
    this.checkFileExists('public/manifest.json', 'PWA manifest');
    this.checkFileExists('public/sw.js', 'Service worker');
    this.checkFileContains('public/manifest.json', '"display": "standalone"', 'PWA standalone display');
    this.checkFileContains('public/manifest.json', 'shortcuts', 'PWA shortcuts configured');
    this.checkFileContains('public/manifest.json', 'display_override', 'PWA display override');

    // 4. Test CSS Mobile Optimizations
    this.log('info', '🎨 Testing CSS Mobile Optimizations');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'touch-action: manipulation', 'Touch action optimization');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'min-height: 48px', 'Touch target size compliance');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'safe-area-inset', 'iPhone X+ safe area support');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'prefers-reduced-motion', 'Reduced motion accessibility');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'prefers-contrast: high', 'High contrast accessibility');

    // 5. Test Mobile Component Integration
    this.log('info', '🔧 Testing Mobile Component Integration');
    this.checkFileContains('src/App.jsx', 'MobilePWAPrompt', 'PWA prompt integrated');
    this.checkFileContains('src/App.jsx', 'MobilePerformanceMonitor', 'Performance monitor integrated');
    this.checkFileContains('src/App.css', 'next-gen-mobile-optimization.css', 'Next-gen CSS imported');

    // 6. Test Performance Optimizations
    this.log('info', '⚡ Testing Performance Optimizations');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'will-change:', 'Will-change optimization');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'transform: translateZ(0)', 'GPU acceleration');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'backface-visibility: hidden', 'Backface visibility optimization');

    // 7. Test Touch Optimizations
    this.log('info', '👆 Testing Touch Optimizations');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'touch-haptic', 'Haptic feedback styles');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', '-webkit-tap-highlight-color', 'Tap highlight customization');
    this.checkFileContains('src/components/MobileNav.jsx', 'touch-haptic', 'Touch haptic in navigation');

    // 8. Test Accessibility Features
    this.log('info', '♿ Testing Accessibility Features');
    this.checkFileContains('src/components/MobileNav.jsx', 'aria-label', 'ARIA labels present');
    this.checkFileContains('src/components/MobileNav.jsx', 'aria-expanded', 'ARIA expanded state');
    this.checkFileContains('src/components/MobileNav.jsx', 'role="button"', 'Button roles defined');
    this.checkFileContains('src/components/MobileNav.jsx', 'tabIndex', 'Tab index management');

    // 9. Test Mobile Navigation
    this.log('info', '🧭 Testing Mobile Navigation');
    this.checkFileContains('src/components/MobileNav.jsx', 'useCallback', 'Performance optimization with useCallback');
    this.checkFileContains('src/components/MobileNav.jsx', 'useMemo', 'Performance optimization with useMemo');
    this.checkFileContains('src/components/MobileNav.jsx', 'preventDefault', 'Scroll prevention');

    // 10. Test Mobile CSS Grid & Layout
    this.log('info', '📐 Testing Mobile Layout System');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'mobile-grid', 'Mobile grid system');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'mobile-container', 'Mobile container system');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'mobile-text-', 'Mobile typography system');

    // 11. Test Critical Web Vitals
    this.log('info', '📊 Testing Critical Web Vitals Support');
    this.checkFileContains('src/components/MobilePerformanceMonitor.jsx', 'largest-contentful-paint', 'LCP monitoring');
    this.checkFileContains('src/components/MobilePerformanceMonitor.jsx', 'first-input', 'FID monitoring');
    this.checkFileContains('src/components/MobilePerformanceMonitor.jsx', 'layout-shift', 'CLS monitoring');

    // 12. Test Mobile Form Optimizations
    this.log('info', '📝 Testing Mobile Form Optimizations');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'font-size: 16px', 'iOS zoom prevention');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'mobile-form-input', 'Mobile form inputs');
    this.checkFileContains('src/styles/next-gen-mobile-optimization.css', 'mobile-submit-button', 'Mobile submit buttons');
  }

  async testNetworkOptimizations() {
    this.log('info', '🌐 Testing Network Optimizations');
    
    // Check for preconnect and DNS prefetch
    this.checkFileContains('index.html', 'rel="preconnect"', 'Preconnect optimization');
    this.checkFileContains('index.html', 'rel="dns-prefetch"', 'DNS prefetch optimization');
    
    // Check service worker features
    this.checkFileContains('public/sw.js', 'CACHE_NAME', 'Service worker caching');
    this.checkFileContains('public/sw.js', 'stale-while-revalidate', 'Stale while revalidate strategy');
  }

  generateReport() {
    console.log('\n📋 MOBILE OPTIMIZATION TEST REPORT');
    console.log('=' * 50);
    console.log(`✅ Tests Passed: ${this.testResults.passed}`);
    console.log(`❌ Tests Failed: ${this.testResults.failed}`);
    console.log(`⚠️ Warnings: ${this.testResults.warnings}`);
    
    const total = this.testResults.passed + this.testResults.failed;
    const successRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`📊 Success Rate: ${successRate}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(detail => detail.type === 'fail')
        .forEach(detail => console.log(`   - ${detail.message}: ${detail.details}`));
    }
    
    if (this.testResults.warnings > 0) {
      console.log('\n⚠️ Warnings:');
      this.testResults.details
        .filter(detail => detail.type === 'warn')
        .forEach(detail => console.log(`   - ${detail.message}: ${detail.details}`));
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (successRate >= 90) {
      console.log('🎉 Excellent mobile optimization! Your app is ready for 90% mobile users.');
    } else if (successRate >= 75) {
      console.log('👍 Good mobile optimization. Consider addressing failed tests for better UX.');
    } else {
      console.log('⚠️ Mobile optimization needs improvement. Address failed tests for better mobile UX.');
    }
    
    console.log('\n📱 Next Steps:');
    console.log('1. Test on real mobile devices (iOS & Android)');
    console.log('2. Validate with Lighthouse mobile audit');
    console.log('3. Test with slow network conditions');
    console.log('4. Gather user feedback from mobile users');
    console.log('5. Monitor Core Web Vitals in production');
    
    return {
      successRate,
      totalTests: total,
      results: this.testResults
    };
  }
}

// Run the tests
async function runMobileOptimizationTests() {
  const tester = new MobileOptimizationTester();
  
  await tester.testMobileOptimizations();
  await tester.testNetworkOptimizations();
  
  const report = tester.generateReport();
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'mobile-optimization-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    ...report
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  process.exit(report.results.failed > 0 ? 1 : 0);
}

if (require.main === module) {
  runMobileOptimizationTests().catch(console.error);
}

module.exports = { MobileOptimizationTester };
