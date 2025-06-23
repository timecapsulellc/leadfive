// AI Component Verification Script
// Run this in the browser console to check for AI component issues

console.log('🔍 Starting AI Component Verification...');

// 1. Check if AI components are imported
const checkImports = () => {
  console.log('\n📦 Checking AI Component Imports:');
  
  const aiComponentNames = [
    'AICoachingPanel',
    'AIEarningsPrediction', 
    'AITransactionHelper',
    'AIMarketInsights',
    'AISuccessStories',
    'AIEmotionTracker'
  ];
  
  // Check if components exist in the DOM or as React components
  aiComponentNames.forEach(name => {
    const elements = document.querySelectorAll(`[data-component="${name}"], [class*="${name}"]`);
    console.log(`${name}: ${elements.length > 0 ? '✅ Found' : '❌ Not Found'} (${elements.length} elements)`);
  });
};

// 2. Check for React errors
const checkReactErrors = () => {
  console.log('\n⚛️ Checking for React Errors:');
  
  // Listen for React errors
  window.addEventListener('error', (e) => {
    if (e.message.includes('React') || e.message.includes('AI')) {
      console.error('🔴 React/AI Error:', e.message, e.filename, e.lineno);
    }
  });
  
  // Check for unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason.message && (e.reason.message.includes('AI') || e.reason.message.includes('React'))) {
      console.error('🔴 Unhandled Promise Rejection (AI-related):', e.reason);
    }
  });
  
  console.log('✅ Error listeners set up');
};

// 3. Check current page and route
const checkRoute = () => {
  console.log('\n🛣️ Checking Current Route:');
  console.log('Current path:', window.location.pathname);
  console.log('Current hash:', window.location.hash);
  console.log('Is dashboard?', window.location.pathname.includes('dashboard'));
};

// 4. Check for AI-related CSS
const checkCSS = () => {
  console.log('\n🎨 Checking AI CSS Classes:');
  
  const aiClasses = [
    'ai-features-grid',
    'ai-chat-widget',
    'ai-assistant-container',
    'ai-card',
    'ai-insights-card',
    'ai-success-stories-card'
  ];
  
  aiClasses.forEach(className => {
    const elements = document.getElementsByClassName(className);
    const computed = elements.length > 0 ? window.getComputedStyle(elements[0]) : null;
    console.log(`${className}: ${elements.length > 0 ? '✅ Found' : '❌ Not Found'} (${elements.length} elements)`);
    
    if (computed) {
      console.log(`  Display: ${computed.display}, Visibility: ${computed.visibility}, Opacity: ${computed.opacity}`);
    }
  });
};

// 5. Check React DevTools
const checkReactDevTools = () => {
  console.log('\n🔧 Checking React Components:');
  
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
    
    // Try to find React fiber
    const reactFiber = Object.keys(document.querySelector('#root') || {}).find(key => key.startsWith('__reactFiber'));
    if (reactFiber) {
      console.log('✅ React Fiber found');
    } else {
      console.log('❌ React Fiber not found');
    }
  } else {
    console.log('❌ React DevTools not detected');
  }
};

// 6. Force component rendering test
const forceRenderTest = () => {
  console.log('\n🔄 Testing Force Render:');
  
  // Create a test AI component container
  const testContainer = document.createElement('div');
  testContainer.id = 'ai-test-container';
  testContainer.style.position = 'fixed';
  testContainer.style.top = '10px';
  testContainer.style.left = '10px';
  testContainer.style.zIndex = '10000';
  testContainer.style.background = 'rgba(255, 0, 0, 0.8)';
  testContainer.style.color = 'white';
  testContainer.style.padding = '10px';
  testContainer.style.borderRadius = '5px';
  testContainer.innerHTML = '🤖 AI Test Component - If you see this, React is working';
  
  document.body.appendChild(testContainer);
  
  setTimeout(() => {
    if (document.getElementById('ai-test-container')) {
      console.log('✅ Test component rendered successfully');
      document.body.removeChild(testContainer);
    } else {
      console.log('❌ Test component failed to render');
    }
  }, 2000);
};

// 7. Check for missing dependencies
const checkDependencies = () => {
  console.log('\n📚 Checking Dependencies:');
  
  // Check if React is loaded
  console.log('React:', typeof React !== 'undefined' ? '✅ Loaded' : '❌ Not Loaded');
  
  // Check if React DOM is loaded
  console.log('ReactDOM:', typeof ReactDOM !== 'undefined' ? '✅ Loaded' : '❌ Not Loaded');
  
  // Check for React Router
  console.log('React Router:', window.location.pathname ? '✅ Routing Active' : '❌ No Routing');
  
  // Check for any AI services
  const hasAIServices = window.AIEnhancedFeatures || window.OpenAIService || window.ElevenLabsService;
  console.log('AI Services:', hasAIServices ? '✅ Found' : '❌ Not Found');
};

// Run all checks
const runFullVerification = () => {
  console.log('🚀 Running Full AI Component Verification...');
  
  checkRoute();
  checkReactErrors();
  checkDependencies();
  checkCSS();
  checkImports();
  checkReactDevTools();
  forceRenderTest();
  
  console.log('\n✅ Verification Complete! Check the results above.');
  console.log('💡 If components are still not visible, try:');
  console.log('   1. Check the Network tab for failed imports');
  console.log('   2. Check the Console for React errors');
  console.log('   3. Navigate to /test-ai to see if AI components work there');
  console.log('   4. Run the AI debug overlay by clicking the 🤖 button in the dashboard');
};

// Auto-run if on dashboard
if (window.location.pathname.includes('dashboard')) {
  setTimeout(runFullVerification, 1000);
} else {
  console.log('🔍 AI Component Verification loaded. Run runFullVerification() when on dashboard.');
}

// Make functions available globally
window.runFullVerification = runFullVerification;
window.checkAIComponents = {
  imports: checkImports,
  css: checkCSS,
  route: checkRoute,
  dependencies: checkDependencies,
  reactDevTools: checkReactDevTools,
  forceRender: forceRenderTest
};
