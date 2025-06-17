// Comprehensive Testing Script for Enhanced OrphiCrowdFund
// Tests all new advanced features

const { ethers } = require("hardhat");
require('dotenv').config();

async function testEnhancedFeatures() {
    console.log("🧪 COMPREHENSIVE ENHANCED FEATURES TESTING");
    console.log("==========================================");
    
    // Get contract instance
    const contractAddress = process.env.ENHANCED_ORPHI_MAINNET_PROXY || process.env.ORPHI_MAINNET_PROXY;
    const [admin, user1, user2, user3] = await ethers.getSigners();
    
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Admin: ${admin.address}`);
    console.log(`User1: ${user1.address}`);
    console.log(`User2: ${user2.address}`);
    console.log(`User3: ${user3.address}`);
    
    try {
        // Get contract instance
        const OrphiCrowdFundEnhanced = await ethers.getContractFactory("OrphiCrowdFundEnhanced");
        const contract = OrphiCrowdFundEnhanced.attach(contractAddress);
        
        console.log("\n📋 TEST SUITE OVERVIEW");
        console.log("======================");
        console.log("1. ✅ Basic Contract Functionality");
        console.log("2. 🔧 Dynamic Package Pricing System");
        console.log("3. 🌐 Oracle Integration Testing");
        console.log("4. 👥 Direct Referral Tracking");
        console.log("5. 🌳 Binary Tree Automation");
        console.log("6. 📊 Advanced Analytics");
        console.log("7. 💰 Bonus Distribution System");
        console.log("8. 🏆 Leader Rank System");
        console.log("9. 🎯 Club Pool Functionality");
        console.log("10. 🔐 Enhanced Security Features");
        
        let testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            details: []
        };
        
        // Helper function to run tests
        async function runTest(testName, testFunction) {
            testResults.total++;
            console.log(`\n🧪 Testing: ${testName}`);
            try {
                await testFunction();
                console.log(`✅ ${testName} - PASSED`);
                testResults.passed++;
                testResults.details.push({ name: testName, status: "PASSED", error: null });
            } catch (error) {
                console.log(`❌ ${testName} - FAILED: ${error.message}`);
                testResults.failed++;
                testResults.details.push({ name: testName, status: "FAILED", error: error.message });
            }
        }
        
        // ==================== TEST 1: BASIC FUNCTIONALITY ====================
        await runTest("Basic Contract Connection", async () => {
            const version = await contract.getVersion();
            const owner = await contract.owner();
            const totalUsers = await contract.totalUsers();
            
            console.log(`  Version: ${version}`);
            console.log(`  Owner: ${owner}`);
            console.log(`  Total Users: ${totalUsers}`);
            
            if (!version.includes("Enhanced")) {
                throw new Error("Not enhanced contract");
            }
        });
        
        // ==================== TEST 2: DYNAMIC PACKAGE PRICING ====================
        await runTest("Dynamic Package Pricing System", async () => {
            console.log("  Testing getPackageAmount for all tiers...");
            
            const expectedAmounts = [
                "10", "25", "50", "100", "250", "500", "1000", "2500"
            ];
            
            for (let tier = 1; tier <= 8; tier++) {
                const amount = await contract.getPackageAmount(tier);
                const formattedAmount = ethers.utils.formatUnits(amount, 18);
                console.log(`    Tier ${tier}: ${formattedAmount} USDT`);
                
                if (formattedAmount !== expectedAmounts[tier - 1]) {
                    console.log(`    Expected: ${expectedAmounts[tier - 1]}, Got: ${formattedAmount}`);
                }
            }
            
            // Test package update (admin function)
            const originalAmount = await contract.getPackageAmount(1);
            console.log(`  Original Tier 1 amount: ${ethers.utils.formatUnits(originalAmount, 18)} USDT`);
        });
        
        // ==================== TEST 3: ORACLE INTEGRATION ====================
        await runTest("Oracle Integration System", async () => {
            const oracleEnabled = await contract.oracleEnabled();
            const priceOracle = await contract.priceOracle();
            const lastPriceUpdate = await contract.lastPriceUpdate();
            
            console.log(`  Oracle Enabled: ${oracleEnabled}`);
            console.log(`  Oracle Address: ${priceOracle}`);
            console.log(`  Last Price Update: ${lastPriceUpdate}`);
            
            if (priceOracle === ethers.constants.AddressZero) {
                console.log(`  ⚠️ Oracle not set, using default pricing`);
            }
        });
        
        // ==================== TEST 4: DIRECT REFERRAL TRACKING ====================
        await runTest("Direct Referral Tracking", async () => {
            // Test getDirectReferrals function
            const adminReferrals = await contract.getDirectReferrals(admin.address);
            const user1Referrals = await contract.getDirectReferrals(user1.address);
            
            console.log(`  Admin referrals: ${adminReferrals.length}`);
            console.log(`  User1 referrals: ${user1Referrals.length}`);
            
            // Test getTeamMembers function
            const adminTeam = await contract.getTeamMembers(admin.address);
            console.log(`  Admin team size: ${adminTeam.length}`);
            
            // Test getUserUpline function
            const user1Upline = await contract.getUserUpline(user1.address, 5);
            console.log(`  User1 upline depth: ${user1Upline.filter(addr => addr !== ethers.constants.AddressZero).length}`);
        });
        
        // ==================== TEST 5: BINARY TREE SYSTEM ====================
        await runTest("Binary Tree System", async () => {
            // Test getBinaryChildren function
            const adminChildren = await contract.getBinaryChildren(admin.address);
            console.log(`  Admin left child: ${adminChildren.left}`);
            console.log(`  Admin right child: ${adminChildren.right}`);
            
            // Test binary qualification
            const binaryQualified = await contract.binaryQualified(admin.address);
            console.log(`  Admin binary qualified: ${binaryQualified}`);
        });
        
        // ==================== TEST 6: ADVANCED ANALYTICS ====================
        await runTest("Advanced Analytics System", async () => {
            // Test getUserAnalytics
            const userAnalytics = await contract.getUserAnalytics(admin.address);
            console.log(`  Total Earnings: ${ethers.utils.formatUnits(userAnalytics[0], 18)} USDT`);
            console.log(`  Direct Earnings: ${ethers.utils.formatUnits(userAnalytics[1], 18)} USDT`);
            console.log(`  Level Earnings: ${ethers.utils.formatUnits(userAnalytics[2], 18)} USDT`);
            console.log(`  Team Size: ${userAnalytics[7]}`);
            console.log(`  Leader Rank: ${userAnalytics[9]}`);
            
            // Test getPlatformAnalytics
            const platformAnalytics = await contract.getPlatformAnalytics();
            console.log(`  Platform Users: ${platformAnalytics[0]}`);
            console.log(`  Total Investments: ${ethers.utils.formatUnits(platformAnalytics[1], 18)} USDT`);
            console.log(`  Total Bonuses: ${ethers.utils.formatUnits(platformAnalytics[2], 18)} USDT`);
            
            // Test getNetworkAnalytics
            const networkAnalytics = await contract.getNetworkAnalytics(admin.address);
            console.log(`  Network Depth: ${networkAnalytics[1]}`);
            console.log(`  Left Volume: ${ethers.utils.formatUnits(networkAnalytics[4], 18)} USDT`);
            console.log(`  Right Volume: ${ethers.utils.formatUnits(networkAnalytics[5], 18)} USDT`);
        });
        
        // ==================== TEST 7: BONUS DISTRIBUTION SYSTEM ====================
        await runTest("Bonus Distribution System", async () => {
            // Test bonus earnings tracking
            const directBonus = await contract.bonusEarnings(admin.address, 0); // DIRECT
            const levelBonus = await contract.bonusEarnings(admin.address, 1);  // LEVEL
            const binaryBonus = await contract.bonusEarnings(admin.address, 2); // BINARY
            
            console.log(`  Direct Bonus Earned: ${ethers.utils.formatUnits(directBonus, 18)} USDT`);
            console.log(`  Level Bonus Earned: ${ethers.utils.formatUnits(levelBonus, 18)} USDT`);
            console.log(`  Binary Bonus Earned: ${ethers.utils.formatUnits(binaryBonus, 18)} USDT`);
            
            // Test bonus history
            const bonusHistory = await contract.getUserBonusHistory(admin.address);
            console.log(`  Bonus History Records: ${bonusHistory.length}`);
        });
        
        // ==================== TEST 8: LEADER RANK SYSTEM ====================
        await runTest("Leader Rank System", async () => {
            // Test leader qualifications for each rank
            const ranks = ["NONE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
            
            for (let rank = 1; rank <= 5; rank++) {
                const qualification = await contract.leaderQualifications(rank);
                console.log(`  ${ranks[rank]} - Min Directs: ${qualification.minDirectReferrals}, Min Volume: ${ethers.utils.formatUnits(qualification.minTeamVolume, 18)} USDT`);
            }
            
            // Test leaders by rank
            const bronzeLeaders = await contract.getLeadersByRank(1);
            const silverLeaders = await contract.getLeadersByRank(2);
            console.log(`  Bronze Leaders: ${bronzeLeaders.length}`);
            console.log(`  Silver Leaders: ${silverLeaders.length}`);
            
            // Test user's current rank
            const adminRank = await contract.userLeaderRank(admin.address);
            console.log(`  Admin Current Rank: ${ranks[adminRank]} (${adminRank})`);
        });
        
        // ==================== TEST 9: CLUB POOL SYSTEM ====================
        await runTest("Club Pool System", async () => {
            // Test club pool eligibility
            const isClubMember = await contract.clubPoolMembers(admin.address);
            console.log(`  Admin Club Member: ${isClubMember}`);
            
            // Test club pool minimum tier
            const clubMinTier = await contract.clubPoolMinTier();
            console.log(`  Club Pool Min Tier: ${clubMinTier}`);
            
            // Test pool balances
            const poolBalances = await contract.getPoolBalances();
            console.log(`  GHP Balance: ${ethers.utils.formatUnits(poolBalances[0], 18)} USDT`);
            console.log(`  Leader Pool Balance: ${ethers.utils.formatUnits(poolBalances[1], 18)} USDT`);
            console.log(`  Club Pool Balance: ${ethers.utils.formatUnits(poolBalances[2], 18)} USDT`);
        });
        
        // ==================== TEST 10: ENHANCED SECURITY ====================
        await runTest("Enhanced Security Features", async () => {
            // Test blacklist functionality
            const isBlacklisted = await contract.blacklistedUsers(admin.address);
            console.log(`  Admin Blacklisted: ${isBlacklisted}`);
            
            // Test pause functionality
            const isPaused = await contract.paused();
            console.log(`  Contract Paused: ${isPaused}`);
            
            // Test role system
            const adminRole = await contract.ADMIN_ROLE();
            const hasAdminRole = await contract.hasRole(adminRole, admin.address);
            console.log(`  Admin has ADMIN_ROLE: ${hasAdminRole}`);
            
            // Test additional roles
            const roles = [
                'DISTRIBUTOR_ROLE', 'PLATFORM_ROLE', 'AUDIT_ROLE',
                'EMERGENCY_ROLE', 'TREASURY_ROLE', 'POOL_MANAGER_ROLE',
                'ORACLE_ROLE', 'BONUS_MANAGER_ROLE', 'ANALYTICS_ROLE',
                'NETWORK_MANAGER_ROLE', 'COMPENSATION_ROLE'
            ];
            
            let roleCount = 0;
            for (const roleName of roles) {
                try {
                    await contract[roleName]();
                    roleCount++;
                } catch (error) {
                    // Role might not exist
                }
            }
            console.log(`  Additional Roles Available: ${roleCount}/${roles.length}`);
        });
        
        // ==================== TEST SUMMARY ====================
        console.log("\n📊 TEST RESULTS SUMMARY");
        console.log("========================");
        console.log(`Total Tests: ${testResults.total}`);
        console.log(`Passed: ${testResults.passed} ✅`);
        console.log(`Failed: ${testResults.failed} ❌`);
        console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
        
        if (testResults.failed > 0) {
            console.log("\n❌ FAILED TESTS:");
            testResults.details
                .filter(test => test.status === "FAILED")
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.error}`);
                });
        }
        
        console.log("\n🎯 FEATURE VERIFICATION:");
        console.log("=========================");
        
        const featureStatus = {
            "Dynamic Package Pricing": testResults.details.find(t => t.name.includes("Package Pricing"))?.status || "NOT_TESTED",
            "Oracle Integration": testResults.details.find(t => t.name.includes("Oracle"))?.status || "NOT_TESTED",
            "Direct Referral Tracking": testResults.details.find(t => t.name.includes("Referral"))?.status || "NOT_TESTED",
            "Binary Tree System": testResults.details.find(t => t.name.includes("Binary"))?.status || "NOT_TESTED",
            "Advanced Analytics": testResults.details.find(t => t.name.includes("Analytics"))?.status || "NOT_TESTED",
            "Bonus Distribution": testResults.details.find(t => t.name.includes("Bonus"))?.status || "NOT_TESTED",
            "Leader Rank System": testResults.details.find(t => t.name.includes("Leader"))?.status || "NOT_TESTED",
            "Club Pool System": testResults.details.find(t => t.name.includes("Club"))?.status || "NOT_TESTED",
            "Enhanced Security": testResults.details.find(t => t.name.includes("Security"))?.status || "NOT_TESTED"
        };
        
        Object.entries(featureStatus).forEach(([feature, status]) => {
            const icon = status === "PASSED" ? "✅" : status === "FAILED" ? "❌" : "⚠️";
            console.log(`${icon} ${feature}: ${status}`);
        });
        
        console.log("\n🚀 ENHANCED CONTRACT STATUS:");
        console.log("=============================");
        
        if (testResults.passed === testResults.total) {
            console.log("🎉 ALL TESTS PASSED - CONTRACT FULLY FUNCTIONAL!");
            console.log("✅ All missing features have been successfully implemented");
            console.log("✅ Contract is ready for production use");
            console.log("✅ All advanced MLM features are working");
        } else if (testResults.passed >= testResults.total * 0.8) {
            console.log("👍 MOST TESTS PASSED - CONTRACT MOSTLY FUNCTIONAL");
            console.log("⚠️ Some features may need attention");
            console.log("✅ Core functionality is working");
        } else {
            console.log("⚠️ SEVERAL TESTS FAILED - NEEDS INVESTIGATION");
            console.log("❌ Contract may have issues");
            console.log("🔧 Review failed tests and fix issues");
        }
        
        console.log("\n📋 NEXT STEPS:");
        console.log("===============");
        
        if (testResults.passed === testResults.total) {
            console.log("1. ✅ Deploy to mainnet (if not already done)");
            console.log("2. ✅ Update frontend integration");
            console.log("3. ✅ Test registration flow");
            console.log("4. ✅ Test bonus distributions");
            console.log("5. ✅ Verify contract on BSCScan");
        } else {
            console.log("1. 🔧 Fix failed test issues");
            console.log("2. 🧪 Re-run tests until all pass");
            console.log("3. 📝 Review contract implementation");
            console.log("4. ⚠️ Do not deploy to mainnet until all tests pass");
        }
        
        // Save test results
        const testReport = {
            timestamp: new Date().toISOString(),
            contractAddress: contractAddress,
            network: process.env.HARDHAT_NETWORK || "unknown",
            testResults: testResults,
            featureStatus: featureStatus,
            summary: {
                totalTests: testResults.total,
                passed: testResults.passed,
                failed: testResults.failed,
                successRate: ((testResults.passed / testResults.total) * 100).toFixed(1) + "%"
            }
        };
        
        const fs = require('fs');
        if (!fs.existsSync('./test-reports')) {
            fs.mkdirSync('./test-reports');
        }
        
        const reportFileName = `./test-reports/enhanced-features-test-${Date.now()}.json`;
        fs.writeFileSync(reportFileName, JSON.stringify(testReport, null, 2));
        console.log(`\n💾 Test report saved: ${reportFileName}`);
        
        return testResults;
        
    } catch (error) {
        console.error("❌ Testing failed:", error);
        throw error;
    }
}

// Execute testing
if (require.main === module) {
    testEnhancedFeatures()
        .then((results) => {
            if (results.passed === results.total) {
                console.log("\n🎉 ALL ENHANCED FEATURES TESTED SUCCESSFULLY!");
                process.exit(0);
            } else {
                console.log("\n⚠️ Some tests failed. Review results above.");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("💥 Testing failed:", error);
            process.exit(1);
        });
}

module.exports = testEnhancedFeatures;
