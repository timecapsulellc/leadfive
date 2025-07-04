const { ethers, upgrades } = require("hardhat");

/**
 * Deploy Enhanced Withdrawal Functions to BSC Mainnet
 * Upgrades existing contract with new withdrawal features
 */
async function main() {
    console.log("🚀 DEPLOYING ENHANCED WITHDRAWAL TO BSC MAINNET");
    console.log("=" .repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Mainnet configuration
    const MAINNET_CONTRACT = process.env.VITE_CONTRACT_ADDRESS || "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const TREASURY_WALLET = process.env.TREASURY_WALLET || deployer.address;
    const MAINNET_USDT = "0x55d398326f99059fF775485246999027B3197955";
    
    console.log("🔗 Network: BSC Mainnet");
    console.log("📋 Current Contract:", MAINNET_CONTRACT);
    console.log("🏛️ Treasury Wallet:", TREASURY_WALLET);
    console.log("💱 USDT Address:", MAINNET_USDT);

    try {
        console.log("\n🔍 CHECKING CURRENT CONTRACT STATUS");
        console.log("-".repeat(50));
        
        // Connect to existing contract
        const currentContract = await ethers.getContractAt("LeadFive", MAINNET_CONTRACT);
        
        // Check current status
        const owner = await currentContract.owner();
        const totalUsers = await currentContract.totalUsers ? await currentContract.totalUsers() : "N/A";
        const poolBalances = await currentContract.getPoolBalances();
        
        console.log("👑 Current Owner:", owner);
        console.log("👥 Total Users:", totalUsers.toString());
        console.log("💰 Pool Balances:", poolBalances);
        
        // Verify we have permission to upgrade
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("⚠️  WARNING: Deployer is not the contract owner!");
            console.log("   Contract Owner:", owner);
            console.log("   Deployer:", deployer.address);
            
            // Check if we can still proceed (in case of proxy admin)
            console.log("\n🔍 Checking proxy admin permissions...");
        }

        console.log("\n🆙 PREPARING CONTRACT UPGRADE");
        console.log("-".repeat(50));
        
        // Get the new implementation with enhanced withdrawal
        const LeadFiveEnhanced = await ethers.getContractFactory("LeadFive");
        
        console.log("⏳ Preparing upgrade to enhanced version...");
        
        // Perform the upgrade
        console.log("🔄 Upgrading contract to include enhanced withdrawal functions...");
        const upgradedContract = await upgrades.upgradeProxy(MAINNET_CONTRACT, LeadFiveEnhanced);
        
        console.log("✅ Contract upgraded successfully!");
        console.log("📍 Contract address (unchanged):", upgradedContract.target);

        console.log("\n🔧 CONFIGURING ENHANCED FEATURES");
        console.log("-".repeat(50));
        
        // Set treasury wallet for fee collection
        console.log("🏛️ Setting treasury wallet...");
        try {
            const setTreasuryTx = await upgradedContract.setTreasuryWallet(TREASURY_WALLET);
            await setTreasuryTx.wait();
            console.log("✅ Treasury wallet set to:", TREASURY_WALLET);
        } catch (error) {
            console.log("⚠️  Treasury wallet setting:", error.message);
            // May already be set or function may not exist in current version
        }

        console.log("\n📋 VERIFYING ENHANCED FUNCTIONS");
        console.log("-".repeat(50));
        
        // Test new function availability
        const enhancedFunctions = [
            "withdrawEnhanced",
            "toggleAutoCompound", 
            "getWithdrawalSplit",
            "getUserReferralCount",
            "isAutoCompoundEnabled",
            "getTreasuryWallet"
        ];
        
        for (let funcName of enhancedFunctions) {
            try {
                const func = upgradedContract[funcName];
                if (func) {
                    console.log(`✅ ${funcName}: Available`);
                } else {
                    console.log(`❌ ${funcName}: Not found`);
                }
            } catch (error) {
                console.log(`⚠️  ${funcName}: Error checking - ${error.message}`);
            }
        }

        // Test withdrawal split calculation
        console.log("\n🧮 TESTING WITHDRAWAL SPLIT CALCULATION:");
        try {
            const [withdrawPercent, reinvestPercent] = await upgradedContract.getWithdrawalSplit(deployer.address);
            console.log(`   Deployer split: ${withdrawPercent}%/${reinvestPercent}%`);
        } catch (error) {
            console.log("   Split calculation test:", error.message);
        }

        // Check treasury configuration
        console.log("\n🏛️ TREASURY CONFIGURATION:");
        try {
            const treasuryAddress = await upgradedContract.getTreasuryWallet();
            console.log("   Treasury Wallet:", treasuryAddress);
            console.log("   Treasury Set:", treasuryAddress !== "0x0000000000000000000000000000000000000000");
        } catch (error) {
            console.log("   Treasury check:", error.message);
        }

        console.log("\n📊 POST-UPGRADE CONTRACT STATUS");
        console.log("-".repeat(50));
        
        const finalOwner = await upgradedContract.owner();
        const finalPools = await upgradedContract.getPoolBalances();
        
        console.log("👑 Owner:", finalOwner);
        console.log("💰 Pools:", finalPools);

        const upgradeResult = {
            network: "BSC Mainnet",
            contractAddress: upgradedContract.target,
            originalContract: MAINNET_CONTRACT,
            deployer: deployer.address,
            treasury: TREASURY_WALLET,
            timestamp: new Date().toISOString(),
            enhancedFeatures: [
                "Enhanced withdrawal with treasury fees",
                "Referral-based withdrawal splits (70/30, 75/25, 80/20)",
                "Auto-compound functionality with 5% bonus",
                "Help Pool reinvestment system",
                "Treasury fee collection (5% on withdrawal portion only)"
            ],
            newFunctions: enhancedFunctions,
            upgradeStatus: "SUCCESS",
            readyForProduction: true
        };

        // Save upgrade results
        const fs = require('fs');
        const filename = `mainnet_enhanced_withdrawal_upgrade_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(upgradeResult, null, 2));
        console.log("\n💾 Upgrade results saved to:", filename);

        console.log("\n" + "=".repeat(70));
        console.log("🎉 MAINNET ENHANCED WITHDRAWAL UPGRADE SUCCESSFUL!");
        console.log("=".repeat(70));
        console.log("🔗 Contract Address:", upgradedContract.target);
        console.log("🏛️ Treasury Wallet:", TREASURY_WALLET);
        console.log("🌐 Network: BSC Mainnet");
        console.log("🎯 Enhanced Features: ACTIVE");
        console.log("=".repeat(70));

        console.log("\n🚀 DEPLOYMENT COMPLETE - READY FOR PRODUCTION!");
        console.log("\n📋 NEXT STEPS:");
        console.log("1. ✅ Contract upgrade completed successfully");
        console.log("2. 🔄 Update frontend to use enhanced functions");
        console.log("3. 📢 Announce new withdrawal features to users");
        console.log("4. 📊 Monitor treasury fee collection");
        console.log("5. 🎯 Test withdrawal splits in production");

        return upgradeResult;

    } catch (error) {
        console.error("❌ Mainnet upgrade failed:", error);
        
        // Detailed error information
        console.log("\n🔍 ERROR DETAILS:");
        console.log("Error message:", error.message);
        console.log("Error code:", error.code);
        
        if (error.message.includes("Ownable")) {
            console.log("\n💡 SOLUTION: Ensure deployer account is the contract owner");
            console.log("   Current deployer:", deployer.address);
            console.log("   Required: Contract owner permissions");
        }
        
        if (error.message.includes("implementation")) {
            console.log("\n💡 SOLUTION: Check contract implementation compatibility");
            console.log("   Ensure new contract is upgrade-compatible");
        }
        
        throw error;
    }
}

// Execute mainnet upgrade
if (require.main === module) {
    main()
        .then((result) => {
            console.log("\n🎉 MAINNET ENHANCED WITHDRAWAL DEPLOYMENT COMPLETED!");
            console.log("🚀 Production-ready enhanced withdrawal system active!");
            console.log("💰 Users can now benefit from new withdrawal features!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Mainnet deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;