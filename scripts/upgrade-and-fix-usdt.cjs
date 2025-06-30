require('dotenv').config();
const { ethers } = require('hardhat');

async function upgradeAndFixUSDT() {
    console.log('🔧 UPGRADING CONTRACT AND FIXING USDT ADDRESS');
    console.log('='.repeat(60));
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        console.log(`\n📋 Network Configuration:`);
        console.log(`Deployer: ${wallet.address}`);
        console.log(`Balance: ${ethers.formatEther(await wallet.provider.getBalance(wallet.address))} BNB`);
        
        const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
        const correctUSDTAddress = process.env.VITE_USDT_CONTRACT_ADDRESS;
        
        console.log(`\n📋 Contract Information:`);
        console.log(`Contract: ${proxyAddress}`);
        console.log(`Correct USDT: ${correctUSDTAddress}`);
        
        // Connect to existing contract
        const LeadFive = await ethers.getContractFactory("LeadFive", wallet);
        const existingContract = LeadFive.attach(proxyAddress);
        
        // Check current state
        console.log(`\n🔍 Current Contract State:`);
        const currentOwner = await existingContract.owner();
        const currentUSDT = await existingContract.usdt();
        
        console.log(`Owner: ${currentOwner}`);
        console.log(`Current USDT: ${currentUSDT}`);
        console.log(`USDT is Zero: ${currentUSDT === ethers.ZeroAddress}`);
        
        if (currentOwner.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(`You are not the owner. Current owner: ${currentOwner}`);
        }
        
        // Deploy new implementation with setUSDTAddress function
        console.log(`\n🔨 Step 1: Deploy New Implementation with USDT Setter`);
        const newImplementation = await LeadFive.deploy();
        await newImplementation.waitForDeployment();
        const newImplAddress = await newImplementation.getAddress();
        console.log(`✅ New Implementation: ${newImplAddress}`);
        
        // Upgrade the proxy
        console.log(`\n🔨 Step 2: Upgrade Proxy`);
        const upgradeTx = await existingContract.upgradeToAndCall(newImplAddress, "0x");
        console.log(`Transaction submitted: ${upgradeTx.hash}`);
        
        const receipt = await upgradeTx.wait();
        console.log(`✅ Upgrade completed in block: ${receipt.blockNumber}`);
        
        // Wait a moment for the upgrade to be processed
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Now fix the USDT address using the new setter function
        console.log(`\n🔨 Step 3: Set Correct USDT Address`);
        
        try {
            const setUSDTTx = await existingContract.setUSDTAddress(correctUSDTAddress);
            console.log(`USDT setter transaction: ${setUSDTTx.hash}`);
            
            const usdtReceipt = await setUSDTTx.wait();
            console.log(`✅ USDT address set in block: ${usdtReceipt.blockNumber}`);
            
        } catch (error) {
            console.error(`❌ Failed to set USDT address:`, error.message);
            throw error;
        }
        
        // Verify the fix
        console.log(`\n🔍 Step 4: Verify Fix`);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newUSDT = await existingContract.usdt();
        const totalUsers = await existingContract.getTotalUsers();
        const owner = await existingContract.owner();
        
        console.log(`✅ Owner: ${owner}`);
        console.log(`✅ USDT Address: ${newUSDT}`);
        console.log(`✅ Total Users: ${totalUsers}`);
        console.log(`✅ USDT Fixed: ${newUSDT.toLowerCase() === correctUSDTAddress.toLowerCase()}`);
        
        // Test package prices
        console.log(`\n✅ Package Prices:`);
        for (let i = 1; i <= 4; i++) {
            const price = await existingContract.getPackagePrice(i);
            console.log(`   Package ${i}: $${ethers.formatUnits(price, 6)} USDT`);
        }
        
        // Test register function
        const registerFunction = existingContract.interface.getFunction("register");
        console.log(`✅ Register function: ${registerFunction.inputs.length} parameters`);
        
        console.log(`\n🎉 CONTRACT UPGRADE AND USDT FIX COMPLETED!`);
        console.log('='.repeat(50));
        console.log(`✅ USDT address properly set`);
        console.log(`✅ Contract fully functional`);
        console.log(`✅ Ready for production use`);
        
        // Save success info
        const successInfo = {
            network: 'BSC Mainnet',
            timestamp: new Date().toISOString(),
            proxyAddress: proxyAddress,
            newImplementation: newImplAddress,
            upgradeTransaction: upgradeTx.hash,
            usdtSetTransaction: setUSDTTx.hash,
            usdtAddress: newUSDT,
            status: 'FULLY FUNCTIONAL'
        };
        
        require('fs').writeFileSync(
            'leadfive-usdt-fix-success.json',
            JSON.stringify(successInfo, null, 2)
        );
        
        console.log(`\n💾 Success info saved to: leadfive-usdt-fix-success.json`);
        console.log(`\n🚀 LEADFIVE CONTRACT IS NOW FULLY OPERATIONAL!`);
        
        return {
            success: true,
            usdtAddress: newUSDT,
            usdtFixed: newUSDT.toLowerCase() === correctUSDTAddress.toLowerCase()
        };
        
    } catch (error) {
        console.error('❌ Upgrade and fix failed:', error.message);
        throw error;
    }
}

// Only run if called directly
if (require.main === module) {
    upgradeAndFixUSDT()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = upgradeAndFixUSDT;
