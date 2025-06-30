require('dotenv').config();
const { ethers } = require('hardhat');

async function fixUSDTAddress() {
    console.log('🔧 FIXING USDT ADDRESS ON UPGRADED CONTRACT');
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
        
        // Connect to contract
        const LeadFive = await ethers.getContractFactory("LeadFive", wallet);
        const contract = LeadFive.attach(proxyAddress);
        
        // Check current state
        console.log(`\n🔍 Current Contract State:`);
        const currentOwner = await contract.owner();
        const currentUSDT = await contract.usdt();
        const totalUsers = await contract.getTotalUsers();
        
        console.log(`Owner: ${currentOwner}`);
        console.log(`Current USDT: ${currentUSDT}`);
        console.log(`Total Users: ${totalUsers}`);
        console.log(`USDT is Zero: ${currentUSDT === ethers.ZeroAddress}`);
        
        if (currentOwner.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(`You are not the owner. Current owner: ${currentOwner}`);
        }
        
        if (currentUSDT === correctUSDTAddress) {
            console.log('✅ USDT address is already correct!');
            return;
        }
        
        console.log(`\n🔧 The issue: Contract upgrade reset the state`);
        console.log(`This happens because proxy upgrades can reset storage if not handled properly`);
        console.log(`We need to re-initialize the contract with correct values`);
        
        // Since the contract was upgraded but state was reset, we need to check if we can call initialize again
        console.log(`\n🔨 Attempting to re-initialize with correct USDT address...`);
        
        try {
            // Try to call initialize again (this should fail if already initialized)
            const initTx = await contract.initialize(correctUSDTAddress);
            console.log(`Transaction submitted: ${initTx.hash}`);
            
            const receipt = await initTx.wait();
            console.log(`✅ Re-initialization completed in block: ${receipt.blockNumber}`);
            
        } catch (error) {
            if (error.message.includes('Initializable: contract is already initialized')) {
                console.log(`⚠️  Contract is already initialized, cannot call initialize again`);
                console.log(`We need to use an admin function to set USDT address`);
                
                // Check if there's a setter function for USDT (there should be one for admin)
                // For now, let's check what functions are available
                console.log(`\n📋 Available admin functions:`);
                console.log(`- We need to add a setUSDTAddress function for emergencies like this`);
                
                // Since we can't re-initialize, we need to deploy a new implementation with a fix
                console.log(`\n🔧 SOLUTION: Deploy new implementation with state preservation`);
                console.log(`This requires a new contract version that can handle this situation`);
                
                return {
                    issue: 'Contract already initialized',
                    solution: 'Need new implementation with state preservation or admin setter'
                };
                
            } else {
                throw error;
            }
        }
        
        // Verify fix
        console.log(`\n🔍 Verifying fix:`);
        const newUSDT = await contract.usdt();
        const newTotalUsers = await contract.getTotalUsers();
        
        console.log(`✅ USDT Address: ${newUSDT}`);
        console.log(`✅ Total Users: ${newTotalUsers}`);
        console.log(`✅ USDT Correct: ${newUSDT.toLowerCase() === correctUSDTAddress.toLowerCase()}`);
        
        // Test package prices
        for (let i = 1; i <= 4; i++) {
            const price = await contract.getPackagePrice(i);
            console.log(`✅ Package ${i}: $${ethers.formatUnits(price, 6)} USDT`);
        }
        
        console.log(`\n🎉 USDT ADDRESS FIXED SUCCESSFULLY!`);
        
        return {
            success: true,
            usdtAddress: newUSDT,
            totalUsers: newTotalUsers
        };
        
    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        
        if (error.message.includes('already initialized')) {
            console.log(`\n💡 DIAGNOSIS:`);
            console.log(`The contract is already initialized but state was reset during upgrade.`);
            console.log(`This is a common issue with proxy upgrades.`);
            console.log(`\n🔧 SOLUTIONS:`);
            console.log(`1. Add a setUSDTAddress admin function to the contract`);
            console.log(`2. Deploy a new implementation that preserves state`);
            console.log(`3. Use a reinitializer function if available`);
        }
        
        throw error;
    }
}

// Only run if called directly
if (require.main === module) {
    fixUSDTAddress()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = fixUSDTAddress;
