const { ethers, upgrades } = require('hardhat');

async function deployFreshImplementation() {
    try {
        console.log('\n🚀 DEPLOYING FRESH LEADFIVE IMPLEMENTATION');
        console.log('='.repeat(60));
        
        const [deployer] = await ethers.getSigners();
        console.log(`🔑 Deployer: ${deployer.address}`);
        
        const proxyAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
        const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
        
        // Deploy new implementation
        console.log('\n🏭 Step 1: Deploying fresh LeadFive implementation...');
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const implementation = await LeadFive.deploy();
        await implementation.waitForDeployment();
        
        const implAddress = await implementation.getAddress();
        console.log(`✅ New implementation deployed: ${implAddress}`);
        
        // Upgrade proxy to new implementation
        console.log('\n⬆️ Step 2: Upgrading proxy to new implementation...');
        const upgraded = await upgrades.upgradeProxy(proxyAddress, LeadFive);
        await upgraded.waitForDeployment();
        
        const currentImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log(`✅ Proxy upgraded to: ${currentImpl}`);
        
        // Check contract state
        console.log('\n📊 Step 3: Checking contract state...');
        const contract = await ethers.getContractAt('LeadFive', proxyAddress);
        
        const owner = await contract.owner();
        const currentUsdt = await contract.usdt();
        const version = await contract.getVersion();
        
        console.log(`Owner: ${owner}`);
        console.log(`Version: ${version}`);
        console.log(`Current USDT: ${currentUsdt}`);
        
        // Set USDT address
        if (currentUsdt === ethers.ZeroAddress) {
            console.log('\n🔧 Step 4: Setting USDT address...');
            
            try {
                const tx = await contract.setUSDTAddress(usdtAddress);
                console.log(`Transaction: ${tx.hash}`);
                
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
                
                const newUsdt = await contract.usdt();
                console.log(`✅ USDT set to: ${newUsdt}`);
                
                if (newUsdt.toLowerCase() === usdtAddress.toLowerCase()) {
                    console.log('🎉 SUCCESS! USDT address set correctly!');
                } else {
                    console.log('❌ USDT address still not correct');
                }
                
            } catch (error) {
                console.log(`❌ Failed to set USDT: ${error.message}`);
                
                // Try emergency method
                console.log('\n🆘 Trying emergencySetUSDT...');
                try {
                    const emergencyTx = await contract.emergencySetUSDT(usdtAddress);
                    await emergencyTx.wait();
                    
                    const emergencyUsdt = await contract.usdt();
                    console.log(`Emergency USDT result: ${emergencyUsdt}`);
                } catch (emergencyError) {
                    console.log(`❌ Emergency also failed: ${emergencyError.message}`);
                }
            }
        }
        
        console.log('\n🎉 UPGRADE AND CONFIGURATION COMPLETE!');
        
    } catch (error) {
        console.error('\n❌❌❌ DEPLOYMENT FAILED ❌❌❌');
        console.error('Error:', error.message);
    }
}

deployFreshImplementation().catch(console.error);
