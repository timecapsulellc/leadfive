const { ethers } = require("hardhat");

async function main() {
    try {
        console.log('\n🔧 MANUAL USDT CONFIGURATION');
        console.log('='.repeat(40));
        
        const proxyAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        
        console.log(`📍 Proxy: ${proxyAddress}`);
        console.log(`💰 Target USDT: ${usdtAddress}`);
        
        const contract = await ethers.getContractAt("LeadFive", proxyAddress);
        
        console.log('\n📊 Current state:');
        const currentUsdt = await contract.usdt();
        const owner = await contract.owner();
        console.log(`Current USDT: ${currentUsdt}`);
        console.log(`Owner: ${owner}`);
        
        // Check all available USDT functions
        console.log('\n📋 Available USDT functions:');
        const abi = contract.interface;
        const usdtFunctions = abi.fragments.filter(f => 
            f.type === 'function' && 
            f.name.toLowerCase().includes('usdt')
        );
        
        usdtFunctions.forEach(f => {
            console.log(`  - ${f.name}(${f.inputs.map(i => i.type).join(', ')})`);
        });
        
        // Try different USDT setters in order of preference
        const setters = [
            "postUpgrade",
            "setUSDTAddress", 
            "emergencySetUSDT",
            "forceSetUSDT"
        ];
        
        console.log('\n🔧 Attempting USDT configuration...');
        
        for (const setter of setters) {
            try {
                console.log(`\n📞 Trying ${setter}...`);
                
                // Check if function exists
                const fragment = abi.getFunction(setter);
                if (!fragment) {
                    console.log(`❌ Function ${setter} not found in ABI`);
                    continue;
                }
                
                const tx = await contract[setter](usdtAddress, {
                    gasLimit: 150000
                });
                
                console.log(`📄 Transaction hash: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log(`✅ Confirmed in block: ${receipt.blockNumber}`);
                console.log(`⛽ Gas used: ${receipt.gasUsed}`);
                
                // Check for events
                if (receipt.logs.length > 0) {
                    console.log('📋 Events emitted:');
                    receipt.logs.forEach((log, i) => {
                        try {
                            const parsed = contract.interface.parseLog(log);
                            console.log(`  ${parsed.name}: ${JSON.stringify(parsed.args, null, 2)}`);
                        } catch (e) {
                            console.log(`  Raw log ${i}: ${log.topics[0]}`);
                        }
                    });
                }
                
                // Check if USDT was set
                const newUsdt = await contract.usdt();
                console.log(`📊 USDT after ${setter}: ${newUsdt}`);
                
                if (newUsdt.toLowerCase() === usdtAddress.toLowerCase()) {
                    console.log(`🎉 SUCCESS! USDT configured with ${setter}!`);
                    break;
                } else {
                    console.log(`⚠️ USDT still not configured correctly after ${setter}`);
                }
                
            } catch (error) {
                console.log(`❌ ${setter} failed: ${error.message.substring(0, 100)}...`);
                
                // Try to decode revert reason
                if (error.data) {
                    try {
                        const decoded = ethers.utils.toUtf8String('0x' + error.data.slice(138));
                        console.log(`   Revert reason: ${decoded}`);
                    } catch (e) {
                        console.log(`   Raw error data: ${error.data}`);
                    }
                }
            }
        }
        
        // Final verification
        console.log('\n📊 Final verification:');
        const finalUsdt = await contract.usdt();
        const usdtDecimals = await contract.getUSDTDecimals();
        const isConfigured = await contract.isUSDTConfigured();
        
        console.log(`Final USDT: ${finalUsdt}`);
        console.log(`USDT Decimals: ${usdtDecimals}`);
        console.log(`Is Configured: ${isConfigured}`);
        
        if (finalUsdt.toLowerCase() === usdtAddress.toLowerCase()) {
            console.log('\n🎉 FINAL SUCCESS! USDT is now configured correctly!');
            
            // Test USDT interaction
            console.log('\n🧪 Testing USDT contract interaction...');
            try {
                const usdtContract = await ethers.getContractAt('IERC20', usdtAddress);
                const symbol = await usdtContract.symbol();
                const decimals = await usdtContract.decimals();
                console.log(`USDT Token: ${symbol}, ${decimals} decimals`);
                console.log('✅ USDT contract interaction successful');
            } catch (e) {
                console.log(`⚠️ USDT contract interaction failed: ${e.message}`);
            }
        } else {
            console.log('\n❌ USDT still not configured correctly');
            console.log('\nℹ️ This might require a complete redeployment or storage investigation');
        }
        
    } catch (error) {
        console.error('\n❌❌❌ MANUAL CONFIGURATION FAILED ❌❌❌');
        console.error('Error:', error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
