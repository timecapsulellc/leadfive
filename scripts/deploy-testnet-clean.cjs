const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Clean Deployment to BSC Testnet...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "BNB\n");

    if (balance < ethers.parseEther("0.05")) {
        console.log("❌ Insufficient BNB balance for deployment");
        console.log("💡 Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
        return;
    }

    // Deploy without proxy first to test
    console.log("📋 Deploying LeadFivePhaseOne directly...");
    
    const LeadFivePhaseOne = await ethers.getContractFactory("LeadFivePhaseOne");
    
    const usdt = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
    const priceOracle = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BSC Testnet BNB/USD
    
    // Deploy the implementation
    console.log("🔄 Deploying implementation contract...");
    const contract = await LeadFivePhaseOne.deploy();
    
    console.log("⏳ Waiting for deployment confirmation...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed to:", contractAddress);
    
    // Initialize the contract
    console.log("\n🔧 Initializing contract...");
    try {
        const initTx = await contract.initialize(usdt, priceOracle);
        console.log("⏳ Waiting for initialization...");
        await initTx.wait();
        console.log("✅ Contract initialized!");
    } catch (error) {
        console.log("⚠️ Initialization error:", error.message);
        if (error.message.includes("already initialized")) {
            console.log("✅ Contract already initialized");
        }
    }
    
    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    try {
        const package1 = await contract.getPackageDetails(1);
        console.log("📦 Package 1 price:", ethers.formatEther(package1[0]), "USDT");
        
        const owner = await contract.owner();
        console.log("👤 Contract owner:", owner);
        
        console.log("✅ Basic tests passed!");
    } catch (error) {
        console.log("⚠️ Test error:", error.message);
    }
    
    // Verify deployment
    console.log("\n📊 Deployment Summary:");
    console.log("├─ Network: BSC Testnet");
    console.log("├─ Contract: LeadFivePhaseOne");
    console.log("├─ Address:", contractAddress);
    console.log("├─ USDT:", usdt);
    console.log("├─ Oracle:", priceOracle);
    console.log("└─ Explorer: https://testnet.bscscan.com/address/" + contractAddress);
    
    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        network: "BSC Testnet",
        contractName: "LeadFivePhaseOne",
        contractAddress: contractAddress,
        deployer: deployer.address,
        usdtToken: usdt,
        priceOracle: priceOracle,
        timestamp: new Date().toISOString(),
        chainId: 97,
        explorer: `https://testnet.bscscan.com/address/${contractAddress}`,
        deploymentType: "Direct Deployment (Non-Proxy)"
    };
    
    fs.writeFileSync('testnet-deployment-clean.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to testnet-deployment-clean.json");
    
    return contractAddress;
}

main()
    .then((address) => {
        console.log("\n🎉 Deployment completed successfully!");
        console.log("Contract Address:", address);
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
