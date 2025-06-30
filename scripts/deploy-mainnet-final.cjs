// scripts/deploy-mainnet-final.cjs
// Official BSC Mainnet Deployment Script for LeadFive

const { ethers } = require("hardhat");
const fs = require('fs');
require("dotenv").config();

const MAINNET_CONFIG = {
  // BSC Mainnet Real USDT Contract
  USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
  // BSC Mainnet BNB/USD Price Feed (Chainlink)
  PRICE_FEED_ADDRESS: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
  // Your deployer wallet (temporary admin)
  DEPLOYER_ADDRESS: "0x140aad3E7c6bCC415Bc8E830699855fF072d405D",
  // Your Trezor wallet (final owner)
  TREZOR_ADDRESS: "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29",
  // Network details
  CHAIN_ID: 56,
  NETWORK_NAME: "BSC Mainnet"
};

async function main() {
  console.log("🚀 LEADFIVE BSC MAINNET DEPLOYMENT");
  console.log("=" .repeat(60));
  console.log("⚠️  PRODUCTION DEPLOYMENT - REAL MONEY INVOLVED!");
  console.log("=" .repeat(60));
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`🏦 Target Trezor Owner: ${MAINNET_CONFIG.TREZOR_ADDRESS}`);
  
  // Check network
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  if (network.chainId !== BigInt(MAINNET_CONFIG.CHAIN_ID)) {
    throw new Error(`❌ Wrong network! Expected BSC Mainnet (56), got ${network.chainId}`);
  }
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} BNB`);
  
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("❌ Insufficient BNB for deployment! Need at least 0.1 BNB");
  }
  
  // Verify USDT contract exists
  console.log("\n🔍 Verifying BSC Mainnet USDT...");
  const usdtCode = await ethers.provider.getCode(MAINNET_CONFIG.USDT_ADDRESS);
  if (usdtCode === "0x") {
    throw new Error("❌ USDT contract not found on mainnet!");
  }
  console.log("✅ USDT contract verified");
  
  // Verify Price Feed exists
  console.log("🔍 Verifying Chainlink Price Feed...");
  const priceFeedCode = await ethers.provider.getCode(MAINNET_CONFIG.PRICE_FEED_ADDRESS);
  if (priceFeedCode === "0x") {
    throw new Error("❌ Price feed contract not found on mainnet!");
  }
  console.log("✅ Price feed contract verified");
  
  console.log("\n📋 DEPLOYMENT CONFIGURATION:");
  console.log(`├─ Payment Token: ${MAINNET_CONFIG.USDT_ADDRESS} (USDT)`);
  console.log(`├─ Price Feed: ${MAINNET_CONFIG.PRICE_FEED_ADDRESS} (BNB/USD)`);
  console.log(`├─ Initial Owner: ${deployer.address} (Deployer)`);
  console.log(`├─ Final Owner: ${MAINNET_CONFIG.TREZOR_ADDRESS} (Trezor)`);
  console.log(`├─ Admin: ${deployer.address} (Deployer)`);
  console.log(`├─ Fee Recipient: ${deployer.address} (Deployer)`);
  
  // Deploy LeadFive contract
  console.log("\n🚀 Deploying LeadFive Contract...");
  const LeadFive = await ethers.getContractFactory("LeadFive");
  
  console.log("📦 Deployment in progress...");
  const leadFive = await LeadFive.deploy(); // No constructor arguments for upgradeable contract
  
  console.log("⏳ Waiting for deployment confirmation...");
  await leadFive.waitForDeployment();
  
  const contractAddress = await leadFive.getAddress();
  console.log(`✅ LeadFive deployed to: ${contractAddress}`);
  
  // Initialize the contract
  console.log("\n🔧 Initializing contract...");
  const initTx = await leadFive.initialize(
    MAINNET_CONFIG.USDT_ADDRESS,        // USDT token
    MAINNET_CONFIG.PRICE_FEED_ADDRESS   // Price feed oracle
  );
  
  console.log(`📝 Initialize Tx: ${initTx.hash}`);
  console.log("⏳ Waiting for initialization confirmation...");
  await initTx.wait();
  console.log("✅ Contract initialized successfully");

  // Get deployment transaction details
  const deployTx = leadFive.deploymentTransaction();
  console.log(`📝 Deployment Tx: ${deployTx.hash}`);
  
  // Verify contract size
  const contractCode = await ethers.provider.getCode(contractAddress);
  const contractSize = (contractCode.length - 2) / 2; // Remove 0x and convert to bytes
  const contractSizeKB = (contractSize / 1024).toFixed(2);
  
  console.log(`📏 Contract Size: ${contractSize} bytes (${contractSizeKB} KiB)`);
  
  if (contractSize > 24576) { // 24KB limit
    console.log("⚠️  WARNING: Contract size exceeds 24KB limit!");
  } else {
    console.log("✅ Contract size within limits");
  }
  
  // Initial contract verification
  console.log("\n🔍 Verifying initial contract state...");
  try {
    const owner = await leadFive.owner();
    const feeRecipient = await leadFive.platformFeeRecipient();
    const usdt = await leadFive.usdt();
    const totalUsers = await leadFive.totalUsers();
    
    console.log("📋 Contract State:");
    console.log(`├─ Owner: ${owner}`);
    console.log(`├─ Fee Recipient: ${feeRecipient}`);
    console.log(`├─ USDT Token: ${usdt}`);
    console.log(`├─ Total Users: ${totalUsers}`);
    
    // Verify all addresses match expected
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error("❌ Owner mismatch!");
    }
    if (feeRecipient.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error("❌ Fee recipient mismatch!");
    }
    if (usdt.toLowerCase() !== MAINNET_CONFIG.USDT_ADDRESS.toLowerCase()) {
      throw new Error("❌ USDT token mismatch!");
    }
    if (totalUsers.toString() !== "1") {
      throw new Error("❌ Total users should be 1 after initialization!");
    }
    
    console.log("✅ All contract parameters verified");
    
  } catch (error) {
    console.log(`❌ Contract verification failed: ${error.message}`);
    throw error;
  }
  
  // Test basic functionality
  console.log("\n🧪 Testing basic contract functionality...");
  try {
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    
    console.log("📊 Initial State:");
    console.log(`├─ Total Users: ${totalUsers}`);
    console.log(`├─ Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
    
    console.log("✅ Contract functionality verified");
    
  } catch (error) {
    console.log(`❌ Functionality test failed: ${error.message}`);
    throw error;
  }
  
  // Update environment file
  console.log("\n📝 Updating environment configuration...");
  
  // Read current .env file
  let envContent = "";
  try {
    envContent = fs.readFileSync('.env', 'utf8');
  } catch (error) {
    console.log("⚠️  Could not read .env file");
  }
  
  // Update contract addresses for mainnet
  const envUpdates = {
    VITE_CONTRACT_ADDRESS: contractAddress,
    MAINNET_CONTRACT_ADDRESS: contractAddress
  };
  
  console.log("📋 Environment Updates:");
  Object.entries(envUpdates).forEach(([key, value]) => {
    console.log(`├─ ${key}=${value}`);
    
    // Update env content
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });
  
  // Write updated .env file
  try {
    fs.writeFileSync('.env', envContent);
    console.log("✅ Environment file updated");
  } catch (error) {
    console.log("⚠️  Could not update .env file");
  }
  
  // Contract verification on BSCScan
  console.log("\n🔍 BSCScan Verification Command:");
  console.log(`npx hardhat verify --network bsc ${contractAddress} "${MAINNET_CONFIG.USDT_ADDRESS}" "${MAINNET_CONFIG.PRICE_FEED_ADDRESS}" "${deployer.address}" "${deployer.address}" "${deployer.address}"`);
  
  // Ownership transfer instructions
  console.log("\n🔄 NEXT STEPS:");
  console.log("1️⃣  Verify contract on BSCScan (command above)");
  console.log("2️⃣  Test with small registration");
  console.log("3️⃣  Transfer ownership: node scripts/transfer-ownership-to-trezor.cjs");
  
  // Final deployment report
  console.log("\n📊 MAINNET DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("🎉 SUCCESS: LeadFive deployed to BSC Mainnet!");
  console.log("");
  console.log("📋 DEPLOYMENT SUMMARY:");
  console.log(`├─ Contract Address: ${contractAddress}`);
  console.log(`├─ Network: BSC Mainnet (Chain ID: 56)`);
  console.log(`├─ Contract Size: ${contractSizeKB} KiB`);
  console.log(`├─ Deployment Tx: ${deployTx.hash}`);
  console.log(`├─ Payment Token: USDT (${MAINNET_CONFIG.USDT_ADDRESS})`);
  console.log(`├─ Price Feed: BNB/USD (${MAINNET_CONFIG.PRICE_FEED_ADDRESS})`);
  console.log("");
  console.log("🔗 LINKS:");
  console.log(`├─ Contract: https://bscscan.com/address/${contractAddress}`);
  console.log(`├─ Deployment Tx: https://bscscan.com/tx/${deployTx.hash}`);
  console.log("");
  console.log("✅ READY FOR PRODUCTION USE!");
  
  return {
    contractAddress,
    deploymentTx: deployTx.hash,
    contractSize: contractSizeKB
  };
}

main()
  .then((result) => {
    console.log("\n🎉 Mainnet deployment completed successfully!");
    console.log(`📍 Contract deployed at: ${result.contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Mainnet deployment failed:");
    console.error(error);
    process.exit(1);
  });