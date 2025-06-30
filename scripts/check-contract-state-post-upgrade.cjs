require('dotenv').config();
const { ethers } = require('hardhat');

async function checkContractStateAfterUpgrade() {
    console.log('🔍 CHECKING CONTRACT STATE AFTER UPGRADE');
    console.log('='.repeat(50));
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        const contractAddress = process.env.MAINNET_CONTRACT_ADDRESS;
        const expectedUSDT = process.env.VITE_USDT_CONTRACT_ADDRESS;
        
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Expected USDT: ${expectedUSDT}`);
        
        // Connect to contract
        const LeadFive = await ethers.getContractFactory("LeadFive", wallet);
        const contract = LeadFive.attach(contractAddress);
        
        // Check contract state
        const owner = await contract.owner();
        const totalUsers = await contract.getTotalUsers();
        const currentUSDT = await contract.usdt();
        const usdtDecimals = await contract.getUSDTDecimals();
        
        console.log('\n📊 CONTRACT STATE:');
        console.log(`Owner: ${owner}`);
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Current USDT: ${currentUSDT}`);
        console.log(`USDT Decimals: ${usdtDecimals}`);
        
        console.log('\n🔍 DIAGNOSIS:');
        if (currentUSDT === '0x0000000000000000000000000000000000000000') {
            console.log('❌ USDT address is zero - contract needs re-initialization');
            console.log('❌ Total users reset to 0 - contract state was reset');
            console.log('');
            console.log('🚨 ISSUE IDENTIFIED:');
            console.log('The upgrade created a new implementation but did not preserve state.');
            console.log('We need to re-initialize the contract with the USDT address.');
            console.log('');
            console.log('🔧 SOLUTION:');
            console.log('1. Call initialize() function with the correct USDT address');
            console.log('2. Or use upgradeToAndCall() with initialization data');
        } else {
            console.log('✅ USDT address is properly set');
        }
        
        // Check if we can re-initialize
        try {
            console.log('\n🔧 ATTEMPTING TO RE-INITIALIZE...');
            const initTx = await contract.initialize(expectedUSDT);
            console.log(`Initialization transaction: ${initTx.hash}`);
            
            const receipt = await initTx.wait();
            console.log(`✅ Re-initialization successful in block: ${receipt.blockNumber}`);
            
            // Verify after initialization
            const newUSDT = await contract.usdt();
            const newTotalUsers = await contract.getTotalUsers();
            console.log(`New USDT: ${newUSDT}`);
            console.log(`New Total Users: ${newTotalUsers}`);
            
        } catch (error) {
            console.log(`❌ Re-initialization failed: ${error.message}`);
            
            if (error.message.includes('already initialized')) {
                console.log('');
                console.log('🚨 CONTRACT IS ALREADY INITIALIZED BUT WITH WRONG STATE');
                console.log('This means the upgrade process had an issue.');
                console.log('We need to deploy a proper upgrade with state preservation.');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkContractStateAfterUpgrade()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
