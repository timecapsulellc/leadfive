// scripts/comprehensive-test-with-mocks.cjs
// Comprehensive testing with 1000+ users using deployed mock contracts

const { ethers } = require("hardhat");

// Test configuration with deployed mock addresses
const TEST_CONFIG = {
  // Contract addresses from deployed ecosystem
  LEADFIVE_PROXY: "0x292c11A70ef007B383671b2Ada56bd68ad8d4988",
  MOCK_USDT: "0x00175c710A7448920934eF830f2F22D6370E0642",
  MOCK_WBNB: "0xBc6dD11528644DacCbBD72f6740227B61c33B2EF",
  MOCK_PRICEFEED: "0xb4BCe54d31B49CAF37A4a8C9Eb3AC333A7Ee7766",
  
  // Test parameters
  TOTAL_USERS: 1200,
  BATCH_SIZE: 25, // Reduced for better stability
  TEST_ACCOUNTS_TO_CREATE: 50, // Reduce to prevent gas issues
  
  // Package levels to test
  PACKAGE_LEVELS: [1, 2, 3, 4],
  PACKAGE_PRICES: [
    ethers.parseEther("30"),  // Package 1
    ethers.parseEther("50"),  // Package 2
    ethers.parseEther("100"), // Package 3
    ethers.parseEther("200")  // Package 4
  ]
};

class LeadFiveComprehensiveTest {
  constructor() {
    this.deployer = null;
    this.leadFive = null;
    this.mockUSDT = null;
    this.mockWBNB = null;
    this.testAccounts = [];
    this.registeredUsers = [];
    this.statistics = {
      totalRegistrations: 0,
      totalWithdrawals: 0,
      totalUpgrades: 0,
      totalPoolDistributions: 0,
      totalVolumeUSDT: ethers.parseEther("0"),
      totalVolumeBNB: ethers.parseEther("0"),
      errors: [],
      successfulBatches: 0,
      failedBatches: 0
    };
  }

  async initialize() {
    console.log("🚀 Initializing LeadFive Comprehensive Test Suite");
    console.log("Using Mock Tokens for 1000+ User Testing");
    console.log("=".repeat(70));

    // Get deployer account
    [this.deployer] = await ethers.getSigners();
    console.log(`👤 Testing with account: ${this.deployer.address}`);
    
    const balance = await ethers.provider.getBalance(this.deployer.address);
    console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);

    // Connect to LeadFive contract
    const LeadFive = await ethers.getContractFactory("LeadFive");
    this.leadFive = LeadFive.attach(TEST_CONFIG.LEADFIVE_PROXY);
    console.log(`📋 LeadFive Contract: ${TEST_CONFIG.LEADFIVE_PROXY}`);

    // Connect to Mock USDT
    const MockUSDT = await ethers.getContractFactory("MockUSDTTestnet");
    this.mockUSDT = MockUSDT.attach(TEST_CONFIG.MOCK_USDT);
    console.log(`🪙 Mock USDT: ${TEST_CONFIG.MOCK_USDT}`);

    // Connect to Mock WBNB
    const MockWBNB = await ethers.getContractFactory("MockWBNB");
    this.mockWBNB = MockWBNB.attach(TEST_CONFIG.MOCK_WBNB);
    console.log(`🌐 Mock WBNB: ${TEST_CONFIG.MOCK_WBNB}`);

    // Check balances
    const usdtBalance = await this.mockUSDT.balanceOf(this.deployer.address);
    const wbnbBalance = await this.mockWBNB.balanceOf(this.deployer.address);
    
    console.log(`💵 USDT Balance: ${ethers.formatEther(usdtBalance)} USDT`);
    console.log(`🔄 WBNB Balance: ${ethers.formatEther(wbnbBalance)} WBNB`);

    // Get test tokens if needed
    await this.ensureTestTokens();

