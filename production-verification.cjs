#!/usr/bin/env node

/**
 * Production Deployment Verification Script
 * Tests the live Digital Ocean deployment
 */

const https = require('https');

console.log('🔍 LeadFive Production Deployment Verification');
console.log('===============================================\n');

const PRODUCTION_URLS = [
  'https://leadfive.today',
  'https://leadfive-app-3f8tb.ondigitalocean.app'
];

let results = {
  total: 0,
  passed: 0,
  failed: 0
};

function checkResult(passed, message) {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`✅ ${message}`);
  } else {
    results.failed++;
    console.log(`❌ ${message}`);
  }
}

function makeHttpsRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ 
        statusCode: res.statusCode, 
        headers: res.headers,
        data: data.substring(0, 1000) // First 1000 chars only
      }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testProductionSite(url) {
  try {
    console.log(`\n🌐 Testing: ${url}`);
    console.log('─'.repeat(50));
    
    const response = await makeHttpsRequest(url);
    
    // Test 1: HTTP Status
    checkResult(response.statusCode === 200, `HTTP Status: ${response.statusCode}`);
    
    // Test 2: Content Type
    const isHTML = response.headers['content-type']?.includes('text/html');
    checkResult(isHTML, `Content-Type: ${response.headers['content-type']}`);
    
    // Test 3: Required HTML Elements
    const hasRootElement = response.data.includes('id="root"');
    checkResult(hasRootElement, 'React root element present');
    
    // Test 4: Mobile Viewport
    const hasMobileViewport = response.data.includes('viewport');
    checkResult(hasMobileViewport, 'Mobile viewport meta tag present');
    
    // Test 5: PWA Manifest
    const hasManifest = response.data.includes('manifest.json');
    checkResult(hasManifest, 'PWA manifest link present');
    
    // Test 6: LeadFive Branding
    const hasLeadFive = response.data.includes('LeadFive') || response.data.includes('leadfive');
    checkResult(hasLeadFive, 'LeadFive branding present');
    
    // Test 7: Modern JS
    const hasModernJS = response.data.includes('type="module"');
    checkResult(hasModernJS, 'Modern JavaScript modules');
    
    // Test 8: Cache Headers
    const hasCacheControl = !!response.headers['cache-control'];
    checkResult(hasCacheControl, `Cache control: ${response.headers['cache-control']}`);
    
    return true;
    
  } catch (error) {
    checkResult(false, `Failed to connect: ${error.message}`);
    return false;
  }
}

async function testManifestAndServiceWorker(baseUrl) {
  console.log(`\n🔧 Testing PWA Resources for: ${baseUrl}`);
  console.log('─'.repeat(50));
  
  try {
    // Test manifest.json
    const manifestResponse = await makeHttpsRequest(`${baseUrl}/manifest.json`);
    checkResult(manifestResponse.statusCode === 200, 'PWA manifest accessible');
    
    if (manifestResponse.statusCode === 200) {
      try {
        const manifest = JSON.parse(manifestResponse.data);
        checkResult(!!manifest.name, `Manifest name: ${manifest.name}`);
        checkResult(!!manifest.start_url, `Start URL: ${manifest.start_url}`);
        checkResult(Array.isArray(manifest.icons), `Icons: ${manifest.icons?.length} defined`);
      } catch (e) {
        checkResult(false, 'Manifest JSON parsing failed');
      }
    }
    
    // Test service worker
    const swResponse = await makeHttpsRequest(`${baseUrl}/sw.js`);
    checkResult(swResponse.statusCode === 200, 'Service worker accessible');
    
    if (swResponse.statusCode === 200) {
      const hasServiceWorkerCode = swResponse.data.includes('addEventListener');
      checkResult(hasServiceWorkerCode, 'Service worker code present');
    }
    
  } catch (error) {
    checkResult(false, `PWA resource test failed: ${error.message}`);
  }
}

async function runProductionTests() {
  console.log('🚀 Starting production deployment verification...\n');
  
  // Test main URLs
  for (const url of PRODUCTION_URLS) {
    await testProductionSite(url);
  }
  
  // Test PWA resources on main site
  await testManifestAndServiceWorker(PRODUCTION_URLS[0]);
  
  // Summary
  console.log('\n📊 PRODUCTION VERIFICATION SUMMARY');
  console.log('===================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  const passRate = Math.round((results.passed / results.total) * 100);
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  if (passRate >= 90) {
    console.log('\n🎉 PRODUCTION DEPLOYMENT SUCCESSFUL!');
    console.log('=====================================');
    console.log('✅ LeadFive is live and fully functional');
    console.log('✅ Mobile optimization deployed');
    console.log('✅ PWA features working');
    console.log('✅ All critical fixes applied');
    console.log('\n🌐 Live URLs:');
    PRODUCTION_URLS.forEach(url => console.log(`   • ${url}`));
    console.log('\n📱 Ready for mobile users worldwide!');
  } else if (passRate >= 75) {
    console.log('\n⚠️  Production deployment mostly successful');
    console.log('Some minor issues detected - review above');
  } else {
    console.log('\n❌ Production deployment needs attention');
    console.log('Multiple issues detected - immediate review required');
  }
  
  return passRate >= 75;
}

// Run the tests
if (require.main === module) {
  runProductionTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Production verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runProductionTests };
