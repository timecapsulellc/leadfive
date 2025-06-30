// scripts/final-deployment-check.cjs
// Final verification before mainnet deployment

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 FINAL DEPLOYMENT VERIFICATION");
  console.log("=" .repeat(60));
  console.log("⚠️  LAST CHANCE TO VERIFY BEFORE MAINNET DEPLOYMENT!");
  console.log("=" .repeat(60));
  
  let allChecks = true;
  
  // Check 1: Environment Variables
  console.log("\n1️⃣  Checking Environment Variables...");
  const requiredVars = {
    'DEPLOYER_PRIVATE_KEY': process.env.DEPLOYER_PRIVATE_KEY,
    'BSC_MAINNET_RPC_URL': process.env.BSC_MAINNET_RPC_URL,
    'VITE_USDT_CONTRACT_ADDRESS': process.env.VITE_USDT_CONTRACT_ADDRESS,
    'MAINNET_PRICE_FEED_ADDRESS': process.env.MAINNET_PRICE_FEED_ADDRESS,
    'BSCSCAN_API_KEY': process.env.BSCSCAN_API_KEY,
    'TREZOR_OWNER_ADDRESS': process.env.TREZOR_OWNER_ADDRESS
  };
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value === 'PENDING_MAINNET_DEPLOYMENT' || value.includes('YourAPIKeyHere')) {
      console.log(`❌ ${key}: Missing or invalid`);
      allChecks = false;
    } else {
      const displayValue = key.includes('PRIVATE') ? '***HIDDEN***' : value;
      console.log(`✅ ${key}: ${displayValue}`);
    }
  }
  
  // Check 2: Network Connection
  console.log("\n2️⃣  Checking Network Connection...");
  try {
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Connected to: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId === BigInt(56)) {
      console.log("✅ BSC Mainnet connection verified");
    } else {
      console.log("❌ NOT connected to BSC Mainnet!");
      allChecks = false;
    }
  } catch (error) {
    console.log(`❌ Network connection failed: ${error.message}`);
    allChecks = false;
  }
  
  // Check 3: Deployer Account
  console.log("\n3️⃣  Checking Deployer Account...");
  try {
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    if (deployer.address.toLowerCase() === "0x140aad3E7c6bCC415Bc8E830699855fF072d405D".toLowerCase()) {
      console.log("✅ Correct deployer address");
      
      // Check balance
      const balance = await ethers.provider.getBalance(deployer.address);
      console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);
      
      if (balance >= ethers.parseEther("0.1")) {
        console.log("✅ Sufficient BNB for deployment");
      } else {
        console.log("❌ Insufficient BNB! Need at least 0.1 BNB");
        allChecks = false;
      }
    } else {
      console.log("❌ Wrong deployer address!");
      allChecks = false;
    }
  } catch (error) {
    console.log(`❌ Deployer check failed: ${error.message}`);
    allChecks = false;
  }
  
  // Check 4: USDT Contract Verification
  console.log("\n4️⃣  Verifying BSC Mainnet USDT Contract...");
  try {
    const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
    const usdtCode = await ethers.provider.getCode(usdtAddress);
    
    if (usdtCode !== "0x") {
      console.log("✅ BSC Mainnet USDT contract verified");
      console.log(`📍 Address: ${usdtAddress}`);
    } else {
      console.log("❌ USDT contract not found!");
      allChecks = false;
    }
  } catch (error) {
    console.log(`❌ USDT verification failed: ${error.message}`);
    allChecks = false;
  }
  
  // Check 5: Price Feed Contract Verification
  console.log("\n5️⃣  Verifying Chainlink Price Feed...");
  try {
    const priceFeedAddress = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
    const priceFeedCode = await ethers.provider.getCode(priceFeedAddress);
    
    if (priceFeedCode !== "0x") {
      console.log("✅ Chainlink BNB/USD price feed verified");
      console.log(`📍 Address: ${priceFeedAddress}`);
    } else {
      console.log("❌ Price feed contract not found!");
      allChecks = false;
    }
  } catch (error) {
    console.log(`❌ Price feed verification failed: ${error.message}`);
    allChecks = false;
  }
  
  // Check 6: Contract Compilation
  console.log("\n6️⃣  Checking Contract Compilation...");
  try {
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const bytecode = LeadFive.bytecode;
    const contractSize = (bytecode.length - 2) / 2; // Remove 0x
    const contractSizeKB = (contractSize / 1024).toFixed(2);
    
    console.log(`📏 Contract Size: ${contractSize} bytes (${contractSizeKB} KiB)`);
    
    if (contractSize <= 24576) { // 24KB limit
      console.log("✅ Contract size within mainnet limits");
    } else {
      console.log("❌ Contract exceeds 24KB limit!");
      allChecks = false;
    }
  } catch (error) {
    console.log(`❌ Contract compilation failed: ${error.message}`);
    allChecks = false;
  }
  
  // Check 7: Trezor Address Validation
  console.log("\n7️⃣  Validating Trezor Address...");
  const trezorAddress = process.env.TREZOR_OWNER_ADDRESS;
  if (ethers.isAddress(trezorAddress)) {
    console.log(`✅ Trezor address valid: ${trezorAddress}`);
  } else {
    console.log("❌ Invalid Trezor address!");
    allChecks = false;
  }
  
  // Final Results
  console.log("\n📊 FINAL VERIFICATION RESULTS");
  console.log("=" .repeat(60));
  
  if (allChecks) {
    console.log("🎉 ALL CHECKS PASSED - READY FOR MAINNET DEPLOYMENT!");
    console.log("");
    console.log("📋 DEPLOYMENT CONFIGURATION:");
    console.log("├─ Network: BSC Mainnet (Chain ID: 56)");
    console.log("├─ Payment Token: USDT (0x55d398326f99059fF775485246999027B3197955)");
    console.log("├─ Price Feed: Chainlink BNB/USD (0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE)");
    console.log("├─ Initial Owner: 0x140aad3E7c6bCC415Bc8E830699855fF072d405D (Deployer)");
    console.log("├─ Final Owner: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29 (Trezor)");
    console.log("");
    console.log("🚀 TO DEPLOY NOW, RUN:");
    console.log("   npx hardhat run scripts/deploy-mainnet-final.cjs --network bsc");
    console.log("");
    console.log("⚠️  THIS WILL USE REAL MONEY ON BSC MAINNET!");
    console.log("⚠️  MAKE SURE YOU'RE READY BEFORE PROCEEDING!");
    
    return true;
  } else {
    console.log("❌ VERIFICATION FAILED - NOT READY FOR DEPLOYMENT!");
    console.log("");
    console.log("🔧 Please fix the issues above before attempting deployment.");
    
    return false;
  }
}

main()
  .then((success) => {
    if (success) {
      console.log("\n✅ Verification completed successfully!");
      process.exit(0);
    } else {
      console.log("\n❌ Verification failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n❌ Verification error:", error);
    process.exit(1);
  });
