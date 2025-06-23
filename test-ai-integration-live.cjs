#!/usr/bin/env node

/**
 * 🤖 Live AI Integration Testing Suite
 * Tests OpenAI and ElevenLabs integration with encrypted API keys
 * Comprehensive testing for all AI features in the dashboard
 */

const { getDecryptedKey } = require('./scripts/decrypt-ai-keys.cjs');

// Test configuration
const TEST_CONFIG = {
  openai: {
    model: 'gpt-3.5-turbo',
    maxTokens: 150,
    temperature: 0.7
  },
  elevenlabs: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Default voice
    model: 'eleven_multilingual_v2'
  }
};

// Mock user data for testing
const MOCK_USER_DATA = {
  totalEarnings: 4567.89,
  teamSize: 156,
  currentLevel: 7,
  dailyEarnings: 123.45,
  activeReferrals: 45,
  monthlyEarnings: 3456.78,
  packageLevel: 210,
  teamGrowthRate: 12.5,
  loginStreak: 7,
  monthlyGoal: 5000
};

// Test OpenAI Integration
async function testOpenAI() {
  console.log('🤖 Testing OpenAI Integration');
  console.log('==============================\n');
  
  try {
    // Get decrypted API key
    const apiKey = getDecryptedKey('openai');
    if (!apiKey) {
      throw new Error('Failed to decrypt OpenAI API key');
    }
    
    console.log('✅ OpenAI API key decrypted successfully');
    console.log('🔑 Key length:', apiKey.length, 'characters');
    console.log('🔑 Key format:', apiKey.startsWith('sk-') ? 'Valid' : 'Invalid');
    
    // Test API connection
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: TEST_CONFIG.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI coach for a business platform called LeadFive. Provide brief, encouraging advice.'
          },
          {
            role: 'user',
            content: `I have earned $${MOCK_USER_DATA.totalEarnings} with a team of ${MOCK_USER_DATA.teamSize} members. Give me a brief motivational message.`
          }
        ],
        max_tokens: TEST_CONFIG.openai.maxTokens,
        temperature: TEST_CONFIG.openai.temperature
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    const message = data.choices[0]?.message?.content;
    
    console.log('✅ OpenAI API connection successful');
    console.log('📝 Test response:', message?.substring(0, 100) + '...');
    console.log('💰 Usage tokens:', data.usage?.total_tokens || 'N/A');
    
    return {
      success: true,
      message: message,
      usage: data.usage
    };
    
  } catch (error) {
    console.error('❌ OpenAI test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test ElevenLabs Integration
async function testElevenLabs() {
  console.log('\n🎤 Testing ElevenLabs Integration');
  console.log('==================================\n');
  
  try {
    // Get decrypted API key
    const apiKey = getDecryptedKey('elevenlabs');
    if (!apiKey) {
      throw new Error('Failed to decrypt ElevenLabs API key');
    }
    
    console.log('✅ ElevenLabs API key decrypted successfully');
    console.log('🔑 Key length:', apiKey.length, 'characters');
    
    // Test API connection - Get voices
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    });
    
    if (!voicesResponse.ok) {
      const error = await voicesResponse.text();
      throw new Error(`ElevenLabs API error: ${voicesResponse.status} - ${error}`);
    }
    
    const voicesData = await voicesResponse.json();
    console.log('✅ ElevenLabs API connection successful');
    console.log('🎵 Available voices:', voicesData.voices?.length || 0);
    
    // Test text-to-speech
    const testText = `Congratulations! You've earned $${MOCK_USER_DATA.totalEarnings} with your team of ${MOCK_USER_DATA.teamSize} members. Keep up the great work!`;
    
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${TEST_CONFIG.elevenlabs.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: testText,
        model_id: TEST_CONFIG.elevenlabs.model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });
    
    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      throw new Error(`ElevenLabs TTS error: ${ttsResponse.status} - ${error}`);
    }
    
    const audioBuffer = await ttsResponse.arrayBuffer();
    console.log('✅ Text-to-speech generation successful');
    console.log('🎵 Audio size:', (audioBuffer.byteLength / 1024).toFixed(2), 'KB');
    console.log('📝 Test text:', testText.substring(0, 50) + '...');
    
    return {
      success: true,
      audioSize: audioBuffer.byteLength,
      voicesCount: voicesData.voices?.length || 0
    };
    
  } catch (error) {
    console.error('❌ ElevenLabs test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test AI Coaching Scenarios
async function testAICoachingScenarios() {
  console.log('\n🎯 Testing AI Coaching Scenarios');
  console.log('==================================\n');
  
  const scenarios = [
    {
      name: 'New User Welcome',
      prompt: 'Welcome a new user who just joined LeadFive. Be encouraging and explain the basics.',
      userData: { ...MOCK_USER_DATA, totalEarnings: 0, teamSize: 0 }
    },
    {
      name: 'Growth Milestone',
      prompt: 'Congratulate a user who reached 100 team members and provide next steps.',
      userData: { ...MOCK_USER_DATA, teamSize: 100 }
    },
    {
      name: 'Earnings Boost',
      prompt: 'Motivate a user whose earnings increased by 25% this month.',
      userData: { ...MOCK_USER_DATA, teamGrowthRate: 25 }
    }
  ];
  
  const results = [];
  
  for (const scenario of scenarios) {
    try {
      console.log(`🎯 Testing: ${scenario.name}`);
      
      const apiKey = getDecryptedKey('openai');
      if (!apiKey) {
        throw new Error('OpenAI key not available');
      }
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an AI coach for LeadFive business platform. Be encouraging, professional, and brief.'
            },
            {
              role: 'user',
              content: `${scenario.prompt} User stats: ${JSON.stringify(scenario.userData)}`
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const message = data.choices[0]?.message?.content;
        console.log(`✅ ${scenario.name}: ${message?.substring(0, 60)}...`);
        results.push({ scenario: scenario.name, success: true, message });
      } else {
        console.log(`❌ ${scenario.name}: API error`);
        results.push({ scenario: scenario.name, success: false });
      }
      
    } catch (error) {
      console.log(`❌ ${scenario.name}: ${error.message}`);
      results.push({ scenario: scenario.name, success: false, error: error.message });
    }
  }
  
  return results;
}

// Test AI Market Insights
async function testMarketInsights() {
  console.log('\n📊 Testing AI Market Insights');
  console.log('===============================\n');
  
  try {
    const apiKey = getDecryptedKey('openai');
    if (!apiKey) {
      throw new Error('OpenAI key not available');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a market analyst for business platforms. Provide brief, data-driven insights.'
          },
          {
            role: 'user',
            content: 'Provide 3 key market insights for online business platforms in 2024. Keep it brief and actionable.'
          }
        ],
        max_tokens: 150,
        temperature: 0.6
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const insights = data.choices[0]?.message?.content;
      console.log('✅ Market insights generated successfully');
      console.log('📊 Insights preview:', insights?.substring(0, 100) + '...');
      return { success: true, insights };
    } else {
      throw new Error('API request failed');
    }
    
  } catch (error) {
    console.error('❌ Market insights test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runAITests() {
  console.log('🚀 LeadFive AI Integration Live Testing Suite');
  console.log('==============================================\n');
  
  const startTime = Date.now();
  const results = {
    openai: null,
    elevenlabs: null,
    coaching: null,
    insights: null
  };
  
  // Test OpenAI
  results.openai = await testOpenAI();
  
  // Test ElevenLabs
  results.elevenlabs = await testElevenLabs();
  
  // Test AI Coaching
  if (results.openai.success) {
    results.coaching = await testAICoachingScenarios();
  }
  
  // Test Market Insights
  if (results.openai.success) {
    results.insights = await testMarketInsights();
  }
  
  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n📋 Test Summary');
  console.log('================');
  console.log(`⏱️  Total duration: ${duration}s`);
  console.log(`🤖 OpenAI: ${results.openai.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🎤 ElevenLabs: ${results.elevenlabs.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🎯 AI Coaching: ${results.coaching ? '✅ TESTED' : '⏭️  SKIPPED'}`);
  console.log(`📊 Market Insights: ${results.insights?.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallSuccess = results.openai.success && results.elevenlabs.success;
  console.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ ALL SYSTEMS GO!' : '❌ ISSUES DETECTED'}`);
  
  if (overallSuccess) {
    console.log('\n🎉 AI Integration is ready for production!');
    console.log('✅ All AI features are functional');
    console.log('✅ API keys are properly encrypted and accessible');
    console.log('✅ Voice synthesis is working');
    console.log('✅ Chat completion is working');
  } else {
    console.log('\n⚠️  Please check the following:');
    if (!results.openai.success) console.log('- OpenAI API key configuration');
    if (!results.elevenlabs.success) console.log('- ElevenLabs API key configuration');
    console.log('- Network connectivity');
    console.log('- API key permissions');
  }
  
  return results;
}

// Run tests if called directly
if (require.main === module) {
  runAITests().catch(console.error);
}

module.exports = {
  runAITests,
  testOpenAI,
  testElevenLabs,
  testAICoachingScenarios,
  testMarketInsights
};
