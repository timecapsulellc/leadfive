const { ethers } = require('ethers');

async function checkRootUserSimple() {
    try {
        // Connect to BSC Mainnet (read-only)
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        
        // Contract address
        const contractAddress = '0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c';
        
        // Check if address is registered by calling getUserInfo
        const abi = [
            "function getUserInfo(address) view returns (uint256, address, uint256, uint256, bool)"
        ];
        
        const contract = new ethers.Contract(contractAddress, abi, provider);
        
        const checkAddress = '0x140aad3E7c6bCC415Bc8E830699855fF072d405D';
        
        console.log('\n=== ROOT USER CHECK ===');
        console.log(`Contract: ${contractAddress}`);
        console.log(`Checking: ${checkAddress}`);
        
        try {
            const userInfo = await contract.getUserInfo(checkAddress);
            console.log(`\nUser ID: ${userInfo[0].toString()}`);
            console.log(`Referrer: ${userInfo[1]}`);
            console.log(`Partners: ${userInfo[2].toString()}`);
            console.log(`Level Expiry: ${userInfo[3].toString()}`);
            console.log(`Is Active: ${userInfo[4]}`);
            
            if (userInfo[0].toString() === '1') {
                console.log('\n✅ YES: This address is ROOT USER (ID: 1)');
            } else if (userInfo[0].toString() === '0') {
                console.log('\n❌ NOT REGISTERED: This address needs to be registered as root user');
            } else {
                console.log(`\n⚠️  REGISTERED: This address has ID ${userInfo[0].toString()}, not root user`);
            }
        } catch (error) {
            console.log('\n❌ ERROR: Could not retrieve user info - contract may not be initialized');
            console.log('This usually means the root user has not been registered yet');
        }
        
    } catch (error) {
        console.error('Connection error:', error.message);
    }
}

checkRootUserSimple();
