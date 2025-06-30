// scripts/deploy-leadfive-bsc-testnet.js
// BSC Testnet deployment script for the optimized LeadFive contract

import hre from "hardhat";
import fs from "fs";

const { ethers, upgrades } = hre;

async function main() {
  console.log("🚀 Starting LeadFive BSC Testnet Deployment");
  console.log("=" .repeat(60));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "BNB");
  
  if (balance.lt(ethers.utils.parseEther("0.05"))) {
    throw new Error("❌ Insufficient BNB balance. Need at least 0.05 BNB for deployment.");
  }

  // BSC Testnet configuration
  const TESTNET_USDT = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"; // BSC Testnet USDT
  const TESTNET_PRICE_FEED = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BNB/USD price feed on BSC Testnet

  console.log("Using USDT address:", TESTNET_USDT);
  console.log("Using Price Feed address:", TESTNET_PRICE_FEED);
  
  const deploymentResults = {
    network: "BSC Testnet",
    chainId: 97,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
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

    await leadFive.deployed();
    
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(leadFive.address);
    
    deploymentResults.proxy = leadFive.address;
    deploymentResults.implementation = implementationAddress;
    
    console.log("✅ LeadFive Proxy deployed at:", leadFive.address);
    console.log("✅ Implementation deployed at:", implementationAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");
    
    const totalUsers = await leadFive.totalUsers();
    const packagePrice = await leadFive.packages(1);
    const platformFeeRecipient = await leadFive.platformFeeRecipient();
    
    console.log("Total users:", totalUsers.toString());
    console.log("Package 1 price:", ethers.utils.formatEther(packagePrice.price), "USDT");
    console.log("Platform fee recipient:", platformFeeRecipient);
    
    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    
    // Check if deployer is registered
    const deployerUser = await leadFive.users(deployer.address);
    console.log("Deployer registered:", deployerUser.flags & 1 ? "Yes" : "No");
    
    if (deployerUser.flags & 1) {
      console.log("Deployer package level:", deployerUser.packageLevel);
      console.log("Deployer referral code:", deployerUser.referralCode);
    }

    // Save deployment info
    const deploymentFile = `deployment-bsc-testnet-${Date.now()}.json`;
    
    deploymentResults.contracts = {
      LeadFive: {
        proxy: leadFive.address,
        implementation: implementationAddress
      }
    };
    
    deploymentResults.configuration = {
      USDT: TESTNET_USDT,
      PriceFeed: TESTNET_PRICE_FEED,
      packages: [
        { level: 1, price: "30 USDT" },
        { level: 2, price: "50 USDT" },
        { level: 3, price: "100 USDT" },
        { level: 4, price: "200 USDT" }
      ],
      bonusStructure: {
        directReferral: "40%",
        levelBonus: "10%", 
        uplineBonus: "10%",
        leaderPool: "10%",
        helpPool: "30%"
      },
      earningsMultiplier: "4x",
      adminFeeRate: "5%"
    };

    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    console.log(`\n💾 Deployment details saved to: ${deploymentFile}`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("=" .repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=" .repeat(60));
    console.log(`Network: BSC Testnet (Chain ID: 97)`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`LeadFive Proxy: ${leadFive.address}`);
    console.log(`Implementation: ${implementationAddress}`);
    console.log(`USDT Token: ${TESTNET_USDT}`);
    console.log(`Price Feed: ${TESTNET_PRICE_FEED}`);
    console.log("=" .repeat(60));
    
    console.log("\n🔗 NEXT STEPS:");
    console.log("1. Verify contracts on BSCScan Testnet");
    console.log("2. Test registration and package upgrades");
    console.log("3. Test withdrawal functionality");
    console.log("4. Monitor pool distributions");
    console.log("5. Verify all business logic is working correctly");
    
    console.log("\n📱 TESTNET LINKS:");
    console.log(`• Contract: https://testnet.bscscan.com/address/${leadFive.address}`);
    console.log(`• Implementation: https://testnet.bscscan.com/address/${implementationAddress}`);
    console.log(`• USDT: https://testnet.bscscan.com/address/${TESTNET_USDT}`);
    
    return deploymentResults;

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment script failed:", error);
    process.exit(1);
  });

export default main;
