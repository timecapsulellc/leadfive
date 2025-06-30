const { ethers } = require('hardhat');

async function initializeProduction() {
    console.log('🔧 Manually Initializing Production Features...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    
    try {
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const contract = LeadFive.attach(contractAddress);
        
        // Check current USDT decimals
        try {
            const currentDecimals = await contract.getUSDTDecimals();
            console.log(`Current USDT Decimals: ${currentDecimals}`);
            if (currentDecimals > 0) {
                console.log('✅ Production features already initialized!');
                return;
            }
        } catch (error) {
            console.log('USDT Decimals not set, proceeding with initialization...');
        }
        
        // Initialize production features
        console.log('🔄 Calling initializeProduction()...');
        const initTx = await contract.initializeProduction();
        console.log(`Transaction hash: ${initTx.hash}`);
        
        console.log('⏳ Waiting for confirmation...');
        const receipt = await initTx.wait();
        console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
        
        // Verify initialization
        const usdtDecimals = await contract.getUSDTDecimals();
        const version = await contract.getVersion();
        
        console.log('\n📋 Production Features Initialized:');
        console.log(`USDT Decimals: ${usdtDecimals}`);
        console.log(`Contract Version: ${version}`);
        
        console.log('\n🎉 SUCCESS! Production initialization complete!');
        
    } catch (error) {
        if (error.message.includes('Production already initialized')) {
            console.log('✅ Production features already initialized!');
        } else {
            console.error('❌ Initialization failed:', error.message);
        }
    }
}

initializeProduction()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
