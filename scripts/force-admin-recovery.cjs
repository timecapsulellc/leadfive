const { ethers } = require('hardhat');

async function main() {
  console.log('🚨 EMERGENCY ADMIN RECOVERY PROCEDURE');
  console.log('='.repeat(60));
  
  const proxyAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
  const [deployer] = await ethers.getSigners();
  
  console.log(`📍 Proxy: ${proxyAddress}`);
  console.log(`🔑 Deployer: ${deployer.address}`);
  
  // Admin slot for ERC1967 proxies
  const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
  
  console.log('\n📊 Current admin slot:');
  const currentAdmin = await ethers.provider.getStorage(proxyAddress, ADMIN_SLOT);
  console.log(`Current: ${currentAdmin}`);
  
  // Method 1: Try using the contract's ownership to recover admin rights
  console.log('\n🔧 Method 1: Contract-based recovery...');
  try {
    const contract = await ethers.getContractAt('LeadFive', proxyAddress);
    
    // Check if we can add ourselves as admin through the contract
    const isAdmin = await contract.isAdmin(deployer.address);
    console.log(`Is deployer admin: ${isAdmin}`);
    
    if (isAdmin) {
      console.log('✅ We have admin rights through the contract');
      
      // Try to set USDT directly since we're admin
      const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
      console.log('🔧 Attempting to set USDT address...');
      
      const tx = await contract.setUSDTAddress(usdtAddress);
      console.log(`Transaction: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
      
      // Verify USDT was set
      const newUsdt = await contract.usdt();
      console.log(`New USDT address: ${newUsdt}`);
      
      if (newUsdt.toLowerCase() === usdtAddress.toLowerCase()) {
        console.log('🎉 SUCCESS! USDT address set correctly!');
        return;
      }
    }
    
  } catch (e) {
    console.log(`❌ Method 1 failed: ${e.message}`);
  }
  
  // Method 2: Direct storage manipulation (dangerous but necessary)
  console.log('\n🚨 Method 2: Direct storage manipulation...');
  try {
    // Set admin slot to our address
    const adminValue = '0x000000000000000000000000' + deployer.address.slice(2).toLowerCase();
    console.log(`Setting admin to: ${adminValue}`);
    
    // This would require a custom contract or assembly - not possible directly
    console.log('❌ Direct storage manipulation requires custom contract');
    
  } catch (e) {
    console.log(`❌ Method 2 failed: ${e.message}`);
  }
  
  // Method 3: Check if we can use UUPS upgrade mechanism directly
  console.log('\n🔄 Method 3: UUPS upgrade attempt...');
  try {
    const contract = await ethers.getContractAt('LeadFive', proxyAddress);
    
    // Try to call upgradeTo if it exists
    console.log('Checking for upgradeTo function...');
    
    // Get the ABI to see available functions
    const abi = contract.interface;
    const upgradeFunctions = abi.fragments.filter(f => 
      f.type === 'function' && 
      f.name.toLowerCase().includes('upgrade')
    );
    
    console.log('Available upgrade functions:');
    upgradeFunctions.forEach(f => {
      console.log(`  - ${f.name}`);
    });
    
  } catch (e) {
    console.log(`❌ Method 3 failed: ${e.message}`);
  }
  
  console.log('\n📋 RECOVERY ASSESSMENT COMPLETE');
  console.log('\nRECOMMENDATION: Deploy new proxy with proper initialization');
}

main().catch(console.error);
