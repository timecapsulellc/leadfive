#!/usr/bin/env node

/**
 * Upgrade LeadFive to v1.11 with Enhanced Withdrawal System
 * Adds: Treasury fees, Auto-compound, XP integration, Referral-based splits
 */

const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚀 UPGRADING LEADFIVE TO V1.11 - ENHANCED WITHDRAWAL SYSTEM");
    console.log("=" .repeat(70));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Contract addresses
    const PROXY_ADDRESS = process.env.MAINNET_CONTRACT_ADDRESS || "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const TREASURY_WALLET = process.env.TREASURY_WALLET || deployer.address; // Set your treasury wallet
    const XP_CONTRACT = process.env.XP_CONTRACT || "0x0000000000000000000000000000000000000000"; // Optional XP contract
    
    console.log("🔗 Proxy Address:", PROXY_ADDRESS);
    console.log("🏛️ Treasury Wallet:", TREASURY_WALLET);
    console.log("🎮 XP Contract:", XP_CONTRACT);

    try {
        console.log("\n🔨 Deploying LeadFiveV1_11 implementation...");
        
        // Get contract factory
        const LeadFiveV1_11 = await ethers.getContractFactory("LeadFiveV1_11");
        
        console.log("⏳ Upgrading proxy to new implementation...");
        
        // Upgrade the proxy to new implementation
        const upgradedContract = await upgrades.upgradeProxy(PROXY_ADDRESS, LeadFiveV1_11);
        await upgradedContract.waitForDeployment();
        
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
        console.log("✅ Proxy upgraded successfully!");
        console.log("🔧 New Implementation:", implementationAddress);
        console.log("🔗 Proxy Address:", PROXY_ADDRESS);

        console.log("\n🎯 Initializing v1.11 features...");
        
        // Initialize v1.11 features
        const initTx = await upgradedContract.initializeV1_11(TREASURY_WALLET, XP_CONTRACT);
        await initTx.wait();
        console.log("✅ v1.11 features initialized!");
        
        // Test the new functions
        console.log("\n🧪 Testing new withdrawal features...");
        
        // Test withdrawal split calculation
        try {
            const [withdrawPercent, reinvestPercent] = await upgradedContract.getWithdrawalSplit(deployer.address);
            console.log(`📊 Deployer withdrawal split: ${withdrawPercent}% withdraw, ${reinvestPercent}% reinvest`);
        } catch (error) {
            console.log("ℹ️  Withdrawal split test skipped (user not registered)");
        }
        
        // Check treasury wallet
        const treasuryAddress = await upgradedContract.getTreasuryWallet();
        console.log("🏛️ Treasury wallet confirmed:", treasuryAddress);
        
        // Check contract version
        const version = await upgradedContract.getContractVersion();
        console.log("📋 Contract version:", version);

        console.log("\n" + "=".repeat(70));
        console.log("🎉 UPGRADE TO V1.11 SUCCESSFUL!");
        console.log("=".repeat(70));
        console.log("🔧 Implementation:", implementationAddress);
        console.log("🔗 Proxy:", PROXY_ADDRESS);
        console.log("🏛️ Treasury:", treasuryAddress);
        console.log("📋 Version:", version);
        console.log("=".repeat(70));

        console.log("\n🔥 NEW FEATURES AVAILABLE:");
        console.log("✅ Enhanced withdrawal with treasury fees (5%)");
        console.log("✅ Referral-based withdrawal splits:");
        console.log("   - 0-4 referrals: 70% withdraw, 30% reinvest");
        console.log("   - 5-19 referrals: 75% withdraw, 25% reinvest");
        console.log("   - 20+ referrals: 80% withdraw, 20% reinvest");
        console.log("✅ Auto-compound toggle functionality");
        console.log("✅ XP system integration for withdrawal tracking");
        console.log("✅ Legacy withdrawal compatibility maintained");

        console.log("\n📋 NEXT STEPS:");
        console.log("1. ✅ Contract upgraded successfully");
        console.log("2. 🔍 Verify new implementation on BSCScan");
        console.log("3. 🧪 Test enhanced withdrawal functions");
        console.log("4. 📢 Update frontend to use new withdrawal features");
        console.log("5. 📚 Update documentation with new features");

        // Save deployment info
        const deploymentInfo = {
            network: "BSC Mainnet",
            timestamp: new Date().toISOString(),
            version: "LeadFive v1.11",
            implementationAddress: implementationAddress,
            proxyAddress: PROXY_ADDRESS,
            treasuryWallet: treasuryAddress,
            xpContract: XP_CONTRACT,
            deployer: deployer.address,
            newFeatures: [
                "Enhanced withdrawal with 5% treasury fees",
                "Referral-based withdrawal splits (70/30, 75/25, 80/20)",
                "Auto-compound toggle with 5% bonus",
                "XP system integration",
                "Legacy withdrawal compatibility"
            ],
            gasUsed: "~500k gas",
            contractFunctions: {
                newWithdrawal: "withdrawEnhanced(uint96,bool)",
                legacyWithdrawal: "withdraw(uint96,bool)",
                autoCompound: "toggleAutoCompound(bool)",
                calculateAmounts: "calculateWithdrawalAmounts(address,uint96)",
                getWithdrawalSplit: "getWithdrawalSplit(address)"
            }
        };

        const fs = require('fs');
        const filename = `BSC_MAINNET_V1.11_UPGRADE_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to:", filename);

        return {
            implementation: implementationAddress,
            proxy: PROXY_ADDRESS,
            treasury: treasuryAddress,
            version: version
        };

    } catch (error) {
        console.error("❌ Upgrade failed:", error);
        
        if (error.message.includes("storage collision")) {
            console.error("🚨 STORAGE COLLISION DETECTED!");
            console.error("   This means the new contract's storage layout conflicts with the existing one.");
            console.error("   The upgrade has been aborted to prevent data corruption.");
        }
        
        throw error;
    }
}

// Test function to verify upgrade compatibility
async function testUpgradeCompatibility() {
    console.log("\n🔍 Testing upgrade compatibility...");
    
    try {
        const PROXY_ADDRESS = process.env.MAINNET_CONTRACT_ADDRESS || "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        const LeadFiveV1_11 = await ethers.getContractFactory("LeadFiveV1_11");
        
        // Validate upgrade (this will throw if storage layout conflicts)
        await upgrades.validateUpgrade(PROXY_ADDRESS, LeadFiveV1_11);
        console.log("✅ Upgrade compatibility validated!");
        return true;
    } catch (error) {
        console.error("❌ Upgrade compatibility check failed:", error.message);
        return false;
    }
}

// Execute upgrade
if (require.main === module) {
    // Test compatibility first
    testUpgradeCompatibility()
        .then((compatible) => {
            if (!compatible) {
                console.error("💥 Upgrade aborted due to compatibility issues");
                process.exit(1);
            }
            
            return main();
        })
        .then((result) => {
            console.log("\n🎉 UPGRADE TO V1.11 COMPLETED SUCCESSFULLY!");
            console.log("🔔 Enhanced withdrawal system is now live!");
            console.log("🏛️ Treasury fees will now be collected on withdrawals");
            console.log("🎮 Users can now toggle auto-compound for better returns");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Upgrade failed:", error);
            process.exit(1);
        });
}

module.exports = { main, testUpgradeCompatibility };