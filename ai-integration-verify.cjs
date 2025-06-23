#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 AI Integration Verification Script');
console.log('====================================\n');

// Check if all AI components exist
const aiComponents = [
  'AICoachingPanel',
  'AIEarningsPrediction', 
  'AITransactionHelper',
  'AIMarketInsights',
  'AISuccessStories',
  'AIEmotionTracker'
];

const componentDir = path.join(__dirname, 'src', 'components');
const dashboardFile = path.join(__dirname, 'src', 'pages', 'Dashboard.jsx');

console.log('1. Checking AI Component Files:');
aiComponents.forEach(component => {
  const filePath = path.join(componentDir, `${component}.jsx`);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${component}.jsx ${exists ? 'exists' : 'MISSING'}`);
});

console.log('\n2. Checking Dashboard Integration:');
if (fs.existsSync(dashboardFile)) {
  const dashboardContent = fs.readFileSync(dashboardFile, 'utf8');
  
  console.log('   Import statements:');
  aiComponents.forEach(component => {
    const hasImport = dashboardContent.includes(`import ${component}`);
    console.log(`   ${hasImport ? '✅' : '❌'} ${component} ${hasImport ? 'imported' : 'NOT IMPORTED'}`);
  });
  
  console.log('\n   Component usage in render:');
  aiComponents.forEach(component => {
    const isUsed = dashboardContent.includes(`<${component}`);
    console.log(`   ${isUsed ? '✅' : '❌'} ${component} ${isUsed ? 'rendered' : 'NOT RENDERED'}`);
  });
  
  // Check for key sections
  console.log('\n   Key sections:');
  const sections = [
    { name: 'AI Features Grid', check: 'ai-insights-grid' },
    { name: 'AI Section Component', check: 'function AIInsightsSection' },
    { name: 'AI Insights Header', check: 'ai-insights-header' },
    { name: 'Error Boundaries', check: 'ErrorBoundary' }
  ];
  
  sections.forEach(section => {
    const hasSection = dashboardContent.includes(section.check);
    console.log(`   ${hasSection ? '✅' : '❌'} ${section.name} ${hasSection ? 'present' : 'MISSING'}`);
  });
  
  // Additional checks for AI integration
  console.log('\n   AI Integration Features:');
  const aiFeatures = [
    { name: 'AI Insights Section', check: 'ai-insights' },
    { name: 'AI Coaching Panel', check: 'AICoachingPanel' },
    { name: 'AI Earnings Prediction', check: 'AIEarningsPrediction' },
    { name: 'AI Market Insights', check: 'AIMarketInsights' },
    { name: 'AI Success Stories', check: 'AISuccessStories' },
    { name: 'AI Emotion Tracker', check: 'AIEmotionTracker' }
  ];
  
  aiFeatures.forEach(feature => {
    const hasFeature = dashboardContent.includes(feature.check);
    console.log(`   ${hasFeature ? '✅' : '❌'} ${feature.name} ${hasFeature ? 'integrated' : 'MISSING'}`);
  });
  
} else {
  console.log('   ❌ Dashboard.jsx file not found!');
}

// Check services
console.log('\n3. Checking AI Services:');
const services = ['OpenAIService', 'ElevenLabsService', 'AIEnhancedFeatures'];
const servicesDir = path.join(__dirname, 'src', 'services');

services.forEach(service => {
  const filePath = path.join(servicesDir, `${service}.js`);
  const exists = fs.existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${service}.js ${exists ? 'exists' : 'MISSING'}`);
});

console.log('\n4. Summary:');
console.log('   - All AI components should be imported and rendered in Dashboard.jsx');
console.log('   - Components should be wrapped in ErrorBoundary for stability');
console.log('   - AI features should be accessible from multiple sections of the dashboard');
console.log('   - Check browser console for any runtime errors\n');

console.log('🚀 Next Steps:');
console.log('   1. Run: npm run dev');
console.log('   2. Open: http://localhost:3000/dashboard');
console.log('   3. Look for AI components in the main dashboard');
console.log('   4. Check browser console for errors');
console.log('   5. Test AI assistant section by clicking "AI Assistant" button\n');
