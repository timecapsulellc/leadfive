/**
 * AIRA CHATBOT BROWSER TEST SCRIPT
 * 
 * INSTRUCTIONS:
 * 1. Go to https://leadfive.today
 * 2. Open browser Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 * 
 * This will test AIRA chatbot functionality directly in your browser
 */

console.log('🤖 AIRA CHATBOT LIVE BROWSER TEST');
console.log('=================================');

// Test results storage
window.airaTestResults = [];

function logTest(test, status, message) {
  const result = { test, status, message, timestamp: new Date().toISOString() };
  window.airaTestResults.push(result);
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${test}: ${message}`);
}

// Test 1: Check Environment Variables
console.log('\n1. 🔑 Environment Variables Check');
console.log('----------------------------------');

try {
  const envVars = {
    'VITE_OPENAI_API_KEY': import.meta?.env?.VITE_OPENAI_API_KEY,
    'VITE_OPENAI_MODEL': import.meta?.env?.VITE_OPENAI_MODEL,
    'VITE_ELEVENLABS_API_KEY': import.meta?.env?.VITE_ELEVENLABS_API_KEY,
    'VITE_ENABLE_AI_SYNTHESIS': import.meta?.env?.VITE_ENABLE_AI_SYNTHESIS
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    if (value && value !== 'sk-your-openai-key-here') {
      logTest(key, 'PASS', `Configured (${value.substring(0, 12)}...)`);
    } else {
      logTest(key, 'FAIL', 'Not configured or using placeholder');
    }
  });
} catch (e) {
  logTest('Environment Check', 'FAIL', `Error: ${e.message}`);
}

// Test 2: Check for AI Services
console.log('\n2. 🧠 AI Services Check');
console.log('------------------------');

const aiServices = [
  'AIServicesIntegration',
  'OpenAIService',
  'EnhancedOpenAIService'
];

aiServices.forEach(service => {
  if (window[service]) {
    logTest(service, 'PASS', 'Service available in window object');
  } else {
    logTest(service, 'WARN', 'Service not in global scope (may be module-scoped)');
  }
});

// Test 3: Check for AI Components in DOM
console.log('\n3. 🎨 AI Components DOM Check');
console.log('------------------------------');

const aiSelectors = [
  '.ai-coaching-panel',
  '.ai-insights-section',
  '.extraordinary-ai-assistant',
  '[data-component="ai-coaching"]',
  '[class*="ai-"]',
  '[id*="ai-"]'
];

let foundComponents = 0;
aiSelectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  if (elements.length > 0) {
    logTest(`AI Component ${selector}`, 'PASS', `Found ${elements.length} element(s)`);
    foundComponents++;
    
    // Check visibility
    elements.forEach((el, index) => {
      const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0;
      logTest(`${selector}[${index}] Visibility`, isVisible ? 'PASS' : 'WARN', 
        isVisible ? 'Component is visible' : 'Component exists but may be hidden');
    });
  } else {
    logTest(`AI Component ${selector}`, 'WARN', 'Not found in current DOM');
  }
});

if (foundComponents === 0) {
  logTest('AI Components Search', 'WARN', 'No AI components found - may need to navigate to dashboard');
}

// Test 4: Test Navigation to AI Assistant
console.log('\n4. 🧭 Navigation Test');
console.log('----------------------');

// Look for navigation elements
const navSelectors = [
  'a[href*="ai"]',
  'button[onclick*="ai"]',
  '[data-section="ai-insights"]',
  '.nav-item',
  '.menu-item'
];

let navFound = false;
navSelectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    const text = el.textContent?.toLowerCase() || '';
    if (text.includes('ai') || text.includes('assistant') || text.includes('aira')) {
      logTest('AI Navigation', 'PASS', `Found: "${el.textContent.trim()}"`);
      navFound = true;
      
      // Highlight the element
      el.style.border = '3px solid #00ff00';
      el.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
      
      setTimeout(() => {
        el.style.border = '';
        el.style.backgroundColor = '';
      }, 5000);
    }
  });
});

if (!navFound) {
  logTest('AI Navigation', 'WARN', 'No AI navigation found - check if already on AI page');
}

// Test 5: Test OpenAI API (if possible)
console.log('\n5. 🌐 API Connection Test');
console.log('-------------------------');

async function testAIAPI() {
  try {
    // Try to find and use existing OpenAI service
    if (window.OpenAIService) {
      logTest('OpenAI Service Found', 'PASS', 'Service available for testing');
      
      try {
        const response = await window.OpenAIService.generateResponse('Hello AIRA, please respond with "AIRA is working!"');
        logTest('OpenAI API Test', 'PASS', `Response: "${response}"`);
      } catch (apiError) {
        logTest('OpenAI API Test', 'FAIL', `API Error: ${apiError.message}`);
      }
    } else {
      logTest('OpenAI Service', 'WARN', 'Service not accessible - may be in module scope');
      
      // Try manual API test if we have the key
      const apiKey = import.meta?.env?.VITE_OPENAI_API_KEY;
      if (apiKey && apiKey.startsWith('sk-')) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: 'You are AIRA, the AI assistant for LeadFive. Respond with exactly: "AIRA chatbot is operational!"' },
                { role: 'user', content: 'Test connection' }
              ],
              max_tokens: 50
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content;
            logTest('Direct API Test', 'PASS', `AIRA Response: "${aiResponse}"`);
          } else {
            logTest('Direct API Test', 'FAIL', `API returned status ${response.status}`);
          }
        } catch (fetchError) {
          logTest('Direct API Test', 'FAIL', `Fetch error: ${fetchError.message}`);
        }
      }
    }
  } catch (error) {
    logTest('API Test', 'FAIL', `Error: ${error.message}`);
  }
}

// Run API test
testAIAPI();

// Test 6: Check for React Dev Tools
console.log('\n6. ⚛️ React Application Check');
console.log('------------------------------');

if (window.React) {
  logTest('React', 'PASS', 'React is loaded');
} else {
  logTest('React', 'WARN', 'React not in global scope (normal for production)');
}

if (document.getElementById('root')) {
  logTest('React Root', 'PASS', 'React root element found');
} else {
  logTest('React Root', 'FAIL', 'React root element not found');
}

// Test 7: Console Error Monitoring
console.log('\n7. 🐛 Error Monitoring');
console.log('----------------------');

const originalError = console.error;
const errors = [];

console.error = function(...args) {
  errors.push(args.join(' '));
  originalError.apply(console, args);
};

setTimeout(() => {
  console.error = originalError;
  
  if (errors.length === 0) {
    logTest('Console Errors', 'PASS', 'No errors detected in last 3 seconds');
  } else {
    logTest('Console Errors', 'WARN', `${errors.length} errors detected - check console`);
    errors.forEach((error, i) => {
      console.log(`   Error ${i + 1}: ${error}`);
    });
  }
}, 3000);

// Summary and Instructions
setTimeout(() => {
  console.log('\n🎯 AIRA CHATBOT TEST SUMMARY');
  console.log('============================');
  
  const results = window.airaTestResults;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📊 Success Rate: ${Math.round((passed / (passed + failed + warnings)) * 100)}%`);
  
  console.log('\n🚀 NEXT ACTIONS:');
  console.log('1. If navigation was highlighted, click it to go to AI Assistant');
  console.log('2. If no AI components found, navigate to Dashboard first');
  console.log('3. Look for chat interface or AI coaching panel');
  console.log('4. Try typing a message to test AIRA responses');
  console.log('5. Check Network tab for API calls to openai.com');
  
  console.log('\n📋 TROUBLESHOOTING:');
  console.log('- If API key not configured: Check Digital Ocean environment variables');
  console.log('- If components not visible: Clear browser cache and reload');
  console.log('- If navigation not found: Manually go to /dashboard in URL');
  console.log('- If errors detected: Check what specific errors are showing');
  
  console.log('\n🎉 Test Complete! Check results above.');
}, 4000);

// Expose test results globally for inspection
window.airaTestResults = window.airaTestResults || [];
console.log('\n💡 TIP: You can access detailed results with: window.airaTestResults');
