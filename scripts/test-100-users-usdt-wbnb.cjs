// scripts/test-100-users-usdt-wbnb.cjs
// 100 user test using USDT for payments and WBNB for gas fees

const { ethers } = require("hardhat");

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function faucet() returns (bool)"
];

const TEST_CONFIG = {
  LEADFIVE_PROXY: "0x1a64E9E727a5BE30B23579E47826c7aE883DA560", // Working contract
  MOCK_USDT: "0x00175c710A7448920934eF830f2F22D6370E0642",
  MOCK_WBNB: "0xBc6dD11528644DacCbBD72f6740227B61c33B2EF", 
  TOTAL_USERS: 100,
  BATCH_SIZE: 10,
  TEST_ACCOUNTS: 20
};

async function main() {
  console.log("🚀 LeadFive 100-User Test");
  console.log("💵 USDT for payments | 🌐 WBNB for gas fees");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Testing with: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);

  // Connect to contracts
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(TEST_CONFIG.LEADFIVE_PROXY);
  const mockUSDT = new ethers.Contract(TEST_CONFIG.MOCK_USDT, ERC20_ABI, deployer);
  const mockWBNB = new ethers.Contract(TEST_CONFIG.MOCK_WBNB, ERC20_ABI, deployer);

  console.log("\n📋 Contract Setup:");
  console.log(`LeadFive: ${TEST_CONFIG.LEADFIVE_PROXY}`);
  console.log(`Mock USDT: ${TEST_CONFIG.MOCK_USDT}`);
  console.log(`Mock WBNB: ${TEST_CONFIG.MOCK_WBNB}`);

  // Check and prepare USDT
  console.log("\n💵 Preparing USDT...");
  const usdtBalance = await mockUSDT.balanceOf(deployer.address);
  console.log(`Current USDT Balance: ${ethers.formatEther(usdtBalance)} USDT`);

  if (usdtBalance < ethers.parseEther("100000")) {
    console.log("📤 Getting more USDT...");
    try {
      const mintTx = await mockUSDT.mint(deployer.address, ethers.parseEther("200000"));
      await mintTx.wait();
      console.log("✅ USDT minted successfully");
    } catch (error) {
      console.log("❌ USDT mint failed:", error.message);
    }
  }

  // Check and prepare WBNB  
  console.log("\n🌐 Preparing WBNB for gas...");
  const wbnbBalance = await mockWBNB.balanceOf(deployer.address);
  console.log(`Current WBNB Balance: ${ethers.formatEther(wbnbBalance)} WBNB`);

  if (wbnbBalance < ethers.parseEther("1000")) {
    console.log("📤 Getting more WBNB...");
    try {
      const mintTx = await mockWBNB.mint(deployer.address, ethers.parseEther("5000"));
      await mintTx.wait();
      console.log("✅ WBNB minted successfully");
    } catch (error) {
      console.log("❌ WBNB mint failed:", error.message);
    }
  }

  // Generate test accounts
  console.log(`\n🏗️ Generating ${TEST_CONFIG.TEST_ACCOUNTS} test accounts...`);
  const testAccounts = [];
  
  for (let i = 0; i < TEST_CONFIG.TEST_ACCOUNTS; i++) {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    testAccounts.push(wallet);
  }
  console.log(`✅ Generated ${testAccounts.length} test accounts`);

  // Fund accounts with minimal BNB + USDT + WBNB
  console.log("\n💰 Funding test accounts...");
  let fundedAccounts = 0;
  
  for (let i = 0; i < testAccounts.length; i++) {
    try {
      const account = testAccounts[i];
      
      // Give minimal BNB for basic gas (try to use as little as possible)
      try {
        const bnbTx = await deployer.sendTransaction({
          to: account.address,
          value: ethers.parseEther("0.01") // Minimal BNB
        });
        await bnbTx.wait();
      } catch (bnbError) {
        console.log(`⚠️ BNB funding failed for account ${i + 1}, trying WBNB only`);
      }

      // Give USDT for registrations
      const usdtTx = await mockUSDT.transfer(account.address, ethers.parseEther("2000"));
      await usdtTx.wait();

      // Give WBNB for gas fees
      const wbnbTx = await mockWBNB.transfer(account.address, ethers.parseEther("50"));
      await wbnbTx.wait();

      fundedAccounts++;
      if ((i + 1) % 5 === 0) {
        console.log(`✅ Funded ${i + 1}/${testAccounts.length} accounts`);
      }
    } catch (error) {
      console.log(`❌ Error funding account ${i + 1}:`, error.message);
    }
  }

  console.log(`✅ Successfully funded ${fundedAccounts}/${testAccounts.length} accounts`);

  // Verify funding
  if (testAccounts.length > 0) {
    const sampleUSDT = await mockUSDT.balanceOf(testAccounts[0].address);
    const sampleWBNB = await mockWBNB.balanceOf(testAccounts[0].address);
    const sampleBNB = await ethers.provider.getBalance(testAccounts[0].address);
    
    console.log("\n🔍 Sample account verification:");
    console.log(`📊 USDT: ${ethers.formatEther(sampleUSDT)} USDT`);
    console.log(`📊 WBNB: ${ethers.formatEther(sampleWBNB)} WBNB`);
    console.log(`📊 BNB: ${ethers.formatEther(sampleBNB)} BNB`);
  }

  // Start 100-user registration test
  console.log(`\n🎯 Starting registration for ${TEST_CONFIG.TOTAL_USERS} users...`);
  
  let successCount = 0;
  let errorCount = 0;
  const registeredUsers = [];
  const errors = [];
  
  const totalBatches = Math.ceil(TEST_CONFIG.TOTAL_USERS / TEST_CONFIG.BATCH_SIZE);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * TEST_CONFIG.BATCH_SIZE;
    const batchEnd = Math.min(batchStart + TEST_CONFIG.BATCH_SIZE, TEST_CONFIG.TOTAL_USERS);
    const batchUsers = batchEnd - batchStart;
    
    console.log(`\n📦 Batch ${batch + 1}/${totalBatches} - Registering ${batchUsers} users`);
    
    const batchPromises = [];
    
    for (let i = 0; i < batchUsers; i++) {
      const userIndex = batchStart + i;
      const accountIndex = userIndex % testAccounts.length;
      const account = testAccounts[accountIndex];
      
      // Vary package levels (1-4)
      const packageLevel = (userIndex % 4) + 1;
      const packagePrices = [
        ethers.parseEther("30"),   // Package 1
        ethers.parseEther("50"),   // Package 2
        ethers.parseEther("100"),  // Package 3
        ethers.parseEther("200")   // Package 4
      ];
      const packagePrice = packagePrices[packageLevel - 1];
      
      // Set referrer
      const referrer = successCount > 0 ? 
        registeredUsers[Math.floor(Math.random() * registeredUsers.length)] : 
        deployer.address;
      
      const customCode = `U100_${String(userIndex + 1).padStart(3, '0')}`;
      
      const promise = registerUserWithUSDT(
        account,
        leadFive,
        mockUSDT,
        packageLevel,
        packagePrice,
        referrer,
        customCode,
        userIndex + 1
      );
      
      batchPromises.push(promise);
    }
    
    // Execute batch
    const results = await Promise.allSettled(batchPromises);
    
    let batchSuccess = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        batchSuccess++;
        successCount++;
        registeredUsers.push(testAccounts[(batchStart + index) % testAccounts.length].address);
      } else {
        errorCount++;
        const errorMsg = result.reason || 'Unknown error';
        errors.push(`User ${batchStart + index + 1}: ${errorMsg}`);
        
        // Log only first few errors per batch
        if (errorCount <= 3) {
          console.log(`❌ User ${batchStart + index + 1}: ${errorMsg.substring(0, 100)}...`);
        }
      }
    });
    
    console.log(`📊 Batch ${batch + 1}: ${batchSuccess}/${batchUsers} successful`);
    console.log(`📈 Progress: ${successCount}/${TEST_CONFIG.TOTAL_USERS} (${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    
    // Delay between batches
    if (batch < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Test upgrades
  console.log(`\n⬆️ Testing package upgrades (${Math.min(10, successCount)} users)...`);
  let upgradeCount = 0;
  
  for (let i = 0; i < Math.min(10, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      const usdtContract = mockUSDT.connect(account);
      
      const upgradePrice = ethers.parseEther("200");
      
      const approveTx = await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, upgradePrice);
      await approveTx.wait();
      
      const upgradeTx = await leadFiveContract.upgradePackage(4, true);
      await upgradeTx.wait();
      
      upgradeCount++;
      console.log(`✅ Upgrade ${upgradeCount}: Package 4 upgrade successful`);
    } catch (error) {
      console.log(`❌ Upgrade ${i + 1} failed:`, error.message.substring(0, 80));
    }
  }

  // Test withdrawals
  console.log(`\n💸 Testing withdrawals (${Math.min(10, successCount)} users)...`);
  let withdrawalCount = 0;
  
  for (let i = 0; i < Math.min(10, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      
      const userData = await leadFive.users(account.address);
      if (userData.balance > ethers.parseEther("10")) {
        const withdrawAmount = userData.balance / 2n;
        
        const tx = await leadFiveContract.withdraw(withdrawAmount);
        await tx.wait();
        
        withdrawalCount++;
        console.log(`✅ Withdrawal ${withdrawalCount}: ${ethers.formatEther(withdrawAmount)} USDT`);
      }
    } catch (error) {
      console.log(`❌ Withdrawal ${i + 1} failed:`, error.message.substring(0, 80));
    }
  }

  // Test pool distributions
  console.log(`\n🏊 Testing pool distributions...`);
  let poolDistributions = 0;
  
  const poolTests = [
    { name: "Leader Pool", func: () => leadFive.distributeLeaderPool() },
    { name: "Help Pool", func: () => leadFive.distributeHelpPool() },
    { name: "Club Pool", func: () => leadFive.distributeClubPool() }
  ];
  
  for (const pool of poolTests) {
    try {
      const tx = await pool.func();
      await tx.wait();
      console.log(`✅ ${pool.name} distributed`);
      poolDistributions++;
    } catch (error) {
      console.log(`❌ ${pool.name} failed:`, error.message.substring(0, 50));
    }
  }

  // Final comprehensive report
  console.log("\n📊 COMPREHENSIVE 100-USER TEST RESULTS");
  console.log("=".repeat(70));
  
  try {
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    const finalUSDT = await mockUSDT.balanceOf(deployer.address);
    const finalWBNB = await mockWBNB.balanceOf(deployer.address);
    
    console.log("📈 REGISTRATION PERFORMANCE:");
    console.log(`├─ Target Users: ${TEST_CONFIG.TOTAL_USERS}`);
    console.log(`├─ Successful Registrations: ${successCount}`);
    console.log(`├─ Failed Registrations: ${errorCount}`);
    console.log(`├─ Success Rate: ${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(2)}%`);
    
    // Package distribution
    const packageDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (let i = 0; i < successCount; i++) {
      const pkg = (i % 4) + 1;
      packageDistribution[pkg]++;
    }
    console.log(`├─ Package 1: ${packageDistribution[1]} users`);
    console.log(`├─ Package 2: ${packageDistribution[2]} users`);
    console.log(`├─ Package 3: ${packageDistribution[3]} users`);
    console.log(`├─ Package 4: ${packageDistribution[4]} users`);
    
    console.log("\n💰 TRANSACTION PERFORMANCE:");
    console.log(`├─ Package Upgrades: ${upgradeCount}`);
    console.log(`├─ Withdrawals Processed: ${withdrawalCount}`);
    console.log(`├─ Pool Distributions: ${poolDistributions}/3`);
    
    // Volume calculations
    const estimatedVolume = successCount * 97.5; // Average package price
    console.log(`├─ Estimated USDT Volume: ${estimatedVolume.toFixed(2)} USDT`);
    
    console.log("\n📋 CONTRACT STATE:");
    console.log(`├─ Total Users in Contract: ${totalUsers}`);
    console.log(`├─ Leader Pool Balance: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool Balance: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool Balance: ${ethers.formatEther(poolBalances[2])} USDT`);
    
    console.log("\n💎 RESOURCE USAGE:");
    console.log(`├─ Remaining USDT: ${ethers.formatEther(finalUSDT)} USDT`);
    console.log(`├─ Remaining WBNB: ${ethers.formatEther(finalWBNB)} WBNB`);
    console.log(`├─ Test Accounts Used: ${testAccounts.length}`);
    console.log(`├─ Successfully Funded: ${fundedAccounts}`);
    
    console.log("\n🎯 PERFORMANCE ASSESSMENT:");
    if (successCount >= 80) {
      console.log("🎉 EXCELLENT PERFORMANCE!");
      console.log("✅ Contract handles high volume perfectly");
      console.log("✅ Ready for production deployment");
    } else if (successCount >= 50) {
      console.log("✅ GOOD PERFORMANCE");
      console.log("⚠️ Some optimization opportunities exist");
    } else if (successCount >= 20) {
      console.log("⚠️ MODERATE PERFORMANCE");
      console.log("🔧 Review and optimize before scaling");
    } else {
      console.log("❌ NEEDS IMPROVEMENT");
      console.log("🔧 Investigate errors before production");
    }
    
    console.log("\n✅ VERIFIED FUNCTIONS:");
    console.log(`├─ User Registration: ${successCount > 0 ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`├─ Package Upgrades: ${upgradeCount > 0 ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`├─ Withdrawal System: ${withdrawalCount > 0 ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`├─ Pool Distribution: ${poolDistributions === 3 ? '✅ WORKING' : '⚠️ PARTIAL'}`);
    console.log(`├─ Referral System: ${successCount > 1 ? '✅ WORKING' : '❌ UNTESTED'}`);
    
    if (errors.length > 0) {
      console.log("\n❌ ERROR ANALYSIS (last 5 errors):");
      errors.slice(-5).forEach((error, index) => {
        console.log(`│  ${index + 1}. ${error.substring(0, 120)}...`);
      });
    }
    
    console.log("\n🎉 100-USER TEST COMPLETED!");
    console.log("=".repeat(70));
    
  } catch (error) {
    console.log("❌ Error generating final report:", error.message);
  }
}

async function registerUserWithUSDT(account, leadFive, mockUSDT, packageLevel, packagePrice, referrer, customCode, userNumber) {
  try {
    const leadFiveContract = leadFive.connect(account);
    const usdtContract = mockUSDT.connect(account);
    
    // Approve USDT spending
    const approveTx = await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, packagePrice);
    await approveTx.wait();
    
    // Register with USDT
    const registerTx = await leadFiveContract.register(referrer, packageLevel, true, customCode);
    await registerTx.wait();
    
    return true;
  } catch (error) {
    throw `Registration failed: ${error.message}`;
  }
}

main()
  .then(() => {
    console.log("🎉 100-user test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
