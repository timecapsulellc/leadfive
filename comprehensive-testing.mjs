#!/usr/bin/env node

/**
 * LeadFive Comprehensive Testing Workflow
 * Interactive testing guide with progress tracking
 */

import fs from 'fs';
import readline from 'readline';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

let testResults = {
  coreApp: {},
  ariaChatbot: {},
  walletIntegration: {},
  dashboard: {},
  mobile: {},
  overall: 0
};

async function testCoreApplication() {
  log('\n🧪 TESTING PHASE 1: Core Application', COLORS.BOLD + COLORS.BLUE);
  log('=====================================\n', COLORS.BLUE);
  
  log('📋 Please perform the following tests and respond with y/n:\n', COLORS.YELLOW);
  
  const tests = [
    'Open http://localhost:5173 - Does the homepage load successfully?',
    'Press F12 and check Console tab - Is it clean (no red errors)?',
    'Click through navigation menu (Home, Dashboard, etc.) - Do all pages load?',
    'Do you see the ARIA chatbot icon in the bottom-right corner?',
    'Does the page load within 3 seconds?'
  ];
  
  let passed = 0;
  for (let i = 0; i < tests.length; i++) {
    const answer = await question(`${i + 1}. ${tests[i]} (y/n): `);
    if (answer.toLowerCase() === 'y') {
      log('   ✅ PASS', COLORS.GREEN);
      passed++;
    } else {
      log('   ❌ FAIL', COLORS.RED);
    }
  }
  
  testResults.coreApp = { passed, total: tests.length };
  log(`\n📊 Core Application: ${passed}/${tests.length} tests passed`, 
      passed === tests.length ? COLORS.GREEN : COLORS.YELLOW);
}

async function testARIAChatbot() {
  log('\n🤖 TESTING PHASE 2: ARIA Chatbot', COLORS.BOLD + COLORS.CYAN);
  log('==================================\n', COLORS.CYAN);
  
  const tests = [
    'Click the robot icon - Does the chatbot window open?',
    'Click the minimize button (−) - Does it minimize properly?',
    'Click expand - Does it restore to full size?',
    'Try typing "Hello" and sending - Does it accept input?',
    'Click the close button (×) - Does it close properly?'
  ];
  
  let passed = 0;
  for (let i = 0; i < tests.length; i++) {
    const answer = await question(`${i + 1}. ${tests[i]} (y/n): `);
    if (answer.toLowerCase() === 'y') {
      log('   ✅ PASS', COLORS.GREEN);
      passed++;
    } else {
      log('   ❌ FAIL', COLORS.RED);
    }
  }
  
  testResults.ariaChatbot = { passed, total: tests.length };
  log(`\n📊 ARIA Chatbot: ${passed}/${tests.length} tests passed`, 
      passed === tests.length ? COLORS.GREEN : COLORS.YELLOW);
}

async function testWalletIntegration() {
  log('\n💰 TESTING PHASE 3: Wallet Integration', COLORS.BOLD + COLORS.MAGENTA);
  log('=====================================\n', COLORS.MAGENTA);
  
  const hasMetaMask = await question('Do you have MetaMask installed? (y/n): ');
  
  if (hasMetaMask.toLowerCase() === 'n') {
    log('⚠️  Skipping wallet tests - MetaMask not installed', COLORS.YELLOW);
    testResults.walletIntegration = { passed: 0, total: 0, skipped: true };
    return;
  }
  
  const tests = [
    'Click wallet connect button - Does MetaMask prompt appear?',
    'Connect your wallet - Does it show your address?',
    'Check if BSC network is detected correctly',
    'Refresh the page - Does wallet stay connected?'
  ];
  
  let passed = 0;
  for (let i = 0; i < tests.length; i++) {
    const answer = await question(`${i + 1}. ${tests[i]} (y/n): `);
    if (answer.toLowerCase() === 'y') {
      log('   ✅ PASS', COLORS.GREEN);
      passed++;
    } else {
      log('   ❌ FAIL', COLORS.RED);
    }
  }
  
  testResults.walletIntegration = { passed, total: tests.length };
  log(`\n📊 Wallet Integration: ${passed}/${tests.length} tests passed`, 
      passed === tests.length ? COLORS.GREEN : COLORS.YELLOW);
}

async function testDashboard() {
  log('\n📊 TESTING PHASE 4: Dashboard Features', COLORS.BOLD + COLORS.YELLOW);
  log('=====================================\n', COLORS.YELLOW);
  
  const tests = [
    'Navigate to Dashboard page - Does it load without errors?',
    'Do you see user statistics section?',
    'Is there a genealogy tree area (even if empty for new users)?',
    'Are package options displayed correctly?'
  ];
  
  let passed = 0;
  for (let i = 0; i < tests.length; i++) {
    const answer = await question(`${i + 1}. ${tests[i]} (y/n): `);
    if (answer.toLowerCase() === 'y') {
      log('   ✅ PASS', COLORS.GREEN);
      passed++;
    } else {
      log('   ❌ FAIL', COLORS.RED);
    }
  }
  
  testResults.dashboard = { passed, total: tests.length };
  log(`\n📊 Dashboard: ${passed}/${tests.length} tests passed`, 
      passed === tests.length ? COLORS.GREEN : COLORS.YELLOW);
}

