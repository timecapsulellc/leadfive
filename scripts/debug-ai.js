// Debug script to check AI component issues
import fs from 'fs';
import path from 'path';

console.log('🔍 Debugging AI Components...');

const componentsPath = 'src/components';
const aiComponents = [
  'AICoachingPanel.jsx',
  'AIEarningsPrediction.jsx', 
  'AITransactionHelper.jsx'
];

console.log('\n📁 Checking AI Components:');
aiComponents.forEach(comp => {
  const fullPath = path.join(componentsPath, comp);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${comp} - EXISTS`);
    
    // Check if it has proper export
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('export default')) {
      console.log(`   ✅ Has default export`);
    } else {
      console.log(`   ❌ Missing default export`);
    }
    
    // Check CSS import
    if (content.includes('.css')) {
      console.log(`   ✅ Has CSS import`);
    } else {
      console.log(`   ❌ Missing CSS import`);
    }
  } else {
    console.log(`❌ ${comp} - MISSING`);
  }
});

// Check Dashboard integration
console.log('\n📄 Checking Dashboard Integration:');
const dashboardPath = 'src/pages/Dashboard.jsx';
if (fs.existsSync(dashboardPath)) {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  
  console.log(`📝 Dashboard file size: ${dashboardContent.length} characters`);
  
  const checks = [
    { name: 'AI imports', regex: /import.*AICoachingPanel/ },
    { name: 'AI menu item', regex: /'ai-assistant'/ },
    { name: 'AI components render', regex: /<AICoachingPanel|<AIEarningsPrediction|<AITransactionHelper/ },
    { name: 'AI section component', regex: /function AISection/ }
  ];
  
  checks.forEach(check => {
    if (check.regex.test(dashboardContent)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name}`);
    }
  });
  
  // Show first few lines
  console.log('\n📝 First 5 lines of Dashboard:');
  const lines = dashboardContent.split('\n').slice(0, 5);
  lines.forEach((line, index) => {
    console.log(`${index + 1}: ${line}`);
  });
  
} else {
  console.log('❌ Dashboard.jsx not found');
}

console.log('\n🎯 If all checks pass but AI is not visible, the issue is likely:');
console.log('1. Browser cache - try hard refresh (Ctrl+Shift+R)');
console.log('2. Dev server cache - restart server');
console.log('3. CSS display issue - check browser dev tools');
console.log('4. JavaScript runtime error - check browser console');
