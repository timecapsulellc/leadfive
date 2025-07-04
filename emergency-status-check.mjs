#!/usr/bin/env node

/**
 * Emergency Status Check - Verify FaMinimize fix
 */

import fs from 'fs';
import path from 'path';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  BOLD: '\x1b[1m',
  RESET: '\x1b[0m'
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function checkFile(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { exists: true, content };
  } catch (error) {
    return { exists: false, content: null };
  }
}

async function main() {
  log('\n🚨 EMERGENCY STATUS CHECK', COLORS.BOLD + COLORS.RED);
  log('========================\n', COLORS.RED);

  // Check if emergency fix is active
  const homeFile = checkFile('./src/pages/Home.jsx', 'Home Page');
  if (homeFile.exists) {
    if (homeFile.content.includes('UnifiedChatbot_emergency')) {
      log('✅ Emergency fix ACTIVE in Home.jsx', COLORS.GREEN);
    } else {
      log('❌ Emergency fix NOT active in Home.jsx', COLORS.RED);
    }
  }

  // Check emergency component
  const emergencyFile = checkFile('./src/components/UnifiedChatbot_emergency.jsx', 'Emergency Component');
  if (emergencyFile.exists) {
    log('✅ Emergency component EXISTS', COLORS.GREEN);
    
    // Check for problematic imports
    if (emergencyFile.content.includes('FaMinimize')) {
      log('❌ Emergency component still has FaMinimize!', COLORS.RED);
    } else {
      log('✅ Emergency component clean (no FaMinimize)', COLORS.GREEN);
    }
  } else {
    log('❌ Emergency component MISSING', COLORS.RED);
  }

  // Check original component
  const originalFile = checkFile('./src/components/UnifiedChatbot.jsx', 'Original Component');
  if (originalFile.exists) {
    if (originalFile.content.includes('FaMinimize')) {
      log('⚠️  Original component still has FaMinimize', COLORS.YELLOW);
    } else {
      log('✅ Original component clean', COLORS.GREEN);
    }
  }

  // Check cache directories
  const cacheExists = fs.existsSync('./node_modules/.vite');
  if (cacheExists) {
    log('⚠️  Vite cache still exists', COLORS.YELLOW);
  } else {
    log('✅ Vite cache cleared', COLORS.GREEN);
  }

  log('\n📋 NEXT STEPS:', COLORS.BLUE);
  log('1. Make sure dev server is running: npm run dev', COLORS.YELLOW);
  log('2. Open http://localhost:5173 in browser', COLORS.YELLOW);
  log('3. Do a hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)', COLORS.YELLOW);
  log('4. Check if ARIA chatbot loads without errors', COLORS.YELLOW);

  log('\n🎯 EXPECTED RESULT:', COLORS.BLUE);
  log('✅ Homepage loads successfully', COLORS.GREEN);
  log('✅ ARIA chatbot icon appears (bottom-right)', COLORS.GREEN);
  log('✅ No FaMinimize errors in console', COLORS.GREEN);
  log('✅ Emergency minimal chatbot works', COLORS.GREEN);
}

main().catch(console.error);
