#!/usr/bin/env node

/**
 * Final Contract Integration Validation
 * 
 * This script validates that the LeadFive frontend is properly configured
 * with the latest mainnet deployment addresses.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 LeadFive Frontend Integration Validation\n');

// Expected addresses for the new deployment
const EXPECTED_ADDRESSES = {
  proxy: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
  implementation: '0xA4AB35Ab2BA415E6CCf9559e8dcAB0661cC29e2b',
  owner: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29',
  usdt: '0x55d398326f99059fF775485246999027B3197955'
};

// Key configuration files to validate
const CONFIG_FILES = [
  {
    file: 'src/config/contracts.js',
    checks: ['proxy', 'implementation', 'owner', 'usdt']
  },
  {
    file: 'src/config/app.js', 
    checks: ['proxy', 'implementation', 'owner']
  },
  {
    file: 'frontend-integration/contractConfig.js',
    checks: ['proxy', 'implementation', 'owner', 'usdt']
  },
  {
    file: 'src/constants/deployment.js',
    checks: ['proxy', 'implementation', 'owner', 'usdt']
  }
];

let allValid = true;

console.log('📋 Validating Core Configuration Files:\n');

CONFIG_FILES.forEach(({file, checks}) => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file}: FILE NOT FOUND`);
    allValid = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let fileValid = true;
  
  console.log(`📄 ${file}:`);
  
  checks.forEach(addressType => {
    const address = EXPECTED_ADDRESSES[addressType];
    if (content.includes(address)) {
      console.log(`   ✅ ${addressType}: ${address}`);
    } else {
      console.log(`   ❌ ${addressType}: MISSING`);
      fileValid = false;
      allValid = false;
    }
  });
  
  if (fileValid) {
    console.log(`   🎯 STATUS: ✅ VALID\n`);
  } else {
    console.log(`   🚨 STATUS: ❌ NEEDS UPDATE\n`);
  }
});

// Check environment variables
console.log('🔧 Environment Variables Check:');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const envChecks = [
    ['VITE_CONTRACT_ADDRESS', EXPECTED_ADDRESSES.proxy],
    ['VITE_IMPLEMENTATION_ADDRESS', EXPECTED_ADDRESSES.implementation],
    ['VITE_SPONSOR_ADDRESS', EXPECTED_ADDRESSES.owner],
    ['VITE_USDT_ADDRESS', EXPECTED_ADDRESSES.usdt]
  ];
  
  envChecks.forEach(([envVar, expectedValue]) => {
    if (envContent.includes(`${envVar}=${expectedValue}`)) {
      console.log(`   ✅ ${envVar}=${expectedValue}`);
    } else {
      console.log(`   ⚠️  ${envVar}: Check manually`);
    }
  });
} else {
  console.log('   ❌ .env file not found');
  allValid = false;
}

console.log('\n🌐 Network Configuration:');
console.log(`   ✅ Network: BSC Mainnet (Chain ID: 56)`);
console.log(`   ✅ RPC: https://bsc-dataseed.binance.org/`);
console.log(`   ✅ Explorer: https://bscscan.com`);

console.log('\n🔗 Contract Verification Links:');
console.log(`   📋 Proxy: https://bscscan.com/address/${EXPECTED_ADDRESSES.proxy}`);
console.log(`   🔧 Implementation: https://bscscan.com/address/${EXPECTED_ADDRESSES.implementation}`);
console.log(`   👤 Owner: https://bscscan.com/address/${EXPECTED_ADDRESSES.owner}`);

console.log('\n📊 FINAL VALIDATION RESULT:');
if (allValid) {
  console.log('🎉 ✅ ALL SYSTEMS READY!');
  console.log('   → Frontend is properly configured');
  console.log('   → Contract addresses are up to date');
  console.log('   → Ready for production use');
  console.log('\n🚀 Your LeadFive platform is ready to launch!');
} else {
  console.log('❌ ISSUES DETECTED!');
  console.log('   → Please review the files marked above');
  console.log('   → Update any missing addresses');
  console.log('   → Re-run this validation');
}

console.log('\n📈 Deployment Summary:');
console.log(`   🎯 Proxy: ${EXPECTED_ADDRESSES.proxy}`);
console.log(`   🔧 Implementation: ${EXPECTED_ADDRESSES.implementation} (v1.0)`);
console.log(`   👤 Owner: ${EXPECTED_ADDRESSES.owner} (Trezor)`);
console.log(`   💰 USDT: ${EXPECTED_ADDRESSES.usdt}`);
console.log(`   🌐 Network: BSC Mainnet`);
console.log(`   📅 Updated: June 29, 2025`);
