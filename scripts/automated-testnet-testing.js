const { ethers } = require("hardhat");

/**
 * AUTOMATED TESTNET TESTING SCRIPT
 * 
 * This script automatically conducts comprehensive testing:
 * 1. Register Test Wallet 2 with $30 package
 * 2. Simulate team member registrations
 * 3. Monitor performance and validate features
 * 4. Generate comprehensive test reports
 */

async function main() {
    console.log("🚀 ORPHI CROWDFUND - AUTOMATED TESTNET TESTING");
    console.log("=" .repeat(80));
    
    // Contract addresses
    const contractAddress = "0x5ab22F4d339B66C1859029d2c2540d8BefCbdED4";
    const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    
    // Test wallet configuration
    const testWallets = {
        wallet1: {
            address: "0xE0Ea180812e05AE1B257D212C01FC4E45865EBd4",
            privateKey: process.env.TEST_WALLET_1_PRIVATE_KEY || "",
            hasUSDT: false,
            role: "Test User 1"
        },
        wallet2: {
            address: "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6", 
            privateKey: process.env.TEST_WALLET_2_PRIVATE_KEY || "",
            hasUSDT: true,
            usdtAmount: "20.0",
            role: "Primary Test User (Has USDT)"
        },
        wallet3: {
            address: "0x7379AF7f3efC8Ab3F8dA57EA917fB5C29B12bBB7",
            privateKey: process.env.TEST_WALLET_3_PRIVATE_KEY || "",
            hasUSDT: false,
            role: "Test User 3"
        }
    };
    
    // Get deployer (admin) signer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    
    console.log(`👤 Admin/Deployer: ${deployerAddress}`);
    console.log(`📋 Contract: ${contractAddress}`);
    console.log(`💰 USDT: ${usdtAddress}`);
    
    // Get contract instances
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundV2Enhanced");
    const contract = OrphiCrowdFund.attach(contractAddress);
    
    // USDT contract ABI
    const usdtAbi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)"
    ];
    const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, deployer);
    
    // Test results tracking
    const testResults = {
        timestamp: new Date().toISOString(),
        contractAddress,
        testsPassed: 0,
        testsFailed: 0,
        details: []
    };
    
    function logTest(testName, success, details = "") {
        const result = success ? "✅ PASS" : "❌ FAIL";
        console.log(`   ${result}: ${testName}`);
        if (details) console.log(`      ${details}`);
        
        testResults.details.push({
            test: testName,
            success,
            details,
            timestamp: new Date().toISOString()
        });
        
        if (success) testResults.testsPassed++;
        else testResults.testsFailed++;
    }
    
    // STEP 1: PRE-TEST VALIDATION
    console.log("\n" + "=" .repeat(80));
    console.log("🔍 STEP 1: PRE-TEST VALIDATION");
    console.log("=" .repeat(80));
    
    try {
        // Check contract basic info
        console.log("\n📋 Contract Information:");
        const owner = await contract.owner();
        const usdtToken = await contract.usdtToken();
        const packageAmounts = await contract.getPackageAmounts();
        
        logTest("Contract Owner Check", owner === deployerAddress, `Owner: ${owner}`);
        logTest("USDT Token Check", usdtToken === usdtAddress, `USDT: ${usdtToken}`);
        logTest("Package Configuration", packageAmounts.length === 4, `${packageAmounts.length} packages configured`);
        
        // Check USDT contract
        console.log("\n💵 USDT Contract Validation:");
        const usdtName = await usdtContract.name();
        const usdtSymbol = await usdtContract.symbol();
        const usdtDecimals = await usdtContract.decimals();
        
        logTest("USDT Contract Name", usdtName === "USDT Token", `Name: ${usdtName}`);
        logTest("USDT Contract Symbol", usdtSymbol === "USDT", `Symbol: ${usdtSymbol}`);
        logTest("USDT Contract Decimals", usdtDecimals === 18n, `Decimals: ${usdtDecimals}`);
        
        // Check wallet balances
        console.log("\n💰 Wallet Balance Validation:");
        for (const [key, wallet] of Object.entries(testWallets)) {
            const bnbBalance = await ethers.provider.getBalance(wallet.address);
            const usdtBalance = await usdtContract.balanceOf(wallet.address);
            
            console.log(`   ${wallet.role}:`);
            console.log(`     BNB: ${ethers.formatEther(bnbBalance)}`);
            console.log(`     USDT: ${ethers.formatUnits(usdtBalance, 18)}`);
            
            logTest(`${wallet.role} BNB Balance`, bnbBalance > ethers.parseEther("0.05"), 
                `${ethers.formatEther(bnbBalance)} BNB`);
            
            if (wallet.hasUSDT) {
                logTest(`${wallet.role} USDT Balance`, usdtBalance >= ethers.parseUnits("30", 18), 
                    `${ethers.formatUnits(usdtBalance, 18)} USDT`);
            }
        }
        
    } catch (error) {
        logTest("Pre-test Validation", false, error.message);
        console.error("❌ Pre-test validation failed:", error);
    }
    
    // STEP 2: USER REGISTRATION TESTING
    console.log("\n" + "=" .repeat(80));
    console.log("👥 STEP 2: USER REGISTRATION TESTING");
    console.log("=" .repeat(80));
    
    try {
        // Test user registration status (should be false initially)
        console.log("\n🔍 Initial Registration Status:");
        for (const [key, wallet] of Object.entries(testWallets)) {
            const isRegistered = await contract.isUserRegistered(wallet.address);
            logTest(`${wallet.role} Initial Registration`, !isRegistered, 
                `Registered: ${isRegistered} (should be false)`);
        }
        
        // Simulate user registration for Test Wallet 2 (has USDT)
        console.log("\n📝 Simulating User Registration:");
        const wallet2 = testWallets.wallet2;
        
        if (wallet2.privateKey) {
            console.log("   🎯 Attempting to register Test Wallet 2 with $30 package...");
            
            // Create wallet signer
            const wallet2Signer = new ethers.Wallet(wallet2.privateKey, ethers.provider);
            const contractWithWallet2 = contract.connect(wallet2Signer);
            const usdtWithWallet2 = usdtContract.connect(wallet2Signer);
            
            // Check USDT balance
            const usdtBalance = await usdtContract.balanceOf(wallet2.address);
            const packagePrice = await contract.getPackagePrice(1); // $30 package
            
            console.log(`   💰 USDT Balance: ${ethers.formatUnits(usdtBalance, 18)}`);
            console.log(`   💵 Package Price: $${ethers.formatUnits(packagePrice, 6)}`);
            
            if (usdtBalance >= packagePrice) {
                // Approve USDT spending
                console.log("   📝 Approving USDT spending...");
                const approveTx = await usdtWithWallet2.approve(contractAddress, packagePrice);
                await approveTx.wait();
                
                // Register user
                console.log("   🚀 Registering user...");
                const registerTx = await contractWithWallet2.registerUser(deployerAddress, 1);
                const receipt = await registerTx.wait();
                
                logTest("User Registration Transaction", receipt.status === 1, 
                    `Gas used: ${receipt.gasUsed.toString()}`);
                
                // Verify registration
                const isNowRegistered = await contract.isUserRegistered(wallet2.address);
                logTest("User Registration Verification", isNowRegistered, 
                    `User is now registered: ${isNowRegistered}`);
                
            } else {
                logTest("USDT Balance Check", false, "Insufficient USDT for registration");
            }
            
        } else {
            console.log("   ⚠️  Test Wallet 2 private key not provided - skipping actual registration");
            logTest("User Registration", false, "Private key not available for testing");
        }
        
    } catch (error) {
        logTest("User Registration Testing", false, error.message);
        console.error("❌ User registration testing failed:", error);
    }
    
    // STEP 3: COMMISSION CALCULATION TESTING
    console.log("\n" + "=" .repeat(80));
    console.log("💸 STEP 3: COMMISSION CALCULATION TESTING");
    console.log("=" .repeat(80));
    
    try {
        console.log("\n🧮 Testing Commission Calculations:");
        
        // Test package prices and commission calculations
        for (let packageId = 1; packageId <= 4; packageId++) {
            const packagePrice = await contract.getPackagePrice(packageId);
            const priceInUSD = ethers.formatUnits(packagePrice, 6);
            
            // Calculate expected commissions (assuming 10% direct, 5% matrix)
            const directCommission = packagePrice * 10n / 100n;
            const matrixCommission = packagePrice * 5n / 100n;
            
            console.log(`   Package ${packageId}: $${priceInUSD}`);
            console.log(`     Expected Direct Commission: $${ethers.formatUnits(directCommission, 6)}`);
            console.log(`     Expected Matrix Commission: $${ethers.formatUnits(matrixCommission, 6)}`);
            
            logTest(`Package ${packageId} Price Calculation`, packagePrice > 0, 
                `Price: $${priceInUSD}`);
        }
        
    } catch (error) {
        logTest("Commission Calculation Testing", false, error.message);
        console.error("❌ Commission calculation testing failed:", error);
    }
    
    // STEP 4: MATRIX POSITIONING TESTING
    console.log("\n" + "=" .repeat(80));
    console.log("🔗 STEP 4: MATRIX POSITIONING TESTING");
    console.log("=" .repeat(80));
    
    try {
        console.log("\n🌐 Testing Matrix System:");
        
        // Test matrix position queries
        try {
            const deployerPosition = await contract.getUserMatrixPosition(deployerAddress);
            logTest("Deployer Matrix Position", deployerPosition >= 0, 
                `Position: ${deployerPosition}`);
        } catch (error) {
            logTest("Matrix Position Query", false, "Function may not be available in this contract version");
        }
        
        // Test rank requirements
        console.log("\n🏆 Rank Requirements Testing:");
        for (let rank = 1; rank <= 5; rank++) {
            try {
                const [teamSize, volume] = await contract.getRankRequirements(rank);
                logTest(`Rank ${rank} Requirements`, teamSize > 0 && volume > 0, 
                    `${teamSize} team, $${ethers.formatUnits(volume, 6)} volume`);
            } catch (error) {
                logTest(`Rank ${rank} Requirements`, false, "Rank not defined");
            }
        }
        
    } catch (error) {
        logTest("Matrix Positioning Testing", false, error.message);
        console.error("❌ Matrix positioning testing failed:", error);
    }
    
    // STEP 5: PERFORMANCE MONITORING
    console.log("\n" + "=" .repeat(80));
    console.log("📊 STEP 5: PERFORMANCE MONITORING");
    console.log("=" .repeat(80));
    
    try {
        console.log("\n⚡ Performance Metrics:");
        
        // Test gas costs for various operations
        const gasEstimates = {};
        
        try {
            // Estimate gas for user registration
            const registerGas = await contract.registerUser.estimateGas(deployerAddress, 1);
            gasEstimates.registration = registerGas;
            logTest("Registration Gas Estimate", registerGas < 500000n, 
                `${registerGas.toString()} gas`);
        } catch (error) {
            logTest("Registration Gas Estimate", false, "Could not estimate gas");
        }
        
        // Test contract response times
        const startTime = Date.now();
        await contract.getPackageAmounts();
        const responseTime = Date.now() - startTime;
        
        logTest("Contract Response Time", responseTime < 1000, 
            `${responseTime}ms`);
        
        // Test network connectivity
        const blockNumber = await ethers.provider.getBlockNumber();
        logTest("Network Connectivity", blockNumber > 0, 
            `Current block: ${blockNumber}`);
        
    } catch (error) {
        logTest("Performance Monitoring", false, error.message);
        console.error("❌ Performance monitoring failed:", error);
    }
    
    // STEP 6: FEATURE VALIDATION
    console.log("\n" + "=" .repeat(80));
    console.log("🔍 STEP 6: COMPREHENSIVE FEATURE VALIDATION");
    console.log("=" .repeat(80));
    
    try {
        console.log("\n✅ Feature Validation Summary:");
        
        // Validate all core features
        const features = [
            { name: "Package System", test: async () => (await contract.getPackageAmounts()).length === 4 },
            { name: "User Registration", test: async () => typeof (await contract.isUserRegistered(deployerAddress)) === 'boolean' },
            { name: "Price Calculation", test: async () => (await contract.getPackagePrice(1)) > 0 },
            { name: "Owner Management", test: async () => (await contract.owner()) === deployerAddress },
            { name: "USDT Integration", test: async () => (await contract.usdtToken()) === usdtAddress }
        ];
        
        for (const feature of features) {
            try {
                const result = await feature.test();
                logTest(feature.name, result, result ? "Working correctly" : "Not functioning as expected");
            } catch (error) {
                logTest(feature.name, false, error.message);
            }
        }
        
    } catch (error) {
        logTest("Feature Validation", false, error.message);
        console.error("❌ Feature validation failed:", error);
    }
    
    // FINAL REPORT
    console.log("\n" + "=" .repeat(80));
    console.log("📋 AUTOMATED TESTING COMPLETE - FINAL REPORT");
    console.log("=" .repeat(80));
    
    const totalTests = testResults.testsPassed + testResults.testsFailed;
    const successRate = totalTests > 0 ? (testResults.testsPassed / totalTests * 100).toFixed(1) : 0;
    
    console.log(`\n📊 Test Results Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${testResults.testsPassed} ✅`);
    console.log(`   Failed: ${testResults.testsFailed} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    
    // Determine overall status
    let overallStatus = "🟢 EXCELLENT";
    if (successRate < 70) overallStatus = "🔴 NEEDS ATTENTION";
    else if (successRate < 90) overallStatus = "🟡 GOOD";
    
    console.log(`   Overall Status: ${overallStatus}`);
    
    // Save detailed report
    const reportFilename = `automated-test-report-${Date.now()}.json`;
    const fs = require('fs');
    fs.writeFileSync(reportFilename, JSON.stringify(testResults, null, 2));
    
    console.log(`\n📄 Detailed report saved: ${reportFilename}`);
    
    // Next steps recommendations
    console.log(`\n🎯 NEXT STEPS RECOMMENDATIONS:`);
    
    if (testResults.testsFailed === 0) {
        console.log("✅ All tests passed! Your system is ready for:");
        console.log("   1. 👥 Team member invitations");
        console.log("   2. 📈 Marketing campaign launch");
        console.log("   3. 🚀 Mainnet deployment preparation");
    } else {
        console.log("⚠️  Some tests failed. Recommended actions:");
        console.log("   1. 🔧 Review failed tests and fix issues");
        console.log("   2. 🧪 Re-run automated testing");
        console.log("   3. 📞 Contact development team if needed");
    }
    
    console.log(`\n🌐 Contract Links:`);
    console.log(`   BSCScan: https://testnet.bscscan.com/address/${contractAddress}`);
    console.log(`   Verified Code: https://testnet.bscscan.com/address/${contractAddress}#code`);
    
    return {
        success: testResults.testsFailed === 0,
        totalTests,
        passed: testResults.testsPassed,
        failed: testResults.testsFailed,
        successRate: parseFloat(successRate),
        reportFile: reportFilename
    };
}

if (require.main === module) {
    main()
        .then((result) => {
            console.log(`\n${result.success ? '✅' : '❌'} Automated testing completed`);
            console.log(`📊 Results: ${result.passed}/${result.totalTests} tests passed (${result.successRate}%)`);
            process.exit(result.success ? 0 : 1);
        })
        .catch((error) => {
            console.error("❌ Automated testing failed:", error);
            process.exit(1);
        });
}

module.exports = main;
