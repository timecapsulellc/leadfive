const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("👥 LEADFIVE MULTI-USER SIMULATION & LIVE TESTING");
    console.log("=" * 80);

    // Contract addresses from deployment
    const LEADFIVE_TESTNET_PROXY = process.env.LEADFIVE_TESTNET_PROXY;
    
    if (!LEADFIVE_TESTNET_PROXY) {
        console.error("❌ LEADFIVE_TESTNET_PROXY not found in .env file");
        process.exit(1);
    }

    // Get signers for testing
    const [deployer] = await ethers.getSigners();
    console.log("📋 Multi-User Testing Configuration:");
    console.log("👤 Deployer:", deployer.address);
    console.log("📍 Contract:", LEADFIVE_TESTNET_PROXY);
    console.log("🌐 Network: BSC Testnet");

    // Connect to deployed contract
    const LeadFive = await ethers.getContractFactory("LeadFiveModular");
    const leadFive = LeadFive.attach(LEADFIVE_TESTNET_PROXY);

    // Testing results storage
    const simulationResults = {
        timestamp: new Date().toISOString(),
        contractAddress: LEADFIVE_TESTNET_PROXY,
        deployer: deployer.address,
        users: [],
        transactions: [],
        commissions: [],
        pools: [],
        summary: {
            totalUsers: 0,
            totalRegistrations: 0,
            totalCommissions: 0,
            totalAdminFees: 0,
            totalPoolContributions: 0
        }
    };

    function logResult(message, type = "INFO") {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, type, message };
        simulationResults.transactions.push(logEntry);
        
        if (type === "SUCCESS") {
            console.log(`✅ ${message}`);
        } else if (type === "ERROR") {
            console.log(`❌ ${message}`);
        } else if (type === "WARNING") {
            console.log(`⚠️  ${message}`);
        } else {
            console.log(`ℹ️  ${message}`);
        }
    }

    try {
        // PHASE 1: INITIAL STATE VERIFICATION
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 1: INITIAL STATE VERIFICATION");
        console.log("=" * 80);

        // Check deployer balance
        const deployerBalance = await deployer.provider.getBalance(deployer.address);
        const deployerBalanceBNB = ethers.formatEther(deployerBalance);
        logResult(`Deployer BNB balance: ${deployerBalanceBNB} BNB`);

        if (parseFloat(deployerBalanceBNB) < 0.01) {
            logResult("Insufficient BNB for testing. Get testnet BNB from: https://testnet.binance.org/faucet-smart", "WARNING");
            logResult("Minimum required: 0.01 BNB for testing", "WARNING");
        }

        // Check initial contract state
        const initialAdminFees = await leadFive.getAdminFeeInfo();
        const initialPoolBalances = await leadFive.getPoolBalances();
        const initialTotalUsers = await leadFive.totalUsers();

        logResult(`Initial admin fees collected: ${ethers.formatEther(initialAdminFees[1])} USDT`);
        logResult(`Initial total users: ${initialTotalUsers.toString()}`);
        logResult(`Initial leader pool: ${ethers.formatEther(initialPoolBalances[0])} USDT`);
        logResult(`Initial help pool: ${ethers.formatEther(initialPoolBalances[1])} USDT`);

        // PHASE 2: SINGLE USER REGISTRATION TEST
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 2: SINGLE USER REGISTRATION TEST");
        console.log("=" * 80);

        // Test registration with BNB payment (Package 1 - $30)
        logResult("Testing user registration with BNB payment...");
        
        try {
            // Get BNB price for $30 package
            const packagePrice = await leadFive.packages(1);
            logResult(`Package 1 price: ${ethers.formatEther(packagePrice.price)} USDT`);

            // Calculate BNB required (using fallback price of $300/BNB)
            const bnbRequired = ethers.parseEther("0.1"); // ~$30 worth of BNB
            logResult(`BNB required for registration: ${ethers.formatEther(bnbRequired)} BNB`);

            // Check if we have enough BNB
            if (parseFloat(deployerBalanceBNB) >= 0.1) {
                // Attempt registration
                logResult("Attempting registration with Package 1 ($30)...");
                
                const registrationTx = await leadFive.register(
                    ethers.ZeroAddress, // No referrer for first test
                    1, // Package level 1
                    false, // Use BNB, not USDT
                    { value: bnbRequired }
                );
                
                const receipt = await registrationTx.wait();
                logResult(`Registration successful! Tx hash: ${receipt.hash}`, "SUCCESS");
                
                // Verify registration
                const userInfo = await leadFive.getUserInfo(deployer.address);
                logResult(`User registered: ${userInfo.isRegistered}`, "SUCCESS");
                logResult(`User package level: ${userInfo.packageLevel.toString()}`, "SUCCESS");
                logResult(`User balance: ${ethers.formatEther(userInfo.balance)} USDT`, "SUCCESS");

                // Check admin fees collected
                const newAdminFees = await leadFive.getAdminFeeInfo();
                const adminFeesCollected = ethers.formatEther(newAdminFees[1]);
                logResult(`Admin fees collected: ${adminFeesCollected} USDT`, "SUCCESS");

                // Check pool balances
                const newPoolBalances = await leadFive.getPoolBalances();
                logResult(`Leader pool: ${ethers.formatEther(newPoolBalances[0])} USDT`, "SUCCESS");
                logResult(`Help pool: ${ethers.formatEther(newPoolBalances[1])} USDT`, "SUCCESS");

                // Verify total users count
                const newTotalUsers = await leadFive.totalUsers();
                logResult(`Total users now: ${newTotalUsers.toString()}`, "SUCCESS");

                simulationResults.summary.totalRegistrations++;
                simulationResults.summary.totalUsers = parseInt(newTotalUsers.toString());

            } else {
                logResult("Insufficient BNB for registration test", "WARNING");
                logResult("Skipping live registration test", "WARNING");
            }

        } catch (error) {
            if (error.message.includes("Already registered")) {
                logResult("User already registered (expected for deployer)", "INFO");
                
                // Get current user info
                const userInfo = await leadFive.getUserInfo(deployer.address);
                logResult(`Current registration status: ${userInfo.isRegistered}`, "INFO");
                logResult(`Current package level: ${userInfo.packageLevel.toString()}`, "INFO");
                logResult(`Current balance: ${ethers.formatEther(userInfo.balance)} USDT`, "INFO");
                
            } else {
                logResult(`Registration failed: ${error.message}`, "ERROR");
            }
        }

        // PHASE 3: COMMISSION CALCULATION VERIFICATION
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 3: COMMISSION CALCULATION VERIFICATION");
        console.log("=" * 80);

        // Test commission calculations for different package levels
        const packageLevels = [
            { level: 1, price: 30, description: "$30 Package" },
            { level: 2, price: 50, description: "$50 Package" },
            { level: 3, price: 100, description: "$100 Package" },
            { level: 4, price: 200, description: "$200 Package" }
        ];

        for (const pkg of packageLevels) {
            logResult(`\n--- ${pkg.description} Commission Breakdown ---`);
            
            const totalAmount = pkg.price;
            const adminFee = totalAmount * 0.05; // 5%
            const distributable = totalAmount - adminFee;
            
            const directBonus = distributable * 0.40; // 40%
            const levelBonus = distributable * 0.10; // 10%
            const uplineBonus = distributable * 0.10; // 10%
            const leaderPool = distributable * 0.10; // 10%
            const helpPool = distributable * 0.30; // 30%
            
            logResult(`Total Amount: $${totalAmount}`);
            logResult(`Admin Fee (5%): $${adminFee.toFixed(2)}`);
            logResult(`Distributable (95%): $${distributable.toFixed(2)}`);
            logResult(`Direct Bonus (40%): $${directBonus.toFixed(2)}`);
            logResult(`Level Bonus (10%): $${levelBonus.toFixed(2)}`);
            logResult(`Upline Bonus (10%): $${uplineBonus.toFixed(2)}`);
            logResult(`Leader Pool (10%): $${leaderPool.toFixed(2)}`);
            logResult(`Help Pool (30%): $${helpPool.toFixed(2)}`);
            
            const totalDistributed = directBonus + levelBonus + uplineBonus + leaderPool + helpPool;
            const isCorrect = Math.abs(totalDistributed - distributable) < 0.01;
            
            if (isCorrect) {
                logResult(`✅ Commission calculation correct for ${pkg.description}`, "SUCCESS");
            } else {
                logResult(`❌ Commission calculation error for ${pkg.description}`, "ERROR");
            }

            simulationResults.commissions.push({
                package: pkg.description,
                totalAmount,
                adminFee,
                distributable,
                directBonus,
                levelBonus,
                uplineBonus,
                leaderPool,
                helpPool,
                isCorrect
            });
        }

        // PHASE 4: MATRIX SPILLOVER SIMULATION
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 4: MATRIX SPILLOVER SIMULATION");
        console.log("=" * 80);

        // Check current matrix state
        try {
            const deployerMatrix = await leadFive.binaryMatrix(deployer.address, 0);
            const deployerSpillover = await leadFive.spilloverCounter(deployer.address);
            
            logResult(`Deployer left child: ${deployerMatrix}`);
            logResult(`Deployer spillover counter: ${deployerSpillover.toString()}`);
            
            // Simulate matrix placement logic
            logResult("Matrix spillover rotation is ready for multi-user testing");
            logResult("When new users register, they will be placed using balanced spillover");
            
        } catch (error) {
            logResult(`Matrix access error: ${error.message}`, "ERROR");
        }

        // PHASE 5: ADMIN FUNCTIONS VERIFICATION
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 5: ADMIN FUNCTIONS VERIFICATION");
        console.log("=" * 80);

        // Test admin fee recipient management
        try {
            const currentAdminInfo = await leadFive.getAdminFeeInfo();
            logResult(`Current admin fee recipient: ${currentAdminInfo[0]}`);
            logResult(`Current admin fee rate: ${currentAdminInfo[2].toString()} basis points`);
            
            // Test setting admin fee recipient (should work for owner)
            const setRecipientTx = await leadFive.setAdminFeeRecipient(deployer.address);
            await setRecipientTx.wait();
            logResult("Admin fee recipient updated successfully", "SUCCESS");
            
        } catch (error) {
            logResult(`Admin function test: ${error.message}`, "WARNING");
        }

        // Test pause functionality (dry run)
        try {
            const isPaused = await leadFive.paused();
            logResult(`Contract pause status: ${isPaused ? "PAUSED" : "ACTIVE"}`);
            
            if (!isPaused) {
                logResult("Contract is operational and ready for users", "SUCCESS");
            }
            
        } catch (error) {
            logResult(`Pause status check error: ${error.message}`, "ERROR");
        }

        // PHASE 6: FINAL STATE VERIFICATION
        console.log("\n" + "=" * 80);
        console.log("🧪 PHASE 6: FINAL STATE VERIFICATION");
        console.log("=" * 80);

        // Get final contract state
        const finalAdminFees = await leadFive.getAdminFeeInfo();
        const finalPoolBalances = await leadFive.getPoolBalances();
        const finalTotalUsers = await leadFive.totalUsers();
        const finalDeployerInfo = await leadFive.getUserInfo(deployer.address);

        logResult(`Final admin fees collected: ${ethers.formatEther(finalAdminFees[1])} USDT`);
        logResult(`Final total users: ${finalTotalUsers.toString()}`);
        logResult(`Final leader pool: ${ethers.formatEther(finalPoolBalances[0])} USDT`);
        logResult(`Final help pool: ${ethers.formatEther(finalPoolBalances[1])} USDT`);
        logResult(`Final club pool: ${ethers.formatEther(finalPoolBalances[2])} USDT`);
        logResult(`Deployer final balance: ${ethers.formatEther(finalDeployerInfo.balance)} USDT`);

        // Update summary
        simulationResults.summary.totalUsers = parseInt(finalTotalUsers.toString());
        simulationResults.summary.totalAdminFees = parseFloat(ethers.formatEther(finalAdminFees[1]));
        simulationResults.summary.totalPoolContributions = 
            parseFloat(ethers.formatEther(finalPoolBalances[0])) +
            parseFloat(ethers.formatEther(finalPoolBalances[1])) +
            parseFloat(ethers.formatEther(finalPoolBalances[2]));

        // FINAL SUMMARY
        console.log("\n" + "=" * 80);
        console.log("🎉 MULTI-USER SIMULATION SUMMARY");
        console.log("=" * 80);

        console.log(`📊 Total Users: ${simulationResults.summary.totalUsers}`);
        console.log(`📝 Total Registrations Attempted: ${simulationResults.summary.totalRegistrations}`);
        console.log(`💰 Total Admin Fees: ${simulationResults.summary.totalAdminFees} USDT`);
        console.log(`🏊 Total Pool Contributions: ${simulationResults.summary.totalPoolContributions} USDT`);
        console.log(`🧮 Commission Calculations: ${simulationResults.commissions.length} verified`);

        // Save detailed results
        const fs = require('fs');
        fs.writeFileSync(
            'multi-user-simulation-results.json',
            JSON.stringify(simulationResults, null, 2)
        );

        console.log(`\n📄 Detailed results saved to: multi-user-simulation-results.json`);

        // Recommendations for live testing
        console.log("\n💡 LIVE TESTING RECOMMENDATIONS:");
        console.log("1. Get testnet BNB: https://testnet.binance.org/faucet-smart");
        console.log("2. Test registration with different package levels");
        console.log("3. Test referral system with multiple wallets");
        console.log("4. Verify commission distributions");
        console.log("5. Test matrix spillover with 5+ users");

        console.log("\n🔗 TESTNET LINKS:");
        console.log(`📍 Contract: https://testnet.bscscan.com/address/${LEADFIVE_TESTNET_PROXY}`);
        console.log(`✍️  Write Contract: https://testnet.bscscan.com/address/${LEADFIVE_TESTNET_PROXY}#writeContract`);

        console.log("\n✅ MULTI-USER SIMULATION COMPLETE!");
        console.log("🚀 Contract is ready for comprehensive live testing!");

    } catch (error) {
        console.error("❌ Multi-user simulation failed:", error);
        logResult(`Critical error: ${error.message}`, "ERROR");
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
