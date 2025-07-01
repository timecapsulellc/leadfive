#!/usr/bin/env node

/**
 * Quick diagnosis script for Dashboard issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DASHBOARD DIAGNOSIS');
console.log('======================');

// Check for common issues
const dashboardPath = path.join(__dirname, 'src', 'pages', 'Dashboard.jsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

console.log('1. Checking for undefined variable references...');

// Check for common undefined variable patterns
const issues = [];
const lines = dashboardContent.split('\n');

lines.forEach((line, index) => {
  const lineNum = index + 1;
  
  // Check for potential undefined variables
  if (line.includes('loading') && !line.includes('isLoading') && !line.includes('//') && !line.includes('loading-')) {
    issues.push(`Line ${lineNum}: Potential undefined 'loading': ${line.trim()}`);
  }
  
  // Check for destructuring issues
  if (line.includes('...') && line.includes('loading')) {
    issues.push(`Line ${lineNum}: Potential spread/destructuring issue: ${line.trim()}`);
  }
});

if (issues.length > 0) {
  console.log('❌ Found potential issues:');
  issues.forEach(issue => console.log('  ' + issue));
} else {
  console.log('✅ No obvious undefined variable issues found');
}

console.log('\n2. Checking component structure...');

// Check for proper export
if (dashboardContent.includes('export default function Dashboard')) {
  console.log('✅ Component export looks good');
} else if (dashboardContent.includes('export default Dashboard')) {
  console.log('✅ Component export looks good');
} else {
  console.log('❌ Component export issue detected');
}

// Check for useLeadFive destructuring
const useLeadFiveMatch = dashboardContent.match(/const\s*{\s*([^}]+)\s*}\s*=\s*useLeadFive\(\)/);
if (useLeadFiveMatch) {
  console.log('✅ useLeadFive destructuring found');
  const destructured = useLeadFiveMatch[1].split(',').map(s => s.trim());
  console.log('   Destructured variables:', destructured);
  
  if (destructured.includes('loading')) {
    console.log('❌ FOUND THE ISSUE: "loading" in destructuring should be "isLoading"');
  }
} else {
  console.log('❌ useLeadFive destructuring not found properly');
}

console.log('\n3. Line 498 context...');
const line498 = lines[497]; // 0-indexed
if (line498) {
  console.log(`Line 498: ${line498.trim()}`);
  console.log(`Line 497: ${lines[496]?.trim() || 'N/A'}`);
  console.log(`Line 499: ${lines[498]?.trim() || 'N/A'}`);
}

console.log('\n🔧 RECOMMENDATIONS:');
console.log('1. Clear browser cache completely');
console.log('2. Use the NEW server URL: http://localhost:5177');
console.log('3. Check browser console for any import errors');
console.log('4. Verify all destructured variables are correctly named');