async function testMobile() {
  log('\n📱 TESTING PHASE 5: Mobile & Performance', COLORS.BOLD + COLORS.GREEN);
  log('=========================================\n', COLORS.GREEN);
  
  log('Press F12 → Click device icon → Select mobile view\n', COLORS.YELLOW);
  
  const tests = [
    'Does the mobile navigation menu appear?',
    'Is the ARIA chatbot usable on mobile?',
    'Do all pages display properly on mobile?',
    'Does the application feel responsive and fast?'
  ];
  
  let passed = 0;
  for (let i = 0; i < tests.length; i++) {
    const answer = await question(`${i + 1}. ${tests[i]} (y/n): `);
    if (answer.toLowerCase() === 'y') {
      log('   ✅ PASS', COLORS.GREEN);
      passed++;
    } else {
      log('   ❌ FAIL', COLORS.RED);
    }
  }
  
  testResults.mobile = { passed, total: tests.length };
  log(`\n📊 Mobile & Performance: ${passed}/${tests.length} tests passed`, 
      passed === tests.length ? COLORS.GREEN : COLORS.YELLOW);
}

function generateReport() {
  log('\n📊 COMPREHENSIVE TESTING REPORT', COLORS.BOLD + COLORS.BLUE);
  log('================================\n', COLORS.BLUE);
  
  const sections = [
    { name: 'Core Application', data: testResults.coreApp, icon: '🧪' },
    { name: 'ARIA Chatbot', data: testResults.ariaChatbot, icon: '🤖' },
    { name: 'Wallet Integration', data: testResults.walletIntegration, icon: '💰' },
    { name: 'Dashboard Features', data: testResults.dashboard, icon: '📊' },
    { name: 'Mobile & Performance', data: testResults.mobile, icon: '📱' }
  ];
  
  let totalPassed = 0;
  let totalTests = 0;
  
  sections.forEach(section => {
    if (section.data.skipped) {
      log(`${section.icon} ${section.name}: SKIPPED`, COLORS.YELLOW);
    } else {
      const passed = section.data.passed;
      const total = section.data.total;
      const percentage = Math.round((passed / total) * 100);
      const color = percentage === 100 ? COLORS.GREEN : percentage >= 80 ? COLORS.YELLOW : COLORS.RED;
      
      log(`${section.icon} ${section.name}: ${passed}/${total} (${percentage}%)`, color);
      totalPassed += passed;
      totalTests += total;
    }
  });
  
  const overallPercentage = Math.round((totalPassed / totalTests) * 100);
  testResults.overall = overallPercentage;
  
  log(`\n🎯 OVERALL SCORE: ${totalPassed}/${totalTests} (${overallPercentage}%)`, 
      overallPercentage >= 90 ? COLORS.GREEN : overallPercentage >= 70 ? COLORS.YELLOW : COLORS.RED);
  
  // Save results
  fs.writeFileSync('./testing-results.json', JSON.stringify(testResults, null, 2));
  
  // Recommendations
  log('\n📋 RECOMMENDATIONS:', COLORS.BLUE);
  if (overallPercentage >= 90) {
    log('🎉 EXCELLENT! LeadFive is ready for production deployment!', COLORS.GREEN);
    log('✅ All critical features working properly', COLORS.GREEN);
    log('🚀 Proceed with production deployment', COLORS.GREEN);
  } else if (overallPercentage >= 70) {
    log('✅ GOOD! Most features working, minor issues to address', COLORS.YELLOW);
    log('🔧 Address failing tests before production', COLORS.YELLOW);
    log('📝 Document known issues for users', COLORS.YELLOW);
  } else {
    log('⚠️  NEEDS WORK! Several critical issues found', COLORS.RED);
    log('🛠️  Fix failing tests before proceeding', COLORS.RED);
    log('🔍 Review error logs and debug issues', COLORS.RED);
  }
  
  log('\n📄 Results saved to: testing-results.json', COLORS.CYAN);
  log('🔗 Application URL: http://localhost:5173', COLORS.CYAN);
}

async function main() {
  log('\n🎉 LEADFIVE COMPREHENSIVE TESTING', COLORS.BOLD + COLORS.BLUE);
  log('==================================\n', COLORS.BLUE);
  
  log('✅ Emergency fix successful - Application working!', COLORS.GREEN);
  log('🎯 Now conducting comprehensive feature testing\n', COLORS.YELLOW);
  
  const proceed = await question('Ready to start comprehensive testing? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    log('Testing cancelled. Run again when ready!', COLORS.YELLOW);
    rl.close();
    return;
  }
  
  await testCoreApplication();
  await testARIAChatbot();
  await testWalletIntegration();
  await testDashboard();
  await testMobile();
  
  generateReport();
  
  log('\n🎊 Testing completed! Thank you for your thorough testing.', COLORS.GREEN);
  rl.close();
}

main().catch(console.error);
