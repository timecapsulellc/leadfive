const { ethers } = require("hardhat");
const { verify } = require("../utils/verify");
require("dotenv").config();

/**
 * OrphiCrowdFund Mainnet Deployment Script
 * This script deploys the OrphiCrowdFund contract to BSC Mainnet
 */

async function main() {
  console.log("🚀 Starting OrphiCrowdFund Mainnet Deployment...");
  console.log("============================================");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "BNB");

  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    throw new Error("❌ Insufficient BNB balance for deployment. Need at least 0.1 BNB");
  }

  // Mainnet configuration
  const config = {
    usdt: process.env.USDT_MAINNET || "0x55d398326f99059fF775485246999027B3197955",
    adminReserve: process.env.ADMIN_RESERVE,
    matrixRoot: process.env.MATRIX_ROOT,
    gasPrice: ethers.utils.parseUnits("5", "gwei"), // 5 gwei for mainnet
    gasLimit: 2000000
  };

  // Validate required addresses
  if (!config.adminReserve || !config.matrixRoot) {
    throw new Error("❌ ADMIN_RESERVE and MATRIX_ROOT addresses must be configured in .env");
  }

  console.log("Configuration:");
  console.log("- USDT Address:", config.usdt);
  console.log("- Admin Reserve:", config.adminReserve);
  console.log("- Matrix Root:", config.matrixRoot);
  console.log("- Gas Price:", ethers.utils.formatUnits(config.gasPrice, "gwei"), "gwei");

  // Deploy contract
  console.log("\n📦 Deploying OrphiCrowdFund contract...");
  
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = await OrphiCrowdFund.deploy(
    config.usdt,
    config.adminReserve,
    config.matrixRoot,
    {
      gasPrice: config.gasPrice,
      gasLimit: config.gasLimit
    }
  );

  console.log("⏳ Waiting for deployment confirmation...");
  await contract.deployed();

  console.log("✅ Contract deployed successfully!");
  console.log("Contract Address:", contract.address);
  console.log("Transaction Hash:", contract.deployTransaction.hash);

  // Wait for confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  const deployTxReceipt = await contract.deployTransaction.wait(5);
  console.log(`✅ Confirmed in block ${deployTxReceipt.blockNumber}`);

  // Verify contract on BSCScan
  if (process.env.BSCSCAN_API_KEY) {
    console.log("\n🔍 Verifying contract on BSCScan...");
    try {
      await verify(contract.address, [
        config.usdt,
        config.adminReserve,
        config.matrixRoot
      ]);
      console.log("✅ Contract verified on BSCScan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: "bsc-mainnet",
    contractAddress: contract.address,
    deploymentHash: contract.deployTransaction.hash,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: deployTxReceipt.blockNumber,
    gasUsed: deployTxReceipt.gasUsed.toString(),
    gasPrice: config.gasPrice.toString(),
    config: {
      usdt: config.usdt,
      adminReserve: config.adminReserve,
      matrixRoot: config.matrixRoot
    }
  };

  // Write deployment info to file
  const fs = require("fs");
  fs.writeFileSync(
    "deployment-mainnet.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 Deployment Complete!");
  console.log("============================================");
  console.log("Contract Address:", contract.address);
  console.log("Network: BSC Mainnet");
  console.log("Deployment info saved to: deployment-mainnet.json");
  console.log("\n📋 Next Steps:");
  console.log("1. Update frontend environment variables");
  console.log("2. Test contract interactions");
  console.log("3. Set up monitoring and alerts");
  console.log("4. Announce launch to community");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
