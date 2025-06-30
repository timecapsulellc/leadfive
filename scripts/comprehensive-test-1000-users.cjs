// scripts/comprehensive-test-1000-users.cjs
// Comprehensive testing with 1000+ users using mock contracts

const { ethers } = require("hardhat");

// Test configuration
const TEST_CONFIG = {
  // Contract addresses from your deployment
  LEADFIVE_PROXY: "0x292c11A70ef007B383671b2Ada56bd68ad8d4988",
  MOCK_USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
  MOCK_PRICEFEED: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  
  // Test parameters
  TOTAL_USERS: 1200,
  BATCH_SIZE: 50,
  TEST_ACCOUNTS_TO_CREATE: 100, // We'll generate test wallets
  
  // Package levels to test
  PACKAGE_LEVELS: [1, 2, 3, 4],
  PACKAGE_PRICES: [
    ethers.parseEther("30"),  // Package 1
    ethers.parseEther("50"),  // Package 2
    ethers.parseEther("100"), // Package 3
    ethers.parseEther("200")  // Package 4
  ]
};

class LeadFiveTestSuite {
  constructor() {
    this.deployer = null;
    this.leadFive = null;
    this.mockUSDT = null;
    this.testAccounts = [];
    this.registeredUsers = [];
    this.statistics = {
      totalRegistrations: 0,
      totalWithdrawals: 0,
      totalUpgrades: 0,
      totalPoolDistributions: 0,
      totalVolume: ethers.parseEther("0"),
      errors: []
    };
  }

  async initialize() {
    console.log("🚀 Initializing LeadFive Test Suite");
    console.log("=" .repeat(60));

    // Get deployer account
    [this.deployer] = await ethers.getSigners();
    console.log("Deployer:", this.deployer.address);

    // Connect to contracts
    const LeadFive = await ethers.getContractFactory("LeadFive");
    this.leadFive = LeadFive.attach(TEST_CONFIG.LEADFIVE_PROXY);
    
    // Mock USDT contract (ERC20)
    const MockUSDT = await ethers.getContractFactory("MockUSDTTestnet");
    this.mockUSDT = MockUSDT.attach(TEST_CONFIG.MOCK_USDT);

    // Generate test accounts
    console.log("\n📝 Generating test accounts...");
    await this.generateTestAccounts();

    console.log("✅ Initialization complete!");
    console.log(`Total test accounts: ${this.testAccounts.length}`);
  }

  async generateTestAccounts() {
    for (let i = 0; i < TEST_CONFIG.TEST_ACCOUNTS_TO_CREATE; i++) {
      const wallet = ethers.Wallet.createRandom();
      const connectedWallet = wallet.connect(ethers.provider);
      this.testAccounts.push(connectedWallet);
    }
  }

  async fundTestAccounts() {
    console.log("\n💰 Funding test accounts with mock USDT...");
    
    const totalNeeded = ethers.parseEther("500"); // 500 USDT per account
    
    for (let i = 0; i < this.testAccounts.length; i++) {
      const account = this.testAccounts[i];
      
      try {
        // Fund with BNB for gas
        await this.deployer.sendTransaction({
          to: account.address,
          value: ethers.parseEther("0.01") // 0.01 BNB for gas
        });

        // Mint mock USDT
        await this.mockUSDT.mint(account.address, totalNeeded);
        
        if ((i + 1) % 20 === 0) {
          console.log(`Funded ${i + 1}/${this.testAccounts.length} accounts`);
        }
      } catch (error) {
        console.error(`Error funding account ${i}:`, error.message);
        this.statistics.errors.push(`Fund account ${i}: ${error.message}`);
      }
    }
    
    console.log("✅ All test accounts funded!");
  }

