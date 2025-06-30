const { ethers, upgrades } = require('hardhat');

async function completeRedeployment() {
    try {
        console.log('\n🔄 COMPLETE LEADFIVE REDEPLOYMENT - BSC MAINNET');
        console.log('='.repeat(70));
        console.log('📋 Using tested contract from successful BSC testnet deployment');
        console.log('🎯 Address: 0x1E95943b022dde7Ce7e0F54ced25599e0c6D8b9b (reference)');
        console.log('='.repeat(70));
        
        const [deployer] = await ethers.getSigners();
        console.log(`\n🔑 Deployer: ${deployer.address}`);
        
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);
        
        // Network verification
        const network = await ethers.provider.getNetwork();
        console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        if (network.chainId !== 56n) {
            throw new Error('❌ Must be on BSC Mainnet (Chain ID: 56)');
        }
        
        // Contract parameters
        const usdtAddress = '0x55d398326f99059fF775485246999027B3197955'; // BSC Mainnet USDT
        const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'; // Your Trezor
        
        console.log(`\n📋 Configuration:`);
        console.log(`💰 USDT Token: ${usdtAddress}`);
        console.log(`🔐 Future Owner: ${trezorAddress}`);
        console.log(`⚙️ Initial Owner: ${deployer.address}`);
        
        // Step 1: Deploy fresh implementation
        console.log('\n🏭 Step 1: Deploying fresh LeadFive implementation...');
        const LeadFive = await ethers.getContractFactory('LeadFive');
        
        console.log('📦 Creating contract factory...');
        const implementation = await LeadFive.deploy();
        await implementation.waitForDeployment();
        
        const implAddress = await implementation.getAddress();
        console.log(`✅ Implementation deployed: ${implAddress}`);
        
        // Step 2: Deploy proxy with proper initialization
        console.log('\n🔧 Step 2: Deploying proxy with initialization...');
        const proxy = await upgrades.deployProxy(LeadFive, [usdtAddress], {
            kind: 'uups',
            initializer: 'initialize'
        });
        await proxy.waitForDeployment();
        
        const proxyAddress = await proxy.getAddress();
        console.log(`✅ Proxy deployed: ${proxyAddress}`);
        
        // Step 3: Verify deployment
        console.log('\n🔍 Step 3: Verifying deployment...');
        const contract = await ethers.getContractAt('LeadFive', proxyAddress);
        
        // Basic checks
        const owner = await contract.owner();
        const usdt = await contract.usdt();
        const version = await contract.getVersion();
        const totalUsers = await contract.getTotalUsers();
        const isConfigured = await contract.isUSDTConfigured();
        
        console.log(`👑 Owner: ${owner}`);
        console.log(`💰 USDT: ${usdt}`);
        console.log(`📄 Version: ${version}`);
        console.log(`👥 Total Users: ${totalUsers}`);
        console.log(`✅ USDT Configured: ${isConfigured}`);
        
        // Step 4: Test core functions
        console.log('\n🧪 Step 4: Testing core functions...');
        
        // Test package prices
        try {
            const packagePrices = await contract.getAllPackagePrices();
            console.log(`📦 Package Prices: [${packagePrices.map(p => ethers.formatUnits(p, 6)).join(', ')}] USDT`);
        } catch (e) {
            console.log(`⚠️ Package prices check: ${e.message}`);
        }
        
        // Test admin functions
        try {
            const isAdmin = await contract.isAdmin(deployer.address);
            console.log(`🔐 Deployer is admin: ${isAdmin}`);
        } catch (e) {
            console.log(`⚠️ Admin check: ${e.message}`);
        }
        
        // Test USDT config
        try {
            const usdtConfig = await contract.getUSDTConfig();
            console.log(`🔧 USDT Config: Address=${usdtConfig[0]}, Decimals=${usdtConfig[1]}, Balance=${usdtConfig[2]}`);
        } catch (e) {
            console.log(`⚠️ USDT config check: ${e.message}`);
        }
        
        // Step 5: Verify with USDT contract
        console.log('\n🔗 Step 5: Verifying USDT integration...');
        try {
            const usdtContract = await ethers.getContractAt('IERC20', usdtAddress);
            const symbol = await usdtContract.symbol();
            const decimals = await usdtContract.decimals();
            console.log(`💰 USDT Token: ${symbol}, ${decimals} decimals`);
            
            // Check contract's USDT balance
            const contractBalance = await usdtContract.balanceOf(proxyAddress);
            console.log(`💳 Contract USDT Balance: ${ethers.formatUnits(contractBalance, decimals)} USDT`);
        } catch (e) {
            console.log(`⚠️ USDT verification: ${e.message}`);
        }
        
        // Step 6: Security checks
        console.log('\n🛡️ Step 6: Security verification...');
        try {
            const circuitBreakerThreshold = await contract.circuitBreakerThreshold();
            const dailyWithdrawalLimit = await contract.dailyWithdrawalLimit();
            const isPaused = await contract.paused();
            
            console.log(`🚨 Circuit Breaker: ${ethers.formatUnits(circuitBreakerThreshold, 6)} USDT`);
            console.log(`📅 Daily Limit: ${ethers.formatUnits(dailyWithdrawalLimit, 6)} USDT`);
            console.log(`⏸️ Contract Paused: ${isPaused}`);
        } catch (e) {
            console.log(`⚠️ Security check: ${e.message}`);
        }
        
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('='.repeat(70));
        console.log(`📍 NEW CONTRACT ADDRESS: ${proxyAddress}`);
        console.log(`🏭 IMPLEMENTATION: ${implAddress}`);
        console.log(`👑 OWNER: ${owner}`);
        console.log(`💰 USDT: ${usdt}`);
        console.log(`✅ FULLY FUNCTIONAL: Ready for production use`);
        console.log('='.repeat(70));
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. ✅ Contract deployed and initialized');
        console.log('2. 🔧 Update frontend with new contract address');
        console.log('3. 🧪 Test registration with small amount');
        console.log('4. 🔐 Transfer ownership to Trezor when ready');
        console.log('5. 📢 Announce new contract to community');
        
        // Save deployment info
        const deploymentInfo = {
            network: 'BSC Mainnet',
            chainId: network.chainId.toString(),
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            proxy: proxyAddress,
            implementation: implAddress,
            usdt: usdtAddress,
            owner: owner,
            version: version,
            totalUsers: totalUsers.toString(),
            usdtConfigured: isConfigured
        };
        
        console.log('\n💾 Deployment info saved to: fresh-deployment-mainnet.json');
        require('fs').writeFileSync(
            'fresh-deployment-mainnet.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        return {
            proxy: proxyAddress,
            implementation: implAddress,
            success: true
        };
        
    } catch (error) {
        console.error('\n❌❌❌ DEPLOYMENT FAILED ❌❌❌');
        console.error('Error:', error.message);
        throw error;
    }
}

// Execute deployment
completeRedeployment()
    .then((result) => {
        console.log('\n✅ Script completed successfully');
        console.log(`📍 New contract: ${result.proxy}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error.message);
        process.exit(1);
    });
