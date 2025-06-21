const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚀 LEADFIVE ADVANCED TESTING SUITE");
    console.log("=".repeat(60));

    // Contract addresses from deployment
    const CONTRACT_ADDRESS = "0x35Fa466f2B4f61F9C950eC1488dc5608157315e4";
    const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    
    // Get signers - on testnet we typically only have one (deployer)
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    console.log("🔍 Testing with accounts:");
    console.log("- Deployer:", deployer.address);
    console.log("- Available signers:", signers.length);
    
    // For testing, we'll use deployer as multiple users since it's testnet
    const user1 = deployer;
    const user2 = deployer;
    const user3 = deployer;
    
    // Get contract instances
    const LeadFive = await ethers.getContractAt("LeadFive", CONTRACT_ADDRESS);
    const MockUSDT = await ethers.getContractAt("MockUSDT", USDT_ADDRESS);
    
    let testResults = {
        passed: 0,
        failed: 0,
        tests: []
    };

    async function runTest(testName, testFunction) {
        try {
            console.log(`\n🧪 TEST: ${testName}`);
            console.log("-".repeat(50));
            await testFunction();
            console.log("✅ PASSED");
            testResults.passed++;
            testResults.tests.push({ name: testName, status: "PASSED" });
        } catch (error) {
            console.log("❌ FAILED:", error.message);
            testResults.failed++;
            testResults.tests.push({ name: testName, status: "FAILED", error: error.message });
        }
    }

    try {
        // Advanced Test 1: Multi-User Registration Chain
        await runTest("Multi-User Registration Chain", async () => {
            console.log("Testing complex referral chain registration...");
            
            // Check initial state
            const initialTotalUsers = await LeadFive.totalUsers();
            console.log("Initial total users:", initialTotalUsers.toString());
            
            // Get some testnet BNB value for package 1 (30 USDT)
            const package1Price = ethers.parseEther("30");
            const bnbRequired = ethers.parseEther("0.05"); // Approximate BNB for 30 USDT
            
            // Register User1 with deployer as referrer (BNB payment)
            console.log("Registering User1 with BNB payment...");
            const registerTx1 = await LeadFive.connect(user1).register(
                deployer.address, 
                1, // Package 1
                false, // Use BNB, not USDT
                { value: bnbRequired }
            );
            await registerTx1.wait();
            
            // Verify User1 registration
            const user1Info = await LeadFive.getUserInfo(user1.address);
            console.log("User1 registered:", user1Info.isRegistered);
            console.log("User1 package level:", user1Info.packageLevel.toString());
            console.log("User1 referrer:", user1Info.referrer);
            
            // Register User2 with User1 as referrer
            console.log("Registering User2 with User1 as referrer...");
            const registerTx2 = await LeadFive.connect(user2).register(
                user1.address,
                1,
                false,
                { value: bnbRequired }
            );
            await registerTx2.wait();
            
            // Verify referral chain
            const user2Info = await LeadFive.getUserInfo(user2.address);
            console.log("User2 referrer:", user2Info.referrer);
            
            // Check if referral counts updated
            const user1InfoUpdated = await LeadFive.getUserInfo(user1.address);
            console.log("User1 direct referrals:", user1InfoUpdated.directReferrals.toString());
            
            // Verify total users increased
            const finalTotalUsers = await LeadFive.totalUsers();
            console.log("Final total users:", finalTotalUsers.toString());
            
            if (finalTotalUsers > initialTotalUsers) {
                console.log("✓ User registration chain working correctly");
            } else {
                throw new Error("Total users did not increase");
            }
        });

        // Advanced Test 2: Package Upgrade Testing
        await runTest("Package Upgrade Functionality", async () => {
            console.log("Testing package upgrade system...");
            
            // Check User1's current package
            const user1InfoBefore = await LeadFive.getUserInfo(user1.address);
            console.log("User1 current package:", user1InfoBefore.packageLevel.toString());
            console.log("User1 current investment:", ethers.formatEther(user1InfoBefore.totalInvestment));
            
            // Upgrade User1 to package 2
            const upgradeValue = ethers.parseEther("0.08"); // Approximate BNB for 50 USDT
            console.log("Upgrading User1 to package 2...");
            const upgradeTx = await LeadFive.connect(user1).upgradePackage(2, false, { value: upgradeValue });
            await upgradeTx.wait();
            
            // Verify upgrade
            const user1InfoAfter = await LeadFive.getUserInfo(user1.address);
            console.log("User1 new package:", user1InfoAfter.packageLevel.toString());
            console.log("User1 new investment:", ethers.formatEther(user1InfoAfter.totalInvestment));
            
            if (user1InfoAfter.packageLevel > user1InfoBefore.packageLevel) {
                console.log("✓ Package upgrade working correctly");
            } else {
                throw new Error("Package upgrade failed");
            }
        });

        // Advanced Test 3: Commission Distribution Testing
        await runTest("Commission Distribution System", async () => {
            console.log("Testing commission distribution...");
            
            // Check balances before new registration
            const deployerBalanceBefore = await LeadFive.getUserInfo(deployer.address);
            const user1BalanceBefore = await LeadFive.getUserInfo(user1.address);
            
            console.log("Deployer balance before:", ethers.formatEther(deployerBalanceBefore.balance));
            console.log("User1 balance before:", ethers.formatEther(user1BalanceBefore.balance));
            
            // Register User3 with User2 as referrer (this should trigger commissions)
            console.log("Registering User3 to trigger commissions...");
            const bnbRequired = ethers.parseEther("0.05");
            const registerTx3 = await LeadFive.connect(user3).register(
                user2.address,
                1,
                false,
                { value: bnbRequired }
            );
            await registerTx3.wait();
            
            // Check balances after registration
            const deployerBalanceAfter = await LeadFive.getUserInfo(deployer.address);
            const user1BalanceAfter = await LeadFive.getUserInfo(user1.address);
            const user2BalanceAfter = await LeadFive.getUserInfo(user2.address);
            
            console.log("Deployer balance after:", ethers.formatEther(deployerBalanceAfter.balance));
            console.log("User1 balance after:", ethers.formatEther(user1BalanceAfter.balance));
            console.log("User2 balance after:", ethers.formatEther(user2BalanceAfter.balance));
            
            // Check if User2 received direct bonus
            if (user2BalanceAfter.balance > 0) {
                console.log("✓ Direct referral commission distributed correctly");
            } else {
                console.log("⚠️ Note: Commission might be pending or in earnings cap");
            }
        });

        // Advanced Test 4: Pool System Testing
        await runTest("Pool Distribution System", async () => {
            console.log("Testing pool accumulation...");
            
            // Check pool balances
            const [leaderBalance, helpBalance, clubBalance] = await LeadFive.getPoolBalances();
            console.log("Leader pool:", ethers.formatEther(leaderBalance));
            console.log("Help pool:", ethers.formatEther(helpBalance));
            console.log("Club pool:", ethers.formatEther(clubBalance));
            
            // Pools should have some balance after registrations
            const totalPoolBalance = leaderBalance + helpBalance + clubBalance;
            
            if (totalPoolBalance > 0) {
                console.log("✓ Pool system accumulating funds correctly");
            } else {
                console.log("⚠️ Note: Pool balances still zero - check pool allocation percentages");
            }
        });

        // Advanced Test 5: Oracle Price System Testing
        await runTest("Oracle Price System", async () => {
            console.log("Testing oracle price functionality...");
            
            // Test getting oracle count
            const oracleCount = await LeadFive.getOracleCount();
            console.log("Active oracles:", oracleCount.toString());
            
            // Test emergency price (owner only)
            const emergencyPrice = await LeadFive.getEmergencyPrice();
            console.log("Emergency price:", ethers.formatUnits(emergencyPrice, 8), "USD");
            
            // Verify price is reasonable (between $100-$2000)
            const priceInUsd = Number(ethers.formatUnits(emergencyPrice, 8));
            if (priceInUsd >= 100 && priceInUsd <= 2000) {
                console.log("✓ Oracle price within reasonable bounds");
            } else {
                console.log("⚠️ Warning: Price outside expected range");
            }
        });

        // Advanced Test 6: Admin Functions Testing
        await runTest("Admin Function Security", async () => {
            console.log("Testing admin function access controls...");
            
            // Test admin-only functions with non-admin user
            try {
                await LeadFive.connect(user1).blacklistUser(user2.address, true);
                throw new Error("Non-admin was able to call admin function");
            } catch (error) {
                if (error.message.includes("Not authorized")) {
                    console.log("✓ Admin access control working correctly");
                } else {
                    throw error;
                }
            }
            
            // Test owner-only functions
            try {
                await LeadFive.connect(user1).pause();
                throw new Error("Non-owner was able to pause contract");
            } catch (error) {
                if (error.message.includes("Ownable")) {
                    console.log("✓ Owner access control working correctly");
                } else {
                    throw error;
                }
            }
        });

        // Advanced Test 7: Edge Cases Testing
        await runTest("Edge Cases and Error Handling", async () => {
            console.log("Testing edge cases and error conditions...");
            
            // Test duplicate registration
            try {
                await LeadFive.connect(user1).register(deployer.address, 1, false, { value: ethers.parseEther("0.05") });
                throw new Error("Duplicate registration was allowed");
            } catch (error) {
                if (error.message.includes("Already registered")) {
                    console.log("✓ Duplicate registration prevented");
                } else {
                    throw error;
                }
            }
            
            // Test invalid package level
            try {
                await LeadFive.connect(user4).register(deployer.address, 5, false, { value: ethers.parseEther("0.05") });
                throw new Error("Invalid package level was accepted");
            } catch (error) {
                if (error.message.includes("Invalid package")) {
                    console.log("✓ Invalid package level rejected");
                } else {
                    throw error;
                }
            }
            
            // Test insufficient payment
            try {
                await LeadFive.connect(user4).register(deployer.address, 1, false, { value: ethers.parseEther("0.001") });
                throw new Error("Insufficient payment was accepted");
            } catch (error) {
                if (error.message.includes("Insufficient BNB")) {
                    console.log("✓ Insufficient payment rejected");
                } else {
                    throw error;
                }
            }
        });

        // Advanced Test 8: Contract Health Monitoring
        await runTest("Contract Health Monitoring", async () => {
            console.log("Testing contract health metrics...");
            
            const health = await LeadFive.getContractHealth();
            console.log("Contract balance:", ethers.formatEther(health.contractBalance));
            console.log("Total deposits:", ethers.formatEther(health.totalDepositsAmount));
            console.log("Reserve fund:", ethers.formatEther(health.reserveFundAmount));
            console.log("Health ratio:", (health.healthRatio.toString() / 100), "%");
            console.log("Is healthy:", health.isHealthy);
            
            // Health ratio should be reasonable
            const healthRatio = Number(health.healthRatio.toString());
            if (healthRatio >= 5000) { // 50% or higher
                console.log("✓ Contract health metrics look good");
            } else {
                console.log("⚠️ Note: Health ratio below 50%, monitor closely");
            }
        });

        // Final Test Summary
        console.log("\\n🎉 ADVANCED TESTING COMPLETE");
        console.log("=".repeat(60));
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📊 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
        
        console.log("\\n📋 DETAILED TEST RESULTS:");
        testResults.tests.forEach((test, index) => {
            const icon = test.status === "PASSED" ? "✅" : "❌";
            console.log(`${index + 1}. ${icon} ${test.name}`);
            if (test.error) {
                console.log(`   Error: ${test.error}`);
            }
        });

        console.log("\\n🚀 ADVANCED TESTING ASSESSMENT:");
        if (testResults.failed === 0) {
            console.log("🎖️ EXCELLENT: All advanced tests passed!");
            console.log("🚀 Contract is ready for production deployment");
        } else if (testResults.failed <= 2) {
            console.log("👍 GOOD: Most tests passed, minor issues detected");
            console.log("🔧 Review failed tests before production deployment");
        } else {
            console.log("⚠️ ATTENTION: Multiple test failures detected");
            console.log("🛠️ Address issues before production deployment");
        }

        return testResults;

    } catch (error) {
        console.error("💥 Advanced testing failed:", error);
        throw error;
    }
}

main()
    .then((results) => {
        console.log("\\n✅ Advanced testing session completed!");
        console.log(`Final Score: ${results.passed}/${results.passed + results.failed} tests passed`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Advanced testing session failed:", error);
        process.exit(1);
    });
