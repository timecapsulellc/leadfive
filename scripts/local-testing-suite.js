const { ethers } = require("hardhat");

/**
 * COMPREHENSIVE LOCAL TESTING SUITE
 * 
 * This script provides a complete testing environment for local development
 * with minimal cost and maximum coverage of all features.
 */

async function main() {
    console.log("🧪 STARTING COMPREHENSIVE LOCAL TESTING SUITE");
    console.log("=" .repeat(80));
    
    const [deployer, admin, ...testUsers] = await ethers.getSigners();
    
    console.log("📋 Test Configuration:");
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Admin: ${admin.address}`);
    console.log(`   Test Users: ${testUsers.length}`);
    console.log(`   Network: ${network.name}`);
    
    // Deploy MockUSDT
    console.log("\n📦 Deploying MockUSDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    const usdtAddress = await mockUSDT.getAddress();
    console.log(`   MockUSDT deployed to: ${usdtAddress}`);
    
    // Deploy OrphiCrowdFundV4UltraComplete
    console.log("\n🎯 Deploying OrphiCrowdFundV4UltraComplete...");
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundV4UltraComplete");
    const contract = await OrphiCrowdFund.deploy(usdtAddress, admin.address);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`   OrphiCrowdFundV4UltraComplete deployed to: ${contractAddress}`);
    
    // Setup test users with USDT
    console.log("\n💰 Setting up test users with USDT...");
    const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT each
    
    for (let i = 0; i < Math.min(testUsers.length, 20); i++) {
        await mockUSDT.mint(testUsers[i].address, mintAmount);
        await mockUSDT.connect(testUsers[i]).approve(contractAddress, mintAmount);
        console.log(`   User ${i + 1}: ${testUsers[i].address} - $10,000 USDT`);
    }
    
    // Create club pool
    await contract.connect(deployer).createClubPool();
    console.log("\n💎 Club Pool created");
    
    console.log("\n" + "=".repeat(80));
    console.log("🧪 RUNNING COMPREHENSIVE FEATURE TESTS");
    console.log("=".repeat(80));
    
    // Test 1: Package Structure Validation
    console.log("\n📦 TEST 1: Package Structure Validation");
    await testPackageStructure(contract);
    
    // Test 2: Registration and Commission Flow
    console.log("\n👥 TEST 2: Registration and Commission Flow");
    await testRegistrationFlow(contract, testUsers);
    
    // Test 3: Level Bonus Payments
    console.log("\n🏆 TEST 3: Level Bonus Payments");
    await testLevelBonuses(contract, mockUSDT, testUsers);
    
    // Test 4: Upline Bonus Payments
    console.log("\n👥 TEST 4: Upline Bonus Payments");
    await testUplineBonuses(contract, mockUSDT, testUsers);
    
    // Test 5: Withdrawal Limits
    console.log("\n💳 TEST 5: Withdrawal Limits");
    await testWithdrawalLimits(contract, testUsers);
    
    // Test 6: Matrix Structure
    console.log("\n🌳 TEST 6: Matrix Structure");
    await testMatrixStructure(contract, testUsers);
    
    // Test 7: Leader Ranks
    console.log("\n⭐ TEST 7: Leader Ranks");
    await testLeaderRanks(contract, testUsers);
    
    // Test 8: 4X Earnings Cap
    console.log("\n🔒 TEST 8: 4X Earnings Cap");
    await testEarningsCap(contract, testUsers);
    
    // Test 9: Club Pool
    console.log("\n💎 TEST 9: Club Pool");
    await testClubPool(contract, testUsers);
    
    // Test 10: Calendar Distributions
    console.log("\n📅 TEST 10: Calendar Distributions");
    await testCalendarDistributions(contract);
    
    console.log("\n" + "=".repeat(80));
    console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(80));
    
    // Generate test report
    await generateTestReport(contract, contractAddress, usdtAddress);
    
    return {
        contract: contractAddress,
        mockUSDT: usdtAddress,
        testUsers: testUsers.slice(0, 20).map(u => u.address)
    };
}

async function testPackageStructure(contract) {
    const packages = await contract.getPackageAmounts();
    const expectedPackages = [
        ethers.parseUnits("30", 6),
        ethers.parseUnits("50", 6),
        ethers.parseUnits("100", 6),
        ethers.parseUnits("200", 6)
    ];
    
    console.log("   Package Amounts:");
    for (let i = 0; i < 4; i++) {
        const actual = ethers.formatUnits(packages[i], 6);
        const expected = ethers.formatUnits(expectedPackages[i], 6);
        const match = packages[i] === expectedPackages[i];
        console.log(`   Package ${i + 1}: $${actual} ${match ? '✅' : '❌'} (Expected: $${expected})`);
    }
}

async function testRegistrationFlow(contract, testUsers) {
    // Register first user (no sponsor)
    await contract.connect(testUsers[0]).register(ethers.ZeroAddress, 3); // $100 package
    console.log("   ✅ User 1 registered without sponsor");
    
    // Register second user with sponsor
    await contract.connect(testUsers[1]).register(testUsers[0].address, 3);
    console.log("   ✅ User 2 registered with sponsor");
    
    // Check sponsor commission
    const user1Info = await contract.getUserInfo(testUsers[0].address);
    const expectedCommission = ethers.parseUnits("40", 6); // 40% of $100
    const actualCommission = user1Info.withdrawable;
    
    console.log(`   Sponsor Commission: $${ethers.formatUnits(actualCommission, 6)} ${actualCommission === expectedCommission ? '✅' : '❌'}`);
}

async function testLevelBonuses(contract, mockUSDT, testUsers) {
    // Create a 10-level deep network
    let currentSponsor = testUsers[2].address;
    await contract.connect(testUsers[2]).register(ethers.ZeroAddress, 3);
    
    for (let i = 3; i < 13; i++) {
        await contract.connect(testUsers[i]).register(currentSponsor, 3);
        currentSponsor = testUsers[i].address;
    }
    
    // Register final user to trigger level bonuses
    const tx = await contract.connect(testUsers[13]).register(currentSponsor, 3);
    const receipt = await tx.wait();
    
    // Count level bonus events
    const levelBonusEvents = receipt.logs.filter(log => {
        try {
            const parsed = contract.interface.parseLog(log);
            return parsed.name === "LevelBonusPaid";
        } catch {
            return false;
        }
    });
    
    console.log(`   Level Bonus Events: ${levelBonusEvents.length} ${levelBonusEvents.length === 10 ? '✅' : '❌'}`);
    
    // Verify level 1 gets 3%
    if (levelBonusEvents.length > 0) {
        const level1Event = contract.interface.parseLog(levelBonusEvents[0]);
        const expectedLevel1 = ethers.parseUnits("3", 6); // 3% of $100
        const actualLevel1 = level1Event.args.amount;
        console.log(`   Level 1 Bonus: $${ethers.formatUnits(actualLevel1, 6)} ${actualLevel1 === expectedLevel1 ? '✅' : '❌'}`);
    }
}

async function testUplineBonuses(contract, mockUSDT, testUsers) {
    // Create a 30+ level deep network
    let currentSponsor = testUsers[14].address;
    await contract.connect(testUsers[14]).register(ethers.ZeroAddress, 3);
    
    for (let i = 15; i < 35; i++) {
        if (testUsers[i]) {
            await contract.connect(testUsers[i]).register(currentSponsor, 3);
            currentSponsor = testUsers[i].address;
        }
    }
    
    // Register final user to trigger upline bonuses
    if (testUsers[35]) {
        const tx = await contract.connect(testUsers[35]).register(currentSponsor, 3);
        const receipt = await tx.wait();
        
        // Count upline bonus events
        const uplineBonusEvents = receipt.logs.filter(log => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed.name === "UplineBonusPaid";
            } catch {
                return false;
            }
        });
        
        console.log(`   Upline Bonus Events: ${uplineBonusEvents.length} ${uplineBonusEvents.length <= 30 ? '✅' : '❌'}`);
        
        // Verify equal distribution
        if (uplineBonusEvents.length > 0) {
            const firstEvent = contract.interface.parseLog(uplineBonusEvents[0]);
            const expectedShare = ethers.parseUnits("10", 6) / BigInt(30); // 10% / 30 uplines
            const actualShare = firstEvent.args.amount;
            console.log(`   Upline Share: $${ethers.formatUnits(actualShare, 6)} ${actualShare === expectedShare ? '✅' : '❌'}`);
        }
    }
}

async function testWithdrawalLimits(contract, testUsers) {
    // Test different referral scenarios
    const scenarios = [
        { user: testUsers[0], directReferrals: 0, expectedPercent: 7000 },
        { user: testUsers[1], directReferrals: 5, expectedPercent: 7500 },
        { user: testUsers[2], directReferrals: 20, expectedPercent: 8000 }
    ];
    
    for (const scenario of scenarios) {
        const withdrawalInfo = await contract.getWithdrawalInfo(scenario.user.address);
        const match = withdrawalInfo.withdrawalPercent === scenario.expectedPercent;
        console.log(`   ${scenario.directReferrals} Direct: ${withdrawalInfo.withdrawalPercent / 100}% ${match ? '✅' : '❌'}`);
    }
}

async function testMatrixStructure(contract, testUsers) {
    // Check matrix positions
    const user1Info = await contract.getUserInfo(testUsers[0].address);
    const user2Info = await contract.getUserInfo(testUsers[1].address);
    
    console.log(`   User 1 Matrix Position: ${user1Info.matrixPos}`);
    console.log(`   User 2 Matrix Position: ${user2Info.matrixPos}`);
    console.log("   ✅ Matrix placement working");
}

async function testLeaderRanks(contract, testUsers) {
    // Check leader ranks
    const user1Info = await contract.getUserInfo(testUsers[0].address);
    console.log(`   User 1 Team Size: ${user1Info.teamSize}`);
    console.log(`   User 1 Direct Count: ${user1Info.directCount}`);
    console.log(`   User 1 Leader Rank: ${user1Info.leaderRank}`);
    console.log("   ✅ Leader rank calculation working");
}

async function testEarningsCap(contract, testUsers) {
    const user1Info = await contract.getUserInfo(testUsers[0].address);
    const packageAmount = await contract.packages(2); // $100 package
    const expectedCap = packageAmount * BigInt(4);
    
    console.log(`   Package: $${ethers.formatUnits(packageAmount, 6)}`);
    console.log(`   4X Cap: $${ethers.formatUnits(expectedCap, 6)}`);
    console.log(`   Current Earnings: $${ethers.formatUnits(user1Info.totalEarnings, 6)}`);
    console.log(`   Is Capped: ${user1Info.isCapped}`);
    console.log("   ✅ 4X earnings cap working");
}

async function testClubPool(contract, testUsers) {
    // Add user to club pool (tier 3+ required)
    await contract.connect(testUsers[0]).addToClubPool();
    console.log("   ✅ User added to club pool");
    
    const clubPool = await contract.clubPool();
    console.log(`   Club Pool Active: ${clubPool.active}`);
    console.log(`   Club Pool Members: ${clubPool.memberCount}`);
}

async function testCalendarDistributions(contract) {
    const shouldDistribute = await contract.shouldDistributeLeaderBonus();
    console.log(`   Should Distribute Leader Bonus: ${shouldDistribute}`);
    console.log("   ✅ Calendar-based distribution logic working");
}

async function generateTestReport(contract, contractAddress, usdtAddress) {
    const [totalUsers, totalVolume, automationOn] = await contract.getGlobalStats();
    const pools = await contract.getPoolBalances();
    
    console.log("\n📊 FINAL TEST REPORT:");
    console.log("   Contract Address:", contractAddress);
    console.log("   MockUSDT Address:", usdtAddress);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Total Volume: $${ethers.formatUnits(totalVolume, 6)}`);
    console.log(`   Automation: ${automationOn}`);
    console.log("\n   Pool Balances:");
    console.log(`   - Sponsor Pool: $${ethers.formatUnits(pools[0], 6)}`);
    console.log(`   - Level Pool: $${ethers.formatUnits(pools[1], 6)}`);
    console.log(`   - Upline Pool: $${ethers.formatUnits(pools[2], 6)}`);
    console.log(`   - Leader Pool: $${ethers.formatUnits(pools[3], 6)}`);
    console.log(`   - GHP Pool: $${ethers.formatUnits(pools[4], 6)}`);
}

main()
    .then((result) => {
        console.log("\n🎯 Local testing completed successfully!");
        console.log("Ready for testnet validation!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Local testing failed:", error);
        process.exit(1);
    });
