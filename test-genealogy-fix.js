#!/usr/bin/env node

// Quick test to validate the Genealogy.jsx fix
import fs from 'fs';
import path from 'path';

const genealogyPath = path.join(process.cwd(), 'src/pages/Genealogy.jsx');

try {
  const content = fs.readFileSync(genealogyPath, 'utf8');
  
  // Check if loadGenealogyData is defined before its first use
  const loadGenealogyDataDefIndex = content.indexOf('const loadGenealogyData = useCallback');
  const loadGenealogyDataUseIndex = content.indexOf('loadGenealogyData();');
  
  console.log('=== Genealogy.jsx Hoisting Fix Test ===');
  console.log(`loadGenealogyData definition at character: ${loadGenealogyDataDefIndex}`);
  console.log(`loadGenealogyData first use at character: ${loadGenealogyDataUseIndex}`);
  
  if (loadGenealogyDataDefIndex < loadGenealogyDataUseIndex && loadGenealogyDataDefIndex !== -1) {
    console.log('✅ SUCCESS: loadGenealogyData is defined before its first use');
    console.log('✅ The hoisting issue has been fixed!');
  } else {
    console.log('❌ ISSUE: loadGenealogyData is still used before definition');
  }
  
  // Additional checks
  const useEffectDependencies = content.match(/\[account, loadGenealogyData\]/);
  if (useEffectDependencies) {
    console.log('✅ useEffect dependencies include loadGenealogyData correctly');
  }
  
  const useCallbackDependencies = content.match(/\[account, useMockData, mockTreeData\]/);
  if (useCallbackDependencies) {
    console.log('✅ useCallback dependencies are properly defined');
  }
  
} catch (error) {
  console.error('Error reading file:', error.message);
}
