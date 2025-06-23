// AI Component Direct Verification
// This script directly renders AI components in a test container
// to isolate rendering issues

import React from 'react';
import ReactDOM from 'react-dom';
import AICoachingPanel from './components/AICoachingPanel';
import AIEarningsPrediction from './components/AIEarningsPrediction';
import AITransactionHelper from './components/AITransactionHelper';
import AIMarketInsights from './components/AIMarketInsights';
import AISuccessStories from './components/AISuccessStories';
import AIEmotionTracker from './components/AIEmotionTracker';

// Create test data
const testUserStats = {
  totalEarnings: 5000,
  teamSize: 25,
  activeReferrals: 8,
  currentLevel: 3,
  networkHealth: 85,
  daysSinceLastLogin: 0,
  teamGrowthRate: 15.5,
  loginStreak: 7,
  monthlyGoal: 5000,
  packageLevel: 90,
  daysSinceLastReferral: 2,
  voiceEnabled: true,
  dailyEarnings: 125,
  weeklyGrowth: 15.5,
  monthlyTarget: 5000
};

const testAccount = "0x1234...5678";

// Create individual component test functions
function testAICoachingPanel() {
  try {
    console.log('Testing AICoachingPanel...');
    const div = document.createElement('div');
    div.className = 'test-container';
    document.body.appendChild(div);
    
    ReactDOM.render(
      <AICoachingPanel userStats={testUserStats} account={testAccount} />,
      div
    );
    
    console.log('✅ AICoachingPanel rendered successfully!');
    return true;
  } catch (error) {
    console.error('❌ AICoachingPanel failed to render:', error);
    return false;
  }
}

function testAIEarningsPrediction() {
  try {
    console.log('Testing AIEarningsPrediction...');
    const div = document.createElement('div');
    div.className = 'test-container';
    document.body.appendChild(div);
    
    ReactDOM.render(
      <AIEarningsPrediction userStats={testUserStats} account={testAccount} />,
      div
    );
    
    console.log('✅ AIEarningsPrediction rendered successfully!');
    return true;
  } catch (error) {
    console.error('❌ AIEarningsPrediction failed to render:', error);
    return false;
  }
}

function testAITransactionHelper() {
  try {
    console.log('Testing AITransactionHelper...');
    const div = document.createElement('div');
    div.className = 'test-container';
    document.body.appendChild(div);
    
    ReactDOM.render(
      <AITransactionHelper 
        userBalance="1.5"
        pendingRewards={234.56}
        recentTransactions={[
          { type: 'withdrawal', amount: 500, date: new Date() },
          { type: 'earning', amount: 125, date: new Date() }
        ]}
        account={testAccount}
      />,
      div
    );
    
    console.log('✅ AITransactionHelper rendered successfully!');
    return true;
  } catch (error) {
    console.error('❌ AITransactionHelper failed to render:', error);
    return false;
  }
}

// Export a function that runs all tests
export function runAllTests() {
  console.log('🧪 Running all AI component tests...');
  
  const results = {
    AICoachingPanel: testAICoachingPanel(),
    AIEarningsPrediction: testAIEarningsPrediction(),
    AITransactionHelper: testAITransactionHelper()
  };
  
  console.log('📊 Test Results:', results);
  return results;
}

// Auto-run tests if directly loaded
if (typeof window !== 'undefined') {
  window.runAIComponentTests = runAllTests;
  console.log('AI Component tests loaded. Run tests by calling window.runAIComponentTests()');
}

export default {
  runAllTests,
  testAICoachingPanel,
  testAIEarningsPrediction,
  testAITransactionHelper
};
