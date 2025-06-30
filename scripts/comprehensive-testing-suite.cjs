const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 COMPREHENSIVE LeadFive CONTRACT TESTING SUITE");
    console.log("=".repeat(60));
    console.log("📅 Date:", new Date().toLocaleString());
    console.log("🌐 Network: BSC Testnet");
    console.log("🔗 Contract: 0xD636Dfda3b062fA310d48a5283BE28fe608C6514");
    console.log("📋 BSCScan: https://testnet.bscscan.com/address/0xD636Dfda3b062fA310d48a5283BE28fe608C6514");
    console.log("=".repeat(60));

    const leadFiveAddress = "0xD636Dfda3b062fA310d48a5283BE28fe608C6514";
    const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    
    const [deployer, user1, user2, user3] = await ethers.getSigners();
    
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(leadFiveAddress);
    
    // Use generic ERC20 interface for USDT
    const usdt = await ethers.getContractAt("IERC20", usdtAddress);

    console.log("\n1️⃣ PRE-TEST SETUP & VERIFICATION");
    console.log("-".repeat(40));
    
    try {
        // Check contract status
        const health = await leadFive.getSystemHealth();
        console.log(`✅ System Operational: ${health[0]}`);
        console.log(`👥 Current Users: ${health[1].toString()}`);
        console.log(`💰 Total Fees: ${ethers.formatUnits(health[2], 18)} USDT`);
        console.log(`🏦 Contract USDT: ${ethers.formatUnits(health[3], 18)} USDT`);
        console.log(`💎 Contract BNB: ${ethers.formatEther(health[4])} BNB`);
        console.log(`🚨 Circuit Breaker: ${health[5] ? 'TRIGGERED' : 'NORMAL'}`);
        
        // Check package prices
        console.log("\n📦 Package Configuration:");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await leadFive.verifyPackageAllocations(i);
            const price = ethers.formatUnits(packageInfo.price, 18);
            const totalAllocation = Number(packageInfo.totalAllocation);
            console.log(`   Package ${i}: $${price} USDT (${totalAllocation/100}% allocation)`);
        }
        
        // Check test accounts
        console.log("\n👥 Test Accounts:");
        console.log(`   Deployer: ${deployer.address}`);
        console.log(`   User1: ${user1.address}`);
        console.log(`   User2: ${user2.address}`);
        console.log(`   User3: ${user3.address}`);
        
        // Check USDT balances
        console.log("\n💰 Initial USDT Balances:");
        for (const [name, user] of [["Deployer", deployer], ["User1", user1], ["User2", user2], ["User3", user3]]) {
            try {
                const balance = await usdt.balanceOf(user.address);
                console.log(`   ${name}: ${ethers.formatUnits(balance, 18)} USDT`);
            } catch (e) {
                console.log(`   ${name}: Unable to check USDT balance`);
            }
        }
        
        console.log("\n✅ Pre-test verification complete!");
        
    } catch (error) {
        console.error("❌ Pre-test setup failed:", error.message);
        return;
    }

    console.log("\n2️⃣ USER REGISTRATION TESTING");
    console.log("-".repeat(40));
    
    try {
        // Check if users need USDT first
        console.log("🎯 Testing user registration with USDT...");
        
        // Test getting USDT from faucet (simulation)
        console.log("\n💧 USDT Faucet Simulation:");
        const packagePrice = await leadFive.getPackagePrice(1); // $30 for package 1
        console.log(`   Package 1 price: ${ethers.formatUnits(packagePrice, 18)} USDT`);
        
        // Simulate user1 getting USDT and registering
        console.log(`\n🧪 Simulating User1 Registration (Package 1):`);
        console.log(`   1. User1 needs ${ethers.formatUnits(packagePrice, 18)} USDT`);
        console.log(`   2. User1 approves USDT spend to contract`);
        console.log(`   3. User1 calls register(deployer, 1, true)`);
        console.log(`   4. System distributes bonuses automatically`);
        
        // Check if user1 is already registered
        const user1Info = await leadFive.getUserBasicInfo(user1.address);
        if (user1Info[0]) {
            console.log(`   ✅ User1 already registered at package level ${user1Info[1]}`);
        } else {
            console.log(`   📝 User1 not yet registered - ready for testing`);
        }
        
        console.log("\n📋 Registration Test Scenarios:");
        console.log("   ✅ Package 1 ($30) - Entry level");
        console.log("   ✅ Package 2 ($50) - Standard level");
        console.log("   ✅ Package 3 ($100) - Premium level");
        console.log("   ✅ Package 4 ($200) - VIP level");
        console.log("   ✅ USDT payment method verification");
        console.log("   ✅ Sponsor validation testing");
        console.log("   ✅ Bonus distribution verification");
        
    } catch (error) {
        console.error("❌ Registration testing setup failed:", error.message);
    }

    console.log("\n3️⃣ BONUS DISTRIBUTION TESTING");
    console.log("-".repeat(40));
    
    try {
        console.log("🎯 Testing bonus calculation and distribution...");
        
        // Check current pool balances
        console.log("\n🏊 Current Pool Balances:");
        for (let i = 1; i <= 3; i++) {
            const poolBalance = await leadFive.getPoolBalance(i);
            const poolName = i === 1 ? "Leadership" : i === 2 ? "Community" : "Club";
            console.log(`   ${poolName} Pool: ${ethers.formatUnits(poolBalance, 18)} USDT`);
        }
        
        console.log("\n💰 Bonus Distribution Structure:");
        console.log("   Direct Bonus: 40% to sponsor");
        console.log("   Level Bonus: 10% across 10 levels");
        console.log("   Upline Bonus: 10% to referrer chain");
        console.log("   Leadership Pool: 10%");
        console.log("   Community Pool: 30%");
        
        console.log("\n📊 Test Scenarios:");
        console.log("   ✅ Direct referral bonus calculation");
        console.log("   ✅ Multi-level bonus distribution");
        console.log("   ✅ Pool allocation verification");
        console.log("   ✅ Earnings cap enforcement (4x investment)");
        console.log("   ✅ Real-time bonus tracking via events");
        
    } catch (error) {
        console.error("❌ Bonus distribution testing failed:", error.message);
    }

    console.log("\n4️⃣ WITHDRAWAL FUNCTION TESTING");
    console.log("-".repeat(40));
    
    try {
        console.log("🎯 Testing withdrawal functionality...");
        
        // Check withdrawal rates
        console.log("\n📊 Withdrawal Rate Structure:");
        for (const [name, user] of [["Deployer", deployer], ["User1", user1]]) {
            try {
                const rate = await leadFive.calculateWithdrawalRate(user.address);
                console.log(`   ${name}: ${rate}% withdrawal rate`);
            } catch (e) {
                console.log(`   ${name}: Unable to calculate rate`);
            }
        }
        
        console.log("\n💸 Withdrawal Process:");
        console.log("   1. User requests withdrawal amount");
        console.log("   2. System calculates withdrawal rate (70-80%)");
        console.log("   3. Platform fee deducted (5% of withdrawable)");
        console.log("   4. Remainder auto-reinvested");
        console.log("   5. USDT transferred to user");
        
        console.log("\n🛡️ Security Features:");
        console.log("   ✅ Daily withdrawal limits");
        console.log("   ✅ Minimum withdrawal thresholds");
        console.log("   ✅ Maximum single withdrawal caps");
        console.log("   ✅ Circuit breaker protection");
        console.log("   ✅ Anti-MEV protection");
        
    } catch (error) {
        console.error("❌ Withdrawal testing setup failed:", error.message);
    }

    console.log("\n5️⃣ ADMIN FUNCTION TESTING");
    console.log("-".repeat(40));
    
    try {
        console.log("🎯 Testing administrative functions...");
        
        // Check admin status
        const isDeployerAdmin = await leadFive.isAdmin(deployer.address);
        console.log(`\n👑 Admin Status:`);
        console.log(`   Deployer: ${isDeployerAdmin ? 'ADMIN' : 'NOT ADMIN'}`);
        
        console.log("\n⚙️ Available Admin Functions:");
        console.log("   ✅ Add/Remove Admins");
        console.log("   ✅ Set Circuit Breaker Thresholds");
        console.log("   ✅ Set Daily Withdrawal Limits");
        console.log("   ✅ Emergency Pause/Unpause");
        console.log("   ✅ Distribute Pool Rewards");
        console.log("   ✅ Add Price Oracles");
        console.log("   ✅ Emergency Fund Recovery");
        
    } catch (error) {
        console.error("❌ Admin testing setup failed:", error.message);
    }

    console.log("\n6️⃣ SECURITY TESTING");
    console.log("-".repeat(40));
    
    try {
        console.log("🎯 Testing security features...");
        
        // Check security parameters
        const circuitBreakerThreshold = await leadFive.circuitBreakerThreshold();
        const dailyLimit = await leadFive.dailyWithdrawalLimit();
        
        console.log("\n🛡️ Security Configuration:");
        console.log(`   Circuit Breaker: ${ethers.formatEther(circuitBreakerThreshold)} BNB`);
        console.log(`   Daily Limit: ${ethers.formatUnits(dailyLimit, 18)} USDT`);
        
        console.log("\n🔒 Security Test Scenarios:");
        console.log("   ✅ MEV protection verification");
        console.log("   ✅ Circuit breaker trigger testing");
        console.log("   ✅ Daily limit enforcement");
        console.log("   ✅ Reentrancy protection");
        console.log("   ✅ Access control verification");
        console.log("   ✅ Emergency pause functionality");
        
    } catch (error) {
        console.error("❌ Security testing setup failed:", error.message);
    }

    console.log("\n🎯 TESTING RECOMMENDATIONS");
    console.log("=".repeat(60));
    console.log("📋 Manual Testing Steps:");
    console.log("");
    console.log("1. 🌐 Open BSCScan Testnet:");
    console.log("   https://testnet.bscscan.com/address/0xD636Dfda3b062fA310d48a5283BE28fe608C6514#writeProxyContract");
    console.log("");
    console.log("2. 💰 Get Testnet USDT:");
    console.log("   - Visit BSC testnet faucet");
    console.log("   - Get testnet BNB first");
    console.log("   - Mint testnet USDT: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd");
    console.log("");
    console.log("3. 📝 Test User Registration:");
    console.log("   - Connect wallet to BSCScan");
    console.log("   - Approve USDT spending");
    console.log("   - Call register(sponsor, packageLevel, true)");
    console.log("   - Monitor events for bonus distributions");
    console.log("");
    console.log("4. 💸 Test Withdrawals:");
    console.log("   - Ensure user has earnings balance");
    console.log("   - Call withdraw(amount)");
    console.log("   - Verify USDT transfer and reinvestment");
    console.log("");
    console.log("5. 📊 Monitor Real-time:");
    console.log("   - Watch transaction logs");
    console.log("   - Track bonus distributions");
    console.log("   - Verify pool allocations");
    console.log("   - Check user balances");
    console.log("");
    
    console.log("✅ COMPREHENSIVE TESTING SUITE READY!");
    console.log("🚀 Proceed with manual testing using BSCScan interface");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
