// scripts/improved-test-100-users.cjs
// Improved test with pool-based referral system to maximize registration success

const { ethers } = require("hardhat");

const CONFIG = {
  LEADFIVE_CONTRACT: "0x1a64E9E727a5BE30B23579E47826c7aE883DA560",
  MOCK_USDT: "0x00175c710A7448920934eF830f2F22D6370E0642",
  MOCK_WBNB: "0xBc6dD11528644DacCbBD72f6740227B61c33B2EF",
  TOTAL_USERS: 100,
  BATCH_SIZE: 10,
  INITIAL_REFERRER_POOL_SIZE: 10  // Create 10 initial users with deployer as referrer
};

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function mint(address, uint256) returns (bool)"
];

// Custom error signatures for better debugging
const CUSTOM_ERRORS = {
  "0xb4fa3fb3": "InvalidReferrer",
  "0x356680b7": "IncorrectValue", 
  "0x4e487b71": "ArithmeticError",
  "0x08c379a0": "Error(string)" // Standard revert
};

function decodeRevertReason(error) {
  const errorMessage = error.message || error.toString();
  
  // Look for custom error signatures
  for (const [signature, name] of Object.entries(CUSTOM_ERRORS)) {
    if (errorMessage.includes(signature)) {
      return `${name} (${signature})`;
    }
  }
  
  // Look for revert reasons
  const revertMatch = errorMessage.match(/reverted with reason string '([^']+)'/);
  if (revertMatch) {
    return `Revert: ${revertMatch[1]}`;
  }
  
  const panicMatch = errorMessage.match(/reverted with panic code (0x[0-9a-fA-F]+)/);
  if (panicMatch) {
    return `Panic: ${panicMatch[1]}`;
  }
  
  // Return first 100 chars of error for debugging
  return errorMessage.substring(0, 100);
}

