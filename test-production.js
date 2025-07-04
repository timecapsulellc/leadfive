#!/usr/bin/env node

/**
 * LeadFive Production Testing Suite
 * Comprehensive audit script for production deployment
 */

const https = require('https');
const fs = require('fs');

const BASE_URL = 'https://leadfive-app-3f8tb.ondigitalocean.app';
const TEST_RESULTS = [];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          url,
          statusCode: res.statusCode,
          responseTime,
          data,
          headers: res.headers,
          success: res.statusCode === expectedStatus
        });
      });
      
    }).on('error', (err) => {
      reject({
        url,
        error: err.message,
        success: false
      });
    });
  });
}

async function testEndpoint(path, description, expectedStatus = 200) {
  const url = `${BASE_URL}${path}`;
  log(`\n🔍 Testing: ${description}`, 'blue');
  log(`   URL: ${url}`, 'yellow');
  
  try {
    const result = await makeRequest(url, expectedStatus);
    
    if (result.success) {
      log(`   ✅ Status: ${result.statusCode} (${result.responseTime}ms)`, 'green');
    } else {
      log(`   ❌ Status: ${result.statusCode} (Expected: ${expectedStatus})`, 'red');
    }
    
    TEST_RESULTS.push({
      test: description,
      path,
      ...result
    });
    
    return result;
  } catch (error) {
    log(`   ❌ Error: ${error.error || error.message}`, 'red');
    TEST_RESULTS.push({
      test: description,
      path,
      success: false,
      error: error.error || error.message
    });
    return error;
  }
}

async function analyzeHTML(data, testName) {
  const checks = {
    hasTitle: data.includes('<title>LeadFive'),
    hasViewport: data.includes('viewport'),
    hasRoot: data.includes('id="root"'),
    hasAssets: data.includes('/assets/'),
    hasCSS: data.includes('.css'),
    hasJS: data.includes('.js'),
    isMinified: data.length < 5000 && data.includes('crossorigin'),
    hasMetaTags: data.includes('<meta'),
    responsiveDesign: data.includes('width=device-width')
  };
  
  log(`\n📊 HTML Analysis for ${testName}:`, 'blue');
  Object.entries(checks).forEach(([check, passed]) => {
    log(`   ${passed ? '✅' : '❌'} ${check}`, passed ? 'green' : 'red');
  });
  
  return checks;
}

async function testSmartContractIntegration() {
  log(`\n🔗 Testing Smart Contract Integration`, 'bold');
  
  // Test if the page loads with contract address
  const result = await testEndpoint('/', 'Homepage with Smart Contract');
  
  if (result.success) {
    const hasContractAddress = result.data.includes('0x29dcCb502D10C042BcC6a02a7762C49595A9E498');
    log(`   ${hasContractAddress ? '✅' : '❌'} Smart Contract Address in Build`, 
        hasContractAddress ? 'green' : 'red');
  }
}

async function testReferralSystem() {
  log(`\n🔗 Testing Referral System`, 'bold');
  
  const referralTests = [
    { path: '/register?ref=K9NBHT', desc: 'Root Referral Link' },
    { path: '/register?ref=TEST123', desc: 'Custom Referral Code' },
    { path: '/register', desc: 'Registration Without Referral' }
  ];
  
  for (const test of referralTests) {
    await testEndpoint(test.path, test.desc);
  }
}

async function testNavigation() {
  log(`\n🧭 Testing Navigation & Routes`, 'bold');
  
  const routes = [
    { path: '/', desc: 'Homepage' },
    { path: '/about', desc: 'About Page' },
    { path: '/packages', desc: 'Packages Page' },
    { path: '/referrals', desc: 'Referrals Page' },
    { path: '/register', desc: 'Registration Page' },
    { path: '/login', desc: 'Login Page' }
  ];
  
  for (const route of routes) {
    await testEndpoint(route.path, route.desc);
  }
}

async function testMobileResponsiveness() {
  log(`\n📱 Testing Mobile Responsiveness`, 'bold');
  
  const result = await testEndpoint('/', 'Homepage for Mobile Analysis');
  
  if (result.success) {
    const mobileChecks = {
      viewport: result.data.includes('width=device-width'),
      responsiveCSS: result.data.includes('initial-scale=1.0'),
      touchFriendly: result.data.includes('user-scalable=no') || result.data.includes('touch-action'),
      flexLayout: result.data.includes('flex') || result.data.includes('grid'),
      mobileFirst: result.data.includes('@media')
    };
    
    log(`\n📊 Mobile Optimization Analysis:`, 'blue');
    Object.entries(mobileChecks).forEach(([check, passed]) => {
      log(`   ${passed ? '✅' : '❌'} ${check}`, passed ? 'green' : 'red');
    });
  }
}

async function testPWAFeatures() {
  log(`\n📱 Testing PWA Features`, 'bold');
  
  const pwaTests = [
    { path: '/manifest.json', desc: 'PWA Manifest', expectedStatus: 200 },
    { path: '/sw.js', desc: 'Service Worker', expectedStatus: 200 },
    { path: '/favicon.ico', desc: 'Favicon', expectedStatus: 200 },
    { path: '/leadfive-logo.svg', desc: 'App Icon', expectedStatus: 200 }
  ];
  
  for (const test of pwaTests) {
    await testEndpoint(test.path, test.desc, test.expectedStatus);
  }
}

