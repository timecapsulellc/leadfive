#!/usr/bin/env node

/**
 * 🚀 LEADFIVE IMMEDIATE ACTION PLAN
 * Critical tasks that must be completed TODAY
 */

console.log(`
🚀 LEADFIVE IMMEDIATE ACTION PLAN
================================

📋 CONTRACT STATUS: ✅ DEPLOYED & SECURED
💰 MISSING: Revenue collection setup
🔧 NEXT: Admin configuration

🔥 CRITICAL TASKS (DO TODAY):
═══════════════════════════════

1️⃣ FEE RECIPIENT STATUS (ALREADY SET ✅)
   ✅ CURRENT: 0xeB652c4523f3Cf615D3F3694b14E551145953aD0 (Cold Wallet)
   ✅ STATUS: Revenue collection is ACTIVE
   ✅ RESULT: Admin fees (5%) flowing to secure wallet
   📍 URL: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#readContract
   � NO ACTION NEEDED - Optimally configured!

2️⃣ SET CIRCUIT BREAKER (3 minutes)
   🛡️ WHY: Protection against large withdrawals
   🎯 ACTION: Set reasonable threshold (e.g., 10,000 USDT)
   🔐 FUNCTION: setCircuitBreakerThreshold
   💰 VALUE: 10000000000000000000000 (10k USDT in wei)

3️⃣ UPDATE ADMIN IDS (10 minutes)
   ⚠️ WHY: Currently using hot wallet for admin functions
   🎯 ACTION: Replace with Trezor address
   🔐 FUNCTION: setAdminId
   👤 ADDRESS: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

4️⃣ FRONTEND INTEGRATION (30 minutes)
   📱 WHY: Users need to interact with the contract
   🎯 ACTION: Update frontend config and test
   📝 FILE: frontend-config.json already updated
   🧪 TEST: Wallet connection and basic functions

═══════════════════════════════
🎯 EXPECTED RESULT AFTER TODAY:
═══════════════════════════════
✅ Revenue flowing to your Trezor
✅ Circuit breaker protection active
✅ Trezor controlling all admin functions
✅ Frontend connecting to live contract
✅ Basic functionality tested

📈 REVENUE PROJECTION:
- Each registration: 25-300 USDT
- Admin fee: 5-10% of all transactions
- With 10 users/day: ~$1,000-5,000 daily revenue

⏰ TIME REQUIRED: 1-2 hours total
💰 RESULT: Revenue-generating MLM platform

🔗 RESOURCES:
- BSCScan Contract: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569
- Frontend Config: /Users/dadou/LEAD FIVE/frontend-config.json
- Trezor Guide: /Users/dadou/LEAD FIVE/TREZOR_CONFIGURATION_CHECKLIST.md

🚨 IMPORTANT: Complete tasks 1-2 TODAY to start earning revenue!
`);

// Check if Trezor is connected
console.log('\n🔍 CHECKING CURRENT STATUS...\n');

const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;
const TREZOR_ADDRESS = process.env.VITE_OWNER_ADDRESS;

if (!CONTRACT_ADDRESS || !TREZOR_ADDRESS) {
    console.log('❌ Missing contract or Trezor address in .env');
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);

// Contract ABI for admin functions
const adminABI = [
    "function owner() view returns (address)",
    "function adminFeeRecipient() view returns (address)",
    "function circuitBreakerThreshold() view returns (uint256)",
    "function adminIds(uint256) view returns (address)",
    "function paused() view returns (bool)"
];

async function checkStatus() {
    try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, adminABI, provider);
        
        console.log('📊 CURRENT CONTRACT STATE:');
        console.log('========================');
        
        const owner = await contract.owner();
        const feeRecipient = await contract.adminFeeRecipient();
        const threshold = await contract.circuitBreakerThreshold();
        const isPaused = await contract.paused();
        
        console.log(`🔐 Owner: ${owner}`);
        console.log(`💰 Fee Recipient: ${feeRecipient}`);
        console.log(`🛡️ Circuit Breaker: ${ethers.formatUnits(threshold, 18)} USDT`);
        console.log(`⏸️ Paused: ${isPaused}`);
        
        // Check admin IDs
        console.log('\n👥 ADMIN IDS:');
        for (let i = 0; i < 5; i++) {
            try {
                const admin = await contract.adminIds(i);
                console.log(`   Admin ${i}: ${admin}`);
            } catch (e) {
                console.log(`   Admin ${i}: Not set`);
            }
        }
        
        console.log('\n🎯 ACTION ITEMS:');
        console.log('================');
        
        if (feeRecipient === '0x0000000000000000000000000000000000000000') {
            console.log('🔥 URGENT: Set admin fee recipient to start earning!');
        } else {
            console.log('✅ Admin fee recipient is set');
        }
        
        if (threshold.toString() === '0') {
            console.log('⚠️ RECOMMENDED: Set circuit breaker threshold for security');
        } else {
            console.log('✅ Circuit breaker is configured');
        }
        
        if (owner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log('✅ Trezor is the owner');
        } else {
            console.log('❌ Owner is not Trezor - this is a problem!');
        }
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('==============');
        console.log('1. Open BSCScan WriteContract interface');
        console.log('2. Connect your Trezor wallet');
        console.log('3. Execute setAdminFeeRecipient function');
        console.log('4. Execute setCircuitBreakerThreshold function');
        console.log('5. Test frontend integration');
        
    } catch (error) {
        console.error('❌ Error checking status:', error.message);
    }
}

checkStatus().catch(console.error);
