// AI Response Test - Verify different questions get different answers
import OpenAIService from './src/services/OpenAIService.js';

console.log('🤖 Testing AI Response Variations...\n');

const userContext = {
  account: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29',
  earnings: '4567.89',
  teamSize: '892',
  packageLevel: '7',
  isRegistered: true
};

const testQuestions = [
  "Can you tell me about the packages?",
  "How are my earnings?",
  "Help me grow my team",
  "What should I withdraw?",
  "How does the platform work?",
  "What's my next strategy?"
];

async function testAIResponses() {
  console.log('Testing different questions to ensure varied responses:\n');
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`Q${i+1}: ${question}`);
    
    try {
      const response = await OpenAIService.getChatResponse(question, userContext);
      console.log(`A${i+1}: ${response}\n`);
      console.log('---'.repeat(20));
    } catch (error) {
      console.log(`A${i+1}: Error - ${error.message}\n`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✅ Test complete! Each question should have received a different, contextual response.');
}

// Run the test
testAIResponses().catch(console.error);
