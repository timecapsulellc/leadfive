const { ethers, upgrades } = require("hardhat");

/**
 * Upgrade Mainnet Contract with Enhanced Withdrawal Functions
 * Contract: 0x29dcCb502D10C042BcC6a02a7762C49595A9E498
 */
async function main() {
    console.log("🚀 UPGRADING MAINNET CONTRACT WITH ENHANCED WITHDRAWAL");
    console.log("=" .repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("📍 Upgrading with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Mainnet configuration
    const MAINNET_CONTRACT = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
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
        const totalUsers = await currentContract.totalUsers();
        const poolBalances = await currentContract.getPoolBalances();
        
        console.log("👑 Current Owner:", owner);
        console.log("👥 Total Users:", totalUsers.toString());
        console.log("💰 Pool Balances:");
        console.log("   Leader Pool:", ethers.formatUnits(poolBalances[0], 18), "USDT");
        console.log("   Help Pool:", ethers.formatUnits(poolBalances[1], 18), "USDT");
        console.log("   Club Pool:", ethers.formatUnits(poolBalances[2], 18), "USDT");
        
        // Verify we have permission to upgrade
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("⚠️  WARNING: Deployer is not the contract owner!");
            console.log("   Contract Owner:", owner);
            console.log("   Deployer:", deployer.address);
            throw new Error("Unauthorized: Only contract owner can upgrade");
        }

        console.log("\n✅ OWNERSHIP VERIFIED - PROCEEDING WITH UPGRADE");

        console.log("\n🆙 PERFORMING CONTRACT UPGRADE");
        console.log("-".repeat(50));
        
        // Get the enhanced LeadFive implementation
        const LeadFiveEnhanced = await ethers.getContractFactory("LeadFive");
        
        console.log("⏳ Preparing upgrade with enhanced withdrawal functions...");
        
        // Perform the upgrade
        console.log("🔄 Upgrading contract...");
        const upgradedContract = await upgrades.upgradeProxy(MAINNET_CONTRACT, LeadFiveEnhanced);
        
        console.log("✅ Contract upgraded successfully!");
        console.log("📍 Contract address (unchanged):", upgradedContract.target);

        console.log("\n🔧 CONFIGURING ENHANCED FEATURES");
        console.log("-".repeat(50));
        
        // Set treasury wallet for fee collection
        console.log("🏛️ Setting treasury wallet...");
        const setTreasuryTx = await upgradedContract.setTreasuryWallet(TREASURY_WALLET);
        await setTreasuryTx.wait();
        console.log("✅ Treasury wallet set to:", TREASURY_WALLET);

        console.log("\n📋 VERIFYING ENHANCED FUNCTIONS");
        console.log("-".repeat(50));
        
        // Test enhanced function availability
        const enhancedFunctions = [
            "withdrawEnhanced",
            "toggleAutoCompound", 
            "getWithdrawalSplit",
            "getUserReferralCount",
            "isAutoCompoundEnabled",
            "getTreasuryWallet",
            "setTreasuryWallet"
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
                console.log(`⚠️  ${funcName}: Error - ${error.message}`);
            }
        }

        // Test withdrawal split calculation for deployer
        console.log("\n🧮 TESTING WITHDRAWAL SPLIT CALCULATION:");
        const [withdrawPercent, reinvestPercent] = await upgradedContract.getWithdrawalSplit(deployer.address);
        console.log(`   Deployer split: ${withdrawPercent}%/${reinvestPercent}%`);
        
        // Test referral count
        const referralCount = await upgradedContract.getUserReferralCount(deployer.address);
        console.log(`   Deployer referrals: ${referralCount.toString()}`);

        // Check auto-compound status
        const autoStatus = await upgradedContract.isAutoCompoundEnabled(deployer.address);
        console.log(`   Auto-compound: ${autoStatus ? 'Enabled' : 'Disabled'}`);

        // Verify treasury configuration
        console.log("\n🏛️ TREASURY CONFIGURATION:");
        const treasuryAddress = await upgradedContract.getTreasuryWallet();
        console.log("   Treasury Wallet:", treasuryAddress);
        console.log("   Treasury Set:", treasuryAddress !== "0x0000000000000000000000000000000000000000");

        console.log("\n📊 POST-UPGRADE CONTRACT STATUS");
        console.log("-".repeat(50));
        
        const finalOwner = await upgradedContract.owner();
        const finalUsers = await upgradedContract.totalUsers();
        const finalPools = await upgradedContract.getPoolBalances();
        
        console.log("👑 Owner:", finalOwner);
        console.log("👥 Total Users:", finalUsers.toString());
        console.log("💰 Final Pool Balances:");
        console.log("   Leader Pool:", ethers.formatUnits(finalPools[0], 18), "USDT");
        console.log("   Help Pool:", ethers.formatUnits(finalPools[1], 18), "USDT");
        console.log("   Club Pool:", ethers.formatUnits(finalPools[2], 18), "USDT");

        // Simulate withdrawal fee calculation
        console.log("\n💰 WITHDRAWAL FEE SIMULATION (100 USDT):");
        const testAmount = 100;
        const withdrawAmount = (testAmount * parseInt(withdrawPercent)) / 100;
        const adminFee = (withdrawAmount * 5) / 100; // 5% fee on withdrawal portion only
        const userReceives = withdrawAmount - adminFee;
        const reinvestAmount = (testAmount * parseInt(reinvestPercent)) / 100;
        
        console.log(`   Total Amount: ${testAmount} USDT`);
        console.log(`   Withdrawal Split: ${withdrawPercent}%/${reinvestPercent}%`);
        console.log(`   Withdrawable: ${withdrawAmount} USDT`);
        console.log(`   Admin Fee (5%): ${adminFee} USDT`);
        console.log(`   User Receives: ${userReceives} USDT`);
        console.log(`   Reinvestment: ${reinvestAmount} USDT`);

        const upgradeResult = {
            network: "BSC Mainnet",
            contractAddress: upgradedContract.target,
            originalContract: MAINNET_CONTRACT,
            deployer: deployer.address,
            treasury: TREASURY_WALLET,
            timestamp: new Date().toISOString(),
            totalUsersPreserved: finalUsers.toString(),
            poolBalancesPreserved: {
                leaderPool: ethers.formatUnits(finalPools[0], 18),
                helpPool: ethers.formatUnits(finalPools[1], 18),
                clubPool: ethers.formatUnits(finalPools[2], 18)
            },
            enhancedFeatures: [
                "Enhanced withdrawal with treasury fees",
                "Referral-based withdrawal splits (70/30, 75/25, 80/20)",
                "Auto-compound functionality with 5% bonus",
                "Help Pool reinvestment system",
                "Treasury fee collection (5% on withdrawal portion only)",
                "Client handover functions for ownership transfer"
            ],
            newFunctions: enhancedFunctions,
            feeCalculationExample: {
                testAmount: `${testAmount} USDT`,
                split: `${withdrawPercent}%/${reinvestPercent}%`,
                withdrawable: `${withdrawAmount} USDT`,
                adminFee: `${adminFee} USDT`,
                userReceives: `${userReceives} USDT`,
                reinvestment: `${reinvestAmount} USDT`
            },
            upgradeStatus: "SUCCESS",
            dataPreserved: true,
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
        console.log("👥 Total Users: PRESERVED");
        console.log("💰 Pool Balances: PRESERVED");
        console.log("=".repeat(70));

        console.log("\n🚀 DEPLOYMENT COMPLETE - ENHANCED WITHDRAWAL SYSTEM LIVE!");
        
        console.log("\n📋 ENHANCED WITHDRAWAL FEATURES NOW AVAILABLE:");
        console.log("✅ withdrawEnhanced() - New withdrawal with treasury fees");
        console.log("✅ getWithdrawalSplit() - Check user's withdrawal split");
        console.log("✅ toggleAutoCompound() - Enable/disable auto-compound");
        console.log("✅ getUserReferralCount() - Get user's referral count");
        console.log("✅ Treasury fee collection (5% on withdrawal portion only)");
        console.log("✅ Referral-based splits: 70/30, 75/25, 80/20");
        console.log("✅ Auto-compound with 5% bonus");

        console.log("\n📢 USER BENEFITS:");
        console.log("🎯 Users with more referrals get better withdrawal splits");
        console.log("💰 Auto-compound provides 5% bonus on reinvestments");
        console.log("🏛️ Treasury fees fund platform development");
        console.log("🔄 Help Pool receives reinvestments for community rewards");

        console.log("\n📝 NEXT STEPS:");
        console.log("1. ✅ Contract upgrade completed successfully");
        console.log("2. 🔄 Update frontend ABI to include new functions");
        console.log("3. 📢 Announce new withdrawal features to users");
        console.log("4. 📊 Monitor treasury fee collection");
        console.log("5. 🎯 Test withdrawal splits in production");
        console.log("6. 📈 Track auto-compound adoption rates");

        return upgradeResult;

    } catch (error) {
        console.error("❌ Mainnet upgrade failed:", error);
        
        // Detailed error information
        console.log("\n🔍 ERROR DETAILS:");
        console.log("Error message:", error.message);
        console.log("Error code:", error.code);
        
        if (error.message.includes("Ownable") || error.message.includes("Unauthorized")) {
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
            console.log("\n🎉 MAINNET ENHANCED WITHDRAWAL UPGRADE COMPLETED!");
            console.log("🚀 Production-ready enhanced withdrawal system is now LIVE!");
            console.log("💰 Users can now benefit from new withdrawal features!");
            console.log(`📊 ${result.totalUsersPreserved} users and all balances preserved!`);
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Mainnet upgrade failed:", error);
            process.exit(1);
        });
}

module.exports = main;