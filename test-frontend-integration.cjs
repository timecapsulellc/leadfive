const { ethers } = require('ethers');
require('dotenv').config();

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const SPONSOR_ADDRESS = process.env.VITE_SPONSOR_ADDRESS;
const DEPLOYER_REFERRAL_CODE = process.env.VITE_DEPLOYER_REFERRAL_CODE;

// Load ABI
const fs = require('fs');
const contractABI = JSON.parse(fs.readFileSync('./abi-implementation-v1.10.json', 'utf8'));

async function testFrontendIntegration() {
    console.log('\n🧪 TESTING FRONTEND INTEGRATION');
    console.log('===============================');
    
    try {
        // Initialize provider
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        
        console.log('📋 Contract Information:');
        console.log(`   Contract: ${CONTRACT_ADDRESS}`);
        console.log(`   Sponsor: ${SPONSOR_ADDRESS}`);
        console.log(`   Referral Code: ${DEPLOYER_REFERRAL_CODE}`);
        
        // Test contract stats
        console.log('\n📊 Contract Stats:');
        const stats = await contract.getContractStats();
        console.log(`   Total Users: ${stats.totalUsersCount}`);
        console.log(`   Total Fees Collected: ${ethers.formatUnits(stats.totalFeesCollected, 6)} USDT`);
        console.log(`   Is Paused: ${stats.isPaused}`);
        console.log(`   Circuit Breaker: ${stats.circuitBreakerStatus}`);
        
        // Test sponsor info
        console.log('\n👤 Sponsor User Info:');
        const sponsorInfo = await contract.getUserInfo(SPONSOR_ADDRESS);
        console.log(`   Is Registered: ${sponsorInfo.isRegistered}`);
        console.log(`   Package Level: ${sponsorInfo.packageLevel}`);
        console.log(`   Referral Code: ${sponsorInfo.referralCode}`);
        console.log(`   Balance: ${ethers.formatUnits(sponsorInfo.balance, 6)} USDT`);
        console.log(`   Total Investment: ${ethers.formatUnits(sponsorInfo.totalInvestment, 6)} USDT`);
        
        // Test package prices for frontend display
        console.log('\n💰 Package Information (for frontend):');
        for (let level = 1; level <= 8; level++) {
            try {
                const packageInfo = await contract.getPackageInfo(level);
                console.log(`   Level ${level}: ${ethers.formatEther(packageInfo.price)} USDT`);
            } catch (err) {
                console.log(`   Level ${level}: Error - ${err.message}`);
            }
        }
        
        // Test referral code lookup
        console.log('\n🔍 Referral Code Lookup:');
        try {
            const referralUser = await contract.getUserByReferralCode(DEPLOYER_REFERRAL_CODE);
            console.log(`   Code "${DEPLOYER_REFERRAL_CODE}" belongs to: ${referralUser}`);
            console.log(`   Is Sponsor Address: ${referralUser.toLowerCase() === SPONSOR_ADDRESS.toLowerCase()}`);
        } catch (err) {
            console.log(`   ❌ Error looking up referral code: ${err.message}`);
        }
        
        // Generate frontend registration links
        console.log('\n🔗 Frontend Registration Links:');
        const baseUrl = 'http://localhost:5174';
        console.log(`   Direct Registration: ${baseUrl}/register`);
        console.log(`   With Referral Code: ${baseUrl}/register?ref=${DEPLOYER_REFERRAL_CODE}`);
        console.log(`   With Sponsor Param: ${baseUrl}/register?sponsor=${SPONSOR_ADDRESS}`);
        
        // Test network stats for dashboard
        console.log('\n📈 Network Stats (for dashboard):');
        try {
            const networkStats = await contract.getNetworkStats(SPONSOR_ADDRESS);
            console.log(`   Direct Referrals: ${networkStats.directCount}`);
            console.log(`   Team Size: ${networkStats.teamSize}`);
            console.log(`   Total Earnings: ${ethers.formatUnits(networkStats.totalEarnings, 6)} USDT`);
        } catch (err) {
            console.log(`   ❌ Error getting network stats: ${err.message}`);
        }
        
        // Test USDT contract info
        console.log('\n🪙 USDT Contract Info:');
        const usdtAddress = await contract.usdt();
        console.log(`   USDT Address: ${usdtAddress}`);
        console.log(`   Expected Address: ${process.env.VITE_USDT_ADDRESS}`);
        console.log(`   Addresses Match: ${usdtAddress.toLowerCase() === process.env.VITE_USDT_ADDRESS.toLowerCase()}`);
        
        console.log('\n✅ Frontend Integration Test Complete!');
        console.log('\n🎯 Next Steps:');
        console.log('   1. Open frontend at http://localhost:5174');
        console.log('   2. Connect wallet and test registration');
        console.log('   3. Test dashboard after registration');
        console.log('   4. Verify contract interactions work');
        
    } catch (error) {
        console.error('\n❌ Frontend Integration Test Failed:', error.message);
        if (error.data) {
            console.error('Error Data:', error.data);
        }
    }
}

// Run the test
testFrontendIntegration();
