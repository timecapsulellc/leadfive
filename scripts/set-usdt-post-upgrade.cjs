const { ethers } = require('hardhat');

async function setUSDTPostUpgrade() {
    try {
        console.log('🔧 POST-UPGRADE USDT CONFIGURATION');
        console.log('='.repeat(50));
        
        const proxyAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
        const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
        
        console.log(`📍 Proxy: ${proxyAddress}`);
        console.log(`💰 USDT: ${usdtAddress}`);
        
        // Get contract
        const contract = await ethers.getContractAt('LeadFive', proxyAddress);
        
        // Check current state
        console.log('\n📊 Current State:');
        const owner = await contract.owner();
        const currentUsdt = await contract.usdt();
        
        console.log(`Owner: ${owner}`);
        console.log(`Current USDT: ${currentUsdt}`);
        
        // Set USDT using emergencySetUSDT (which should work with BSC 18-decimal USDT)
        console.log('\n🔧 Setting USDT...');
        const tx = await contract.emergencySetUSDT(usdtAddress, {
            gasLimit: 100000
        });
        
        console.log(`Transaction: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
        
        // Verify
        const newUsdt = await contract.usdt();
        console.log(`✅ New USDT: ${newUsdt}`);
        
        if (newUsdt.toLowerCase() === usdtAddress.toLowerCase()) {
            console.log('🎉 USDT SET SUCCESSFULLY!');
        } else {
            console.log('❌ USDT still not set correctly');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

setUSDTPostUpgrade().catch(console.error);
