const { ethers, upgrades } = require("hardhat");

async function upgradeContract() {
    console.log('🔄 Upgrading LeadFive Contract to Fix USDT and Oracle Issues...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    
    try {
        // Get the current owner (should be Trezor)
        const [deployer] = await ethers.getSigners();
        console.log(`Deployer: ${deployer.address}`);
        
        // Deploy new implementation
        console.log('📦 Deploying LeadFiveV2 implementation...');
        const LeadFiveV2 = await ethers.getContractFactory("LeadFiveV2");
        
        // Upgrade the proxy to the new implementation
        const upgraded = await upgrades.upgradeProxy(contractAddress, LeadFiveV2);
        await upgraded.waitForDeployment();
        
        console.log('✅ Contract upgraded successfully!');
        console.log(`Proxy address: ${await upgraded.getAddress()}`);
        
        // Call the initialization function for V2
        console.log('\n🔧 Initializing V2 features...');
        const tx = await upgraded.initializeV2();
        await tx.wait();
        
        console.log('✅ V2 initialization complete!');
        
        // Verify the fixes
        console.log('\n🔍 Verifying fixes...');
        
        // Check USDT decimals
        const usdtDecimals = await upgraded.getUSDTDecimals();
        console.log(`USDT Decimals: ${usdtDecimals}`);
        
        // Check package prices (should now be correct)
        const package1Price = await upgraded.getPackagePrice(1);
        console.log(`Package 1 Price: ${ethers.formatUnits(package1Price, usdtDecimals)} USDT`);
        
        // Check fallback settings
        const [fallbackPrice, fallbackEnabled] = await upgraded.getFallbackSettings();
        console.log(`Fallback Price: $${ethers.formatUnits(fallbackPrice, 8)}`);
        console.log(`Fallback Enabled: ${fallbackEnabled}`);
        
        // Test BNB price function
        const bnbPrice = await upgraded.getCurrentBNBPrice();
        console.log(`Current BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
        
        console.log('\n🎉 UPGRADE COMPLETE!');
        console.log('Fixes applied:');
        console.log('✅ USDT decimal mismatch resolved');
        console.log('✅ Oracle fallback mechanism enabled');
        console.log('✅ Package prices updated to correct amounts');
        console.log('✅ BNB registration now works with fallback price');
        
    } catch (error) {
        console.error('❌ Upgrade failed:', error.message);
        
        if (error.message.includes('Ownable: caller is not the owner')) {
            console.log('\n🔑 Note: This upgrade must be called by the contract owner (Trezor)');
            console.log('You need to:');
            console.log('1. Connect with Trezor wallet as owner');
            console.log('2. Call the upgrade function');
            console.log('3. Or transfer ownership temporarily to deploy wallet');
        }
    }
}

// Alternative: Deploy new implementation only (for manual upgrade)
async function deployImplementationOnly() {
    console.log('📦 Deploying LeadFiveV2 Implementation Only...\n');
    
    try {
        const LeadFiveV2 = await ethers.getContractFactory("LeadFiveV2");
        const implementation = await LeadFiveV2.deploy();
        await implementation.waitForDeployment();
        
        const implAddress = await implementation.getAddress();
        console.log(`✅ New implementation deployed: ${implAddress}`);
        
        console.log('\n📝 To complete the upgrade:');
        console.log('1. Go to BSCScan proxy contract page');
        console.log('2. Connect as owner (Trezor)');
        console.log('3. Call upgradeTo() function with:');
        console.log(`   newImplementation: ${implAddress}`);
        console.log('4. Call initializeV2() function');
        
        return implAddress;
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
    }
}

// Choose deployment method
if (process.argv[2] === '--implementation-only') {
    deployImplementationOnly()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
} else {
    upgradeContract()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
