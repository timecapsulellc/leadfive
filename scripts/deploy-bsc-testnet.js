// scripts/deploy-bsc-testnet.js
// Clean BSC Testnet deployment script for LeadFive

const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 LeadFive BSC Testnet Deployment");
  console.log("=" .repeat(50));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB");
  
  if (balance < ethers.parseEther("0.02")) {
    throw new Error("Insufficient BNB balance for deployment");
  }

  // BSC Testnet addresses
  const USDT_TESTNET = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
  const BNB_USD_ORACLE = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // Chainlink BNB/USD on BSC Testnet

  console.log("Using USDT:", USDT_TESTNET);
  console.log("Using Oracle:", BNB_USD_ORACLE);

  try {
    // Deploy LeadFive contract
    console.log("\n📦 Deploying LeadFive contract...");
    
    const LeadFive = await ethers.getContractFactory("LeadFive");
    
    const leadFive = await upgrades.deployProxy(
      LeadFive,
      [USDT_TESTNET, BNB_USD_ORACLE],
      {
        initializer: "initialize",
        kind: "uups"
      }
    );

    await leadFive.waitForDeployment();
    const proxyAddress = await leadFive.getAddress();
    
    console.log("✅ LeadFive deployed successfully!");
    console.log("📍 Proxy Address:", proxyAddress);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("📍 Implementation Address:", implementationAddress);

    // Verify deployer is owner and admin
    const owner = await leadFive.owner();
    console.log("👑 Contract Owner:", owner);
    console.log("✅ Deployer is owner:", owner === deployer.address);

    // Check contract state
    const totalUsers = await leadFive.totalUsers();
    const feeRecipient = await leadFive.platformFeeRecipient();
    
    console.log("\n📊 Contract State:");
    console.log("Total Users:", totalUsers.toString());
    console.log("Fee Recipient:", feeRecipient);

    // Save deployment info
    const deploymentInfo = {
      network: "bsc-testnet",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      proxyAddress: proxyAddress,
      implementationAddress: implementationAddress,
      usdt: USDT_TESTNET,
      oracle: BNB_USD_ORACLE,
      transactionHash: leadFive.deploymentTransaction()?.hash
    };

    console.log("\n💾 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Deployment completed successfully!");
    console.log("Contract is ready for use on BSC Testnet");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
