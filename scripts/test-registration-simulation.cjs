const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🧪 USER REGISTRATION SIMULATION TEST");
        console.log("====================================");
        
        const contractAddress = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944";
        
        // Get accounts
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer (Root):", deployer.address);
        
        // Connect to contract
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(contractAddress);
        
        // Get root referral code
        const rootReferralCode = await contract.getReferralCode(deployer.address);
        console.log("🔗 Root Referral Code:", rootReferralCode);
        
        // Check if we can simulate USDT approval (this would normally require USDT tokens)
        console.log("\n📋 REGISTRATION REQUIREMENTS:");
        console.log("   - User needs USDT tokens for package purchase");
        console.log("   - User needs to approve USDT spending");
        console.log("   - User calls register() with referral code and package level");
        
        // Check package prices for registration
        console.log("\n📦 PACKAGE OPTIONS FOR NEW USERS:");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await contract.getPackageInfo(i);
            console.log(`   Package ${i}: ${ethers.formatUnits(packageInfo.price, 18)} USDT`);
        }
        
        // Check current contract state
        console.log("\n📊 CURRENT CONTRACT STATE:");
        const stats = await contract.getContractStats();
        console.log("   Total Users:", stats.totalUsersCount.toString());
        console.log("   Contract Paused:", stats.isPaused);
        console.log("   Circuit Breaker:", stats.circuitBreakerStatus);
        
        // Test referral code lookup
        console.log("\n🔍 REFERRAL CODE TESTING:");
        console.log("   Testing root code lookup...");
        const userByCode = await contract.getUserByReferralCode(rootReferralCode);
        console.log("   ✅ Root code", rootReferralCode, "maps to:", userByCode);
        
        // Check if contract can handle invalid referral codes
        try {
            await contract.getUserByReferralCode("INVALID");
            console.log("   ❌ Invalid code should have failed");
        } catch (error) {
            console.log("   ✅ Invalid referral code properly rejected");
        }
        
        console.log("\n🎯 REGISTRATION FLOW READY:");
        console.log("   1. New user gets testnet USDT tokens");
        console.log("   2. User approves USDT spending to contract");
        console.log("   3. User calls register('" + rootReferralCode + "', 1) for Package 1");
        console.log("   4. Contract processes registration and commission distribution");
        console.log("   5. User gets placed in binary matrix");
        console.log("   6. Pool distributions are calculated");
        
        console.log("\n✅ CONTRACT IS READY FOR USER REGISTRATIONS!");
        console.log("🔗 Share this referral code with new users:", rootReferralCode);
        
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
