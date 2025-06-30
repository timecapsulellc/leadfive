const { ethers } = require('hardhat');

async function verifyProxyManually() {
    console.log('🔧 MANUAL PROXY VERIFICATION ON BSCSCAN');
    console.log('=====================================');
    
    const PROXY_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
    const IMPLEMENTATION_ADDRESS = '0xA4AB35Ab2BA415E6CCf9559e8dcAB0661cC29e2b';
    
    console.log(`Proxy: ${PROXY_ADDRESS}`);
    console.log(`Implementation: ${IMPLEMENTATION_ADDRESS}`);
    console.log('');
    
    console.log('📋 MANUAL VERIFICATION STEPS:');
    console.log('');
    console.log('1. Visit BSCScan proxy page:');
    console.log(`   https://bscscan.com/proxycontractverifier?a=${PROXY_ADDRESS}`);
    console.log('');
    console.log('2. Fill in the following details:');
    console.log('   - Contract Address:', PROXY_ADDRESS);
    console.log('   - Implementation Address:', IMPLEMENTATION_ADDRESS);
    console.log('   - Proxy Type: ERC1967 Proxy (UUPS)');
    console.log('');
    console.log('3. Or use the direct verification URL:');
    console.log(`   https://bscscan.com/verifyContract?a=${PROXY_ADDRESS}`);
    console.log('');
    console.log('4. Select "Please select Proxy Contract"');
    console.log('   - Choose "ERC1967 Proxy"');
    console.log('   - Enter Implementation Address:', IMPLEMENTATION_ADDRESS);
    console.log('');
    
    // Try alternative verification method
    console.log('🔄 ALTERNATIVE: Verify with constructor arguments');
    console.log('');
    
    // Get the proxy creation transaction to find constructor args
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    
    try {
        // Check if we can get creation transaction
        console.log('🔍 Checking proxy creation details...');
        
        // The proxy should have been created with initialize data
        // Let's get the implementation address from the proxy
        const implementationSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
        const implementationAddress = await provider.getStorage(PROXY_ADDRESS, implementationSlot);
        const cleanImplementation = '0x' + implementationAddress.slice(-40);
        
        console.log(`✅ Implementation from storage: ${cleanImplementation}`);
        
        if (cleanImplementation.toLowerCase() === IMPLEMENTATION_ADDRESS.toLowerCase()) {
            console.log('✅ Implementation address matches!');
        } else {
            console.log('⚠️  Implementation address mismatch');
        }
        
    } catch (error) {
        console.log('⚠️  Could not retrieve proxy details:', error.message);
    }
    
    console.log('');
    console.log('🎯 QUICK FIX OPTIONS:');
    console.log('');
    console.log('Option 1: Manual BSCScan Verification');
    console.log('- Go to: https://bscscan.com/proxycontractverifier');
    console.log('- Select "Verify Proxy Contract"');
    console.log('- Enter proxy address and implementation address');
    console.log('');
    console.log('Option 2: Re-verify with force flag');
    console.log('- Run: npx hardhat verify --force --network bsc', PROXY_ADDRESS);
    console.log('');
    console.log('Option 3: Submit to BSCScan support');
    console.log('- If manual verification fails, contact BSCScan support');
    console.log('- Provide both proxy and implementation addresses');
    console.log('');
    
    console.log('🔗 CURRENT STATUS:');
    console.log(`- Proxy: https://bscscan.com/address/${PROXY_ADDRESS}`);
    console.log(`- Implementation: https://bscscan.com/address/${IMPLEMENTATION_ADDRESS}`);
    console.log('- Implementation is verified ✅');
    console.log('- Proxy needs proper linking to show write functions');
}

verifyProxyManually().catch(console.error);
