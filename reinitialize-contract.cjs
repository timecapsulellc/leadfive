require('dotenv').config();
const { ethers } = require('hardhat');

async function reinitializeContract() {
    console.log('🔧 REINITIALIZING CONTRACT WITH PROPER STATE');
    console.log('='.repeat(60));
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
        const correctUSDTAddress = process.env.VITE_USDT_CONTRACT_ADDRESS;
        
        console.log(`\n📋 Contract Information:`);
        console.log(`Proxy: ${proxyAddress}`);
        console.log(`USDT: ${correctUSDTAddress}`);
        console.log(`Owner: ${wallet.address}`);
        
        // Get the contract factory
        const LeadFive = await ethers.getContractFactory("LeadFive", wallet);
        
        // Deploy a completely new implementation that reinitializes properly
        console.log(`\n🔨 Step 1: Deploy Fresh Implementation`);
        const newImplementation = await LeadFive.deploy();
        await newImplementation.waitForDeployment();
        const newImplAddress = await newImplementation.getAddress();
        console.log(`✅ New Implementation: ${newImplAddress}`);
        
        // Connect to proxy
        const proxyContract = LeadFive.attach(proxyAddress);
        
        // Prepare initialization data
        console.log(`\n🔨 Step 2: Prepare Reinitialization Data`);
        const initData = LeadFive.interface.encodeFunctionData("initialize", [correctUSDTAddress]);
        console.log(`Init data prepared for USDT: ${correctUSDTAddress}`);
        
        // Upgrade the proxy with reinitialization
        console.log(`\n🔨 Step 3: Upgrade with Reinitialization`);
        try {
            const upgradeTx = await proxyContract.upgradeToAndCall(newImplAddress, initData);
            console.log(`Transaction: ${upgradeTx.hash}`);
            
            const receipt = await upgradeTx.wait();
            console.log(`✅ Upgrade completed in block: ${receipt.blockNumber}`);
            
        } catch (error) {
            if (error.message.includes('already initialized')) {
                console.log(`⚠️  Contract already initialized, trying upgrade without reinitialization...`);
                
                const upgradeTx = await proxyContract.upgradeToAndCall(newImplAddress, "0x");
                console.log(`Transaction: ${upgradeTx.hash}`);
                
                const receipt = await upgradeTx.wait();
                console.log(`✅ Upgrade completed in block: ${receipt.blockNumber}`);
                
                // Now manually set USDT using admin function
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                console.log(`\n🔨 Step 4: Manually Set USDT Address`);
                const setUSDTTx = await proxyContract.setUSDTAddress(correctUSDTAddress);
                console.log(`USDT Transaction: ${setUSDTTx.hash}`);
                
                const usdtReceipt = await setUSDTTx.wait();
                console.log(`✅ USDT set in block: ${usdtReceipt.blockNumber}`);
                
            } else {
                throw error;
            }
        }
        
        // Verify the final state
        console.log(`\n🔍 Step 5: Verify Final State`);
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const finalOwner = await proxyContract.owner();
        const finalUSDT = await proxyContract.usdt();
        const finalTotalUsers = await proxyContract.getTotalUsers();
        
        console.log(`✅ Final Owner: ${finalOwner}`);
        console.log(`✅ Final USDT: ${finalUSDT}`);
        console.log(`✅ Total Users: ${finalTotalUsers}`);
        console.log(`✅ USDT Correct: ${finalUSDT.toLowerCase() === correctUSDTAddress.toLowerCase()}`);
        
        // Test version
        try {
            const version = await proxyContract.getVersion();
            console.log(`✅ Version: ${version}`);
        } catch (error) {
            console.log(`Version check: ${error.message}`);
        }
        
        // Test package prices
        console.log(`\n✅ Package Verification:`);
        for (let i = 1; i <= 4; i++) {
            try {
                const price = await proxyContract.getPackagePrice(i);
                console.log(`   Package ${i}: $${ethers.formatUnits(price, 6)} USDT`);
            } catch (error) {
                console.log(`   Package ${i}: Error - ${error.message}`);
            }
        }
        
        const isFixed = finalUSDT.toLowerCase() === correctUSDTAddress.toLowerCase();
        
        console.log(`\n${isFixed ? '🎉' : '❌'} CONTRACT ${isFixed ? 'SUCCESSFULLY' : 'NOT'} FIXED!`);
        
        if (isFixed) {
            console.log('✅ USDT address properly set');
            console.log('✅ Contract fully operational');
            console.log('✅ Ready for production use');
        } else {
            console.log('❌ USDT address still not set correctly');
            console.log('❌ Manual intervention may be required');
        }
        
        return {
            success: isFixed,
            usdtAddress: finalUSDT,
            implementation: newImplAddress
        };
        
    } catch (error) {
        console.error('❌ Reinitialization failed:', error.message);
        throw error;
    }
}

// Only run if called directly
if (require.main === module) {
    reinitializeContract()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = reinitializeContract;
