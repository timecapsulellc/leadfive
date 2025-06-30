// Simple AI verification script with debugging
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardPath = path.join(__dirname, 'src', 'pages', 'Dashboard.jsx');

if (!fs.existsSync(dashboardPath)) {
  console.error('Dashboard.jsx not found at path:', dashboardPath);
  process.exit(1);
}

const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
console.log('Dashboard.jsx file size:', dashboardContent.length, 'bytes');

// Check for AI imports
const aiImports = [
  'AICoachingPanel',
  'AIEarningsPrediction',
  'AITransactionHelper',
  'AIMarketInsights',
  'AISuccessStories',
  'AIEmotionTracker',
  'OpenAIService',
  'ElevenLabsService'
];

console.log('\n===== AI COMPONENT IMPORTS =====');
aiImports.forEach(imp => {
  const importPattern = `import ${imp} from`;
  const found = dashboardContent.includes(importPattern);
  console.log(`${imp}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
  
  if (!found) {
    // Show 50 characters before and after where we expect the import to be
    const possiblePosition = dashboardContent.indexOf('import') > 0 ? 
                             dashboardContent.indexOf('import') : 0;
    console.log('  Context around where import should be:');
    console.log('  ' + dashboardContent.substring(
      Math.max(0, possiblePosition - 50), 
      possiblePosition + 150
    ));
  }
});

// Check for AI components usage
console.log('\n===== AI COMPONENTS USAGE =====');
const componentPatterns = [
  '<AICoachingPanel',
  '<AIEarningsPrediction', 
  '<AITransactionHelper', 
  '<AIMarketInsights', 
  '<AISuccessStories', 
  '<AIEmotionTracker>'
];

componentPatterns.forEach(pattern => {
  const found = dashboardContent.includes(pattern);
  console.log(`${pattern}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
  
  if (found) {
    // Show where the component is used
    const position = dashboardContent.indexOf(pattern);
    console.log('  Found at position:', position);
    console.log('  Context:');
    console.log('  ' + dashboardContent.substring(
      Math.max(0, position - 50), 
      position + 150
    ));
  }
});

// Check for ai-features-grid
console.log('\n===== AI FEATURES GRID =====');
const aiFeatureGridPattern = 'ai-features-grid';
const gridFound = dashboardContent.includes(aiFeatureGridPattern);
console.log(`ai-features-grid: ${gridFound ? '✅ FOUND' : '❌ NOT FOUND'}`);

if (gridFound) {
  const position = dashboardContent.indexOf(aiFeatureGridPattern);
  console.log('  Found at position:', position);
  console.log('  Context:');
  console.log('  ' + dashboardContent.substring(
    Math.max(0, position - 50), 
    position + 150
  ));
}

// Check for AI Assistant menu item
console.log('\n===== AI ASSISTANT MENU =====');
const menuPattern = "id: 'ai-assistant'";
const menuFound = dashboardContent.includes(menuPattern);
console.log(`AI Assistant menu: ${menuFound ? '✅ FOUND' : '❌ NOT FOUND'}`);

if (menuFound) {
  const position = dashboardContent.indexOf(menuPattern);
  console.log('  Found at position:', position);
  console.log('  Context:');
  console.log('  ' + dashboardContent.substring(
    Math.max(0, position - 50), 
    position + 150
  ));
}

console.log('\n===== VERIFICATION COMPLETE =====');
