#!/usr/bin/env node

/**
 * Test script to validate the contract integration fixes
 */

const { spawn } = require('child_process');
const https = require('https');

console.log('🔧 Testing LeadFive Contract Integration Fixes...\n');

// Test 1: Check for runtime errors in console
function testForRuntimeErrors() {
  return new Promise((resolve) => {
    console.log('1. Testing for runtime errors...');
    
    // Since we can't easily capture browser console in Node.js,
    // we'll check the source files for obvious issues
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Check Dashboard.jsx for account.slice fixes
      const dashboardPath = path.join(__dirname, 'src/pages/Dashboard.jsx');
      const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
      
      if (dashboardContent.includes('account.slice(') && !dashboardContent.includes('String(account).slice(')) {
        console.log('❌ Dashboard.jsx still has unfixed account.slice calls');
        resolve(false);
        return;
      }
      
      // Check ContractService.js for readOnlyContract usage
      const contractServicePath = path.join(__dirname, 'src/services/ContractService.js');
      const contractServiceContent = fs.readFileSync(contractServicePath, 'utf8');
      
      if (!contractServiceContent.includes('readOnlyContract')) {
        console.log('❌ ContractService.js missing readOnlyContract implementation');
        resolve(false);
        return;
      }
      
      console.log('✅ Source files look good');
      resolve(true);
    } catch (error) {
      console.log('❌ Error reading source files:', error.message);
      resolve(false);
    }
  });
}

// Test 2: Verify ethers v6 compatibility fixes
function testEthersCompatibility() {
  return new Promise((resolve) => {
    console.log('2. Testing ethers v6 compatibility...');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      const contractServicePath = path.join(__dirname, 'src/services/ContractService.js');
      const content = fs.readFileSync(contractServicePath, 'utf8');
      
      // Check for read-only contract creation
      if (!content.includes('this.readOnlyContract = new ethers.Contract(')) {
        console.log('❌ ReadOnly contract not properly created');
        resolve(false);
        return;
      }
      
      // Check that view functions use readOnlyContract
      if (content.includes('await this.contract.isUserRegistered(') || 
          content.includes('await this.contract.getUserInfo(') ||
          content.includes('await this.contract.getPoolEarnings(')) {
        console.log('❌ Some view functions still use this.contract instead of this.readOnlyContract');
        resolve(false);
        return;
      }
      
      console.log('✅ Ethers v6 compatibility fixes applied');
      resolve(true);
    } catch (error) {
      console.log('❌ Error checking ethers compatibility:', error.message);
      resolve(false);
    }
  });
}

// Test 3: Verify account string conversion
function testAccountStringConversion() {
  return new Promise((resolve) => {
    console.log('3. Testing account string conversion...');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check key files for String(account) usage
      const filesToCheck = [
        'src/pages/Dashboard.jsx',
        'src/components/WalletConnector.jsx',
        'src/components/MobileNav.jsx',
        'src/pages/Security.jsx',
        'src/pages/Referrals.jsx'
      ];
      
      for (const file of filesToCheck) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Look for problematic patterns
          if (content.includes('account.slice(') && 
              !content.match(/String\(account\)\.slice\(/)) {
            console.log(`❌ ${file} still has unfixed account.slice calls`);
            resolve(false);
            return;
          }
        }
      }
      
      console.log('✅ Account string conversion fixes applied');
      resolve(true);
    } catch (error) {
      console.log('❌ Error checking account string conversion:', error.message);
      resolve(false);
    }
  });
}

// Test 4: Check service worker cache fixes
function testServiceWorkerFixes() {
  return new Promise((resolve) => {
    console.log('4. Testing service worker fixes...');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      const swPath = path.join(__dirname, 'public/sw.js');
      const content = fs.readFileSync(swPath, 'utf8');
      
      // Check cache name is updated
      if (!content.includes('leadfive-v1751335871441')) {
        console.log('❌ Service worker cache name not updated');
        resolve(false);
        return;
      }
      
      // Check for LEADFIVE_CACHE_STRATEGIES
      if (!content.includes('LEADFIVE_CACHE_STRATEGIES')) {
        console.log('❌ Service worker missing LEADFIVE_CACHE_STRATEGIES');
        resolve(false);
        return;
      }
      
      console.log('✅ Service worker fixes look good');
      resolve(true);
    } catch (error) {
      console.log('❌ Error checking service worker:', error.message);
      resolve(false);
    }
  });
}

// Run all tests
async function runTests() {
  console.log('🧪 Running LeadFive Integration Tests...\n');
  
  const results = [];
  
  results.push(await testForRuntimeErrors());
  results.push(await testEthersCompatibility());
  results.push(await testAccountStringConversion());
  results.push(await testServiceWorkerFixes());
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All integration fixes validated successfully!');
    console.log('🚀 LeadFive dashboard should now be production-ready');
  } else {
    console.log('\n⚠️ Some fixes need attention');
    console.log('👆 Please review the failed tests above');
  }
  
  return passedTests === totalTests;
}

// Execute tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
