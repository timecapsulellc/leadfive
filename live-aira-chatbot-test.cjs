#!/usr/bin/env node

/**
 * LIVE AIRA CHATBOT TESTING SCRIPT
 * Tests AIRA chatbot functionality on https://leadfive.today
 */

const https = require('https');
const fs = require('fs');

console.log('🤖 AIRA CHATBOT LIVE TESTING');
console.log('============================\n');

let testResults = [];

function logResult(test, status, message) {
  const result = { test, status, message, timestamp: new Date().toISOString() };
  testResults.push(result);
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${test}: ${message}`);
}

async function makeHttpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testMainSite() {
  console.log('1. 🌐 Testing Main Site Accessibility');
  console.log('-------------------------------------');
  
  try {
    const response = await makeHttpsRequest({
      hostname: 'leadfive.today',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'AIRA-Chatbot-Tester/1.0'
      }
    });

    if (response.statusCode === 200) {
      logResult('Site Accessibility', 'PASS', 'Site is live and responding');
      
      // Check for AI-related content
      const html = response.data.toLowerCase();
      
      if (html.includes('ai') || html.includes('chatbot') || html.includes('assistant')) {
        logResult('AI Content Detection', 'PASS', 'AI-related content found in HTML');
      } else {
        logResult('AI Content Detection', 'WARN', 'No explicit AI content in main HTML (may be loaded dynamically)');
      }
      
      return true;
    } else {
      logResult('Site Accessibility', 'FAIL', `Site returned status ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logResult('Site Accessibility', 'FAIL', `Connection failed: ${error.message}`);
    return false;
  }
}

async function testAPIKeys() {
  console.log('\n2. 🔑 Testing API Configuration');
  console.log('--------------------------------');
  
  // Test OpenAI API key from environment
  let openaiKey = null;
  let elevenlabsKey = null;
  
  try {
    if (fs.existsSync('.do/app.yaml')) {
      const yamlContent = fs.readFileSync('.do/app.yaml', 'utf8');
      
      const openaiMatch = yamlContent.match(/VITE_OPENAI_API_KEY:\s*value:\s*["']?([^"'\n]+)["']?/);
      if (openaiMatch) {
        openaiKey = openaiMatch[1].trim();
        logResult('OpenAI Key Config', 'PASS', `Key configured (${openaiKey.substring(0, 10)}...)`);
      }
      
      const elevenlabsMatch = yamlContent.match(/VITE_ELEVENLABS_API_KEY:\s*value:\s*["']?([^"'\n]+)["']?/);
      if (elevenlabsMatch) {
        elevenlabsKey = elevenlabsMatch[1].trim();
        logResult('ElevenLabs Key Config', 'PASS', `Key configured (${elevenlabsKey.substring(0, 10)}...)`);
      }
    }
  } catch (error) {
    logResult('API Key Check', 'WARN', 'Could not read local config (keys may be set remotely)');
  }
  
  return { openaiKey, elevenlabsKey };
}

async function testOpenAIConnection(apiKey) {
  console.log('\n3. 🧠 Testing OpenAI API Connection');
  console.log('-----------------------------------');
  
  if (!apiKey || apiKey === 'sk-your-openai-key-here') {
    logResult('OpenAI API Test', 'SKIP', 'No valid API key available for testing');
    return false;
  }

  try {
    const testData = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are AIRA, the AI assistant for LeadFive platform. Respond with exactly: 'AIRA chatbot connection successful'"
        },
        {
          role: "user",
          content: "Test connection"
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    const response = await makeHttpsRequest({
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': testData.length
      }
    }, testData);

    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      if (result.choices && result.choices[0]) {
        const aiResponse = result.choices[0].message.content;
        logResult('OpenAI API Test', 'PASS', `API responding: "${aiResponse}"`);
        logResult('Token Usage', 'INFO', `Tokens used: ${result.usage?.total_tokens || 'unknown'}`);
        return true;
      }
    } else {
      const errorData = JSON.parse(response.data);
      logResult('OpenAI API Test', 'FAIL', `API error: ${errorData.error?.message || 'Unknown error'}`);
    }
  } catch (error) {
    logResult('OpenAI API Test', 'FAIL', `Connection failed: ${error.message}`);
  }
  
  return false;
}

