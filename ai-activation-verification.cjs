#!/usr/bin/env node

/**
 * AI ACTIVATION AND VERIFICATION SCRIPT
 * Comprehensive testing and activation of ChatGPT/OpenAI features
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🤖 AI ACTIVATION & VERIFICATION SYSTEM');
console.log('=====================================\n');

let allChecks = true;

function checkPassed(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
  } else {
    console.log(`❌ ${message}`);
    allChecks = false;
  }
  return condition;
}

function checkWarning(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
  } else {
    console.log(`⚠️  ${message}`);
  }
  return condition;
}

async function testOpenAIAPI() {
  return new Promise((resolve) => {
    // Read the .env file to get the actual API key
    let apiKey = null;
    try {
      if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        const match = envContent.match(/VITE_OPENAI_API_KEY=(.+)/);
        if (match) {
          apiKey = match[1].trim().replace(/['"]/g, '');
        }
      }
    } catch (error) {
      console.log('Could not read .env file:', error.message);
    }

    // Also check Digital Ocean config
    if (!apiKey) {
      try {
        if (fs.existsSync('.do/app.yaml')) {
          const yamlContent = fs.readFileSync('.do/app.yaml', 'utf8');
          const match = yamlContent.match(/VITE_OPENAI_API_KEY:\s*value:\s*["']?([^"'\n]+)["']?/);
          if (match) {
            apiKey = match[1].trim();
          }
        }
      } catch (error) {
        console.log('Could not read .do/app.yaml file:', error.message);
      }
    }

    if (!apiKey || apiKey === 'sk-your-openai-key-here') {
      resolve({ success: false, error: 'No valid API key found' });
      return;
    }

    const data = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Test connection. Respond with 'AI connection successful' if you receive this."
        }
      ],
      max_tokens: 50
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (res.statusCode === 200 && response.choices && response.choices[0]) {
            resolve({ 
              success: true, 
              response: response.choices[0].message.content,
              usage: response.usage
            });
          } else {
            resolve({ 
              success: false, 
              error: `API returned ${res.statusCode}: ${responseData}` 
            });
          }
        } catch (error) {
          resolve({ 
            success: false, 
            error: `Failed to parse response: ${error.message}` 
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ 
        success: false, 
        error: `Request failed: ${error.message}` 
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ 
        success: false, 
        error: 'Request timeout' 
      });
    });

    req.write(data);
    req.end();
  });
}

async function runAIActivationCheck() {
  console.log('1. 🔑 API Key Configuration Check');
  console.log('----------------------------------');
  
  // Check environment variables
  const envVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_OPENAI_MODEL',
    'VITE_ELEVENLABS_API_KEY',
    'VITE_ENABLE_AI_SYNTHESIS'
  ];
  
  let envConfigured = 0;
  envVars.forEach(varName => {
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      const hasVar = envContent.includes(varName);
      if (checkWarning(hasVar, `.env contains ${varName}`)) {
        envConfigured++;
      }
    }
  });
  
  // Check Digital Ocean config
  let doConfigured = 0;
  if (fs.existsSync('.do/app.yaml')) {
    const yamlContent = fs.readFileSync('.do/app.yaml', 'utf8');
    envVars.forEach(varName => {
      const hasVar = yamlContent.includes(varName);
      if (checkPassed(hasVar, `Digital Ocean app.yaml contains ${varName}`)) {
        doConfigured++;
      }
    });
  }
  
  console.log('\n2. 🧠 AI Service Components Check');
  console.log('----------------------------------');
  
  // Check AI service files
  const aiServices = [
    'src/services/AIServicesIntegration.js',
    'src/services/OpenAIService.js',
    'src/services/EnhancedOpenAIService.js'
  ];
  
  aiServices.forEach(file => {
    checkPassed(fs.existsSync(file), `AI Service exists: ${path.basename(file)}`);
  });
  
  console.log('\n3. 🎨 AI UI Components Check');
  console.log('-----------------------------');
  
  // Check AI component files
  const aiComponents = [
    'src/components/AICoachingPanel.jsx',
    'src/components/AITransactionHelper.jsx',
    'src/components/AIEarningsPrediction.jsx',
    'src/components/AIMarketInsights.jsx',
    'src/components/ExtraordinaryAIAssistant.jsx'
  ];
  
  aiComponents.forEach(file => {
    checkPassed(fs.existsSync(file), `AI Component exists: ${path.basename(file)}`);
  });
  
  console.log('\n4. 🔗 Dashboard Integration Check');
  console.log('----------------------------------');
  
  // Check Dashboard integration
  if (fs.existsSync('src/pages/Dashboard.jsx')) {
    const dashboardContent = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
    checkPassed(dashboardContent.includes('AICoachingPanel'), 'AICoachingPanel imported in Dashboard');
    checkPassed(dashboardContent.includes('ai-insights'), 'AI Insights section defined in Dashboard');
    checkPassed(dashboardContent.includes('FaRobot'), 'AI Robot icon imported');
    checkPassed(dashboardContent.includes('AIInsightsSection'), 'AIInsightsSection component present');
  }
  
  console.log('\n5. 🌐 Live API Connection Test');
  console.log('-------------------------------');
  
  try {
    console.log('Testing OpenAI API connection...');
    const apiTest = await testOpenAIAPI();
    
    if (apiTest.success) {
      console.log('✅ OpenAI API connection successful!');
      console.log(`📝 Response: "${apiTest.response}"`);
      if (apiTest.usage) {
        console.log(`📊 Tokens used: ${apiTest.usage.total_tokens}`);
      }
    } else {
      console.log(`❌ OpenAI API connection failed: ${apiTest.error}`);
      allChecks = false;
    }
  } catch (error) {
    console.log(`❌ API test error: ${error.message}`);
    allChecks = false;
  }
  
  console.log('\n6. 📱 Component Visibility Check');
  console.log('---------------------------------');
  
  // Check if AI components have proper CSS
  const cssFiles = [
    'src/components/AICoachingPanel.css',
    'src/styles/ai-integration.css'
  ];
  
  cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
      checkPassed(true, `CSS file exists: ${path.basename(file)}`);
    } else {
      checkWarning(false, `CSS file missing: ${path.basename(file)} (may use inline styles)`);
    }
  });
  
  console.log('\n🎯 AI ACTIVATION SUMMARY');
  console.log('========================');
  
  if (allChecks) {
    console.log('🎉 ALL AI SYSTEMS ARE GO!');
    console.log('');
    console.log('✅ API keys configured in Digital Ocean');
    console.log('✅ AI services and components present');
    console.log('✅ Dashboard integration complete');
    console.log('✅ OpenAI API connection verified');
    console.log('');
    console.log('🚀 NEXT STEPS TO ACTIVATE AI FEATURES:');
    console.log('');
    console.log('1. Open https://leadfive.today in your browser');
    console.log('2. Navigate to Dashboard > AI Assistant');
    console.log('3. Look for the AI Coaching Panel in the overview');
    console.log('4. Test the chat functionality');
    console.log('5. Check browser console for any errors');
    console.log('');
    console.log('🔍 VERIFICATION CHECKLIST:');
    console.log('- AI Coaching Panel should be visible');
    console.log('- AI insights should load automatically');
    console.log('- Chat responses should come from OpenAI');
    console.log('- Voice synthesis should work (if enabled)');
    console.log('- No console errors related to AI');
    console.log('');
    console.log('📞 TROUBLESHOOTING:');
    console.log('- If AI components not visible: Check browser console');
    console.log('- If API errors: Verify API key validity');
    console.log('- If loading issues: Clear browser cache');
    console.log('- If mobile issues: Test responsive design');
  } else {
    console.log('⚠️  SOME AI CHECKS FAILED');
    console.log('');
    console.log('Please review the failed checks above and fix them before proceeding.');
    console.log('The AI features may not work correctly until all issues are resolved.');
  }
  
  return allChecks;
}

runAIActivationCheck()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ AI activation check failed:', error.message);
    process.exit(1);
  });