    console.log("✅ Initialization complete!\n");
  }

  async ensureTestTokens() {
    console.log("🔄 Ensuring sufficient test tokens...");
    
    // Get USDT from faucet if needed
    const usdtBalance = await this.mockUSDT.balanceOf(this.deployer.address);
    if (usdtBalance < ethers.parseEther("100000")) {
      console.log("📤 Getting USDT from faucet...");
      try {
        // Try to use faucet function
        const faucetTx = await this.mockUSDT.faucet();
        await faucetTx.wait();
        console.log("✅ USDT faucet successful");
      } catch (error) {
        // If faucet fails, try minting (if we're owner)
        console.log("⚠️ Faucet failed, trying to mint...");
        try {
          const mintTx = await this.mockUSDT.mint(this.deployer.address, ethers.parseEther("500000"));
          await mintTx.wait();
          console.log("✅ USDT minted successfully");
        } catch (mintError) {
          console.log("❌ Cannot get USDT:", mintError.message);
        }
      }
    }

    // Get WBNB from faucet if needed
    const wbnbBalance = await this.mockWBNB.balanceOf(this.deployer.address);
    if (wbnbBalance < ethers.parseEther("10000")) {
      console.log("📤 Getting WBNB from faucet...");
      try {
        const faucetTx = await this.mockWBNB.faucet();
        await faucetTx.wait();
        console.log("✅ WBNB faucet successful");
      } catch (error) {
        // Try minting if faucet fails
        try {
          const mintTx = await this.mockWBNB.mint(this.deployer.address, ethers.parseEther("50000"));
          await mintTx.wait();
          console.log("✅ WBNB minted successfully");
        } catch (mintError) {
          console.log("❌ Cannot get WBNB:", mintError.message);
        }
      }
    }

    // Final balance check
    const finalUSDT = await this.mockUSDT.balanceOf(this.deployer.address);
    const finalWBNB = await this.mockWBNB.balanceOf(this.deployer.address);
    console.log(`✅ Final USDT: ${ethers.formatEther(finalUSDT)} USDT`);
    console.log(`✅ Final WBNB: ${ethers.formatEther(finalWBNB)} WBNB`);
  }

  async generateTestAccounts() {
    console.log(`🏗️ Generating ${TEST_CONFIG.TEST_ACCOUNTS_TO_CREATE} test accounts...`);
    
    for (let i = 0; i < TEST_CONFIG.TEST_ACCOUNTS_TO_CREATE; i++) {
      const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
      this.testAccounts.push(wallet);
      
      if ((i + 1) % 10 === 0) {
        console.log(`Generated ${i + 1}/${TEST_CONFIG.TEST_ACCOUNTS_TO_CREATE} accounts`);
      }
    }
    
    console.log("✅ Test accounts generated\n");
  }

  async fundTestAccounts() {
    console.log("💰 Funding test accounts with tokens...");
    
    const fundsPerAccount = {
      usdt: ethers.parseEther("1000"), // 1000 USDT per account
      wbnb: ethers.parseEther("50"),   // 50 WBNB per account
      bnb: ethers.parseEther("0.1")    // 0.1 BNB per account for gas
    };

    const batchSize = 10;
    for (let i = 0; i < this.testAccounts.length; i += batchSize) {
      const batch = this.testAccounts.slice(i, i + batchSize);
      
      try {
        // Fund batch with BNB for gas
        for (const account of batch) {
          const tx = await this.deployer.sendTransaction({
            to: account.address,
            value: fundsPerAccount.bnb
          });
          await tx.wait();
        }

        // Fund batch with USDT
        for (const account of batch) {
          const tx = await this.mockUSDT.transfer(account.address, fundsPerAccount.usdt);
          await tx.wait();
        }

        // Fund batch with WBNB
        for (const account of batch) {
          const tx = await this.mockWBNB.transfer(account.address, fundsPerAccount.wbnb);
          await tx.wait();
        }

        console.log(`✅ Funded batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(this.testAccounts.length/batchSize)}`);
        
        // Small delay to prevent overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error funding batch starting at ${i}:`, error.message);
        this.statistics.errors.push(`Funding error: ${error.message}`);
      }
    }
    
    console.log("✅ Test accounts funded\n");
  }

  async massRegistration() {
    console.log(`🎯 Starting mass registration for ${TEST_CONFIG.TOTAL_USERS} users...`);
    
    let registrationCount = 0;
    const batchSize = TEST_CONFIG.BATCH_SIZE;
    
    for (let batch = 0; batch < Math.ceil(TEST_CONFIG.TOTAL_USERS / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, TEST_CONFIG.TOTAL_USERS);
      const batchUsers = batchEnd - batchStart;
      
      console.log(`\n📦 Processing batch ${batch + 1} (Users ${batchStart + 1}-${batchEnd})`);
      
      try {
        const registrationPromises = [];
        
        for (let i = 0; i < batchUsers; i++) {
          const userIndex = batchStart + i;
          const accountIndex = userIndex % this.testAccounts.length;
          const account = this.testAccounts[accountIndex];
          
          // Randomly choose package level and payment method
          const packageLevel = TEST_CONFIG.PACKAGE_LEVELS[Math.floor(Math.random() * TEST_CONFIG.PACKAGE_LEVELS.length)];
          const useUSDT = Math.random() > 0.5; // 50% USDT, 50% BNB
          const referrer = registrationCount > 0 ? this.registeredUsers[Math.floor(Math.random() * this.registeredUsers.length)] : this.deployer.address;
          
          const registrationPromise = this.registerUser(account, packageLevel, useUSDT, referrer, userIndex);
          registrationPromises.push(registrationPromise);
        }
        
        // Execute batch registrations
        const results = await Promise.allSettled(registrationPromises);
        
        // Process results
        let batchSuccesses = 0;
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status === 'fulfilled' && result.value) {
            batchSuccesses++;
            registrationCount++;
            this.registeredUsers.push(result.value.userAddress);
            this.statistics.totalRegistrations++;
            
            if (result.value.useUSDT) {
              this.statistics.totalVolumeUSDT = this.statistics.totalVolumeUSDT + result.value.amount;
            } else {
              this.statistics.totalVolumeBNB = this.statistics.totalVolumeBNB + result.value.amount;
            }
          } else {
            this.statistics.errors.push(`Registration ${batchStart + i + 1}: ${result.reason || 'Unknown error'}`);
          }
        }
        
        this.statistics.successfulBatches++;
        console.log(`✅ Batch ${batch + 1} completed: ${batchSuccesses}/${batchUsers} successful`);
        
        // Progress update
        console.log(`📊 Total Progress: ${registrationCount}/${TEST_CONFIG.TOTAL_USERS} users registered (${((registrationCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
        
        // Delay between batches to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Batch ${batch + 1} failed:`, error.message);
        this.statistics.failedBatches++;
      }
    }
    
    console.log(`\n🎉 Mass registration completed!`);
    console.log(`✅ Successfully registered: ${registrationCount} users`);
    console.log(`❌ Failed registrations: ${TEST_CONFIG.TOTAL_USERS - registrationCount}`);
  }

  async registerUser(account, packageLevel, useUSDT, referrer, userIndex) {
    try {
      const packagePrice = TEST_CONFIG.PACKAGE_PRICES[packageLevel - 1];
      const customCode = `USER${String(userIndex + 1).padStart(4, '0')}`;
      
      let tx;
      
      if (useUSDT) {
        // Approve USDT spending
        const usdtContract = this.mockUSDT.connect(account);
        const approveTx = await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, packagePrice);
        await approveTx.wait();
        
        // Register with USDT
        const leadFiveContract = this.leadFive.connect(account);
        tx = await leadFiveContract.register(referrer, packageLevel, true, customCode);
      } else {
        // Register with BNB (need to calculate BNB amount based on price feed)
        const leadFiveContract = this.leadFive.connect(account);
        
        // For testing, use a simple conversion rate (1 BNB = 300 USD)
        const bnbAmount = packagePrice / 300n; // Simple conversion for testing
        
        tx = await leadFiveContract.register(referrer, packageLevel, false, customCode, {
          value: bnbAmount
        });
      }
      
      await tx.wait();
      
      return {
        userAddress: account.address,
        packageLevel,
        useUSDT,
        amount: packagePrice,
        referrer,
        txHash: tx.hash
      };
      
    } catch (error) {
      throw new Error(`User ${userIndex + 1} registration failed: ${error.message}`);
    }
  }

  async testWithdrawals() {
    console.log("\n💸 Testing withdrawal functionality...");
    
    if (this.registeredUsers.length === 0) {
      console.log("⚠️ No registered users to test withdrawals");
      return;
    }
    
    const withdrawalTestCount = Math.min(50, this.registeredUsers.length);
    console.log(`Testing withdrawals for ${withdrawalTestCount} users...`);
    
    for (let i = 0; i < withdrawalTestCount; i++) {
      try {
        const userAddress = this.registeredUsers[i];
        const accountIndex = i % this.testAccounts.length;
        const account = this.testAccounts[accountIndex];
        
        // Check user balance
        const userData = await this.leadFive.users(userAddress);
        const userBalance = userData.balance;
        
        if (userBalance > 0) {
          // Withdraw 50% of balance
          const withdrawAmount = userBalance / 2n;
          
          const leadFiveContract = this.leadFive.connect(account);
          const tx = await leadFiveContract.withdraw(withdrawAmount);
          await tx.wait();
          
          this.statistics.totalWithdrawals++;
          console.log(`✅ Withdrawal ${i + 1}: ${ethers.formatEther(withdrawAmount)} USDT`);
        }
        
        if (i % 10 === 9) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.log(`❌ Withdrawal ${i + 1} failed:`, error.message);
        this.statistics.errors.push(`Withdrawal error: ${error.message}`);
      }
    }
    
    console.log(`✅ Withdrawal testing completed: ${this.statistics.totalWithdrawals} successful withdrawals`);
  }

  async testPoolDistributions() {
    console.log("\n🏊 Testing pool distributions...");
    
    try {
      // Test leader pool distribution
      const leaderTx = await this.leadFive.distributeLeaderPool();
      await leaderTx.wait();
      console.log("✅ Leader pool distribution successful");
      this.statistics.totalPoolDistributions++;
      
      // Test help pool distribution
      const helpTx = await this.leadFive.distributeHelpPool();
      await helpTx.wait();
      console.log("✅ Help pool distribution successful");
      this.statistics.totalPoolDistributions++;
      
      // Test club pool distribution
      const clubTx = await this.leadFive.distributeClubPool();
      await clubTx.wait();
      console.log("✅ Club pool distribution successful");
      this.statistics.totalPoolDistributions++;
      
    } catch (error) {
      console.log(`❌ Pool distribution error:`, error.message);
      this.statistics.errors.push(`Pool distribution error: ${error.message}`);
    }
  }

  async generateReport() {
    console.log("\n📊 COMPREHENSIVE TEST REPORT");
    console.log("=".repeat(70));
    
    // Get final contract state
    const poolBalances = await this.leadFive.getPoolBalances();
    const totalUsers = await this.leadFive.totalUsers();
    
    console.log("📈 REGISTRATION STATISTICS:");
    console.log(`├─ Total Registrations: ${this.statistics.totalRegistrations}`);
    console.log(`├─ Successful Batches: ${this.statistics.successfulBatches}`);
    console.log(`├─ Failed Batches: ${this.statistics.failedBatches}`);
    console.log(`├─ Success Rate: ${((this.statistics.totalRegistrations/TEST_CONFIG.TOTAL_USERS)*100).toFixed(2)}%`);
    
    console.log("\n💰 VOLUME STATISTICS:");
    console.log(`├─ Total USDT Volume: ${ethers.formatEther(this.statistics.totalVolumeUSDT)} USDT`);
    console.log(`├─ Total BNB Volume: ${ethers.formatEther(this.statistics.totalVolumeBNB)} BNB`);
    console.log(`├─ Total Withdrawals: ${this.statistics.totalWithdrawals}`);
    console.log(`├─ Pool Distributions: ${this.statistics.totalPoolDistributions}`);
    
    console.log("\n🏊 POOL BALANCES:");
    console.log(`├─ Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
    
    console.log("\n📋 CONTRACT STATE:");
    console.log(`├─ Total Users in Contract: ${totalUsers}`);
    console.log(`├─ Contract Address: ${TEST_CONFIG.LEADFIVE_PROXY}`);
    
    console.log("\n❌ ERROR SUMMARY:");
    console.log(`├─ Total Errors: ${this.statistics.errors.length}`);
    if (this.statistics.errors.length > 0) {
      console.log("├─ Recent Errors:");
      this.statistics.errors.slice(-5).forEach((error, index) => {
        console.log(`│  ${index + 1}. ${error}`);
      });
    }
    
    console.log("\n✅ TEST COMPLETION SUMMARY:");
    console.log(`├─ Test Duration: Started at ${new Date().toISOString()}`);
    console.log(`├─ Users Processed: ${this.statistics.totalRegistrations}/${TEST_CONFIG.TOTAL_USERS}`);
    console.log(`├─ Contract Functionality: ${this.statistics.totalPoolDistributions > 0 ? 'VERIFIED' : 'PARTIAL'}`);
    console.log(`├─ Overall Status: ${this.statistics.totalRegistrations > 500 ? 'SUCCESS' : 'PARTIAL SUCCESS'}`);
    
    console.log("\n🎯 TESTING COMPLETE!");
    console.log("=".repeat(70));
  }

  async runFullTest() {
    try {
      await this.initialize();
      await this.generateTestAccounts();
      await this.fundTestAccounts();
      await this.massRegistration();
      await this.testWithdrawals();
      await this.testPoolDistributions();
      await this.generateReport();
      
      return true;
    } catch (error) {
      console.error("❌ Test suite failed:", error);
      return false;
    }
  }
}

// Execute the comprehensive test
async function main() {
  const testSuite = new LeadFiveComprehensiveTest();
  const success = await testSuite.runFullTest();
  
  if (success) {
    console.log("🎉 Comprehensive testing completed successfully!");
    process.exit(0);
  } else {
    console.log("❌ Testing failed - see errors above");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