async function main() {
  console.log("🚀 Improved 100-User Test with Pool-Based Referral System");
  console.log("=".repeat(70));
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  
  // Connect to existing contracts
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(CONFIG.LEADFIVE_CONTRACT);
  
  const mockUSDT = new ethers.Contract(CONFIG.MOCK_USDT, ERC20_ABI, deployer);
  const mockWBNB = new ethers.Contract(CONFIG.MOCK_WBNB, ERC20_ABI, deployer);
  
  console.log("📋 Contract Status:");
  console.log(`├─ LeadFive: ${CONFIG.LEADFIVE_CONTRACT}`);
  console.log(`├─ Mock USDT: ${CONFIG.MOCK_USDT}`);
  console.log(`├─ Mock WBNB: ${CONFIG.MOCK_WBNB}`);
  
  // Check and ensure sufficient balances
  try {
    const usdtBalance = await mockUSDT.balanceOf(deployer.address);
    const wbnbBalance = await mockWBNB.balanceOf(deployer.address);
    
    console.log("\n💰 Current Balances:");
    console.log(`├─ USDT: ${ethers.formatEther(usdtBalance)} USDT`);
    console.log(`├─ WBNB: ${ethers.formatEther(wbnbBalance)} WBNB`);
    
    // Ensure we have enough tokens
    if (usdtBalance < ethers.parseEther("50000")) {
      console.log("📤 Minting more USDT...");
      const mintTx = await mockUSDT.mint(deployer.address, ethers.parseEther("100000"));
      await mintTx.wait();
      console.log("✅ USDT minted");
    }
    
    if (wbnbBalance < ethers.parseEther("10000")) {
      console.log("📤 Minting more WBNB...");
      const mintTx = await mockWBNB.mint(deployer.address, ethers.parseEther("20000"));
      await mintTx.wait();
      console.log("✅ WBNB minted");
    }
    
  } catch (error) {
    console.log("❌ Error checking balances:", error.message);
    return;
  }
  
  // Generate test accounts
  console.log("\n🏗️ Generating test accounts...");
  const testAccounts = [];
  for (let i = 0; i < 25; i++) {  // Increased to 25 accounts for better distribution
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    testAccounts.push(wallet);
  }
  console.log(`✅ Generated ${testAccounts.length} test accounts`);
  
  // Fund test accounts
  console.log("\n💰 Funding test accounts...");
  const bnbAmount = ethers.parseEther("0.08"); // Increased BNB for gas
  const usdtAmount = ethers.parseEther("3000"); // Increased USDT for multiple registrations

  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    try {
      // 1. Fund with BNB for gas
      console.log(`[${i + 1}/${testAccounts.length}] Funding ${account.address.substring(0,8)}... with BNB and USDT`);
      const bnbTx = await deployer.sendTransaction({
        to: account.address,
        value: bnbAmount
      });
      await bnbTx.wait(1);

      // 2. Fund with USDT for payment
      const usdtTx = await mockUSDT.transfer(account.address, usdtAmount);
      await usdtTx.wait(1);
      
      console.log(`  ✅ Funded: ${ethers.formatEther(bnbAmount)} BNB + ${ethers.formatEther(usdtAmount)} USDT`);

    } catch (error) {
      console.log(`❌ Error funding account ${i + 1}:`, decodeRevertReason(error));
    }
  }
  console.log('✅ All test accounts funded.');
  
  // Initialize tracking variables
  let successCount = 0;
  let errorCount = 0;
  const registeredUsers = [];
  const errorStats = {};
  
  // PHASE 1: Create initial referrer pool using deployer as referrer
  console.log(`\n🎯 PHASE 1: Creating initial referrer pool (${CONFIG.INITIAL_REFERRER_POOL_SIZE} users)`);
  console.log("=".repeat(60));
  
  for (let i = 0; i < CONFIG.INITIAL_REFERRER_POOL_SIZE; i++) {
    const accountIndex = i % testAccounts.length;
    const account = testAccounts[accountIndex];
    
    const packageLevel = (i % 4) + 1;
    const packagePrices = [
      ethers.parseEther("30"),
      ethers.parseEther("50"), 
      ethers.parseEther("100"),
      ethers.parseEther("200")
    ];
    const packagePrice = packagePrices[packageLevel - 1];
    const customCode = `POOL${String(i + 1).padStart(3, '0')}`;
    
    try {
      await registerUser(
        account,
        leadFive, 
        mockUSDT,
        packageLevel,
        packagePrice,
        deployer.address, // Always use deployer as referrer for initial pool
        customCode,
        i + 1
      );
      
      successCount++;
      registeredUsers.push(account.address);
      console.log(`✅ Pool user ${i + 1}: ${account.address.substring(0,8)}... registered (Package ${packageLevel})`);
      
    } catch (error) {
      errorCount++;
      const errorReason = decodeRevertReason(error);
      errorStats[errorReason] = (errorStats[errorReason] || 0) + 1;
      console.log(`❌ Pool user ${i + 1}: ${errorReason}`);
    }
    
    // Small delay between registrations
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`📊 Phase 1 Results: ${successCount}/${CONFIG.INITIAL_REFERRER_POOL_SIZE} successful`);
  console.log(`🎯 Referrer pool size: ${registeredUsers.length} valid referrers`);
  
  if (registeredUsers.length === 0) {
    console.log("❌ CRITICAL: No successful registrations in Phase 1. Cannot continue.");
    return;
  }
  
  // PHASE 2: Register remaining users using referrer pool
  const remainingUsers = CONFIG.TOTAL_USERS - CONFIG.INITIAL_REFERRER_POOL_SIZE;
  console.log(`\n🎯 PHASE 2: Registering remaining ${remainingUsers} users using referrer pool`);
  console.log("=".repeat(60));
  
  const totalBatches = Math.ceil(remainingUsers / CONFIG.BATCH_SIZE);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * CONFIG.BATCH_SIZE;
    const batchEnd = Math.min(batchStart + CONFIG.BATCH_SIZE, remainingUsers);
    const batchSize = batchEnd - batchStart;
    
    console.log(`\n📦 Batch ${batch + 1}/${totalBatches} - ${batchSize} users`);
    
    const batchPromises = [];
    
    for (let i = 0; i < batchSize; i++) {
      const userIndex = CONFIG.INITIAL_REFERRER_POOL_SIZE + batchStart + i;
      const accountIndex = userIndex % testAccounts.length;
      const account = testAccounts[accountIndex];
      
      const packageLevel = (userIndex % 4) + 1;
      const packagePrices = [
        ethers.parseEther("30"),
        ethers.parseEther("50"), 
        ethers.parseEther("100"),
        ethers.parseEther("200")
      ];
      const packagePrice = packagePrices[packageLevel - 1];
      
      // Use referrer pool instead of chain dependency
      const referrer = registeredUsers[Math.floor(Math.random() * registeredUsers.length)];
      const customCode = `USER${String(userIndex + 1).padStart(3, '0')}`;
      
      const promise = registerUser(
        account,
        leadFive, 
        mockUSDT,
        packageLevel,
        packagePrice,
        referrer,
        customCode,
        userIndex + 1
      ).then(() => {
        // Add to referrer pool on success (expand the pool)
        if (!registeredUsers.includes(account.address)) {
          registeredUsers.push(account.address);
        }
        return true;
      }).catch((error) => {
        const errorReason = decodeRevertReason(error);
        errorStats[errorReason] = (errorStats[errorReason] || 0) + 1;
        throw errorReason;
      });
      
      batchPromises.push(promise);
    }
    
    // Execute batch
    const results = await Promise.allSettled(batchPromises);
    
    let batchSuccess = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        batchSuccess++;
        successCount++;
      } else {
        errorCount++;
        if (errorCount <= 15) { // Show more errors for debugging
          console.log(`❌ User ${CONFIG.INITIAL_REFERRER_POOL_SIZE + batchStart + index + 1}: ${result.reason}`);
        }
      }
    });
    
    console.log(`✅ Batch ${batch + 1}: ${batchSuccess}/${batchSize} successful`);
    console.log(`📊 Overall: ${successCount}/${CONFIG.TOTAL_USERS} (${((successCount/CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    console.log(`🎯 Referrer pool: ${registeredUsers.length} users`);
    
    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Test upgrades
  console.log(`\n⬆️ Testing upgrades...`);
  let upgradeCount = 0;
  
  for (let i = 0; i < Math.min(15, registeredUsers.length); i++) {
    try {
      const userAddress = registeredUsers[i];
      const accountIndex = testAccounts.findIndex(acc => acc.address === userAddress);
      if (accountIndex === -1) continue;
      
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      const usdtContract = mockUSDT.connect(account);
      
      const upgradePrice = ethers.parseEther("200");
      
      const approveTx = await usdtContract.approve(CONFIG.LEADFIVE_CONTRACT, upgradePrice);
      await approveTx.wait();
      
      const upgradeTx = await leadFiveContract.upgradePackage(4, true);
      await upgradeTx.wait();
      
      upgradeCount++;
      console.log(`✅ Upgrade ${upgradeCount}: ${userAddress.substring(0,8)}...`);
    } catch (error) {
      console.log(`❌ Upgrade ${i + 1} failed: ${decodeRevertReason(error)}`);
    }
  }
  
  // Test withdrawals
  console.log(`\n💸 Testing withdrawals...`);
  let withdrawalCount = 0;
  
  for (let i = 0; i < Math.min(15, registeredUsers.length); i++) {
    try {
      const userAddress = registeredUsers[i];
      const accountIndex = testAccounts.findIndex(acc => acc.address === userAddress);
      if (accountIndex === -1) continue;
      
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      
      const userData = await leadFive.users(account.address);
      if (userData.balance > ethers.parseEther("5")) {
        const withdrawAmount = userData.balance / 2n;
        
        const tx = await leadFiveContract.withdraw(withdrawAmount);
        await tx.wait();
        
        withdrawalCount++;
        console.log(`✅ Withdrawal ${withdrawalCount}: ${ethers.formatEther(withdrawAmount)} USDT`);
      }
    } catch (error) {
      console.log(`❌ Withdrawal ${i + 1} failed: ${decodeRevertReason(error)}`);
    }
  }
  
  // Test pools
  console.log(`\n🏊 Testing pool distributions...`);
  let poolCount = 0;
  
  try {
    await leadFive.distributeLeaderPool();
    poolCount++;
    console.log("✅ Leader pool distributed");
  } catch (error) {
    console.log("❌ Leader pool failed:", decodeRevertReason(error));
  }
  
  try {
    await leadFive.distributeHelpPool();
    poolCount++;
    console.log("✅ Help pool distributed");
  } catch (error) {
    console.log("❌ Help pool failed:", decodeRevertReason(error));
  }
  
  try {
    await leadFive.distributeClubPool();
    poolCount++;
    console.log("✅ Club pool distributed");
  } catch (error) {
    console.log("❌ Club pool failed:", decodeRevertReason(error));
  }
  
  // Final report
  console.log("\n📊 IMPROVED 100-USER TEST RESULTS");
  console.log("=".repeat(60));
  
  try {
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    
    console.log("📈 REGISTRATION RESULTS:");
    console.log(`├─ Total Attempts: ${CONFIG.TOTAL_USERS}`);
    console.log(`├─ Successful: ${successCount} (${((successCount/CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    console.log(`├─ Failed: ${errorCount} (${((errorCount/CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    console.log(`├─ Referrer Pool Size: ${registeredUsers.length} users`);
    
    console.log("\n📈 OTHER OPERATIONS:");
    console.log(`├─ Upgrades: ${upgradeCount}`);
    console.log(`├─ Withdrawals: ${withdrawalCount}`);
    console.log(`├─ Pool Distributions: ${poolCount}/3`);
    
    console.log("\n📋 CONTRACT STATE:");
    console.log(`├─ Contract Total Users: ${totalUsers}`);
    console.log(`├─ Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
    
    console.log("\n🔍 ERROR ANALYSIS:");
    if (Object.keys(errorStats).length > 0) {
      for (const [error, count] of Object.entries(errorStats)) {
        const percentage = ((count / errorCount) * 100).toFixed(1);
        console.log(`├─ ${error}: ${count} (${percentage}%)`);
      }
    } else {
      console.log("├─ No errors recorded");
    }
    
    console.log("\n🎯 ASSESSMENT:");
    if (successCount >= 85) {
      console.log("🎉 EXCELLENT - Contract ready for production! (85%+ success rate)");
    } else if (successCount >= 70) {
      console.log("✅ VERY GOOD - Minor optimizations recommended (70%+ success rate)");
    } else if (successCount >= 50) {
      console.log("✅ GOOD - Some improvements needed (50%+ success rate)");
    } else {
      console.log("⚠️ NEEDS REVIEW - Check error patterns and contract logic");
    }
    
    console.log("\n💡 RECOMMENDATIONS:");
    if (successCount < 70) {
      console.log("├─ Investigate most common errors above");
      console.log("├─ Consider increasing gas limits");
      console.log("├─ Review contract validation logic");
      console.log("├─ Test with smaller batch sizes");
    } else {
      console.log("├─ System performance is acceptable for production");
      console.log("├─ Consider adding batch registration for efficiency");
      console.log("├─ Monitor error patterns in production");
    }
    
  } catch (error) {
    console.log("❌ Error getting final state:", decodeRevertReason(error));
  }
  
  console.log("\n🎉 Improved 100-user test completed!");
}

async function registerUser(account, leadFive, mockUSDT, packageLevel, packagePrice, referrer, customCode, userNumber) {
  try {
    const leadFiveContract = leadFive.connect(account);
    const usdtContract = mockUSDT.connect(account);
    
    // Check balances first
    const usdtBalance = await usdtContract.balanceOf(account.address);
    if (usdtBalance < packagePrice) {
      throw new Error(`Insufficient USDT: ${ethers.formatEther(usdtBalance)} < ${ethers.formatEther(packagePrice)}`);
    }
    
    // Approve USDT
    const approveTx = await usdtContract.approve(CONFIG.LEADFIVE_CONTRACT, packagePrice);
    await approveTx.wait();
    
    // Register
    const registerTx = await leadFiveContract.register(referrer, packageLevel, true, customCode);
    await registerTx.wait();
    
    return true;
  } catch (error) {
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ Improved test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
