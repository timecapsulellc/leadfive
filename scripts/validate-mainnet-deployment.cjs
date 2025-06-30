// scripts/validate-mainnet-deployment.cjs
// Post-deployment validation for mainnet contract

const { ethers } = require("hardhat");
require("dotenv").config();

const CONFIG = {
  CONTRACT_ADDRESS: process.env.MAINNET_CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS,
  USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
  PRICE_FEED_ADDRESS: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
  DEPLOYER_ADDRESS: "0x140aad3E7c6bCC415Bc8E830699855fF072d405D"
};

async function main() {
  console.log("🔍 POST-DEPLOYMENT VALIDATION");
  console.log("=" .repeat(60));
  console.log(`📍 Contract: ${CONFIG.CONTRACT_ADDRESS}`);
  
  let validationsPassed = 0;
  let totalValidations = 0;
  const issues = [];
  
  if (!CONFIG.CONTRACT_ADDRESS || CONFIG.CONTRACT_ADDRESS === 'PENDING_MAINNET_DEPLOYMENT') {
    throw new Error("❌ No contract address found! Deploy first.");
  }
  
  // Check network
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== BigInt(56)) {
    throw new Error(`❌ Wrong network! Expected BSC Mainnet (56), got ${network.chainId}`);
  }
  console.log("✅ Network: BSC Mainnet");
  
  // Connect to deployed contract
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(CONFIG.CONTRACT_ADDRESS);
  
  // Validation 1: Contract exists
  totalValidations++;
  console.log("\n1️⃣  Checking contract deployment...");
  try {
    const code = await ethers.provider.getCode(CONFIG.CONTRACT_ADDRESS);
    if (code !== "0x") {
      console.log("✅ Contract deployed successfully");
      validationsPassed++;
    } else {
      console.log("❌ Contract not found at address");
      issues.push("Contract deployment failed");
    }
  } catch (error) {
    console.log(`❌ Contract check failed: ${error.message}`);
    issues.push("Contract deployment verification failed");
  }
  
  // Validation 2: Owner verification
  totalValidations++;
  console.log("\n2️⃣  Verifying contract owner...");
  try {
    const owner = await leadFive.owner();
    console.log(`👤 Owner: ${owner}`);
    
    if (owner.toLowerCase() === CONFIG.DEPLOYER_ADDRESS.toLowerCase()) {
      console.log("✅ Owner correctly set to deployer");
      validationsPassed++;
    } else {
      console.log("❌ Unexpected owner address");
      issues.push("Owner address mismatch");
    }
  } catch (error) {
    console.log(`❌ Owner verification failed: ${error.message}`);
    issues.push("Cannot verify contract owner");
  }
  
  // Validation 3: Payment token verification
  totalValidations++;
  console.log("\n3️⃣  Verifying payment token...");
  try {
    const paymentToken = await leadFive.paymentToken();
    console.log(`💰 Payment Token: ${paymentToken}`);
    
    if (paymentToken.toLowerCase() === CONFIG.USDT_ADDRESS.toLowerCase()) {
      console.log("✅ Payment token correctly set to USDT");
      validationsPassed++;
    } else {
      console.log("❌ Unexpected payment token");
      issues.push("Payment token mismatch");
    }
  } catch (error) {
    console.log(`❌ Payment token verification failed: ${error.message}`);
    issues.push("Cannot verify payment token");
  }
  
  // Validation 4: Initial state verification
  totalValidations++;
  console.log("\n4️⃣  Verifying initial contract state...");
  try {
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    
    console.log("📊 Initial State:");
    console.log(`├─ Total Users: ${totalUsers}`);
    console.log(`├─ Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
    
    console.log("✅ Contract state accessible");
    validationsPassed++;
  } catch (error) {
    console.log(`❌ Initial state verification failed: ${error.message}`);
    issues.push("Cannot verify initial state");
  }
  
  // Validation 5: Contract size check
  totalValidations++;
  console.log("\n5️⃣  Checking contract size...");
  try {
    const code = await ethers.provider.getCode(CONFIG.CONTRACT_ADDRESS);
    const size = (code.length - 2) / 2; // Remove 0x and convert to bytes
    const sizeKB = (size / 1024).toFixed(2);
    
    console.log(`📏 Contract Size: ${size} bytes (${sizeKB} KiB)`);
    
    if (size <= 24576) { // 24KB limit
      console.log("✅ Contract size within mainnet limits");
      validationsPassed++;
    } else {
      console.log("❌ Contract exceeds size limit!");
      issues.push("Contract too large for mainnet");
    }
  } catch (error) {
    console.log(`❌ Size check failed: ${error.message}`);
    issues.push("Cannot verify contract size");
  }
  
  // Final Results
  console.log("\n📊 POST-DEPLOYMENT VALIDATION RESULTS");
  console.log("=" .repeat(60));
  
  const successRate = (validationsPassed / totalValidations * 100).toFixed(1);
  console.log(`📈 Validations Passed: ${validationsPassed}/${totalValidations} (${successRate}%)`);
  
  if (validationsPassed === totalValidations) {
    console.log("\n🎉 ALL VALIDATIONS PASSED - DEPLOYMENT SUCCESSFUL!");
    console.log("✅ Contract is ready for production use");
    
    console.log("\n📋 NEXT STEPS:");
    console.log("1. ✅ Contract deployed and validated");
    console.log("2. 🔍 Verify contract on BSCScan");
    console.log("3. 🧪 Test with small registration");
    console.log("4. 🔄 Transfer ownership to Trezor");
    console.log("5. 🚀 Launch production frontend");
    
    console.log("\n🔗 USEFUL LINKS:");
    console.log(`├─ Contract: https://bscscan.com/address/${CONFIG.CONTRACT_ADDRESS}`);
    console.log(`├─ Verify: https://bscscan.com/verifyContract?a=${CONFIG.CONTRACT_ADDRESS}`);
    console.log(`└─ USDT: https://bscscan.com/address/${CONFIG.USDT_ADDRESS}`);
    
  } else {
    console.log("\n⚠️  VALIDATION ISSUES FOUND");
    console.log(`❌ ${issues.length} issue(s) detected:`);
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log("\n🔧 Investigate and fix these issues!");
  }
  
  return {
    validationsPassed,
    totalValidations,
    successRate: parseFloat(successRate),
    ready: validationsPassed === totalValidations,
    issues
  };
}

main()
  .then((result) => {
    if (result.ready) {
      console.log("\n✅ Post-deployment validation completed - DEPLOYMENT SUCCESSFUL!");
      process.exit(0);
    } else {
      console.log("\n❌ Post-deployment validation failed - INVESTIGATE ISSUES!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n❌ Post-deployment validation error:");
    console.error(error);
    process.exit(1);
  });
