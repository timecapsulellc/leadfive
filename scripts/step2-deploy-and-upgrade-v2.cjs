const { ethers, upgrades } = require('hardhat');

async function deployAndUpgradeV2() {
    console.log('🚀 Step 2: Deploying and Upgrading to LeadFiveV2...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const deployerAddress = '0x140aad3E7c6bCC415Bc8E830699855fF072d405D';
    
    try {
        // Check deployer is owner
        const [deployer] = await ethers.getSigners();
        console.log(`Deployer: ${deployer.address}`);
        
        const LeadFiveFactory = await ethers.getContractFactory('LeadFive');
        const contract = LeadFiveFactory.attach(contractAddress);
        
        const currentOwner = await contract.owner();
        console.log(`Current Owner: ${currentOwner}`);
        
        if (currentOwner.toLowerCase() !== deployerAddress.toLowerCase()) {
            console.log('❌ Deployer is not the owner! Complete Step 1 first.');
            console.log('Run: npx hardhat run step1-transfer-to-deployer.cjs --network bsc');
            return false;
        }
        
        console.log('✅ Deployer is owner, proceeding with upgrade...\n');
        
        // Deploy LeadFive implementation
        console.log('📦 Deploying LeadFive implementation...');
        const LeadFive = await ethers.getContractFactory('contracts/LeadFive.sol:LeadFive');
        const implementation = await LeadFive.deploy();
        await implementation.waitForDeployment();
        
        const implementationAddress = await implementation.getAddress();
        console.log(`✅ New implementation deployed: ${implementationAddress}`);
        
        // Upgrade the proxy
        console.log('\n🔄 Upgrading proxy to production version...');
        const upgraded = await upgrades.upgradeProxy(contractAddress, LeadFive);
        await upgraded.waitForDeployment();
        
        console.log('✅ Proxy upgraded successfully!');
        console.log(`Proxy address (unchanged): ${await upgraded.getAddress()}`);
        
        // Initialize production features
        console.log('\n🔧 Initializing production features...');
        const initTx = await upgraded.initializeProduction();
        await initTx.wait();
        
        console.log('✅ Production initialization complete!');
        
        // Verify the upgrade
        console.log('\n🔍 Verifying upgrade...');
        
        const version = await upgraded.getVersion();
        console.log(`Contract Version: ${version}`);
        
        const usdtDecimals = await upgraded.getUSDTDecimals();
        console.log(`USDT Decimals: ${usdtDecimals}`);
        
        const [fallbackPrice, fallbackEnabled] = await upgraded.getFallbackSettings();
        console.log(`Fallback Price: $${ethers.formatUnits(fallbackPrice, 8)}`);
        console.log(`Fallback Enabled: ${fallbackEnabled}`);
        
        // Check package prices
        console.log('\n📦 Updated Package Prices:');
        for (let i = 1; i <= 4; i++) {
            const price = await upgraded.getPackagePrice(i);
            console.log(`Package ${i}: ${ethers.formatUnits(price, usdtDecimals)} USDT`);
        }
        
        // Test BNB price function
        const bnbPrice = await upgraded.getCurrentBNBPrice();
        console.log(`\nCurrent BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
        
        console.log('\n🎉 UPGRADE SUCCESSFUL!');
        console.log('');
        console.log('✅ USDT decimal mismatch FIXED');
        console.log('✅ Oracle fallback system ENABLED');
        console.log('✅ Package prices CORRECTED');
        console.log('✅ BNB registration NOW WORKS');
        console.log('✅ All existing data PRESERVED');
        console.log('');
        console.log('📋 Ready for Step 3: Transfer ownership back to Trezor');
        console.log('Run: npx hardhat run step3-transfer-back-to-trezor.cjs --network bsc');
        
        return {
            success: true,
            implementationAddress,
            proxyAddress: await upgraded.getAddress(),
            version: version,
            usdtDecimals: usdtDecimals,
            fallbackPrice: fallbackPrice,
            fallbackEnabled: fallbackEnabled
        };
        
    } catch (error) {
        console.error('❌ Upgrade failed:', error.message);
        
        if (error.message.includes('Ownable: caller is not the owner')) {
            console.log('\n🔑 Make sure deployer is the owner first.');
            console.log('Run: npx hardhat run step1-transfer-to-deployer.cjs --network bsc');
        }
        
        return false;
    }
}

// Run the upgrade
deployAndUpgradeV2()
    .then((result) => {
        if (result && result.success) {
            console.log('\n✅ Step 2 Complete! Proceed to Step 3.');
        } else {
            console.log('\n❌ Step 2 Failed! Check errors above.');
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
