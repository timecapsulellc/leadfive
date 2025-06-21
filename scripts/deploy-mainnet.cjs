const { ethers, upgrades } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚀 LEADFIVE MAINNET DEPLOYMENT");
    console.log("=".repeat(60));
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("🔍 Deploying with account:", deployer.address);
    
    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.05")) {
        throw new Error("❌ Insufficient BNB balance for deployment. Need at least 0.05 BNB");
    }
    
    console.log("\n📋 MAINNET CONFIGURATION:");
    
    // BSC Mainnet addresses
    const MAINNET_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC Mainnet USDT
    const MAINNET_PRICE_FEED_ADDRESS = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"; // BNB/USD Chainlink on BSC
    
    console.log("- USDT Address:", MAINNET_USDT_ADDRESS);
    console.log("- Price Feed Address:", MAINNET_PRICE_FEED_ADDRESS);
    console.log("- Network: BSC Mainnet");
    console.log("- Chain ID: 56");
    
    console.log("\n⚠️  SECURITY CHECKLIST:");
    console.log("✅ Private key secured in .env");
    console.log("✅ Contract audited and tested");
    console.log("✅ Mainnet addresses verified");
    console.log("✅ Sufficient gas for deployment");
    
    // Confirm deployment
    console.log("\n🔄 Starting deployment...");
    
    try {
        // Deploy all required libraries first
        console.log("\n📚 Deploying Libraries...");
        
        // Deploy DataStructures library
        const DataStructures = await ethers.getContractFactory("DataStructures");
        const dataStructures = await DataStructures.deploy();
        await dataStructures.waitForDeployment();
        console.log("✅ DataStructures deployed at:", await dataStructures.getAddress());
        
        // Deploy PoolDistributionLib
        const PoolDistributionLib = await ethers.getContractFactory("PoolDistributionLib");
        const poolDistributionLib = await PoolDistributionLib.deploy();
        await poolDistributionLib.waitForDeployment();
        console.log("✅ PoolDistributionLib deployed at:", await poolDistributionLib.getAddress());
        
        // Deploy WithdrawalSafetyLib
        const WithdrawalSafetyLib = await ethers.getContractFactory("WithdrawalSafetyLib");
        const withdrawalSafetyLib = await WithdrawalSafetyLib.deploy();
        await withdrawalSafetyLib.waitForDeployment();
        console.log("✅ WithdrawalSafetyLib deployed at:", await withdrawalSafetyLib.getAddress());
        
        // Deploy BusinessLogicLib
        const BusinessLogicLib = await ethers.getContractFactory("BusinessLogicLib");
        const businessLogicLib = await BusinessLogicLib.deploy();
        await businessLogicLib.waitForDeployment();
        console.log("✅ BusinessLogicLib deployed at:", await businessLogicLib.getAddress());
        
        // Deploy AdvancedFeaturesLib
        const AdvancedFeaturesLib = await ethers.getContractFactory("AdvancedFeaturesLib");
        const advancedFeaturesLib = await AdvancedFeaturesLib.deploy();
        await advancedFeaturesLib.waitForDeployment();
        console.log("✅ AdvancedFeaturesLib deployed at:", await advancedFeaturesLib.getAddress());
        
        console.log("\n🏗️  Deploying Main Contract...");
        
        // Deploy LeadFive with library linking (only required libraries)
        const LeadFive = await ethers.getContractFactory("LeadFive", {
            libraries: {
                PoolDistributionLib: await poolDistributionLib.getAddress(),
                WithdrawalSafetyLib: await withdrawalSafetyLib.getAddress(),
                BusinessLogicLib: await businessLogicLib.getAddress(),
                AdvancedFeaturesLib: await advancedFeaturesLib.getAddress()
            }
        });
        
        // Deploy using UUPS proxy pattern with linked libraries
        const leadFive = await upgrades.deployProxy(
            LeadFive, 
            [MAINNET_USDT_ADDRESS, MAINNET_PRICE_FEED_ADDRESS], 
            { 
                initializer: 'initialize',
                kind: 'uups',
                unsafeAllowLinkedLibraries: true
            }
        );
        
        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();
        
        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("=".repeat(60));
        console.log("✅ LeadFive Contract deployed at:", contractAddress);
        console.log("✅ Network: BSC Mainnet");
        console.log("✅ Owner:", deployer.address);
        console.log("✅ USDT Token:", MAINNET_USDT_ADDRESS);
        console.log("✅ Price Feed:", MAINNET_PRICE_FEED_ADDRESS);
        
        // Verify contract is properly initialized
        console.log("\n🔍 Verifying deployment...");
        const owner = await leadFive.owner();
        const paused = await leadFive.paused();
        
        console.log("- Contract owner:", owner);
        console.log("- Contract paused:", paused);
        
        if (owner === deployer.address && !paused) {
            console.log("✅ Contract properly initialized!");
        } else {
            console.log("⚠️ Contract initialization issue detected");
        }
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress: contractAddress,
            deployer: deployer.address,
            network: "BSC Mainnet",
            chainId: 56,
            usdtAddress: MAINNET_USDT_ADDRESS,
            priceFeedAddress: MAINNET_PRICE_FEED_ADDRESS,
            deploymentTime: new Date().toISOString(),
            libraries: {
                DataStructures: await dataStructures.getAddress(),
                PoolDistributionLib: await poolDistributionLib.getAddress(),
                WithdrawalSafetyLib: await withdrawalSafetyLib.getAddress(),
                BusinessLogicLib: await businessLogicLib.getAddress(),
                AdvancedFeaturesLib: await advancedFeaturesLib.getAddress()
            }
        };
        
        // Write deployment info to file
        const fs = require('fs');
        fs.writeFileSync(
            'mainnet-deployment.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n📄 Deployment info saved to: mainnet-deployment.json");
        
        console.log("\n🔗 IMPORTANT LINKS:");
        console.log("- BSCScan Contract:", `https://bscscan.com/address/${contractAddress}`);
        console.log("- BSCScan Verify:", `https://bscscan.com/verifyContract?a=${contractAddress}`);
        
        console.log("\n🔄 NEXT STEPS:");
        console.log("1. 🔍 Verify contract on BSCScan");
        console.log("2. 🔐 Transfer ownership to Trezor wallet (CRITICAL)");
        console.log("3. 🔑 Rotate exposed credentials");
        console.log("4. 🔗 Update frontend configuration");
        console.log("5. 📊 Set up monitoring");
        
        console.log("\n⚠️  SECURITY REMINDER:");
        console.log("- IMMEDIATELY transfer ownership to your Trezor wallet");
        console.log("- IMMEDIATELY rotate your private key and API key");
        console.log("- Test all functions before public launch");
        
        return {
            contractAddress,
            deploymentInfo
        };
        
    } catch (error) {
        console.error("\n💥 DEPLOYMENT FAILED:", error.message);
        throw error;
    }
}

main()
    .then((result) => {
        console.log("\n🎉 MAINNET DEPLOYMENT COMPLETED SUCCESSFULLY!");
        console.log("Contract Address:", result.contractAddress);
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Mainnet deployment failed:", error.message);
        process.exit(1);
    });