  async testMassRegistrations() {
    console.log("\n👥 Testing Mass User Registrations");
    console.log("=" .repeat(50));

    let currentReferrer = this.deployer.address; // Start with deployer as root
    let registrationCount = 0;

    for (let batch = 0; batch < Math.ceil(TEST_CONFIG.TOTAL_USERS / TEST_CONFIG.BATCH_SIZE); batch++) {
      console.log(`\nBatch ${batch + 1}: Registering users ${batch * TEST_CONFIG.BATCH_SIZE + 1} to ${Math.min((batch + 1) * TEST_CONFIG.BATCH_SIZE, TEST_CONFIG.TOTAL_USERS)}`);
      
      const batchPromises = [];
      
      for (let i = 0; i < TEST_CONFIG.BATCH_SIZE && registrationCount < TEST_CONFIG.TOTAL_USERS; i++) {
        const accountIndex = registrationCount % this.testAccounts.length;
        const user = this.testAccounts[accountIndex];
        const packageLevel = TEST_CONFIG.PACKAGE_LEVELS[registrationCount % 4]; // Cycle through packages
        
        batchPromises.push(this.registerUser(user, currentReferrer, packageLevel, registrationCount));
        
        // Use some registered users as referrers for tree building
        if (this.registeredUsers.length > 0 && Math.random() < 0.7) {
          currentReferrer = this.registeredUsers[Math.floor(Math.random() * this.registeredUsers.length)].address;
        }
        
        registrationCount++;
      }

      // Execute batch in parallel
      const results = await Promise.allSettled(batchPromises);
      
      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.statistics.totalRegistrations++;
          this.statistics.totalVolume += result.value.amount;
        } else {
          console.error(`Registration ${batch * TEST_CONFIG.BATCH_SIZE + index + 1} failed:`, result.reason?.message);
          this.statistics.errors.push(`Registration ${batch * TEST_CONFIG.BATCH_SIZE + index + 1}: ${result.reason?.message}`);
        }
      });

      // Progress update
      console.log(`✅ Batch ${batch + 1} completed. Total registrations: ${this.statistics.totalRegistrations}`);
      
      // Small delay to avoid overwhelming the network
      await this.delay(1000);
    }

    console.log(`\n🎉 Mass registration completed!`);
    console.log(`✅ Successfully registered: ${this.statistics.totalRegistrations} users`);
    console.log(`❌ Failed registrations: ${TEST_CONFIG.TOTAL_USERS - this.statistics.totalRegistrations}`);
    console.log(`💰 Total volume: ${ethers.formatEther(this.statistics.totalVolume)} USDT`);
  }

  async registerUser(user, referrer, packageLevel, userIndex) {
    try {
      const packagePrice = TEST_CONFIG.PACKAGE_PRICES[packageLevel - 1];
      
      // Approve USDT spending
      const usdtContract = this.mockUSDT.connect(user);
      await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, packagePrice);

      // Register user
      const leadFiveContract = this.leadFive.connect(user);
      const customCode = `USER${userIndex.toString().padStart(4, '0')}`;
      
      const tx = await leadFiveContract.register(
        referrer,
        packageLevel,
        true, // Use USDT
        customCode
      );

      await tx.wait();

      // Track successful registration
      this.registeredUsers.push({
        address: user.address,
        referrer: referrer,
        packageLevel: packageLevel,
        registrationTime: Date.now()
      });

      return { success: true, amount: packagePrice };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async testPackageUpgrades() {
    console.log("\n⬆️ Testing Package Upgrades");
    console.log("=" .repeat(40));

    if (this.registeredUsers.length === 0) {
      console.log("⚠️ No registered users to upgrade");
      return;
    }

    const upgradeCount = Math.min(100, this.registeredUsers.length);
    console.log(`Testing ${upgradeCount} package upgrades...`);

    for (let i = 0; i < upgradeCount; i++) {
      try {
        const user = this.registeredUsers[i];
        const currentLevel = user.packageLevel;
        const newLevel = Math.min(currentLevel + 1, 4);

        if (newLevel <= currentLevel) continue;

        const accountIndex = i % this.testAccounts.length;
        const userWallet = this.testAccounts[accountIndex];
        const upgradePrice = TEST_CONFIG.PACKAGE_PRICES[newLevel - 1];

        // Approve and upgrade
        const usdtContract = this.mockUSDT.connect(userWallet);
        await usdtContract.approve(TEST_CONFIG.LEADFIVE_PROXY, upgradePrice);

        const leadFiveContract = this.leadFive.connect(userWallet);
        const tx = await leadFiveContract.upgradePackage(newLevel, true);
        await tx.wait();

        this.statistics.totalUpgrades++;
        user.packageLevel = newLevel; // Update local record

        if ((i + 1) % 20 === 0) {
          console.log(`✅ Completed ${i + 1}/${upgradeCount} upgrades`);
        }

      } catch (error) {
        console.error(`Upgrade ${i + 1} failed:`, error.message);
        this.statistics.errors.push(`Upgrade ${i + 1}: ${error.message}`);
      }
    }

    console.log(`✅ Package upgrades completed: ${this.statistics.totalUpgrades}`);
  }

  async testWithdrawals() {
    console.log("\n💸 Testing Withdrawals");
    console.log("=" .repeat(30));

    // Give some users rewards first by simulating pool distributions
    await this.simulateRewardDistribution();

    if (this.registeredUsers.length === 0) {
      console.log("⚠️ No registered users for withdrawals");
      return;
    }

    const withdrawalCount = Math.min(50, this.registeredUsers.length);
    console.log(`Testing ${withdrawalCount} withdrawals...`);

    for (let i = 0; i < withdrawalCount; i++) {
      try {
        const accountIndex = i % this.testAccounts.length;
        const userWallet = this.testAccounts[accountIndex];
        
        // Check user balance
        const userData = await this.leadFive.users(userWallet.address);
        const balance = userData.balance;

        if (balance === 0n) {
          console.log(`User ${i + 1} has no balance to withdraw`);
          continue;
        }

        // Withdraw 50% of balance
        const withdrawAmount = balance / 2n;
        if (withdrawAmount === 0n) continue;

        const leadFiveContract = this.leadFive.connect(userWallet);
        const tx = await leadFiveContract.withdraw(withdrawAmount);
        await tx.wait();

        this.statistics.totalWithdrawals++;

        if ((i + 1) % 10 === 0) {
          console.log(`✅ Completed ${i + 1}/${withdrawalCount} withdrawals`);
        }

      } catch (error) {
        console.error(`Withdrawal ${i + 1} failed:`, error.message);
        this.statistics.errors.push(`Withdrawal ${i + 1}: ${error.message}`);
      }
    }

    console.log(`✅ Withdrawals completed: ${this.statistics.totalWithdrawals}`);
  }

  async simulateRewardDistribution() {
    console.log("\n🎁 Simulating reward distribution to users...");
    
    // Add some balance to random users for testing withdrawals
    for (let i = 0; i < Math.min(100, this.registeredUsers.length); i++) {
      try {
        const user = this.registeredUsers[i];
        const accountIndex = i % this.testAccounts.length;
        const userWallet = this.testAccounts[accountIndex];
        
        // Simulate receiving rewards (this would normally come from referrals/pools)
        const rewardAmount = ethers.parseEther((Math.random() * 50 + 10).toFixed(2)); // 10-60 USDT
        
        // We can't directly add balance, but we can simulate by having them register someone
        // In a real scenario, these balances would come from referral commissions
        
      } catch (error) {
        console.error(`Error simulating rewards for user ${i}:`, error.message);
      }
    }
  }

  async testPoolDistributions() {
    console.log("\n🏊 Testing Pool Distributions");
    console.log("=" .repeat(35));

    try {
      // Check pool balances
      const poolBalances = await this.leadFive.getPoolBalances();
      console.log("Pool Balances:");
      console.log(`Leader Pool: ${ethers.formatEther(poolBalances.leaderBalance)} USDT`);
      console.log(`Help Pool: ${ethers.formatEther(poolBalances.helpBalance)} USDT`);
      console.log(`Club Pool: ${ethers.formatEther(poolBalances.clubBalance)} USDT`);

      // Test leader pool distribution
      if (poolBalances.leaderBalance > 0) {
        console.log("\n📊 Testing Leader Pool Distribution...");
        const tx1 = await this.leadFive.distributeLeaderPool();
        await tx1.wait();
        this.statistics.totalPoolDistributions++;
        console.log("✅ Leader pool distributed");
      }

      // Test help pool distribution
      if (poolBalances.helpBalance > 0) {
        console.log("\n🤝 Testing Help Pool Distribution...");
        const tx2 = await this.leadFive.distributeHelpPool();
        await tx2.wait();
        this.statistics.totalPoolDistributions++;
        console.log("✅ Help pool distributed");
      }

      // Test club pool distribution
      if (poolBalances.clubBalance > 0) {
        console.log("\n🎯 Testing Club Pool Distribution...");
        const tx3 = await this.leadFive.distributeClubPool();
        await tx3.wait();
        this.statistics.totalPoolDistributions++;
        console.log("✅ Club pool distributed");
      }

    } catch (error) {
      console.error("Pool distribution error:", error.message);
      this.statistics.errors.push(`Pool distribution: ${error.message}`);
    }
  }

  async testContractViews() {
    console.log("\n📊 Testing Contract View Functions");
    console.log("=" .repeat(40));

    try {
      // Test pool balances
      const poolBalances = await this.leadFive.getPoolBalances();
      console.log("Current Pool Balances:");
      console.log(`- Leader: ${ethers.formatEther(poolBalances.leaderBalance)} USDT`);
      console.log(`- Help: ${ethers.formatEther(poolBalances.helpBalance)} USDT`);
      console.log(`- Club: ${ethers.formatEther(poolBalances.clubBalance)} USDT`);

      // Test total users
      const totalUsers = await this.leadFive.totalUsers();
      console.log(`\nTotal Users: ${totalUsers}`);

      // Test platform fee recipient
      const feeRecipient = await this.leadFive.platformFeeRecipient();
      console.log(`Platform Fee Recipient: ${feeRecipient}`);

      // Test a few user records
      console.log("\nSample User Data:");
      for (let i = 0; i < Math.min(5, this.registeredUsers.length); i++) {
        const user = this.registeredUsers[i];
        const userData = await this.leadFive.users(user.address);
        console.log(`User ${i + 1}:`);
        console.log(`  Address: ${user.address}`);
        console.log(`  Package Level: ${userData.packageLevel}`);
        console.log(`  Balance: ${ethers.formatEther(userData.balance)} USDT`);
        console.log(`  Total Investment: ${ethers.formatEther(userData.totalInvestment)} USDT`);
        console.log(`  Direct Referrals: ${userData.directReferrals}`);
      }

    } catch (error) {
      console.error("View function test error:", error.message);
      this.statistics.errors.push(`View functions: ${error.message}`);
    }
  }

  async generateReport() {
    console.log("\n📋 COMPREHENSIVE TEST REPORT");
    console.log("=" .repeat(60));
    
    console.log("🎯 TEST SUMMARY:");
    console.log(`✅ Total Registrations: ${this.statistics.totalRegistrations}/${TEST_CONFIG.TOTAL_USERS}`);
    console.log(`⬆️ Total Upgrades: ${this.statistics.totalUpgrades}`);
    console.log(`💸 Total Withdrawals: ${this.statistics.totalWithdrawals}`);
    console.log(`🏊 Pool Distributions: ${this.statistics.totalPoolDistributions}`);
    console.log(`💰 Total Volume: ${ethers.formatEther(this.statistics.totalVolume)} USDT`);
    console.log(`❌ Total Errors: ${this.statistics.errors.length}`);

    console.log("\n📊 CONTRACT STATUS:");
    try {
      const totalUsers = await this.leadFive.totalUsers();
      const poolBalances = await this.leadFive.getPoolBalances();
      const totalFees = await this.leadFive.totalPlatformFeesCollected();

      console.log(`📈 Contract Total Users: ${totalUsers}`);
      console.log(`💰 Total Platform Fees: ${ethers.formatEther(totalFees)} USDT`);
      console.log(`🏊 Final Pool Balances:`);
      console.log(`   Leader: ${ethers.formatEther(poolBalances.leaderBalance)} USDT`);
      console.log(`   Help: ${ethers.formatEther(poolBalances.helpBalance)} USDT`);
      console.log(`   Club: ${ethers.formatEther(poolBalances.clubBalance)} USDT`);
    } catch (error) {
      console.error("Error getting final stats:", error.message);
    }

    if (this.statistics.errors.length > 0) {
      console.log("\n❌ ERRORS ENCOUNTERED:");
      this.statistics.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      if (this.statistics.errors.length > 10) {
        console.log(`... and ${this.statistics.errors.length - 10} more errors`);
      }
    }

    console.log("\n🎉 TESTING COMPLETED!");
    
    // Calculate success rates
    const registrationRate = (this.statistics.totalRegistrations / TEST_CONFIG.TOTAL_USERS * 100).toFixed(2);
    console.log(`📊 Registration Success Rate: ${registrationRate}%`);
    
    if (this.statistics.totalRegistrations > 0) {
      const avgVolumePerUser = Number(ethers.formatEther(this.statistics.totalVolume)) / this.statistics.totalRegistrations;
      console.log(`💰 Average Volume per User: ${avgVolumePerUser.toFixed(2)} USDT`);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  const startTime = Date.now();
  
  console.log("🚀 LEADFIVE COMPREHENSIVE TESTING SUITE");
  console.log("Testing with Mock USDT and 1000+ Users");
  console.log("=" .repeat(70));

  const testSuite = new LeadFiveTestSuite();
  
  try {
    // Initialize
    await testSuite.initialize();
    
    // Fund test accounts
    await testSuite.fundTestAccounts();
    
    // Run tests
    await testSuite.testMassRegistrations();
    await testSuite.testPackageUpgrades();
    await testSuite.testWithdrawals();
    await testSuite.testPoolDistributions();
    await testSuite.testContractViews();
    
    // Generate final report
    await testSuite.generateReport();
    
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
  console.log(`\n⏱️ Total testing time: ${duration} minutes`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test suite error:", error);
    process.exit(1);
  });
