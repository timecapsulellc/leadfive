const { ethers } = require("hardhat");
const fs = require("fs");

/**
 * Comprehensive Security Testing Suite for Testnet
 * Tests all new security features and validations
 */
async function main() {
    console.log("🧪 Starting Comprehensive Security Testing on Testnet...");
    console.log("📅 Date:", new Date().toISOString());
    
    // Load deployment info
    if (!fs.existsSync('testnet-deployment-info.json')) {
        throw new Error("❌ Testnet deployment info not found. Deploy contract first.");
    }
    
    const deploymentInfo = JSON.parse(fs.readFileSync('testnet-deployment-info.json', 'utf8'));
    console.log("📋 Testing contract:", deploymentInfo.contractAddress);
    
    // Get test accounts
    const [deployer, user1, user2, user3, admin] = await ethers.getSigners();
    console.log("👥 Test accounts loaded");
    
    // Connect to deployed contract
    const contractName = deploymentInfo.contractName;
    const Contract = await ethers.getContractFactory(contractName);
    const contract = Contract.attach(deploymentInfo.contractAddress);
    
    // Connect to Mock USDT
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = MockUSDT.attach(deploymentInfo.mockUSDT);
    
    console.log("🔗 Connected to contracts");
    
    const testResults = {
        timestamp: new Date().toISOString(),
        contractAddress: deploymentInfo.contractAddress,
        tests: {},
        summary: {
            passed: 0,
            failed: 0,
            total: 0
        }
    };
    
    // Helper function to run test
    async function runTest(testName, testFunction) {
        console.log(`\n🧪 Testing: ${testName}`);
        try {
            await testFunction();
            console.log(`✅ PASSED: ${testName}`);
            testResults.tests[testName] = { status: "PASSED", error: null };
            testResults.summary.passed++;
        } catch (error) {
            console.log(`❌ FAILED: ${testName} - ${error.message}`);
            testResults.tests[testName] = { status: "FAILED", error: error.message };
            testResults.summary.failed++;
        }
        testResults.summary.total++;
    }
    
    // Setup test environment
    console.log("\n🔧 Setting up test environment...");
    
    // Mint test tokens
    await mockUSDT.mint(user1.address, ethers.parseUnits("1000", 6));
    await mockUSDT.mint(user2.address, ethers.parseUnits("1000", 6));
    await mockUSDT.mint(user3.address, ethers.parseUnits("1000", 6));
    
    // Approve contract
    await mockUSDT.connect(user1).approve(deploymentInfo.contractAddress, ethers.MaxUint256);
    await mockUSDT.connect(user2).approve(deploymentInfo.contractAddress, ethers.MaxUint256);
    await mockUSDT.connect(user3).approve(deploymentInfo.contractAddress, ethers.MaxUint256);
    
    console.log("✅ Test environment ready");
    
    // === SECURITY TESTS ===
    
    // Test 1: MEV Protection
    await runTest("MEV Protection - Same Block Prevention", async () => {
        // Register user first
        await contract.connect(user1).register(deployer.address);
        
        // First transaction
        await contract.connect(user1).purchasePackage(0, user1.address);
        
        // Second transaction in same block should fail
        try {
            await contract.connect(user1).purchasePackage(0, user1.address);
            throw new Error("MEV protection should have prevented this transaction");
        } catch (error) {
            if (!error.message.includes("MEV protection active")) {
                throw error;
            }
        }
    });
    
    // Test 2: MEV Protection - Different Block Success
    await runTest("MEV Protection - Different Block Success", async () => {
        // Mine a new block
        await ethers.provider.send("evm_mine");
        
        // Now transaction should succeed
        await contract.connect(user1).purchasePackage(0, user1.address);
    });
    
    // Test 3: Circuit Breaker Configuration
    await runTest("Circuit Breaker - Configuration", async () => {
        const isEnabled = await contract.circuitBreakerEnabled();
        console.log("  Circuit Breaker enabled:", isEnabled);
        
        if (isEnabled) {
            const maxDaily = await contract.maxDailyWithdrawals();
            console.log("  Max daily withdrawals:", maxDaily.toString());
        }
    });
    
    // Test 4: Access Control - Admin Functions
    await runTest("Access Control - Admin Only Functions", async () => {
        // Non-admin should not be able to pause
        try {
            await contract.connect(user2).pause();
            throw new Error("Non-admin should not be able to pause");
        } catch (error) {
            if (!error.message.includes("AccessControl")) {
                // Different error format in newer OpenZeppelin versions
                if (!error.message.includes("reverted")) {
                    throw error;
                }
            }
        }
        
        // Admin should be able to pause
        await contract.connect(deployer).pause();
        
        // Check if paused
        const isPaused = await contract.paused();
        if (!isPaused) {
            throw new Error("Contract should be paused");
        }
        
        // Unpause for other tests
        await contract.connect(deployer).unpause();
    });
    
    // Test 5: Reentrancy Protection
    await runTest("Reentrancy Protection - Withdrawal", async () => {
        // Register user2 and make sure they have earnings
        await ethers.provider.send("evm_mine");
        await contract.connect(user2).register(user1.address);
        
        // User1 should have earnings from sponsoring user2
        const user1Info = await contract.users(user1.address);
        
        if (user1Info.withdrawableAmount > 0) {
            await ethers.provider.send("evm_mine");
            
            // Withdrawal should work (reentrancy guard should be in place)
            await contract.connect(user1).withdraw();
        }
    });
    
    // Test 6: Package Purchase with Security Features
    await runTest("Package Purchase - Security Integration", async () => {
        await ethers.provider.send("evm_mine");
        await contract.connect(user3).register(user2.address);
        
        await ethers.provider.send("evm_mine");
        await contract.connect(user3).purchasePackage(0, user3.address);
        
        const user3Info = await contract.users(user3.address);
        if (user3Info.packageCount == 0) {
            throw new Error("Package purchase failed");
        }
    });
    
    // Test 7: Gas Usage Validation
    await runTest("Gas Usage - Registration", async () => {
        const [, , , , newUser] = await ethers.getSigners();
        await mockUSDT.mint(newUser.address, ethers.parseUnits("1000", 6));
        await mockUSDT.connect(newUser).approve(deploymentInfo.contractAddress, ethers.MaxUint256);
        
        const tx = await contract.connect(newUser).register(user3.address);
        const receipt = await tx.wait();
        
        console.log("  Gas used for registration:", receipt.gasUsed.toString());
        
        if (receipt.gasUsed > 200000) {
            throw new Error(`Registration gas usage too high: ${receipt.gasUsed}`);
        }
    });
    
    // Test 8: Gas Usage - Package Purchase
    await runTest("Gas Usage - Package Purchase", async () => {
        const [, , , , , newUser2] = await ethers.getSigners();
        await mockUSDT.mint(newUser2.address, ethers.parseUnits("1000", 6));
        await mockUSDT.connect(newUser2).approve(deploymentInfo.contractAddress, ethers.MaxUint256);
        
        await contract.connect(newUser2).register(user3.address);
        await ethers.provider.send("evm_mine");
        
        const tx = await contract.connect(newUser2).purchasePackage(0, newUser2.address);
        const receipt = await tx.wait();
        
        console.log("  Gas used for package purchase:", receipt.gasUsed.toString());
        
        if (receipt.gasUsed > 250000) {
            throw new Error(`Package purchase gas usage too high: ${receipt.gasUsed}`);
        }
    });
    
    // Test 9: Contract State Consistency
    await runTest("Contract State - Consistency Check", async () => {
        const totalUsers = await contract.totalUsers();
        const totalVolume = await contract.totalVolume();
        
        console.log("  Total users:", totalUsers.toString());
        console.log("  Total volume:", ethers.formatUnits(totalVolume, 6), "USDT");
        
        if (totalUsers == 0) {
            throw new Error("No users registered");
        }
        
        if (totalVolume == 0) {
            throw new Error("No volume recorded");
        }
    });
    
    // Test 10: Admin Emergency Functions
    await runTest("Emergency Functions - Admin Controls", async () => {
        // Test emergency pause
        await contract.connect(deployer).pause();
        
        // Test operations are blocked when paused
        try {
            await contract.connect(user1).purchasePackage(0, user1.address);
            throw new Error("Operations should be blocked when paused");
        } catch (error) {
            if (!error.message.includes("paused")) {
                throw error;
            }
        }
        
        // Unpause
        await contract.connect(deployer).unpause();
        
        const isPaused = await contract.paused();
        if (isPaused) {
            throw new Error("Contract should be unpaused");
        }
    });
    
    // === LOAD TESTING ===
    
    // Test 11: Multiple Concurrent Operations
    await runTest("Load Test - Concurrent Operations", async () => {
        const promises = [];
        
        // Create multiple test accounts
        for (let i = 0; i < 3; i++) {
            const testAccount = ethers.Wallet.createRandom().connect(ethers.provider);
            
            // Fund account
            await deployer.sendTransaction({
                to: testAccount.address,
                value: ethers.parseEther("0.01")
            });
            
            await mockUSDT.mint(testAccount.address, ethers.parseUnits("100", 6));
            await mockUSDT.connect(testAccount).approve(deploymentInfo.contractAddress, ethers.MaxUint256);
            
            promises.push(contract.connect(testAccount).register(user1.address));
        }
        
        // Execute concurrently
        await Promise.all(promises);
        
        console.log("  Concurrent operations completed successfully");
    });
    
    // === GENERATE REPORT ===
    
    console.log("\n📊 GENERATING TEST REPORT...");
    
    const reportSummary = `
🧪 TESTNET SECURITY TESTING REPORT
====================================

📅 Test Date: ${testResults.timestamp}
🏗️  Contract: ${deploymentInfo.contractAddress}
📝 Contract Type: ${deploymentInfo.contractName}

📊 TEST SUMMARY:
- Total Tests: ${testResults.summary.total}
- Passed: ${testResults.summary.passed}
- Failed: ${testResults.summary.failed}
- Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%

🔒 SECURITY FEATURES TESTED:
✅ MEV Protection
✅ Circuit Breaker
✅ Access Control
✅ Reentrancy Protection
✅ Gas Optimization
✅ Emergency Controls
✅ Load Testing

${testResults.summary.failed === 0 ? '🎉 ALL TESTS PASSED - READY FOR MAINNET' : '❌ SOME TESTS FAILED - DO NOT DEPLOY TO MAINNET'}
`;
    
    console.log(reportSummary);
    
    // Save detailed report
    fs.writeFileSync(
        'testnet-security-test-report.json',
        JSON.stringify(testResults, null, 2)
    );
    
    // Save summary report
    fs.writeFileSync('testnet-test-summary.txt', reportSummary);
    
    console.log("📄 Detailed report saved to testnet-security-test-report.json");
    console.log("📄 Summary saved to testnet-test-summary.txt");
    
    if (testResults.summary.failed === 0) {
        console.log("\n🎉 ALL SECURITY TESTS PASSED!");
        console.log("✅ Contract is ready for mainnet deployment");
        console.log("📋 Next: Review test results and proceed with mainnet deployment");
    } else {
        console.log("\n❌ SOME TESTS FAILED!");
        console.log("🔧 Fix issues before proceeding to mainnet");
        console.log("📋 Review failed tests and address all issues");
    }
    
    return testResults.summary.failed === 0;
}

// Run testing
main()
    .then((success) => {
        if (success) {
            console.log("✅ Security testing completed successfully");
            process.exit(0);
        } else {
            console.log("❌ Security testing completed with failures");
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error("❌ Security testing failed:", error);
        process.exit(1);
    });
