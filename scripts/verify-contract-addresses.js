#!/usr/bin/env node

/**
 * Contract Address Verification Script
 * 
 * This script checks all files in the project to ensure they're using
 * the correct contract addresses for the LeadFive mainnet deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Correct addresses for LeadFive mainnet deployment
const CORRECT_ADDRESSES = {
  proxy: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
  implementation: '0xA4AB35Ab2BA415E6CCf9559e8dcAB0661cC29e2b',
  owner: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29',
  usdt: '0x55d398326f99059fF775485246999027B3197955'
};

// Old addresses that should be replaced
const OLD_ADDRESSES = [
  '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623', // Old proxy
  '0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c', // Another old address
  '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569', // Another old address
  '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335'  // Old sponsor (should be owner now)
];

// Files to specifically check
const IMPORTANT_FILES = [
  '.env',
  'src/config/contracts.js',
  'src/config/app.js',
  'src/pages/About.jsx',
  'src/services/Web3ContractService.js',
  'src/services/KnowledgeBaseManager.js',
  'frontend-integration/contractConfig.js',
  'frontend-integration/LeadFiveApp.jsx',
  'src/constants/deployment.js'
];

console.log('🔍 LeadFive Contract Address Verification\n');
console.log('📋 Correct Addresses:');
console.log(`   Proxy:          ${CORRECT_ADDRESSES.proxy}`);
console.log(`   Implementation: ${CORRECT_ADDRESSES.implementation}`);
console.log(`   Owner:          ${CORRECT_ADDRESSES.owner}`);
console.log(`   USDT:           ${CORRECT_ADDRESSES.usdt}\n`);

let hasIssues = false;

// Function to check a single file
function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath}: FILE NOT FOUND`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  let fileHasIssues = false;
  
  console.log(`📄 ${filePath}:`);
  
  // Check for correct addresses
  Object.entries(CORRECT_ADDRESSES).forEach(([name, address]) => {
    if (content.includes(address)) {
      console.log(`   ✅ ${name.padEnd(12)}: ${address}`);
    } else if (name === 'owner' && content.includes('0xCeaEfDaDE5a0D574bFd5577665dC58d132995335')) {
      // Special case: old deployer address might still be present in some contexts
      console.log(`   ⚠️  ${name.padEnd(12)}: Using old deployer address - should be updated to owner`);
      fileHasIssues = true;
    } else {
      console.log(`   ❌ ${name.padEnd(12)}: NOT FOUND`);
      fileHasIssues = true;
    }
  });
  
  // Check for old addresses that should be replaced
  OLD_ADDRESSES.forEach(oldAddress => {
    if (content.includes(oldAddress)) {
      console.log(`   🚨 OLD ADDRESS FOUND: ${oldAddress}`);
      fileHasIssues = true;
    }
  });
  
  if (fileHasIssues) {
    hasIssues = true;
  }
  
  console.log('');
}

// Check all important files
IMPORTANT_FILES.forEach(checkFile);

// Search for any remaining old addresses in the entire project
console.log('🔍 Searching for old addresses in entire project...\n');

OLD_ADDRESSES.forEach(oldAddress => {
  try {
    const result = execSync(`grep -r "${oldAddress}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build --exclude="*.log" 2>/dev/null || true`, { encoding: 'utf8' });
    
    if (result.trim()) {
      console.log(`🚨 Found old address ${oldAddress} in:`);
      result.trim().split('\n').forEach(line => {
        console.log(`   ${line}`);
      });
      console.log('');
      hasIssues = true;
    }
  } catch (error) {
    // Ignore grep errors
  }
});

// Final summary
console.log('📊 VERIFICATION SUMMARY:');
if (hasIssues) {
  console.log('❌ Issues found! Please update the files listed above.');
  process.exit(1);
} else {
  console.log('✅ All contract addresses are correctly updated!');
  console.log('🎉 Your LeadFive deployment is ready!');
}

console.log('\n🔗 Quick Links:');
console.log(`   Contract: https://bscscan.com/address/${CORRECT_ADDRESSES.proxy}`);
console.log(`   Owner:    https://bscscan.com/address/${CORRECT_ADDRESSES.owner}`);
console.log(`   USDT:     https://bscscan.com/address/${CORRECT_ADDRESSES.usdt}`);
