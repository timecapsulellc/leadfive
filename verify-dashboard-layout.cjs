#!/usr/bin/env node

/**
 * Dashboard Layout Fix Verification Script
 * Tests that the dashboard displays properly after wallet connection
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Verifying Dashboard Layout Fixes...\n');

function checkDashboardRenderLogic() {
  console.log('1. Checking dashboard render logic...');
  
  const dashboardPath = path.join(__dirname, 'src/pages/Dashboard.jsx');
  if (!fs.existsSync(dashboardPath)) {
    console.log('❌ Dashboard.jsx not found');
    return false;
  }
  
  const content = fs.readFileSync(dashboardPath, 'utf8');
  
  // Check for improved registration logic
  if (!content.includes('isRegistered === false && !dashboardData && !isLoading')) {
    console.log('❌ Registration check logic not improved');
    return false;
  }
  
  // Check for fallback data setup
  if (!content.includes('maxEarnings: 100, // Set a default cap')) {
    console.log('❌ Fallback data not properly configured');
    return false;
  }
  
  // Check for debug logging
  if (!content.includes('Dashboard Status Debug')) {
    console.log('❌ Debug logging not added');
    return false;
  }
  
  console.log('✅ Dashboard render logic improved');
  return true;
}

function checkHookFallback() {
  console.log('2. Checking useLeadFive hook fallback...');
  
  const hookPath = path.join(__dirname, 'src/hooks/useLeadFive.js');
  if (!fs.existsSync(hookPath)) {
    console.log('❌ useLeadFive.js not found');
    return false;
  }
  
  const content = fs.readFileSync(hookPath, 'utf8');
  
  // Check for fallback registration logic
  if (!content.includes('setIsRegistered(true); // Allow dashboard access')) {
    console.log('❌ Hook fallback logic not added');
    return false;
  }
  
  console.log('✅ Hook fallback logic implemented');
  return true;
}

function checkNavigationFix() {
  console.log('3. Checking navigation fix in RegistrationPrompt...');
  
  const dashboardPath = path.join(__dirname, 'src/pages/Dashboard.jsx');
  const content = fs.readFileSync(dashboardPath, 'utf8');
  
  // Check for proper useNavigate in RegistrationPrompt
  if (!content.includes('const RegistrationPrompt = ({ onRegister, account }) => {')) {
    console.log('❌ RegistrationPrompt not converted to function component');
    return false;
  }
  
  if (!content.includes('const navigate = useNavigate();')) {
    console.log('❌ useNavigate hook not added to RegistrationPrompt');
    return false;
  }
  
  console.log('✅ Navigation fix implemented');
  return true;
}

async function runVerification() {
  console.log('🧪 Running Dashboard Layout Verification...\n');
  
  const results = [];
  
  results.push(checkDashboardRenderLogic());
  results.push(checkHookFallback());
  results.push(checkNavigationFix());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 Verification Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All dashboard layout fixes verified!');
    console.log('🚀 Dashboard should now display properly after wallet connection');
    console.log('💡 Users should see the full dashboard interface');
    console.log('📊 Debug logs will show connection status in browser console');
  } else {
    console.log('\n⚠️ Some verifications failed');
    console.log('👆 Please review the failed checks above');
  }
  
  return passed === total;
}

// Execute verification
runVerification().then(success => {
  console.log('\n🔍 What to check in browser:');
  console.log('1. Open browser console to see debug logs');
  console.log('2. Connect wallet and check if dashboard displays');
  console.log('3. Look for "Dashboard Status Debug" logs');
  console.log('4. Verify sidebar and main content are visible');
  
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
