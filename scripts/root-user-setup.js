#!/usr/bin/env node

/**
 * Root User Registration Guide
 * Step-by-step guide for establishing the first user in LeadFive MLM
 */

import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
const BUSINESS_ADDRESS = '0x018F9578621203BBA49a93D151537619702FA680';
const TREZOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
const RPC_URL = 'https://bsc-dataseed.binance.org/';

console.log('👑 ROOT USER REGISTRATION GUIDE');
console.log('================================\n');

async function analyzeRootUserSetup() {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contractABI = [
            "function totalUsers() view returns (uint256)",
            "function getUser(address user) view returns (tuple(uint256 id, bool isActive, uint256 registrationTime, uint256 currentLevel, uint256 totalEarnings, address referrer, uint256 directReferrals, uint256 teamSize, uint256 totalInvestment, uint256 maxLevelEarning))",
            "function getUserById(uint256 id) view returns (address)",
            "function register(address referrer, uint8 packageLevel, bool useUSDT) external payable",
            "function adminFeeRecipient() view returns (address)",
            "function owner() view returns (address)"
        ];
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        
        // Check current status
        const totalUsers = await contract.totalUsers();
        const currentFeeRecipient = await contract.adminFeeRecipient();
        const owner = await contract.owner();
        
        console.log('🔍 CURRENT STATUS:');
        console.log('==================');
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Owner: ${owner}`);
        console.log(`Fee Recipient: ${currentFeeRecipient}`);
        
        if (totalUsers.toString() === '0') {
            console.log('🆕 NO USERS REGISTERED - ROOT POSITION AVAILABLE!');
            
            console.log('\n🎯 ROOT USER REGISTRATION PLAN:');
            console.log('================================');
            console.log('Target Root Address:', BUSINESS_ADDRESS);
            console.log('Root will become: User ID #1');
            console.log('All future referrals will trace back to this address');
            
            console.log('\n📋 STEP-BY-STEP EXECUTION:');
            console.log('===========================');
            
            console.log('\n✅ STEP 1: Fee Collection (ALREADY DONE)');
            console.log('------------------------------------------');
            console.log('Current fee recipient:', currentFeeRecipient);
            console.log('Status: ✅ ALREADY PROPERLY CONFIGURED');
            console.log('Result: Admin fees (5%) flow to your cold wallet');
            console.log('Action needed: NONE - Keep current setup');

            console.log('\n💰 STEP 2: Fund Business Address');
            console.log('----------------------------------');
            console.log('Send to address:', BUSINESS_ADDRESS);
            console.log('Required USDT: 200+ (for level 4 package)');
            console.log('Required BNB: 0.02+ (for gas fees)');

            console.log('\n👑 STEP 3: Register as Root User');
            console.log('---------------------------------');
            console.log('🔗 Go to: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract');
            console.log('📱 Connect: Business wallet (' + BUSINESS_ADDRESS + ')');
            console.log('📋 Function: register');
            console.log('Parameters:');
            console.log('  referrer: 0x0000000000000000000000000000000000000000');
            console.log('  packageLevel: 4');
            console.log('  useUSDT: true');
            console.log('✅ Execute and sign with business wallet');
            
            console.log('\n🎉 RESULT AFTER REGISTRATION:');
            console.log('==============================');
            console.log('Your address becomes User ID #1 (ROOT)');
            console.log('Admin fees continue flowing to cold wallet:', currentFeeRecipient);
            console.log('All future users can refer to your address');
            console.log('You earn MLM commissions PLUS admin fees go to cold wallet');
            
        } else {
            console.log('\n📊 USERS ALREADY EXIST');
            console.log('=======================');
            
            // Check if our addresses are already registered
            try {
                const businessUser = await contract.getUser(BUSINESS_ADDRESS);
                if (businessUser.isActive) {
                    console.log(`✅ Business address is User ID: ${businessUser.id}`);
                    console.log(`   Level: ${businessUser.currentLevel}`);
                    console.log(`   Earnings: ${ethers.formatUnits(businessUser.totalEarnings, 18)} USDT`);
                } else {
                    console.log('⏳ Business address not registered yet');
                }
            } catch (e) {
                console.log('⏳ Business address registration status unknown');
            }
            
            try {
                const trezorUser = await contract.getUser(TREZOR_ADDRESS);
                if (trezorUser.isActive) {
                    console.log(`✅ Trezor address is User ID: ${trezorUser.id}`);
                    console.log(`   Level: ${trezorUser.currentLevel}`);
                    console.log(`   Earnings: ${ethers.formatUnits(trezorUser.totalEarnings, 18)} USDT`);
                } else {
                    console.log('⏳ Trezor address not registered yet');
                }
            } catch (e) {
                console.log('⏳ Trezor address registration status unknown');
            }
            
            // Check who is User ID 1 (root)
            try {
                const rootAddress = await contract.getUserById(1);
                console.log(`👑 ROOT USER (ID #1): ${rootAddress}`);
                
                const rootUser = await contract.getUser(rootAddress);
                console.log(`   Level: ${rootUser.currentLevel}`);
                console.log(`   Direct Referrals: ${rootUser.directReferrals}`);
                console.log(`   Team Size: ${rootUser.teamSize}`);
                console.log(`   Total Earnings: ${ethers.formatUnits(rootUser.totalEarnings, 18)} USDT`);
            } catch (e) {
                console.log('❌ Could not identify root user');
            }
        }
        
        console.log('\n💡 RECOMMENDATION:');
        console.log('===================');
        
        if (totalUsers.toString() === '0') {
            console.log('🚀 Execute the plan above to become the ROOT USER');
            console.log('💰 This gives you maximum earning potential');
            console.log('👑 You will be the foundation of the entire MLM network');
        } else {
            console.log('📈 Register your business address to participate in MLM');
            console.log('💰 Set your address as fee recipient for admin fee collection');
            console.log('🔄 Build your referral network from your current position');
        }
        
        console.log('\n🎯 YOUR OPTIMAL SETUP:');
        console.log('=======================');
        console.log('Admin Fees:', currentFeeRecipient, '(Cold Wallet - ALREADY SET ✅)');
        console.log('Root/Primary User:', BUSINESS_ADDRESS, '(MLM participation)');
        console.log('Admin Control:', TREZOR_ADDRESS, '(Contract ownership)');
        
    } catch (error) {
        console.error('❌ Error analyzing setup:', error.message);
    }
}

// Run the analysis
analyzeRootUserSetup();
