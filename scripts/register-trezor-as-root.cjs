const { ethers } = require('ethers');

async function registerTrezorAsRoot() {
    try {
        console.log('\n=== REGISTER TREZOR AS ROOT USER ===');
        console.log('This script will help you register your Trezor address as Root User (ID 1)');
        console.log('⚠️  You will need to connect your Trezor wallet to complete this transaction');
        
        // Contract details
        const contractAddress = '0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c';
        const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        
        console.log(`\nContract Address: ${contractAddress}`);
        console.log(`Trezor Address (will be Root): ${trezorAddress}`);
        
        // Connect to BSC Mainnet
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        
        // Contract ABI for registerUser function
        const abi = [
            "function registerUser(address userAddress, address referrerAddress) external",
            "function owner() view returns (address)",
            "function currentId() view returns (uint256)"
        ];
        
        console.log('\n--- Step 1: Verify Contract Ownership ---');
        const contract = new ethers.Contract(contractAddress, abi, provider);
        const currentOwner = await contract.owner();
        console.log(`Current Owner: ${currentOwner}`);
        
        if (currentOwner.toLowerCase() !== trezorAddress.toLowerCase()) {
            console.log('❌ ERROR: Your Trezor is not the contract owner');
            return;
        }
        console.log('✅ Confirmed: Your Trezor owns this contract');
        
        console.log('\n--- Step 2: Check Current Registration Status ---');
        try {
            const currentId = await contract.currentId();
            console.log(`Current ID Counter: ${currentId.toString()}`);
            
            if (currentId.toString() !== '0') {
                console.log('⚠️  WARNING: Users may already be registered');
            }
        } catch (error) {
            console.log('Contract not fully initialized yet - this is normal');
        }
        
        console.log('\n--- Step 3: Transaction Details ---');
        console.log('Function to call: registerUser()');
        console.log(`Parameter 1 (userAddress): ${trezorAddress}`);
        console.log(`Parameter 2 (referrerAddress): ${ethers.ZeroAddress} (0x0000...)`);
        
        console.log('\n--- Step 4: Manual Transaction Instructions ---');
        console.log('Since you need to use your Trezor hardware wallet, please:');
        console.log('\n1. Connect your Trezor to MetaMask or your preferred wallet');
        console.log('2. Switch to BSC Mainnet (Chain ID: 56)');
        console.log('3. Go to the contract on BSCScan:');
        console.log(`   https://bscscan.com/address/${contractAddress}#writeContract`);
        console.log('4. Connect your Trezor wallet');
        console.log('5. Find "registerUser" function');
        console.log('6. Enter these parameters:');
        console.log(`   - userAddress: ${trezorAddress}`);
        console.log(`   - referrerAddress: 0x0000000000000000000000000000000000000000`);
        console.log('7. Confirm transaction with your Trezor');
        
        console.log('\n--- Alternative: Using MyEtherWallet (MEW) ---');
        console.log('1. Go to: https://www.myetherwallet.com/interface/interact-with-contract');
        console.log('2. Connect your Trezor');
        console.log('3. Switch to BSC network');
        console.log(`4. Contract Address: ${contractAddress}`);
        console.log('5. Use this ABI for registerUser function:');
        console.log(JSON.stringify([
            {
                "inputs": [
                    {"internalType": "address", "name": "userAddress", "type": "address"},
                    {"internalType": "address", "name": "referrerAddress", "type": "address"}
                ],
                "name": "registerUser",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ], null, 2));
        
        console.log('\n✅ After successful transaction:');
        console.log(`- Your Trezor address (${trezorAddress}) will be Root User (ID 1)`);
        console.log('- The MLM system will be fully initialized');
        console.log('- Users can start registering through your platform');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

registerTrezorAsRoot();
