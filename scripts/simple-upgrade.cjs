const { ethers, upgrades } = require("hardhat");

async function main() {
    try {
        console.log('\n🚀 SIMPLE UPGRADE TO NEW IMPLEMENTATION');
        console.log('='.repeat(50));
        
        const proxyAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        
        console.log(`📍 Proxy Address: ${proxyAddress}`);
        
        // Check current implementation
        const currentImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log(`📊 Current Implementation: ${currentImpl}`);
        
        // Get the contract factory
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        // Deploy new implementation first
        console.log('\n🏭 Deploying new implementation...');
        const newImplementation = await LeadFive.deploy();
        await newImplementation.waitForDeployment();
        const newImplAddress = await newImplementation.getAddress();
        console.log(`✅ New implementation deployed: ${newImplAddress}`);
        
        // Now upgrade the proxy
        console.log('\n⬆️ Upgrading proxy to new implementation...');
        const upgraded = await upgrades.upgradeProxy(proxyAddress, LeadFive, {
            kind: "uups"
        });
        
        await upgraded.waitForDeployment();
        console.log('✅ Proxy upgrade completed');
        
        // Check new implementation
        const finalImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log(`📊 Final Implementation: ${finalImpl}`);
        
        // Test the upgraded contract
        console.log('\n🧪 Testing upgraded contract...');
        try {
            const contract = await ethers.getContractAt("LeadFive", proxyAddress);
            
            const owner = await contract.owner();
            const version = await contract.getVersion();
            const usdt = await contract.usdt();
            
            console.log(`Owner: ${owner}`);
            console.log(`Version: ${version}`);
            console.log(`USDT: ${usdt}`);
            
            // Check if new functions are available
            console.log('\n📋 Checking new functions...');
            
            // Test postUpgrade function
            try {
                console.log('📞 Testing postUpgrade function...');
                const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
                const tx = await contract.postUpgrade(usdtAddress);
                await tx.wait();
                console.log('✅ postUpgrade function executed successfully');
                
                const newUsdt = await contract.usdt();
                console.log(`📊 USDT after postUpgrade: ${newUsdt}`);
                
                if (newUsdt.toLowerCase() === usdtAddress.toLowerCase()) {
                    console.log('🎉 SUCCESS! USDT configured correctly with postUpgrade!');
                } else {
                    console.log('⚠️ USDT still not configured correctly');
                }
                
            } catch (error) {
                console.log(`❌ postUpgrade failed: ${error.message}`);
            }
            
        } catch (error) {
            console.log(`❌ Contract test failed: ${error.message}`);
        }
        
    } catch (error) {
        console.error('\n❌❌❌ SIMPLE UPGRADE FAILED ❌❌❌');
        console.error('Error:', error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