async function testPerformance() {
  log(`\n⚡ Testing Performance`, 'bold');
  
  const performanceTests = [
    { path: '/', desc: 'Homepage Load Time' },
    { path: '/register', desc: 'Registration Page Load Time' },
    { path: '/assets/index-c64634f8.js', desc: 'Main JS Bundle', expectedStatus: 200 },
    { path: '/assets/index-a192dd58.css', desc: 'Main CSS Bundle', expectedStatus: 200 }
  ];
  
  for (const test of performanceTests) {
    const result = await testEndpoint(test.path, test.desc, test.expectedStatus || 200);
    
    if (result.responseTime) {
      if (result.responseTime < 1000) {
        log(`   ⚡ Excellent response time`, 'green');
      } else if (result.responseTime < 3000) {
        log(`   ⚠️  Acceptable response time`, 'yellow');
      } else {
        log(`   🐌 Slow response time`, 'red');
      }
    }
  }
}

async function testSEOAndMetadata() {
  log(`\n🔍 Testing SEO & Metadata`, 'bold');
  
  const result = await testEndpoint('/', 'Homepage SEO Analysis');
  
  if (result.success) {
    const seoChecks = {
      title: result.data.includes('<title>LeadFive'),
      description: result.data.includes('description'),
      keywords: result.data.includes('keywords'),
      ogTags: result.data.includes('og:'),
      twitterCards: result.data.includes('twitter:'),
      canonicalURL: result.data.includes('canonical'),
      structured: result.data.includes('application/ld+json')
    };
    
    log(`\n📊 SEO Analysis:`, 'blue');
    Object.entries(seoChecks).forEach(([check, passed]) => {
      log(`   ${passed ? '✅' : '❌'} ${check}`, passed ? 'green' : 'red');
    });
  }
}

async function testSecurityHeaders() {
  log(`\n🔒 Testing Security Headers`, 'bold');
  
  const result = await testEndpoint('/', 'Security Headers Check');
  
  if (result.success && result.headers) {
    const securityChecks = {
      HTTPS: result.url.startsWith('https://'),
      CSP: result.headers['content-security-policy'] || false,
      XFrame: result.headers['x-frame-options'] || false,
      XSS: result.headers['x-xss-protection'] || false,
      HSTS: result.headers['strict-transport-security'] || false,
      NoSniff: result.headers['x-content-type-options'] || false
    };
    
    log(`\n📊 Security Analysis:`, 'blue');
    Object.entries(securityChecks).forEach(([check, passed]) => {
      log(`   ${passed ? '✅' : '❌'} ${check}`, passed ? 'green' : 'red');
    });
  }
}

function generateReport() {
  log(`\n📋 Generating Comprehensive Report`, 'bold');
  
  const totalTests = TEST_RESULTS.length;
  const passedTests = TEST_RESULTS.filter(test => test.success).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  const report = {
    timestamp: new Date().toISOString(),
    platform: 'Digital Ocean App Platform',
    baseUrl: BASE_URL,
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate: `${successRate}%`
    },
    details: TEST_RESULTS,
    recommendations: []
  };
  
  // Add recommendations based on failures
  TEST_RESULTS.forEach(test => {
    if (!test.success) {
      if (test.path.includes('/dashboard') || test.path.includes('/register')) {
        report.recommendations.push('SPA routing needs configuration for client-side routes');
      }
      if (test.path.includes('.json') || test.path.includes('sw.js')) {
        report.recommendations.push('PWA files missing - configure service worker and manifest');
      }
    }
  });
  
  // Write report to file
  fs.writeFileSync('production-audit-report.json', JSON.stringify(report, null, 2));
  
  log(`\n📊 AUDIT SUMMARY`, 'bold');
  log(`   Total Tests: ${totalTests}`, 'blue');
  log(`   Passed: ${passedTests}`, 'green');
  log(`   Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`   Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');
  
  if (report.recommendations.length > 0) {
    log(`\n🔧 RECOMMENDATIONS:`, 'yellow');
    report.recommendations.forEach(rec => log(`   • ${rec}`, 'yellow'));
  }
  
  log(`\n💾 Detailed report saved to: production-audit-report.json`, 'blue');
}

async function runFullAudit() {
  log(`🚀 LEADFIVE PRODUCTION AUDIT STARTING`, 'bold');
  log(`   Platform: Digital Ocean App Platform`, 'blue');
  log(`   URL: ${BASE_URL}`, 'blue');
  log(`   Time: ${new Date().toLocaleString()}`, 'blue');
  
  try {
    await testSmartContractIntegration();
    await testNavigation();
    await testReferralSystem();
    await testMobileResponsiveness();
    await testPWAFeatures();
    await testPerformance();
    await testSEOAndMetadata();
    await testSecurityHeaders();
    
    generateReport();
    
    log(`\n🎉 AUDIT COMPLETED SUCCESSFULLY`, 'bold');
    
  } catch (error) {
    log(`\n❌ AUDIT FAILED: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the audit
runFullAudit();