// scripts/usdt-mass-test.cjs
// Mass testing focused on USDT payments to minimize BNB usage

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
  TOTAL_USERS: 1000,
  BATCH_SIZE: 15, // Smaller batches
  TEST_ACCOUNTS: 20  // Limited test accounts to save gas
};

async function main() {
  console.log("🚀 LeadFive USDT-Focused Mass Testing");
  console.log("Testing 1000+ registrations primarily with USDT");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Testing with: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);

  // Connect to contracts
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(TEST_CONFIG.LEADFIVE_PROXY);
  const mockUSDT = new ethers.Contract(TEST_CONFIG.MOCK_USDT, ERC20_ABI, deployer);

  // Check USDT balance
  const usdtBalance = await mockUSDT.balanceOf(deployer.address);
  console.log(`💵 USDT Balance: ${ethers.formatEther(usdtBalance)} USDT`);

  // Generate limited test accounts
  console.log(`🏗️ Generating ${TEST_CONFIG.TEST_ACCOUNTS} test accounts...`);
  const testAccounts = [];
  for (let i = 0; i < TEST_CONFIG.TEST_ACCOUNTS; i++) {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    testAccounts.push(wallet);
  }
  console.log(`✅ Generated ${testAccounts.length} test accounts`);

  // Fund accounts efficiently (minimal BNB, more USDT)
  console.log("💰 Funding test accounts...");
  for (let i = 0; i < testAccounts.length; i++) {
    try {
      // Give minimal BNB for gas
      const bnbTx = await deployer.sendTransaction({
        to: testAccounts[i].address,
        value: ethers.parseEther("0.01") // Minimal BNB
      });
      await bnbTx.wait();

      // Give USDT for registrations
      const usdtTx = await mockUSDT.transfer(testAccounts[i].address, ethers.parseEther("2000"));
      await usdtTx.wait();

      if ((i + 1) % 5 === 0) {
        console.log(`Funded ${i + 1}/${testAccounts.length} accounts`);
      }
    } catch (error) {
      console.log(`❌ Error funding account ${i + 1}:`, error.message);
    }
  }

  // Mass registration simulation
  console.log(`\n🎯 Starting registration simulation for ${TEST_CONFIG.TOTAL_USERS} users...`);
  
  let successCount = 0;
  let errorCount = 0;
  const registeredUsers = [];
  
  const batchSize = TEST_CONFIG.BATCH_SIZE;
  const totalBatches = Math.ceil(TEST_CONFIG.TOTAL_USERS / batchSize);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, TEST_CONFIG.TOTAL_USERS);
    const batchUsers = batchEnd - batchStart;
    
    console.log(`\n📦 Batch ${batch + 1}/${totalBatches} - Registering ${batchUsers} users`);
    
    const batchPromises = [];
    
    for (let i = 0; i < batchUsers; i++) {
      const userIndex = batchStart + i;
      const accountIndex = userIndex % testAccounts.length;
      const account = testAccounts[accountIndex];
      
      // Package distribution for testing
      const packageLevel = (userIndex % 4) + 1; // Cycle through 1-4
      const packagePrices = [
        ethers.parseEther("30"),   // Package 1
        ethers.parseEther("50"),   // Package 2
        ethers.parseEther("100"),  // Package 3
        ethers.parseEther("200")   // Package 4
      ];
      const packagePrice = packagePrices[packageLevel - 1];
      
      // Set referrer (always use deployer as root for simplicity)
      const referrer = successCount > 0 ? registeredUsers[Math.floor(Math.random() * registeredUsers.length)] : deployer.address;
      const customCode = `MASS${String(userIndex + 1).padStart(4, '0')}`;
      
      // Register with USDT (primary testing method)
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
        // Only log first few errors to avoid spam
        if (errorCount <= 10) {
          console.log(`❌ User ${batchStart + index + 1}: ${result.reason}`);
        }
      }
    });
    
    console.log(`✅ Batch ${batch + 1}: ${batchSuccess}/${batchUsers} successful`);
    console.log(`📊 Progress: ${successCount}/${TEST_CONFIG.TOTAL_USERS} (${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    
    // Delay between batches
    if (batch < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Test some upgrades
  console.log(`\n⬆️ Testing package upgrades...`);
  let upgradeCount = 0;
  
  for (let i = 0; i < Math.min(10, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      
      // Try to upgrade to package 4
      const upgradePrice = ethers.parseEther("200");
      const usdtContract = mockUSDT.connect(account);
      
      // Approve and upgrade
      const approveTx = await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, upgradePrice);
      await approveTx.wait();
      
      const upgradeTx = await leadFiveContract.upgradePackage(4, true);
      await upgradeTx.wait();
      
      upgradeCount++;
      console.log(`✅ Upgrade ${upgradeCount}: Account upgraded to package 4`);
      
    } catch (error) {
      console.log(`❌ Upgrade ${i + 1} failed:`, error.message);
    }
  }

  // Test withdrawals
  console.log(`\n💸 Testing withdrawals...`);
  let withdrawalCount = 0;
  
  for (let i = 0; i < Math.min(15, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      
      // Check balance and withdraw 50%
      const userData = await leadFive.users(account.address);
      if (userData.balance > ethers.parseEther("10")) {
        const withdrawAmount = userData.balance / 2n;
        
        const tx = await leadFiveContract.withdraw(withdrawAmount);
        await tx.wait();
        
        withdrawalCount++;
        console.log(`✅ Withdrawal ${withdrawalCount}: ${ethers.formatEther(withdrawAmount)} USDT`);
      }
    } catch (error) {
      console.log(`❌ Withdrawal ${i + 1} failed:`, error.message);
    }
  }

  // Test admin functions
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
      console.log(`❌ ${pool.name} distribution failed:`, error.message);
    }
  }

  // Final contract state
  console.log(`\n📋 Getting final contract state...`);
  try {
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    const finalUsdtBalance = await mockUSDT.balanceOf(deployer.address);
    
    console.log("\n📊 COMPREHENSIVE TEST RESULTS");
    console.log("=".repeat(60));
    console.log(`✅ Successful Registrations: ${successCount}/${TEST_CONFIG.TOTAL_USERS}`);
    console.log(`❌ Failed Registrations: ${errorCount}`);
    console.log(`📈 Success Rate: ${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(2)}%`);
    console.log(`⬆️ Package Upgrades: ${upgradeCount}`);
    console.log(`💸 Withdrawals Processed: ${withdrawalCount}`);
    console.log(`🏊 Pool Distributions: ${poolDistributions}/3`);
    
    console.log("\n📋 Contract State:");
    console.log(`├─ Total Users in Contract: ${totalUsers}`);
    console.log(`├─ Leader Pool Balance: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool Balance: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool Balance: ${ethers.formatEther(poolBalances[2])} USDT`);
    console.log(`├─ Remaining USDT: ${ethers.formatEther(finalUsdtBalance)} USDT`);
    
    console.log("\n🎯 TEST SUMMARY:");
    if (successCount >= 800) {
      console.log("🎉 EXCELLENT - High success rate achieved!");
      console.log("✅ Contract is ready for production deployment");
    } else if (successCount >= 500) {
      console.log("✅ GOOD - Reasonable success rate");
      console.log("⚠️ Consider optimizing for better performance");
    } else {
      console.log("⚠️ NEEDS IMPROVEMENT - Low success rate");
      console.log("❌ Review and fix issues before production");
    }
    
    console.log(`\n📊 Volume Processed:`);
    console.log(`├─ Estimated USDT Volume: ${ethers.formatEther(BigInt(successCount) * ethers.parseEther("100"))} USDT`);
    console.log(`├─ Users Served: ${successCount}`);
    console.log(`├─ Functions Tested: Registration, Upgrades, Withdrawals, Pool Distribution`);
    
    console.log("\n✅ Mass testing completed successfully!");
    
  } catch (error) {
    console.log("❌ Error getting final state:", error.message);
  }
}

async function registerUserWithUSDT(account, leadFive, mockUSDT, packageLevel, packagePrice, referrer, customCode, userNumber) {
  try {
    // Connect contracts to user account
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
    throw `User ${userNumber} failed: ${error.message}`;
  }
}

main()
  .then(() => {
    console.log("🎉 Testing completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
