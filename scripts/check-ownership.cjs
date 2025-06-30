const { ethers } = require('hardhat');

async function main() {
  const proxyAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
  
  console.log('🔍 CHECKING CONTRACT OWNERSHIP AND ADMIN RIGHTS');
  console.log('='.repeat(60));
  
  // Check basic contract ownership
  try {
    const contract = await ethers.getContractAt('LeadFive', proxyAddress);
    const owner = await contract.owner();
    console.log(`📋 Contract Owner: ${owner}`);
    
    const [deployer] = await ethers.getSigners();
    console.log(`📋 Current Signer: ${deployer.address}`);
    console.log(`📋 Is Signer Owner: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);
    
  } catch (e) {
    console.log(`❌ Failed to check owner: ${e.message}`);
  }
  
  // Check proxy admin slot
  console.log('\n🔧 CHECKING PROXY ADMIN SLOT');
  const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
  
  try {
    const adminSlot = await ethers.provider.getStorage(proxyAddress, ADMIN_SLOT);
    console.log(`📋 Admin Slot: ${adminSlot}`);
    
    if (adminSlot === '0x' + '0'.repeat(64)) {
      console.log('❌ CRITICAL: Admin slot is empty - no upgrade rights!');
    } else {
      const adminAddress = '0x' + adminSlot.slice(-40);
      console.log(`📋 Admin Address: ${adminAddress}`);
    }
  } catch (e) {
    console.log(`❌ Failed to check admin slot: ${e.message}`);
  }
  
  // Check implementation slot
  console.log('\n🏭 CHECKING IMPLEMENTATION SLOT');
  const IMPL_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
  
  try {
    const implSlot = await ethers.provider.getStorage(proxyAddress, IMPL_SLOT);
    console.log(`📋 Implementation Slot: ${implSlot}`);
    
    if (implSlot !== '0x' + '0'.repeat(64)) {
      const implAddress = '0x' + implSlot.slice(-40);
      console.log(`📋 Implementation Address: ${implAddress}`);
    }
  } catch (e) {
    console.log(`❌ Failed to check implementation slot: ${e.message}`);
  }
  
  // Check USDT configuration
  console.log('\n💰 CHECKING USDT CONFIGURATION');
  try {
    const contract = await ethers.getContractAt('LeadFive', proxyAddress);
    const usdt = await contract.usdt();
    const usdtDecimals = await contract.usdtDecimals();
    
    console.log(`📋 USDT Address: ${usdt}`);
    console.log(`📋 USDT Decimals: ${usdtDecimals}`);
    
    if (usdt === '0x0000000000000000000000000000000000000000') {
      console.log('❌ CRITICAL: USDT address is zero!');
    } else {
      console.log('✅ USDT address is set');
    }
    
  } catch (e) {
    console.log(`❌ Failed to check USDT: ${e.message}`);
  }
  
  console.log('\n📋 DIAGNOSIS COMPLETE');
}

main().catch(console.error);
