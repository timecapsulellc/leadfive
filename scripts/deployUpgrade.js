const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 UPGRADING LEADFIVE WITH ENHANCED WITHDRAWAL FEATURES (DEVELOPMENT MODE)");
    console.log("=" .repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Configuration for development and testing
    const PROXY_ADDRESS = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const TREASURY_WALLET = process.env.TREASURY_WALLET || deployer.address; // Use deployer for testing
    
    console.log("🔗 Proxy Address:", PROXY_ADDRESS);
    console.log("🏛️ Treasury Wallet (Testing):", TREASURY_WALLET);
    console.log("👑 Current Owner (Developer):", deployer.address);

    try {
        console.log("\n🔨 Getting LeadFive contract factory...");
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        console.log("⏳ Upgrading proxy to new implementation...");
        const proxy = await upgrades.upgradeProxy(PROXY_ADDRESS, LeadFive);
        
        console.log("✅ Proxy upgraded to new implementation:", proxy.target);
        
        console.log("\n🎯 Setting up withdrawal features for testing...");
        
        // Set treasury wallet to deployer for testing
        console.log("🔧 Setting treasury wallet for development/testing...");
        const setTreasuryTx = await proxy.setTreasuryWallet(TREASURY_WALLET);
        await setTreasuryTx.wait();
        console.log("✅ Treasury wallet set to:", TREASURY_WALLET);
        
        console.log("\n👑 Keeping ownership with developer for testing...");
        console.log("📋 Contract owner remains:", deployer.address);
        console.log("ℹ️  Use ownership transfer functions when ready for client handover");

        console.log("\n🧪 Testing enhanced withdrawal features...");
        
        // Test withdrawal split calculation
        try {
            const [withdrawPercent, reinvestPercent] = await proxy.getWithdrawalSplit(deployer.address);
            console.log(`📊 Deployer withdrawal split: ${withdrawPercent}% withdraw, ${reinvestPercent}% reinvest`);
        } catch (error) {
            console.log("ℹ️  Withdrawal split test requires user registration");
        }
        
        // Verify treasury wallet configuration
        const treasuryAddress = await proxy.getTreasuryWallet();
        console.log("🏛️ Treasury wallet confirmed:", treasuryAddress);
        
        // Check pending transfers (should be empty initially)
        const [pendingOwner, pendingTreasury] = await proxy.getPendingTransfers();
        console.log("⏳ Pending owner transfer:", pendingOwner);
        console.log("⏳ Pending treasury transfer:", pendingTreasury);

        console.log("\n" + "=".repeat(70));
        console.log("🎉 ENHANCED WITHDRAWAL SYSTEM DEPLOYED (DEVELOPMENT MODE)!");
        console.log("=".repeat(70));
        console.log("🔗 Proxy Address:", PROXY_ADDRESS);
        console.log("🏛️ Treasury (Testing):", treasuryAddress);
        console.log("👑 Owner (Developer):", deployer.address);
        console.log("🔧 Mode: Development & Testing");
        console.log("=".repeat(70));

        console.log("\n🔥 DEVELOPMENT FEATURES IMPLEMENTED:");
        console.log("✅ Treasury wallet changeable for testing");
        console.log("✅ Ownership remains with developer");
        console.log("✅ Zero storage layout changes (upgrade-safe)");
        console.log("✅ All existing features preserved");
        console.log("✅ 5% withdrawal fees go to testing treasury");
        console.log("✅ Client handover functions ready");

        console.log("\n🎮 NEW WITHDRAWAL FEATURES:");
        console.log("✅ Enhanced withdrawal with treasury fees");
        console.log("✅ Referral-based withdrawal splits:");
        console.log("   - 0-4 referrals: 70% withdraw, 30% reinvest");
        console.log("   - 5-19 referrals: 75% withdraw, 25% reinvest");
        console.log("   - 20+ referrals: 80% withdraw, 20% reinvest");
        console.log("✅ Auto-compound toggle (0% withdraw, 100% reinvest + 5% bonus)");
        console.log("✅ Help Pool reinvestment system");
        console.log("✅ XP system integration ready");

        console.log("\n📋 FUNCTION REFERENCE:");
        console.log("🔹 withdrawEnhanced(uint256 amount) - New enhanced withdrawal");
        console.log("🔹 withdraw(uint96 amount) - Legacy withdrawal (preserved)");
        console.log("🔹 withdrawWithSafety() - Safety withdrawal (preserved)");
        console.log("🔹 toggleAutoCompound(bool enabled) - Enable/disable auto-compound");
        console.log("🔹 getWithdrawalSplit(address user) - Check user's withdrawal split");

        console.log("\n⚠️  IMPORTANT NOTES:");
        console.log("• Treasury wallet is changeable during development");
        console.log("• Developer retains ownership for testing");
        console.log("• All withdrawal fees (5%) go to testing treasury");
        console.log("• Reinvestments go to Help Pool for distribution");
        console.log("• Use transfer functions when ready for client handover");

        const result = {
            proxy: PROXY_ADDRESS,
            treasury: treasuryAddress,
            owner: deployer.address,
            mode: "development",
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            features: [
                "Development-friendly treasury (changeable)",
                "Developer retains ownership for testing",
                "Enhanced withdrawal with 5% fees",
                "Referral-based splits (70/30, 75/25, 80/20)",
                "Auto-compound toggle with 5% bonus",
                "Help Pool reinvestment system",
                "XP system integration ready",
                "Client handover functions ready",
                "Full backward compatibility"
            ]
        };

        // Save deployment info
        const fs = require('fs');
        const filename = `LeadFive_Development_Upgrade_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(result, null, 2));
        console.log("\n💾 Deployment info saved to:", filename);

        return result;

    } catch (error) {
        console.error("❌ Upgrade failed:", error);
        throw error;
    }
}

// Execute upgrade
main()
    .then((result) => {
        console.log("\n🎉 ENHANCED WITHDRAWAL SYSTEM IS NOW LIVE (DEVELOPMENT MODE)!");
        console.log("🔧 Treasury fees go to developer wallet for testing!");
        console.log("👑 Developer retains control for testing and configuration!");
        console.log("🚀 Frontend integration and testing ready!");
        console.log("📋 Use transfer functions when ready for client handover!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Upgrade failed:", error);
        process.exit(1);
    });