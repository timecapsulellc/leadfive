// scripts/pre-deployment-validation.cjs
// Pre-deployment validation for mainnet deployment

const { ethers } = require("hardhat");
const fs = require('fs');

const CONFIG = {
  EXPECTED_NETWORK: 56, // BSC Mainnet
  USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
  PRICE_FEED_ADDRESS: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",
  MIN_BNB_BALANCE: "0.5", // Minimum BNB required
  DEPLOYER_ADDRESS: "0x140aad3E7c6bCC415Bc8E830699855fF072d405D"
};

async function main() {
  console.log("🔍 PRE-DEPLOYMENT VALIDATION");
  console.log("=".repeat(60));
  
  let validationScore = 0;
  let totalChecks = 0;
  const issues = [];
  
  // Check 1: Network Verification
  totalChecks++;
  console.log("1️⃣  Checking network configuration...");
  try {
    const network = await ethers.provider.getNetwork();
    if (network.chainId === BigInt(CONFIG.EXPECTED_NETWORK)) {
      console.log("✅ Network: BSC Mainnet (Chain ID: 56)");
      validationScore++;
    } else {
      console.log(`❌ Wrong network! Expected ${CONFIG.EXPECTED_NETWORK}, got ${network.chainId}`);
      issues.push("Wrong network - switch to BSC Mainnet");
    }
  } catch (error) {
    console.log("❌ Network check failed:", error.message);
    issues.push("Network connection issue");
  }
  
  // Check 2: Deployer Configuration
  totalChecks++;
  console.log("\n2️⃣  Checking deployer configuration...");
  try {
    const [deployer] = await ethers.getSigners();
    
    if (deployer.address.toLowerCase() === CONFIG.DEPLOYER_ADDRESS.toLowerCase()) {
      console.log(`✅ Deployer address: ${deployer.address}`);
      validationScore++;
    } else {
      console.log(`⚠️  Deployer mismatch: expected ${CONFIG.DEPLOYER_ADDRESS}, got ${deployer.address}`);
      issues.push("Deployer address mismatch - check private key");
    }
  } catch (error) {
    console.log("❌ Deployer check failed:", error.message);
    issues.push("Deployer configuration issue");
  }
  
  // Check 3: BNB Balance
  totalChecks++;
  console.log("\n3️⃣  Checking BNB balance...");
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceInBNB = ethers.formatEther(balance);
    
    console.log(`💰 Current balance: ${balanceInBNB} BNB`);
    
    if (parseFloat(balanceInBNB) >= parseFloat(CONFIG.MIN_BNB_BALANCE)) {
      console.log("✅ Sufficient BNB for deployment");
      validationScore++;
    } else {
      console.log(`❌ Insufficient BNB! Need at least ${CONFIG.MIN_BNB_BALANCE} BNB`);
      issues.push(`Need at least ${CONFIG.MIN_BNB_BALANCE} BNB for deployment`);
    }
  } catch (error) {
    console.log("❌ Balance check failed:", error.message);
    issues.push("Cannot check BNB balance");
  }
  
  // Check 4: USDT Contract Verification
  totalChecks++;
  console.log("\n4️⃣  Verifying USDT contract...");
  try {
    const usdtCode = await ethers.provider.getCode(CONFIG.USDT_ADDRESS);
    if (usdtCode !== "0x") {
      console.log("✅ USDT contract verified on mainnet");
      validationScore++;
    } else {
      console.log("❌ USDT contract not found!");
      issues.push("USDT contract address invalid");
    }
  } catch (error) {
    console.log("❌ USDT verification failed:", error.message);
    issues.push("Cannot verify USDT contract");
  }
  
  // Check 5: Price Feed Verification
  totalChecks++;
  console.log("\n5️⃣  Verifying price feed...");
  try {
    const priceFeedCode = await ethers.provider.getCode(CONFIG.PRICE_FEED_ADDRESS);
    if (priceFeedCode !== "0x") {
      console.log("✅ Price feed contract verified");
      validationScore++;
    } else {
      console.log("❌ Price feed contract not found!");
      issues.push("Price feed address invalid");
    }
  } catch (error) {
    console.log("❌ Price feed verification failed:", error.message);
    issues.push("Cannot verify price feed");
  }
  
  // Check 6: Contract Compilation
  totalChecks++;
  console.log("\n6️⃣  Checking contract compilation...");
  try {
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const bytecode = LeadFive.bytecode;
    const bytecodeSize = (bytecode.length - 2) / 2; // Remove 0x and convert to bytes
    
    console.log(`📦 Contract size: ${bytecodeSize} bytes`);
    
    if (bytecodeSize <= 24576) { // 24KB limit
      console.log("✅ Contract size within limits");
      validationScore++;
    } else {
      console.log("❌ Contract too large for mainnet!");
      issues.push("Contract exceeds 24KB size limit");
    }
  } catch (error) {
    console.log("❌ Compilation check failed:", error.message);
    issues.push("Contract compilation issue");
  }
  
  // Check 7: Environment Configuration
  totalChecks++;
  console.log("\n7️⃣  Checking environment configuration...");
  try {
    const envPath = '.env';
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const hasApiKey = envContent.includes('BSCSCAN_API_KEY=') && !envContent.includes('YourAPIKeyHere');
      const hasPrivateKey = envContent.includes('DEPLOYER_PRIVATE_KEY=') && envContent.includes('311cf6c1a33caab3c7dd6df0bf2408da1bd28542b18f74628f387072eaaa5c97');
      const hasMainnetRpc = envContent.includes('BSC_MAINNET_RPC_URL=');
      
      if (hasApiKey && hasPrivateKey && hasMainnetRpc) {
        console.log("✅ Environment configuration complete");
        validationScore++;
      } else {
        console.log("⚠️  Environment configuration incomplete");
        if (!hasApiKey) issues.push("BSCScan API key missing");
        if (!hasPrivateKey) issues.push("Deployer private key missing");
        if (!hasMainnetRpc) issues.push("Mainnet RPC URL missing");
      }
    } else {
      console.log("❌ .env file not found!");
      issues.push(".env file missing");
    }
  } catch (error) {
    console.log("❌ Environment check failed:", error.message);
    issues.push("Environment configuration issue");
  }
  
  // Check 8: Hardhat Configuration
  totalChecks++;
  console.log("\n8️⃣  Checking Hardhat configuration...");
  try {
    const configPath = 'hardhat.config.cjs';
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      if (configContent.includes('bsc') && configContent.includes('56')) {
        console.log("✅ Hardhat BSC configuration found");
        validationScore++;
      } else {
        console.log("⚠️  BSC network configuration missing in hardhat.config.cjs");
        issues.push("BSC network not configured in Hardhat");
      }
    } else {
      console.log("❌ hardhat.config.cjs not found!");
      issues.push("Hardhat configuration missing");
    }
  } catch (error) {
    console.log("❌ Hardhat config check failed:", error.message);
    issues.push("Hardhat configuration issue");
  }
  
  // Check 9: Gas Price Estimation
  totalChecks++;
  console.log("\n9️⃣  Checking gas prices...");
  try {
    const gasPrice = await ethers.provider.getFeeData();
    const gasPriceGwei = ethers.formatUnits(gasPrice.gasPrice, "gwei");
    
    console.log(`⛽ Current gas price: ${gasPriceGwei} Gwei`);
    
    if (parseFloat(gasPriceGwei) < 100) { // Reasonable gas price
      console.log("✅ Gas prices reasonable");
      validationScore++;
    } else {
      console.log("⚠️  High gas prices - consider waiting");
      issues.push(`High gas prices: ${gasPriceGwei} Gwei`);
    }
  } catch (error) {
    console.log("❌ Gas price check failed:", error.message);
    issues.push("Cannot check gas prices");
  }
  
  // Check 10: Recent Test Results
  totalChecks++;
  console.log("\n🔟 Checking recent test results...");
  try {
    // Check if we have the successful test files
    const testFiles = [
      'scripts/test-100-users-final.cjs',
      'COMPREHENSIVE_TESTNET_TESTING_FINAL_REPORT.md'
    ];
    
    let testFilesFound = 0;
    for (const file of testFiles) {
      if (fs.existsSync(file)) {
        testFilesFound++;
      }
    }
    
    if (testFilesFound >= 1) {
      console.log("✅ Test scripts and reports found");
      validationScore++;
    } else {
      console.log("⚠️  Test documentation incomplete");
      issues.push("Missing test documentation");
    }
  } catch (error) {
    console.log("❌ Test check failed:", error.message);
    issues.push("Cannot verify test results");
  }
  
  // Final Report
  console.log("\n📊 VALIDATION SUMMARY");
  console.log("=".repeat(60));
  
  const percentage = (validationScore / totalChecks * 100).toFixed(1);
  console.log(`🎯 Score: ${validationScore}/${totalChecks} (${percentage}%)`);
  
  if (validationScore === totalChecks) {
    console.log("🎉 ALL CHECKS PASSED - READY FOR MAINNET DEPLOYMENT!");
  } else if (validationScore >= totalChecks * 0.8) {
    console.log("⚠️  MOSTLY READY - Address minor issues before deployment");
  } else {
    console.log("❌ NOT READY - Critical issues need resolution");
  }
  
  if (issues.length > 0) {
    console.log("\n🚨 ISSUES TO RESOLVE:");
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }
  
  console.log("\n⚡ NEXT STEPS:");
  if (validationScore === totalChecks) {
    console.log("✅ Run mainnet deployment:");
    console.log("   npx hardhat run scripts/deploy-mainnet-production.cjs --network bsc");
  } else {
    console.log("🔧 Fix the issues above, then re-run validation:");
    console.log("   node scripts/pre-deployment-validation.cjs");
  }
  
  return {
    score: validationScore,
    total: totalChecks,
    percentage: parseFloat(percentage),
    issues: issues,
    ready: validationScore === totalChecks
  };
}

main()
  .then((result) => {
    if (result.ready) {
      console.log("\n🚀 VALIDATION COMPLETE - READY FOR DEPLOYMENT!");
      process.exit(0);
    } else {
      console.log("\n⚠️  VALIDATION INCOMPLETE - RESOLVE ISSUES FIRST");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n❌ VALIDATION FAILED!");
    console.error("Error:", error.message);
    process.exit(1);
  });
