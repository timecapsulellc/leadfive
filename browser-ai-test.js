/**
 * BROWSER AI TESTING SCRIPT
 * Copy and paste this into your browser console on https://leadfive.today
 * to test AI functionality
 */

console.log('🤖 LeadFive AI Features Test Suite');
console.log('==================================\n');

// Test 1: Check if AI services are loaded
console.log('1. 🔍 Checking AI Services...');
try {
  if (window.AIServicesIntegration) {
    console.log('✅ AIServicesIntegration found');
  } else {
    console.log('❌ AIServicesIntegration not found');
  }
} catch (e) {
  console.log('❌ Error checking AI services:', e.message);
}

// Test 2: Check if AI components are mounted
console.log('\n2. 🎨 Checking AI Components...');
const aiComponents = [
  '.ai-coaching-panel',
  '.ai-insights-section',
  '[data-testid="ai-coaching-panel"]',
  '.extraordinary-ai-assistant'
];

aiComponents.forEach(selector => {
  const element = document.querySelector(selector);
  if (element) {
    console.log(`✅ Found AI component: ${selector}`);
    console.log(`   - Visible: ${getComputedStyle(element).display !== 'none'}`);
    console.log(`   - Width: ${element.offsetWidth}px`);
    console.log(`   - Height: ${element.offsetHeight}px`);
  } else {
    console.log(`❌ AI component not found: ${selector}`);
  }
});

// Test 3: Check environment variables
console.log('\n3. 🔑 Checking Environment Variables...');
const requiredEnvVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_ELEVENLABS_API_KEY',
  'VITE_ENABLE_AI_SYNTHESIS'
];

requiredEnvVars.forEach(varName => {
  const value = import.meta?.env?.[varName];
  if (value && value !== 'sk-your-openai-key-here') {
    console.log(`✅ ${varName}: Configured (${value.substring(0, 10)}...)`);
  } else {
    console.log(`❌ ${varName}: Not configured or using placeholder`);
  }
});

// Test 4: Navigate to AI Assistant section
console.log('\n4. 🧭 Testing Navigation to AI Assistant...');
try {
  // Look for AI Assistant menu item
  const aiMenuItem = document.querySelector('[data-section="ai-insights"], .nav-item[onclick*="ai-insights"]');
  if (aiMenuItem) {
    console.log('✅ AI Assistant menu item found');
    console.log('🖱️  Click the AI Assistant menu item to test navigation');
    
    // Highlight the AI menu item
    aiMenuItem.style.border = '3px solid #ff0000';
    aiMenuItem.style.background = 'rgba(255, 0, 0, 0.1)';
    
    setTimeout(() => {
      aiMenuItem.style.border = '';
      aiMenuItem.style.background = '';
    }, 5000);
  } else {
    console.log('❌ AI Assistant menu item not found');
    console.log('🔍 Looking for alternative navigation...');
    
    // Check if we're already on the dashboard
    const currentSection = document.querySelector('.dashboard-content, .ai-insights-section');
    if (currentSection) {
      console.log('✅ Found dashboard content, AI might be embedded');
    }
  }
} catch (e) {
  console.log('❌ Error testing navigation:', e.message);
}

// Test 5: Test AI API connection
console.log('\n5. 🌐 Testing OpenAI API Connection...');
async function testAIConnection() {
  try {
    // Try to access OpenAI service if available
    if (window.OpenAIService) {
      console.log('✅ OpenAI service found, testing connection...');
      const response = await window.OpenAIService.generateResponse('Test message');
      console.log('✅ AI Response received:', response);
    } else if (import.meta?.env?.VITE_OPENAI_API_KEY) {
      console.log('✅ API key found, connection should work');
    } else {
      console.log('❌ No OpenAI service or API key found');
    }
  } catch (e) {
    console.log('❌ AI connection test failed:', e.message);
  }
}
testAIConnection();

// Test 6: Check for React errors
console.log('\n6. ⚠️  Checking for React Errors...');
const originalError = console.error;
const errors = [];
console.error = (...args) => {
  errors.push(args.join(' '));
  originalError.apply(console, args);
};

setTimeout(() => {
  console.error = originalError;
  if (errors.length === 0) {
    console.log('✅ No React errors detected');
  } else {
    console.log(`❌ ${errors.length} errors detected:`);
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
}, 2000);

// Test 7: Mobile responsiveness check
console.log('\n7. 📱 Mobile Responsiveness Check...');
const isMobile = window.innerWidth <= 768;
console.log(`📱 Screen width: ${window.innerWidth}px (${isMobile ? 'Mobile' : 'Desktop'})`);

if (isMobile) {
  const mobileNav = document.querySelector('.mobile-nav, .mobile-navigation');
  if (mobileNav) {
    console.log('✅ Mobile navigation found');
  } else {
    console.log('❌ Mobile navigation not found');
  }
}

// Summary and instructions
console.log('\n🎯 AI TESTING SUMMARY');
console.log('====================');
console.log('1. Check the results above for any ❌ errors');
console.log('2. If AI Assistant menu item is highlighted, click it');
console.log('3. Look for AI Coaching Panel in the dashboard');
console.log('4. Try typing a message in any AI chat interface');
console.log('5. Check browser Network tab for API calls to openai.com');
console.log('\n💡 Expected Behavior:');
console.log('- AI Coaching Panel should display personalized advice');
console.log('- Chat should respond with AI-generated content');
console.log('- Voice synthesis should work if enabled');
console.log('- No console errors related to AI components');
console.log('\n🚀 All tests completed! Review results above.');
