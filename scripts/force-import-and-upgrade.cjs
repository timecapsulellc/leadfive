const { ethers, upgrades } = require('hardhat');

async function forceImportAndUpgrade() {
    console.log('🔧 Force Import and Upgrade LeadFive to v1.0.0...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const deployerAddress = '0x140aad3E7c6bCC415Bc8E830699855fF072d405D';
    
    try {
        // Check deployer is owner
        const [deployer] = await ethers.getSigners();
        console.log(`Deployer: ${deployer.address}`);
        
        // First, try to force import the existing proxy
        console.log('📦 Force importing existing proxy...');
        const LeadFive = await ethers.getContractFactory('LeadFive');
        
        // Force import the existing proxy
        const existingProxy = await upgrades.forceImport(contractAddress, LeadFive);
        console.log(`✅ Proxy imported successfully: ${contractAddress}`);
        
        // Now upgrade to the new implementation
        console.log('\n🔄 Upgrading to LeadFive v1.0.0...');
        const upgraded = await upgrades.upgradeProxy(contractAddress, LeadFive);
        await upgraded.waitForDeployment();
        
        console.log('✅ Proxy upgraded successfully!');
        console.log(`Proxy address (unchanged): ${await upgraded.getAddress()}`);
        
        // Initialize production features
        console.log('\n🔧 Initializing production features...');
        try {
            const initTx = await upgraded.initializeProduction();
            await initTx.wait();
            console.log('✅ Production initialization complete!');
        } catch (error) {
            if (error.message.includes('Production already initialized')) {
                console.log('ℹ️  Production features already initialized');
            } else {
                console.log('⚠️  Error initializing production features:', error.message);
            }
        }
        
        // Verify the upgrade
        console.log('\n🔍 Verifying upgrade...');
        const version = await upgraded.getVersion();
        const totalUsers = await upgraded.getTotalUsers();
        const usdtDecimals = await upgraded.getUSDTDecimals();
        
        console.log(`Contract Version: ${version}`);
        console.log(`Total Users: ${totalUsers}`);
        console.log(`USDT Decimals: ${usdtDecimals}`);
        
        console.log('\n🎉 SUCCESS! LeadFive v1.0.0 deployed and ready!');
        console.log('');
        console.log('✅ Next Steps:');
        console.log('1. Run Step 3 to transfer ownership back to Trezor');
        console.log('2. Verify contract on BSCScan');
        console.log('3. Update frontend to use new contract features');
        
        return true;
        
    } catch (error) {
        console.error('❌ Force import and upgrade failed:', error.message);
        console.error('Full error:', error);
        return false;
    }
}

forceImportAndUpgrade()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
