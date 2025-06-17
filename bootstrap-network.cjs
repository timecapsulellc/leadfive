#!/usr/bin/env node
/**
 * OrphiCrowdFund Network Bootstrap Script
 * Step 1: Register Root Admin to initialize the network
 */

const { ethers } = require('ethers');

// Configuration
const MAINNET_CONFIG = {
  contractAddress: "0x4965197b430343daec1042B413Dd6e20D06dAdba",
  rpcUrl: "https://bsc-dataseed.binance.org/",
  explorerUrl: "https://bscscan.com",
  chainId: 56
};

const ROOT_ADMIN = {
  address: "0xBcae617E213145BB76fD8023B3D9d7d4F97013e5",
  name: "Root Admin",
  packageLevel: 8, // Ultimate package
  packagePrice: 2000 // $2000
};

// Simplified contract ABI
const CONTRACT_ABI = [
  "function getUserInfo(address user) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate))",
  "function register(address referrer, uint8 packageLevel, bool useUSDT) payable",
  "function totalUsers() view returns (uint256)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)"
];

class NetworkBootstrap {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(MAINNET_CONFIG.rpcUrl);
    this.contract = new ethers.Contract(MAINNET_CONFIG.contractAddress, CONTRACT_ABI, this.provider);
  }

  async checkNetworkStatus() {
    console.log('\n🔍 CHECKING NETWORK STATUS');
    console.log('═'.repeat(60));
    
    try {
      const [totalUsers, owner, paused] = await Promise.all([
        this.contract.totalUsers(),
        this.contract.owner(),
        this.contract.paused()
      ]);

      console.log(`📋 Contract: ${MAINNET_CONFIG.contractAddress}`);
      console.log(`👥 Total Users: ${totalUsers.toString()}`);
      console.log(`🔐 Owner: ${owner}`);
      console.log(`⚡ Status: ${paused ? '⏸️  PAUSED' : '✅ ACTIVE'}`);

      const needsBootstrap = Number(totalUsers) === 0;
      
      if (needsBootstrap) {
        console.log('\n⚠️  BOOTSTRAP REQUIRED');
        console.log('   No users registered yet - Root Admin must register first');
        return { needsBootstrap: true, totalUsers: Number(totalUsers) };
      } else {
        console.log('\n✅ NETWORK ALREADY BOOTSTRAPPED');
        console.log(`   ${totalUsers} users already registered`);
        
        // Check if Root Admin is registered
        try {
          const rootAdminInfo = await this.contract.getUserInfo(ROOT_ADMIN.address);
          console.log(`\n👤 Root Admin Status:`);
          console.log(`   📊 Registered: ${rootAdminInfo.isRegistered ? '✅' : '❌'}`);
          if (rootAdminInfo.isRegistered) {
            console.log(`   📦 Package Level: ${rootAdminInfo.packageLevel}`);
            console.log(`   👥 Direct Referrals: ${rootAdminInfo.directReferrals}`);
            console.log(`   🏢 Team Size: ${rootAdminInfo.teamSize}`);
            console.log(`   💰 Total Earnings: ${ethers.formatEther(rootAdminInfo.totalEarnings)} ETH`);
          }
        } catch (error) {
          console.log(`   ❌ Error checking Root Admin: ${error.message}`);
        }
        
        return { needsBootstrap: false, totalUsers: Number(totalUsers) };
      }
    } catch (error) {
      console.error('❌ Error checking network status:', error.message);
      return { error: error.message };
    }
  }

  generateBootstrapInstructions() {
    console.log('\n🚀 ROOT ADMIN BOOTSTRAP INSTRUCTIONS');
    console.log('═'.repeat(60));
    
    const bnbPrice = 600; // Approximate BNB price
    const bnbAmount = (ROOT_ADMIN.packagePrice / bnbPrice).toFixed(4);
    
    console.log(`\n📋 Registration Details:`);
    console.log(`   👤 Wallet: ${ROOT_ADMIN.address}`);
    console.log(`   📦 Package: Ultimate (Level ${ROOT_ADMIN.packageLevel})`);
    console.log(`   💰 Price: $${ROOT_ADMIN.packagePrice}`);
    console.log(`   🪙 BNB Amount: ~${bnbAmount} BNB`);
    
    console.log(`\n🔧 Contract Call:`);
    console.log(`   Function: register(address,uint8,bool)`);
    console.log(`   Parameters:`);
    console.log(`     referrer: 0x0000000000000000000000000000000000000000`);
    console.log(`     packageLevel: ${ROOT_ADMIN.packageLevel}`);
    console.log(`     useUSDT: false`);
    console.log(`   Value: ${bnbAmount} BNB`);
    
    console.log(`\n🌐 BSCScan Links:`);
    console.log(`   📋 Contract: ${MAINNET_CONFIG.explorerUrl}/address/${MAINNET_CONFIG.contractAddress}`);
    console.log(`   ✍️  Write Contract: ${MAINNET_CONFIG.explorerUrl}/address/${MAINNET_CONFIG.contractAddress}#writeContract`);
    
    console.log(`\n📝 Step-by-Step Process:`);
    console.log(`   1. 🔗 Open BSCScan Write Contract interface`);
    console.log(`   2. 🔌 Connect MetaMask with Root Admin wallet`);
    console.log(`   3. 🌐 Ensure you're on BSC Mainnet (Chain ID: 56)`);
    console.log(`   4. 💰 Ensure wallet has at least ${bnbAmount} BNB + gas fees`);
    console.log(`   5. 📝 Find the 'register' function`);
    console.log(`   6. 📋 Enter parameters as shown above`);
    console.log(`   7. 💸 Set transaction value to ${bnbAmount} BNB`);
    console.log(`   8. ✅ Submit transaction and wait for confirmation`);
    
    return {
      contractAddress: MAINNET_CONFIG.contractAddress,
      writeContractUrl: `${MAINNET_CONFIG.explorerUrl}/address/${MAINNET_CONFIG.contractAddress}#writeContract`,
      rootAdmin: ROOT_ADMIN,
      bnbAmount,
      parameters: {
        referrer: "0x0000000000000000000000000000000000000000",
        packageLevel: ROOT_ADMIN.packageLevel,
        useUSDT: false
      }
    };
  }

  async verifyBootstrap() {
    console.log('\n🔍 VERIFYING BOOTSTRAP STATUS');
    console.log('═'.repeat(60));
    
    try {
      const totalUsers = await this.contract.totalUsers();
      console.log(`👥 Total Users: ${totalUsers.toString()}`);
      
      if (Number(totalUsers) > 0) {
        console.log('✅ Bootstrap successful! Users are now registered.');
        
        // Check Root Admin specifically
        const rootAdminInfo = await this.contract.getUserInfo(ROOT_ADMIN.address);
        console.log(`\n👤 Root Admin Verification:`);
        console.log(`   📊 Registered: ${rootAdminInfo.isRegistered ? '✅' : '❌'}`);
        
        if (rootAdminInfo.isRegistered) {
          console.log(`   📦 Package Level: ${rootAdminInfo.packageLevel}`);
          console.log(`   💰 Investment: ${ethers.formatEther(rootAdminInfo.totalInvestment)} ETH`);
          console.log(`   🎯 Referrer: ${rootAdminInfo.referrer}`);
          console.log(`   ⏰ Registration: Successful`);
          
          console.log(`\n🎉 ROOT ADMIN SUCCESSFULLY REGISTERED!`);
          console.log(`   Network is now ready for other admin registrations.`);
          
          return { success: true, rootAdminRegistered: true };
        } else {
          console.log(`   ❌ Root Admin not found in registered users`);
          return { success: false, reason: "Root Admin not registered" };
        }
      } else {
        console.log('❌ Bootstrap not yet complete - no users registered');
        return { success: false, reason: "No users registered yet" };
      }
    } catch (error) {
      console.error('❌ Error verifying bootstrap:', error.message);
      return { success: false, error: error.message };
    }
  }

  generateNextSteps() {
    console.log('\n🎯 NEXT STEPS AFTER ROOT ADMIN REGISTRATION');
    console.log('═'.repeat(60));
    
    const otherAdmins = [
      { name: "Treasury Admin", address: "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29", package: "Elite ($1000)", level: 7 },
      { name: "Operations Admin", address: "0x96264D29910eC58CD9fE4e9367931C191416b1e1", package: "Premium ($500)", level: 6 },
      { name: "Support Admin", address: "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6", package: "Professional ($300)", level: 5 },
      { name: "Marketing Admin", address: "0xE347b326Af572a7115aec536EBf68F72b263D816", package: "Advanced ($200)", level: 4 }
    ];
    
    console.log(`\n📋 Register Other Admins (using Root Admin as sponsor):`);
    otherAdmins.forEach((admin, index) => {
      const bnbAmount = (parseInt(admin.package.match(/\d+/)[0]) / 600).toFixed(4);
      console.log(`\n   ${index + 2}. ${admin.name}`);
      console.log(`      👤 Address: ${admin.address}`);
      console.log(`      📦 Package: ${admin.package}`);
      console.log(`      🔧 Function: register("${ROOT_ADMIN.address}", ${admin.level}, false)`);
      console.log(`      💰 Value: ~${bnbAmount} BNB`);
    });
    
    console.log(`\n🔗 Referral Link Testing:`);
    console.log(`   1. Test Root Admin referral links`);
    console.log(`   2. Verify frontend integration`);
    console.log(`   3. Test package-specific links`);
    console.log(`   4. Confirm commission flows`);
    
    console.log(`\n📈 User Acquisition:`);
    console.log(`   1. Distribute referral links`);
    console.log(`   2. Launch marketing campaigns`);
    console.log(`   3. Monitor network growth`);
    console.log(`   4. Track commission distributions`);
  }
}

