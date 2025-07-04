#!/usr/bin/env node

/**
 * LeadFive - Quick Component Verification Script
 * Verifies that all critical components are properly imported and functional
 */

import fs from 'fs';
import path from 'path';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function checkFile(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    log(`✅ ${description}: Found`, COLORS.GREEN);
    return { exists: true, content };
  } catch (error) {
    log(`❌ ${description}: Missing`, COLORS.RED);
    return { exists: false, content: null };
  }
}

function verifyImport(content, importName, filePath) {
  if (content.includes(importName)) {
    log(`  ✅ ${importName} imported correctly`, COLORS.GREEN);
    return true;
  } else {
    log(`  ❌ ${importName} missing in ${filePath}`, COLORS.RED);
    return false;
  }
}

async function main() {
  log('\n🔍 LeadFive Component Verification', COLORS.BLUE);
  log('=====================================\n', COLORS.BLUE);

  // Check critical files
  const files = [
    {
      path: './src/App.jsx',
      description: 'Main Application Component'
    },
    {
      path: './src/components/UnifiedChatbot.jsx',
      description: 'ARIA Chatbot Component'
    },
    {
      path: './package.json',
      description: 'Package Configuration'
    },
    {
      path: './vite.config.js',
      description: 'Vite Configuration'
    }
  ];

  let allGood = true;

  for (const file of files) {
    const result = checkFile(file.path, file.description);
    if (!result.exists) allGood = false;

    // Specific checks for UnifiedChatbot
    if (file.path.includes('UnifiedChatbot') && result.exists) {
      log('  🔍 Checking critical imports...', COLORS.YELLOW);
      
      // Check for the fixed import
      const hasFaMinus = verifyImport(result.content, 'FaMinus', file.path);
      const hasNoFaMinimize = !result.content.includes('FaMinimize');
      
      if (hasFaMinus && hasNoFaMinimize) {
        log('  ✅ Import fix verified: FaMinimize → FaMinus', COLORS.GREEN);
      } else {
        log('  ❌ Import fix not applied correctly', COLORS.RED);
        allGood = false;
      }

      // Check for personality configuration
      if (result.content.includes('personalities')) {
        log('  ✅ AI personalities configured', COLORS.GREEN);
      } else {
        log('  ❌ AI personalities missing', COLORS.RED);
        allGood = false;
      }
    }

    // Check App.jsx for critical imports
    if (file.path.includes('App.jsx') && result.exists) {
      log('  🔍 Checking App structure...', COLORS.YELLOW);
      
      const hasRouter = verifyImport(result.content, 'BrowserRouter', file.path);
      const hasEthers = verifyImport(result.content, 'ethers', file.path);
      const hasErrorBoundary = verifyImport(result.content, 'ErrorBoundary', file.path);
      
      if (!hasRouter || !hasEthers || !hasErrorBoundary) {
        allGood = false;
      }
    }
  }

  // Check if dev server is accessible
  log('\n🌐 Server Status Check', COLORS.BLUE);
  log('===================\n', COLORS.BLUE);
  
  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      log('✅ Development server responding', COLORS.GREEN);
    } else {
      log('⚠️  Development server responding with errors', COLORS.YELLOW);
    }
  } catch (error) {
    log('❌ Development server not accessible', COLORS.RED);
    log('   Make sure to run: npm run dev', COLORS.YELLOW);
    allGood = false;
  }

  // Final status
  log('\n📊 Verification Summary', COLORS.BLUE);
  log('======================\n', COLORS.BLUE);
  
  if (allGood) {
    log('🎉 ALL CHECKS PASSED! LeadFive is ready for testing.', COLORS.GREEN);
    log('\n🚀 Next Steps:', COLORS.BLUE);
    log('1. Open http://localhost:5173 in your browser', COLORS.YELLOW);
    log('2. Test the ARIA chatbot (robot icon)', COLORS.YELLOW);
    log('3. Connect MetaMask wallet', COLORS.YELLOW);
    log('4. Test dashboard features', COLORS.YELLOW);
  } else {
    log('⚠️  Some issues found. Please check the errors above.', COLORS.RED);
  }
}

main().catch(console.error);
