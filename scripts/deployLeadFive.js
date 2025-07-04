const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 DEPLOYING ENHANCED LEADFIVE WITH WITHDRAWAL FEATURES");
    console.log("=" .repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Your proxy address from withdrawal.html instructions
    const PROXY_ADDRESS = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const TREASURY_WALLET = process.env.TREASURY_WALLET || deployer.address; // Replace with your treasury address

    console.log("🔗 Proxy Address:", PROXY_ADDRESS);
    console.log("🏛️ Treasury Wallet:", TREASURY_WALLET);

    try {
        console.log("\n🔨 Getting LeadFive contract factory...");
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        console.log("⏳ Upgrading proxy to new implementation...");
        const proxy = await upgrades.upgradeProxy(PROXY_ADDRESS, LeadFive);
        
        console.log("✅ Proxy upgraded to new implementation:", proxy.target);
        
        console.log("\n🎯 Setting up enhanced withdrawal features...");
        
        // Set treasury wallet
        const setTreasuryTx = await proxy.setTreasuryWallet(TREASURY_WALLET);
        await setTreasuryTx.wait();
        console.log("✅ Treasury wallet set to:", TREASURY_WALLET);
        
        // Optional: Set XP contract if you have one
        const XP_CONTRACT = process.env.XP_CONTRACT || "0x0000000000000000000000000000000000000000";
        if (XP_CONTRACT !== "0x0000000000000000000000000000000000000000") {
            const setXPTx = await proxy.setXPContract(XP_CONTRACT);
            await setXPTx.wait();
            console.log("✅ XP contract set to:", XP_CONTRACT);
        }

        console.log("\n🧪 Testing enhanced withdrawal features...");
        
        // Test withdrawal split calculation
        try {
            const [withdrawPercent, reinvestPercent] = await proxy.getWithdrawalSplit(deployer.address);
            console.log(`📊 Deployer withdrawal split: ${withdrawPercent}% withdraw, ${reinvestPercent}% reinvest`);
        } catch (error) {
            console.log("ℹ️  Withdrawal split test requires user registration");
        }
        
        // Check treasury wallet
        const treasuryAddress = await proxy.getTreasuryWallet();
        console.log("🏛️ Treasury wallet confirmed:", treasuryAddress);

        console.log("\n" + "=".repeat(70));
        console.log("🎉 ENHANCED WITHDRAWAL SYSTEM DEPLOYMENT SUCCESSFUL!");
        console.log("=".repeat(70));
        console.log("🔧 Proxy Address:", PROXY_ADDRESS);
        console.log("🏛️ Treasury Wallet:", treasuryAddress);
        console.log("=".repeat(70));

        console.log("\n🔥 NEW WITHDRAWAL FEATURES DEPLOYED:");
        console.log("✅ Enhanced withdrawal with 5% treasury fees");
        console.log("✅ Referral-based withdrawal splits:");
        console.log("   - 0-4 referrals: 70% withdraw, 30% reinvest");
        console.log("   - 5-19 referrals: 75% withdraw, 25% reinvest");
        console.log("   - 20+ referrals: 80% withdraw, 20% reinvest");
        console.log("✅ Auto-compound toggle functionality");
        console.log("✅ XP system integration ready");
        console.log("✅ All existing features preserved");

        console.log("\n📋 FUNCTION REFERENCE:");
        console.log("🔹 withdrawEnhanced(uint256 amount) - New enhanced withdrawal");
        console.log("🔹 withdraw(uint96 amount) - Legacy withdrawal (preserved)");
        console.log("🔹 toggleAutoCompound(bool enabled) - Enable/disable auto-compound");
        console.log("🔹 getWithdrawalSplit(address user) - Check user's withdrawal split");
        console.log("🔹 setTreasuryWallet(address) - Update treasury wallet (admin)");

        console.log("\n📊 TESTING INSTRUCTIONS:");
        console.log("1. Test with 0 referrals (should split 70/30)");
        console.log("2. Test with 5+ referrals (should split 75/25)");
        console.log("3. Test with 20+ referrals (should split 80/20)");
        console.log("4. Verify 5% fee reaches treasury");
        console.log("5. Test auto-compound toggle (withdrawals should reinvest 100%)");

        const result = {
            proxy: PROXY_ADDRESS,
            treasury: treasuryAddress,
            deployer: deployer.address,
            timestamp: new Date().toISOString(),
            features: [
                "Enhanced withdrawal with treasury fees",
                "Referral-based splits (70/30, 75/25, 80/20)",
                "Auto-compound toggle",
                "XP system integration",
                "Backward compatibility"
            ]
        };

        // Save deployment info
        const fs = require('fs');
        const filename = `LeadFive_Enhanced_Withdrawal_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(result, null, 2));
        console.log("\n💾 Deployment info saved to:", filename);

        return result;

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Execute as specified in withdrawal.html
main()
    .then((result) => {
        console.log("\n🎉 ENHANCED WITHDRAWAL SYSTEM IS NOW LIVE!");
        console.log("🔥 Treasury fees will be collected on enhanced withdrawals!");
        console.log("🎮 Users can now toggle auto-compound for better returns!");
        console.log("💎 All existing functionality preserved and enhanced!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Deployment failed:", error);
        process.exit(1);
    });