async function main() {
  console.log('🚀 OrphiCrowdFund Network Bootstrap');
  console.log('═'.repeat(60));
  console.log(`🌐 Network: BSC Mainnet`);
  console.log(`📋 Contract: ${MAINNET_CONFIG.contractAddress}`);
  console.log('═'.repeat(60));

  const bootstrap = new NetworkBootstrap();
  
  // Step 1: Check current network status
  const status = await bootstrap.checkNetworkStatus();
  
  if (status.error) {
    console.error('❌ Cannot proceed due to network error');
    return;
  }
  
  if (status.needsBootstrap) {
    // Step 2: Generate bootstrap instructions
    const instructions = bootstrap.generateBootstrapInstructions();
    
    console.log('\n⏳ WAITING FOR ROOT ADMIN REGISTRATION...');
    console.log('   Please complete the registration using BSCScan interface');
    console.log('   Then run this script again to verify bootstrap');
    
  } else {
    // Network already bootstrapped, verify and show next steps
    const verification = await bootstrap.verifyBootstrap();
    
    if (verification.success) {
      bootstrap.generateNextSteps();
    }
  }
  
  console.log('\n═'.repeat(60));
  console.log('🎯 Bootstrap script complete');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NetworkBootstrap, MAINNET_CONFIG, ROOT_ADMIN }; 