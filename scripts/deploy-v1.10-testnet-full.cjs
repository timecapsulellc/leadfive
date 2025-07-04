#!/usr/bin/env node

/**
 * Deploy LeadFiveV1.10 to BSC Testnet (Fresh Deployment)
 * This script deploys a complete new contract to testnet for testing
 */

const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚀 DEPLOYING LEADFIVE V1.10 TO BSC TESTNET");
    console.log("=" .repeat(60));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Get testnet USDT address (or deploy mock)
    const TESTNET_USDT = process.env.MOCK_USDT_ADDRESS || "0x00175c710A7448920934eF830f2F22D6370E0642";
    console.log("🪙 Using USDT address:", TESTNET_USDT);

    try {
        console.log("\n🔨 Deploying LeadFiveV1_10 contract...");
        
        // Get contract factory
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        
        // Deploy with proxy
        const contract = await upgrades.deployProxy(
            LeadFiveV1_10,
            [TESTNET_USDT], // USDT address for testnet
            {
                initializer: 'initialize',
                kind: 'uups'
            }
        );

        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        console.log("✅ Contract deployed to:", contractAddress);

        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
        console.log("🔧 Implementation address:", implementationAddress);

        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        
        // Check initial state
        const stats = await contract.getContractStats();
        const owner = await contract.owner();
        console.log("👥 Total users:", stats.totalUsers.toString());
        console.log("💰 Total volume:", ethers.formatUnits(stats.totalVolume, 18), "USDT");
        console.log("👑 Contract owner:", owner);

        // Test package prices
        console.log("\n📦 Testing package configuration...");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await contract.getPackageInfo(i);
            console.log(`Package ${i}: $${ethers.formatEther(packageInfo.price)} USDT`);
        }

        // Test root user fix functions
        console.log("\n🔧 Testing root user fix...");
        
        // Fix root user issue
        const fixTx = await contract.fixRootUserIssue();
        await fixTx.wait();
        console.log("✅ Root user issue fixed");

        // Register as root
        const registerTx = await contract.registerAsRoot(4); // Register with package 4
        await registerTx.wait();
        console.log("✅ Registered as root user");

        // Activate all levels
        const activateTx = await contract.activateAllLevelsForRoot();
        await activateTx.wait();
        console.log("✅ All levels activated for root");

        // Verify root status
        const rootStatus = await contract.isRootUserFixed();
        console.log("🔍 Root user status:", rootStatus.status);

        // Generate referral code
        const generateCodeTx = await contract.generateReferralCode();
        await generateCodeTx.wait();
        const referralCode = await contract.getReferralCode(deployer.address);
        console.log("🎫 Root referral code:", referralCode);

        console.log("\n" + "=".repeat(60));
        console.log("🎉 TESTNET DEPLOYMENT SUCCESSFUL!");
        console.log("=".repeat(60));
        console.log("📍 Proxy Address:", contractAddress);
        console.log("🔧 Implementation:", implementationAddress);
        console.log("👑 Owner:", owner);
        console.log("🎫 Referral Code:", referralCode);
        console.log("=".repeat(60));

        // Save deployment info
        const deploymentInfo = {
            network: "BSC Testnet",
            timestamp: new Date().toISOString(),
            proxyAddress: contractAddress,
            implementationAddress: implementationAddress,
            owner: owner,
            deployer: deployer.address,
            usdt: TESTNET_USDT,
            referralCode: referralCode,
            contractVersion: contractVersion
        };

        const fs = require('fs');
        const filename = `BSC_TESTNET_V1.10_DEPLOYMENT_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        console.log("💾 Deployment info saved to:", filename);

        return {
            proxy: contractAddress,
            implementation: implementationAddress,
            owner: owner,
            referralCode: referralCode
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
            console.log("🎉 Deployment completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;
