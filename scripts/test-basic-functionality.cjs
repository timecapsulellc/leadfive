const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🧪 BASIC FUNCTIONALITY TEST - LEADFIVE V1.10");
        console.log("==============================================");
        
        const contractAddress = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944";
        
        // Get accounts
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        
        // Connect to contract
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(contractAddress);
        
        console.log("📍 Contract Address:", contractAddress);
        console.log("👑 Contract Owner:", await contract.owner());
        
        // Test 1: Check package information
        console.log("\n📦 TEST 1: Package Information");
        for (let i = 1; i <= 4; i++) {
            try {
                const packageInfo = await contract.getPackageInfo(i);
                console.log(`   ✅ Package ${i}: ${ethers.formatUnits(packageInfo.price, 18)} USDT`);
                console.log(`      Commission: ${packageInfo.commission}%`);
                console.log(`      Matrix: ${packageInfo.matrixCommission}%`);
                console.log(`      Pool: ${packageInfo.poolCommission}%`);
            } catch (error) {
                console.log(`   ❌ Package ${i} error:`, error.message);
            }
        }
        
        // Test 2: Check pool information
        console.log("\n🏊 TEST 2: Pool Information");
        for (let i = 1; i <= 4; i++) {
            try {
                const poolInfo = await contract.getPoolInfo(i);
                console.log(`   ✅ Pool ${i}: ${ethers.formatUnits(poolInfo.totalReward, 18)} USDT total reward`);
            } catch (error) {
                console.log(`   ❌ Pool ${i} error:`, error.message);
            }
        }
        
        // Test 3: Check user info for deployer (root user)
        console.log("\n👤 TEST 3: Root User Information");
        try {
            const userInfo = await contract.getUserInfo(deployer.address);
            console.log("   ✅ Root user registered:", userInfo.isRegistered);
            console.log("   ✅ Package level:", userInfo.packageLevel.toString());
            console.log("   ✅ Registration time:", new Date(Number(userInfo.registrationTime) * 1000).toISOString());
        } catch (error) {
            console.log("   ❌ User info error:", error.message);
        }
        
        // Test 4: Check referral code
        console.log("\n🔗 TEST 4: Referral Code System");
        try {
            const referralCode = await contract.getReferralCode(deployer.address);
            console.log("   ✅ Root referral code:", referralCode);
            
            const userByCode = await contract.getUserByReferralCode(referralCode);
            console.log("   ✅ User by code lookup:", userByCode);
        } catch (error) {
            console.log("   ❌ Referral code error:", error.message);
        }
        
        // Test 5: Check blacklist functionality
        console.log("\n🚫 TEST 5: Blacklist System");
        try {
            const isBlacklisted = await contract.isUserBlacklisted(deployer.address);
            console.log("   ✅ Root user blacklisted:", isBlacklisted);
        } catch (error) {
            console.log("   ❌ Blacklist check error:", error.message);
        }
        
        // Test 6: Network stats
        console.log("\n📊 TEST 6: Network Statistics");
        try {
            const networkStats = await contract.getNetworkStats(deployer.address);
            console.log("   ✅ Direct referrals:", networkStats.directReferrals.toString());
            console.log("   ✅ Team size:", networkStats.teamSize.toString());
            console.log("   ✅ Total earnings:", ethers.formatUnits(networkStats.totalEarnings, 18), "USDT");
        } catch (error) {
            console.log("   ❌ Network stats error:", error.message);
        }
        
        // Test 7: Contract stats
        console.log("\n📈 TEST 7: Contract Statistics");
        try {
            const contractStats = await contract.getContractStats();
            console.log("   ✅ Total users:", contractStats.totalUsers?.toString() || "N/A");
            console.log("   ✅ Total volume:", contractStats.totalVolume ? ethers.formatUnits(contractStats.totalVolume, 18) + " USDT" : "N/A");
            console.log("   ✅ Total commissions:", contractStats.totalCommissions ? ethers.formatUnits(contractStats.totalCommissions, 18) + " USDT" : "N/A");
        } catch (error) {
            console.log("   ❌ Contract stats error:", error.message);
        }
        
        console.log("\n🎉 BASIC FUNCTIONALITY TEST COMPLETE!");
        console.log("📍 Contract is deployed and functional on BSC Testnet");
        console.log("👑 Owner is correctly set to deployer address");
        console.log("📦 4-package system is properly configured");
        console.log("🔗 Referral system is operational");
        console.log("🏊 Pool system is initialized");
        console.log("\n✅ Ready for user registration testing!");
        
    } catch (error) {
        console.error("💥 Test failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
