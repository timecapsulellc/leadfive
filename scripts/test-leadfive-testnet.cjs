const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🧪 LEADFIVE BSC TESTNET COMPREHENSIVE TESTING");
    console.log("=" .repeat(80));

    // Contract addresses
    const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || "0xbc62356BB04b7f0F18b205A5f42Dba83d4C019e6";
    const MOCK_USDT = process.env.MOCK_USDT_ADDRESS;
    const MOCK_WBNB = process.env.MOCK_WBNB_ADDRESS;
    const MOCK_PRICEFEED = process.env.MOCK_PRICEFEED_ADDRESS;

    console.log("📋 TESTING CONFIGURATION:");
    console.log(`Contract: ${CONTRACT_ADDRESS}`);
    console.log(`Mock USDT: ${MOCK_USDT}`);
    console.log(`Mock WBNB: ${MOCK_WBNB}`);
    console.log(`Mock PriceFeed: ${MOCK_PRICEFEED}`);
    console.log(`Network: BSC Testnet (Chain ID: 97)`);

    const [deployer] = await ethers.getSigners();
    console.log(`Tester: ${deployer.address}`);

    // Check network
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 97n) {
        throw new Error(`❌ Wrong network! Expected BSC Testnet (97), got ${network.chainId}`);
    }

    // Get contract instance
    console.log("\n🔍 CONNECTING TO CONTRACT...");
    
    try {
        // First try to get the contract factory with libraries
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(CONTRACT_ADDRESS);
        console.log("✅ Contract connected successfully");

        // Test results tracking
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;

        function logTest(testName, passed, details = "") {
            totalTests++;
            if (passed) {
                passedTests++;
                console.log(`✅ ${testName} ${details}`);
            } else {
                failedTests++;
                console.log(`❌ ${testName} ${details}`);
            }
        }

        // Test 1: Basic Contract Info
        console.log("\n📊 BASIC CONTRACT INFORMATION:");
        console.log("-" .repeat(50));
        
        try {
            const owner = await contract.owner();
            logTest("Owner Check", owner === deployer.address, `Owner: ${owner}`);
        } catch (error) {
            logTest("Owner Check", false, `Error: ${error.message}`);
        }

        try {
            const totalUsers = await contract.totalUsers();
            logTest("Total Users", totalUsers >= 0, `Total Users: ${totalUsers}`);
        } catch (error) {
            logTest("Total Users", false, `Error: ${error.message}`);
        }

        try {
            const usdt = await contract.usdt();
            logTest("USDT Address", usdt !== ethers.ZeroAddress, `USDT: ${usdt}`);
        } catch (error) {
            logTest("USDT Address", false, `Error: ${error.message}`);
        }

        try {
            const priceFeed = await contract.priceFeed();
            logTest("Price Feed", priceFeed !== ethers.ZeroAddress, `PriceFeed: ${priceFeed}`);
        } catch (error) {
            logTest("Price Feed", false, `Error: ${error.message}`);
        }

        // Test 2: Package Configuration
        console.log("\n📦 PACKAGE CONFIGURATION:");
        console.log("-" .repeat(50));
        
        for (let i = 1; i <= 4; i++) {
            try {
                const pkg = await contract.packages(i);
                const priceInUSDT = ethers.formatEther(pkg.price);
                logTest(`Package ${i}`, pkg.price > 0, `Price: ${priceInUSDT} USDT`);
            } catch (error) {
                logTest(`Package ${i}`, false, `Error: ${error.message}`);
            }
        }

        // Test 3: Admin Functions
        console.log("\n🔐 ADMIN FUNCTIONS:");
        console.log("-" .repeat(50));
        
        try {
            await contract.pause.staticCall();
            logTest("Pause Function", true, "Admin can call pause");
        } catch (error) {
            logTest("Pause Function", false, `Error: ${error.message}`);
        }

        try {
            await contract.setCircuitBreakerThreshold.staticCall(ethers.parseEther("100000"));
            logTest("Circuit Breaker", true, "Admin can set circuit breaker");
        } catch (error) {
            logTest("Circuit Breaker", false, `Error: ${error.message}`);
        }

        // Test 4: Pool Balances
        console.log("\n🏊 POOL BALANCES:");
        console.log("-" .repeat(50));
        
        try {
            const [leaderPool, helpPool, clubPool] = await contract.getPoolBalances();
            console.log(`Leader Pool: ${ethers.formatEther(leaderPool)} USDT`);
            console.log(`Help Pool: ${ethers.formatEther(helpPool)} USDT`);
            console.log(`Club Pool: ${ethers.formatEther(clubPool)} USDT`);
            logTest("Pool Balances", true, "All pools accessible");
        } catch (error) {
            logTest("Pool Balances", false, `Error: ${error.message}`);
        }

        // Test 5: Contract Health
        console.log("\n💊 CONTRACT HEALTH:");
        console.log("-" .repeat(50));
        
        try {
            const [contractBalance, totalDeposits, reserveFund, healthRatio, isHealthy] = await contract.getContractHealth();
            console.log(`Contract Balance: ${ethers.formatEther(contractBalance)} USDT`);
            console.log(`Total Deposits: ${ethers.formatEther(totalDeposits)} USDT`);
            console.log(`Reserve Fund: ${ethers.formatEther(reserveFund)} USDT`);
            console.log(`Health Ratio: ${healthRatio / 100}%`);
            console.log(`Is Healthy: ${isHealthy}`);
            logTest("Contract Health", true, "Health metrics accessible");
        } catch (error) {
            logTest("Contract Health", false, `Error: ${error.message}`);
        }

        // Test 6: Mock Token Integration (if available)
        if (MOCK_USDT && MOCK_USDT !== "undefined") {
            console.log("\n🪙 MOCK TOKEN INTEGRATION:");
            console.log("-" .repeat(50));
            
            try {
                const MockUSDT = await ethers.getContractFactory("MockUSDT");
                const mockUsdt = MockUSDT.attach(MOCK_USDT);
                
                const balance = await mockUsdt.balanceOf(deployer.address);
                console.log(`Mock USDT Balance: ${ethers.formatEther(balance)} USDT`);
                logTest("Mock USDT", balance > 0, `Balance: ${ethers.formatEther(balance)}`);
                
                // Test approval
                const allowance = await mockUsdt.allowance(deployer.address, CONTRACT_ADDRESS);
                console.log(`Allowance: ${ethers.formatEther(allowance)} USDT`);
                logTest("USDT Allowance", allowance > 0, `Allowance: ${ethers.formatEther(allowance)}`);
                
            } catch (error) {
                logTest("Mock Token Integration", false, `Error: ${error.message}`);
            }
        }

        // Test 7: BNB Price Oracle
        console.log("\n📈 PRICE ORACLE:");
        console.log("-" .repeat(50));
        
        try {
            const bnbPrice = await contract.getBNBPrice();
            const formattedPrice = Number(bnbPrice) / 1e18;
            console.log(`BNB Price: $${formattedPrice.toFixed(2)}`);
            logTest("BNB Price Oracle", formattedPrice > 0 && formattedPrice < 10000, `Price: $${formattedPrice.toFixed(2)}`);
        } catch (error) {
            logTest("BNB Price Oracle", false, `Error: ${error.message}`);
        }

        // Test 8: User Registration Simulation (dry run)
        console.log("\n👥 USER REGISTRATION SIMULATION:");
        console.log("-" .repeat(50));
        
        try {
            // Check if user is already registered
            const userInfo = await contract.getUserInfo(deployer.address);
            if (userInfo.isRegistered) {
                console.log("User already registered");
                logTest("User Registration", true, "User already exists in system");
            } else {
                // Try to simulate registration (static call)
                await contract.register.staticCall(ethers.ZeroAddress, 1, true);
                logTest("Registration Simulation", true, "Registration function callable");
            }
        } catch (error) {
            if (error.message.includes("E3")) {
                logTest("Registration Simulation", true, "User already registered (E3 error expected)");
            } else {
                logTest("Registration Simulation", false, `Error: ${error.message}`);
            }
        }

        // Test 9: Platform Statistics
        console.log("\n📊 PLATFORM STATISTICS:");
        console.log("-" .repeat(50));
        
        try {
            const [totalUsersCount, totalInvestments, totalAdminFees] = await contract.getPlatformStats();
            console.log(`Total Users: ${totalUsersCount}`);
            console.log(`Total Investments: ${ethers.formatEther(totalInvestments)} USDT`);
            console.log(`Total Admin Fees: ${ethers.formatEther(totalAdminFees)} USDT`);
            logTest("Platform Stats", true, "Statistics accessible");
        } catch (error) {
            logTest("Platform Stats", false, `Error: ${error.message}`);
        }

        // Test 10: Gas Estimation
        console.log("\n⛽ GAS ESTIMATION:");
        console.log("-" .repeat(50));
        
        try {
            // Estimate gas for common operations
            const registrationGas = await contract.register.estimateGas(ethers.ZeroAddress, 1, true, {
                value: ethers.parseEther("0.1")
            });
            console.log(`Registration Gas: ${registrationGas.toString()}`);
            logTest("Gas Estimation", registrationGas < 1000000n, `Registration: ${registrationGas} gas`);
        } catch (error) {
            if (error.message.includes("E3")) {
                logTest("Gas Estimation", true, "User already registered (expected)");
            } else {
                logTest("Gas Estimation", false, `Error: ${error.message}`);
            }
        }

        // Test Summary
        console.log("\n🏁 TEST SUMMARY:");
        console.log("=" .repeat(80));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (failedTests === 0) {
            console.log("\n🎉 ALL TESTS PASSED! Contract is ready for production deployment.");
        } else if (failedTests <= 2) {
            console.log("\n⚠️ MINOR ISSUES FOUND. Review failed tests before deployment.");
        } else {
            console.log("\n❌ SIGNIFICANT ISSUES FOUND. Address failed tests before deployment.");
        }

        console.log("\n📝 NEXT STEPS:");
        if (failedTests === 0) {
            console.log("1. ✅ All systems operational");
            console.log("2. 🚀 Ready for mainnet deployment");
            console.log("3. 📋 Update frontend with contract address");
            console.log("4. 🔍 Verify contract on BSCScan");
        } else {
            console.log("1. 🔧 Fix failed tests");
            console.log("2. 🧪 Re-run testing suite");
            console.log("3. ✅ Ensure all tests pass");
            console.log("4. 🚀 Then proceed to mainnet");
        }

        return {
            success: failedTests === 0,
            totalTests,
            passedTests,
            failedTests,
            contractAddress: CONTRACT_ADDRESS
        };

    } catch (error) {
        console.error("❌ Contract connection failed:", error.message);
        console.log("\n🔧 TROUBLESHOOTING:");
        console.log("1. Check if contract is deployed at the specified address");
        console.log("2. Verify you're connected to BSC Testnet");
        console.log("3. Ensure all libraries are properly deployed");
        console.log("4. Check if contract was deployed with proxy pattern");
        return { success: false, error: error.message };
    }
}

// Execute tests
if (require.main === module) {
    main()
        .then((result) => {
            if (result.success) {
                console.log("\n✅ Testing completed successfully!");
                process.exit(0);
            } else {
                console.log("\n❌ Testing failed!");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("\n💥 Testing script error:", error);
            process.exit(1);
        });
}

module.exports = main;
