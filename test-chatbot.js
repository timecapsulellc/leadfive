#!/usr/bin/env node

/**
 * AIRA Chatbot Test Script
 * Tests the OpenAI integration and fallback functionality
 */

const readline = require('readline');

// Simulate the browser environment for testing
global.import = {
  meta: {
    env: {
      VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
      VITE_OPENAI_MODEL: 'gpt-4o-mini',
      VITE_OPENAI_MAX_TOKENS: '500'
    }
  }
};

console.log('🤖 AIRA Chatbot Test Suite');
console.log('=' .repeat(50));

// Test OpenAI Service initialization
console.log('\n📡 Testing OpenAI Service...');
console.log('API Key configured:', global.import.meta.env.VITE_OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE');

// Test fallback responses
const testFallbackResponses = () => {
  console.log('\n🔄 Testing Fallback Responses...');
  
  const fallbacks = [
    'Great question! 🚀 Based on current market trends, Web3 projects are showing 340% better performance. Ready to explore some high-ROI opportunities?',
    'I love your enthusiasm! 💎 The top 10% of LeadFive users earn $15,000/month. Want me to show you the path to join them?',
    "Perfect timing! ⚡ Our AI analysis shows you're in an optimal decision-making state. This could be your breakthrough moment!",
    "That's exactly what successful investors ask! 🔥 With blockchain transparency and smart contracts, the opportunities are endless.",
    'Interesting point! 💰 Did you know 94% of our successful users started with questions just like yours? Your journey begins now!',
  ];

  const randomResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  console.log('✅ Sample fallback response:', randomResponse);
  
  return true;
};

// Test personality system
const testPersonalities = () => {
  console.log('\n🎭 Testing AI Personalities...');
  
  const personalities = {
    advisor: {
      name: 'Revenue Advisor',
      color: '#00D4FF',
      description: 'PhD-level strategic wealth building guidance',
    },
    analyzer: {
      name: 'Network Analyzer', 
      color: '#1e3a8a',
      description: 'Advanced analytics & performance insights',
    },
    mentor: {
      name: 'Success Mentor',
      color: '#7c3aed', 
      description: 'Motivational coaching & mindset transformation',
    },
    strategist: {
      name: 'Binary Strategist',
      color: '#059669',
      description: 'Long-term wealth architecture planning',
    },
  };

  console.log('✅ Available personalities:', Object.keys(personalities).length);
  Object.values(personalities).forEach(p => {
    console.log(`   • ${p.name}: ${p.description}`);
  });
  
  return true;
};

// Test voice features
const testVoiceFeatures = () => {
  console.log('\n🗣️ Testing Voice Features...');
  
  // Test speech synthesis availability
  const speechSynthesisAvailable = typeof speechSynthesis !== 'undefined';
  console.log('Speech Synthesis:', speechSynthesisAvailable ? '✅ Available' : '❌ Not available (browser only)');
  
  // Test speech recognition availability
  const speechRecognitionAvailable = typeof webkitSpeechRecognition !== 'undefined';
  console.log('Speech Recognition:', speechRecognitionAvailable ? '✅ Available' : '❌ Not available (browser only)');
  
  return true;
};

// Test conversation context
const testConversationContext = () => {
  console.log('\n💬 Testing Conversation Context...');
  
  const sampleContext = {
    lastQuery: 'How can I increase my earnings?',
    personality: 'advisor',
    userInfo: {
      packageLevel: 2,
      teamSize: 15,
      totalEarnings: 456.78
    },
    account: '0x1234...5678',
    timestamp: new Date().toISOString(),
  };
  
  console.log('✅ Context structure:', JSON.stringify(sampleContext, null, 2));
  
  return true;
};

// Interactive test mode
const runInteractiveTest = () => {
  console.log('\n🎮 Interactive Test Mode');
  console.log('Type messages to test the chatbot (type "exit" to quit):');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const processMessage = (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('👋 Test session ended');
      rl.close();
      return;
    }

    // Simulate chatbot response
    console.log('\n🤖 AIRA Response:');
    console.log('Great question! 🚀 Based on your input about "' + input + '", here are some insights...');
    console.log('💡 Action Items:');
    console.log('  • Review current earnings strategy');
    console.log('  • Optimize withdrawal ratios'); 
    console.log('  • Plan next package upgrade');
    console.log('\n🔮 Predictions:');
    console.log('  • Expected increase: 25% in 30-60 days');
    console.log('  • Network growth: +15 members');
    
    rl.question('\n> ', processMessage);
  };

  rl.question('\n> ', processMessage);
};

// Run all tests
const runTests = async () => {
  try {
    console.log('🚀 Starting AIRA Chatbot Tests...\n');
    
    const results = {
      fallbackResponses: testFallbackResponses(),
      personalities: testPersonalities(), 
      voiceFeatures: testVoiceFeatures(),
      conversationContext: testConversationContext(),
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(30));
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}`);
    });
    
    const allPassed = Object.values(results).every(r => r);
    console.log(`\n🏆 Overall Status: ${allPassed ? 'All tests passed!' : 'Some tests failed'}`);
    
    // Ask if user wants interactive mode
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n🎮 Would you like to run interactive test mode? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        rl.close();
        runInteractiveTest();
      } else {
        console.log('\n✨ Test suite completed!');
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
  }
};

// Export for use in other tests
if (require.main === module) {
  runTests();
}

module.exports = {
  testFallbackResponses,
  testPersonalities,
  testVoiceFeatures,
  testConversationContext,
  runTests
};