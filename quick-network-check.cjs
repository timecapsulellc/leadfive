const { ethers } = require('hardhat');

async function quickNetworkCheck() {
    console.log('🔍 QUICK NETWORK & CONTRACT CHECK');
    console.log('=' .repeat(40));
    
    const network = await ethers.provider.getNetwork();
    console.log('🌐 Network:', network.name, '- Chain ID:', network.chainId.toString());
    
    const MAINNET_CONTRACT = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
    console.log('🔗 Contract:', MAINNET_CONTRACT);
    
    // Check if contract exists
    const code = await ethers.provider.getCode(MAINNET_CONTRACT);
    console.log('📦 Contract Code Length:', code.length);
    console.log('✅ Contract Exists:', code !== '0x' ? 'YES' : 'NO');
    
    if (code === '0x') {
        console.log('❌ CONTRACT NOT FOUND ON THIS NETWORK');
        console.log('💡 Make sure you are on BSC Mainnet (Chain ID: 56)');
        console.log('📋 Current network chain ID:', network.chainId.toString());
        
        if (network.chainId.toString() !== '56') {
            console.log('🔧 SOLUTION: Switch to BSC Mainnet in hardhat.config.js');
        }
    } else {
        console.log('✅ Contract exists, checking proxy info...');
        
        // Get implementation slot for UUPS proxy
        const implSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
        const impl = await ethers.provider.getStorageAt(MAINNET_CONTRACT, implSlot);
        console.log('📦 Implementation:', impl);
        
        const zeroHash = '0x' + '0'.repeat(64);
        console.log('🔄 Is Proxy:', impl !== zeroHash ? 'YES' : 'NO');
        
        if (impl !== zeroHash) {
            console.log('✅ UUPS Proxy confirmed - contract is upgradeable');
        } else {
            console.log('⚠️  Not a UUPS proxy or different proxy pattern');
        }
    }
    
    return {
        network: network.name,
        chainId: network.chainId.toString(),
        contractExists: code !== '0x',
        contractAddress: MAINNET_CONTRACT
    };
}

if (require.main === module) {
    quickNetworkCheck()
        .then((result) => {
            console.log('\n📊 NETWORK CHECK COMPLETE');
            console.log('Network:', result.network);
            console.log('Chain ID:', result.chainId);
            console.log('Contract Exists:', result.contractExists);
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Network check failed:', error);
            process.exit(1);
        });
}

module.exports = quickNetworkCheck;