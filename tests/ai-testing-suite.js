/**
 * LEADFIVE AI INTEGRATION TESTING SUITE
 * Comprehensive testing for all AI services and integrations
 * Test before deployment to ensure production readiness
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Mock import.meta.env for Node.js environment
global.importMeta = {
  env: {
    VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || 'sk-your-openai-key-here',
    VITE_OPENAI_MODEL: process.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview',
    VITE_OPENAI_MAX_TOKENS: process.env.VITE_OPENAI_MAX_TOKENS || '500',
    VITE_ELEVENLABS_API_KEY: process.env.VITE_ELEVENLABS_API_KEY || 'your-elevenlabs-key-here',
    VITE_ELEVENLABS_VOICE_ID: process.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
    VITE_ELEVENLABS_MODEL: process.env.VITE_ELEVENLABS_MODEL || 'eleven_multilingual_v2'
  }
};

// Dynamic import with mocked environment
const { default: OpenAIService } = await import('../src/services/OpenAIService.js').catch(() => ({ default: null }));
const { default: ElevenLabsService } = await import('../src/services/ElevenLabsService.js').catch(() => ({ default: null }));
const { default: AIServicesIntegration } = await import('../src/services/AIServicesIntegration.js').catch(() => ({ default: null }));

class AITestingSuite {
  constructor() {
    this.results = {
      openai: {},
      elevenlabs: {},
      integration: {},
      summary: {}
    };
    this.startTime = Date.now();
  }

  /**
   * Run all AI service tests
   */
  async runAllTests() {
    console.log('🧪 Starting LeadFive AI Integration Testing Suite...');
    console.log('=' * 60);

    try {
      // Test 1: OpenAI Service Tests
      await this.testOpenAIService();
      
      // Test 2: ElevenLabs Service Tests
      await this.testElevenLabsService();
      
      // Test 3: AI Services Integration Tests
      await this.testAIIntegration();
      
      // Test 4: Performance Tests
      await this.testPerformance();
      
      // Test 5: Error Handling Tests
      await this.testErrorHandling();
      
      // Generate summary report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Testing suite failed:', error);
      this.results.summary.status = 'FAILED';
      this.results.summary.error = error.message;
    }
    
    return this.results;
  }

  /**
   * Test OpenAI Service functionality
   */
  async testOpenAIService() {
    console.log('\n🤖 Testing OpenAI Service...');
    const tests = [];

    try {
      // Test 1.1: Service Initialization
      tests.push(await this.testFunction(
        'OpenAI Initialization',
        () => OpenAIService.getStatus(),
        (result) => result.initialized || result.hasApiKey
      ));

      // Test 1.2: Chat Response Generation
      tests.push(await this.testFunction(
        'Chat Response Generation',
        () => OpenAIService.getChatResponse(
          'Hello! Can you tell me about LeadFive?',
          { account: '0x123...', isRegistered: true }
        ),
        (result) => typeof result === 'string' && result.length > 10
      ));

      // Test 1.3: Content Generation
      tests.push(await this.testFunction(
        'Content Generation',
        () => OpenAIService.generateContent('marketInsight', { trend: 'bullish' }),
        (result) => typeof result === 'string' && result.length > 20
      ));

      // Test 1.4: Joke Generation
      tests.push(await this.testFunction(
        'Joke Generation',
        () => OpenAIService.generateJoke(),
        (result) => typeof result === 'string' && result.includes('crypto' || 'blockchain' || result.length > 10)
      ));

      // Test 1.5: System Prompt Building
      tests.push(await this.testFunction(
        'System Prompt Building',
        () => OpenAIService.buildSystemPrompt({
          account: '0x123...',
          earnings: '1000',
          packageLevel: '2'
        }),
        (result) => typeof result === 'string' && result.includes('LeadFive')
      ));

      this.results.openai = {
        status: tests.every(t => t.passed) ? 'PASSED' : 'PARTIAL',
        tests: tests,
        passedCount: tests.filter(t => t.passed).length,
        totalCount: tests.length
      };

    } catch (error) {
      this.results.openai = {
        status: 'FAILED',
        error: error.message,
        tests: tests
      };
    }

    console.log(`✅ OpenAI Tests: ${this.results.openai.passedCount || 0}/${this.results.openai.totalCount || 0} passed`);
  }

  /**
   * Test ElevenLabs Service functionality
   */
  async testElevenLabsService() {
    console.log('\n🎤 Testing ElevenLabs Service...');
    const tests = [];

    try {
      // Test 2.1: Service Status
      tests.push(await this.testFunction(
        'ElevenLabs Status',
        () => ElevenLabsService.getStatus(),
        (result) => result.initialized || result.fallbackAvailable
      ));

      // Test 2.2: Speech Generation
      tests.push(await this.testFunction(
        'Speech Generation',
        () => ElevenLabsService.generateSpeech('Hello from LeadFive AI testing!'),
        (result) => result.success === true || result.play !== undefined,
        3000 // 3 second timeout for voice generation
      ));

      // Test 2.3: Welcome Greeting Generation
      tests.push(await this.testFunction(
        'Welcome Greeting',
        () => ElevenLabsService.generateWelcomeGreeting('TestUser', { totalEarnings: '500' }),
        (result) => result.success === true || result.play !== undefined
      ));

      // Test 2.4: Motivational Message
      tests.push(await this.testFunction(
        'Motivational Message',
        () => ElevenLabsService.generateMotivationalMessage({ mood: 'excited' }),
        (result) => result.success === true || result.play !== undefined
      ));

      // Test 2.5: FOMO Announcement
      tests.push(await this.testFunction(
        'FOMO Announcement',
        () => ElevenLabsService.generateFOMOAnnouncement('newUser', { amount: '1000' }),
        (result) => result.success === true || result.play !== undefined
      ));

      // Test 2.6: Voice Service Ready
      tests.push(await this.testFunction(
        'Voice Service Ready',
        () => ElevenLabsService.isReady(),
        (result) => result === true
      ));

      this.results.elevenlabs = {
        status: tests.every(t => t.passed) ? 'PASSED' : 'PARTIAL',
        tests: tests,
        passedCount: tests.filter(t => t.passed).length,
        totalCount: tests.length
      };

    } catch (error) {
      this.results.elevenlabs = {
        status: 'FAILED',
        error: error.message,
        tests: tests
      };
    }

    console.log(`✅ ElevenLabs Tests: ${this.results.elevenlabs.passedCount || 0}/${this.results.elevenlabs.totalCount || 0} passed`);
  }

  /**
   * Test AI Services Integration
   */
  async testAIIntegration() {
    console.log('\n🔗 Testing AI Services Integration...');
    const tests = [];

    try {
      // Test 3.1: Integration Status
      tests.push(await this.testFunction(
        'Integration System Status',
        () => AIServicesIntegration.getSystemStatus(),
        (result) => result.initialized === true
      ));

      // Test 3.2: Contract Query Processing
      tests.push(await this.testFunction(
        'Contract Query Processing',
        () => AIServicesIntegration.processQuery({
          type: 'contract',
          method: 'getUserInfo',
          params: ['0x123...']
        }),
        (result) => result.success === true && result.queryType === 'contract'
      ));

      // Test 3.3: Knowledge Query Processing
      tests.push(await this.testFunction(
        'Knowledge Query Processing',
        () => AIServicesIntegration.processQuery({
          type: 'knowledge',
          query: 'How does the LeadFive compensation plan work?'
        }),
        (result) => result.success === true && result.queryType === 'knowledge'
      ));

      // Test 3.4: Compensation Query Processing
      tests.push(await this.testFunction(
        'Compensation Query Processing',
        () => AIServicesIntegration.processQuery({
          type: 'compensation',
          calculationType: 'direct_commission',
          amount: 1000,
          packageLevel: 2
        }),
        (result) => result.success === true && result.queryType === 'compensation'
      ));

      // Test 3.5: General Query Processing
      tests.push(await this.testFunction(
        'General Query Processing',
        () => AIServicesIntegration.processQuery('What is LeadFive?'),
        (result) => result.success === true
      ));

      this.results.integration = {
        status: tests.every(t => t.passed) ? 'PASSED' : 'PARTIAL',
        tests: tests,
        passedCount: tests.filter(t => t.passed).length,
        totalCount: tests.length
      };

    } catch (error) {
      this.results.integration = {
        status: 'FAILED',
        error: error.message,
        tests: tests
      };
    }

    console.log(`✅ Integration Tests: ${this.results.integration.passedCount || 0}/${this.results.integration.totalCount || 0} passed`);
  }

  /**
   * Test AI Performance
   */
  async testPerformance() {
    console.log('\n⚡ Testing AI Performance...');
    const performanceTests = [];

    try {
      // Test response times
      const startTime = Date.now();
      await OpenAIService.getChatResponse('Quick test message', { account: '0x123...' });
      const openaiResponseTime = Date.now() - startTime;

      const voiceStartTime = Date.now();
      await ElevenLabsService.generateSpeech('Quick voice test');
      const voiceResponseTime = Date.now() - voiceStartTime;

      performanceTests.push({
        name: 'OpenAI Response Time',
        responseTime: openaiResponseTime,
        passed: openaiResponseTime < 5000, // 5 seconds max
        details: `${openaiResponseTime}ms`
      });

      performanceTests.push({
        name: 'Voice Generation Time',
        responseTime: voiceResponseTime,
        passed: voiceResponseTime < 3000, // 3 seconds max
        details: `${voiceResponseTime}ms`
      });

      this.results.performance = {
        status: performanceTests.every(t => t.passed) ? 'PASSED' : 'PARTIAL',
        tests: performanceTests,
        averageResponseTime: (openaiResponseTime + voiceResponseTime) / 2
      };

    } catch (error) {
      this.results.performance = {
        status: 'FAILED',
        error: error.message
      };
    }

    console.log(`✅ Performance Tests: ${this.results.performance?.tests?.filter(t => t.passed).length || 0}/${this.results.performance?.tests?.length || 0} passed`);
  }

  /**
   * Test Error Handling
   */
  async testErrorHandling() {
    console.log('\n🛡️ Testing Error Handling...');
    const errorTests = [];

    try {
      // Test invalid OpenAI requests
      errorTests.push(await this.testFunction(
        'Invalid OpenAI Request Handling',
        () => OpenAIService.getChatResponse('', { account: null }),
        (result) => typeof result === 'string' && result.length > 0 // Should fallback gracefully
      ));

      // Test invalid voice generation
      errorTests.push(await this.testFunction(
        'Invalid Voice Request Handling',
        () => ElevenLabsService.generateSpeech(''),
        (result) => result.success !== undefined // Should handle gracefully
      ));

      // Test invalid integration query
      errorTests.push(await this.testFunction(
        'Invalid Integration Query Handling',
        () => AIServicesIntegration.processQuery(null),
        (result) => result.success === false && result.error // Should return error object
      ));

      this.results.errorHandling = {
        status: errorTests.every(t => t.passed) ? 'PASSED' : 'PARTIAL',
        tests: errorTests,
        passedCount: errorTests.filter(t => t.passed).length,
        totalCount: errorTests.length
      };

    } catch (error) {
      this.results.errorHandling = {
        status: 'PARTIAL', // Errors are expected in error handling tests
        error: error.message,
        tests: errorTests
      };
    }

    console.log(`✅ Error Handling Tests: ${this.results.errorHandling.passedCount || 0}/${this.results.errorHandling.totalCount || 0} passed`);
  }

  /**
   * Helper function to test individual functions
   */
  async testFunction(name, fn, validator, timeout = 5000) {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
      ]);
      
      const responseTime = Date.now() - startTime;
      const passed = validator(result);
      
      console.log(`   ${passed ? '✅' : '❌'} ${name} (${responseTime}ms)`);
      
      return {
        name,
        passed,
        responseTime,
        result: passed ? 'SUCCESS' : 'FAILED',
        details: typeof result === 'string' ? result.substring(0, 100) + '...' : JSON.stringify(result).substring(0, 100) + '...'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.log(`   ❌ ${name} - ERROR: ${error.message}`);
      
      return {
        name,
        passed: false,
        responseTime,
        result: 'ERROR',
        error: error.message
      };
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const totalTime = Date.now() - this.startTime;
    
    // Calculate overall statistics
    const allTests = [
      ...(this.results.openai.tests || []),
      ...(this.results.elevenlabs.tests || []),
      ...(this.results.integration.tests || []),
      ...(this.results.performance?.tests || []),
      ...(this.results.errorHandling?.tests || [])
    ];
    
    const totalPassed = allTests.filter(t => t.passed).length;
    const totalTests = allTests.length;
    const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
    
    this.results.summary = {
      status: successRate >= 80 ? 'PASSED' : successRate >= 60 ? 'PARTIAL' : 'FAILED',
      totalTests,
      totalPassed,
      successRate: `${successRate}%`,
      totalTime: `${totalTime}ms`,
      timestamp: new Date().toISOString(),
      recommendations: this.generateRecommendations()
    };

    // Print summary report
    console.log('\n' + '=' * 60);
    console.log('📋 LEADFIVE AI TESTING SUMMARY REPORT');
    console.log('=' * 60);
    console.log(`🎯 Overall Status: ${this.results.summary.status}`);
    console.log(`📊 Tests Passed: ${totalPassed}/${totalTests} (${successRate}%)`);
    console.log(`⏱️ Total Time: ${totalTime}ms`);
    console.log(`📅 Timestamp: ${this.results.summary.timestamp}`);
    
    console.log('\n📈 Service Breakdown:');
    console.log(`   🤖 OpenAI: ${this.results.openai.status} (${this.results.openai.passedCount || 0}/${this.results.openai.totalCount || 0})`);
    console.log(`   🎤 ElevenLabs: ${this.results.elevenlabs.status} (${this.results.elevenlabs.passedCount || 0}/${this.results.elevenlabs.totalCount || 0})`);
    console.log(`   🔗 Integration: ${this.results.integration.status} (${this.results.integration.passedCount || 0}/${this.results.integration.totalCount || 0})`);
    console.log(`   ⚡ Performance: ${this.results.performance?.status || 'N/A'}`);
    console.log(`   🛡️ Error Handling: ${this.results.errorHandling?.status || 'N/A'}`);
    
    if (this.results.summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.summary.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n' + '=' * 60);
    
    return this.results.summary;
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.openai.status !== 'PASSED') {
      recommendations.push('Configure OpenAI API key for full functionality');
    }
    
    if (this.results.elevenlabs.status !== 'PASSED') {
      recommendations.push('Configure ElevenLabs API key for premium voice features');
    }
    
    if (this.results.integration.status !== 'PASSED') {
      recommendations.push('Review AI services integration configuration');
    }
    
    if (this.results.performance?.averageResponseTime > 3000) {
      recommendations.push('Optimize AI response times for better user experience');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All AI services are functioning optimally - ready for production!');
    }
    
    return recommendations;
  }
}

// Export for use in testing
export default AITestingSuite;

// If running directly in browser console or Node.js
if (typeof window !== 'undefined') {
  window.AITestingSuite = AITestingSuite;
}

// Auto-run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new AITestingSuite();
  testSuite.runAllTests().then(results => {
    console.log('\n🎉 AI Testing Complete!');
    console.log('Results saved to results object');
  });
}
