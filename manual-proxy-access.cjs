const hre = require("hardhat");

async function verifyProxyManual() {
    try {
        console.log('\n=== MANUAL PROXY VERIFICATION GUIDE ===');
        
        const proxyAddress = '0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c';
        const implementationAddress = '0xc58620dd8fD9d244453e421E700c2D3FCFB595b4';
        
        console.log('\nSince automated verification might not work, here\'s how to manually verify:');
        console.log('\n--- Method 1: Manual BSCScan Verification ---');
        console.log('1. Go to: https://bscscan.com/verifyContract');
        console.log('2. Select "Via Standard JSON Input"');
        console.log(`3. Contract Address: ${proxyAddress}`);
        console.log('4. Compiler: v0.8.19+commit.7dd6d404');
        console.log('5. Contract Name: ERC1967Proxy');
        console.log('6. Upload the JSON file with proxy contract details');
        
        console.log('\n--- Method 2: Direct Write Functions Access ---');
        console.log('Even without verification, you can use these methods:');
        console.log('\n🔹 MyEtherWallet (MEW):');
        console.log('1. Go to: https://www.myetherwallet.com/interface/interact-with-contract');
        console.log('2. Connect your Trezor');
        console.log('3. Switch to BSC Mainnet');
        console.log(`4. Contract Address: ${proxyAddress}`);
        console.log('5. Use this simplified ABI:');
        
        const registerUserABI = {
            "inputs": [
                {"internalType": "address", "name": "userAddress", "type": "address"},
                {"internalType": "address", "name": "referrerAddress", "type": "address"}
            ],
            "name": "registerUser",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        };
        
        console.log(JSON.stringify(registerUserABI, null, 2));
        
        console.log('\n🔹 Remix IDE:');
        console.log('1. Go to: https://remix.ethereum.org');
        console.log('2. Connect to "Injected Provider" (MetaMask with Trezor)');
        console.log('3. Switch to BSC Mainnet');
        console.log('4. Use "At Address" feature');
        console.log(`5. Address: ${proxyAddress}`);
        console.log('6. Load your contract ABI');
        
        console.log('\n--- Method 3: Try Proxy Tab ---');
        console.log('Sometimes BSCScan shows proxy functions in a separate tab:');
        console.log(`1. Go to: https://bscscan.com/address/${proxyAddress}#writeProxyContract`);
        console.log('2. Look for "Write as Proxy" or "Proxy Contract" tabs');
        console.log('3. Connect your wallet there');
        
        console.log('\n--- Parameters for registerUser function ---');
        console.log('userAddress: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29');
        console.log('referrerAddress: 0x0000000000000000000000000000000000000000');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyProxyManual();
