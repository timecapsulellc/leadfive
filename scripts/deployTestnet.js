const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🧪 DEPLOYING ENHANCED WITHDRAWAL SYSTEM TO BSC TESTNET");
    console.log("=" .repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Configuration for BSC Testnet
    const PROXY_ADDRESS = process.env.TESTNET_CONTRACT_ADDRESS || "DEPLOY_NEW"; // Set if upgrading existing
    const TREASURY_WALLET = process.env.TREASURY_WALLET || deployer.address;
    const TESTNET_USDT = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
    
    console.log("🔗 Network: BSC Testnet");
    console.log("🏛️ Treasury Wallet:", TREASURY_WALLET);
    console.log("💱 Testnet USDT:", TESTNET_USDT);

    try {
        const LeadFive = await ethers.getContractFactory("LeadFive");
        let proxy;

        if (PROXY_ADDRESS === "DEPLOY_NEW") {
            console.log("\n🆕 DEPLOYING NEW CONTRACT TO TESTNET");
            console.log("-".repeat(50));
            
            // Deploy new proxy for testnet
            proxy = await upgrades.deployProxy(LeadFive, [
                TESTNET_USDT, // USDT address for testnet
                "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526" // BNB/USD price feed for testnet
            ], { 
                initializer: 'initialize',
                kind: 'uups'
            });
            
            await proxy.waitForDeployment();
            console.log("✅ New LeadFive proxy deployed to:", proxy.target);
            
        } else {
            console.log("\n🔄 UPGRADING EXISTING TESTNET CONTRACT");
            console.log("-".repeat(50));
            console.log("📋 Existing proxy:", PROXY_ADDRESS);
            
            // Upgrade existing proxy
            proxy = await upgrades.upgradeProxy(PROXY_ADDRESS, LeadFive);
            console.log("✅ Proxy upgraded to new implementation");
        }
        
        console.log("\n🎯 Setting up withdrawal features for testing...");
        
        // Set treasury wallet
        const setTreasuryTx = await proxy.setTreasuryWallet(TREASURY_WALLET);
        await setTreasuryTx.wait();
        console.log("✅ Treasury wallet set to:", TREASURY_WALLET);
        
        console.log("\n🧪 TESTNET TESTING CHECKLIST:");
        console.log("-".repeat(50));
        console.log("1. ✅ Contract deployed/upgraded successfully");
        console.log("2. ⏳ Test withdrawal splits (70/30, 75/25, 80/20)");
        console.log("3. ⏳ Test 5% treasury fee collection");
        console.log("4. ⏳ Test auto-compound functionality");
        console.log("5. ⏳ Test Help Pool reinvestment");
        console.log("6. ⏳ Test frontend integration");
        console.log("7. ⏳ Verify all legacy functions work");
        console.log("8. ⏳ Test edge cases and error handling");

        console.log("\n📋 TESTNET VERIFICATION:");
        const treasuryAddress = await proxy.getTreasuryWallet();
        const [pendingOwner, pendingTreasury] = await proxy.getPendingTransfers();
        
        console.log("🏛️ Treasury wallet:", treasuryAddress);
        console.log("👑 Contract owner:", await proxy.owner());
        console.log("⏳ Pending transfers:", pendingOwner, pendingTreasury);

        console.log("\n🎮 NEW FUNCTIONS TO TEST:");
        console.log("🔹 withdrawEnhanced(uint256) - Enhanced withdrawal with fees");
        console.log("🔹 toggleAutoCompound(bool) - Auto-compound toggle");
        console.log("🔹 getWithdrawalSplit(address) - Check withdrawal split");
        console.log("🔹 getUserReferralCount(address) - Get referral count");
        console.log("🔹 isAutoCompoundEnabled(address) - Check auto-compound status");

        console.log("\n💰 TESTNET TESTING SCENARIOS:");
        console.log("1. Register new user with 0 referrals → Test 70/30 split");
        console.log("2. User with 5 referrals → Test 75/25 split");
        console.log("3. User with 20+ referrals → Test 80/20 split");
        console.log("4. Enable auto-compound → Test 0/100 split + 5% bonus");
        console.log("5. Verify treasury receives 5% fees correctly");
        console.log("6. Test Help Pool gets reinvestments");

        const result = {
            network: "BSC Testnet",
            contractAddress: proxy.target,
            treasury: treasuryAddress,
            owner: await proxy.owner(),
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            testnetFeatures: [
                "Enhanced withdrawal with treasury fees",
                "Referral-based splits testing",
                "Auto-compound functionality",
                "Help Pool reinvestment system",
                "Development ownership retained",
                "Frontend integration ready"
            ],
            nextSteps: [
                "Run comprehensive testing on testnet",
                "Test all withdrawal scenarios",
                "Verify treasury fee collection",
                "Test frontend integration",
                "Deploy to mainnet after successful testing"
            ]
        };

        // Save testnet deployment info
        const fs = require('fs');
        const filename = `LeadFive_Testnet_Deployment_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(result, null, 2));
        console.log("\n💾 Testnet deployment info saved to:", filename);

        console.log("\n" + "=".repeat(70));
        console.log("🧪 TESTNET DEPLOYMENT SUCCESSFUL!");
        console.log("=".repeat(70));
        console.log("🔗 Contract Address:", proxy.target);
        console.log("🏛️ Treasury Wallet:", treasuryAddress);
        console.log("🌐 Network: BSC Testnet");
        console.log("🔧 Ready for comprehensive testing!");
        console.log("=".repeat(70));

        console.log("\n⚠️  NEXT STEPS:");
        console.log("1. Run comprehensive tests on testnet");
        console.log("2. Test frontend integration");
        console.log("3. Verify all withdrawal scenarios");
        console.log("4. Deploy to mainnet after successful testing");

        return result;

    } catch (error) {
        console.error("❌ Testnet deployment failed:", error);
        throw error;
    }
}

// Execute testnet deployment
main()
    .then((result) => {
        console.log("\n🎉 TESTNET DEPLOYMENT COMPLETED!");
        console.log("🧪 Ready for comprehensive testing!");
        console.log("🚀 Deploy to mainnet after successful testing!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Testnet deployment failed:", error);
        process.exit(1);
    });