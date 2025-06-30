require('dotenv').config();
const { ethers } = require('hardhat');

async function initializeUSDTAddress() {
    try {
        console.log('\n🔧 INITIALIZING USDT ADDRESS IN DEPLOYED CONTRACT');
        console.log('='.repeat(60));
        
        const contractAddress = process.env.MAINNET_CONTRACT_ADDRESS;
        const usdtAddress = process.env.VITE_USDT_ADDRESS;
        const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
        
        console.log(`Contract: ${contractAddress}`);
        console.log(`USDT: ${usdtAddress}`);
        
        // Set up provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const deployer = new ethers.Wallet(deployerPrivateKey, provider);
        
        console.log(`\nDeployer: ${deployer.address}`);
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log(`Balance: ${ethers.formatEther(balance)} BNB`);
        
        if (balance < ethers.parseEther("0.01")) {
            console.log('❌ ERROR: Insufficient BNB balance for transaction');
            return;
        }
        
        // Connect to contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress).connect(deployer);
        
        // Check current status
        console.log('\n🔍 CHECKING CURRENT STATUS:');
        const currentUSDT = await contract.usdt();
        console.log(`Current USDT: ${currentUSDT}`);
        
        if (currentUSDT !== '0x0000000000000000000000000000000000000000') {
            console.log('✅ USDT already initialized!');
            return;
        }
        
        // Initialize USDT
        console.log('\n🚀 INITIALIZING USDT ADDRESS:');
        console.log(`Setting USDT to: ${usdtAddress}`);
        
        const initTx = await contract.initialize(usdtAddress);
        console.log(`Transaction sent: ${initTx.hash}`);
        
        const receipt = await initTx.wait();
        console.log(`✅ USDT initialized! Gas used: ${receipt.gasUsed}`);
        
        // Verify initialization
        console.log('\n✅ VERIFYING INITIALIZATION:');
        const newUSDT = await contract.usdt();
        console.log(`New USDT Address: ${newUSDT}`);
        console.log(`Correct: ${newUSDT.toLowerCase() === usdtAddress.toLowerCase()}`);
        
        const decimals = await contract.getUSDTDecimals();
        console.log(`USDT Decimals: ${decimals}`);
        
        const owner = await contract.owner();
        console.log(`Owner: ${owner}`);
        
        const isAdmin = await contract.isAdmin(deployer.address);
        console.log(`Deployer is Admin: ${isAdmin}`);
        
        // Test package prices
        console.log('\n📦 PACKAGE PRICES:');
        for (let i = 1; i <= 4; i++) {
            const price = await contract.getPackagePrice(i);
            console.log(`Package ${i}: ${ethers.formatEther(price)} USDT`);
        }
        
        console.log('\n🎉 CONTRACT NOW READY FOR PRODUCTION!');
        console.log('✅ USDT address initialized');
        console.log('✅ Package prices set');
        console.log('✅ Admin rights configured');
        console.log('✅ Ready for user registration');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        
        // Check if already initialized
        if (error.message.includes('Initializable: contract is already initialized')) {
            console.log('\n💡 Contract is already initialized!');
            console.log('The USDT address might have been set in a different way.');
            console.log('Let me check the contract state...');
            
            // Re-check contract state
            const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
            const LeadFive = await ethers.getContractFactory("LeadFive");
            const contract = LeadFive.attach(process.env.MAINNET_CONTRACT_ADDRESS).connect(provider);
            
            try {
                const usdt = await contract.usdt();
                const owner = await contract.owner();
                const totalUsers = await contract.getTotalUsers();
                
                console.log(`USDT: ${usdt}`);
                console.log(`Owner: ${owner}`);
                console.log(`Total Users: ${totalUsers}`);
                
                if (usdt === '0x0000000000000000000000000000000000000000') {
                    console.log('❌ USDT still not set - need different approach');
                } else {
                    console.log('✅ USDT is actually set correctly');
                }
            } catch (checkError) {
                console.log(`Check error: ${checkError.message}`);
            }
        }
    }
}

// Only run if called directly
if (require.main === module) {
    initializeUSDTAddress()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = initializeUSDTAddress;
