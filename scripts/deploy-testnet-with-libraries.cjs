const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🧪 LEADFIVE BSC TESTNET DEPLOYMENT WITH LIBRARY LINKING");
    console.log("=" * 60);

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "BNB");

    // BSC Testnet contract addresses
    const USDT_TESTNET_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    const PRICE_FEED_TESTNET_ADDRESS = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";
    
    console.log("🌐 Network: BSC Testnet");
    console.log("💰 USDT Address:", USDT_TESTNET_ADDRESS);
    console.log("📊 Price Feed:", PRICE_FEED_TESTNET_ADDRESS);

    try {
        // Step 1: Deploy DataStructures library first
        console.log("\\n📦 Step 1: Deploying DataStructures library...");
        const DataStructures = await ethers.getContractFactory("DataStructures");
        const dataStructures = await DataStructures.deploy();
        await dataStructures.waitForDeployment();
        const dataStructuresAddress = await dataStructures.getAddress();
        console.log("✅ DataStructures deployed to:", dataStructuresAddress);

        // Step 2: Deploy required libraries only
        console.log("\\n📦 Step 2: Deploying required libraries...");
        
        const PoolDistributionLib = await ethers.getContractFactory("PoolDistributionLib");
        const poolDistributionLib = await PoolDistributionLib.deploy();
        await poolDistributionLib.waitForDeployment();
        const poolDistributionLibAddress = await poolDistributionLib.getAddress();
        console.log("✅ PoolDistributionLib deployed to:", poolDistributionLibAddress);

        const WithdrawalSafetyLib = await ethers.getContractFactory("WithdrawalSafetyLib");
        const withdrawalSafetyLib = await WithdrawalSafetyLib.deploy();
        await withdrawalSafetyLib.waitForDeployment();
        const withdrawalSafetyLibAddress = await withdrawalSafetyLib.getAddress();
        console.log("✅ WithdrawalSafetyLib deployed to:", withdrawalSafetyLibAddress);

        const BusinessLogicLib = await ethers.getContractFactory("BusinessLogicLib");
        const businessLogicLib = await BusinessLogicLib.deploy();
        await businessLogicLib.waitForDeployment();
        const businessLogicLibAddress = await businessLogicLib.getAddress();
        console.log("✅ BusinessLogicLib deployed to:", businessLogicLibAddress);

        const AdvancedFeaturesLib = await ethers.getContractFactory("AdvancedFeaturesLib");
        const advancedFeaturesLib = await AdvancedFeaturesLib.deploy();
        await advancedFeaturesLib.waitForDeployment();
        const advancedFeaturesLibAddress = await advancedFeaturesLib.getAddress();
        console.log("✅ AdvancedFeaturesLib deployed to:", advancedFeaturesLibAddress);

        // Step 3: Deploy LeadFive with library linking
        console.log("\\n📦 Step 3: Deploying LeadFive contract with libraries...");
        const LeadFive = await ethers.getContractFactory("LeadFive", {
            libraries: {
                PoolDistributionLib: poolDistributionLibAddress,
                WithdrawalSafetyLib: withdrawalSafetyLibAddress,
                BusinessLogicLib: businessLogicLibAddress,
                AdvancedFeaturesLib: advancedFeaturesLibAddress
            }
        });

        // Deploy the contract
        console.log("🚀 Deploying LeadFive contract to BSC Testnet...");
        const leadFive = await LeadFive.deploy();
        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();

        console.log("\\n✅ LEADFIVE TESTNET DEPLOYMENT SUCCESSFUL!");
        console.log("📍 Contract Address:", contractAddress);

        // Step 4: Initialize the contract
        console.log("\\n🔧 Initializing contract...");
        const initTx = await leadFive.initialize(USDT_TESTNET_ADDRESS, PRICE_FEED_TESTNET_ADDRESS);
        await initTx.wait();
        console.log("✅ Contract initialized successfully!");

        // Step 5: Verify deployment
        console.log("\\n🔍 Verifying deployment...");
        
        // Check if owner is set correctly
        const owner = await leadFive.owner();
        console.log("👤 Contract Owner:", owner);
        
        // Check if USDT address is set
        const usdtAddress = await leadFive.usdt();
        console.log("💰 USDT Address:", usdtAddress);
        
        // Check if price feed is set
        const priceFeedAddress = await leadFive.priceFeed();
        console.log("📊 Price Feed Address:", priceFeedAddress);

        // Check package prices
        const package1 = await leadFive.packages(1);
        console.log("📦 Package 1 Price:", ethers.formatEther(package1.price), "USDT");

        console.log("\\n🎉 DEPLOYMENT SUMMARY");
        console.log("=" * 60);
        console.log("🌐 Network: BSC Testnet");
        console.log("📍 LeadFive Contract:", contractAddress);
        console.log("🔍 BSCScan Testnet:", `https://testnet.bscscan.com/address/${contractAddress}`);
        console.log("💰 USDT Contract:", USDT_TESTNET_ADDRESS);
        console.log("📊 Price Feed:", PRICE_FEED_TESTNET_ADDRESS);
        
        console.log("\\n📚 Library Addresses:");
        console.log("- DataStructures:", dataStructuresAddress);
        console.log("- PoolDistributionLib:", poolDistributionLibAddress);
        console.log("- WithdrawalSafetyLib:", withdrawalSafetyLibAddress);
        console.log("- BusinessLogicLib:", businessLogicLibAddress);
        console.log("- AdvancedFeaturesLib:", advancedFeaturesLibAddress);

        console.log("\\n🚀 NEXT STEPS:");
        console.log("1. Test contract functionality");
        console.log("2. Verify contract on BSCScan Testnet");
        console.log("3. Connect frontend to testnet contract");
        console.log("4. Deploy to mainnet after testing");

        return contractAddress;

    } catch (error) {
        console.error("❌ Testnet deployment failed:", error.message);
        throw error;
    }
}

main()
    .then((contractAddress) => {
        console.log("\\n✅ Deployment completed successfully!");
        console.log("Contract address:", contractAddress);
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Deployment failed:", error);
        process.exit(1);
    });
