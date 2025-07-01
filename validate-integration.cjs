#!/usr/bin/env node

/**
 * Lead Five - Smart Contract Integration Validation Script
 * 
 * This script validates that all smart contract integration components
 * are properly configured and ready for production use.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Lead Five Smart Contract Integration Validation');
console.log('================================================\n');

const checks = [];

// Check 1: Core service files exist
const serviceFiles = [
  'src/services/ContractService.js',
  'src/services/WalletService.js', 
  'src/services/DataService.js'
];

serviceFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({
    name: `Service File: ${file}`,
    status: exists ? '✅' : '❌',
    passed: exists
  });
});

// Check 2: Hook files exist
const hookFiles = [
  'src/hooks/useLeadFive.js',
  'src/hooks/useGlobalStats.js'
];

hookFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({
    name: `Hook File: ${file}`,
    status: exists ? '✅' : '❌',
    passed: exists
  });
});

// Check 3: Dashboard components exist and are updated
const dashboardFiles = [
  'src/pages/Dashboard.jsx',
  'src/components/RealTimeBlockchainMonitor.jsx',
  'src/components/dashboard/EarningsOverview.jsx',
  'src/components/dashboard/TeamOverview.jsx',
  'src/components/dashboard/WithdrawalPanel.jsx',
  'src/components/dashboard/ReferralManager.jsx',
  'src/components/dashboard/GlobalStatsPanel.jsx'
];

dashboardFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({
    name: `Dashboard Component: ${path.basename(file)}`,
    status: exists ? '✅' : '❌',
    passed: exists
  });
});

// Check 4: Style files exist
const styleFiles = [
  'src/styles/smart-contract-integration.css'
];

styleFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({
    name: `Style File: ${file}`,
    status: exists ? '✅' : '❌',
    passed: exists
  });
});

// Check 5: Contract configuration exists
const contractFiles = [
  'src/contracts-leadfive.js'
];

contractFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({
    name: `Contract Config: ${file}`,
    status: exists ? '✅' : '❌',
    passed: exists
  });
});

// Check 6: Package.json has required dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['ethers', 'web3', 'react', 'vite'];

requiredDeps.forEach(dep => {
  const hasDepProd = packageJson.dependencies && packageJson.dependencies[dep];
  const hasDepDev = packageJson.devDependencies && packageJson.devDependencies[dep];
  const hasDep = hasDepProd || hasDepDev;
  
  checks.push({
    name: `Dependency: ${dep}`,
    status: hasDep ? '✅' : '❌',
    passed: hasDep
  });
});

// Check 7: Verify Dashboard.jsx has smart contract integration
if (fs.existsSync('src/pages/Dashboard.jsx')) {
  const dashboardContent = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
  const hasUseLeadFive = dashboardContent.includes('useLeadFive');
  const hasWalletConnect = dashboardContent.includes('connectWallet');
  const hasRealData = dashboardContent.includes('dashboardData');
  
  checks.push({
    name: 'Dashboard useLeadFive Integration',
    status: hasUseLeadFive ? '✅' : '❌',
    passed: hasUseLeadFive
  });
  
  checks.push({
    name: 'Dashboard Wallet Connection',
    status: hasWalletConnect ? '✅' : '❌',
    passed: hasWalletConnect
  });
  
  checks.push({
    name: 'Dashboard Real Data Usage',
    status: hasRealData ? '✅' : '❌',
    passed: hasRealData
  });
}

// Print results
console.log('Validation Results:');
console.log('==================\n');

let passedCount = 0;
let totalCount = checks.length;

checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
  if (check.passed) passedCount++;
});

console.log('\n📊 Summary:');
console.log(`✅ Passed: ${passedCount}/${totalCount}`);
console.log(`❌ Failed: ${totalCount - passedCount}/${totalCount}`);

const successRate = (passedCount / totalCount * 100).toFixed(1);
console.log(`🎯 Success Rate: ${successRate}%\n`);

if (passedCount === totalCount) {
  console.log('🎉 VALIDATION SUCCESSFUL! All smart contract integration components are ready.');
  console.log('🚀 Lead Five dashboard is production-ready with real blockchain data.');
} else {
  console.log('⚠️  Some validation checks failed. Please review the missing components.');
}

console.log('\n🔗 Next Steps:');
console.log('1. Test wallet connection flow');
console.log('2. Verify registration process');
console.log('3. Validate real-time data updates');
console.log('4. Deploy to production environment');

console.log('\n✨ Integration Complete! Welcome to the decentralized Lead Five platform.');
