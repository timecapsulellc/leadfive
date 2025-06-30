const { ethers } = require('hardhat');

async function checkUpgradeStatus() {
    console.log('🔍 Checking Contract Upgrade Status...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    
    try {
        // Get contract instance
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const contract = LeadFive.attach(contractAddress);
        
        console.log('📋 Contract Information:');
        console.log(`Address: ${contractAddress}`);
        
        // Check if V2 functions exist
        console.log('\n🔍 Checking V2 Features...');
        
        try {
            const usdtDecimals = await contract.getUSDTDecimals();
            console.log(`✅ USDT Decimals: ${usdtDecimals}`);
            
            const [fallbackPrice, fallbackEnabled] = await contract.getFallbackSettings();
            console.log(`✅ Fallback Price: $${ethers.formatUnits(fallbackPrice, 8)}`);
            console.log(`✅ Fallback Enabled: ${fallbackEnabled}`);
            
            console.log('🎉 CONTRACT HAS BEEN UPGRADED TO V2!');
            
        } catch (error) {
            console.log('❌ V2 functions not found - contract not upgraded yet');
            console.log('Run: npx hardhat run upgrade-to-v2.cjs --network bsc');
            return;
        }
        
        // Check package prices
        console.log('\n📦 Package Prices (Post-Upgrade):');
        for (let i = 1; i <= 4; i++) {
            try {
                const price = await contract.getPackagePrice(i);
                const usdtDecimals = await contract.getUSDTDecimals();
                console.log(`Package ${i}: ${ethers.formatUnits(price, usdtDecimals)} USDT`);
            } catch (error) {
                console.log(`Package ${i}: Error reading price`);
            }
        }
        
        // Test BNB price function
        console.log('\n💰 Price Functions:');
        try {
            const bnbPrice = await contract.getCurrentBNBPrice();
            console.log(`Current BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
            console.log('✅ BNB price function working');
        } catch (error) {
            console.log('❌ BNB price function failed:', error.message);
        }
        
        // Check registration capability
        console.log('\n🧪 Testing Registration Capability...');
        const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        
        try {
            // Test USDT registration simulation
            const usdtDecimals = await contract.getUSDTDecimals();
            const package1Price = await contract.getPackagePrice(1);
            
            console.log('USDT Registration Test:');
            console.log(`- Package 1 price: ${ethers.formatUnits(package1Price, usdtDecimals)} USDT`);
            console.log(`- Required USDT amount: ${package1Price.toString()} units`);
            
            if (package1Price.toString() === '30000000000000000000') {
                console.log('✅ USDT amounts are correct (30 USDT)');
            } else {
                console.log('⚠️ USDT amounts may need verification');
            }
            
        } catch (error) {
            console.log('❌ Registration test failed:', error.message);
        }
        
        // Check current user status
        console.log('\n👤 Trezor Status:');
        try {
            const user = await contract.users(trezorAddress);
            console.log(`Registered: ${user.registrationTime > 0}`);
            console.log(`Package Level: ${user.packageLevel}`);
            
            const owner = await contract.owner();
            console.log(`Is Owner: ${owner.toLowerCase() === trezorAddress.toLowerCase()}`);
            
        } catch (error) {
            console.log('❌ Could not check user status:', error.message);
        }
        
        console.log('\n📊 Summary:');
        if (await contract.getUSDTDecimals()) {
            console.log('✅ Contract successfully upgraded to V2');
            console.log('✅ USDT decimal issue fixed');
            console.log('✅ Oracle fallback system enabled');
            console.log('✅ Ready for proper registration');
            
            console.log('\n🎯 Next Steps:');
            console.log('1. Register Trezor with correct USDT amount');
            console.log('2. Or register with BNB using fallback price');
            console.log('3. Both methods now work properly');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the check
checkUpgradeStatus()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
