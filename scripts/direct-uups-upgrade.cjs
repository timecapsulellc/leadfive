const { ethers } = require("hardhat");

async function main() {
    try {
        console.log('\n🔧 DIRECT UUPS UPGRADE ATTEMPT');
        console.log('='.repeat(40));
        
        const proxyAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const newImplAddress = "0x1ef3275f7dF01C735216755C0d56A7005fE0cA8c"; // Latest deployed
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        
        console.log(`📍 Proxy: ${proxyAddress}`);
        console.log(`🏭 New Implementation: ${newImplAddress}`);
        console.log(`💰 USDT: ${usdtAddress}`);
        
        // Get the proxy contract
        const contract = await ethers.getContractAt("LeadFive", proxyAddress);
        
        // Check current state
        console.log('\n📊 Current state:');
        const owner = await contract.owner();
        const version = await contract.getVersion();
        console.log(`Owner: ${owner}`);
        console.log(`Version: ${version}`);
        
        // Try to call upgradeTo directly if it exists
        console.log('\n⬆️ Attempting direct UUPS upgrade...');
        
        try {
            // Check if upgradeTo function exists in ABI
            const abi = contract.interface;
            const upgradeFunction = abi.fragments.find(f => f.name === 'upgradeTo');
            
            if (upgradeFunction) {
                console.log('📞 Found upgradeTo function, calling it...');
                const tx = await contract.upgradeTo(newImplAddress, {
                    gasLimit: 200000
                });
                
                console.log(`📄 Transaction: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
                
                // Check events
                if (receipt.logs.length > 0) {
                    console.log('📋 Events:');
                    receipt.logs.forEach((log, i) => {
                        try {
                            const parsed = contract.interface.parseLog(log);
                            console.log(`  ${parsed.name}: ${JSON.stringify(parsed.args)}`);
                        } catch (e) {
                            console.log(`  Raw log ${i}: ${log.topics[0]}`);
                        }
                    });
                }
                
                console.log('✅ Direct UUPS upgrade completed');
                
            } else {
                console.log('❌ upgradeTo function not found in ABI');
                
                // Try upgradeToAndCall instead
                const upgradeToAndCallFunction = abi.fragments.find(f => f.name === 'upgradeToAndCall');
                if (upgradeToAndCallFunction) {
                    console.log('📞 Found upgradeToAndCall function, using it...');
                    
                    // Prepare call data for postUpgrade
                    const postUpgradeData = contract.interface.encodeFunctionData('postUpgrade', [usdtAddress]);
                    
                    const tx = await contract.upgradeToAndCall(newImplAddress, postUpgradeData, {
                        gasLimit: 300000
                    });
                    
                    console.log(`📄 Transaction: ${tx.hash}`);
                    const receipt = await tx.wait();
                    console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
                    
                    console.log('✅ upgradeToAndCall completed');
                } else {
                    console.log('❌ Neither upgradeTo nor upgradeToAndCall found');
                }
            }
            
        } catch (error) {
            console.log(`❌ Direct upgrade failed: ${error.message}`);
        }
        
        // Verify the upgrade
        console.log('\n🔍 Verifying upgrade...');
        
        // Check implementation slot directly
        const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
        const implSlot = await ethers.provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT);
        const currentImplAddress = '0x' + implSlot.slice(-40);
        console.log(`📊 Current Implementation (Direct): ${currentImplAddress}`);
        
        if (currentImplAddress.toLowerCase() === newImplAddress.toLowerCase()) {
            console.log('🎉 Implementation successfully updated!');
            
            // Test the new functions
            console.log('\n🧪 Testing new contract functions...');
            try {
                const newUsdt = await contract.usdt();
                console.log(`USDT: ${newUsdt}`);
                
                // Try postUpgrade if USDT is still zero
                if (newUsdt === ethers.ZeroAddress) {
                    console.log('📞 Calling postUpgrade...');
                    const tx = await contract.postUpgrade(usdtAddress);
                    await tx.wait();
                    
                    const finalUsdt = await contract.usdt();
                    console.log(`Final USDT: ${finalUsdt}`);
                }
                
            } catch (e) {
                console.log(`❌ New function test failed: ${e.message}`);
            }
            
        } else {
            console.log('❌ Implementation not updated');
        }
        
    } catch (error) {
        console.error('\n❌❌❌ DIRECT UUPS UPGRADE FAILED ❌❌❌');
        console.error('Error:', error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
