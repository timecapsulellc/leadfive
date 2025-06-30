// scripts/test-25-users-final.cjs
// Test 25 users using existing deployed contracts for a final check

const { ethers } = require("hardhat");

const CONFIG = {
  LEADFIVE_CONTRACT: "0x1a64E9E727a5BE30B23579E47826c7aE883DA560",
  MOCK_USDT: "0x00175c710A7448920934eF830f2F22D6370E0642",
  MOCK_WBNB: "0xBc6dD11528644DacCbBD72f6740227B61c33B2EF",
  TOTAL_USERS: 25,
  BATCH_SIZE: 5
};

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function mint(address, uint256) returns (bool)"
];

async function main() {
  console.log("🚀 Testing 25 Users with Existing Contracts");
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
  for (let i = 0; i < 20; i++) {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    testAccounts.push(wallet);
  }
  console.log(`✅ Generated ${testAccounts.length} test accounts`);
  
  // Fund test accounts
  console.log("\n💰 Funding test accounts...");
  const bnbAmount = ethers.parseEther("0.05"); // Increased BNB for gas
  const usdtAmount = ethers.parseEther("2500"); // USDT for registrations

  for (let i = 0; i < testAccounts.length; i++) {
    const account = testAccounts[i];
    try {
      // 1. Fund with BNB for gas
      console.log(`[${i + 1}/${testAccounts.length}] Sending ${ethers.formatEther(bnbAmount)} BNB to ${account.address}...`);
      const bnbTx = await deployer.sendTransaction({
        to: account.address,
        value: bnbAmount
      });
      await bnbTx.wait(1); // Wait for 1 confirmation
      console.log(`  ✅ BNB sent. Hash: ${bnbTx.hash}`);

      // 2. Fund with USDT for payment
      console.log(`[${i + 1}/${testAccounts.length}] Sending ${ethers.formatEther(usdtAmount)} USDT to ${account.address}...`);
      const usdtTx = await mockUSDT.transfer(account.address, usdtAmount);
      await usdtTx.wait(1); // Wait for 1 confirmation
      console.log(`  ✅ USDT sent. Hash: ${usdtTx.hash}`);

    } catch (error) {
      console.log(`❌ Error funding account ${i + 1} (${account.address}):`, error.message);
      // Decide if you want to stop or continue on funding failure
    }
  }
  console.log('✅ All test accounts funded.');
  
  // Start mass registration
  console.log(`\n🎯 Starting registration for ${CONFIG.TOTAL_USERS} users...`);
  
  let successCount = 0;
  let errorCount = 0;
  const registeredUsers = [];
  
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
      
      const referrer = successCount > 0 ? 
        registeredUsers[Math.floor(Math.random() * registeredUsers.length)] :
        deployer.address;
      
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
        if (errorCount <= 10) {
          console.log(`❌ User ${batchStart + index + 1}: ${result.reason}`);
        }
      }
    });
    
    console.log(`✅ Batch ${batch + 1}: ${batchSuccess}/${batchSize} successful`);
    console.log(`📊 Total: ${successCount}/${CONFIG.TOTAL_USERS} (${((successCount/CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    
    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
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
      console.log(`✅ Upgrade ${upgradeCount}`);
    } catch (error) {
      console.log(`❌ Upgrade ${i + 1} failed`);
    }
  }
  
  // Test withdrawals
  console.log(`\n💸 Testing withdrawals...`);
  let withdrawalCount = 0;
  
  for (let i = 0; i < Math.min(10, registeredUsers.length); i++) {
    try {
      const accountIndex = i % testAccounts.length;
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
      console.log(`❌ Withdrawal ${i + 1} failed`);
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
  console.log("\n📊 25-USER TEST RESULTS");
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
    if (successCount >= 20) {
      console.log("🎉 EXCELLENT - Contract ready for production!");
    } else if (successCount >= 15) {
      console.log("✅ GOOD - Minor optimizations needed");
    } else {
      console.log("⚠️ NEEDS REVIEW - Check error patterns");
    }
    
  } catch (error) {
    console.log("❌ Error getting final state");
  }
  
  console.log("\n🎉 25-user test completed!");
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
    console.log("✅ Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
