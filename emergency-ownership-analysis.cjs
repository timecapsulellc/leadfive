const { ethers } = require('hardhat');

async function transferOwnership() {
    console.log('🚨 EMERGENCY OWNERSHIP TRANSFER TO TREZOR WALLET');
    console.log('============================================================');
    console.log('⚠️  Current Owner: 0x658C37b88d211EEFd9a684237a20D5268B4A2e72 (COMPROMISED)');
    console.log('🔐 New Owner: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29 (Trezor)');
    console.log('============================================================');
    
    try {
        // Use the configured provider
        const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
        
        const contractAddress = '0x2A5CDeEc5dF5AE5137AF46920b2B4C4Aa9b0aEA0';
        const newOwner = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        
        console.log('📋 Steps needed for ownership transfer:');
        console.log('1. Connect compromised wallet to initiate transfer');
        console.log('2. Call transferOwnership() function');
        console.log('3. Accept ownership with Trezor wallet');
        console.log('');
        console.log('⚠️  WARNING: This requires access to the compromised private key!');
        console.log('');
        console.log('🔄 Alternative approaches:');
        console.log('1. Deploy a new contract with Trezor ownership');
        console.log('2. Use emergency functions if available');
        console.log('3. Contact BSC support for emergency intervention');
        console.log('');
        
        // Check if contract has emergency functions
        const contractCode = await provider.getCode(contractAddress);
        console.log(`📄 Contract exists: ${contractCode !== '0x'}`);
        
        // Generate the transfer ownership call data
        const transferOwnershipSelector = '0xf2fde38b'; // transferOwnership(address)
        const paddedNewOwner = newOwner.slice(2).padStart(64, '0');
        const callData = transferOwnershipSelector + paddedNewOwner;
        
        console.log('🔧 Transfer Ownership Call Data:');
        console.log(`   Function: transferOwnership(address)`);
        console.log(`   To: ${contractAddress}`);
        console.log(`   Data: ${callData}`);
        console.log(`   New Owner: ${newOwner}`);
        
        console.log('============================================================');
        console.log('🎯 RECOMMENDATION: DEPLOY NEW SECURE CONTRACT');
        console.log('');
        console.log('Given the security compromise, the safest approach is to:');
        console.log('1. Deploy a new contract with Trezor ownership');
        console.log('2. Migrate users to the new contract');
        console.log('3. Abandon the compromised contract');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

transferOwnership().catch(console.error);
