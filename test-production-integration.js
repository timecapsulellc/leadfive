/**
 * Production Integration Test Script
 * Run this in the browser console to test production data integration
 */

(async function testProductionIntegration() {
  console.log('🚀 Testing LeadFive Production Data Integration...');
  console.log('=====================================\n');

  // Test 1: Check if global functions are available
  console.log('📋 Test 1: Global Functions Availability');
  console.log('getStatusMessage:', typeof window.getStatusMessage);
  console.log('getProductionStatus:', typeof window.getProductionStatus);
  console.log('resetToProduction:', typeof window.resetToProduction);
  
  if (typeof window.getStatusMessage === 'function') {
    console.log('✅ Global functions are available');
    console.log('Current Status:', window.getStatusMessage());
  } else {
    console.log('❌ Global functions not available - check imports');
    return;
  }

  console.log('\n');

  // Test 2: Check current production status
  console.log('📋 Test 2: Current Production Status');
  try {
    const status = window.getProductionStatus();
    console.log('Production Status:', status);
    
    if (status.isProduction) {
      console.log('✅ Already in production mode');
    } else {
      console.log('⚠️ Currently in demo mode');
    }
  } catch (error) {
    console.log('❌ Error getting production status:', error);
  }

  console.log('\n');

  // Test 3: Check wallet connectivity
  console.log('📋 Test 3: Wallet Connectivity');
  if (typeof window.ethereum !== 'undefined') {
    console.log('✅ Wallet provider detected');
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        console.log('✅ Wallet connected:', accounts[0]);
        
        // Test 4: Production reset (if wallet connected)
        console.log('\n📋 Test 4: Production Reset Simulation');
        console.log('⚠️ To actually reset to production, run:');
        console.log('const provider = new ethers.BrowserProvider(window.ethereum);');
        console.log('const signer = await provider.getSigner();');
        console.log('const userAddress = await signer.getAddress();');
        console.log('const result = await window.resetToProduction(provider, signer, userAddress);');
        console.log('console.log("Reset Result:", result);');
      } else {
        console.log('⚠️ Wallet not connected - connect wallet to test production reset');
      }
    } catch (error) {
      console.log('❌ Error checking wallet connection:', error);
    }
  } else {
    console.log('❌ No wallet provider found - install MetaMask or similar');
  }

  console.log('\n');

  // Test 5: Contract configuration
  console.log('📋 Test 5: Contract Configuration');
  try {
    // Check if contract config is available
    const contractConfig = window.LEAD_FIVE_CONFIG || 
                          JSON.parse(localStorage.getItem('leadfive_contract_config'));
    
    if (contractConfig) {
      console.log('✅ Contract configuration found');
      console.log('Contract Address:', contractConfig.address);
      console.log('Network:', contractConfig.network);
      console.log('Chain ID:', contractConfig.chainId);
    } else {
      console.log('⚠️ Contract configuration not found in window or localStorage');
      console.log('Contract should be at: 0x29dcCb502D10C042BcC6a02a7762C49595A9E498');
    }
  } catch (error) {
    console.log('❌ Error checking contract configuration:', error);
  }

  console.log('\n');

  // Test 6: Check demo vs production data sources
  console.log('📋 Test 6: Data Source Verification');
  
  // Check localStorage for demo flags
  const isDemoMode = localStorage.getItem('leadfive_production_mode') !== 'true';
  const lastReset = localStorage.getItem('leadfive_reset_timestamp');
  
  console.log('Demo Mode Active:', isDemoMode);
  console.log('Last Production Reset:', lastReset || 'Never');
  
  if (isDemoMode) {
    console.log('📊 Currently using demo/mock data');
    console.log('💡 Dashboard shows hardcoded values');
    console.log('💡 Genealogy shows sample tree structure');
    console.log('💡 Registration uses test transactions');
  } else {
    console.log('🔴 Production mode active - using real blockchain data');
  }

  console.log('\n');
  console.log('🎯 Test Summary:');
  console.log('- Global functions available:', typeof window.getStatusMessage === 'function' ? '✅' : '❌');
  console.log('- Wallet provider detected:', typeof window.ethereum !== 'undefined' ? '✅' : '❌');
  console.log('- Production mode active:', !isDemoMode ? '✅' : '⚠️ Demo Mode');
  console.log('- Ready for production reset:', 
              typeof window.ethereum !== 'undefined' && 
              typeof window.resetToProduction === 'function' ? '✅' : '❌');

  console.log('\n🚀 Production Integration Test Complete!');
})();