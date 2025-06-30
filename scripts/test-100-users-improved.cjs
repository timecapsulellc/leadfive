// scripts/test-100-users-improved.cjs
// Test 100 users with improved pool-based referral system

const { ethers } = require("hardhat");

const CONFIG = {
  LEADFIVE_CONTRACT: "0x1a64E9E727a5BE30B23579E47826c7aE883DA560",
  MOCK_USDT: "0x00175c710A7448920934eF830f2F22D6370E0642",
  MOCK_WBNB: "0xBc6dD11528644DacCbBD72f6740227B61c33B2EF",
  TOTAL_USERS: 100,
  BATCH_SIZE: 10
};

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function mint(address, uint256) returns (bool)"
];

async function main() {
  console.log("🚀 Testing 100 Users with Improved Referral Logic");
  console.log("=".repeat(60));
  
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
  
  // Check balances
  try {
    const usdtBalance = await mockUSDT.balanceOf(deployer.address);
    const wbnbBalance = await mockWBNB.balanceOf(deployer.address);
    
    console.log("\n💰 Current Balances:");
    console.log(`├─ USDT: ${ethers.formatEther(usdtBalance)} USDT`);
    console.log(`├─ WBNB: ${ethers.formatEther(wbnbBalance)} WBNB`);
    
    // Ensure we have enough tokens
    if (usdtBalance < ethers.parseEther("50000")) {
      console.log("🪙 Minting additional USDT...");
      await mockUSDT.mint(deployer.address, ethers.parseEther("100000"));
    }
    
    if (wbnbBalance < ethers.parseEther("1000")) {
      console.log("🪙 Minting additional WBNB...");
      await mockWBNB.mint(deployer.address, ethers.parseEther("2000"));
    }
    
  } catch (error) {
    console.log("⚠️ Error checking balances:", error.message);
  }
  
  // Generate test accounts 
  console.log("\n👥 Generating test accounts...");
  const testAccounts = [];
  for (let i = 0; i < CONFIG.TOTAL_USERS; i++) {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    testAccounts.push(wallet);
  }
  console.log(`✅ Generated ${testAccounts.length} test accounts`);
  
  // Fund accounts
  console.log('\n💸 Funding test accounts...');
  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    
    try {
      // Fund with BNB for gas
      const bnbAmount = ethers.parseEther("0.1");
      await deployer.sendTransaction({
        to: account.address,
        value: bnbAmount
      });
      
      // Fund with USDT
      const usdtAmount = ethers.parseEther("500");
      await mockUSDT.transfer(account.address, usdtAmount);
      
      if ((i + 1) % 20 === 0) {
        console.log(`├─ Funded ${i + 1}/${testAccounts.length} accounts`);
      }

    } catch (error) {
      console.log(`❌ Error funding account ${i + 1} (${account.address}):`, error.message);
    }
  }
  console.log('✅ All test accounts funded.');
  
  // Initialize referral pools - Pool-based system for better distribution
  const referralPools = {
    level1: [deployer.address], // Start with deployer as the root
    level2: [],
    level3: [],
    level4: []
  };
  
  // Start mass registration with improved referral logic
  console.log(`\n🎯 Starting registration for ${CONFIG.TOTAL_USERS} users...`);
  console.log("📋 Using pool-based referral system for maximum success");
  
  let successCount = 0;
  let errorCount = 0;
  const registeredUsers = [];
  const errorReasons = {};
  
  const totalBatches = Math.ceil(CONFIG.TOTAL_USERS / CONFIG.BATCH_SIZE);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * CONFIG.BATCH_SIZE;
    const batchEnd = Math.min(batchStart + CONFIG.BATCH_SIZE, CONFIG.TOTAL_USERS);
    const batchSize = batchEnd - batchStart;
    
    console.log(`\n📦 Batch ${batch + 1}/${totalBatches} - ${batchSize} users`);
    
    const batchPromises = [];
    
    for (let i = 0; i < batchSize; i++) {
      const userIndex = batchStart + i;
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
      
      // IMPROVED REFERRAL LOGIC: Use pool-based system
      let referrer;
      if (packageLevel === 1 && referralPools.level1.length > 0) {
        // Round-robin from level1 pool
        referrer = referralPools.level1[userIndex % referralPools.level1.length];
      } else if (packageLevel === 2 && referralPools.level2.length > 0) {
        referrer = referralPools.level2[userIndex % referralPools.level2.length];
      } else if (packageLevel === 3 && referralPools.level3.length > 0) {
        referrer = referralPools.level3[userIndex % referralPools.level3.length];
      } else if (packageLevel === 4 && referralPools.level4.length > 0) {
        referrer = referralPools.level4[userIndex % referralPools.level4.length];
      } else {
        // Fallback to deployer or existing successful users
        referrer = successCount > 0 ? registeredUsers[0] : deployer.address;
      }
      
      const customCode = `U${String(userIndex + 1).padStart(3, '0')}`;
      
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
        return { success: true, userIndex, account: account.address, packageLevel };
      }).catch((error) => {
        const reason = error.toString();
        errorReasons[reason] = (errorReasons[reason] || 0) + 1;
        return { success: false, userIndex, reason, packageLevel };
      });
      
      batchPromises.push(promise);
    }
    
    const batchResults = await Promise.all(batchPromises);
    let batchSuccess = 0;
    
    batchResults.forEach((result, index) => {
      if (result.success) {
        batchSuccess++;
        successCount++;
        registeredUsers.push(result.account);
        
        // Add to appropriate referral pool for future referrals
        const level = result.packageLevel;
        if (level === 1) referralPools.level1.push(result.account);
        else if (level === 2) referralPools.level2.push(result.account);
        else if (level === 3) referralPools.level3.push(result.account);
        else if (level === 4) referralPools.level4.push(result.account);
        
      } else {
        errorCount++;
        if (errorCount <= 10) {
          console.log(`❌ User ${batchStart + index + 1}: ${result.reason}`);
        }
      }
    });
    
    console.log(`✅ Batch ${batch + 1}: ${batchSuccess}/${batchSize} successful`);
    console.log(`📊 Total: ${successCount}/${CONFIG.TOTAL_USERS} (${((successCount/CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    console.log(`📋 Pool sizes: L1:${referralPools.level1.length} L2:${referralPools.level2.length} L3:${referralPools.level3.length} L4:${referralPools.level4.length}`);
    
    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Print error analysis
  console.log("\n📊 ERROR ANALYSIS:");
  Object.entries(errorReasons).forEach(([reason, count]) => {
    console.log(`├─ ${reason}: ${count} times`);
  });
  
  // Test upgrades
  console.log(`\n⬆️ Testing upgrades...`);
  let upgradeCount = 0;
  
  for (let i = 0; i < Math.min(10, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      const usdtContract = mockUSDT.connect(account);
      
      const upgradePrice = ethers.parseEther("200");
      
      const approveTx = await usdtContract.approve(CONFIG.LEADFIVE_CONTRACT, upgradePrice);
      await approveTx.wait();
      
      const upgradeTx = await leadFiveContract.upgradePackage(4, true);
      await upgradeTx.wait();
      
      upgradeCount++;
      console.log(`✅ Upgrade ${upgradeCount}/10 successful`);
    } catch (error) {
      console.log(`❌ Upgrade ${i + 1} failed: ${error.message}`);
    }
  }
  
  // Test withdrawals
  console.log(`\n💸 Testing withdrawals...`);
  let withdrawalCount = 0;
  
  for (let i = 0; i < Math.min(5, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      
      const withdrawTx = await leadFiveContract.withdraw();
      await withdrawTx.wait();
      
      withdrawalCount++;
      console.log(`✅ Withdrawal ${withdrawalCount}/5 successful`);
    } catch (error) {
      console.log(`❌ Withdrawal ${i + 1} failed: ${error.message}`);
    }
  }
  
  // Test pool distributions
  console.log(`\n🎱 Testing pool distributions...`);
  let poolCount = 0;
  
  try {
    await leadFive.distributeLeaderPool();
    poolCount++;
    console.log("✅ Leader pool distributed");
  } catch (error) {
    console.log("❌ Leader pool failed");
  }
  
  try {
    await leadFive.distributeHelpPool();
    poolCount++;
    console.log("✅ Help pool distributed");
  } catch (error) {
    console.log("❌ Help pool failed");
  }
  
  try {
    await leadFive.distributeClubPool();
    poolCount++;
    console.log("✅ Club pool distributed");
  } catch (error) {
    console.log("❌ Club pool failed");
  }
  
  // Final report
  console.log("\n📊 IMPROVED 100-USER TEST RESULTS");
  console.log("=".repeat(50));
  
  try {
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    
    console.log("📈 RESULTS:");
    console.log(`├─ Registrations: ${successCount}/${CONFIG.TOTAL_USERS} (${((successCount/CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    console.log(`├─ Upgrades: ${upgradeCount}`);
    console.log(`├─ Withdrawals: ${withdrawalCount}`);
    console.log(`├─ Pool Distributions: ${poolCount}/3`);
    
    console.log("\n📋 CONTRACT STATE:");
    console.log(`├─ Total Users: ${totalUsers}`);
    console.log(`├─ Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
    
    console.log("\n🎯 ASSESSMENT:");
    if (successCount >= 80) {
      console.log("🎉 EXCELLENT - Contract ready for production!");
    } else if (successCount >= 50) {
      console.log("✅ GOOD - Minor optimizations needed");
    } else {
      console.log("⚠️ NEEDS REVIEW - Check error patterns");
    }
    
    console.log("\n🔧 IMPROVEMENTS MADE:");
    console.log("├─ Pool-based referral system (not random)");
    console.log("├─ Round-robin referrer selection");
    console.log("├─ Level-specific referral pools");
    console.log("├─ Better error tracking and analysis");
    console.log("└─ Optimized batch processing");
    
  } catch (error) {
    console.log("❌ Error getting final state");
  }
  
  console.log("\n🎉 Improved 100-user test completed!");
}

async function registerUser(account, leadFive, mockUSDT, packageLevel, packagePrice, referrer, customCode, userNumber) {
  try {
    const leadFiveContract = leadFive.connect(account);
    const usdtContract = mockUSDT.connect(account);
    
    // Approve USDT
    const approveTx = await usdtContract.approve(CONFIG.LEADFIVE_CONTRACT, packagePrice);
    await approveTx.wait();
    
    // Register
    const registerTx = await leadFiveContract.register(referrer, packageLevel, true, customCode);
    await registerTx.wait();
    
    return true;
  } catch (error) {
    throw `Failed: ${error.message}`;
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
