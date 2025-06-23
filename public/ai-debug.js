// Debug toggle script for AI components
console.log('🔍 LEAD FIVE AI Debug Mode');

function toggleDebugMode() {
  const debugLink = document.getElementById('ai-debug-css');
  if (debugLink) {
    document.head.removeChild(debugLink);
    console.log('❌ AI Debug Mode Disabled');
    
    // Remove debug classes
    document.querySelectorAll('.ai-component-debug').forEach(el => {
      el.classList.remove('ai-component-debug');
      el.classList.remove('force-display');
      delete el.dataset.componentName;
    });
  } else {
    const link = document.createElement('link');
    link.id = 'ai-debug-css';
    link.rel = 'stylesheet';
    link.href = '/debug.css';
    document.head.appendChild(link);
    
    // Add debug classes to AI components
    const aiComponents = document.querySelectorAll('[class*="ai-"], [id*="ai-"], [class*="AI"], [id*="AI"]');
    aiComponents.forEach(comp => {
      comp.classList.add('ai-component-debug');
      comp.dataset.componentName = comp.tagName.toLowerCase();
      comp.classList.add('force-display');
    });
    
    // Also check for components by their potential names
    const potentialAIComponents = [
      'AICoachingPanel', 'AIEarningsPrediction', 'AITransactionHelper', 
      'AIMarketInsights', 'AISuccessStories', 'AIEmotionTracker'
    ];
    
    potentialAIComponents.forEach(name => {
      const elements = document.getElementsByTagName(name);
      if (elements.length > 0) {
        Array.from(elements).forEach(el => {
          el.classList.add('ai-component-debug');
          el.dataset.componentName = name;
          el.classList.add('force-display');
        });
      }
    });
    
    // Check for elements with ai-related data attributes
    document.querySelectorAll('[data-ai], [data-ai-component]').forEach(el => {
      el.classList.add('ai-component-debug');
      el.dataset.componentName = el.dataset.aiComponent || 'ai-element';
      el.classList.add('force-display');
    });
    
    console.log('✅ AI Debug Mode Enabled');
  }
}

// Create debug toggle button
const button = document.createElement('button');
button.textContent = 'Toggle AI Debug Mode';
button.style.position = 'fixed';
button.style.bottom = '10px';
button.style.right = '10px';
button.style.zIndex = '9999';
button.style.backgroundColor = '#3498db';
button.style.color = 'white';
button.style.border = 'none';
button.style.padding = '8px 15px';
button.style.borderRadius = '4px';
button.style.cursor = 'pointer';
button.onclick = toggleDebugMode;

document.body.appendChild(button);

// Log AI components found
console.log('Searching for AI components...');
setTimeout(() => {
  const aiComponents = document.querySelectorAll('[class*="ai-"], [id*="ai-"], [class*="AI"], [id*="AI"]');
  console.log(`Found ${aiComponents.length} potential AI-related elements`);
  
  if (aiComponents.length > 0) {
    console.log('AI Components found:');
    aiComponents.forEach(comp => {
      console.log(`- ${comp.tagName.toLowerCase()}${comp.id ? ' #' + comp.id : ''} ${Array.from(comp.classList).join('.')}`);
    });
  } else {
    console.warn('No AI components found in the DOM');
  }

  // Add a test AI component to confirm the debug script works
  console.log('Adding a test AI component to verify debugging...');
  const testDiv = document.createElement('div');
  testDiv.className = 'ai-test-component';
  testDiv.textContent = 'AI Debug Test Component';
  testDiv.style.position = 'fixed';
  testDiv.style.top = '10px';
  testDiv.style.right = '10px';
  testDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
  testDiv.style.color = 'white';
  testDiv.style.padding = '10px';
  testDiv.style.borderRadius = '4px';
  testDiv.style.zIndex = '9998';
  document.body.appendChild(testDiv);
}, 2000);
