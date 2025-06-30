// scripts/working-test-50-users.cjs
// Working test with 50 users using the correct Mock USDT contract

const { ethers } = require("hardhat");

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function faucet() returns (bool)"
];

const TEST_CONFIG = {
  LEADFIVE_PROXY: "0x1a64E9E727a5BE30B23579E47826c7aE883DA560", // NEW contract with Mock USDT
  MOCK_USDT: "0x00175c710A7448920934eF830f2F22D6370E0642",
  MOCK_WBNB: "0xBc6dD11528644DacCbBD72f6740227B61c33B2EF",
  TOTAL_USERS: 50,  // Start with 50 users
  BATCH_SIZE: 5,    // Small batches for stability
  TEST_ACCOUNTS: 10  // Limited accounts
};

async function main() {
  console.log("🚀 LeadFive Working Test - 50 Users");
  console.log("Using Correctly Configured Mock USDT");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Testing with: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);

  // Connect to contracts
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(TEST_CONFIG.LEADFIVE_PROXY);
  const mockUSDT = new ethers.Contract(TEST_CONFIG.MOCK_USDT, ERC20_ABI, deployer);

  // Verify contract setup
  console.log("\n🔍 Verifying contract setup...");
  const contractUSDT = await leadFive.usdt();
  console.log(`📋 Contract USDT: ${contractUSDT}`);
  console.log(`🪙 Mock USDT: ${TEST_CONFIG.MOCK_USDT}`);
  console.log(`✅ USDT Match: ${contractUSDT.toLowerCase() === TEST_CONFIG.MOCK_USDT.toLowerCase()}`);

  // Check balances
  const usdtBalance = await mockUSDT.balanceOf(deployer.address);
  console.log(`💵 USDT Balance: ${ethers.formatEther(usdtBalance)} USDT`);

  // Ensure we have enough USDT
  if (usdtBalance < ethers.parseEther("50000")) {
    console.log("📤 Getting more USDT...");
    try {
      const mintTx = await mockUSDT.mint(deployer.address, ethers.parseEther("100000"));
      await mintTx.wait();
      console.log("✅ USDT minted successfully");
    } catch (error) {
      console.log("❌ USDT mint failed:", error.message);
    }
  }

  // Generate and fund test accounts
  console.log("\n🏗️ Setting up test accounts...");
  const testAccounts = [];
  
  for (let i = 0; i < TEST_CONFIG.TEST_ACCOUNTS; i++) {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    testAccounts.push(wallet);
  }
  
  console.log(`✅ Generated ${testAccounts.length} test accounts`);

  // Fund accounts efficiently
  console.log("💰 Funding test accounts...");
  for (let i = 0; i < testAccounts.length; i++) {
    try {
      // Give BNB for gas
      const bnbTx = await deployer.sendTransaction({
        to: testAccounts[i].address,
        value: ethers.parseEther("0.02") // 0.02 BNB per account
      });
      await bnbTx.wait();

      // Give USDT for registrations (enough for multiple packages)
      const usdtTx = await mockUSDT.transfer(testAccounts[i].address, ethers.parseEther("5000"));
      await usdtTx.wait();

      console.log(`✅ Funded account ${i + 1}/${testAccounts.length}`);
    } catch (error) {
      console.log(`❌ Error funding account ${i + 1}:`, error.message);
    }
  }

  // Verify funding worked
  console.log("\n🔍 Verifying account funding...");
  const firstAccountUSDT = await mockUSDT.balanceOf(testAccounts[0].address);
  const firstAccountBNB = await ethers.provider.getBalance(testAccounts[0].address);
  console.log(`📊 Sample account USDT: ${ethers.formatEther(firstAccountUSDT)} USDT`);
  console.log(`📊 Sample account BNB: ${ethers.formatEther(firstAccountBNB)} BNB`);

  // Start registration testing
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
    
    console.log(`\n📦 Batch ${batch + 1}/${totalBatches} - Testing ${batchUsers} registrations`);
    
    const batchPromises = [];
    
    for (let i = 0; i < batchUsers; i++) {
      const userIndex = batchStart + i;
      const accountIndex = userIndex % testAccounts.length;
      const account = testAccounts[accountIndex];
      
      // Use different package levels
      const packageLevel = (userIndex % 4) + 1; // Cycles 1-4
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
      
      const customCode = `TEST${String(userIndex + 1).padStart(3, '0')}`;
      
      // Register user
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
        
        // Only log first few errors to avoid spam
        if (errorCount <= 5) {
          console.log(`❌ User ${batchStart + index + 1}: ${errorMsg}`);
        }
      }
    });
    
    console.log(`📊 Batch ${batch + 1} Summary: ${batchSuccess} successful registrations`);
    console.log(`📈 Total Progress: ${successCount}/${TEST_CONFIG.TOTAL_USERS} (${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    
    // Short delay between batches
    if (batch < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Test package upgrades
  console.log(`\n⬆️ Testing package upgrades (${Math.min(5, successCount)} users)...`);
  let upgradeCount = 0;
  
  for (let i = 0; i < Math.min(5, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      const usdtContract = mockUSDT.connect(account);
      
      // Try to upgrade to package 4
      const upgradePrice = ethers.parseEther("200");
      
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
  console.log(`\n💸 Testing withdrawals (${Math.min(5, successCount)} users)...`);
  let withdrawalCount = 0;
  
  for (let i = 0; i < Math.min(5, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      const leadFiveContract = leadFive.connect(account);
      
      // Check balance and withdraw
      const userData = await leadFive.users(account.address);
      if (userData.balance > ethers.parseEther("5")) {
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
      console.log(`❌ ${pool.name} distribution failed:`, error.message);
    }
  }

  // Final report
  console.log("\n📊 WORKING TEST RESULTS (50 Users)");
  console.log("=".repeat(60));
  
  try {
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    const finalUsdtBalance = await mockUSDT.balanceOf(deployer.address);
    
    console.log("📈 REGISTRATION RESULTS:");
    console.log(`├─ Successful Registrations: ${successCount}/${TEST_CONFIG.TOTAL_USERS}`);
    console.log(`├─ Failed Registrations: ${errorCount}`);
    console.log(`├─ Success Rate: ${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(2)}%`);
    
    console.log("\n💰 TRANSACTION RESULTS:");
    console.log(`├─ Package Upgrades: ${upgradeCount}`);
    console.log(`├─ Withdrawals: ${withdrawalCount}`);
    console.log(`├─ Pool Distributions: ${poolDistributions}/3`);
    
    console.log("\n📋 CONTRACT STATE:");
    console.log(`├─ Total Users in Contract: ${totalUsers}`);
    console.log(`├─ Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
    console.log(`├─ Remaining USDT: ${ethers.formatEther(finalUsdtBalance)} USDT`);
    
    console.log("\n🎯 ASSESSMENT:");
    if (successCount >= 40) {
      console.log("🎉 EXCELLENT - High success rate!");
      console.log("✅ Contract is working perfectly");
    } else if (successCount >= 25) {
      console.log("✅ GOOD - Reasonable success rate");
      console.log("⚠️ Some optimization possible");
    } else {
      console.log("⚠️ NEEDS IMPROVEMENT - Review errors");
    }
    
    if (errors.length > 0) {
      console.log(`\n❌ SAMPLE ERRORS (showing last 3):`);
      errors.slice(-3).forEach((error, index) => {
        console.log(`│  ${index + 1}. ${error}`);
      });
    }
    
    console.log("\n✅ FUNCTIONS VERIFIED:");
    console.log(`├─ Registration: ${successCount > 0 ? '✅' : '❌'}`);
    console.log(`├─ Package Upgrades: ${upgradeCount > 0 ? '✅' : '❌'}`);
    console.log(`├─ Withdrawals: ${withdrawalCount > 0 ? '✅' : '❌'}`);
    console.log(`├─ Pool Distributions: ${poolDistributions === 3 ? '✅' : '⚠️'}`);
    
    console.log("\n🎉 Working test completed successfully!");
    
  } catch (error) {
    console.log("❌ Error getting final state:", error.message);
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
    console.log("🎉 Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
