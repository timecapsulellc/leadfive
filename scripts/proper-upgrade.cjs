const { ethers, upgrades } = require("hardhat");

async function main() {
    try {
        console.log('\n🚀 PROPER LEADFIVE UPGRADE WITH POST-UPGRADE HOOK');
        console.log('='.repeat(60));
        
        const proxyAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        
        console.log(`📍 Proxy Address: ${proxyAddress}`);
        console.log(`💰 USDT Address: ${usdtAddress}`);
        
        // Get the contract factory
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        // Check current state
        console.log('\n📊 Pre-upgrade state:');
        const currentContract = await ethers.getContractAt("LeadFive", proxyAddress);
        const currentUsdt = await currentContract.usdt();
        const currentOwner = await currentContract.owner();
        
        console.log(`Current USDT: ${currentUsdt}`);
        console.log(`Current Owner: ${currentOwner}`);
        
        // Perform the upgrade with post-upgrade call
        console.log('\n⬆️ Performing upgrade with post-upgrade hook...');
        
        const upgraded = await upgrades.upgradeProxy(proxyAddress, LeadFive, {
            kind: "uups",
            call: {
                fn: "postUpgrade",
                args: [usdtAddress]
            }
        });
        
        await upgraded.waitForDeployment();
        
        console.log("✅ Upgrade completed successfully!");
        
        // Verify the upgrade
        console.log('\n🔍 Post-upgrade verification:');
        const newUsdt = await upgraded.usdt();
        const newOwner = await upgraded.owner();
        const version = await upgraded.getVersion();
        
        console.log(`New USDT: ${newUsdt}`);
        console.log(`Owner: ${newOwner}`);
        console.log(`Version: ${version}`);
        
        // Check USDT configuration
        const usdtConfig = await upgraded.getUSDTConfig();
        console.log(`USDT Config: address=${usdtConfig[0]}, decimals=${usdtConfig[1]}, balance=${usdtConfig[2]}`);
        
        const isConfigured = await upgraded.isUSDTConfigured();
        console.log(`USDT Configured: ${isConfigured}`);
        
        if (newUsdt.toLowerCase() === usdtAddress.toLowerCase()) {
            console.log('\n🎉 SUCCESS! USDT address properly configured after upgrade!');
        } else {
            console.log('\n⚠️ USDT address still not configured correctly');
        }
        
        // Test a basic function to ensure contract is working
        console.log('\n🧪 Testing contract functionality...');
        try {
            const packagePrice = await upgraded.getPackagePrice(1);
            console.log(`Package 1 price: ${packagePrice} (6 decimals)`);
            console.log('✅ Contract functionality test passed');
        } catch (error) {
            console.log(`❌ Contract functionality test failed: ${error.message}`);
        }
        
    } catch (error) {
        console.error('\n❌❌❌ UPGRADE FAILED ❌❌❌');
        console.error('Error:', error.message);
        
        // Fallback: Try manual upgrade without post-upgrade hook
        console.log('\n🔄 Attempting fallback upgrade without post-upgrade hook...');
        try {
            const LeadFive = await ethers.getContractFactory("LeadFive");
            const fallbackUpgrade = await upgrades.upgradeProxy(proxyAddress, LeadFive, {
                kind: "uups"
            });
            await fallbackUpgrade.waitForDeployment();
            console.log('✅ Fallback upgrade successful');
            
            // Try to set USDT manually
            console.log('🔧 Attempting manual USDT configuration...');
            const tx = await fallbackUpgrade.postUpgrade(usdtAddress);
            await tx.wait();
            console.log('✅ Manual USDT configuration successful');
            
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
