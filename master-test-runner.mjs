#!/usr/bin/env node

/**
 * LeadFive Master Test Runner
 * Orchestrates all testing phases with intelligent fallbacks
 */

import { spawn } from 'child_process';
import fs from 'fs';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  BOLD: '\x1b[1m',
  RESET: '\x1b[0m'
};

function log(message, color = COLORS.RESET) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] ${message}${COLORS.RESET}`);
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    log(`🚀 Running: ${command} ${args.join(' ')}`, COLORS.CYAN);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    child.on('error', (error) => {
      log(`❌ Command failed: ${error.message}`, COLORS.RED);
      resolve(false);
    });
  });
}

async function checkDependencies() {
  log('🔍 Checking dependencies...', COLORS.YELLOW);
  
  const requiredFiles = [
    'simple-test-runner.mjs',
    'quick-fix-check.mjs',
    'comprehensive-testing.mjs'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      log(`❌ Missing test file: ${file}`, COLORS.RED);
      return false;
    }
  }
  
  log('✅ All test files present', COLORS.GREEN);
  return true;
}

async function runTestPhase(phaseName, command, required = false) {
  log(`\n🎯 PHASE: ${phaseName}`, COLORS.BOLD + COLORS.BLUE);
  log('='.repeat(phaseName.length + 15), COLORS.BLUE);
  
  const success = await runCommand('node', [command]);
  
  if (success) {
    log(`✅ ${phaseName} completed successfully`, COLORS.GREEN);
  } else {
    log(`❌ ${phaseName} failed`, COLORS.RED);
    if (required) {
      log('💥 Critical phase failed - stopping tests', COLORS.RED);
      return false;
    } else {
      log('⚠️  Non-critical phase failed - continuing', COLORS.YELLOW);
    }
  }
  
  return success;
}

async function generateMasterReport() {
  log('\n📊 MASTER TEST REPORT', COLORS.BOLD + COLORS.BLUE);
  log('=====================\n', COLORS.BLUE);
  
  const reports = [
    { file: 'simple-test-report.json', name: 'Simple Tests' },
    { file: 'testing-results.json', name: 'Comprehensive Tests' },
    { file: 'automated-test-report.json', name: 'Automated Tests' }
  ];
  
  const masterReport = {
    timestamp: new Date().toISOString(),
    phases: [],
    overall: {
      total: 0,
      passed: 0,
      failed: 0,
      percentage: 0
    }
  };
  
  for (const report of reports) {
    if (fs.existsSync(report.file)) {
      try {
        const data = JSON.parse(fs.readFileSync(report.file, 'utf8'));
        masterReport.phases.push({
          name: report.name,
          data: data
        });
        
        // Aggregate results
        if (data.summary) {
          masterReport.overall.total += data.summary.total || 0;
          masterReport.overall.passed += data.summary.passed || 0;
          masterReport.overall.failed += data.summary.failed || 0;
        }
        
        log(`✅ ${report.name}: Found`, COLORS.GREEN);
      } catch (error) {
        log(`❌ ${report.name}: Error reading report`, COLORS.RED);
      }
    } else {
      log(`⚠️  ${report.name}: No report found`, COLORS.YELLOW);
    }
  }
  
  // Calculate overall percentage
  if (masterReport.overall.total > 0) {
    masterReport.overall.percentage = Math.round(
      (masterReport.overall.passed / masterReport.overall.total) * 100
    );
  }
  
  // Save master report
  fs.writeFileSync('master-test-report.json', JSON.stringify(masterReport, null, 2));
  
  const { passed, total, percentage } = masterReport.overall;
  log(`\n🎯 OVERALL RESULTS: ${passed}/${total} (${percentage}%)`, 
      percentage >= 90 ? COLORS.GREEN : percentage >= 70 ? COLORS.YELLOW : COLORS.RED);
  
  // Final recommendations
  log('\n📋 FINAL RECOMMENDATIONS:', COLORS.BLUE);
  if (percentage >= 90) {
    log('🎉 OUTSTANDING! LeadFive is production-ready!', COLORS.GREEN);
    log('✅ All systems operational', COLORS.GREEN);
    log('🚀 Ready for deployment', COLORS.GREEN);
  } else if (percentage >= 80) {
    log('✅ EXCELLENT! Minor optimizations possible', COLORS.GREEN);
    log('🔧 Address any remaining issues', COLORS.YELLOW);
    log('📋 Review test reports for details', COLORS.YELLOW);
  } else if (percentage >= 70) {
    log('✅ GOOD! Some issues need attention', COLORS.YELLOW);
    log('🔧 Fix failing tests before production', COLORS.YELLOW);
    log('📝 Document known limitations', COLORS.YELLOW);
  } else {
    log('⚠️  NEEDS WORK! Critical issues found', COLORS.RED);
    log('🛠️  Address critical failures', COLORS.RED);
    log('🔍 Debug and fix major issues', COLORS.RED);
  }
  
  log(`\n📄 Master report saved: master-test-report.json`, COLORS.CYAN);
  log(`🌐 Application URL: http://localhost:5173`, COLORS.CYAN);
  
  return percentage;
}

async function main() {
  log('🎊 LEADFIVE MASTER TEST SUITE', COLORS.BOLD + COLORS.BLUE);
  log('=============================\n', COLORS.BLUE);
  
  log('🎯 Objective: Comprehensive automated testing of LeadFive platform', COLORS.CYAN);
  log('📋 Strategy: Multi-phase testing with intelligent fallbacks\n', COLORS.CYAN);
  
  // Check dependencies
  const depsOk = await checkDependencies();
  if (!depsOk) {
    log('💥 Missing dependencies - cannot continue', COLORS.RED);
    process.exit(1);
  }
  
  // Phase 1: Simple Tests (Critical)
  const simpleOk = await runTestPhase(
    'Simple System Tests', 
    'simple-test-runner.mjs', 
    true
  );
  
  if (!simpleOk) {
    log('\n💥 Critical simple tests failed - stopping execution', COLORS.RED);
    process.exit(1);
  }
  
  // Phase 2: Quick Fix Verification
  await runTestPhase(
    'Quick Fix Verification', 
    'quick-fix-check.mjs', 
    false
  );
  
  // Phase 3: Comprehensive Tests (if interactive)
  log('\n📋 Interactive comprehensive testing available separately', COLORS.CYAN);
  log('Run: npm run test:comprehensive (for interactive mode)', COLORS.CYAN);
  
  // Phase 4: Browser Automation (if Puppeteer available)
  if (fs.existsSync('./node_modules/puppeteer')) {
    await runTestPhase(
      'Browser Automation Tests', 
      'automated-test-suite.mjs', 
      false
    );
  } else {
    log('\n⚠️  Puppeteer not installed - skipping browser automation', COLORS.YELLOW);
    log('Install with: npm install puppeteer (optional)', COLORS.CYAN);
  }
  
  // Generate master report
  const overallScore = await generateMasterReport();
  
  // Final status
  if (overallScore >= 80) {
    log('\n🎊 MASTER TESTING COMPLETED SUCCESSFULLY!', COLORS.GREEN);
    process.exit(0);
  } else {
    log('\n⚠️  MASTER TESTING FOUND ISSUES!', COLORS.YELLOW);
    process.exit(1);
  }
}

main().catch(error => {
  log(`💥 Master test suite crashed: ${error.message}`, COLORS.RED);
  process.exit(1);
});
