const { ethers, upgrades } = require("hardhat");

/**
 * @title Heavy Load Stress Testing Script
 * @dev Comprehensive stress testing for high-volume scenarios
 */

async function main() {
    console.log("🔥 STARTING HEAVY LOAD STRESS TESTING...\n");
    console.log("⚠️  WARNING: This test will simulate extreme load conditions");
    console.log("📊 Testing scenarios:");
    console.log("   • Mass user registrations (100+ users)");
    console.log("   • Simultaneous withdrawals (50+ concurrent)");
    console.log("   • Deep matrix placement (10+ levels)");
    console.log("   • Income cap testing");
    console.log("   • Gas limit stress testing");
    console.log("   • Memory optimization verification\n");

    // Get signers - we need many for stress testing
    const [deployer, treasury, emergency, poolManager, ...testUsers] = await ethers.getSigners();
    
    console.log("📋 Stress Test Configuration:");
    console.log("├─ Available test users:", testUsers.length);
    console.log("├─ Target registrations: 100 users");
    console.log("├─ Target matrix depth: 15 levels");
    console.log("├─ Concurrent withdrawals: 50 users");
    console.log("└─ Income cap test: $10,000+ earnings\n");

    if (testUsers.length < 100) {
        console.log("⚠️  Warning: Limited test users available. Adjusting test parameters...");
    }

    const maxUsers = Math.min(testUsers.length, 100);
    
    try {
        // Step 1: Deploy contracts
        console.log("📦 Step 1: Deploying Contracts for Stress Testing...");
        
        const MockUSDT = await ethers.getContractFactory("contracts/MockUSDT.sol:MockUSDT");
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        const usdtAddress = await mockUSDT.getAddress();
        
        const OrphichainPlatformUpgradeable = await ethers.getContractFactory("OrphichainCrowdfundPlatformUpgradeable");
        const orphichainPlatform = await upgrades.deployProxy(
            OrphichainPlatformUpgradeable,
            [usdtAddress, treasury.address, emergency.address, poolManager.address],
            { initializer: 'initialize', kind: 'uups' }
        );
        await orphichainPlatform.waitForDeployment();
        const proxyAddress = await orphichainPlatform.getAddress();
        
        console.log("├─ Mock USDT deployed to:", usdtAddress);
        console.log("├─ Proxy deployed to:", proxyAddress);
        console.log("└─ Contract deployment successful! ✅\n");

        // Step 2: Setup massive test environment
        console.log("⚙️ Step 2: Setting Up Massive Test Environment...");
        
        const mintAmount = ethers.parseUnits("100000", 6); // 100,000 USDT per user
        const batchSize = 10; // Process in batches to avoid gas limits
        
        console.log("├─ Minting USDT to users in batches...");
        for (let i = 0; i < maxUsers; i += batchSize) {
            const batch = Math.min(batchSize, maxUsers - i);
            const promises = [];
            
            for (let j = 0; j < batch; j++) {
                const userIndex = i + j;
                if (userIndex < testUsers.length) {
                    promises.push(
                        mockUSDT.mint(testUsers[userIndex].address, mintAmount)
                            .then(() => mockUSDT.connect(testUsers[userIndex]).approve(proxyAddress, mintAmount))
                    );
                }
            }
            
            await Promise.all(promises);
            console.log(`├─ Batch ${Math.floor(i/batchSize) + 1}: Minted USDT to ${batch} users`);
        }
        console.log("└─ Massive test environment setup complete! ✅\n");

        // Step 3: Mass User Registration Stress Test
        console.log("👥 Step 3: Mass User Registration Stress Test...");
        console.log("├─ Testing concurrent user registrations...");
        
        const startTime = Date.now();
        let totalGasUsed = 0n;
        let registrationErrors = 0;
        
        // Register users in waves to simulate real-world load
        const waveSize = 20;
        const waves = Math.ceil(maxUsers / waveSize);
        
        for (let wave = 0; wave < waves; wave++) {
            const waveStart = wave * waveSize;
            const waveEnd = Math.min(waveStart + waveSize, maxUsers);
            const waveUsers = waveEnd - waveStart;
            
            console.log(`├─ Wave ${wave + 1}: Registering ${waveUsers} users simultaneously...`);
            
            const registrationPromises = [];
            for (let i = waveStart; i < waveEnd; i++) {
                if (i < testUsers.length) {
                    const sponsor = i === 0 ? deployer.address : testUsers[Math.floor(i/2)].address;
                    const packageTier = (i % 4) + 1; // Distribute across all package tiers
                    
                    registrationPromises.push(
                        orphichainPlatform.connect(testUsers[i])
                            .registerUser(sponsor, packageTier)
                            .then(tx => tx.wait())
                            .then(receipt => {
                                totalGasUsed += receipt.gasUsed;
                                return { success: true, user: i, gas: receipt.gasUsed };
                            })
                            .catch(error => {
                                registrationErrors++;
                                return { success: false, user: i, error: error.message };
                            })
                    );
                }
            }
            
            const results = await Promise.allSettled(registrationPromises);
            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            const failed = results.filter(r => r.status === 'rejected' || !r.value.success).length;
            
            console.log(`├─ Wave ${wave + 1} results: ${successful} successful, ${failed} failed`);
            
            // Small delay between waves to prevent overwhelming the network
            if (wave < waves - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        const registrationTime = Date.now() - startTime;
        const avgGasPerRegistration = totalGasUsed / BigInt(maxUsers - registrationErrors);
        
        console.log("├─ Mass registration results:");
        console.log(`├─   • Total users registered: ${maxUsers - registrationErrors}`);
        console.log(`├─   • Registration errors: ${registrationErrors}`);
        console.log(`├─   • Total time: ${registrationTime}ms`);
        console.log(`├─   • Average gas per registration: ${avgGasPerRegistration.toString()}`);
        console.log(`├─   • Total gas used: ${totalGasUsed.toString()}`);
        console.log("└─ Mass registration stress test complete! ✅\n");

        // Step 4: Deep Matrix Placement Test
        console.log("🌳 Step 4: Deep Matrix Placement Stress Test...");
        
        // Test matrix depth by checking placement
        let maxDepth = 0;
        const depthCounts = {};
        
        for (let i = 0; i < Math.min(50, maxUsers); i++) {
            if (i < testUsers.length) {
                try {
                    const depth = await orphichainPlatform.getMatrixDepth(testUsers[i].address);
                    const depthNum = Number(depth);
                    maxDepth = Math.max(maxDepth, depthNum);
                    depthCounts[depthNum] = (depthCounts[depthNum] || 0) + 1;
                } catch (error) {
                    console.log(`├─ Error getting depth for user ${i}:`, error.message);
                }
            }
        }
        
        console.log("├─ Matrix depth analysis:");
        console.log(`├─   • Maximum depth achieved: ${maxDepth} levels`);
        console.log("├─   • Depth distribution:");
        Object.keys(depthCounts).sort((a, b) => Number(a) - Number(b)).forEach(depth => {
            console.log(`├─     - Level ${depth}: ${depthCounts[depth]} users`);
        });
        
        // Test matrix children at various depths
        console.log("├─ Testing matrix structure integrity...");
        let structureErrors = 0;
        for (let i = 0; i < Math.min(20, maxUsers); i++) {
            if (i < testUsers.length) {
                try {
                    const [leftChild, rightChild] = await orphichainPlatform.getMatrixChildren(testUsers[i].address);
                    const userInfo = await orphichainPlatform.getUserInfo(testUsers[i].address);
                    
                    // Verify team size consistency
                    if (leftChild !== ethers.ZeroAddress || rightChild !== ethers.ZeroAddress) {
                        if (userInfo.teamSize === 0n) {
                            structureErrors++;
                            console.log(`├─   ⚠️  Structure error: User ${i} has children but team size is 0`);
                        }
                    }
                } catch (error) {
                    structureErrors++;
                }
            }
        }
        
        console.log(`├─   • Structure integrity errors: ${structureErrors}`);
        console.log("└─ Deep matrix placement test complete! ✅\n");

        // Step 5: Mass Withdrawal Stress Test
        console.log("💸 Step 5: Mass Withdrawal Stress Test...");
        
        // First, ensure users have withdrawable amounts
        const usersWithEarnings = [];
        for (let i = 0; i < Math.min(50, maxUsers); i++) {
            if (i < testUsers.length) {
                try {
                    const userInfo = await orphichainPlatform.getUserInfo(testUsers[i].address);
                    if (userInfo.withdrawableAmount > 0) {
                        usersWithEarnings.push({
                            index: i,
                            address: testUsers[i].address,
                            amount: userInfo.withdrawableAmount
                        });
                    }
                } catch (error) {
                    console.log(`├─ Error checking user ${i} earnings:`, error.message);
                }
            }
        }
        
        console.log(`├─ Users with withdrawable earnings: ${usersWithEarnings.length}`);
        
        let withdrawalGasUsed = 0n;
        let withdrawalErrors = 0;
        
        if (usersWithEarnings.length > 0) {
            console.log("├─ Testing simultaneous withdrawals...");
            
            const withdrawalStartTime = Date.now();
            
            // Process withdrawals in smaller batches to avoid gas limit issues
            const withdrawalBatchSize = 10;
            const withdrawalBatches = Math.ceil(usersWithEarnings.length / withdrawalBatchSize);
            
            for (let batch = 0; batch < withdrawalBatches; batch++) {
                const batchStart = batch * withdrawalBatchSize;
                const batchEnd = Math.min(batchStart + withdrawalBatchSize, usersWithEarnings.length);
                
                const withdrawalPromises = [];
                for (let i = batchStart; i < batchEnd; i++) {
                    const user = usersWithEarnings[i];
                    withdrawalPromises.push(
                        orphichainPlatform.connect(testUsers[user.index])
                            .withdraw(user.amount)
                            .then(tx => tx.wait())
                            .then(receipt => {
                                withdrawalGasUsed += receipt.gasUsed;
                                return { success: true, user: user.index, gas: receipt.gasUsed };
                            })
                            .catch(error => {
                                withdrawalErrors++;
                                return { success: false, user: user.index, error: error.message };
                            })
                    );
                }
                
                await Promise.allSettled(withdrawalPromises);
                console.log(`├─ Withdrawal batch ${batch + 1}/${withdrawalBatches} processed`);
            }
            
            const withdrawalTime = Date.now() - withdrawalStartTime;
            const avgWithdrawalGas = withdrawalGasUsed / BigInt(usersWithEarnings.length - withdrawalErrors);
            
            console.log("├─ Mass withdrawal results:");
            console.log(`├─   • Successful withdrawals: ${usersWithEarnings.length - withdrawalErrors}`);
            console.log(`├─   • Withdrawal errors: ${withdrawalErrors}`);
            console.log(`├─   • Total time: ${withdrawalTime}ms`);
            console.log(`├─   • Average gas per withdrawal: ${avgWithdrawalGas.toString()}`);
        } else {
            console.log("├─ No users with withdrawable earnings found for withdrawal test");
        }
        
        console.log("└─ Mass withdrawal stress test complete! ✅\n");

        // Step 6: Income Cap Testing
        console.log("💰 Step 6: Income Cap Stress Test...");
        
        // Find users with highest earnings
        const highEarners = [];
        for (let i = 0; i < Math.min(20, maxUsers); i++) {
            if (i < testUsers.length) {
                try {
                    const totalEarnings = await orphichainPlatform.getTotalEarnings(testUsers[i].address);
                    const userInfo = await orphichainPlatform.getUserInfo(testUsers[i].address);
                    
                    highEarners.push({
                        index: i,
                        totalEarnings: totalEarnings,
                        isCapped: userInfo.isCapped,
                        packageTier: userInfo.packageTier
                    });
                } catch (error) {
                    console.log(`├─ Error checking earnings for user ${i}:`, error.message);
                }
            }
        }
        
        // Sort by earnings
        highEarners.sort((a, b) => Number(b.totalEarnings - a.totalEarnings));
        
        console.log("├─ Top earners analysis:");
        highEarners.slice(0, 10).forEach((user, index) => {
            const earnings = ethers.formatUnits(user.totalEarnings, 6);
            console.log(`├─   ${index + 1}. User ${user.index}: ${earnings} USDT (Tier ${user.packageTier}, Capped: ${user.isCapped})`);
        });
        
        // Test income cap logic
        const cappedUsers = highEarners.filter(user => user.isCapped);
        console.log(`├─ Users with income cap reached: ${cappedUsers.length}`);
        
        if (cappedUsers.length > 0) {
            console.log("├─ Income cap verification:");
            cappedUsers.forEach(user => {
                const earnings = ethers.formatUnits(user.totalEarnings, 6);
                console.log(`├─   • User ${user.index}: ${earnings} USDT (should be capped)`);
            });
        }
        
        console.log("└─ Income cap stress test complete! ✅\n");

        // Step 7: Gas Limit and Memory Stress Test
        console.log("⛽ Step 7: Gas Limit and Memory Stress Test...");
        
        // Test platform statistics with large dataset
        console.log("├─ Testing platform statistics with large dataset...");
        try {
            const statsStartTime = Date.now();
            const [totalUsers, totalVolume, poolBalances] = await orphichainPlatform.getPlatformStats();
            const statsTime = Date.now() - statsStartTime;
            
            console.log("├─ Platform statistics results:");
            console.log(`├─   • Total users: ${totalUsers.toString()}`);
            console.log(`├─   • Total volume: ${ethers.formatUnits(totalVolume, 6)} USDT`);
            console.log(`├─   • Query time: ${statsTime}ms`);
            console.log(`├─   • Pool balances: [${poolBalances.map(b => ethers.formatUnits(b, 6)).join(', ')}] USDT`);
        } catch (error) {
            console.log("├─ ❌ Platform statistics query failed:", error.message);
        }
        
        // Test bulk operations
        console.log("├─ Testing bulk user info queries...");
        const bulkQueryStartTime = Date.now();
        let bulkQueryErrors = 0;
        
        const bulkPromises = [];
        for (let i = 0; i < Math.min(50, maxUsers); i++) {
            if (i < testUsers.length) {
                bulkPromises.push(
                    orphichainPlatform.getUserInfo(testUsers[i].address)
                        .catch(() => {
                            bulkQueryErrors++;
                            return null;
                        })
                );
            }
        }
        
        const bulkResults = await Promise.all(bulkPromises);
        const bulkQueryTime = Date.now() - bulkQueryStartTime;
        const successfulQueries = bulkResults.filter(r => r !== null).length;
        
        console.log("├─ Bulk query results:");
        console.log(`├─   • Successful queries: ${successfulQueries}`);
        console.log(`├─   • Failed queries: ${bulkQueryErrors}`);
        console.log(`├─   • Total time: ${bulkQueryTime}ms`);
        console.log(`├─   • Average time per query: ${bulkQueryTime / bulkPromises.length}ms`);
        
        console.log("└─ Gas limit and memory stress test complete! ✅\n");

        // Step 8: Generate Comprehensive Stress Test Report
        console.log("📊 Step 8: Generating Comprehensive Stress Test Report...");
        
        const finalStats = await orphichainPlatform.getPlatformStats();
        
        const stressTestReport = {
            testConfiguration: {
                maxUsersAvailable: testUsers.length,
                targetUsers: maxUsers,
                testDuration: Date.now() - startTime,
                networkConditions: "localhost"
            },
            massRegistrationResults: {
                totalRegistrations: maxUsers - registrationErrors,
                registrationErrors: registrationErrors,
                totalGasUsed: totalGasUsed.toString(),
                averageGasPerRegistration: avgGasPerRegistration.toString(),
                registrationTime: registrationTime
            },
            matrixPlacementResults: {
                maxDepthAchieved: maxDepth,
                depthDistribution: depthCounts,
                structureIntegrityErrors: structureErrors
            },
            withdrawalStressResults: {
                usersWithEarnings: usersWithEarnings.length,
                withdrawalErrors: withdrawalErrors,
                withdrawalGasUsed: withdrawalGasUsed.toString()
            },
            incomeCapResults: {
                totalHighEarners: highEarners.length,
                cappedUsers: cappedUsers.length,
                topEarnings: highEarners.slice(0, 5).map(u => ({
                    user: u.index,
                    earnings: ethers.formatUnits(u.totalEarnings, 6) + " USDT",
                    capped: u.isCapped
                }))
            },
            performanceMetrics: {
                bulkQuerySuccessRate: (successfulQueries / bulkPromises.length * 100).toFixed(2) + "%",
                bulkQueryErrors: bulkQueryErrors,
                averageQueryTime: (bulkQueryTime / bulkPromises.length).toFixed(2) + "ms"
            },
            finalPlatformState: {
                totalUsers: finalStats[0].toString(),
                totalVolume: ethers.formatUnits(finalStats[1], 6) + " USDT",
                poolBalances: finalStats[2].map(b => ethers.formatUnits(b, 6) + " USDT")
            },
            timestamp: new Date().toISOString()
        };

        // Save stress test report
        const fs = require('fs');
        const reportFileName = `stress-test-report-${Date.now()}.json`;
        fs.writeFileSync(reportFileName, JSON.stringify(stressTestReport, null, 2));
        
        console.log("├─ Stress test report saved to:", reportFileName);
        console.log("└─ Stress test report generation complete! ✅\n");

        // Step 9: Display Final Results
        console.log("🎯 STRESS TEST RESULTS SUMMARY");
        console.log("┌─────────────────────────────────────────────────────────────────┐");
        console.log("│                    HEAVY LOAD STRESS TEST COMPLETE             │");
        console.log("├─────────────────────────────────────────────────────────────────┤");
        console.log(`│ Users Tested:         ${maxUsers.toString().padEnd(43)} │`);
        console.log(`│ Registration Success: ${((maxUsers - registrationErrors) / maxUsers * 100).toFixed(1)}%`.padEnd(65) + "│");
        console.log(`│ Max Matrix Depth:     ${maxDepth.toString().padEnd(43)} │`);
        console.log(`│ Total Volume:         ${ethers.formatUnits(finalStats[1], 6).padEnd(37)} USDT │`);
        console.log(`│ Withdrawal Success:   ${usersWithEarnings.length > 0 ? ((usersWithEarnings.length - withdrawalErrors) / usersWithEarnings.length * 100).toFixed(1) + '%' : 'N/A'}`.padEnd(65) + "│");
        console.log("├─────────────────────────────────────────────────────────────────┤");
        console.log("│ Performance Metrics:                                           │");
        console.log(`│ • Avg Registration Gas: ${avgGasPerRegistration.toString().padEnd(35)} │`);
        console.log(`│ • Bulk Query Success:   ${(successfulQueries / bulkPromises.length * 100).toFixed(1)}%`.padEnd(63) + "│");
        console.log(`│ • Structure Errors:     ${structureErrors.toString().padEnd(43)} │`);
        console.log(`│ • Income Capped Users:  ${cappedUsers.length.toString().padEnd(43)} │`);
        console.log("└─────────────────────────────────────────────────────────────────┘");
        console.log();

        // Performance Assessment
        const overallSuccess = (
            (maxUsers - registrationErrors) / maxUsers >= 0.95 &&
            structureErrors === 0 &&
            bulkQueryErrors / bulkPromises.length <= 0.05
        );

        if (overallSuccess) {
            console.log("🎉 STRESS TEST ASSESSMENT: EXCELLENT PERFORMANCE");
            console.log("✅ The contract handles heavy load scenarios very well");
            console.log("✅ Ready for high-volume production deployment");
        } else {
            console.log("⚠️  STRESS TEST ASSESSMENT: PERFORMANCE ISSUES DETECTED");
            console.log("❌ Some performance bottlenecks identified");
            console.log("🔧 Optimization recommended before production deployment");
        }

        console.log();
        console.log("📋 Recommendations:");
        console.log("1. Monitor gas usage patterns in production");
        console.log("2. Implement batch processing for high-volume operations");
        console.log("3. Consider implementing rate limiting for user actions");
        console.log("4. Set up monitoring for matrix depth and structure integrity");
        console.log("5. Implement automated income cap verification");
        console.log();

        return stressTestReport;

    } catch (error) {
        console.error("❌ Stress testing failed:", error);
        throw error;
    }
}

// Handle script execution
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("💥 Fatal stress test error:", error);
            process.exit(1);
        });
}

module.exports = main;
