#!/usr/bin/env node
// OrphiChain PWA Push Notification Test Script
// Tests the complete push notification integration

const fetch = require('node-fetch');

class PushNotificationTester {
  constructor() {
    this.pushServerUrl = 'http://localhost:3002';
    this.wsServerUrl = 'http://localhost:3001';
  }

  async runTests() {
    console.log('🧪 Starting OrphiChain Push Notification Tests...\n');

    // Test 1: Check if push server is running
    await this.testPushServerHealth();

    // Test 2: Get VAPID public key
    await this.testVapidKey();

    // Test 3: Test Web3 notification broadcast
    await this.testWeb3Notification();

    // Test 4: Test server stats
    await this.testServerStats();

    console.log('\n✅ All push notification tests completed!');
  }

  async testPushServerHealth() {
    try {
      console.log('🔍 Testing push server health...');
      const response = await fetch(`${this.pushServerUrl}/health`);
      const data = await response.json();
      
      if (data.status === 'healthy') {
        console.log('✅ Push server is healthy');
        console.log(`   Service: ${data.service}`);
        console.log(`   Subscriptions: ${data.subscriptions}`);
      } else {
        console.log('❌ Push server health check failed');
      }
    } catch (error) {
      console.log('❌ Push server not running:', error.message);
      console.log('   💡 Run: npm run push:server');
    }
  }

  async testVapidKey() {
    try {
      console.log('\n🔑 Testing VAPID key retrieval...');
      const response = await fetch(`${this.pushServerUrl}/vapid-public-key`);
      const data = await response.json();
      
      if (data.success && data.publicKey) {
        console.log('✅ VAPID public key retrieved');
        console.log(`   Key: ${data.publicKey.substring(0, 20)}...`);
      } else {
        console.log('❌ VAPID key retrieval failed');
      }
    } catch (error) {
      console.log('❌ VAPID key test failed:', error.message);
    }
  }

  async testWeb3Notification() {
    try {
      console.log('\n📨 Testing Web3 notification broadcast...');
      const response = await fetch(`${this.pushServerUrl}/notify-web3`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'system-alert',
          data: {
            message: 'Test notification from OrphiChain PWA system'
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Web3 notification broadcast successful');
        console.log(`   Sent: ${data.sent}, Failed: ${data.failed}`);
      } else {
        console.log('❌ Web3 notification broadcast failed');
      }
    } catch (error) {
      console.log('❌ Web3 notification test failed:', error.message);
    }
  }

  async testServerStats() {
    try {
      console.log('\n📊 Testing server statistics...');
      const response = await fetch(`${this.pushServerUrl}/stats`);
      const data = await response.json();
      
      console.log('✅ Server stats retrieved');
      console.log(`   Total subscriptions: ${data.totalSubscriptions}`);
      console.log(`   Active users: ${data.activeUsers}`);
      
      if (data.subscriptions.length > 0) {
        console.log('   Recent subscriptions:');
        data.subscriptions.slice(0, 3).forEach(sub => {
          console.log(`     - ${sub.id} (${sub.subscribedAt})`);
        });
      }
    } catch (error) {
      console.log('❌ Server stats test failed:', error.message);
    }
  }
}

// Frontend test instructions
function showFrontendTestInstructions() {
  console.log('\n🌐 Frontend Testing Instructions:');
  console.log('1. Open your browser to http://localhost:5175');
  console.log('2. Open Developer Console');
  console.log('3. Run these commands:');
  console.log('');
  console.log('   // Test basic notification');
  console.log('   window.OrphiNotifications.testPushNotification()');
  console.log('');
  console.log('   // Test server integration');
  console.log('   window.OrphiNotifications.subscribeWithServer()');
  console.log('');
  console.log('   // Check status');
  console.log('   window.OrphiNotifications.getStatus()');
  console.log('');
  console.log('4. Check for notifications in your browser!');
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new PushNotificationTester();
  tester.runTests()
    .then(() => {
      showFrontendTestInstructions();
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
    });
}

module.exports = PushNotificationTester;
