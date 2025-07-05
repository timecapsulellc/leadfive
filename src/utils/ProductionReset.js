/**
 * Production Reset Utility
 * Resets all demo data and initializes production blockchain integration
 * Version: 1.0 - Production Ready
 */

import { productionDataService } from '../services/ProductionDataService.js';
import { realTimeGenealogyService } from '../services/RealTimeGenealogyService.js';
import { productionRegistrationService } from '../services/ProductionRegistrationService.js';
import { LEAD_FIVE_CONFIG } from '../contracts-leadfive.js';

class ProductionReset {
  constructor() {
    this.resetLog = [];
    this.isProduction = false;
  }

  // Main reset function - call this to switch to production
  async resetToProduction(provider, signer, userAddress) {
    try {
      console.log('🔄 STARTING PRODUCTION RESET...');
      this.log('🚀 Initializing LeadFive Production Environment');
      this.log(`📍 Contract Address: ${LEAD_FIVE_CONFIG.address}`);
      this.log(`👤 User Address: ${userAddress}`);
      this.log(`🌐 Network: ${LEAD_FIVE_CONFIG.network}`);
      
      // Step 1: Initialize all production services
      await this.initializeProductionServices(provider, signer);
      
      // Step 2: Clear all cached demo data
      await this.clearDemoData();
      
      // Step 3: Verify blockchain connectivity
      await this.verifyBlockchainConnection(userAddress);
      
      // Step 4: Setup real-time event monitoring
      await this.setupEventMonitoring(userAddress);
      
      // Step 5: Generate production report
      const report = await this.generateProductionReport(userAddress);
      
      this.isProduction = true;
      this.log('✅ PRODUCTION RESET COMPLETE!');
      
      return {
        success: true,
        isProduction: true,
        report,
        resetLog: this.resetLog,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Production reset failed:', error);
      this.log(`❌ Reset failed: ${error.message}`);
      
      return {
        success: false,
        isProduction: false,
        error: error.message,
        resetLog: this.resetLog,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Initialize all production services
  async initializeProductionServices(provider, signer) {
    this.log('🔧 Initializing Production Services...');
    
    try {
      // Initialize Production Data Service
      const dataServiceInit = await productionDataService.initialize(provider, signer);
      if (dataServiceInit) {
        this.log('✅ Production Data Service initialized');
      } else {
        throw new Error('Failed to initialize Production Data Service');
      }
      
      // Initialize Real-Time Genealogy Service
      const genealogyServiceInit = await realTimeGenealogyService.initialize(provider);
      if (genealogyServiceInit) {
        this.log('✅ Real-Time Genealogy Service initialized');
      } else {
        throw new Error('Failed to initialize Genealogy Service');
      }
      
      // Initialize Production Registration Service
      const registrationServiceInit = await productionRegistrationService.initialize(provider, signer);
      if (registrationServiceInit) {
        this.log('✅ Production Registration Service initialized');
      } else {
        throw new Error('Failed to initialize Registration Service');
      }
      
      this.log('🎯 All production services initialized successfully');
    } catch (error) {
      this.log(`❌ Service initialization failed: ${error.message}`);
      throw error;
    }
  }

  // Clear all demo/mock data from localStorage and caches
  async clearDemoData() {
    this.log('🧹 Clearing demo data and caches...');
    
    try {
      // Clear localStorage
      const keysToRemove = [
        'leadfive_demo_data',
        'leadfive_mock_earnings',
        'leadfive_test_users',
        'leadfive_fake_genealogy',
        'dashboard_cache',
        'referral_cache',
        'earnings_cache',
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          this.log(`🗑️ Removed ${key} from localStorage`);
        }
      });
      
      // Clear service caches
      if (realTimeGenealogyService.cache) {
        realTimeGenealogyService.cache.clear();
        this.log('🗑️ Cleared genealogy service cache');
      }
      
      // Set production flags
      localStorage.setItem('leadfive_production_mode', 'true');
      localStorage.setItem('leadfive_reset_timestamp', new Date().toISOString());
      
      this.log('✅ Demo data cleared successfully');
    } catch (error) {
      this.log(`⚠️ Error clearing demo data: ${error.message}`);
    }
  }

  // Verify blockchain connection and contract functionality
  async verifyBlockchainConnection(userAddress) {
    this.log('🔗 Verifying blockchain connection...');
    
    try {
      // Check if user is registered
      const isRegistered = await productionRegistrationService.isUserRegistered(userAddress);
      this.log(`👤 User registration status: ${isRegistered ? 'REGISTERED' : 'NOT REGISTERED'}`);
      
      // Get user balances
      const balances = await productionRegistrationService.getUserBalances(userAddress);
      this.log(`💰 USDT Balance: ${balances.usdtFormatted} USDT`);
      this.log(`⚡ BNB Balance: ${balances.bnbFormatted} BNB`);
      
      // Get total users from contract
      const totalUsers = await productionDataService.getTotalUsers();
      this.log(`👥 Total registered users: ${totalUsers}`);
      
      // Get pool balances
      const poolBalances = await productionDataService.getPoolBalances();
      this.log(`🏊 Help Pool: ${poolBalances.helpPool.toFixed(2)} USDT`);
      this.log(`🏆 Leader Pool: ${poolBalances.leaderPool.toFixed(2)} USDT`);
      
      // Test package prices
      const packages = await productionRegistrationService.getPackagePrices();
      this.log(`📦 Available packages: ${packages.length}`);
      packages.forEach(pkg => {
        this.log(`  • Level ${pkg.level}: $${pkg.price} (Max: $${pkg.maxEarnings})`);
      });
      
      this.log('✅ Blockchain connection verified');
    } catch (error) {
      this.log(`❌ Blockchain verification failed: ${error.message}`);
      throw new Error(`Blockchain connection failed: ${error.message}`);
    }
  }

  // Setup real-time event monitoring
  async setupEventMonitoring(userAddress) {
    this.log('📡 Setting up real-time event monitoring...');
    
    try {
      // Setup production data service events
      productionDataService.setupEventListeners((eventType, data) => {
        console.log('🔴 Live Blockchain Event:', eventType, data);
        this.log(`📡 Event: ${eventType} - ${JSON.stringify(data)}`);
        
        // Trigger UI updates based on events
        if (eventType === 'user_registered') {
          this.handleUserRegistered(data);
        } else if (eventType === 'bonus_distributed') {
          this.handleBonusDistributed(data);
        } else if (eventType === 'withdrawal') {
          this.handleWithdrawal(data);
        }
      });
      
      // Setup genealogy tree monitoring
      realTimeGenealogyService.subscribeToTreeUpdates(userAddress, (eventType, data) => {
        console.log('🌳 Genealogy Event:', eventType, data);
        this.log(`🌳 Tree update: ${eventType}`);
      });
      
      this.log('✅ Real-time monitoring activated');
    } catch (error) {
      this.log(`⚠️ Event monitoring setup failed: ${error.message}`);
    }
  }

  // Generate comprehensive production report
  async generateProductionReport(userAddress) {
    this.log('📊 Generating production report...');
    
    try {
      const report = {
        timestamp: new Date().toISOString(),
        userAddress,
        contract: {
          address: LEAD_FIVE_CONFIG.address,
          network: LEAD_FIVE_CONFIG.network,
          chainId: LEAD_FIVE_CONFIG.chainId,
        },
        services: {
          productionDataService: productionDataService.isInitialized,
          genealogyService: realTimeGenealogyService.isInitialized,
          registrationService: productionRegistrationService.isInitialized,
        },
        user: null,
        blockchain: null,
      };
      
      // Get user data
      try {
        const userData = await productionDataService.getRealUserData(userAddress);
        report.user = {
          isRegistered: userData.isRegistered || false,
          packageLevel: userData.packageLevel || 0,
          totalEarnings: userData.totalEarnings || 0,
          directReferrals: userData.directReferrals || 0,
          teamSize: userData.teamSize || 0,
          isLiveData: userData.isLiveData || false,
        };
        this.log(`👤 User data: ${userData.isLiveData ? 'LIVE' : 'FALLBACK'}`);
      } catch (error) {
        this.log(`⚠️ Could not fetch user data: ${error.message}`);
        report.user = { error: error.message };
      }
      
      // Get blockchain data
      try {
        const [totalUsers, poolBalances, packages] = await Promise.all([
          productionDataService.getTotalUsers(),
          productionDataService.getPoolBalances(),
          productionRegistrationService.getPackagePrices(),
        ]);
        
        report.blockchain = {
          totalUsers,
          poolBalances,
          availablePackages: packages.length,
          lastUpdated: new Date().toISOString(),
        };
        
        this.log(`🌐 Blockchain data: ${totalUsers} users, ${packages.length} packages`);
      } catch (error) {
        this.log(`⚠️ Could not fetch blockchain data: ${error.message}`);
        report.blockchain = { error: error.message };
      }
      
      this.log('📊 Production report generated');
      return report;
    } catch (error) {
      this.log(`❌ Report generation failed: ${error.message}`);
      return { error: error.message, timestamp: new Date().toISOString() };
    }
  }

  // Event handlers
  handleUserRegistered(data) {
    this.log(`👥 New user registered: ${data.user} via ${data.referrer}`);
    // Refresh genealogy tree
    window.dispatchEvent(new CustomEvent('leadfive_user_registered', { detail: data }));
  }

  handleBonusDistributed(data) {
    this.log(`💰 Bonus distributed: ${data.amount} to ${data.recipient}`);
    // Refresh earnings data
    window.dispatchEvent(new CustomEvent('leadfive_bonus_distributed', { detail: data }));
  }

  handleWithdrawal(data) {
    this.log(`💸 Withdrawal: ${data.amount} by ${data.user}`);
    // Refresh balance data
    window.dispatchEvent(new CustomEvent('leadfive_withdrawal', { detail: data }));
  }

  // Utility functions
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.resetLog.push(logEntry);
    console.log(logEntry);
  }

  // Get current production status
  getProductionStatus() {
    return {
      isProduction: this.isProduction,
      servicesInitialized: {
        dataService: productionDataService.isInitialized,
        genealogyService: realTimeGenealogyService.isInitialized,
        registrationService: productionRegistrationService.isInitialized,
      },
      resetLog: this.resetLog,
      lastReset: localStorage.getItem('leadfive_reset_timestamp'),
    };
  }

  // Check if already in production mode
  isInProductionMode() {
    return localStorage.getItem('leadfive_production_mode') === 'true';
  }

  // Force reset (for testing)
  async forceReset() {
    this.isProduction = false;
    this.resetLog = [];
    localStorage.removeItem('leadfive_production_mode');
    localStorage.removeItem('leadfive_reset_timestamp');
    
    // Cleanup services
    realTimeGenealogyService.cleanup();
    
    this.log('🔄 Force reset completed');
  }

  // Display user-friendly status
  getStatusMessage() {
    if (this.isProduction) {
      return '✅ PRODUCTION MODE ACTIVE - Using real blockchain data';
    } else if (this.isInProductionMode()) {
      return '⚡ PRODUCTION MODE ENABLED - Services initializing...';
    } else {
      return '⚠️ DEMO MODE - Using mock data. Call resetToProduction() to use real data.';
    }
  }
}

// Export singleton instance
export const productionReset = new ProductionReset();
export default productionReset;

// Convenient global function for easy access
window.resetToProduction = async (provider, signer, userAddress) => {
  return await productionReset.resetToProduction(provider, signer, userAddress);
};

window.getProductionStatus = () => {
  return productionReset.getProductionStatus();
};

window.getStatusMessage = () => {
  return productionReset.getStatusMessage();
};
