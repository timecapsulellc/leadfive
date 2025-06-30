const { ethers } = require('hardhat');

async function verifyDeployment() {
    try {
        console.log('\n🔍 VERIFYING FRESH DEPLOYMENT');
        console.log('='.repeat(50));
        
        const proxyAddress = '0x8BCB6bb3C1a688aB5b16b974824B47AD5B6820df';
        const implAddress = '0x1D1e3229fc238e41100fBBA9696967D2A38C4e74';
        
        console.log(`📍 Proxy: ${proxyAddress}`);
        console.log(`🏭 Implementation: ${implAddress}`);
        
        const [deployer] = await ethers.getSigners();
        console.log(`🔑 Deployer: ${deployer.address}`);
        
        // Get contract instance
        const contract = await ethers.getContractAt('LeadFive', proxyAddress);
        
        // Basic checks with error handling
        console.log('\n🧪 Testing basic functions...');
        
        try {
            const owner = await contract.owner();
            console.log(`👑 Owner: ${owner}`);
        } catch (e) {
            console.log(`❌ Owner check failed: ${e.message}`);
        }
        
        try {
            const usdt = await contract.usdt();
            console.log(`💰 USDT: ${usdt}`);
        } catch (e) {
            console.log(`❌ USDT check failed: ${e.message}`);
        }
        
        try {
            const version = await contract.getVersion();
            console.log(`📄 Version: ${version}`);
        } catch (e) {
            console.log(`❌ Version check failed: ${e.message}`);
        }
        
        try {
            const totalUsers = await contract.getTotalUsers();
            console.log(`👥 Total Users: ${totalUsers}`);
        } catch (e) {
            console.log(`❌ Total users check failed: ${e.message}`);
        }
        
        try {
            const paused = await contract.paused();
            console.log(`⏸️ Paused: ${paused}`);
        } catch (e) {
            console.log(`❌ Paused check failed: ${e.message}`);
        }
        
        // Test USDT configuration
        console.log('\n💰 USDT Configuration...');
        try {
            const isConfigured = await contract.isUSDTConfigured();
            console.log(`✅ USDT Configured: ${isConfigured}`);
        } catch (e) {
            console.log(`❌ USDT configured check failed: ${e.message}`);
        }
        
        // Test package prices
        console.log('\n📦 Package Information...');
        try {
            const packagePrices = await contract.getAllPackagePrices();
            console.log(`📦 Package Prices: [${packagePrices.map(p => ethers.formatUnits(p, 6)).join(', ')}] USDT`);
        } catch (e) {
            console.log(`❌ Package prices check failed: ${e.message}`);
        }
        
        // Check USDT contract directly
        console.log('\n🔗 USDT Contract Verification...');
        const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
        try {
            const usdtContract = await ethers.getContractAt('IERC20', usdtAddress);
            const symbol = await usdtContract.symbol();
            const decimals = await usdtContract.decimals();
            console.log(`💰 USDT Token: ${symbol}, ${decimals} decimals`);
            
            const contractBalance = await usdtContract.balanceOf(proxyAddress);
            console.log(`💳 Contract USDT Balance: ${ethers.formatUnits(contractBalance, decimals)} USDT`);
        } catch (e) {
            console.log(`❌ USDT contract check failed: ${e.message}`);
        }
        
        console.log('\n✅ Verification complete!');
        
    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
    }
}

verifyDeployment()
    .then(() => {
        console.log('\n✅ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error.message);
        process.exit(1);
    });
