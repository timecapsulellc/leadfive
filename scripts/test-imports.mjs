// Test script to verify frontend contract imports
import { LEAD_FIVE_CONFIG, LEAD_FIVE_ABI, PACKAGES } from './src/contracts-leadfive.js';

console.log('🧪 Testing Frontend Contract Imports');
console.log('='.repeat(40));

// Test LEAD_FIVE_CONFIG
console.log('📋 LEAD_FIVE_CONFIG:');
console.log('  Address:', LEAD_FIVE_CONFIG.address);
console.log('  USDT:', LEAD_FIVE_CONFIG.usdtAddress);
console.log('  RPC URL:', LEAD_FIVE_CONFIG.rpcUrl);
console.log('  Chain ID:', LEAD_FIVE_CONFIG.chainId);

// Test LEAD_FIVE_ABI
console.log('\n📜 LEAD_FIVE_ABI:');
console.log('  Functions:', LEAD_FIVE_ABI.length);
console.log('  First function:', LEAD_FIVE_ABI[0]?.name || 'Error');

// Test PACKAGES
console.log('\n📦 PACKAGES:');
Object.entries(PACKAGES).forEach(([level, pkg]) => {
  console.log(`  Package ${level}: $${pkg.price} USDT - ${pkg.name}`);
});

console.log('\n✅ All imports working correctly!');
