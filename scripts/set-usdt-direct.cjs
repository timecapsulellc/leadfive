require('dotenv').config();
const { ethers } = require('hardhat');

async function setUSDTAddressDirect() {
    console.log('🔧 SETTING USDT ADDRESS DIRECTLY');
    console.log('='.repeat(50));
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
        const correctUSDTAddress = process.env.VITE_USDT_CONTRACT_ADDRESS;
        
        console.log(`Contract: ${proxyAddress}`);
        console.log(`USDT: ${correctUSDTAddress}`);
        console.log(`Caller: ${wallet.address}`);
        
        // Create the contract interface manually
        const contractABI = [
            "function setUSDTAddress(address _usdt) external",
            "function usdt() external view returns (address)",
            "function owner() external view returns (address)",
            "function getPackagePrice(uint8 level) external view returns (uint96)"
        ];
        
        const contract = new ethers.Contract(proxyAddress, contractABI, wallet);
        
        // Check current state
        console.log(`\n🔍 Current State:`);
        const currentUSDT = await contract.usdt();
        const owner = await contract.owner();
        
        console.log(`Owner: ${owner}`);
        console.log(`Current USDT: ${currentUSDT}`);
        console.log(`Target USDT: ${correctUSDTAddress}`);
        
        if (currentUSDT.toLowerCase() === correctUSDTAddress.toLowerCase()) {
            console.log('✅ USDT address is already correct!');
            return { success: true, alreadyCorrect: true };
        }
        
        // Call setUSDTAddress
        console.log(`\n🔨 Setting USDT Address...`);
        
        const tx = await contract.setUSDTAddress(correctUSDTAddress);
        console.log(`Transaction: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log(`✅ Success in block: ${receipt.blockNumber}`);
        
        // Verify
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newUSDT = await contract.usdt();
        console.log(`\n✅ New USDT Address: ${newUSDT}`);
        console.log(`✅ Correct: ${newUSDT.toLowerCase() === correctUSDTAddress.toLowerCase()}`);
        
        // Test a package price to ensure contract is working
        try {
            const price1 = await contract.getPackagePrice(1);
            console.log(`✅ Package 1 Price: ${ethers.formatUnits(price1, 6)} USDT`);
        } catch (error) {
            console.log(`Package price test: ${error.message}`);
        }
        
        console.log(`\n🎉 USDT ADDRESS SUCCESSFULLY SET!`);
        
        return {
            success: true,
            usdtAddress: newUSDT,
            transactionHash: tx.hash
        };
        
    } catch (error) {
        console.error('❌ Failed:', error.message);
        
        if (error.message.includes('execution reverted')) {
            console.log('\n💡 Possible reasons:');
            console.log('1. Not authorized (not owner)');
            console.log('2. Function does not exist');
            console.log('3. Contract is paused');
            console.log('4. Invalid USDT address');
        }
        
        throw error;
    }
}

// Only run if called directly
if (require.main === module) {
    setUSDTAddressDirect()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = setUSDTAddressDirect;
