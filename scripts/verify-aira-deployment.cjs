#!/usr/bin/env node

/**
 * AIRA CHATBOT AND GENEALOGY TREE VERIFICATION SCRIPT
 * Verifies that the latest features are deployed and visible
 */

const https = require('https');

const verificationChecks = [
  {
    name: 'AIRA Chatbot Component',
    description: 'Check for AIRA chatbot implementation',
    keywords: ['AIRA', 'chatbot', 'ai-assistant'],
    critical: true
  },
  {
    name: 'Advanced Genealogy Tree',
    description: 'Check for updated genealogy tree component',
    keywords: ['GenealogyTreeAdvanced', 'Network Tree'],
    critical: true
  },
  {
    name: 'DAO Overview Header',
    description: 'Check for DAO Overview instead of plain Overview',
    keywords: ['DAO Overview'],
    critical: true
  },
  {
    name: 'ElevenLabs Removal',
    description: 'Verify ElevenLabs code has been removed',
    keywords: ['ElevenLabs', 'voice-assistant'],
    critical: true,
    shouldNotExist: true
  },
  {
    name: 'Modern UI Elements',
    description: 'Check for modern dashboard components',
    keywords: ['aira-chatbot', 'unified-chatbot'],
    critical: false
  }
];

async function fetchPageContent(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function verifyFeatures() {
  console.log('🔍 AIRA CHATBOT & GENEALOGY TREE VERIFICATION');
  console.log('===============================================');
  console.log();

  const url = 'https://leadfive.today';
  console.log(`📡 Fetching content from: ${url}`);
  
  try {
    const content = await fetchPageContent(url);
    console.log(`✅ Successfully fetched ${content.length} characters`);
    console.log();

    let passedChecks = 0;
    let totalChecks = 0;
    let criticalIssues = [];

    for (const check of verificationChecks) {
      totalChecks++;
      console.log(`🔧 ${check.name}`);
      console.log(`   ${check.description}`);
      
      let found = false;
      let foundKeywords = [];
      
      for (const keyword of check.keywords) {
        if (content.includes(keyword)) {
          found = true;
          foundKeywords.push(keyword);
        }
      }
      
      // For "shouldNotExist" checks, reverse the logic
      if (check.shouldNotExist) {
        if (!found) {
          console.log(`   ✅ PASSED - No legacy code found`);
          passedChecks++;
        } else {
          console.log(`   ❌ FAILED - Legacy code still present: ${foundKeywords.join(', ')}`);
          if (check.critical) {
            criticalIssues.push(`${check.name}: Legacy code still present`);
          }
        }
      } else {
        if (found) {
          console.log(`   ✅ PASSED - Found: ${foundKeywords.join(', ')}`);
          passedChecks++;
        } else {
          console.log(`   ❌ FAILED - Keywords not found: ${check.keywords.join(', ')}`);
          if (check.critical) {
            criticalIssues.push(`${check.name}: Required features not found`);
          }
        }
      }
      console.log();
    }

    // Summary
    console.log('===============================================');
    console.log('📊 VERIFICATION SUMMARY');
    console.log('===============================================');
    console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);
    console.log(`🔴 Failed: ${totalChecks - passedChecks}/${totalChecks} checks`);
    
    if (criticalIssues.length > 0) {
      console.log();
      console.log('🚨 CRITICAL ISSUES:');
      criticalIssues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
      console.log();
      console.log('🔄 Recommended actions:');
      console.log('   1. Hard refresh the browser (Ctrl+F5 / Cmd+Shift+R)');
      console.log('   2. Clear browser cache completely');
      console.log('   3. Wait for CDN cache to invalidate (up to 10 minutes)');
      console.log('   4. Check deployment status with: doctl apps list-deployments');
    } else {
      console.log();
      console.log('🎉 ALL CRITICAL CHECKS PASSED!');
      console.log('✨ AIRA chatbot and genealogy tree are successfully deployed!');
    }

    const successRate = (passedChecks / totalChecks) * 100;
    console.log();
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('🌟 Deployment verification: EXCELLENT');
    } else if (successRate >= 60) {
      console.log('⚠️  Deployment verification: NEEDS ATTENTION');
    } else {
      console.log('🚨 Deployment verification: CRITICAL ISSUES');
    }

  } catch (error) {
    console.error('❌ Error fetching page content:', error.message);
    console.log();
    console.log('🔄 This might indicate:');
    console.log('   • Network connectivity issues');
    console.log('   • Website is temporarily down');
    console.log('   • Deployment is still in progress');
    console.log();
    console.log('💡 Try running this script again in a few minutes');
  }
}

verifyFeatures();
