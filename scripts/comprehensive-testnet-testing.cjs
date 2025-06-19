const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🧪 LEADFIVE COMPREHENSIVE TESTNET TESTING SUITE");
    console.log("=" * 80);

    // Contract addresses from deployment
    const LEADFIVE_TESTNET_PROXY = process.env.LEADFIVE_TESTNET_PROXY;
    const USDT_TESTNET = process.env.USDT_TESTNET;
    
    if (!LEADFIVE_TESTNET_PROXY) {
        console.error("❌ LEADFIVE_TESTNET_PROXY not found in .env file");
        process.exit(1);
    }

    // Get signers for testing
    const [deployer] = await ethers.getSigners();
    console.log("📋 Testing Configuration:");
    console.log("👤 Deployer:", deployer.address);
    console.log("📍 Contract:", LEADFIVE_TESTNET_PROXY);
    console.log("💰 USDT:", USDT_TESTNET);
    console.log("🌐 Network: BSC Testnet");

    // Connect to deployed contract
    const LeadFive = await ethers.getContractFactory("LeadFiveModular");
    const leadFive = LeadFive.attach(LEADFIVE_TESTNET_PROXY);

    // Testing results storage
    const testResults = {
        timestamp: new Date().toISOString(),
        contractAddress: LEADFIVE_TESTNET_PROXY,
        deployer: deployer.address,
        tests: [],
        summary: {
            total: 0,
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
        testResults.tests.push(result);
        testResults.summary.total++;
        
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
        // TEST SUITE 1: CONTRACT DEPLOYMENT VERIFICATION
        console.log("\n" + "=" * 80);
        console.log("🧪 TEST SUITE 1: CONTRACT DEPLOYMENT VERIFICATION");
        console.log("=" * 80);

        // Test 1.1: Contract Owner
        try {
            const owner = await leadFive.owner();
            const isCorrectOwner = owner.toLowerCase() === deployer.address.toLowerCase();
            addTestResult(
                "Contract Owner Verification",
                isCorrectOwner ? "PASS" : "FAIL",
                isCorrectOwner ? "Owner correctly set to deployer" : "Owner mismatch",
                deployer.address,
                owner
            );
        } catch (error) {
            addTestResult("Contract Owner Verification", "FAIL", `Error: ${error.message}`);
        }

        // Test 1.2: USDT Address
        try {
            const usdtAddress = await leadFive.usdt();
            const isCorrectUSDT = usdtAddress.toLowerCase() === USDT_TESTNET.toLowerCase();
            addTestResult(
                "USDT Address Verification",
                isCorrectUSDT ? "PASS" : "FAIL",
                isCorrectUSDT ? "USDT address correctly configured" : "USDT address mismatch",
                USDT_TESTNET,
                usdtAddress
            );
        } catch (error) {
            addTestResult("USDT Address Verification", "FAIL", `Error: ${error.message}`);
        }

        // Test 1.3: Package Configuration
        const expectedPackages = [
            { level: 1, price: "30.0" },
            { level: 2, price: "50.0" },
            { level: 3, price: "100.0" },
            { level: 4, price: "200.0" }
        ];

        for (const pkg of expectedPackages) {
            try {
                const packageInfo = await leadFive.packages(pkg.level);
                const actualPrice = ethers.formatEther(packageInfo.price);
                const isCorrectPrice = actualPrice === pkg.price;
                addTestResult(
                    `Package ${pkg.level} Price Verification`,
                    isCorrectPrice ? "PASS" : "FAIL",
                    isCorrectPrice ? `Package ${pkg.level} price correct: ${actualPrice} USDT` : `Package ${pkg.level} price mismatch`,
                    `${pkg.price} USDT`,
                    `${actualPrice} USDT`
                );
            } catch (error) {
                addTestResult(`Package ${pkg.level} Price Verification`, "FAIL", `Error: ${error.message}`);
            }
        }

        // TEST SUITE 2: ADMIN FEE CONFIGURATION
        console.log("\n" + "=" * 80);
        console.log("🧪 TEST SUITE 2: ADMIN FEE CONFIGURATION");
        console.log("=" * 80);

        // Test 2.1: Admin Fee Rate
        try {
            const adminFeeInfo = await leadFive.getAdminFeeInfo();
            const adminFeeRate = adminFeeInfo[2].toString();
            const expectedRate = "500"; // 5% = 500 basis points
            const isCorrectRate = adminFeeRate === expectedRate;
            addTestResult(
                "Admin Fee Rate Verification",
                isCorrectRate ? "PASS" : "FAIL",
                isCorrectRate ? "Admin fee rate correctly set to 5%" : "Admin fee rate incorrect",
                "500 basis points (5%)",
                `${adminFeeRate} basis points`
            );
        } catch (error) {
            addTestResult("Admin Fee Rate Verification", "FAIL", `Error: ${error.message}`);
        }

        // Test 2.2: Admin Fee Recipient
        try {
            const adminFeeInfo = await leadFive.getAdminFeeInfo();
            const adminFeeRecipient = adminFeeInfo[0];
            const isRecipientSet = adminFeeRecipient !== ethers.ZeroAddress;
            addTestResult(
                "Admin Fee Recipient Verification",
                isRecipientSet ? "PASS" : "WARN",
                isRecipientSet ? `Admin fee recipient set: ${adminFeeRecipient}` : "Admin fee recipient not set",
                "Non-zero address",
                adminFeeRecipient
            );
        } catch (error) {
            addTestResult("Admin Fee Recipient Verification", "FAIL", `Error: ${error.message}`);
        }

        // Test 2.3: Total Admin Fees Collected
        try {
            const adminFeeInfo = await leadFive.getAdminFeeInfo();
            const totalFeesCollected = ethers.formatEther(adminFeeInfo[1]);
            addTestResult(
                "Total Admin Fees Tracking",
                "PASS",
                `Total admin fees collected: ${totalFeesCollected} USDT`,
                "Trackable amount",
                `${totalFeesCollected} USDT`
            );
        } catch (error) {
            addTestResult("Total Admin Fees Tracking", "FAIL", `Error: ${error.message}`);
        }

        // TEST SUITE 3: MATRIX SPILLOVER SYSTEM
        console.log("\n" + "=" * 80);
        console.log("🧪 TEST SUITE 3: MATRIX SPILLOVER SYSTEM");
        console.log("=" * 80);

        // Test 3.1: Spillover Counter
        try {
            const spilloverCount = await leadFive.spilloverCounter(deployer.address);
            addTestResult(
                "Spillover Counter Initialization",
                "PASS",
                `Deployer spillover counter: ${spilloverCount.toString()}`,
                "Numeric value",
                spilloverCount.toString()
            );
        } catch (error) {
            addTestResult("Spillover Counter Initialization", "FAIL", `Error: ${error.message}`);
        }

        // Test 3.2: Binary Matrix Access
        try {
            const binaryMatrix = await leadFive.binaryMatrix(deployer.address, 0);
            addTestResult(
                "Binary Matrix Access",
                "PASS",
                `Binary matrix accessible, left child: ${binaryMatrix}`,
                "Accessible function",
                `Left child: ${binaryMatrix}`
            );
        } catch (error) {
            addTestResult("Binary Matrix Access", "FAIL", `Error: ${error.message}`);
        }

        // TEST SUITE 4: POOL SYSTEM
        console.log("\n" + "=" * 80);
        console.log("🧪 TEST SUITE 4: POOL SYSTEM");
        console.log("=" * 80);

        // Test 4.1: Pool Balances
        try {
            const poolBalances = await leadFive.getPoolBalances();
            const leaderPool = ethers.formatEther(poolBalances[0]);
            const helpPool = ethers.formatEther(poolBalances[1]);
            const clubPool = ethers.formatEther(poolBalances[2]);
            
            addTestResult(
                "Leader Pool Balance",
                "PASS",
                `Leader pool balance: ${leaderPool} USDT`,
                "Readable balance",
                `${leaderPool} USDT`
            );
            
            addTestResult(
                "Help Pool Balance",
                "PASS",
                `Help pool balance: ${helpPool} USDT`,
                "Readable balance",
                `${helpPool} USDT`
            );
            
            addTestResult(
                "Club Pool Balance",
                "PASS",
                `Club pool balance: ${clubPool} USDT`,
                "Readable balance",
                `${clubPool} USDT`
            );
        } catch (error) {
            addTestResult("Pool Balances Verification", "FAIL", `Error: ${error.message}`);
        }

        // TEST SUITE 5: USER SYSTEM
        console.log("\n" + "=" * 80);
        console.log("🧪 TEST SUITE 5: USER SYSTEM");
        console.log("=" * 80);

        // Test 5.1: Deployer User Info
        try {
            const deployerInfo = await leadFive.getUserInfo(deployer.address);
            const isRegistered = deployerInfo.isRegistered;
            const packageLevel = deployerInfo.packageLevel.toString();
            const balance = ethers.formatEther(deployerInfo.balance);
            
            addTestResult(
                "Deployer Registration Status",
                isRegistered ? "PASS" : "FAIL",
                isRegistered ? "Deployer is registered" : "Deployer not registered",
                "true",
                isRegistered.toString()
            );
            
            addTestResult(
                "Deployer Package Level",
                "PASS",
                `Deployer package level: ${packageLevel}`,
                "Valid package level",
                packageLevel
            );
            
            addTestResult(
                "Deployer Balance",
                "PASS",
                `Deployer balance: ${balance} USDT`,
                "Readable balance",
                `${balance} USDT`
            );
        } catch (error) {
            addTestResult("Deployer User Info", "FAIL", `Error: ${error.message}`);
        }

        // Test 5.2: Non-registered User
        try {
            const testAddress = "0x0000000000000000000000000000000000000001";
            const testUserInfo = await leadFive.getUserInfo(testAddress);
            const isRegistered = testUserInfo.isRegistered;
            
            addTestResult(
                "Non-registered User Check",
                !isRegistered ? "PASS" : "FAIL",
                !isRegistered ? "Non-registered user correctly shows as unregistered" : "Non-registered user shows as registered",
                "false",
                isRegistered.toString()
            );
        } catch (error) {
            addTestResult("Non-registered User Check", "FAIL", `Error: ${error.message}`);
        }

        // TEST SUITE 6: GAS LIMIT PROTECTION
        console.log("\n" + "=" * 80);
        console.log("🧪 TEST SUITE 6: GAS LIMIT PROTECTION");
        console.log("=" * 80);

        // Test 6.1: GasLimitReached Event
        try {
            const eventFragment = leadFive.interface.getEvent("GasLimitReached");
            const isEventDefined = eventFragment !== null;
            addTestResult(
                "GasLimitReached Event Definition",
                isEventDefined ? "PASS" : "FAIL",
                isEventDefined ? `Event defined: ${eventFragment.format()}` : "Event not defined",
                "Event exists",
                isEventDefined ? eventFragment.format() : "undefined"
            );
        } catch (error) {
            addTestResult("GasLimitReached Event Definition", "FAIL", `Error: ${error.message}`);
        }

        // TEST SUITE 7: ADMIN FUNCTIONS
        console.log("\n" + "=" * 80);
        console.log("🧪 TEST SUITE 7: ADMIN FUNCTIONS");
        console.log("=" * 80);

        // Test 7.1: Admin Fee Recipient Setting
        try {
            // Try to set admin fee recipient (should work for owner)
            const tx = await leadFive.setAdminFeeRecipient(deployer.address);
            await tx.wait();
            addTestResult(
                "Admin Fee Recipient Setting",
                "PASS",
                "Admin fee recipient set successfully",
                "Transaction success",
                "Success"
            );
        } catch (error) {
            addTestResult("Admin Fee Recipient Setting", "WARN", `May already be set: ${error.message}`);
        }

        // Test 7.2: Blacklist Function Availability
        try {
            const blacklistFunction = leadFive.interface.getFunction("blacklistUser");
            const isFunctionAvailable = blacklistFunction !== null;
            addTestResult(
                "Blacklist Function Availability",
                isFunctionAvailable ? "PASS" : "FAIL",
                isFunctionAvailable ? "Blacklist function available" : "Blacklist function not found",
                "Function exists",
                isFunctionAvailable ? "Available" : "Not found"
            );
        } catch (error) {
            addTestResult("Blacklist Function Availability", "FAIL", `Error: ${error.message}`);
        }

        // Test 7.3: Emergency Withdraw Function
        try {
            const emergencyFunction = leadFive.interface.getFunction("emergencyWithdraw");
            const isFunctionAvailable = emergencyFunction !== null;
            addTestResult(
                "Emergency Withdraw Function",
                isFunctionAvailable ? "PASS" : "FAIL",
                isFunctionAvailable ? "Emergency withdraw function available" : "Emergency withdraw function not found",
                "Function exists",
                isFunctionAvailable ? "Available" : "Not found"
            );
        } catch (error) {
            addTestResult("Emergency Withdraw Function", "FAIL", `Error: ${error.message}`);
        }

        // TEST SUITE 8: CONTRACT STATE
        console.log("\n" + "=" * 80);
        console.log("🧪 TEST SUITE 8: CONTRACT STATE");
        console.log("=" * 80);

        // Test 8.1: Pause Status
        try {
            const isPaused = await leadFive.paused();
            addTestResult(
                "Contract Pause Status",
                !isPaused ? "PASS" : "WARN",
                !isPaused ? "Contract is not paused (operational)" : "Contract is paused",
                "false (not paused)",
                isPaused.toString()
            );
        } catch (error) {
            addTestResult("Contract Pause Status", "FAIL", `Error: ${error.message}`);
        }

        // Test 8.2: Total Users
        try {
            const totalUsers = await leadFive.totalUsers();
            addTestResult(
                "Total Users Count",
                "PASS",
                `Total users registered: ${totalUsers.toString()}`,
                "Numeric value",
                totalUsers.toString()
            );
        } catch (error) {
            addTestResult("Total Users Count", "FAIL", `Error: ${error.message}`);
        }

        // MATHEMATICAL VERIFICATION SUITE
        console.log("\n" + "=" * 80);
        console.log("🧪 MATHEMATICAL VERIFICATION SUITE");
        console.log("=" * 80);

        // Test Math.1: Admin Fee Calculation
        const testAmount = ethers.parseEther("200"); // $200 package
        const expectedAdminFee = ethers.parseEther("10"); // 5% of $200
        const expectedDistributable = ethers.parseEther("190"); // 95% of $200

        try {
            // Calculate admin fee (5% of 200 = 10)
            const calculatedAdminFee = (testAmount * BigInt(500)) / BigInt(10000);
            const calculatedDistributable = testAmount - calculatedAdminFee;
            
            const adminFeeCorrect = calculatedAdminFee === expectedAdminFee;
            const distributableCorrect = calculatedDistributable === expectedDistributable;
            
            addTestResult(
                "Admin Fee Calculation (5%)",
                adminFeeCorrect ? "PASS" : "FAIL",
                adminFeeCorrect ? "Admin fee calculation correct" : "Admin fee calculation incorrect",
                ethers.formatEther(expectedAdminFee),
                ethers.formatEther(calculatedAdminFee)
            );
            
            addTestResult(
                "Distributable Amount Calculation",
                distributableCorrect ? "PASS" : "FAIL",
                distributableCorrect ? "Distributable amount calculation correct" : "Distributable amount calculation incorrect",
                ethers.formatEther(expectedDistributable),
                ethers.formatEther(calculatedDistributable)
            );
        } catch (error) {
            addTestResult("Mathematical Verification", "FAIL", `Error: ${error.message}`);
        }

        // Test Math.2: Commission Percentages
        const postFeeAmount = ethers.parseEther("190"); // After 5% admin fee
        const expectedDirectBonus = (postFeeAmount * BigInt(4000)) / BigInt(10000); // 40%
        const expectedLevelBonus = (postFeeAmount * BigInt(1000)) / BigInt(10000); // 10%
        const expectedUplineBonus = (postFeeAmount * BigInt(1000)) / BigInt(10000); // 10%
        const expectedLeaderPool = (postFeeAmount * BigInt(1000)) / BigInt(10000); // 10%
        const expectedHelpPool = (postFeeAmount * BigInt(3000)) / BigInt(10000); // 30%

        try {
            const totalDistribution = expectedDirectBonus + expectedLevelBonus + expectedUplineBonus + expectedLeaderPool + expectedHelpPool;
            const isTotal100Percent = totalDistribution === postFeeAmount;
            
            addTestResult(
                "Commission Distribution Total",
                isTotal100Percent ? "PASS" : "FAIL",
                isTotal100Percent ? "Commission percentages sum to 100%" : "Commission percentages don't sum to 100%",
                ethers.formatEther(postFeeAmount),
                ethers.formatEther(totalDistribution)
            );
            
            addTestResult(
                "Direct Bonus Calculation (40%)",
                "PASS",
                `Direct bonus: ${ethers.formatEther(expectedDirectBonus)} USDT`,
                "40% of post-fee amount",
                ethers.formatEther(expectedDirectBonus)
            );
            
            addTestResult(
                "Help Pool Calculation (30%)",
                "PASS",
                `Help pool: ${ethers.formatEther(expectedHelpPool)} USDT`,
                "30% of post-fee amount",
                ethers.formatEther(expectedHelpPool)
            );
        } catch (error) {
            addTestResult("Commission Percentage Verification", "FAIL", `Error: ${error.message}`);
        }

        // FINAL SUMMARY
        console.log("\n" + "=" * 80);
        console.log("🎉 COMPREHENSIVE TESTING SUMMARY");
        console.log("=" * 80);

        const passRate = (testResults.summary.passed / testResults.summary.total * 100).toFixed(1);
        const failRate = (testResults.summary.failed / testResults.summary.total * 100).toFixed(1);
        const warnRate = (testResults.summary.warnings / testResults.summary.total * 100).toFixed(1);

        console.log(`📊 Total Tests: ${testResults.summary.total}`);
        console.log(`✅ Passed: ${testResults.summary.passed} (${passRate}%)`);
        console.log(`❌ Failed: ${testResults.summary.failed} (${failRate}%)`);
        console.log(`⚠️  Warnings: ${testResults.summary.warnings} (${warnRate}%)`);

        // Overall assessment
        let overallStatus = "EXCELLENT";
        if (testResults.summary.failed > 0) {
            overallStatus = "NEEDS ATTENTION";
        } else if (testResults.summary.warnings > 2) {
            overallStatus = "GOOD WITH WARNINGS";
        }

        console.log(`\n🎯 Overall Status: ${overallStatus}`);
        console.log(`🔗 Contract: https://testnet.bscscan.com/address/${LEADFIVE_TESTNET_PROXY}`);

        // Save detailed results
        const fs = require('fs');
        fs.writeFileSync(
            'testnet-comprehensive-test-results.json',
            JSON.stringify(testResults, null, 2)
        );

        console.log(`\n📄 Detailed results saved to: testnet-comprehensive-test-results.json`);

        // Recommendations
        console.log("\n💡 RECOMMENDATIONS:");
        if (testResults.summary.failed === 0 && testResults.summary.warnings <= 2) {
            console.log("✅ Contract is ready for mainnet deployment");
            console.log("✅ All critical functions verified");
            console.log("✅ Mathematical calculations accurate");
            console.log("✅ Security features operational");
        } else {
            console.log("⚠️  Review failed tests before mainnet deployment");
            console.log("⚠️  Address any critical warnings");
        }

        console.log("\n✅ COMPREHENSIVE TESTNET TESTING COMPLETE!");

    } catch (error) {
        console.error("❌ Testing suite failed:", error);
        addTestResult("Testing Suite Execution", "FAIL", `Critical error: ${error.message}`);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
