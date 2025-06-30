const { ethers } = require('ethers');

async function checkOwnership() {
    try {
        // Connect to BSC Mainnet (read-only)
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        
        // Contract address
        const contractAddress = '0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c';
        
        // Minimal ABI for owner() function
        const abi = [
            "function owner() view returns (address)"
        ];
        
        // Create contract instance (read-only)
        const contract = new ethers.Contract(contractAddress, abi, provider);
        
        // Check current owner
        const currentOwner = await contract.owner();
        
        console.log('\n=== CONTRACT OWNERSHIP STATUS ===');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Current Owner: ${currentOwner}`);
        console.log(`Expected Trezor: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29`);
        console.log(`Ownership Transferred: ${currentOwner.toLowerCase() === '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'.toLowerCase() ? '✅ YES' : '❌ NO'}`);
        
        if (currentOwner.toLowerCase() === '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'.toLowerCase()) {
            console.log('\n🎉 SUCCESS: Contract ownership is already transferred to Trezor wallet!');
            console.log('No further action needed. The contract is secure.');
        } else {
            console.log('\n⚠️  WARNING: Contract is still owned by deployer wallet.');
            console.log('Ownership transfer may still be needed.');
        }
        
    } catch (error) {
        console.error('Error checking ownership:', error.message);
    }
}

checkOwnership();
