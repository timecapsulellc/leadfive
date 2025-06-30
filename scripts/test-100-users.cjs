// scripts/test-100-users.cjs
// Focused testing with under 100 users - proper funding and verification

const { ethers } = require("hardhat");

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function faucet() returns (bool)"
];

const TEST_CONFIG = {
  LEADFIVE_PROXY: "0x292c11A70ef007B383671b2Ada56bd68ad8d4988",
  MOCK_USDT: "0x00175c710A7448920934eF830f2F22D6370E0642",
  TOTAL_USERS: 80,        // Under 100 users
  BATCH_SIZE: 10,         // Smaller batches
  TEST_ACCOUNTS: 10       // Only 10 test accounts to manage easily
};

async function main() {
  console.log("🚀 LeadFive Focused Testing - Under 100 Users");
  console.log("Testing with proper funding verification");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Testing with: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);

  // Connect to contracts
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(TEST_CONFIG.LEADFIVE_PROXY);
  const mockUSDT = new ethers.Contract(TEST_CONFIG.MOCK_USDT, ERC20_ABI, deployer);

  // Check initial USDT balance
  const initialUsdtBalance = await mockUSDT.balanceOf(deployer.address);
  console.log(`💵 Initial USDT: ${ethers.formatEther(initialUsdtBalance)} USDT`);

  // Generate and properly fund test accounts
  console.log(`\n🏗️ Generating ${TEST_CONFIG.TEST_ACCOUNTS} test accounts...`);
  const testAccounts = [];
  
  for (let i = 0; i < TEST_CONFIG.TEST_ACCOUNTS; i++) {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    testAccounts.push(wallet);
  }
  console.log(`✅ Generated ${testAccounts.length} test accounts`);

  // Fund accounts one by one with verification
  console.log("\n💰 Funding test accounts with verification...");
  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    
    try {
      // Fund with BNB for gas (smaller amount)
      console.log(`Funding account ${i + 1} with BNB...`);
      const bnbTx = await deployer.sendTransaction({
        to: account.address,
        value: ethers.parseEther("0.005") // Very small amount
      });
      await bnbTx.wait();

      // Fund with USDT (enough for multiple registrations)
      console.log(`Funding account ${i + 1} with USDT...`);
      const usdtAmount = ethers.parseEther("500"); // 500 USDT per account
      const usdtTx = await mockUSDT.transfer(account.address, usdtAmount);
      await usdtTx.wait();

      // Verify balances
      const bnbBalance = await ethers.provider.getBalance(account.address);
      const usdtBalance = await mockUSDT.balanceOf(account.address);
      
      console.log(`✅ Account ${i + 1}: ${ethers.formatEther(bnbBalance)} BNB, ${ethers.formatEther(usdtBalance)} USDT`);
      
      // Small delay to prevent overwhelming the network
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Error funding account ${i + 1}:`, error.message);
      return; // Exit if funding fails
    }
  }

  console.log("✅ All test accounts funded successfully!\n");

  // Start focused registration testing
  console.log(`🎯 Starting registration for ${TEST_CONFIG.TOTAL_USERS} users...`);
  
  let successCount = 0;
  let errorCount = 0;
  const registeredUsers = [];
  const statistics = {
    packageLevels: [0, 0, 0, 0], // Count for each package level
    totalVolume: ethers.parseEther("0"),
    errors: []
  };
  
  const batchSize = TEST_CONFIG.BATCH_SIZE;
  const totalBatches = Math.ceil(TEST_CONFIG.TOTAL_USERS / batchSize);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, TEST_CONFIG.TOTAL_USERS);
    const batchUsers = batchEnd - batchStart;
    
    console.log(`\n📦 Batch ${batch + 1}/${totalBatches} - Testing ${batchUsers} registrations`);
    
    for (let i = 0; i < batchUsers; i++) {
      const userIndex = batchStart + i;
      const accountIndex = userIndex % testAccounts.length;
      const account = testAccounts[accountIndex];
      
      // Cycle through package levels for variety
      const packageLevel = (userIndex % 4) + 1;
      const packagePrices = [
        ethers.parseEther("30"),   // Package 1
        ethers.parseEther("50"),   // Package 2
        ethers.parseEther("100"),  // Package 3
        ethers.parseEther("200")   // Package 4
      ];
      const packagePrice = packagePrices[packageLevel - 1];
      
      // Use deployer as referrer for first user, then random registered users
      const referrer = successCount > 0 ? 
        registeredUsers[Math.floor(Math.random() * registeredUsers.length)] : 
        deployer.address;
        
      const customCode = `TEST${String(userIndex + 1).padStart(3, '0')}`;
      
      try {
        // Verify account has sufficient balance before registration
        const accountUsdtBalance = await mockUSDT.balanceOf(account.address);
        if (accountUsdtBalance < packagePrice) {
          throw new Error(`Insufficient USDT: has ${ethers.formatEther(accountUsdtBalance)}, needs ${ethers.formatEther(packagePrice)}`);
        }
        
        // Connect contracts to user account
        const leadFiveContract = leadFive.connect(account);
        const usdtContract = mockUSDT.connect(account);
        
        // Approve USDT spending
        const approveTx = await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, packagePrice);
        await approveTx.wait();
        
        // Register with USDT
        const registerTx = await leadFiveContract.register(referrer, packageLevel, true, customCode);
        await registerTx.wait();
        
        // Success!
        successCount++;
        registeredUsers.push(account.address);
        statistics.packageLevels[packageLevel - 1]++;
        statistics.totalVolume = statistics.totalVolume + packagePrice;
        
        console.log(`✅ User ${userIndex + 1}: Package ${packageLevel}, ${ethers.formatEther(packagePrice)} USDT`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = error.message.substring(0, 100) + (error.message.length > 100 ? "..." : "");
        statistics.errors.push(`User ${userIndex + 1}: ${errorMsg}`);
        console.log(`❌ User ${userIndex + 1}: ${errorMsg}`);
      }
      
      // Small delay between registrations
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`📊 Batch ${batch + 1} Summary: ${successCount - (batch * batchSize)} successful registrations`);
    console.log(`📈 Total Progress: ${successCount}/${TEST_CONFIG.TOTAL_USERS} (${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    
    // Delay between batches
    if (batch < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Test upgrades with successful users
  console.log(`\n⬆️ Testing package upgrades (5 users)...`);
  let upgradeCount = 0;
  
  for (let i = 0; i < Math.min(5, registeredUsers.length); i++) {
    try {
      const userAddress = registeredUsers[i];
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      
      // Check current package level
      const userData = await leadFive.users(userAddress);
      const currentLevel = userData.packageLevel;
      
      if (currentLevel < 4) {
        const newLevel = Math.min(currentLevel + 1, 4);
        const upgradePrice = [ethers.parseEther("30"), ethers.parseEther("50"), ethers.parseEther("100"), ethers.parseEther("200")][newLevel - 1];
        
        const leadFiveContract = leadFive.connect(account);
        const usdtContract = mockUSDT.connect(account);
        
        // Approve and upgrade
        const approveTx = await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, upgradePrice);
        await approveTx.wait();
        
        const upgradeTx = await leadFiveContract.upgradePackage(newLevel, true);
        await upgradeTx.wait();
        
        upgradeCount++;
        console.log(`✅ Upgrade ${upgradeCount}: Level ${currentLevel} → ${newLevel}`);
      }
      
    } catch (error) {
      console.log(`❌ Upgrade ${i + 1} failed:`, error.message.substring(0, 50));
    }
  }

  // Test withdrawals
  console.log(`\n💸 Testing withdrawals (5 users)...`);
  let withdrawalCount = 0;
  
  for (let i = 0; i < Math.min(5, registeredUsers.length); i++) {
    try {
      const userAddress = registeredUsers[i];
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      
      // Check user balance
      const userData = await leadFive.users(userAddress);
      if (userData.balance > ethers.parseEther("5")) {
        const withdrawAmount = userData.balance / 2n; // Withdraw 50%
        
        const leadFiveContract = leadFive.connect(account);
        const tx = await leadFiveContract.withdraw(withdrawAmount);
        await tx.wait();
        
        withdrawalCount++;
        console.log(`✅ Withdrawal ${withdrawalCount}: ${ethers.formatEther(withdrawAmount)} USDT`);
      } else {
        console.log(`⚠️ User ${i + 1}: Insufficient balance for withdrawal`);
      }
      
    } catch (error) {
      console.log(`❌ Withdrawal ${i + 1} failed:`, error.message.substring(0, 50));
    }
  }

  // Test pool distributions
  console.log(`\n🏊 Testing pool distributions...`);
  let poolCount = 0;
  
  const pools = [
    { name: "Leader Pool", func: () => leadFive.distributeLeaderPool() },
    { name: "Help Pool", func: () => leadFive.distributeHelpPool() },
    { name: "Club Pool", func: () => leadFive.distributeClubPool() }
  ];
  
  for (const pool of pools) {
    try {
      const tx = await pool.func();
      await tx.wait();
      console.log(`✅ ${pool.name} distributed`);
      poolCount++;
    } catch (error) {
      console.log(`❌ ${pool.name} failed:`, error.message.substring(0, 50));
    }
  }

  // Final comprehensive report
  console.log("\n📊 FOCUSED TEST RESULTS (Under 100 Users)");
  console.log("=".repeat(70));
  
  try {
    // Get final contract state
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    const finalUsdtBalance = await mockUSDT.balanceOf(deployer.address);
    
    console.log("📈 REGISTRATION RESULTS:");
    console.log(`├─ Successful Registrations: ${successCount}/${TEST_CONFIG.TOTAL_USERS}`);
    console.log(`├─ Failed Registrations: ${errorCount}`);
    console.log(`├─ Success Rate: ${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(2)}%`);
    console.log(`├─ Package 1: ${statistics.packageLevels[0]} users`);
    console.log(`├─ Package 2: ${statistics.packageLevels[1]} users`);
    console.log(`├─ Package 3: ${statistics.packageLevels[2]} users`);
    console.log(`├─ Package 4: ${statistics.packageLevels[3]} users`);
    
    console.log("\n💰 TRANSACTION RESULTS:");
    console.log(`├─ Total Volume: ${ethers.formatEther(statistics.totalVolume)} USDT`);
    console.log(`├─ Package Upgrades: ${upgradeCount}`);
    console.log(`├─ Withdrawals: ${withdrawalCount}`);
    console.log(`├─ Pool Distributions: ${poolCount}/3`);
    
    console.log("\n📋 CONTRACT STATE:");
    console.log(`├─ Total Users in Contract: ${totalUsers}`);
    console.log(`├─ Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
    console.log(`├─ Remaining USDT: ${ethers.formatEther(finalUsdtBalance)} USDT`);
    
    console.log("\n🎯 ASSESSMENT:");
    if (successCount >= 60) {
      console.log("🎉 EXCELLENT RESULTS!");
      console.log("✅ Contract is performing exceptionally well");
      console.log("✅ Ready for larger scale testing and production");
    } else if (successCount >= 40) {
      console.log("✅ GOOD RESULTS!");
      console.log("✅ Contract is working properly");
      console.log("⚠️ Minor optimizations may be beneficial");
    } else if (successCount >= 20) {
      console.log("⚠️ MODERATE RESULTS");
      console.log("✅ Basic functionality confirmed");
      console.log("❓ Consider investigating failure causes");
    } else {
      console.log("❌ NEEDS ATTENTION");
      console.log("❌ High failure rate detected");
      console.log("❌ Review contract and test setup");
    }
    
    if (statistics.errors.length > 0) {
      console.log("\n❌ SAMPLE ERRORS (last 3):");
      statistics.errors.slice(-3).forEach((error, index) => {
        console.log(`│  ${index + 1}. ${error}`);
      });
    }
    
    console.log("\n✅ FUNCTIONS VERIFIED:");
    console.log(`├─ Registration: ${successCount > 0 ? '✅' : '❌'}`);
    console.log(`├─ Package Upgrades: ${upgradeCount > 0 ? '✅' : '❌'}`);
    console.log(`├─ Withdrawals: ${withdrawalCount > 0 ? '✅' : '❌'}`);
    console.log(`├─ Pool Distributions: ${poolCount === 3 ? '✅' : '⚠️'}`);
    
  } catch (error) {
    console.log("❌ Error getting final state:", error.message);
  }

  console.log("\n🎉 Focused testing completed!");
}

main()
  .then(() => {
    console.log("✅ Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
