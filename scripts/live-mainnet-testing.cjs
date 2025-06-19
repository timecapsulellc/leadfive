const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🧪 LEADFIVE LIVE MAINNET FUNCTIONAL TESTING");
    console.log("=" * 80);
    console.log("🎯 Testing live contract functionality on BSC Mainnet");
    console.log("📍 Contract: 0x7FEEA22942407407801cCDA55a4392f25975D998");
    console.log("🌐 Network: BSC Mainnet");

    // Testing results storage
    const testResults = {
        timestamp: new Date().toISOString(),
        contractAddress: "0x7FEEA22942407407801cCDA55a4392f25975D998",
        network: "BSC Mainnet",
        chainId: 56,
        functionalTests: [],
        summary: {
            totalTests: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        }
    };

    function addTestResult(testName, status, details, expected = null, actual = null) {
        const result = {
            test: testName,
            status: status, // 'PASS', 'FAIL', 'WARN'
            details: details,
            expected: expected,
            actual: actual,
            timestamp: new Date().toISOString()
        };
        testResults.functionalTests.push(result);
        testResults.summary.totalTests++;
        
        if (status === 'PASS') {
            testResults.summary.passed++;
            console.log(`✅ ${testName}: ${details}`);
        } else if (status === 'FAIL') {
            testResults.summary.failed++;
            console.log(`❌ ${testName}: ${details}`);
            if (expected && actual) {
                console.log(`   Expected: ${expected}`);
                console.log(`   Actual: ${actual}`);
            }
        } else if (status === 'WARN') {
            testResults.summary.warnings++;
            console.log(`⚠️  ${testName}: ${details}`);
        }
    }

    try {
        // PHASE 2.1: CORE FUNCTION TESTING
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 2.1: CORE FUNCTION TESTING");
        console.log("=" * 80);

        // Get network and signer
        const [deployer] = await ethers.getSigners();
        const network = await ethers.provider.getNetwork();
        
        console.log("👤 Tester Address:", deployer.address);
        console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());
        console.log("💰 Tester Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

        const contractAddress = "0x7FEEA22942407407801cCDA55a4392f25975D998";
        const LeadFiveModular = await ethers.getContractFactory("LeadFiveModular");
        const contract = LeadFiveModular.attach(contractAddress);

        // Test 2.1.1: Package Information Retrieval
        console.log("\n--- Test 2.1.1: Package Information Retrieval ---");
        
        try {
            const packageTests = [];
            for (let i = 1; i <= 4; i++) {
                try {
                    const packageInfo = await contract.packages(i);
                    const price = ethers.formatEther(packageInfo.price);
                    const rates = packageInfo.rates;
                    
                    packageTests.push({
                        package: i,
                        price: price,
                        directBonus: rates.directBonus.toString(),
                        levelBonus: rates.levelBonus.toString(),
                        uplineBonus: rates.uplineBonus.toString(),
                        leaderBonus: rates.leaderBonus.toString(),
                        helpBonus: rates.helpBonus.toString(),
                        clubBonus: rates.clubBonus.toString()
                    });
                } catch (error) {
                    addTestResult(
                        `Package ${i} Information`,
                        "FAIL",
                        `Failed to retrieve package ${i}: ${error.message}`,
                        "Package data accessible",
                        error.message
                    );
                }
            }
            
            if (packageTests.length === 4) {
                addTestResult(
                    "Package Information Retrieval",
                    "PASS",
                    `All 4 packages retrieved: $${packageTests.map(p => p.price).join(', $')}`,
                    "4 packages accessible",
                    `${packageTests.length} packages`
                );
                
                // Verify expected package prices
                const expectedPrices = ["30.0", "50.0", "100.0", "200.0"];
                const actualPrices = packageTests.map(p => p.price);
                const pricesMatch = expectedPrices.every((price, index) => price === actualPrices[index]);
                
                addTestResult(
                    "Package Price Verification",
                    pricesMatch ? "PASS" : "FAIL",
                    `Package prices: $${actualPrices.join(', $')}`,
                    `$${expectedPrices.join(', $')}`,
                    `$${actualPrices.join(', $')}`
                );
            }
            
        } catch (error) {
            addTestResult(
                "Package Information Retrieval",
                "FAIL",
                `Package retrieval failed: ${error.message}`,
                "Package data accessible",
                error.message
            );
        }

        // Test 2.1.2: Pool Balance Monitoring
        console.log("\n--- Test 2.1.2: Pool Balance Monitoring ---");
        
        try {
            const poolBalances = await contract.getPoolBalances();
            const leaderBalance = ethers.formatEther(poolBalances[0]);
            const helpBalance = ethers.formatEther(poolBalances[1]);
            const clubBalance = ethers.formatEther(poolBalances[2]);
            
            addTestResult(
                "Pool Balance Retrieval",
                "PASS",
                `Pool balances - Leader: ${leaderBalance} USDT, Help: ${helpBalance} USDT, Club: ${clubBalance} USDT`,
                "Pool balances accessible",
                "Accessible"
            );
            
            // Test individual pool access
            const leaderPool = await contract.leaderPool();
            const helpPool = await contract.helpPool();
            const clubPool = await contract.clubPool();
            
            addTestResult(
                "Individual Pool Access",
                "PASS",
                `Individual pools accessible - Leader: ${ethers.formatEther(leaderPool.balance)} USDT`,
                "Individual pools accessible",
                "Accessible"
            );
            
        } catch (error) {
            addTestResult(
                "Pool Balance Monitoring",
                "FAIL",
                `Pool balance retrieval failed: ${error.message}`,
                "Pool balances accessible",
                error.message
            );
        }

        // Test 2.1.3: Admin Fee Information
        console.log("\n--- Test 2.1.3: Admin Fee Information ---");
        
        try {
            const adminFeeInfo = await contract.getAdminFeeInfo();
            const recipient = adminFeeInfo[0];
            const totalCollected = ethers.formatEther(adminFeeInfo[1]);
            const feeRate = adminFeeInfo[2].toString();
            
            addTestResult(
                "Admin Fee Information",
                "PASS",
                `Admin fee - Recipient: ${recipient}, Total collected: ${totalCollected} USDT, Rate: ${feeRate} basis points (${Number(feeRate)/100}%)`,
                "Admin fee info accessible",
                "Accessible"
            );
            
            // Verify 5% fee rate (500 basis points)
            const expectedRate = "500";
            addTestResult(
                "Admin Fee Rate Verification",
                feeRate === expectedRate ? "PASS" : "WARN",
                `Admin fee rate: ${feeRate} basis points (${Number(feeRate)/100}%)`,
                `${expectedRate} basis points`,
                `${feeRate} basis points`
            );
            
        } catch (error) {
            addTestResult(
                "Admin Fee Information",
                "FAIL",
                `Admin fee info retrieval failed: ${error.message}`,
                "Admin fee info accessible",
                error.message
            );
        }

        // Test 2.1.4: User Information Structure
        console.log("\n--- Test 2.1.4: User Information Structure ---");
        
        try {
            // Test with deployer address (should be registered as root user)
            const userInfo = await contract.getUserInfo(deployer.address);
            
            addTestResult(
                "User Information Retrieval",
                "PASS",
                `User info structure accessible - Registered: ${userInfo.isRegistered}, Package: ${userInfo.packageLevel}, Balance: ${ethers.formatEther(userInfo.balance)} USDT`,
                "User info accessible",
                "Accessible"
            );
            
            // Test with zero address (should not be registered)
            const zeroUserInfo = await contract.getUserInfo("0x0000000000000000000000000000000000000000");
            
            addTestResult(
                "Zero Address User Check",
                !zeroUserInfo.isRegistered ? "PASS" : "WARN",
                `Zero address registered status: ${zeroUserInfo.isRegistered}`,
                "false",
                zeroUserInfo.isRegistered.toString()
            );
            
        } catch (error) {
            addTestResult(
                "User Information Structure",
                "FAIL",
                `User info retrieval failed: ${error.message}`,
                "User info accessible",
                error.message
            );
        }

        // PHASE 2.2: SECURITY PROTOCOL TESTING
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 2.2: SECURITY PROTOCOL TESTING");
        console.log("=" * 80);

        // Test 2.2.1: Contract Pause State
        console.log("\n--- Test 2.2.1: Contract Pause State ---");
        
        try {
            const isPaused = await contract.paused();
            
            addTestResult(
                "Contract Pause State",
                "PASS",
                `Contract pause state: ${isPaused}`,
                "Pause state accessible",
                isPaused.toString()
            );
            
            // Verify contract is not paused for normal operations
            addTestResult(
                "Contract Operational State",
                !isPaused ? "PASS" : "WARN",
                `Contract is ${isPaused ? 'paused' : 'operational'}`,
                "Operational (not paused)",
                isPaused ? "Paused" : "Operational"
            );
            
        } catch (error) {
            addTestResult(
                "Contract Pause State",
                "FAIL",
                `Pause state check failed: ${error.message}`,
                "Pause state accessible",
                error.message
            );
        }

        // Test 2.2.2: Owner and Admin Access
        console.log("\n--- Test 2.2.2: Owner and Admin Access ---");
        
        try {
            const owner = await contract.owner();
            
            addTestResult(
                "Contract Owner",
                "PASS",
                `Contract owner: ${owner}`,
                "Owner accessible",
                "Accessible"
            );
            
            // Check admin IDs
            const adminChecks = [];
            for (let i = 0; i < 3; i++) { // Check first 3 admin slots
                try {
                    const admin = await contract.adminIds(i);
                    adminChecks.push(admin);
                } catch (error) {
                    break;
                }
            }
            
            addTestResult(
                "Admin ID Access",
                adminChecks.length > 0 ? "PASS" : "FAIL",
                `Admin IDs accessible: ${adminChecks.length} slots checked`,
                "Admin IDs accessible",
                `${adminChecks.length} accessible`
            );
            
        } catch (error) {
            addTestResult(
                "Owner and Admin Access",
                "FAIL",
                `Owner/admin access failed: ${error.message}`,
                "Owner/admin accessible",
                error.message
            );
        }

        // Test 2.2.3: Total Users Counter
        console.log("\n--- Test 2.2.3: Total Users Counter ---");
        
        try {
            const totalUsers = await contract.totalUsers();
            
            addTestResult(
                "Total Users Counter",
                "PASS",
                `Total users registered: ${totalUsers.toString()}`,
                "User counter accessible",
                "Accessible"
            );
            
            // Verify counter is reasonable (should be >= 1 for root user)
            addTestResult(
                "User Counter Validation",
                totalUsers >= 1 ? "PASS" : "WARN",
                `Total users: ${totalUsers.toString()}`,
                ">= 1",
                totalUsers.toString()
            );
            
        } catch (error) {
            addTestResult(
                "Total Users Counter",
                "FAIL",
                `User counter access failed: ${error.message}`,
                "User counter accessible",
                error.message
            );
        }

        // PHASE 2.3: NETWORK CONNECTIVITY TESTING
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 2.3: NETWORK CONNECTIVITY TESTING");
        console.log("=" * 80);

        // Test 2.3.1: Gas Estimation
        console.log("\n--- Test 2.3.1: Gas Estimation ---");
        
        try {
            // Estimate gas for a read operation
            const gasEstimate = await contract.getUserInfo.estimateGas(deployer.address);
            
            addTestResult(
                "Gas Estimation",
                "PASS",
                `Gas estimate for getUserInfo: ${gasEstimate.toString()}`,
                "Gas estimation working",
                "Working"
            );
            
            // Verify reasonable gas estimate (should be < 100,000 for read operation)
            addTestResult(
                "Gas Estimate Validation",
                gasEstimate < 100000 ? "PASS" : "WARN",
                `Gas estimate: ${gasEstimate.toString()}`,
                "< 100,000",
                gasEstimate.toString()
            );
            
        } catch (error) {
            addTestResult(
                "Gas Estimation",
                "FAIL",
                `Gas estimation failed: ${error.message}`,
                "Gas estimation working",
                error.message
            );
        }

        // Test 2.3.2: Block Information
        console.log("\n--- Test 2.3.2: Block Information ---");
        
        try {
            const latestBlock = await ethers.provider.getBlock('latest');
            const blockNumber = latestBlock.number;
            const blockTimestamp = latestBlock.timestamp;
            
            addTestResult(
                "Block Information",
                "PASS",
                `Latest block: ${blockNumber}, Timestamp: ${new Date(blockTimestamp * 1000).toISOString()}`,
                "Block info accessible",
                "Accessible"
            );
            
            // Verify block is recent (within last hour)
            const currentTime = Math.floor(Date.now() / 1000);
            const blockAge = currentTime - blockTimestamp;
            
            addTestResult(
                "Block Freshness",
                blockAge < 3600 ? "PASS" : "WARN",
                `Block age: ${blockAge} seconds`,
                "< 3600 seconds",
                `${blockAge} seconds`
            );
            
        } catch (error) {
            addTestResult(
                "Block Information",
                "FAIL",
                `Block info retrieval failed: ${error.message}`,
                "Block info accessible",
                error.message
            );
        }

        // FINAL SUMMARY
        console.log("\n" + "=" * 80);
        console.log("🎉 LIVE MAINNET FUNCTIONAL TESTING SUMMARY");
        console.log("=" * 80);

        const passRate = (testResults.summary.passed / testResults.summary.totalTests * 100).toFixed(1);
        const failRate = (testResults.summary.failed / testResults.summary.totalTests * 100).toFixed(1);
        const warnRate = (testResults.summary.warnings / testResults.summary.totalTests * 100).toFixed(1);

        console.log(`📊 Total Functional Tests: ${testResults.summary.totalTests}`);
        console.log(`✅ Passed: ${testResults.summary.passed} (${passRate}%)`);
        console.log(`❌ Failed: ${testResults.summary.failed} (${failRate}%)`);
        console.log(`⚠️  Warnings: ${testResults.summary.warnings} (${warnRate}%)`);

        // Overall assessment
        let functionalStatus = "FULLY OPERATIONAL";
        if (testResults.summary.failed > 3) {
            functionalStatus = "CRITICAL ISSUES";
        } else if (testResults.summary.failed > 1 || testResults.summary.warnings > 5) {
            functionalStatus = "NEEDS ATTENTION";
        } else if (testResults.summary.failed > 0 || testResults.summary.warnings > 2) {
            functionalStatus = "MINOR ISSUES";
        }

        console.log(`\n🎯 Functional Status: ${functionalStatus}`);
        console.log(`📍 Contract Address: 0x7FEEA22942407407801cCDA55a4392f25975D998`);
        console.log(`🔍 BSCScan: https://bscscan.com/address/0x7FEEA22942407407801cCDA55a4392f25975D998`);

        // Save test results
        const fs = require('fs');
        fs.writeFileSync(
            'live-mainnet-testing-results.json',
            JSON.stringify(testResults, null, 2)
        );

        console.log(`\n📄 Test results saved to: live-mainnet-testing-results.json`);

        if (functionalStatus === "FULLY OPERATIONAL") {
            console.log("\n✅ LIVE MAINNET FUNCTIONAL TESTING COMPLETE - READY FOR USER TRANSACTIONS!");
        } else {
            console.log("\n⚠️  LIVE MAINNET FUNCTIONAL TESTING COMPLETE - REVIEW REQUIRED");
        }

    } catch (error) {
        console.error("❌ Live mainnet testing failed:", error);
        addTestResult("Live Mainnet Testing Execution", "FAIL", `Critical error: ${error.message}`);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
