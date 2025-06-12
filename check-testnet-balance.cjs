const ethers = require('ethers');

async function checkTestnetBalance() {
    try {
        console.log('🧪 Checking BSC Testnet Balance for Trezor Wallet');
        console.log('================================================');
        
        const TREZOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
        
        const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC);
        
        console.log(`Target Wallet: ${TREZOR_ADDRESS}`);
        console.log(`Network: BSC Testnet (Chain ID: 97)`);
        console.log('');
        
        // Get balance
        const balance = await provider.getBalance(TREZOR_ADDRESS);
        const balanceFormatted = ethers.formatEther(balance);
        
        console.log(`💰 Test BNB Balance: ${balanceFormatted} BNB`);
        
        if (parseFloat(balanceFormatted) === 0) {
            console.log('');
            console.log('❌ NO TEST BNB FOUND!');
            console.log('');
            console.log('🚰 Get test BNB from BSC Testnet faucet:');
            console.log('   https://testnet.binance.org/faucet-smart');
            console.log('');
            console.log('📝 Steps to get test BNB:');
            console.log('   1. Visit the faucet URL above');
            console.log('   2. Connect your Trezor wallet via MetaMask');
            console.log('   3. Request test BNB');
            console.log('   4. Wait for confirmation');
            console.log('   5. Run this script again to verify');
        } else if (parseFloat(balanceFormatted) < 0.01) {
            console.log('');
            console.log('⚠️  LOW TEST BNB BALANCE');
            console.log('   Consider getting more test BNB for gas fees');
            console.log('   Faucet: https://testnet.binance.org/faucet-smart');
        } else {
            console.log('');
            console.log('✅ SUFFICIENT TEST BNB FOR DEPLOYMENT!');
            console.log('   You can proceed with testnet deployment');
        }
        
        console.log('');
        console.log('🔗 BSC Testnet Explorer:');
        console.log(`   https://testnet.bscscan.com/address/${TREZOR_ADDRESS}`);
        
    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
    }
}

checkTestnetBalance();
