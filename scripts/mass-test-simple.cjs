// scripts/mass-test-simple.cjs
// Simplified mass testing using ERC20 interface for mock tokens

const { ethers } = require("hardhat");

// Simple ERC20 ABI for interacting with mock tokens
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
  MOCK_WBNB: "0xBc6dD11528644DacCbBD72f6740227B61c33B2EF",
  TOTAL_USERS: 1000,
  BATCH_SIZE: 20
};

async function main() {
  console.log("🚀 LeadFive Mass Testing with Mock Tokens");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Testing with: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);

  // Connect to contracts using interfaces
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(TEST_CONFIG.LEADFIVE_PROXY);
  
  const mockUSDT = new ethers.Contract(TEST_CONFIG.MOCK_USDT, ERC20_ABI, deployer);
  const mockWBNB = new ethers.Contract(TEST_CONFIG.MOCK_WBNB, ERC20_ABI, deployer);

  console.log("📋 Contracts connected successfully");

  // Check balances
  try {
    const usdtBalance = await mockUSDT.balanceOf(deployer.address);
    const wbnbBalance = await mockWBNB.balanceOf(deployer.address);
    
    console.log(`💵 USDT Balance: ${ethers.formatEther(usdtBalance)} USDT`);
    console.log(`🔄 WBNB Balance: ${ethers.formatEther(wbnbBalance)} WBNB`);

    // Get tokens if needed
    if (usdtBalance < ethers.parseEther("10000")) {
      console.log("📤 Getting USDT from faucet...");
      try {
        const faucetTx = await mockUSDT.faucet();
        await faucetTx.wait();
        console.log("✅ USDT faucet successful");
      } catch (error) {
        console.log("⚠️ USDT faucet failed:", error.message);
      }
    }

    if (wbnbBalance < ethers.parseEther("1000")) {
      console.log("📤 Getting WBNB from faucet...");
      try {
        const faucetTx = await mockWBNB.faucet();
        await faucetTx.wait();
        console.log("✅ WBNB faucet successful");
      } catch (error) {
        console.log("⚠️ WBNB faucet failed:", error.message);
      }
    }

  } catch (error) {
    console.log("❌ Error checking balances:", error.message);
  }

  // Mass registration test
  console.log(`\n🎯 Starting mass registration for ${TEST_CONFIG.TOTAL_USERS} users...`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  const testAccounts = [];
  
  // Generate test accounts
  console.log("🏗️ Generating test accounts...");
  for (let i = 0; i < 100; i++) { // Generate 100 test accounts
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    testAccounts.push(wallet);
  }
  console.log(`✅ Generated ${testAccounts.length} test accounts`);

  // Fund test accounts with BNB for gas
  console.log("💰 Funding test accounts with BNB...");
  for (let i = 0; i < Math.min(50, testAccounts.length); i++) {
    try {
      const tx = await deployer.sendTransaction({
        to: testAccounts[i].address,
        value: ethers.parseEther("0.05") // 0.05 BNB for gas
      });
      await tx.wait();
      
      if ((i + 1) % 10 === 0) {
        console.log(`Funded ${i + 1}/50 accounts`);
      }
    } catch (error) {
      console.log(`❌ Error funding account ${i + 1}:`, error.message);
    }
  }

  // Fund some accounts with USDT for testing
  console.log("💵 Funding test accounts with USDT...");
  for (let i = 0; i < Math.min(25, testAccounts.length); i++) {
    try {
      const tx = await mockUSDT.transfer(testAccounts[i].address, ethers.parseEther("500"));
      await tx.wait();
      
      if ((i + 1) % 5 === 0) {
        console.log(`USDT funded ${i + 1}/25 accounts`);
      }
    } catch (error) {
      console.log(`❌ Error funding USDT to account ${i + 1}:`, error.message);
    }
  }

  // Start batch registrations
  const batchSize = TEST_CONFIG.BATCH_SIZE;
  const totalBatches = Math.ceil(TEST_CONFIG.TOTAL_USERS / batchSize);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, TEST_CONFIG.TOTAL_USERS);
    const batchUsers = batchEnd - batchStart;
    
    console.log(`\n📦 Processing batch ${batch + 1}/${totalBatches} (${batchUsers} users)`);
    
    const batchPromises = [];
    
    for (let i = 0; i < batchUsers; i++) {
      const userIndex = batchStart + i;
      const accountIndex = userIndex % testAccounts.length;
      const account = testAccounts[accountIndex];
      
      // Random package level (1-4)
      const packageLevel = Math.floor(Math.random() * 4) + 1;
      const packagePrice = [
        ethers.parseEther("30"),   // Package 1
        ethers.parseEther("50"),   // Package 2  
        ethers.parseEther("100"),  // Package 3
        ethers.parseEther("200")   // Package 4
      ][packageLevel - 1];
      
      // Random payment method and referrer
      const useUSDT = Math.random() > 0.7; // 30% USDT, 70% BNB
      const referrer = successCount > 0 ? 
        testAccounts[Math.floor(Math.random() * Math.min(successCount, testAccounts.length))].address :
        deployer.address;
      
      const customCode = `TEST${String(userIndex + 1).padStart(4, '0')}`;
      
      const registrationPromise = registerUser(
        account, 
        leadFive, 
        mockUSDT, 
        packageLevel, 
        packagePrice, 
        useUSDT, 
        referrer, 
        customCode,
        userIndex + 1
      );
      
      batchPromises.push(registrationPromise);
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
        errors.push(`User ${batchStart + index + 1}: ${result.reason}`);
      }
    });
    
    console.log(`✅ Batch ${batch + 1} completed: ${batchSuccess}/${batchUsers} successful`);
    console.log(`📊 Total progress: ${successCount}/${TEST_CONFIG.TOTAL_USERS} (${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
    
    // Delay between batches
    if (batch < totalBatches - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Test withdrawals on some users
  console.log("\n💸 Testing withdrawals...");
  let withdrawalCount = 0;
  
  for (let i = 0; i < Math.min(20, testAccounts.length); i++) {
    try {
      const account = testAccounts[i];
      const leadFiveContract = leadFive.connect(account);
      
      // Check if user is registered and has balance
      const userData = await leadFive.users(account.address);
      if (userData.balance > 0) {
        const withdrawAmount = userData.balance / 2n; // Withdraw 50%
        
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
  console.log("\n🏊 Testing pool distributions...");
  let poolDistributions = 0;
  
  try {
    const leaderTx = await leadFive.distributeLeaderPool();
    await leaderTx.wait();
    console.log("✅ Leader pool distributed");
    poolDistributions++;
  } catch (error) {
    console.log("❌ Leader pool distribution failed:", error.message);
  }
  
  try {
    const helpTx = await leadFive.distributeHelpPool();
    await helpTx.wait();
    console.log("✅ Help pool distributed");
    poolDistributions++;
  } catch (error) {
    console.log("❌ Help pool distribution failed:", error.message);
  }

  try {
    const clubTx = await leadFive.distributeClubPool();
    await clubTx.wait();
    console.log("✅ Club pool distributed");
    poolDistributions++;
  } catch (error) {
    console.log("❌ Club pool distribution failed:", error.message);
  }

  // Final report
  console.log("\n📊 MASS TESTING RESULTS");
  console.log("=".repeat(50));
  console.log(`✅ Successful Registrations: ${successCount}/${TEST_CONFIG.TOTAL_USERS}`);
  console.log(`❌ Failed Registrations: ${errorCount}`);
  console.log(`📈 Success Rate: ${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(2)}%`);
  console.log(`💸 Withdrawals Tested: ${withdrawalCount}`);
  console.log(`🏊 Pool Distributions: ${poolDistributions}/3`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Recent Errors (showing last 5):`);
    errors.slice(-5).forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  // Final contract state
  try {
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    
    console.log("\n📋 Final Contract State:");
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
  } catch (error) {
    console.log("❌ Error getting final state:", error.message);
  }

  console.log("\n🎉 Mass testing completed!");
  
  if (successCount >= 500) {
    console.log("✅ TESTING SUCCESSFUL - Contract ready for production!");
  } else {
    console.log("⚠️ PARTIAL SUCCESS - Review errors and optimize");
  }
}

async function registerUser(account, leadFive, mockUSDT, packageLevel, packagePrice, useUSDT, referrer, customCode, userNumber) {
  try {
    const leadFiveContract = leadFive.connect(account);
    
    if (useUSDT) {
      // Approve USDT spending
      const usdtContract = mockUSDT.connect(account);
      const approveTx = await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, packagePrice);
      await approveTx.wait();
      
      // Register with USDT
      const tx = await leadFiveContract.register(referrer, packageLevel, true, customCode);
      await tx.wait();
    } else {
      // Register with BNB (use simple conversion: 1 BNB = 300 USD)
      const bnbAmount = packagePrice / 300n;
      
      const tx = await leadFiveContract.register(referrer, packageLevel, false, customCode, {
        value: bnbAmount
      });
      await tx.wait();
    }
    
    return true;
  } catch (error) {
    throw `Registration failed: ${error.message}`;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
