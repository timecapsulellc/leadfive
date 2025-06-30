// scripts/simple-deploy.cjs
// Simple deployment without upgrades to debug issues

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Simple LeadFive Deployment (Non-Upgradeable)");
  console.log("=".repeat(50));

  // Contract addresses we want to use
  const MOCK_USDT = "0x00175c710A7448920934eF830f2F22D6370E0642";
  const MOCK_PRICEFEED = "0xb4BCe54d31B49CAF37A4a8C9Eb3AC333A7Ee7766";

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} BNB`);

  console.log(`🪙 Using Mock USDT: ${MOCK_USDT}`);
  console.log(`📊 Using Mock PriceFeed: ${MOCK_PRICEFEED}`);

  try {
    // First check if the Mock USDT contract exists
    console.log("\n🔍 Checking Mock USDT contract...");
    const usdtCode = await ethers.provider.getCode(MOCK_USDT);
    if (usdtCode === "0x") {
      console.log("❌ Mock USDT contract not found, skipping mock deployment for now...");
    } else {
      console.log("✅ Mock USDT contract exists");
    }

    // Check Mock PriceFeed
    console.log("\n🔍 Checking Mock PriceFeed contract...");
    const priceFeedCode = await ethers.provider.getCode(MOCK_PRICEFEED);
    if (priceFeedCode === "0x") {
      console.log("❌ Mock PriceFeed contract not found, skipping mock deployment for now...");
    } else {
      console.log("✅ Mock PriceFeed contract exists");
    }

    // Deploy a simple non-upgradeable version to test
    console.log("\n📦 Deploying LeadFive contract (simple version)...");
    const LeadFive = await ethers.getContractFactory("LeadFive");
    
    const leadFive = await LeadFive.deploy();
    await leadFive.waitForDeployment();
    const contractAddress = await leadFive.getAddress();
    
    console.log("✅ LeadFive deployed successfully!");
    console.log(`📍 Contract Address: ${contractAddress}`);

    // Initialize the contract
    console.log("\n🔧 Initializing contract...");
    const initTx = await leadFive.initialize(MOCK_USDT, MOCK_PRICEFEED);
    await initTx.wait();
    
    console.log("✅ Contract initialized!");

    // Verify deployment
    const owner = await leadFive.owner();
    const usdtAddress = await leadFive.usdt();
    const totalUsers = await leadFive.totalUsers();

    console.log("\n✅ Contract verification:");
    console.log(`👑 Contract Owner: ${owner}`);
    console.log(`🪙 USDT Address: ${usdtAddress}`);
    console.log(`👥 Total Users: ${totalUsers}`);
    
    // Check if deployer is the owner
    console.log(`✅ Deployer is owner: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);

    console.log("\n💾 Deployment Summary:");
    const deploymentInfo = {
      network: "bsc-testnet",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contractAddress: contractAddress,
      mockUsdt: MOCK_USDT,
      mockPriceFeed: MOCK_PRICEFEED,
      owner: owner
    };

    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Deployment completed successfully!");
    console.log("Contract is ready for testing with Mock USDT!");
    console.log(`\n📋 Update your test scripts to use: ${contractAddress}`);

    return {
      contractAddress,
      deploymentInfo
    };

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("✅ Deployment script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  });
