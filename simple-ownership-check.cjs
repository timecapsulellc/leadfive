const { Web3 } = require('web3');

async function checkContractOwnership() {
    console.log('🔍 Checking Contract Ownership with Web3...');
    console.log('============================================================');
    
    try {
        // Connect to BSC Testnet
        const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');
        
        const contractAddress = '0xbad3e2bAEA016099149909CA5263eeFD78bD4aBf'; // OrphiCrowdFundComplete
        const trezorWallet = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        
        console.log(`📋 Contract Address: ${contractAddress}`);
        console.log(`🔐 Expected Owner (Trezor): ${trezorWallet}`);
        
        // Check if contract exists
        const code = await web3.eth.getCode(contractAddress);
        console.log(`📄 Contract Code Length: ${code.length} bytes`);
        
        if (code === '0x') {
            console.log('❌ No contract found at this address!');
            return;
        }
        
        // Standard owner() function call
        const ownerSignature = '0x8da5cb5b'; // owner() function signature
        
        try {
            const result = await web3.eth.call({
                to: contractAddress,
                data: ownerSignature
            });
            
            if (result && result !== '0x') {
                // Extract address from result (last 20 bytes)
                const ownerAddress = '0x' + result.slice(-40);
                console.log(`👤 Current Owner: ${ownerAddress}`);
                
                const isTrezorOwner = ownerAddress.toLowerCase() === trezorWallet.toLowerCase();
                const isCompromisedOwner = ownerAddress.toLowerCase() === compromisedWallet.toLowerCase();
                
                console.log(`✅ Is Trezor Owner: ${isTrezorOwner}`);
                console.log(`⚠️  Is Compromised Owner: ${isCompromisedOwner}`);
                
                if (isTrezorOwner) {
                    console.log('🎉 SUCCESS: Contract is owned by Trezor wallet!');
                    console.log('🔒 Security Status: SECURED');
                } else if (isCompromisedOwner) {
                    console.log('🚨 CRITICAL: Contract is owned by COMPROMISED wallet!');
                    console.log('🔓 Security Status: COMPROMISED - IMMEDIATE ACTION REQUIRED');
                } else {
                    console.log('⚠️  WARNING: Contract is owned by unknown wallet');
                    console.log('🔓 Security Status: UNKNOWN OWNER');
                }
            }
        } catch (ownerError) {
            console.log('ℹ️  Could not fetch owner using standard owner() call');
            console.log('ℹ️  This might be an upgradeable contract with different access patterns');
        }
        
        console.log('============================================================');
        
        // Additional network info
        const latestBlock = await web3.eth.getBlockNumber();
        console.log(`🔗 Latest Block: ${latestBlock}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkContractOwnership().catch(console.error);
