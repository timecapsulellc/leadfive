const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🧪 DEPLOYING SIMPLIFIED LEADFIVE TO BSC TESTNET");
    console.log("=" .repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Configuration for BSC Testnet
    const TREASURY_WALLET = process.env.TREASURY_WALLET || deployer.address;
    const TESTNET_USDT = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
    
    console.log("🔗 Network: BSC Testnet");
    console.log("🏛️ Treasury Wallet:", TREASURY_WALLET);
    console.log("💱 Testnet USDT:", TESTNET_USDT);

    try {
        console.log("\n🆕 DEPLOYING NEW TESTNET CONTRACT");
        console.log("-".repeat(50));
        
        // Deploy testnet contract (simplified version)
        const LeadFiveTestnet = await ethers.getContractFactory("LeadFiveTestnet");
        
        console.log("⏳ Deploying proxy...");
        const proxy = await upgrades.deployProxy(LeadFiveTestnet, [
            TESTNET_USDT // USDT address for testnet
        ], { 
            initializer: 'initialize',
            kind: 'uups'
        });
        
        await proxy.waitForDeployment();
        console.log("✅ LeadFive Testnet deployed to:", proxy.target);
        
        console.log("\n🎯 Setting up withdrawal features for testing...");
        
        // Set treasury wallet
        console.log("🏛️ Setting treasury wallet...");
        const setTreasuryTx = await proxy.setTreasuryWallet(TREASURY_WALLET);
        await setTreasuryTx.wait();
        console.log("✅ Treasury wallet set to:", TREASURY_WALLET);
        
        // Add some test balance for withdrawal testing
        console.log("\n💰 Adding test balance for withdrawal testing...");
        // Note: In real scenario, users would register and earn through the system
        
        console.log("\n🧪 TESTNET TESTING CHECKLIST:");
        console.log("-".repeat(50));
        console.log("1. ✅ Contract deployed successfully");
        console.log("2. ⏳ Test user registration");
        console.log("3. ⏳ Test withdrawal splits (70/30, 75/25, 80/20)");
        console.log("4. ⏳ Test 5% treasury fee collection");
        console.log("5. ⏳ Test auto-compound functionality");
        console.log("6. ⏳ Test Help Pool reinvestment");
        console.log("7. ⏳ Test frontend integration");
        console.log("8. ⏳ Verify all edge cases");

        console.log("\n📋 TESTNET VERIFICATION:");
        const treasuryAddress = await proxy.getTreasuryWallet();
        const [pendingOwner, pendingTreasury] = await proxy.getPendingTransfers();
        const poolBalances = await proxy.getPoolBalances();
        
        console.log("🏛️ Treasury wallet:", treasuryAddress);
        console.log("👑 Contract owner:", await proxy.owner());
        console.log("⏳ Pending transfers:", pendingOwner, pendingTreasury);
        console.log("💰 Pool balances:", poolBalances);

        console.log("\n🎮 NEW FUNCTIONS TO TEST:");
        console.log("🔹 register(address referrer, uint8 packageLevel) - Register new user");
        console.log("🔹 withdrawEnhanced(uint256 amount) - Enhanced withdrawal with fees");
        console.log("🔹 toggleAutoCompound(bool enabled) - Auto-compound toggle");
        console.log("🔹 getWithdrawalSplit(address user) - Check withdrawal split");
        console.log("🔹 getUserReferralCount(address user) - Get referral count");
        console.log("🔹 isAutoCompoundEnabled(address user) - Check auto-compound status");

        console.log("\n💰 STEP-BY-STEP TESTING GUIDE:");
        console.log("1. Register users with different referral structures");
        console.log("2. Add balances to users (simulate earnings)");
        console.log("3. Test withdrawal with 0 referrals → Check 70/30 split");
        console.log("4. Register 5+ referrals → Test 75/25 split");
        console.log("5. Register 20+ referrals → Test 80/20 split");
        console.log("6. Enable auto-compound → Test 0/100 split + 5% bonus");
        console.log("7. Verify treasury receives 5% fees correctly");
        console.log("8. Test Help Pool gets reinvestments");

        console.log("\n🔧 TESTING COMMANDS:");
        console.log("// Test withdrawal for user with no referrals");
        console.log("await contract.withdrawEnhanced(ethers.parseUnits('100', 18));");
        console.log("");
        console.log("// Toggle auto-compound");
        console.log("await contract.toggleAutoCompound(true);");
        console.log("");
        console.log("// Check withdrawal split");
        console.log("await contract.getWithdrawalSplit(userAddress);");

        const result = {
            network: "BSC Testnet",
            contractAddress: proxy.target,
            treasury: treasuryAddress,
            owner: await proxy.owner(),
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            testnetFeatures: [
                "Simplified contract without external libraries",
                "Enhanced withdrawal with treasury fees",
                "Referral-based splits testing",
                "Auto-compound functionality",
                "Help Pool reinvestment system",
                "Development ownership retained",
                "Client handover functions ready"
            ],
            testingSteps: [
                "Register users with different referral structures",
                "Test all withdrawal scenarios",
                "Verify treasury fee collection",
                "Test auto-compound functionality",
                "Verify Help Pool reinvestment",
                "Test frontend integration",
                "Validate edge cases and error handling",
                "Deploy to mainnet after successful testing"
            ]
        };

        // Save testnet deployment info
        const fs = require('fs');
        const filename = `LeadFive_Testnet_Simple_${Date.now()}.json`;
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
        console.log("1. Test all withdrawal scenarios on testnet");
        console.log("2. Verify treasury fee collection works");
        console.log("3. Test frontend integration with testnet contract");
        console.log("4. Validate all business logic");
        console.log("5. Deploy upgrade to mainnet after successful testing");

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
        console.log("🧪 Ready for comprehensive withdrawal testing!");
        console.log("🚀 Deploy to mainnet after successful testing!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Testnet deployment failed:", error);
        process.exit(1);
    });