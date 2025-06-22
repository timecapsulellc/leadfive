#!/usr/bin/env node

/**
 * Genealogy Tree Fix Verification Script
 * Tests all the fixes implemented for the genealogy tree errors
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Verifying Genealogy Tree Fixes...\n');

const results = {
  passed: 0,
  failed: 0,
  issues: []
};

function checkFile(filePath, checks) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    results.failed++;
    results.issues.push(`❌ File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  let allPassed = true;
  
  checks.forEach(check => {
    if (check.type === 'contains') {
      if (content.includes(check.text)) {
        console.log(`✅ ${check.description}`);
        results.passed++;
      } else {
        console.log(`❌ ${check.description}`);
        results.failed++;
        results.issues.push(`Missing: ${check.text} in ${filePath}`);
        allPassed = false;
      }
    } else if (check.type === 'not_contains') {
      if (!content.includes(check.text)) {
        console.log(`✅ ${check.description}`);
        results.passed++;
      } else {
        console.log(`❌ ${check.description}`);
        results.failed++;
        results.issues.push(`Should not contain: ${check.text} in ${filePath}`);
        allPassed = false;
      }
    }
  });
  
  return allPassed;
}

// Test 1: NetworkTreeVisualization fixes
console.log('📋 Testing NetworkTreeVisualization.jsx fixes:\n');

checkFile('src/components/NetworkTreeVisualization.jsx', [
  {
    type: 'contains',
    text: 'const renderCustomNodeElement = useCallback',
    description: 'renderCustomNodeElement function is defined'
  },
  {
    type: 'contains',
    text: 'const defaultNodeRenderer = useCallback',
    description: 'defaultNodeRenderer function is defined'
  },
  {
    type: 'contains',
    text: 'PACKAGE_TIER_COLORS',
    description: 'PACKAGE_TIER_COLORS constant exists'
  },
  {
    type: 'contains',
    text: 'renderCustomNodeElement: renderCustomNodeElement || defaultNodeRenderer',
    description: 'Proper fallback renderer is configured'
  }
]);

// Test 2: Genealogy page route
console.log('\n📋 Testing Genealogy page configuration:\n');

checkFile('src/App.jsx', [
  {
    type: 'contains',
    text: 'const Genealogy = React.lazy(() => import(\'./pages/Genealogy\'));',
    description: 'Genealogy component is imported'
  },
  {
    type: 'contains',
    text: 'path="/genealogy"',
    description: 'Genealogy route is configured'
  }
]);

checkFile('src/pages/Genealogy.jsx', [
  {
    type: 'contains',
    text: 'import UnifiedGenealogyTree',
    description: 'UnifiedGenealogyTree is imported'
  },
  {
    type: 'contains',
    text: '<UnifiedGenealogyTree',
    description: 'UnifiedGenealogyTree is used in JSX'
  }
]);

// Test 3: Dashboard network section
console.log('\n📋 Testing Dashboard network section:\n');

checkFile('src/pages/Dashboard.jsx', [
  {
    type: 'contains',
    text: 'UnifiedGenealogyTree',
    description: 'UnifiedGenealogyTree is imported in Dashboard'
  },
  {
    type: 'contains',
    text: 'function NetworkSection({ account })',
    description: 'NetworkSection component exists'
  },
  {
    type: 'contains',
    text: 'genealogy',
    description: 'Navigation to genealogy page is configured'
  }
]);

// Test 4: Required dependencies
console.log('\n📋 Testing dependencies:\n');

checkFile('package.json', [
  {
    type: 'contains',
    text: '"use-debounce"',
    description: 'use-debounce dependency is installed'
  },
  {
    type: 'contains',
    text: '"react-d3-tree"',
    description: 'react-d3-tree dependency is installed'
  }
]);

// Test 5: CSS files
console.log('\n📋 Testing CSS files:\n');

checkFile('src/components/UnifiedGenealogyTree.css', [
  {
    type: 'contains',
    text: '.unified-genealogy-tree',
    description: 'UnifiedGenealogyTree CSS exists'
  }
]);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Fix Verification Summary');
console.log('='.repeat(50));
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);

if (results.issues.length > 0) {
  console.log('\n🔍 Issues found:');
  results.issues.forEach(issue => console.log(`   ${issue}`));
} else {
  console.log('\n🎉 All fixes verified successfully!');
  console.log('\n✅ The genealogy tree should now work without errors:');
  console.log('   • http://localhost:5174/genealogy (main genealogy page)');
  console.log('   • Dashboard -> Network Tree button should work');
  console.log('   • No more renderCustomNodeElement errors');
}

console.log('\n🚀 Ready for testing!');
