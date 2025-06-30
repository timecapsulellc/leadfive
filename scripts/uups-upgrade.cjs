const { ethers } = require('hardhat');

async function main() {
  console.log('🔄 UUPS UPGRADE USING upgradeToAndCall');
  console.log('='.repeat(60));
  
  const proxyAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
  const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
  
  console.log(`📍 Proxy: ${proxyAddress}`);
  console.log(`💰 USDT: ${usdtAddress}`);
  
  // Deploy new implementation
  console.log('\n🏭 Step 1: Deploy fresh implementation...');
  const LeadFive = await ethers.getContractFactory('LeadFive');
  const newImpl = await LeadFive.deploy();
  await newImpl.waitForDeployment();
  
  const newImplAddress = await newImpl.getAddress();
  console.log(`✅ New implementation deployed: ${newImplAddress}`);
  
  // Get contract interface for proxy
  const contract = await ethers.getContractAt('LeadFive', proxyAddress);
  
  // Perform upgrade without call first
  console.log('\n⬆️ Step 2: Executing simple upgradeTo...');
  try {
    // Try simple upgrade first
    const tx = await contract.upgradeTo(newImplAddress, {
      gasLimit: 200000
    });
    
    console.log(`📄 Transaction: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed}`);
    
    // Verify upgrade
    console.log('\n✅ Step 3: Verifying upgrade...');
    const currentImpl = await ethers.provider.getStorage(
      proxyAddress, 
      '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    );
    const currentImplAddress = '0x' + currentImpl.slice(-40);
    console.log(`Current implementation: ${currentImplAddress}`);
    
    if (currentImplAddress.toLowerCase() === newImplAddress.toLowerCase()) {
      console.log('🎉 Implementation upgrade successful!');
      
      // Now try to set USDT with the new implementation
      console.log('\n🔧 Step 4: Setting USDT with new implementation...');
      
      // Get contract with new ABI
      const upgradedContract = await ethers.getContractAt('LeadFive', proxyAddress);
      
      // Try postUpgrade function
      try {
        const postTx = await upgradedContract.postUpgrade(usdtAddress);
        console.log(`PostUpgrade transaction: ${postTx.hash}`);
        await postTx.wait();
        console.log('✅ PostUpgrade completed');
      } catch (e) {
        console.log(`PostUpgrade failed: ${e.message}`);
        
        // Try regular setUSDTAddress
        try {
          const setTx = await upgradedContract.setUSDTAddress(usdtAddress);
          console.log(`SetUSDT transaction: ${setTx.hash}`);
          await setTx.wait();
          console.log('✅ SetUSDT completed');
        } catch (e2) {
          console.log(`SetUSDT also failed: ${e2.message}`);
        }
      }
      
      // Check final USDT
      const usdt = await upgradedContract.usdt();
      console.log(`Final USDT address: ${usdt}`);
      
      if (usdt.toLowerCase() === usdtAddress.toLowerCase()) {
        console.log('🎉 USDT address set successfully!');
      } else {
        console.log('❌ USDT address still not set');
      }
      
    } else {
      console.log('❌ Implementation not updated');
    }
    
  } catch (error) {
    console.error('❌ upgradeToAndCall failed:', error.message);
    
    // Fallback: Try simple upgrade without call
    console.log('\n🔄 Fallback: Trying simple upgrade...');
    try {
      // Check if upgradeTo exists
      const tx2 = await contract.upgradeTo(newImplAddress, {
        gasLimit: 200000
      });
      
      console.log(`📄 Fallback transaction: ${tx2.hash}`);
      await tx2.wait();
      console.log('✅ Simple upgrade completed');
      
    } catch (e2) {
      console.log(`❌ Simple upgrade also failed: ${e2.message}`);
    }
  }
  
  console.log('\n📋 UPGRADE ATTEMPT COMPLETE');
}

main().catch(console.error);
