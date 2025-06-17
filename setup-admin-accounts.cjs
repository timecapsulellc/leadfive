#!/usr/bin/env node
/**
 * OrphiCrowdFund Admin Account Setup & Referral Link Generator
 * Supports both Testnet and Mainnet deployments
 */

const { ethers } = require('ethers');

// Contract Configurations
const CONTRACTS = {
  testnet: {
    address: "0x01F1fCf1aA7072B6b9d95974174AecbF753795FF",
    network: "BSC Testnet",
    chainId: 97,
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    explorerUrl: "https://testnet.bscscan.com",
    usdtAddress: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"
  },
  mainnet: {
    address: "0x4965197b430343daec1042B413Dd6e20D06dAdba",
    network: "BSC Mainnet",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org/",
    explorerUrl: "https://bscscan.com",
    usdtAddress: "0x55d398326f99059fF775485246999027B3197955"
  }
};

// Admin Accounts Configuration
const ADMIN_ACCOUNTS = [
  {
    name: "Root Admin",
    address: "0xBcae617E213145BB76fD8023B3D9d7d4F97013e5", // Your main admin wallet
    role: "ROOT_ADMIN",
    packageLevel: 8, // Ultimate package ($2000)
    description: "Primary admin account - Root of the network tree"
  },
  {
    name: "Treasury Admin", 
    address: "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29", // Treasury wallet
    role: "TREASURY_ADMIN",
    packageLevel: 7, // Elite package ($1000)
    description: "Treasury management and financial operations"
  },
  {
    name: "Operations Admin",
    address: "0x96264D29910eC58CD9fE4e9367931C191416b1e1", // Operations wallet
    role: "OPERATIONS_ADMIN", 
    packageLevel: 6, // Premium package ($500)
    description: "Day-to-day operations and user management"
  },
  {
    name: "Support Admin",
    address: "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6", // Support wallet
    role: "SUPPORT_ADMIN",
    packageLevel: 5, // Professional package ($300)
    description: "Customer support and user assistance"
  },
  {
    name: "Marketing Admin",
    address: "0xE347b326Af572a7115aec536EBf68F72b263D816", // Marketing wallet
    role: "MARKETING_ADMIN",
    packageLevel: 4, // Advanced package ($200)
    description: "Marketing campaigns and referral management"
  }
];

// Package Information
const PACKAGES = [
  { level: 1, name: "Starter", price: 30, priceUSD: "$30" },
  { level: 2, name: "Basic", price: 50, priceUSD: "$50" },
  { level: 3, name: "Standard", price: 100, priceUSD: "$100" },
  { level: 4, name: "Advanced", price: 200, priceUSD: "$200" },
  { level: 5, name: "Professional", price: 300, priceUSD: "$300" },
  { level: 6, name: "Premium", price: 500, priceUSD: "$500" },
  { level: 7, name: "Elite", price: 1000, priceUSD: "$1000" },
  { level: 8, name: "Ultimate", price: 2000, priceUSD: "$2000" }
];

// Simplified Contract ABI (key functions only)
const CONTRACT_ABI = [
  "function getUserInfo(address user) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate))",
  "function getPoolBalances() view returns (uint96, uint96, uint96)",
  "function packages(uint8) view returns (tuple(uint96 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus))",
  "function register(address referrer, uint8 packageLevel, bool useUSDT) payable",
  "function upgradePackage(uint8 newLevel, bool useUSDT) payable",
  "function withdraw(uint96 amount)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  "function totalUsers() view returns (uint256)"
];

class AdminSetup {
  constructor(network = 'mainnet') {
    this.network = network;
    this.config = CONTRACTS[network];
    this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
    this.contract = new ethers.Contract(this.config.address, CONTRACT_ABI, this.provider);
  }

  async initialize() {
    console.log('\n🔐 OrphiCrowdFund Admin Setup & Referral Generator');
    console.log('═'.repeat(80));
    console.log(`🌐 Network: ${this.config.network}`);
    console.log(`📋 Contract: ${this.config.address}`);
    console.log(`🔗 Explorer: ${this.config.explorerUrl}/address/${this.config.address}`);
    console.log('═'.repeat(80));

    await this.checkContractStatus();
    await this.analyzeAdminAccounts();
    await this.generateReferralLinks();
    await this.generateRegistrationGuide();
  }

