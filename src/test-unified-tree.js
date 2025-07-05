// Quick test to verify unified tree service
import { getUnifiedTreeData } from '../services/unifiedGenealogyService.js';

// Test the unified tree service
const testAccount = '0x1234567890123456789012345678901234567890';
const provider = null;

console.log('Testing unified tree service...');

getUnifiedTreeData(testAccount, provider)
  .then(data => {
    console.log('✅ Unified tree service working correctly!');
    console.log('Tree data:', data);
  })
  .catch(error => {
    console.error('❌ Unified tree service error:', error);
  });
