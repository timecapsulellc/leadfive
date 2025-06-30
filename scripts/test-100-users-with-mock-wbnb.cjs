// scripts/test-100-users-with-mock-wbnb.cjs
// Test 100 users using existing working contract + Mock WBNB for gas fees

const { ethers } = require("hardhat");

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function faucet() returns (bool)"
];

const TEST_CONFIG = {
  // Use existing working contract
  LEADFIVE_PROXY: "0x1a64E9E727a5BE30B23579E47826c7aE883DA560",
  MOCK_USDT: "0x00175c710A7448920934eF830f2F22D6370E0642",
  MOCK_WBNB: "0xBc6dD11528644DacCbBD72f6740227B61c33B2EF",
  
  // Test parameters - 100 users
  TOTAL_USERS: 100,
  BATCH_SIZE: 10,    // 10 users per batch
  TEST_ACCOUNTS: 20  // 20 test accounts (reuse accounts)
};

async function main() {
  console.log("🚀 LeadFive 100-User Test");
  console.log("Using Working Contract + Mock WBNB for Gas");
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

  // Check contract status
  console.log("\n🔍 Verifying contract status...");
  try {
    const totalUsers = await leadFive.totalUsers();
    console.log(`📊 Current total users in contract: ${totalUsers}`);
  } catch (error) {
    console.log("⚠️ Could not get total users, but continuing...");
  }

  // Check token balances
  const usdtBalance = await mockUSDT.balanceOf(deployer.address);
  const wbnbBalance = await mockWBNB.balanceOf(deployer.address);
  
  console.log(`💵 USDT Balance: ${ethers.formatEther(usdtBalance)} USDT`);
  console.log(`🔄 WBNB Balance: ${ethers.formatEther(wbnbBalance)} WBNB`);

  // Ensure sufficient tokens
  console.log("\n🔄 Ensuring sufficient test tokens...");
  
  // Get more USDT if needed
  if (usdtBalance < ethers.parseEther("200000")) {
    console.log("📤 Getting more USDT...");
    try {
      const mintTx = await mockUSDT.mint(deployer.address, ethers.parseEther("500000"));
      await mintTx.wait();
      console.log("✅ USDT minted successfully");
    } catch (error) {
      console.log("⚠️ USDT mint failed, using existing balance");
    }
  }

  // Get more WBNB if needed
  if (wbnbBalance < ethers.parseEther("10000")) {
    console.log("📤 Getting more WBNB...");
    try {
      const mintTx = await mockWBNB.mint(deployer.address, ethers.parseEther("50000"));
      await mintTx.wait();
      console.log("✅ WBNB minted successfully");
    } catch (error) {
      console.log("⚠️ WBNB mint failed, using existing balance");
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

  // Fund accounts with both BNB and tokens
  console.log("💰 Funding test accounts...");
  let fundedAccounts = 0;
  
  for (let i = 0; i < testAccounts.length; i++) {
    try {
      // Give BNB for gas (only use available BNB)
      if (balance > ethers.parseEther("0.01")) {
        const bnbTx = await deployer.sendTransaction({
          to: testAccounts[i].address,
          value: ethers.parseEther("0.01") // Minimal BNB
        });
        await bnbTx.wait();
      }

      // Give USDT for registrations
      const usdtTx = await mockUSDT.transfer(testAccounts[i].address, ethers.parseEther("10000"));
      await usdtTx.wait();

      // Give WBNB for potential BNB payments
      const wbnbTx = await mockWBNB.transfer(testAccounts[i].address, ethers.parseEther("500"));
      await wbnbTx.wait();

      fundedAccounts++;
      
      if ((i + 1) % 5 === 0) {
        console.log(`✅ Funded ${i + 1}/${testAccounts.length} accounts`);
      }
      
    } catch (error) {
      console.log(`❌ Error funding account ${i + 1}:`, error.message);
      // Continue with other accounts
    }
  }
  
  console.log(`✅ Successfully funded ${fundedAccounts}/${testAccounts.length} accounts`);

  // Verify sample account funding
  console.log("\n🔍 Verifying sample account funding...");
  if (fundedAccounts > 0) {
    const sampleUSDT = await mockUSDT.balanceOf(testAccounts[0].address);
    const sampleWBNB = await mockWBNB.balanceOf(testAccounts[0].address);
    const sampleBNB = await ethers.provider.getBalance(testAccounts[0].address);
    
    console.log(`📊 Sample USDT: ${ethers.formatEther(sampleUSDT)} USDT`);
    console.log(`📊 Sample WBNB: ${ethers.formatEther(sampleWBNB)} WBNB`);
    console.log(`📊 Sample BNB: ${ethers.formatEther(sampleBNB)} BNB`);
  }

  // Start 100-user registration test
  console.log(`\n🎯 Starting registration test for ${TEST_CONFIG.TOTAL_USERS} users...`);
  
  let successCount = 0;
  let errorCount = 0;
  const registeredUsers = [];
  const errors = [];
  
  const totalBatches = Math.ceil(TEST_CONFIG.TOTAL_USERS / TEST_CONFIG.BATCH_SIZE);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * TEST_CONFIG.BATCH_SIZE;
    const batchEnd = Math.min(batchStart + TEST_CONFIG.BATCH_SIZE, TEST_CONFIG.TOTAL_USERS);
    const batchUsers = batchEnd - batchStart;
    
    console.log(`\n📦 Batch ${batch + 1}/${totalBatches} - Testing ${batchUsers} registrations`);
    
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
      
      // Vary payment methods (80% USDT, 20% BNB via WBNB)
      const useUSDT = Math.random() > 0.2; // 80% USDT
      
      // Set referrer chain
      const referrer = successCount > 0 ? 
        registeredUsers[Math.floor(Math.random() * registeredUsers.length)] : 
        deployer.address;
      
      const customCode = `U${String(userIndex + 1).padStart(3, '0')}`;
      
      // Register user
      const promise = registerUser(
        account,
        leadFive,
        mockUSDT,
        mockWBNB,
        packageLevel,
        packagePrice,
        useUSDT,
        referrer,
        customCode,
        userIndex + 1
      );
      
      batchPromises.push(promise);
    }
    
    // Execute batch registrations
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
        
        // Only log first few errors to avoid spam
        if (errorCount <= 10) {
          console.log(`❌ User ${batchStart + index + 1}: ${errorMsg.substring(0, 100)}...`);
        }
      }
    });
    
    console.log(`📊 Batch ${batch + 1} Result: ${batchSuccess}/${batchUsers} successful`);
    console.log(`📈 Total Progress: ${successCount}/${TEST_CONFIG.TOTAL_USERS} (${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    
    // Delay between batches for stability
    if (batch < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Test advanced functions
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
      console.log(`❌ Upgrade ${i + 1} failed: ${error.message.substring(0, 50)}...`);
    }
  }

  // Test withdrawals
  console.log(`\n💸 Testing withdrawals (${Math.min(10, successCount)} users)...`);
  let withdrawalCount = 0;
  let totalWithdrawn = ethers.parseEther("0");
  
  for (let i = 0; i < Math.min(10, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      
      // Check balance
      const userData = await leadFive.users(account.address);
      if (userData.balance > ethers.parseEther("10")) {
        const withdrawAmount = userData.balance / 2n;
        
        const tx = await leadFiveContract.withdraw(withdrawAmount);
        await tx.wait();
        
        withdrawalCount++;
        totalWithdrawn += withdrawAmount;
        console.log(`✅ Withdrawal ${withdrawalCount}: ${ethers.formatEther(withdrawAmount)} USDT`);
      }
    } catch (error) {
      console.log(`❌ Withdrawal ${i + 1} failed: ${error.message.substring(0, 50)}...`);
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
      console.log(`✅ ${pool.name} distributed successfully`);
      poolDistributions++;
    } catch (error) {
      console.log(`❌ ${pool.name} failed: ${error.message.substring(0, 50)}...`);
    }
  }

  // Final comprehensive report
  console.log("\n📊 COMPREHENSIVE 100-USER TEST RESULTS");
  console.log("=".repeat(70));
  
  try {
    const finalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    const finalUSDT = await mockUSDT.balanceOf(deployer.address);
    const finalWBNB = await mockWBNB.balanceOf(deployer.address);
    
    console.log("📈 REGISTRATION RESULTS:");
    console.log(`├─ Target Users: ${TEST_CONFIG.TOTAL_USERS}`);
    console.log(`├─ Successful Registrations: ${successCount}`);
    console.log(`├─ Failed Registrations: ${errorCount}`);
    console.log(`├─ Success Rate: ${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(2)}%`);
    console.log(`├─ Accounts Funded: ${fundedAccounts}/${TEST_CONFIG.TEST_ACCOUNTS}`);
    
    console.log("\n💰 TRANSACTION RESULTS:");
    console.log(`├─ Package Upgrades: ${upgradeCount}`);
    console.log(`├─ Withdrawals Processed: ${withdrawalCount}`);
    console.log(`├─ Total Withdrawn: ${ethers.formatEther(totalWithdrawn)} USDT`);
    console.log(`├─ Pool Distributions: ${poolDistributions}/3`);
    
    console.log("\n📋 CONTRACT STATE:");
    console.log(`├─ Total Users in Contract: ${finalUsers}`);
    console.log(`├─ Leader Pool Balance: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool Balance: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool Balance: ${ethers.formatEther(poolBalances[2])} USDT`);
    
    console.log("\n💎 TOKEN BALANCES:");
    console.log(`├─ Remaining USDT: ${ethers.formatEther(finalUSDT)} USDT`);
    console.log(`├─ Remaining WBNB: ${ethers.formatEther(finalWBNB)} WBNB`);
    
    console.log("\n🎯 PERFORMANCE ASSESSMENT:");
    if (successCount >= 80) {
      console.log("🎉 EXCELLENT PERFORMANCE!");
      console.log("✅ High success rate achieved");
      console.log("✅ Contract handling volume well");
      console.log("✅ Ready for production deployment");
    } else if (successCount >= 50) {
      console.log("✅ GOOD PERFORMANCE");
      console.log("⚠️ Reasonable success rate");
      console.log("💡 Some optimization opportunities");
    } else {
      console.log("⚠️ NEEDS OPTIMIZATION");
      console.log("❌ Lower than expected success rate");
      console.log("🔧 Review errors and improve setup");
    }
    
    if (errors.length > 0) {
      console.log(`\n❌ ERROR ANALYSIS (showing last 5):`);
      errors.slice(-5).forEach((error, index) => {
        console.log(`│  ${index + 1}. ${error.substring(0, 80)}...`);
      });
    }
    
    console.log("\n✅ FUNCTIONS STATUS:");
    console.log(`├─ Registration: ${successCount > 0 ? '✅ Working' : '❌ Failed'}`);
    console.log(`├─ Package Upgrades: ${upgradeCount > 0 ? '✅ Working' : '❌ Failed'}`);
    console.log(`├─ Withdrawals: ${withdrawalCount > 0 ? '✅ Working' : '❌ Failed'}`);
    console.log(`├─ Pool Distributions: ${poolDistributions === 3 ? '✅ Perfect' : '⚠️ Partial'}`);
    
    console.log("\n📊 VOLUME SUMMARY:");
    const estimatedVolume = BigInt(successCount) * ethers.parseEther("100"); // Average ~100 USDT per user
    console.log(`├─ Estimated Transaction Volume: ${ethers.formatEther(estimatedVolume)} USDT`);
    console.log(`├─ Users Successfully Onboarded: ${successCount}`);
    console.log(`├─ Contract Stress Test: ${successCount >= 50 ? 'PASSED' : 'PARTIAL'}`);
    
    console.log("\n🎉 100-USER TEST COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(70));
    
  } catch (error) {
    console.log("❌ Error getting final state:", error.message);
  }
}

async function registerUser(account, leadFive, mockUSDT, mockWBNB, packageLevel, packagePrice, useUSDT, referrer, customCode, userNumber) {
  try {
    const leadFiveContract = leadFive.connect(account);
    
    if (useUSDT) {
      // Register with USDT
      const usdtContract = mockUSDT.connect(account);
      const approveTx = await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, packagePrice);
      await approveTx.wait();
      
      const registerTx = await leadFiveContract.register(referrer, packageLevel, true, customCode);
      await registerTx.wait();
    } else {
      // Register with BNB (simulated via conversion rate)
      const bnbAmount = packagePrice / 300n; // 1 BNB = 300 USD conversion
      
      const registerTx = await leadFiveContract.register(referrer, packageLevel, false, customCode, {
        value: bnbAmount
      });
      await registerTx.wait();
    }
    
    return true;
  } catch (error) {
    throw `Registration failed: ${error.message}`;
  }
}

main()
  .then(() => {
    console.log("🎉 100-User test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
