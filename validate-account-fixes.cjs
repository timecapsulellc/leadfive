#!/usr/bin/env node

/**
 * Validation script for account slice fixes and contract error handling
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Validating Account Slice and Contract Error Fixes...\n');

function checkAccountSliceFixes() {
  console.log('1. Checking for account.slice() issues...');
  
  const filesToCheck = [
    'src/pages/Dashboard.jsx',
    'src/pages/Dashboard-clean.jsx',
    'src/components/SimpleNetworkTree.jsx',
    'src/components/WalletConnector.jsx',
    'src/components/MobileNav.jsx',
    'src/pages/Security.jsx',
    'src/pages/Referrals.jsx',
    'src/components/GenealogyTreeAdvanced.jsx'
  ];
  
  let hasIssues = false;
  
  for (const file of filesToCheck) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for problematic patterns
      if (content.includes('account?.slice(') || 
          (content.includes('account.slice(') && !content.includes('String(account)') && !content.includes('typeof account'))) {
        console.log(`❌ ${file} still has unsafe account.slice calls`);
        hasIssues = true;
      }
    }
  }
  
  if (!hasIssues) {
    console.log('✅ All account.slice() calls are properly protected');
  }
  
  return !hasIssues;
}

function checkContractErrorHandling() {
  console.log('2. Checking contract error handling improvements...');
  
  const contractServicePath = path.join(__dirname, 'src/services/ContractService.js');
  if (!fs.existsSync(contractServicePath)) {
    console.log('❌ ContractService.js not found');
    return false;
  }
  
  const content = fs.readFileSync(contractServicePath, 'utf8');
  
  // Check for address validation
  if (!content.includes('typeof address !== \'string\'') || 
      !content.includes('!address.startsWith(\'0x\')')) {
    console.log('❌ Missing address validation in contract methods');
    return false;
  }
  
  // Check for improved error formatting
  if (!content.includes('could not decode result data') ||
      !content.includes('UNSUPPORTED_OPERATION')) {
    console.log('❌ Missing improved error handling for contract issues');
    return false;
  }
  
  console.log('✅ Contract error handling improvements applied');
  return true;
}

function checkWalletServiceStringConversion() {
  console.log('3. Checking wallet service string conversion...');
  
  const walletServicePath = path.join(__dirname, 'src/services/WalletService.js');
  if (!fs.existsSync(walletServicePath)) {
    console.log('❌ WalletService.js not found');
    return false;
  }
  
  const content = fs.readFileSync(walletServicePath, 'utf8');
  
  // Check for string conversion
  if (!content.includes('typeof accounts[0] === \'string\' ? accounts[0] : String(accounts[0])')) {
    console.log('❌ Missing string conversion for account in WalletService');
    return false;
  }
  
  console.log('✅ Wallet service properly converts account to string');
  return true;
}

function checkServiceWorkerCacheVersion() {
  console.log('4. Checking service worker cache version...');
  
  const swPath = path.join(__dirname, 'public/sw.js');
  if (!fs.existsSync(swPath)) {
    console.log('❌ Service worker not found');
    return false;
  }
  
  const content = fs.readFileSync(swPath, 'utf8');
  
  // Check for updated cache version
  if (!content.includes('leadfive-v1751336400000')) {
    console.log('❌ Service worker cache version not updated');
    return false;
  }
  
  console.log('✅ Service worker cache version updated');
  return true;
}

async function runValidation() {
  console.log('🧪 Running Validation Tests...\n');
  
  const results = [];
  
  results.push(checkAccountSliceFixes());
  results.push(checkContractErrorHandling());
  results.push(checkWalletServiceStringConversion());
  results.push(checkServiceWorkerCacheVersion());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 Validation Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All validations passed!');
    console.log('🚀 The account.slice errors should now be resolved');
    console.log('💡 Contract error handling has been improved');
  } else {
    console.log('\n⚠️ Some validations failed');
    console.log('👆 Please review the failed checks above');
  }
  
  return passed === total;
}

// Execute validation
runValidation().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
