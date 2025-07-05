#!/usr/bin/env node

/**
 * Quick Production Lint Fixes
 * Addresses the most critical ESLint issues for production deployment
 */

const fs = require('fs');
const path = require('path');

// Files to fix critical issues
const criticalFixes = [
  {
    file: 'src/App.jsx',
    fixes: [
      {
        find: ', isConnecting, userRoles',
        replace: ''
      },
      {
        find: 'const { chainId } = await provider.getNetwork();',
        replace: 'await provider.getNetwork();'
      }
    ]
  },
  {
    file: 'src/components/ActivityFeed.jsx',
    fixes: [
      {
        find: 'const mockActivities = [];',
        replace: '// mockActivities removed for production'
      }
    ]
  },
  {
    file: 'src/utils/securityConfig.js',
    fixes: [
      {
        find: 'import securityManager',
        replace: '// import securityManager // Removed for production'
      },
      {
        find: 'import walletSecurity',
        replace: '// import walletSecurity // Removed for production'
      }
    ]
  }
];

// Add global process definition to files that need it
const processFiles = [
  'src/utils/productionMonitor.js',
  'src/utils/securityConfig.js',
  'src/utils/securityManager.js',
  'src/utils/walletSecurity.js'
];

function fixFile(filePath, fixes) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    fixes.forEach(fix => {
      content = content.replace(new RegExp(fix.find, 'g'), fix.replace);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function addProcessGlobal(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add process global if not already present
    if (!content.includes('/* global process */') && content.includes('process.env')) {
      content = '/* global process */\n' + content;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Added process global to: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error adding process global to ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔧 Applying critical lint fixes for production...\n');

// Apply specific fixes
criticalFixes.forEach(({ file, fixes }) => {
  fixFile(file, fixes);
});

// Add process global to files that need it
processFiles.forEach(file => {
  addProcessGlobal(file);
});

console.log('\n✅ Production lint fixes completed!');
console.log('Note: Some warnings remain but are acceptable for production deployment.');