async function testElevenLabsConnection(apiKey) {
  console.log('\n4. 🎤 Testing ElevenLabs API Connection');
  console.log('--------------------------------------');
  
  if (!apiKey) {
    logResult('ElevenLabs API Test', 'SKIP', 'No API key available for testing');
    return false;
  }

  try {
    // Test with a simple API call to get voice list
    const response = await makeHttpsRequest({
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: '/v1/voices',
      method: 'GET',
      headers: {
        'XI-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      if (result.voices && Array.isArray(result.voices)) {
        logResult('ElevenLabs API Test', 'PASS', `API responding with ${result.voices.length} voices available`);
        return true;
      }
    } else {
      logResult('ElevenLabs API Test', 'FAIL', `API returned status ${response.statusCode}`);
    }
  } catch (error) {
    logResult('ElevenLabs API Test', 'FAIL', `Connection failed: ${error.message}`);
  }
  
  return false;
}

async function testDashboardEndpoint() {
  console.log('\n5. 📊 Testing Dashboard Accessibility');
  console.log('-------------------------------------');
  
  try {
    const response = await makeHttpsRequest({
      hostname: 'leadfive.today',
      port: 443,
      path: '/dashboard',
      method: 'GET',
      headers: {
        'User-Agent': 'AIRA-Chatbot-Tester/1.0'
      }
    });

    if (response.statusCode === 200) {
      logResult('Dashboard Access', 'PASS', 'Dashboard endpoint accessible');
      
      // Since this is a SPA, we might get the same index.html
      const html = response.data.toLowerCase();
      if (html.includes('root') && html.includes('react')) {
        logResult('React App Detection', 'PASS', 'React application structure detected');
      }
      
      return true;
    } else {
      logResult('Dashboard Access', 'FAIL', `Dashboard returned status ${response.statusCode}`);
    }
  } catch (error) {
    logResult('Dashboard Access', 'FAIL', `Dashboard test failed: ${error.message}`);
  }
  
  return false;
}

async function generateTestReport() {
  console.log('\n📋 AIRA CHATBOT TEST REPORT');
  console.log('===========================');
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const warnings = testResults.filter(r => r.status === 'WARN').length;
  const skipped = testResults.filter(r => r.status === 'SKIP').length;
  
  console.log(`\n📊 Test Summary:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  console.log(`\n🎯 AIRA Chatbot Status:`);
  
  const hasOpenAI = testResults.some(r => r.test === 'OpenAI API Test' && r.status === 'PASS');
  const hasElevenLabs = testResults.some(r => r.test === 'ElevenLabs API Test' && r.status === 'PASS');
  const siteAccessible = testResults.some(r => r.test === 'Site Accessibility' && r.status === 'PASS');
  
  if (hasOpenAI && siteAccessible) {
    console.log('🟢 AIRA CHATBOT: FULLY OPERATIONAL');
    console.log('   - OpenAI connection verified');
    console.log('   - Site is accessible');
    console.log('   - Ready for user interactions');
  } else if (siteAccessible) {
    console.log('🟡 AIRA CHATBOT: PARTIALLY OPERATIONAL');
    console.log('   - Site is accessible');
    console.log('   - API connections need verification');
  } else {
    console.log('🔴 AIRA CHATBOT: NOT OPERATIONAL');
    console.log('   - Site accessibility issues detected');
  }
  
  if (hasElevenLabs) {
    console.log('🎤 Voice synthesis available');
  }
  
  console.log(`\n🔍 Recommendations:`);
  
  if (!hasOpenAI) {
    console.log('- Verify OpenAI API key is correctly configured in Digital Ocean');
    console.log('- Check API key permissions and billing status');
  }
  
  if (!hasElevenLabs) {
    console.log('- Verify ElevenLabs API key for voice features');
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Visit https://leadfive.today/dashboard');
  console.log('2. Look for AI Assistant or AIRA chatbot interface');
  console.log('3. Test chat functionality with a simple message');
  console.log('4. Check browser console for any JavaScript errors');
  console.log('5. Test on mobile devices for responsive design');
  
  return { passed, failed, warnings, hasOpenAI, hasElevenLabs, siteAccessible };
}

async function runAllTests() {
  console.log('Starting comprehensive AIRA chatbot testing...\n');
  
  try {
    // Test main site
    await testMainSite();
    
    // Test API configuration
    const { openaiKey, elevenlabsKey } = await testAPIKeys();
    
    // Test OpenAI connection
    if (openaiKey) {
      await testOpenAIConnection(openaiKey);
    }
    
    // Test ElevenLabs connection
    if (elevenlabsKey) {
      await testElevenLabsConnection(elevenlabsKey);
    }
    
    // Test dashboard
    await testDashboardEndpoint();
    
    // Generate final report
    const results = await generateTestReport();
    
    // Exit with appropriate code
    process.exit(results.failed === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
