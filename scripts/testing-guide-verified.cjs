const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 LeadFive BSC Testnet Testing Guide");
    console.log("=".repeat(50));
    
    const leadFiveAddress = "0xD636Dfda3b062fA310d48a5283BE28fe608C6514";
    const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    
    const [deployer] = await ethers.getSigners();
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(leadFiveAddress);

    console.log("\n✅ CONTRACT VERIFICATION STATUS");
    console.log("-".repeat(30));
    console.log("🔗 Contract Address:", leadFiveAddress);
    console.log("🌐 BSCScan Read:", `https://testnet.bscscan.com/address/${leadFiveAddress}#readProxyContract`);
    console.log("✏️ BSCScan Write:", `https://testnet.bscscan.com/address/${leadFiveAddress}#writeProxyContract`);
    console.log("💰 USDT Contract:", usdtAddress);
    
    // Contract status
    const health = await leadFive.getSystemHealth();
    console.log("\n📊 CURRENT CONTRACT STATUS");
    console.log("-".repeat(30));
    console.log(`✅ System Operational: ${health[0]}`);
    console.log(`👥 Total Users: ${health[1].toString()}`);
    console.log(`💰 Total Fees: ${ethers.formatUnits(health[2], 18)} USDT`);
    console.log(`🏦 Contract USDT: ${ethers.formatUnits(health[3], 18)} USDT`);
    console.log(`💎 Contract BNB: ${ethers.formatEther(health[4])} BNB`);
    console.log(`🚨 Circuit Breaker: ${health[5] ? 'TRIGGERED' : 'NORMAL'}`);
    
    // Package prices
    console.log("\n📦 PACKAGE CONFIGURATION");
    console.log("-".repeat(30));
    for (let i = 1; i <= 4; i++) {
        const packageInfo = await leadFive.verifyPackageAllocations(i);
        const price = ethers.formatUnits(packageInfo.price, 18);
        console.log(`Package ${i}: $${price} USDT`);
    }
    
    console.log("\n🧪 TESTING PROCEDURES");
    console.log("=".repeat(50));
    
    console.log("\n1️⃣ USER REGISTRATION TESTING");
    console.log("-".repeat(30));
    console.log("📋 Prerequisites:");
    console.log("   • Get testnet BNB from BSC faucet");
    console.log("   • Get testnet USDT tokens");
    console.log("   • Connect wallet to BSCScan");
    console.log("");
    console.log("🔗 BSC Testnet USDT Faucet:");
    console.log("   https://testnet.bscscan.com/address/0x337610d27c682E347C9cD60BD4b3b107C9d34dDd#writeContract");
    console.log("");
    console.log("📝 Registration Steps:");
    console.log("   1. Open BSCScan Write Contract tab");
    console.log("   2. Connect your wallet");
    console.log("   3. Approve USDT spending first:");
    console.log("      - Go to USDT contract");
    console.log("      - Call approve(spender, amount)");
    console.log(`      - spender: ${leadFiveAddress}`);
    console.log("      - amount: 30000000000000000000 (for $30)");
    console.log("   4. Call register function:");
    console.log(`      - sponsor: ${deployer.address} (root user)`);
    console.log("      - packageLevel: 1 (for $30 package)");
    console.log("      - useUSDT: true");
    
    console.log("\n2️⃣ BONUS DISTRIBUTION TESTING");
    console.log("-".repeat(30));
    console.log("💰 Expected Distributions:");
    console.log("   • Direct Bonus: 40% to sponsor ($12)");
    console.log("   • Level Bonus: 10% across 10 levels ($3)");
    console.log("   • Upline Bonus: 10% to referrer chain ($3)");
    console.log("   • Leadership Pool: 10% ($3)");
    console.log("   • Community Pool: 30% ($9)");
    console.log("");
    console.log("📊 Monitor via Events:");
    console.log("   • UserRegistered event");
    console.log("   • RewardDistributed events");
    console.log("   • Pool allocation updates");
    
    console.log("\n3️⃣ WITHDRAWAL TESTING");
    console.log("-".repeat(30));
    console.log("💸 Withdrawal Process:");
    console.log("   1. User accumulates earnings");
    console.log("   2. Call withdraw(amount)");
    console.log("   3. System applies withdrawal rate (70-80%)");
    console.log("   4. Platform fee deducted (5%)");
    console.log("   5. Remainder auto-reinvested");
    console.log("   6. USDT transferred to user");
    console.log("");
    console.log("🔍 Test Scenarios:");
    console.log("   • Minimum withdrawal (1 USDT)");
    console.log("   • Daily limit enforcement");
    console.log("   • Withdrawal rate calculation");
    console.log("   • Platform fee calculation");
    
    console.log("\n4️⃣ COMPREHENSIVE USER JOURNEY");
    console.log("-".repeat(30));
    console.log("🎯 Full Test Scenario:");
    console.log("   1. User A registers Package 1 ($30)");
    console.log("   2. User B registers with User A as sponsor");
    console.log("   3. User C registers with User B as sponsor");
    console.log("   4. Monitor bonus distributions");
    console.log("   5. Test package upgrades");
    console.log("   6. Test withdrawal functionality");
    console.log("   7. Verify pool distributions");
    
    console.log("\n🔧 TESTING TOOLS");
    console.log("-".repeat(30));
    console.log("🌐 BSCScan Interfaces:");
    console.log(`   Read: https://testnet.bscscan.com/address/${leadFiveAddress}#readProxyContract`);
    console.log(`   Write: https://testnet.bscscan.com/address/${leadFiveAddress}#writeProxyContract`);
    console.log(`   Events: https://testnet.bscscan.com/address/${leadFiveAddress}#events`);
    console.log("");
    console.log("💰 USDT Contract:");
    console.log(`   https://testnet.bscscan.com/address/${usdtAddress}#writeContract`);
    
    console.log("\n📋 KEY FUNCTIONS TO TEST");
    console.log("-".repeat(30));
    console.log("✅ Registration Functions:");
    console.log("   • register(sponsor, packageLevel, useUSDT)");
    console.log("   • upgradePackage(newLevel, useUSDT)");
    console.log("");
    console.log("✅ View Functions:");
    console.log("   • getUserBasicInfo(address)");
    console.log("   • getUserEarnings(address)");
    console.log("   • getPoolBalance(poolType)");
    console.log("   • calculateWithdrawalRate(address)");
    console.log("");
    console.log("✅ Withdrawal Functions:");
    console.log("   • withdraw(amount)");
    
    console.log("\n🎉 READY FOR TESTING!");
    console.log("=".repeat(50));
    console.log("The contract is fully verified and ready for comprehensive testing.");
    console.log("Follow the procedures above using BSCScan interface for best results.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
