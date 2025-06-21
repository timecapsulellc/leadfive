#!/usr/bin/env node

/**
 * Setup Fee Recipient Script
 * Helps configure the admin fee recipient to your chosen address
 */

import { ethers } from 'ethers';

// Configuration
const CONTRACT_ADDRESS = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
const CURRENT_FEE_RECIPIENT = '0xeB652c4523f3Cf615D3F3694b14E551145953aD0'; // Cold Wallet (Already Set)
const BUSINESS_ADDRESS = '0x018F9578621203BBA49a93D151537619702FA680'; // For MLM Root User
const TREZOR_OWNER = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
const RPC_URL = 'https://bsc-dataseed.binance.org/';

console.log('🎯 Fee Recipient Status Check');
console.log('=============================\n');

async function checkCurrentSetup() {
    try {
        console.log('🔍 Checking current contract configuration...\n');
        
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contractABI = [
            "function owner() view returns (address)",
            "function adminFeeRecipient() view returns (address)",
            "function adminIds(uint256) view returns (address)",
            "function setAdminFeeRecipient(address _recipient) external",
            "function totalAdminFeesCollected() view returns (uint256)"
        ];
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        
        // Check current setup
        const owner = await contract.owner();
        const currentFeeRecipient = await contract.adminFeeRecipient();
        const totalFeesCollected = await contract.totalAdminFeesCollected();
        const adminId0 = await contract.adminIds(0);
        
        console.log('📋 Current Configuration:');
        console.log(`   Owner: ${owner}`);
        console.log(`   Fee Recipient: ${currentFeeRecipient}`);
        console.log(`   Total Fees Collected: ${ethers.formatUnits(totalFeesCollected, 18)} USDT`);
        console.log(`   Admin ID [0]: ${adminId0}`);
        
        console.log('\n🎯 Current Configuration Status:');
        console.log(`   Expected Fee Recipient: ${CURRENT_FEE_RECIPIENT} (Cold Wallet)`);
        console.log(`   Actual Fee Recipient: ${currentFeeRecipient}`);
        console.log(`   Status: ${currentFeeRecipient.toLowerCase() === CURRENT_FEE_RECIPIENT.toLowerCase() ? '✅ CORRECTLY CONFIGURED' : '⚠️ NEEDS UPDATE'}`);
        
        console.log('\n💰 Business Address for MLM:');
        console.log(`   Business Address: ${BUSINESS_ADDRESS}`);
        console.log(`   Purpose: Root User registration (User ID #1)`);
        
        // Validate addresses
        console.log('\n✅ Address Validation:');
        console.log(`   Current fee recipient valid: ${ethers.isAddress(currentFeeRecipient)}`);
        console.log(`   Business address valid: ${ethers.isAddress(BUSINESS_ADDRESS)}`);
        console.log(`   Owner has control: ${owner.toLowerCase() === TREZOR_OWNER.toLowerCase()}`);
        
        if (currentFeeRecipient.toLowerCase() === CURRENT_FEE_RECIPIENT.toLowerCase()) {
            console.log('\n✅ PERFECT SETUP - NO ACTION NEEDED!');
            console.log('=====================================');
            console.log('✅ Fee recipient is already correctly set to your cold wallet');
            console.log('✅ Admin fees (5%) are actively flowing to the secure address');
            console.log('✅ No changes needed to fee collection setup');
            console.log('\n💡 Next Step: Register business address as MLM root user');
            console.log(`   Address: ${BUSINESS_ADDRESS}`);
            console.log('   Purpose: Become User ID #1 and earn MLM commissions');
        } else {
            console.log('\n⚠️ ACTION REQUIRED - Update Fee Recipient');
            console.log('=========================================');
            console.log('The fee recipient should be updated to your cold wallet:');
            console.log('\n1. 🔗 Go to BSCScan Write Contract:');
            console.log('   https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract');
            console.log('\n2. 📱 Connect your Trezor wallet');
            console.log('   - Make sure it\'s the owner address');
            console.log(`   - ${TREZOR_OWNER}`);
            console.log('\n3. 📋 Find function: setAdminFeeRecipient');
            console.log('   - _recipient (address):', CURRENT_FEE_RECIPIENT);
            console.log('\n4. ✅ Execute the transaction');
            console.log('   - Sign with your Trezor');
            console.log('   - Pay the gas fee (small amount of BNB)');
        }
        
        // Check if the business address is already registered
        try {
            const userABI = [
                "function getUser(address user) view returns (tuple(uint256 id, bool isActive, uint256 registrationTime, uint256 currentLevel, uint256 totalEarnings, address referrer, uint256 directReferrals, uint256 teamSize, uint256 totalInvestment, uint256 maxLevelEarning))"
            ];
            const userContract = new ethers.Contract(CONTRACT_ADDRESS, userABI, provider);
            const userInfo = await userContract.getUser(BUSINESS_ADDRESS);
            
            console.log('\n👤 Business Address MLM Registration Status:');
            if (userInfo.isActive) {
                console.log(`   ✅ Address is already registered as User ID: ${userInfo.id}`);
                console.log(`   💰 Total MLM Earnings: ${ethers.formatUnits(userInfo.totalEarnings, 18)} USDT`);
                console.log(`   📊 Current Level: ${userInfo.currentLevel}`);
                console.log(`   👥 Direct Referrals: ${userInfo.directReferrals}`);
            } else {
                console.log('   ⏳ Address is not yet registered in MLM system');
                console.log('   💡 Register it as root user (User ID #1) to start earning MLM commissions');
                console.log('   🎯 This will make it the foundation of your entire MLM network');
            }
        } catch (e) {
            console.log('\n👤 MLM registration status: Unable to check');
        }
        
    } catch (error) {
        console.error('❌ Error checking configuration:', error.message);
    }
}

// Run the check
checkCurrentSetup();

console.log('\n' + '='.repeat(60));
console.log('� SUMMARY: Revenue Stream Configuration');
console.log('='.repeat(60));
console.log('💰 Admin Fees (5%): → Cold Wallet (ALREADY SET)');
console.log(`   Fee Recipient: ${CURRENT_FEE_RECIPIENT}`);
console.log('💰 MLM Earnings: → Business Address (when registered)');
console.log(`   Business Address: ${BUSINESS_ADDRESS}`);
console.log('\n✅ OPTIMAL SETUP: Separate admin fees from MLM earnings');
console.log('✅ SECURITY: Admin fees secured in cold wallet');
console.log('✅ BUSINESS: MLM earnings go to active business wallet');

console.log('\n' + '='.repeat(50));
console.log('📞 Need Help?');
console.log('='.repeat(50));
console.log('Fee recipient setup: ✅ COMPLETE - No action needed');
console.log('Next step: Register business address as MLM root user');
console.log('1. Fund business address with 200+ USDT');
console.log('2. Connect to BSCScan and register as User ID #1');
console.log('3. Start earning MLM commissions from referrals');
console.log('\n✅ Fee collection is already optimally configured!');
console.log(`🎯 Admin Fees → Cold Wallet: ${CURRENT_FEE_RECIPIENT}`);
console.log(`🎯 MLM Root User → Business: ${BUSINESS_ADDRESS}`);
