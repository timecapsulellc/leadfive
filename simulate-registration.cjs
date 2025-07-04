#!/usr/bin/env node

const { ethers } = require('ethers');
require('dotenv').config();

async function simulateRegistrationFlow() {
    console.log('\n🎭 SIMULATING FRONTEND REGISTRATION FLOW');
    console.log('=========================================');
    
    try {
        // Initialize provider and contract
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const contractABI = require('./abi-implementation-v1.10.json');
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
        
        // Simulate frontend registration data
        const testRegistration = {
            packageLevel: 1,
            useUSDT: true,
            referralCode: 'K9NBHT',
            sponsorAddress: process.env.VITE_SPONSOR_ADDRESS
        };
        
        console.log('📋 Registration Form Data:');
        console.log(`   Package Level: ${testRegistration.packageLevel}`);
        console.log(`   Payment Method: ${testRegistration.useUSDT ? 'USDT' : 'BNB'}`);
        console.log(`   Referral Code: ${testRegistration.referralCode}`);
        console.log(`   Sponsor: ${testRegistration.sponsorAddress}`);
        
        // Get package info
        console.log('\n💰 Package Validation:');
        const packageInfo = await contract.getPackageInfo(testRegistration.packageLevel);
        const packagePrice = ethers.formatEther(packageInfo.price);
        console.log(`   ✅ Package ${testRegistration.packageLevel} found`);
        console.log(`   💵 Price: ${packagePrice} USDT`);
        
        // Validate referral code
        console.log('\n🎫 Referral Code Validation:');
        try {
            const referralUser = await contract.getUserByReferralCode(testRegistration.referralCode);
            const referralUserInfo = await contract.getUserInfo(referralUser);
            console.log(`   ✅ Referral code "${testRegistration.referralCode}" is valid`);
            console.log(`   👤 Belongs to: ${referralUser}`);
            console.log(`   📊 User Level: ${referralUserInfo.packageLevel}`);
        } catch (err) {
            console.log(`   ❌ Invalid referral code: ${err.message}`);
        }
        
        // Check USDT contract
        console.log('\n🪙 USDT Contract Validation:');
        const usdtAddress = await contract.usdt();
        console.log(`   ✅ USDT contract configured: ${usdtAddress}`);
        console.log(`   ✅ Matches expected: ${usdtAddress === process.env.VITE_USDT_ADDRESS}`);
        
        // Simulate the transaction data that would be sent
        console.log('\n📝 Transaction Simulation:');
        console.log('   Function: register(address,uint8,bool,string)');
        console.log(`   Parameters:`);
        console.log(`     sponsor: ${testRegistration.sponsorAddress}`);
        console.log(`     packageLevel: ${testRegistration.packageLevel}`);
        console.log(`     useUSDT: ${testRegistration.useUSDT}`);
        console.log(`     referralCode: "${testRegistration.referralCode}"`);
        
        if (testRegistration.useUSDT) {
            console.log('\n💳 USDT Payment Flow Simulation:');
            console.log('   1. ✅ Check user USDT balance');
            console.log('   2. ✅ Check USDT allowance for contract');
            console.log('   3. ✅ If needed, call USDT.approve()');
            console.log('   4. ✅ Call contract.register() with USDT flag');
            console.log(`   Required USDT: ${packagePrice} USDT`);
        } else {
            console.log('\n🔶 BNB Payment Flow Simulation:');
            console.log('   1. ✅ Check user BNB balance');
            console.log('   2. ✅ Calculate BNB equivalent (~$600/BNB)');
            console.log('   3. ✅ Call contract.register() with BNB value');
            const bnbRequired = (parseFloat(packagePrice) / 600).toFixed(6);
            console.log(`   Required BNB: ~${bnbRequired} BNB`);
        }
        
        // Frontend response simulation
        console.log('\n🎯 Expected Frontend Behavior:');
        console.log('   ✅ Show loading spinner during transaction');
        console.log('   ✅ Display transaction hash when submitted');
        console.log('   ✅ Wait for block confirmation');
        console.log('   ✅ Show success message with transaction link');
        console.log('   ✅ Redirect to dashboard or refresh user data');
        console.log('   ✅ Update balances and user info');
        
        // Check contract state for debugging
        console.log('\n🔍 Contract State Check:');
        const contractStats = await contract.getContractStats();
        console.log(`   Current Users: ${contractStats.totalUsersCount}`);
        console.log(`   Contract Paused: ${contractStats.isPaused}`);
        console.log(`   Circuit Breaker: ${contractStats.circuitBreakerStatus}`);
        
        console.log('\n📱 Frontend Testing Checklist:');
        console.log('===============================');
        console.log('□ Open http://localhost:5174');
        console.log('□ Connect MetaMask wallet');
        console.log('□ Ensure BSC Mainnet is selected');
        console.log('□ Check USDT balance in wallet');
        console.log('□ Navigate to registration page');
        console.log('□ Select package level');
        console.log('□ Enter or verify referral code');
        console.log('□ Click register and approve transactions');
        console.log('□ Verify registration success');
        console.log('□ Check dashboard displays new user data');
        
        console.log('\n🚨 IMPORTANT NOTES:');
        console.log('==================');
        console.log('⚠️  Use small amounts for testing (minimum package is 30 USDT)');
        console.log('⚠️  Ensure wallet has enough USDT + BNB for gas fees');
        console.log('⚠️  Test on BSC Mainnet with real contracts');
        console.log('⚠️  Each address can only register once');
        console.log('⚠️  Keep private keys secure and never commit them');
        
        console.log('\n✅ Registration Flow Simulation Complete!');
        console.log('Ready for live wallet testing.');
        
    } catch (error) {
        console.error('\n❌ Simulation Error:', error.message);
        if (error.data) {
            console.error('Error Data:', error.data);
        }
    }
}

// Run the simulation
simulateRegistrationFlow();
