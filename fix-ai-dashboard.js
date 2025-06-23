#!/usr/bin/env node

/**
 * Professional AI Dashboard Integration Fix Script
 * This script ensures all AI components are properly integrated
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Professional AI Dashboard Integration Fix');
console.log('==========================================\n');

const DASHBOARD_PATH = './src/pages/Dashboard.jsx';
const COMPONENTS_DIR = './src/components';

// Step 1: Verify all AI components exist
console.log('1. Verifying AI Component Files...');
const aiComponents = [
  'AICoachingPanel.jsx',
  'AIEarningsPrediction.jsx',
  'AITransactionHelper.jsx',
  'AIMarketInsights.jsx',
  'AISuccessStories.jsx',
  'AIEmotionTracker.jsx'
];

let missingComponents = [];
aiComponents.forEach(component => {
  const filePath = path.join(COMPONENTS_DIR, component);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${component} exists`);
  } else {
    console.log(`   ❌ ${component} MISSING`);
    missingComponents.push(component);
  }
});

if (missingComponents.length > 0) {
  console.log(`\n⚠️  Missing ${missingComponents.length} AI components. Please create them first.`);
  process.exit(1);
}

// Step 2: Check Dashboard file
console.log('\n2. Checking Dashboard File...');
if (!fs.existsSync(DASHBOARD_PATH)) {
  console.log(`❌ Dashboard file not found at ${DASHBOARD_PATH}`);
  process.exit(1);
}

let dashboardContent = fs.readFileSync(DASHBOARD_PATH, 'utf8');
const originalContent = dashboardContent;

// Step 3: Ensure AI imports are present
console.log('\n3. Ensuring AI Imports...');
const requiredImports = [
  "import AICoachingPanel from '../components/AICoachingPanel';",
  "import AIEarningsPrediction from '../components/AIEarningsPrediction';",
  "import AITransactionHelper from '../components/AITransactionHelper';",
  "import AIMarketInsights from '../components/AIMarketInsights';",
  "import AISuccessStories from '../components/AISuccessStories';",
  "import AIEmotionTracker from '../components/AIEmotionTracker';"
];

let importsAdded = 0;
requiredImports.forEach(importStatement => {
  const componentName = importStatement.match(/import (\w+)/)[1];
  if (!dashboardContent.includes(`import ${componentName}`)) {
    console.log(`   ✅ Adding import: ${componentName}`);
    
    // Find the last import line
    const importLines = dashboardContent.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      importLines.splice(lastImportIndex + 1, 0, importStatement);
      dashboardContent = importLines.join('\n');
      importsAdded++;
    }
  } else {
    console.log(`   ✅ ${componentName} already imported`);
  }
});

// Step 4: Ensure AI state variables exist
console.log('\n4. Ensuring AI State Variables...');
const requiredStates = [
  'const [aiInsights, setAiInsights] = useState(null);',
  'const [isAiLoading, setIsAiLoading] = useState(false);',
  'const [aiWelcomeShown, setAiWelcomeShown] = useState(false);'
];

let statesAdded = 0;
requiredStates.forEach(stateDeclaration => {
  const stateName = stateDeclaration.match(/\[(\w+),/)[1];
  if (!dashboardContent.includes(stateName)) {
    console.log(`   ✅ Adding state: ${stateName}`);
    
    // Find where to insert state (after other useState declarations)
    const lines = dashboardContent.split('\n');
    let insertIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('useState(') && lines[i].includes('const [')) {
        insertIndex = i;
      }
    }
    
    if (insertIndex >= 0) {
      lines.splice(insertIndex + 1, 0, '  ' + stateDeclaration);
      dashboardContent = lines.join('\n');
      statesAdded++;
    }
  } else {
    console.log(`   ✅ ${stateName} already exists`);
  }
});

// Step 5: Add debugging console logs
console.log('\n5. Adding Debug Console Logs...');
const debugLogSection = `
  // Debug AI component imports
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Dashboard AI Component Status:');
    console.log('AICoachingPanel:', typeof AICoachingPanel, AICoachingPanel);
    console.log('AIEarningsPrediction:', typeof AIEarningsPrediction, AIEarningsPrediction);
    console.log('AITransactionHelper:', typeof AITransactionHelper, AITransactionHelper);
    console.log('AIMarketInsights:', typeof AIMarketInsights, AIMarketInsights);
    console.log('AISuccessStories:', typeof AISuccessStories, AISuccessStories);
    console.log('AIEmotionTracker:', typeof AIEmotionTracker, AIEmotionTracker);
  }
`;

if (!dashboardContent.includes('🚀 Dashboard AI Component Status:')) {
  // Find the function declaration and add debug logs
  const functionMatch = dashboardContent.match(/(export default function Dashboard[^{]*{)/);
  if (functionMatch) {
    dashboardContent = dashboardContent.replace(
      functionMatch[1],
      functionMatch[1] + debugLogSection
    );
    console.log('   ✅ Added debug console logs');
  }
} else {
  console.log('   ✅ Debug logs already present');
}

// Step 6: Save changes if any were made
if (dashboardContent !== originalContent) {
  console.log('\n6. Saving Changes...');
  
  // Create backup
  const backupPath = DASHBOARD_PATH + '.backup-' + Date.now();
  fs.writeFileSync(backupPath, originalContent);
  console.log(`   📋 Backup created: ${backupPath}`);
  
  // Save updated file
  fs.writeFileSync(DASHBOARD_PATH, dashboardContent);
  console.log(`   ✅ Dashboard updated successfully`);
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Imports added: ${importsAdded}`);
  console.log(`   - States added: ${statesAdded}`);
  console.log(`   - Debug logs: Added`);
} else {
  console.log('\n✅ Dashboard already properly configured');
}

// Step 7: Verification
console.log('\n7. Final Verification...');
const finalContent = fs.readFileSync(DASHBOARD_PATH, 'utf8');

const verificationChecks = [
  { name: 'AICoachingPanel import', check: finalContent.includes('import AICoachingPanel') },
  { name: 'AIEarningsPrediction import', check: finalContent.includes('import AIEarningsPrediction') },
  { name: 'AITransactionHelper import', check: finalContent.includes('import AITransactionHelper') },
  { name: 'AIMarketInsights import', check: finalContent.includes('import AIMarketInsights') },
  { name: 'AISuccessStories import', check: finalContent.includes('import AISuccessStories') },
  { name: 'AIEmotionTracker import', check: finalContent.includes('import AIEmotionTracker') },
  { name: 'aiInsights state', check: finalContent.includes('aiInsights') },
  { name: 'isAiLoading state', check: finalContent.includes('isAiLoading') },
  { name: 'Debug logs', check: finalContent.includes('🚀 Dashboard AI Component Status:') }
];

verificationChecks.forEach(check => {
  console.log(`   ${check.check ? '✅' : '❌'} ${check.name}`);
});

console.log('\n🚀 Next Steps:');
console.log('   1. Restart development server: npm run dev');
console.log('   2. Open dashboard: http://localhost:5176/dashboard');
console.log('   3. Check browser console for debug logs');
console.log('   4. Look for AI verification panel in top-left corner');
console.log('   5. Verify AI components are rendering\n');

console.log('✅ AI Dashboard Integration Fix Complete!');
