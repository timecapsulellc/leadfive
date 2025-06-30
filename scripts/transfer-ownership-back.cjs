const { ethers } = require('ethers');

async function checkImplementationContract() {
    try {
        console.log('\n=== IMPLEMENTATION CONTRACT ANALYSIS ===');
        
        const implementationAddress = '0xc58620dd8fD9d244453e421E700c2D3FCFB595b4';
        const proxyAddress = '0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c';
        const deployerAddress = '0x140aad3E7c6bCC415Bc8E830699855fF072d405D';
        const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        
        console.log(`Implementation: ${implementationAddress}`);
        console.log(`Proxy (actual contract): ${proxyAddress}`);
        console.log(`Current Owner (Trezor): ${trezorAddress}`);
        console.log(`Target (Deployer): ${deployerAddress}`);
        
        // Connect to BSC Mainnet
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        
        // Basic ABI for ownership functions
        const abi = [
            "function owner() view returns (address)",
            "function transferOwnership(address newOwner) external",
            "function renounceOwnership() external"
        ];
        
        // Check current owner of the proxy (this is what matters)
        const proxyContract = new ethers.Contract(proxyAddress, abi, provider);
        const currentOwner = await proxyContract.owner();
        
        console.log('\n--- Current Ownership Status ---');
        console.log(`Proxy Owner: ${currentOwner}`);
        console.log(`Is Trezor Owner: ${currentOwner.toLowerCase() === trezorAddress.toLowerCase()}`);
        
        console.log('\n--- PLAN: Transfer Ownership Back to Deployer ---');
        console.log('⚠️  IMPORTANT: You need to use your TREZOR to do this!');
        console.log('\nOption 1: Use Implementation Contract on BSCScan');
        console.log(`1. Go to: https://bscscan.com/address/${implementationAddress}#writeContract`);
        console.log('2. Connect your Trezor wallet');
        console.log('3. Switch to BSC Mainnet');
        console.log('4. Find "transferOwnership" function');
        console.log(`5. Enter new owner: ${deployerAddress}`);
        console.log('6. Confirm with Trezor');
        
        console.log('\n⚠️  WARNING: This will affect the PROXY contract ownership!');
        console.log('Even though you\'re calling the implementation, it will change the proxy owner.');
        
        console.log('\n--- After Transfer ---');
        console.log('✅ Deployer address will become owner');
        console.log('✅ You can then register root user easily');
        console.log('✅ Later you can transfer back to Trezor for security');
        
        console.log('\n--- Alternative: Use MEW with Proxy Address ---');
        console.log('If implementation doesn\'t work, use MyEtherWallet:');
        console.log('1. Go to: https://www.myetherwallet.com/interface/interact-with-contract');
        console.log('2. Connect Trezor');
        console.log(`3. Use Proxy Address: ${proxyAddress}`);
        console.log('4. Use transferOwnership ABI');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkImplementationContract();
