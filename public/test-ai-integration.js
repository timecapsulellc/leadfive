console.log('🤖 AI Dashboard Integration Test');
console.log('================================');

// Wait for page to load
setTimeout(() => {
  console.log('\n📊 Testing AI Components in Main Dashboard...\n');

  // Check if we're on the dashboard page
  const currentUrl = window.location.pathname;
  console.log(`Current page: ${currentUrl}`);

  if (!currentUrl.includes('dashboard')) {
    console.log('❌ Not on dashboard page! Navigate to /dashboard first.');
    return;
  }

  // Test AI component presence
  const aiComponents = [
    { name: 'AI Coaching Panel', selector: '[class*="ai-card"] h3:contains("AI Business Coach")' },
    { name: 'AI Earnings Prediction', selector: '[class*="ai-card"] h3:contains("AI Earnings Forecast")' },
    { name: 'AI Transaction Helper', selector: '[class*="ai-card"] h3:contains("AI Transaction Assistant")' },
    { name: 'AI Market Insights', selector: '[class*="ai-card"] h3:contains("AI Market Insights")' },
    { name: 'AI Success Stories', selector: '[class*="ai-card"] h3:contains("AI Success Stories")' },
    { name: 'AI Emotion Tracker', selector: '[class*="ai-card"] h3:contains("AI Emotion Tracker")' }
  ];

  // More comprehensive selectors
  const tests = [
    {
      name: 'AI Features Grid Section',
      test: () => document.querySelector('.ai-features-grid') !== null
    },
    {
      name: 'AI Section Header',
      test: () => document.querySelector('.ai-section-header') !== null
    },
    {
      name: 'AI Assistant Button in Header',
      test: () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => btn.textContent.includes('AI Assistant'));
      }
    },
    {
      name: 'AI Menu Item',
      test: () => {
        const menuItems = Array.from(document.querySelectorAll('[data-section="ai-assistant"]'));
        return menuItems.length > 0;
      }
    },
    {
      name: 'AI Cards in Overview',
      test: () => {
        const aiCards = Array.from(document.querySelectorAll('.ai-card, .overview-card'));
        return aiCards.some(card => card.textContent.includes('AI'));
      }
    }
  ];

  console.log('🔍 Component Visibility Tests:');
  tests.forEach(test => {
    try {
      const result = test.test();
      console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'FOUND' : 'NOT FOUND'}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  });

  // Check for AI-related text content
  console.log('\n🔍 AI Content Tests:');
  const aiKeywords = ['AI Assistant', 'AI Coaching', 'AI Earnings', 'AI Market', 'AI Business Coach'];
  aiKeywords.forEach(keyword => {
    const found = document.body.textContent.includes(keyword);
    console.log(`${found ? '✅' : '❌'} "${keyword}": ${found ? 'FOUND' : 'NOT FOUND'}`);
  });

  // Check for debug elements
  console.log('\n🔍 Debug Elements:');
  const debugElements = [
    'AI Features Grid Loaded',
    'AI FEATURES WORKING!',
    'AI System Status'
  ];
  
  debugElements.forEach(debugText => {
    const found = document.body.textContent.includes(debugText);
    console.log(`${found ? '✅' : '❌'} Debug: "${debugText}": ${found ? 'FOUND' : 'NOT FOUND'}`);
  });

  // Test AI section navigation
  console.log('\n🔍 Navigation Tests:');
  const aiMenuItem = document.querySelector('[data-section="ai-assistant"]');
  if (aiMenuItem) {
    console.log('✅ AI Assistant menu item found');
    console.log('🖱️  Clicking AI Assistant menu item...');
    aiMenuItem.click();
    
    setTimeout(() => {
      const aiSection = document.querySelector('.ai-section, .ai-tab-content');
      if (aiSection) {
        console.log('✅ AI Section opened successfully');
      } else {
        console.log('❌ AI Section did not open');
      }
    }, 500);
  } else {
    console.log('❌ AI Assistant menu item not found');
  }

  // Create floating test results
  const resultsDiv = document.createElement('div');
  resultsDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: #00ff00;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    max-width: 300px;
    max-height: 400px;
    overflow-y: auto;
  `;
  
  const testResults = tests.map(test => {
    try {
      const result = test.test();
      return `${result ? '✅' : '❌'} ${test.name}`;
    } catch (error) {
      return `❌ ${test.name}: ERROR`;
    }
  }).join('<br>');
  
  resultsDiv.innerHTML = `
    <strong>🤖 AI Integration Test Results</strong><br><br>
    ${testResults}<br><br>
    <strong>Current URL:</strong> ${window.location.pathname}<br>
    <strong>Timestamp:</strong> ${new Date().toLocaleTimeString()}
  `;
  
  document.body.appendChild(resultsDiv);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.body.contains(resultsDiv)) {
      document.body.removeChild(resultsDiv);
    }
  }, 10000);

}, 2000); // Wait 2 seconds for page to fully load

// Helper function to test AI component functionality
window.testAIComponents = function() {
  console.log('\n🧪 Testing AI Component Functionality...');
  
  // Try to trigger AI insights generation
  const insightsButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent.includes('AI Insights') || btn.textContent.includes('Generate'));
  
  if (insightsButton) {
    console.log('🔄 Testing AI insights generation...');
    insightsButton.click();
  }

  // Test AI assistant opening
  const aiAssistantButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent.includes('AI Assistant'));
    
  if (aiAssistantButton) {
    console.log('🔄 Testing AI assistant opening...');
    aiAssistantButton.click();
  }
  
  console.log('✅ AI functionality tests completed. Check dashboard for results.');
};

console.log('\n🚀 AI Integration Test Loaded!');
console.log('💡 Run window.testAIComponents() to test functionality');
console.log('📋 Test results will appear in top-right corner of screen');
