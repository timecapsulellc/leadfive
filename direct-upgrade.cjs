const { ethers, upgrades } = require('hardhat');

async function directUpgrade() {
    try {
        console.log('\n🔄 DIRECT UPGRADE TO NEW IMPLEMENTATION');
        console.log('='.repeat(60));
        
        const proxyAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
        const newImplAddress = '0xBe243e8c4868382E23e08ad71b532d68CB3aEA4A'; // Latest deployed implementation
        const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
        
        console.log(`📍 Proxy: ${proxyAddress}`);
        console.log(`🏭 New Implementation: ${newImplAddress}`);
        console.log(`💰 USDT: ${usdtAddress}`);
        
        // Get current implementation
        const currentImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log(`📊 Current Implementation: ${currentImpl}`);
        
        // Get the contract interface
        const LeadFive = await ethers.getContractFactory('LeadFive');
        
        // Try to force upgrade to the specific implementation
        console.log('\n⬆️ Step 1: Forcing upgrade to new implementation...');
        
        // Method 1: Use upgradeProxy with the specific implementation
        try {
            const upgraded = await upgrades.upgradeProxy(proxyAddress, LeadFive, {
                useDeployedImplementation: true
            });
            await upgraded.waitForDeployment();
            console.log('✅ Method 1: upgradeProxy with useDeployedImplementation succeeded');
        } catch (e) {
            console.log(`❌ Method 1 failed: ${e.message}`);
            
            // Method 2: Try forceImport and then upgrade
            console.log('\n🔄 Method 2: Force import and upgrade...');
            try {
                await upgrades.forceImport(proxyAddress, LeadFive);
                const upgraded2 = await upgrades.upgradeProxy(proxyAddress, LeadFive);
                await upgraded2.waitForDeployment();
                console.log('✅ Method 2: forceImport + upgradeProxy succeeded');
            } catch (e2) {
                console.log(`❌ Method 2 failed: ${e2.message}`);
                
                // Method 3: Manual upgrade via proxy admin
                console.log('\n🔧 Method 3: Manual proxy admin upgrade...');
                try {
                    // Get proxy admin
                    const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
                    console.log(`Admin address: ${adminAddress}`);
                    
                    // This might require different approach
                    console.log('Manual upgrade would require proxy admin interaction...');
                } catch (e3) {
                    console.log(`❌ Method 3 failed: ${e3.message}`);
                }
            }
        }
        
        // Check final implementation
        const finalImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log(`\n📊 Final Implementation: ${finalImpl}`);
        
        // Test the contract
        console.log('\n🧪 Step 2: Testing contract functions...');
        const contract = await ethers.getContractAt('LeadFive', proxyAddress);
        
        try {
            const version = await contract.getVersion();
            console.log(`Version: ${version}`);
            
            const usdt = await contract.usdt();
            console.log(`Current USDT: ${usdt}`);
            
            // Try setting USDT with the new forceSetUSDT function
            console.log('\n🔧 Step 3: Testing forceSetUSDT...');
            const tx = await contract.forceSetUSDT(usdtAddress);
            console.log(`Transaction: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
            
            const newUsdt = await contract.usdt();
            console.log(`✅ New USDT: ${newUsdt}`);
            
            if (newUsdt.toLowerCase() === usdtAddress.toLowerCase()) {
                console.log('🎉 SUCCESS! USDT address set correctly!');
            } else {
                console.log('❌ USDT still not set correctly');
            }
            
        } catch (error) {
            console.log(`❌ Contract interaction failed: ${error.message}`);
        }
        
    } catch (error) {
        console.error('\n❌❌❌ DIRECT UPGRADE FAILED ❌❌❌');
        console.error('Error:', error.message);
    }
}

directUpgrade().catch(console.error);
