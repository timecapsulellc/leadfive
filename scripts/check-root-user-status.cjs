const { ethers } = require('ethers');

async function checkRootUser() {
    try {
        // Connect to BSC Mainnet (read-only)
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        
        // Contract address
        const contractAddress = '0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c';
        
        // Minimal ABI for checking root user
        const abi = [
            "function users(address) view returns (uint256 id, address referrer, uint256 partnersCount, uint256 levelExpiry, bool isActive)",
            "function userList(uint256) view returns (address)",
            "function currentId() view returns (uint256)"
        ];
        
        // Create contract instance (read-only)
        const contract = new ethers.Contract(contractAddress, abi, provider);
        
        // Check if address 0x140aad3E7c6bCC415Bc8E830699855fF072d405D is registered
        const checkAddress = '0x140aad3E7c6bCC415Bc8E830699855fF072d405D';
        const userInfo = await contract.users(checkAddress);
        const currentId = await contract.currentId();
        
        console.log('\n=== ROOT USER VERIFICATION ===');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Checking Address: ${checkAddress}`);
        console.log(`Current ID Counter: ${currentId.toString()}`);
        console.log('\n--- User Info ---');
        console.log(`User ID: ${userInfo.id.toString()}`);
        console.log(`Referrer: ${userInfo.referrer}`);
        console.log(`Partners Count: ${userInfo.partnersCount.toString()}`);
        console.log(`Is Active: ${userInfo.isActive}`);
        
        if (userInfo.id.toString() === '1' && userInfo.isActive) {
            console.log('\n✅ CONFIRMED: This address is the ROOT USER (ID: 1)');
        } else if (userInfo.id.toString() === '0') {
            console.log('\n❌ NOT REGISTERED: This address is not registered in the contract');
        } else {
            console.log(`\n⚠️  REGISTERED BUT NOT ROOT: This address has ID ${userInfo.id.toString()}, not root (ID: 1)`);
        }
        
        // Also check who has ID 1
        try {
            const rootAddress = await contract.userList(1);
            console.log(`\nActual Root User (ID 1): ${rootAddress}`);
        } catch (error) {
            console.log('\nNo root user registered yet (ID 1 empty)');
        }
        
    } catch (error) {
        console.error('Error checking root user:', error.message);
    }
}

checkRootUser();