  async checkContractStatus() {
    console.log('\n🔍 CONTRACT STATUS CHECK');
    console.log('─'.repeat(50));

    try {
      const [totalUsers, owner, paused] = await Promise.all([
        this.contract.totalUsers(),
        this.contract.owner(),
        this.contract.paused()
      ]);

      console.log(`👥 Total Users: ${totalUsers.toString()}`);
      console.log(`🔐 Contract Owner: ${owner}`);
      console.log(`⚡ Contract Status: ${paused ? '⏸️  PAUSED' : '✅ ACTIVE'}`);

      this.contractStatus = {
        totalUsers: Number(totalUsers),
        owner,
        paused,
        needsBootstrap: Number(totalUsers) === 0
      };

      if (this.contractStatus.needsBootstrap) {
        console.log('\n⚠️  CONTRACT NEEDS BOOTSTRAP');
        console.log('   No users registered yet - Root admin must register first');
      }

    } catch (error) {
      console.error('❌ Error checking contract status:', error.message);
      this.contractStatus = { error: error.message };
    }
  }

  async analyzeAdminAccounts() {
    console.log('\n👥 ADMIN ACCOUNTS ANALYSIS');
    console.log('─'.repeat(50));

    this.adminStatus = [];

    for (const admin of ADMIN_ACCOUNTS) {
      try {
        const userInfo = await this.contract.getUserInfo(admin.address);
        const package_ = PACKAGES.find(p => p.level === admin.packageLevel);
        
        const status = {
          ...admin,
          isRegistered: userInfo.isRegistered,
          currentPackage: userInfo.packageLevel,
          totalEarnings: ethers.formatEther(userInfo.totalEarnings),
          directReferrals: userInfo.directReferrals,
          teamSize: userInfo.teamSize,
          targetPackage: package_
        };

        this.adminStatus.push(status);

        console.log(`\n${admin.name} (${admin.role})`);
        console.log(`   📍 Address: ${admin.address}`);
        console.log(`   📊 Status: ${userInfo.isRegistered ? '✅ Registered' : '❌ Not Registered'}`);
        console.log(`   📦 Package: ${userInfo.isRegistered ? `Level ${userInfo.packageLevel}` : `Target: Level ${admin.packageLevel} (${package_.priceUSD})`}`);
        console.log(`   👥 Referrals: ${userInfo.directReferrals} direct, ${userInfo.teamSize} team`);
        console.log(`   💰 Earnings: ${ethers.formatEther(userInfo.totalEarnings)} ETH`);

      } catch (error) {
        console.log(`\n${admin.name} (${admin.role})`);
        console.log(`   📍 Address: ${admin.address}`);
        console.log(`   ❌ Error: ${error.message}`);
        
        this.adminStatus.push({
          ...admin,
          error: error.message
        });
      }
    }
  }

  async generateReferralLinks() {
    console.log('\n🔗 REFERRAL LINKS GENERATION');
    console.log('─'.repeat(50));

    const baseUrl = this.network === 'mainnet' 
      ? 'https://crowdfund-lake.vercel.app' 
      : 'https://testnet.crowdfund-lake.vercel.app';

    this.referralLinks = {};

    ADMIN_ACCOUNTS.forEach((admin, index) => {
      const adminId = index + 1; // Admin IDs start from 1
      const referralCode = admin.address.slice(2, 8).toUpperCase(); // First 6 chars of address
      
      this.referralLinks[admin.role] = {
        adminInfo: admin,
        adminId,
        referralCode,
        links: {
          direct: `${baseUrl}?ref=${admin.address}`,
          coded: `${baseUrl}?ref=${referralCode}`,
          withPackage: PACKAGES.map(pkg => ({
            package: pkg,
            link: `${baseUrl}?ref=${admin.address}&pkg=${pkg.level}`
          }))
        }
      };

      console.log(`\n${admin.name} - ID: ${adminId}`);
      console.log(`   🔗 Direct Link: ${baseUrl}?ref=${admin.address}`);
      console.log(`   🎯 Short Code: ${referralCode}`);
      console.log(`   📱 Coded Link: ${baseUrl}?ref=${referralCode}`);
    });
  }

  async generateRegistrationGuide() {
    console.log('\n📋 REGISTRATION GUIDE GENERATION');
    console.log('─'.repeat(50));

    const registrationGuide = {
      network: this.config.network,
      contractAddress: this.config.address,
      explorerUrl: `${this.config.explorerUrl}/address/${this.config.address}`,
      needsBootstrap: this.contractStatus.needsBootstrap,
      adminAccounts: this.adminStatus,
      referralLinks: this.referralLinks,
      packages: PACKAGES,
      registrationSteps: this.generateRegistrationSteps()
    };

    // Save to file
    const filename = `admin-setup-${this.network}-${Date.now()}.json`;
    require('fs').writeFileSync(filename, JSON.stringify(registrationGuide, null, 2));
    
    console.log(`✅ Registration guide saved to: ${filename}`);
    
    return registrationGuide;
  }

