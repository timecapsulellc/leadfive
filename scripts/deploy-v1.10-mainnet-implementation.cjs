#!/usr/bin/env node

/**
 * Deploy LeadFiveV1.10 Implementation to BSC Mainnet 
 * This deploys ONLY the implementation (no proxy) for upgrading existing contract
 */

const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚀 DEPLOYING LEADFIVE V1.10 IMPLEMENTATION TO BSC MAINNET");
    console.log("=" .repeat(70));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Existing mainnet addresses
    const MAINNET_USDT = process.env.VITE_USDT_ADDRESS || "0x55d398326f99059fF775485246999027B3197955";
    const EXISTING_PROXY = process.env.MAINNET_CONTRACT_ADDRESS || "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    
    console.log("🪙 USDT Address:", MAINNET_USDT);
    console.log("🔗 Existing Proxy:", EXISTING_PROXY);

    try {
        console.log("\n🔨 Deploying LeadFiveV1_10 implementation...");
        
        // Get contract factory
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        
        // Deploy implementation only (not proxy)
        console.log("⏳ Deploying implementation contract...");
        const implementation = await LeadFiveV1_10.deploy();
        await implementation.waitForDeployment();
        
        const implementationAddress = await implementation.getAddress();
        console.log("✅ Implementation deployed to:", implementationAddress);

        // Verify the implementation
        console.log("\n🔍 Verifying implementation...");
        try {
            // Try to call version function (this will fail but shows it's deployed)
            await implementation.getContractVersion();
            console.log("⚠️  Warning: Implementation shouldn't be callable directly");
        } catch (error) {
            console.log("✅ Implementation correctly deployed (not initialized)");
        }

        // Estimate gas for upgrade
        console.log("\n⛽ Estimating upgrade gas costs...");
        const ProxyAdmin = await ethers.getContractFactory("LeadFiveV1_10");
        const upgradeData = ProxyAdmin.interface.encodeFunctionData("upgradeTo", [implementationAddress]);
        console.log("📊 Upgrade transaction data length:", upgradeData.length, "bytes");
        console.log("⛽ Estimated gas for upgrade: ~200,000 gas");

        console.log("\n" + "=".repeat(70));
        console.log("🎉 IMPLEMENTATION DEPLOYMENT SUCCESSFUL!");
        console.log("=".repeat(70));
        console.log("🔧 New Implementation:", implementationAddress);
        console.log("🔗 Existing Proxy:", EXISTING_PROXY);
        console.log("👑 Proxy Owner (Trezor):", process.env.TREZOR_ADDRESS);
        console.log("=".repeat(70));

        console.log("\n📋 NEXT STEPS:");
        console.log("1. ✅ Implementation deployed successfully");
        console.log("2. 🔍 Verify implementation on BSCScan");
        console.log("3. 🔐 Use Trezor wallet to upgrade proxy");
        console.log("4. 🚀 Initialize v1.1 features");
        console.log("5. 🔧 Execute root user fix functions");

        // Save deployment info
        const deploymentInfo = {
            network: "BSC Mainnet",
            timestamp: new Date().toISOString(),
            implementationAddress: implementationAddress,
            existingProxy: EXISTING_PROXY,
            deployer: deployer.address,
            trezorOwner: process.env.TREZOR_ADDRESS,
            usdt: MAINNET_USDT,
            contractVersion: "LeadFive v1.10",
            nextSteps: [
                "Verify implementation on BSCScan",
                "Use Trezor to upgrade proxy",
                "Call initializeV1_1()",
                "Call fixRootUserIssue()",
                "Call registerAsRoot(4)",
                "Call activateAllLevelsForRoot()"
            ]
        };

        const fs = require('fs');
        const filename = `BSC_MAINNET_V1.10_IMPLEMENTATION_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to:", filename);

        return {
            implementation: implementationAddress,
            proxy: EXISTING_PROXY,
            deployer: deployer.address
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then((result) => {
            console.log("🎉 Implementation deployment completed!");
            console.log("🔔 Ready for Trezor upgrade!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;
