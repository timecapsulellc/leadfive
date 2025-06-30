// scripts/pre-deployment-checklist.cjs
// Pre-deployment validation and checklist for mainnet

const { ethers } = require("hardhat");
require("dotenv").config();

const MAINNET_CONFIG = {
  USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
  PRICE_FEED_ADDRESS: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
  DEPLOYER_ADDRESS: "0x140aad3E7c6bCC415Bc8E830699855fF072d405D",
  TREZOR_ADDRESS: "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29",
  MIN_BNB_BALANCE: "0.1",
  CHAIN_ID: 56
};

async function main() {
  console.log("📋 MAINNET DEPLOYMENT PRE-FLIGHT CHECKLIST");
  console.log("=" .repeat(60));
  
  let checksPassed = 0;
  let totalChecks = 0;
  const issues = [];
  
  // Check 1: Network Connection
  totalChecks++;
  console.log("\n1️⃣  Checking network connection...");
  try {
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId === BigInt(MAINNET_CONFIG.CHAIN_ID)) {
      console.log("✅ Connected to BSC Mainnet");
      checksPassed++;
    } else {
      console.log(`❌ Wrong network! Expected BSC Mainnet (56), got ${network.chainId}`);
      issues.push("Switch to BSC Mainnet network");
    }
  } catch (error) {
    console.log(`❌ Network connection failed: ${error.message}`);
    issues.push("Fix network connection");
  }
  
  // Check 2: Deployer Account
  totalChecks++;
  console.log("\n2️⃣  Checking deployer account...");
  try {
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    if (deployer.address.toLowerCase() === MAINNET_CONFIG.DEPLOYER_ADDRESS.toLowerCase()) {
      console.log("✅ Correct deployer address");
      checksPassed++;
    } else {
      console.log(`❌ Wrong deployer! Expected ${MAINNET_CONFIG.DEPLOYER_ADDRESS}`);
      issues.push("Use correct deployer private key");
    }
  } catch (error) {
    console.log(`❌ Deployer check failed: ${error.message}`);
    issues.push("Fix deployer private key configuration");
  }
  
  // Check 3: BNB Balance
  totalChecks++;
  console.log("\n3️⃣  Checking BNB balance...");
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    
    console.log(`💰 Balance: ${balanceEth} BNB`);
    
    if (parseFloat(balanceEth) >= parseFloat(MAINNET_CONFIG.MIN_BNB_BALANCE)) {
      console.log("✅ Sufficient BNB for deployment");
      checksPassed++;
    } else {
      console.log(`❌ Insufficient BNB! Need at least ${MAINNET_CONFIG.MIN_BNB_BALANCE} BNB`);
      issues.push(`Add at least ${MAINNET_CONFIG.MIN_BNB_BALANCE} BNB to deployer wallet`);
    }
  } catch (error) {
    console.log(`❌ Balance check failed: ${error.message}`);
    issues.push("Check deployer wallet balance");
  }
  
  // Check 4: USDT Contract
  totalChecks++;
  console.log("\n4️⃣  Verifying BSC Mainnet USDT contract...");
  try {
    const usdtCode = await ethers.provider.getCode(MAINNET_CONFIG.USDT_ADDRESS);
    if (usdtCode !== "0x") {
      console.log("✅ USDT contract verified on mainnet");
      checksPassed++;
    } else {
      console.log("❌ USDT contract not found!");
      issues.push("Verify USDT contract address");
    }
  } catch (error) {
    console.log(`❌ USDT verification failed: ${error.message}`);
    issues.push("Fix USDT contract verification");
  }
  
  // Check 5: Price Feed Contract
  totalChecks++;
  console.log("\n5️⃣  Verifying Chainlink price feed...");
  try {
    const priceFeedCode = await ethers.provider.getCode(MAINNET_CONFIG.PRICE_FEED_ADDRESS);
    if (priceFeedCode !== "0x") {
      console.log("✅ Price feed contract verified");
      checksPassed++;
    } else {
      console.log("❌ Price feed contract not found!");
      issues.push("Verify price feed contract address");
    }
  } catch (error) {
    console.log(`❌ Price feed verification failed: ${error.message}`);
    issues.push("Fix price feed contract verification");
  }
  
  // Check 6: Contract Compilation
  totalChecks++;
  console.log("\n6️⃣  Checking contract compilation...");
  try {
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const bytecode = LeadFive.bytecode;
    const contractSize = bytecode.length / 2 - 1; // Remove 0x prefix
    const contractSizeKB = (contractSize / 1024).toFixed(2);
    
    console.log(`📏 Contract size: ${contractSize} bytes (${contractSizeKB} KiB)`);
    
    if (contractSize <= 24576) { // 24KB limit
      console.log("✅ Contract size within limits");
      checksPassed++;
    } else {
      console.log("❌ Contract exceeds 24KB limit!");
      issues.push("Optimize contract size");
    }
  } catch (error) {
    console.log(`❌ Compilation check failed: ${error.message}`);
    issues.push("Fix contract compilation errors");
  }
  
  // Check 7: Environment Configuration
  totalChecks++;
  console.log("\n7️⃣  Checking environment configuration...");
  try {
    const requiredVars = [
      'DEPLOYER_PRIVATE_KEY',
      'BSCSCAN_API_KEY',
      'BSC_MAINNET_RPC_URL'
    ];
    
    let envIssues = [];
    requiredVars.forEach(varName => {
      if (!process.env[varName] || process.env[varName] === 'YourAPIKeyHere') {
        envIssues.push(varName);
      }
    });
    
    if (envIssues.length === 0) {
      console.log("✅ Environment variables configured");
      checksPassed++;
    } else {
      console.log(`❌ Missing environment variables: ${envIssues.join(', ')}`);
      issues.push(`Configure missing environment variables: ${envIssues.join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ Environment check failed: ${error.message}`);
    issues.push("Fix environment configuration");
  }
  
  // Check 8: Trezor Address Validation
  totalChecks++;
  console.log("\n8️⃣  Validating Trezor address...");
  try {
    if (ethers.isAddress(MAINNET_CONFIG.TREZOR_ADDRESS)) {
      console.log(`✅ Trezor address valid: ${MAINNET_CONFIG.TREZOR_ADDRESS}`);
      checksPassed++;
    } else {
      console.log("❌ Invalid Trezor address!");
      issues.push("Fix Trezor wallet address");
    }
  } catch (error) {
    console.log(`❌ Trezor address validation failed: ${error.message}`);
    issues.push("Validate Trezor wallet address");
  }
  
  // Check 9: Hardhat Configuration
  totalChecks++;
  console.log("\n9️⃣  Checking Hardhat configuration...");
  try {
    // This is a basic check to see if we can access network config
    const networkName = (await ethers.provider.getNetwork()).name;
    if (networkName === "bnb" || networkName === "bsc") {
      console.log("✅ Hardhat BSC configuration detected");
      checksPassed++;
    } else {
      console.log("❌ Hardhat not configured for BSC");
      issues.push("Configure Hardhat for BSC mainnet");
    }
  } catch (error) {
    console.log(`❌ Hardhat configuration check failed: ${error.message}`);
    issues.push("Fix Hardhat configuration");
  }
  
  // Check 10: BSCScan API Key
  totalChecks++;
  console.log("\n🔟 Checking BSCScan API key...");
  try {
    const apiKey = process.env.BSCSCAN_API_KEY;
    if (apiKey && apiKey !== 'YourAPIKeyHere' && apiKey.length > 10) {
      console.log("✅ BSCScan API key configured");
      checksPassed++;
    } else {
      console.log("❌ BSCScan API key missing or invalid");
      issues.push("Configure valid BSCScan API key for contract verification");
    }
  } catch (error) {
    console.log(`❌ BSCScan API key check failed: ${error.message}`);
    issues.push("Fix BSCScan API key configuration");
  }
  
  // Final Results
  console.log("\n📊 PRE-DEPLOYMENT CHECKLIST RESULTS");
  console.log("=" .repeat(60));
  
  const successRate = (checksPassed / totalChecks * 100).toFixed(1);
  console.log(`📈 Checks Passed: ${checksPassed}/${totalChecks} (${successRate}%)`);
  
  if (checksPassed === totalChecks) {
    console.log("\n🎉 ALL CHECKS PASSED - READY FOR MAINNET DEPLOYMENT!");
    console.log("✅ You can proceed with deployment");
    console.log("\n🚀 Run deployment command:");
    console.log("   npx hardhat run scripts/deploy-mainnet-final.cjs --network bsc");
  } else {
    console.log("\n⚠️  DEPLOYMENT NOT READY - ISSUES FOUND");
    console.log(`❌ ${issues.length} issue(s) need to be resolved:`);
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log("\n🔧 Fix these issues before deployment!");
  }
  
  console.log("\n📋 DEPLOYMENT SEQUENCE:");
  console.log("1. Run pre-deployment checklist (this script)");
  console.log("2. Deploy to mainnet: npx hardhat run scripts/deploy-mainnet-final.cjs --network bsc");
  console.log("3. Verify on BSCScan: npx hardhat verify --network bsc [CONTRACT_ADDRESS] [ARGS]");
  console.log("4. Test with small transaction");
  console.log("5. Transfer ownership: node scripts/transfer-ownership-to-trezor.cjs");
  console.log("6. Launch production frontend");
  
  return {
    checksPassed,
    totalChecks,
    successRate: parseFloat(successRate),
    ready: checksPassed === totalChecks,
    issues
  };
}

main()
  .then((result) => {
    if (result.ready) {
      console.log("\n✅ Pre-deployment checklist completed - READY TO DEPLOY!");
      process.exit(0);
    } else {
      console.log("\n❌ Pre-deployment checklist failed - FIX ISSUES FIRST!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n❌ Pre-deployment checklist error:");
    console.error(error);
    process.exit(1);
  });