  generateRegistrationSteps() {
    if (this.contractStatus.needsBootstrap) {
      return {
        phase: "BOOTSTRAP_REQUIRED",
        steps: [
          "1. 🔐 Root Admin must register first using zero address sponsor",
          "2. 💰 Root Admin registers with Ultimate Package ($2000)",
          "3. 👥 Other admins register using Root Admin as sponsor",
          "4. 🌐 Network tree begins with Root Admin at the top",
          "5. 🔗 Generate and distribute referral links",
          "6. 📈 Begin user acquisition and growth"
        ],
        rootRegistration: {
          method: "Direct Contract Call",
          function: "register(address(0), 8, false)",
          value: "BNB equivalent of $2000",
          note: "Root admin registers with zero address as sponsor"
        }
      };
    } else {
      return {
        phase: "NORMAL_REGISTRATION",
        steps: [
          "1. 🔍 Identify existing sponsor (registered user)",
          "2. 💰 Choose appropriate package level",
          "3. 🔗 Use referral link with sponsor address",
          "4. 💳 Complete payment (BNB or USDT)",
          "5. ✅ Confirm registration on blockchain",
          "6. 📊 Begin earning from network activity"
        ]
      };
    }
  }

  printSummary() {
    console.log('\n🎯 ADMIN SETUP SUMMARY');
    console.log('═'.repeat(80));
    
    console.log(`\n📊 Network Status:`);
    console.log(`   🌐 ${this.config.network}`);
    console.log(`   📋 Contract: ${this.config.address}`);
    console.log(`   👥 Total Users: ${this.contractStatus.totalUsers || 0}`);
    console.log(`   🔄 Status: ${this.contractStatus.needsBootstrap ? 'Needs Bootstrap' : 'Active'}`);

    console.log(`\n👥 Admin Accounts (${ADMIN_ACCOUNTS.length}):`);
    this.adminStatus.forEach((admin, index) => {
      const status = admin.isRegistered ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${admin.name} - ${admin.role}`);
    });

    console.log(`\n🔗 Referral System:`);
    console.log(`   📱 Base URL: https://crowdfund-lake.vercel.app`);
    console.log(`   🎯 Admin Links: ${Object.keys(this.referralLinks).length} generated`);
    console.log(`   📦 Package Options: ${PACKAGES.length} tiers ($30-$2000)`);

    if (this.contractStatus.needsBootstrap) {
      console.log(`\n⚠️  NEXT STEPS - BOOTSTRAP REQUIRED:`);
      console.log(`   1. 🔐 Root Admin (${ADMIN_ACCOUNTS[0].address}) must register first`);
      console.log(`   2. 💰 Use Ultimate Package ($2000) for maximum network benefits`);
      console.log(`   3. 🔗 Use BSCScan write contract interface`);
      console.log(`   4. 📞 Call register(0x0000000000000000000000000000000000000000, 8, false)`);
      console.log(`   5. 💳 Send BNB equivalent of $2000 with transaction`);
    } else {
      console.log(`\n✅ READY FOR OPERATION:`);
      console.log(`   🎯 Network is active and ready for new users`);
      console.log(`   🔗 Distribute referral links to begin user acquisition`);
      console.log(`   📈 Monitor growth through admin dashboard`);
    }

    console.log('\n═'.repeat(80));
  }
}

// Main execution
async function main() {
  try {
    // Setup for both networks
    console.log('🚀 Setting up admin accounts for both networks...\n');

    // Mainnet Setup
    console.log('🌐 MAINNET SETUP');
    const mainnetSetup = new AdminSetup('mainnet');
    await mainnetSetup.initialize();
    mainnetSetup.printSummary();

    console.log('\n' + '═'.repeat(100) + '\n');

    // Testnet Setup  
    console.log('🧪 TESTNET SETUP');
    const testnetSetup = new AdminSetup('testnet');
    await testnetSetup.initialize();
    testnetSetup.printSummary();

    console.log('\n🎉 ADMIN SETUP COMPLETE!');
    console.log('📁 Check generated JSON files for detailed configuration');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AdminSetup, ADMIN_ACCOUNTS, PACKAGES, CONTRACTS }; 