require('dotenv').config();
const { ethers } = require('hardhat');

async function checkDeployerInfo() {
    console.log('🔍 CHECKING DEPLOYER WALLET INFO');
    console.log('='.repeat(50));
    
    try {
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
        const wallet = new ethers.Wallet(privateKey);
        
        console.log(`Private Key: ${privateKey.substring(0, 10)}...${privateKey.substring(privateKey.length - 10)}`);
        console.log(`Deployer Address: ${wallet.address}`);
        
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const connectedWallet = wallet.connect(provider);
        
        const balance = await connectedWallet.provider.getBalance(wallet.address);
        console.log(`Balance: ${ethers.formatEther(balance)} BNB`);
        
        // Check contract info
        const contractAddress = process.env.MAINNET_CONTRACT_ADDRESS;
        const currentOwner = '0x140aad3E7c6bCC415Bc8E830699855fF072d405D';
        const trezorAddress = process.env.TREZOR_OWNER_ADDRESS;
        
        console.log('\n📋 ADDRESS COMPARISON:');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Current Owner: ${currentOwner}`);
        console.log(`Your Deployer: ${wallet.address}`);
        console.log(`Trezor Address: ${trezorAddress}`);
        
        console.log('\n🔍 STATUS CHECK:');
        console.log(`Deployer matches current owner: ${wallet.address.toLowerCase() === currentOwner.toLowerCase()}`);
        console.log(`Current owner is Trezor: ${currentOwner.toLowerCase() === trezorAddress.toLowerCase()}`);
        
        if (wallet.address.toLowerCase() === currentOwner.toLowerCase()) {
            console.log('✅ You are the current owner - can proceed with upgrade');
        } else if (currentOwner.toLowerCase() === trezorAddress.toLowerCase()) {
            console.log('⚠️  Ownership already transferred to Trezor');
            console.log('   You need to use Trezor to make changes');
        } else {
            console.log('❌ Neither your wallet nor Trezor owns the contract');
            console.log('   Current owner is a different address');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDeployerInfo()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
