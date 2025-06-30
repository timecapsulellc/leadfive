const hre = require("hardhat");
const { ethers } = require("hardhat");

async function checkTrezorStatus() {
    try {
        console.log('🔍 CHECKING TREZOR STATUS');
        console.log('='.repeat(30));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log(`📋 Contract: ${contractAddress}`);
        console.log(`🔑 Trezor: ${trezorAddress}`);
        console.log('');
        
        // Get user basic info
        const userInfo = await contract.getUserBasicInfo(trezorAddress);
        const isRegistered = userInfo[0];
        const packageLevel = userInfo[1];
        const balance = userInfo[2];
        
        console.log('✅ USER STATUS:');
        console.log(`  Registered: ${isRegistered}`);
        console.log(`  Package Level: ${packageLevel}`);
        console.log(`  Balance: ${ethers.formatUnits(balance, 6)} USDT`);
        
        if (isRegistered) {
            // Get earnings info
            const earningsInfo = await contract.getUserEarnings(trezorAddress);
            const totalEarnings = earningsInfo[0];
            const earningsCap = earningsInfo[1];
            const directReferrals = earningsInfo[2];
            const totalTeamSize = earningsInfo[3];
            
            console.log('');
            console.log('💰 EARNINGS INFO:');
            console.log(`  Total Earnings: ${ethers.formatUnits(totalEarnings, 6)} USDT`);
            console.log(`  Earnings Cap: ${ethers.formatUnits(earningsCap, 6)} USDT`);
            console.log(`  Direct Referrals: ${directReferrals}`);
            console.log(`  Total Team Size: ${totalTeamSize}`);
            
            // Calculate package details
            const packagePrice = await contract.getPackagePrice(packageLevel);
            console.log('');
            console.log('📦 PACKAGE DETAILS:');
            console.log(`  Package ${packageLevel} Investment: ${ethers.formatUnits(packagePrice, 6)} USDT`);
            console.log(`  4x Earnings Cap: ${ethers.formatUnits(earningsCap, 6)} USDT`);
            
            // Check if it's a root user (no sponsor)
            const sponsorInfo = await contract.getUserSponsor(trezorAddress);
            console.log('');
            console.log('👑 ROOT USER STATUS:');
            console.log(`  Sponsor: ${sponsorInfo === ethers.ZeroAddress ? 'None (ROOT USER)' : sponsorInfo}`);
            console.log(`  Is Root User: ${sponsorInfo === ethers.ZeroAddress ? 'YES ✅' : 'NO ❌'}`);
        }
        
        // Check total users
        const totalUsers = await contract.getTotalUsers();
        console.log('');
        console.log('📊 NETWORK STATS:');
        console.log(`  Total Users: ${totalUsers}`);
        
        console.log('');
        console.log('🎯 SUMMARY:');
        if (isRegistered && packageLevel >= 1) {
            console.log('✅ Trezor is successfully registered as a root user!');
            console.log(`✅ Package Level: ${packageLevel} (${ethers.formatUnits(await contract.getPackagePrice(packageLevel), 6)} USDT)`);
            console.log('✅ Ready for frontend integration and testing');
            
            if (packageLevel === 1) {
                console.log('');
                console.log('🚀 UPGRADE OPTIONS:');
                console.log('  Package 2: $50 USDT (Cap: $200)');
                console.log('  Package 3: $100 USDT (Cap: $400)');
                console.log('  Package 4: $200 USDT (Cap: $800)');
            }
        } else {
            console.log('❌ Trezor is not registered yet');
        }
        
    } catch (error) {
        console.error('❌ Status check failed:', error.message);
    }
}

checkTrezorStatus();
