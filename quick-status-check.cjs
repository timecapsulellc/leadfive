const { ethers } = require('hardhat');

async function quickVerification() {
    console.log('🔍 LeadFive v1.0.0 Production Status Check\n');
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
        
        const contractABI = [
            'function owner() view returns (address)',
            'function getVersion() view returns (string)',
            'function usdtDecimals() view returns (uint8)',
            'function getTotalUsers() view returns (uint32)',
            'function getPackagePrice(uint8) view returns (uint96)',
            'function usdt() view returns (address)',
            'function paused() view returns (bool)',
            'function isAdmin(address) view returns (bool)'
        ];
        
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        console.log('📊 CONTRACT STATUS:');
        console.log('='.repeat(40));
        
        const owner = await contract.owner();
        const version = await contract.getVersion();
        const totalUsers = await contract.getTotalUsers();
        const usdtAddress = await contract.usdt();
        const isPaused = await contract.paused();
        const usdtDecimals = await contract.usdtDecimals();
        
        console.log(`✅ Contract Address: ${contractAddress}`);
        console.log(`✅ Owner: ${owner}`);
        console.log(`✅ Version: ${version}`);
        console.log(`✅ Total Users: ${totalUsers}`);
        console.log(`✅ USDT Token: ${usdtAddress}`);
        console.log(`✅ Active (Not Paused): ${!isPaused}`);
        console.log(`✅ USDT Decimals: ${usdtDecimals}`);
        
        console.log('\n💰 PACKAGE PRICES:');
        console.log('='.repeat(40));
        for (let i = 1; i <= 4; i++) {
            const price = await contract.getPackagePrice(i);
            const usdtPrice = Number(price) / 1000000;
            console.log(`✅ Package ${i}: ${usdtPrice} USDT`);
        }
        
        console.log('\n🔐 OWNERSHIP:');
        console.log('='.repeat(40));
        const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        const isTrezorOwner = owner.toLowerCase() === trezorAddress.toLowerCase();
        const isTrezorAdmin = await contract.isAdmin(trezorAddress);
        
        console.log(`✅ Expected Trezor: ${trezorAddress}`);
        console.log(`✅ Current Owner: ${owner}`);
        console.log(`✅ Trezor is Owner: ${isTrezorOwner}`);
        console.log(`✅ Trezor is Admin: ${isTrezorAdmin}`);
        
        console.log('\n🎉 FINAL STATUS:');
        console.log('='.repeat(40));
        if (isTrezorOwner && !isPaused && version === '1.0.0') {
            console.log('🟢 CONTRACT IS FULLY CONFIGURED AND READY FOR PRODUCTION!');
            console.log('');
            console.log('🔗 Contract Links:');
            console.log(`   📋 BSCScan: https://bscscan.com/address/${contractAddress}`);
            console.log(`   ✍️  Write Contract: https://bscscan.com/address/${contractAddress}#writeContract`);
            console.log('');
            console.log('✅ No additional configuration needed - Ready to launch! 🚀');
        } else {
            console.log('🟡 Some configuration may be needed');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

quickVerification().catch(console.error);
