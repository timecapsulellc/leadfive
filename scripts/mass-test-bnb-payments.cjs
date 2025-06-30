// scripts/mass-test-bnb-payments.cjs
// Comprehensive testing using BNB payments to avoid USDT minting issues

const { ethers } = require("hardhat");

const TEST_CONFIG = {
  LEADFIVE_PROXY: "0x292c11A70ef007B383671b2Ada56bd68ad8d4988",
  TOTAL_USERS: 500, // Reduced for BNB limits
  BATCH_SIZE: 20,
  TEST_ACCOUNT_COUNT: 50,
  PACKAGE_LEVELS: [1, 2, 3, 4],
  PACKAGE_PRICES_USD: [30, 50, 100, 200], // USD prices
  BNB_PRICE_USD: 600, // Assume $600 per BNB for calculations
};

class BNBTestSuite {
  constructor() {
    this.deployer = null;
    this.leadFive = null;
    this.testAccounts = [];
    this.registeredUsers = [];
    this.statistics = {
      totalRegistrations: 0,
      totalWithdrawals: 0,
      totalUpgrades: 0,
      totalVolume: ethers.parseEther("0"),
      bnbUsed: ethers.parseEther("0"),
      errors: []
    };
  }

  async initialize() {
    console.log("🚀 Initializing BNB-Based Mass Test Suite");
    console.log("=".repeat(60));

    try {
      [this.deployer] = await ethers.getSigners();
      console.log(`👤 Deployer: ${this.deployer.address}`);
      
      const balance = await ethers.provider.getBalance(this.deployer.address);
      console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);
      
      if (balance < ethers.parseEther("0.1")) {
        throw new Error("Insufficient BNB balance for testing");
      }

      // Connect to LeadFive
      const LeadFive = await ethers.getContractFactory("LeadFive");
      this.leadFive = LeadFive.attach(TEST_CONFIG.LEADFIVE_PROXY);
      
      console.log(`✅ Connected to LeadFive: ${TEST_CONFIG.LEADFIVE_PROXY}`);
      
      // Verify contract state
      const owner = await this.leadFive.owner();
      const totalUsers = await this.leadFive.totalUsers();
      console.log(`✅ Owner: ${owner}`);
      console.log(`✅ Current Users: ${totalUsers}`);

      console.log("\n🔧 Generating Test Accounts...");
      await this.generateTestAccounts();
      
      console.log("✅ Initialization complete!");
      return true;

    } catch (error) {
      console.error("❌ Initialization failed:", error.message);
      return false;
    }
  }

  async generateTestAccounts() {
    console.log(`📝 Generating ${TEST_CONFIG.TEST_ACCOUNT_COUNT} test accounts...`);
    
    for (let i = 0; i < TEST_CONFIG.TEST_ACCOUNT_COUNT; i++) {
      const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
      this.testAccounts.push(wallet);
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Generated ${i + 1}/${TEST_CONFIG.TEST_ACCOUNT_COUNT} accounts`);
      }
    }
    
    console.log(`✅ Generated ${this.testAccounts.length} test accounts`);
  }

  calculateBNBRequired(packageIndex) {
    const priceUSD = TEST_CONFIG.PACKAGE_PRICES_USD[packageIndex];
    const bnbRequired = (priceUSD / TEST_CONFIG.BNB_PRICE_USD).toFixed(6);
    return ethers.parseEther(bnbRequired);
  }

  async fundAccount(account, amount) {
    try {
      const tx = await this.deployer.sendTransaction({
        to: account.address,
        value: amount,
        gasLimit: 21000
      });
      await tx.wait();
      return true;
    } catch (error) {
      console.error(`❌ Failed to fund ${account.address}: ${error.message}`);
      return false;
    }
  }

  async registerUser(account, packageLevel, referrer = null) {
    try {
      const bnbRequired = this.calculateBNBRequired(packageLevel - 1);
      const extraForGas = ethers.parseEther("0.01");
      const totalNeeded = bnbRequired + extraForGas;
      
      // Fund the account
      await this.fundAccount(account, totalNeeded);
      
      // Register with BNB payment
      const tx = await this.leadFive.connect(account).register(
        referrer || ethers.ZeroAddress,
        packageLevel,
        false, // Use BNB, not USDT
        "", // No custom referral code
        {
          value: bnbRequired,
          gasLimit: 500000
        }
      );
      
      await tx.wait();
      this.statistics.totalRegistrations++;
      this.statistics.bnbUsed += bnbRequired;
      
      return true;
      
    } catch (error) {
      this.statistics.errors.push({
        type: 'registration',
        user: account.address,
        error: error.message.split('.')[0]
      });
      return false;
    }
  }

  async upgradeUser(account, newLevel) {
    try {
      const bnbRequired = this.calculateBNBRequired(newLevel - 1);
      const extraForGas = ethers.parseEther("0.01");
      
      await this.fundAccount(account, bnbRequired + extraForGas);
      
      const tx = await this.leadFive.connect(account).upgradePackage(
        newLevel,
        false, // Use BNB
        {
          value: bnbRequired,
          gasLimit: 500000
        }
      );
      
      await tx.wait();
      this.statistics.totalUpgrades++;
      this.statistics.bnbUsed += bnbRequired;
      
      return true;
      
    } catch (error) {
      this.statistics.errors.push({
        type: 'upgrade',
        user: account.address,
        error: error.message.split('.')[0]
      });
      return false;
    }
  }

  async runMassRegistrations() {
    console.log("\n🎯 Starting Mass Registration Test");
    console.log("-".repeat(50));
    
    let successCount = 0;
    let batchCount = 0;
    
    for (let i = 0; i < Math.min(TEST_CONFIG.TOTAL_USERS, this.testAccounts.length); i += TEST_CONFIG.BATCH_SIZE) {
      batchCount++;
      console.log(`\n📦 Batch ${batchCount} - Registering users ${i + 1} to ${Math.min(i + TEST_CONFIG.BATCH_SIZE, TEST_CONFIG.TOTAL_USERS)}...`);
      
      const batchPromises = [];
      const batchEnd = Math.min(i + TEST_CONFIG.BATCH_SIZE, TEST_CONFIG.TOTAL_USERS, this.testAccounts.length);
      
      for (let j = i; j < batchEnd; j++) {
        const account = this.testAccounts[j];
        const packageLevel = Math.floor(Math.random() * 4) + 1; // Random package 1-4
        const referrer = j > 0 ? this.registeredUsers[Math.floor(Math.random() * this.registeredUsers.length)] : null;
        
        batchPromises.push(
          this.registerUser(account, packageLevel, referrer?.address).then(success => {
            if (success) {
              this.registeredUsers.push(account);
              return true;
            }
            return false;
          })
        );
      }
      
      const results = await Promise.all(batchPromises);
      const batchSuccesses = results.filter(r => r).length;
      successCount += batchSuccesses;
      
      console.log(`   ✅ Batch ${batchCount}: ${batchSuccesses}/${batchEnd - i} successful`);
      console.log(`   📊 Total: ${successCount}/${Math.min(j + 1, TEST_CONFIG.TOTAL_USERS)} registered`);
      
      // Small delay between batches to avoid overwhelming the network
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n🎉 Mass Registration Complete: ${successCount}/${Math.min(TEST_CONFIG.TOTAL_USERS, this.testAccounts.length)} successful`);
  }

  async runUpgradeTests() {
    console.log("\n⬆️ Testing Package Upgrades");
    console.log("-".repeat(40));
    
    const upgradeCount = Math.min(20, this.registeredUsers.length);
    let successCount = 0;
    
    for (let i = 0; i < upgradeCount; i++) {
      const account = this.registeredUsers[i];
      const currentUser = await this.leadFive.users(account.address);
      const currentLevel = currentUser.packageLevel;
      
      if (currentLevel < 4) {
        const newLevel = Math.min(currentLevel + 1, 4);
        const success = await this.upgradeUser(account, newLevel);
        if (success) successCount++;
        
        console.log(`   ${success ? '✅' : '❌'} User ${i + 1}: Level ${currentLevel} → ${newLevel}`);
      }
    }
    
    console.log(`\n📈 Upgrade Tests: ${successCount}/${upgradeCount} successful`);
  }

  async runWithdrawalTests() {
    console.log("\n💰 Testing Withdrawals");
    console.log("-".repeat(30));
    
    let successCount = 0;
    const withdrawalCount = Math.min(10, this.registeredUsers.length);
    
    for (let i = 0; i < withdrawalCount; i++) {
      try {
        const account = this.registeredUsers[i];
        const userData = await this.leadFive.users(account.address);
        
        if (userData.balance > 0) {
          const withdrawAmount = userData.balance / 2n; // Withdraw 50%
          
          const tx = await this.leadFive.connect(account).withdraw(withdrawAmount, {
            gasLimit: 300000
          });
          
          await tx.wait();
          successCount++;
          this.statistics.totalWithdrawals++;
          
          console.log(`   ✅ User ${i + 1}: Withdrew ${ethers.formatEther(withdrawAmount)} USDT`);
        } else {
          console.log(`   ⚠️ User ${i + 1}: No balance to withdraw`);
        }
        
      } catch (error) {
        console.log(`   ❌ User ${i + 1}: Withdrawal failed - ${error.message.split('.')[0]}`);
        this.statistics.errors.push({
          type: 'withdrawal',
          user: this.registeredUsers[i].address,
          error: error.message.split('.')[0]
        });
      }
    }
    
    console.log(`\n💳 Withdrawal Tests: ${successCount}/${withdrawalCount} successful`);
  }

  async getContractState() {
    console.log("\n📊 Final Contract State");
    console.log("-".repeat(40));
    
    try {
      const totalUsers = await this.leadFive.totalUsers();
      const poolBalances = await this.leadFive.getPoolBalances();
      const platformFees = await this.leadFive.totalPlatformFeesCollected();
      
      console.log(`👥 Total Users: ${totalUsers}`);
      console.log(`🏊 Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
      console.log(`🆘 Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
      console.log(`🎪 Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
      console.log(`💼 Platform Fees: ${ethers.formatEther(platformFees)} USDT`);
      
    } catch (error) {
      console.error("❌ Failed to get contract state:", error.message);
    }
  }

  async generateReport() {
    console.log("\n📋 Test Summary Report");
    console.log("=".repeat(50));
    
    console.log(`✅ Registrations: ${this.statistics.totalRegistrations}`);
    console.log(`⬆️ Upgrades: ${this.statistics.totalUpgrades}`);
    console.log(`💰 Withdrawals: ${this.statistics.totalWithdrawals}`);
    console.log(`🔥 BNB Used: ${ethers.formatEther(this.statistics.bnbUsed)} BNB`);
    console.log(`❌ Errors: ${this.statistics.errors.length}`);
    
    if (this.statistics.errors.length > 0) {
      console.log("\n❌ Error Summary:");
      const errorCounts = {};
      this.statistics.errors.forEach(err => {
        const key = `${err.type}: ${err.error}`;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });
      
      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`   ${count}x ${error}`);
      });
    }
    
    const remainingBalance = await ethers.provider.getBalance(this.deployer.address);
    console.log(`\n💰 Remaining BNB: ${ethers.formatEther(remainingBalance)} BNB`);
  }

  async runFullTest() {
    console.log("🎬 Starting Full Test Suite");
    console.log("=".repeat(60));
    
    const startTime = Date.now();
    
    await this.runMassRegistrations();
    await this.runUpgradeTests();
    await this.runWithdrawalTests();
    await this.getContractState();
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n⏱️ Test Duration: ${duration.toFixed(1)} seconds`);
    
    await this.generateReport();
  }
}

async function main() {
  const testSuite = new BNBTestSuite();
  
  const initialized = await testSuite.initialize();
  if (!initialized) {
    process.exit(1);
  }
  
  await testSuite.runFullTest();
  
  console.log("\n🎉 Mass Testing Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
