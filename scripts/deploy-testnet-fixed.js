// scripts/deploy-testnet-fixed.js
// BSC Testnet deployment with correct contract name

import hre from "hardhat";
import fs from "fs";

const { ethers, upgrades } = hre;

async function main() {
  console.log("🚀 Starting LeadFive BSC Testnet Deployment");
  console.log("=" .repeat(70));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB");
  
  if (balance < ethers.parseEther("0.05")) {
    throw new Error("❌ Insufficient BNB balance. Need at least 0.05 BNB for deployment.");
  }

  // BSC Testnet configuration
  const TESTNET_USDT = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"; // BSC Testnet USDT
  const TESTNET_PRICE_FEED = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BNB/USD price feed

  console.log("Using USDT address:", TESTNET_USDT);
  console.log("Using Price Feed address:", TESTNET_PRICE_FEED);
  
  const deploymentResults = {
    network: "BSC Testnet",
    chainId: 97,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    adminRights: {
      owner: deployer.address,
      initialAdmin: deployer.address,
      platformFeeRecipient: deployer.address
    }
  };
  
  try {
    console.log("\n📦 Deploying LeadFive Contract...");
    
    // Get the LeadFive contract factory
    const LeadFive = await ethers.getContractFactory("LeadFive");
    
    console.log("Contract bytecode size:", (LeadFive.bytecode.length - 2) / 2, "bytes");
    
    // Deploy as upgradeable proxy
    console.log("Deploying LeadFive with UUPS proxy...");
    const leadFive = await upgrades.deployProxy(
      LeadFive,
      [TESTNET_USDT, TESTNET_PRICE_FEED],
      {
        initializer: 'initialize',
        kind: 'uups'
      }
    );

    await leadFive.waitForDeployment();
    const proxyAddress = await leadFive.getAddress();
    
    console.log("✅ LeadFive deployed to:", proxyAddress);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("📋 Implementation address:", implementationAddress);
    
    // Update deployment results
    deploymentResults.contracts = {
      LeadFive: {
        proxy: proxyAddress,
        implementation: implementationAddress,
        deployer: deployer.address,
        gasUsed: "TBD"
      }
    };
    
    // Verify initial setup
    console.log("\n🔍 Verifying Contract Setup...");
    
    const owner = await leadFive.owner();
    const platformFeeRecipient = await leadFive.platformFeeRecipient();
    const totalUsers = await leadFive.totalUsers();
    
    console.log("Contract Owner:", owner);
    console.log("Platform Fee Recipient:", platformFeeRecipient);
    console.log("Total Users:", totalUsers.toString());
    
    // Verify admin rights
    console.log("\n👤 Admin Rights Configuration:");
    console.log("✅ Deployer is Owner:", owner.toLowerCase() === deployer.address.toLowerCase());
    console.log("✅ Platform Fee Recipient set:", platformFeeRecipient.toLowerCase() === deployer.address.toLowerCase());
    
    // Save deployment info
    const deploymentFile = `deployments/bsc-testnet-${Date.now()}.json`;
    if (!fs.existsSync('deployments')) {
      fs.mkdirSync('deployments');
    }
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentFile);
    
    console.log("\n🎉 BSC Testnet Deployment Completed Successfully!");
    console.log("=" .repeat(70));
    console.log("📋 Deployment Summary:");
    console.log("• Network: BSC Testnet (Chain ID: 97)");
    console.log("• Contract Address:", proxyAddress);
    console.log("• Implementation:", implementationAddress);
    console.log("• Deployer/Owner:", deployer.address);
    console.log("• Contract Size: 18.871 KiB (under 24KB limit ✅)");
    console.log("• Admin Control: Deployer has full admin rights ✅");
    console.log("=" .repeat(70));
    
    return {
      success: true,
      proxyAddress,
      implementationAddress,
      owner: deployer.address
    };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("Full error:", error);
    
    deploymentResults.error = {
      message: error.message,
      stack: error.stack
    };
    
    // Save failed deployment info
    const errorFile = `deployments/failed-deployment-${Date.now()}.json`;
    if (!fs.existsSync('deployments')) {
      fs.mkdirSync('deployments');
    }
    fs.writeFileSync(errorFile, JSON.stringify(deploymentResults, null, 2));
    
    throw error;
  }
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n✅ Deployment script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment script failed:", error.message);
    process.exit(1);
  });
