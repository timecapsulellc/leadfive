const { ethers } = require('hardhat');
require('dotenv').config();

async function checkProxyAndImplementation() {
    console.log('🔍 CHECKING PROXY AND IMPLEMENTATION CONTRACTS');
    console.log('='.repeat(60) + '\n');

    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
    const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);

    console.log('📋 MAIN CONTRACT ANALYSIS');
    console.log('=========================');
    console.log('Contract Address:', contractAddress);
    console.log();

    try {
        // Check if this is a proxy contract
        const implementationSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
        const implementationAddress = await provider.getStorage(contractAddress, implementationSlot);
        
        if (implementationAddress !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
            const actualImplementation = '0x' + implementationAddress.slice(-40);
            console.log('🎯 PROXY CONTRACT DETECTED!');
            console.log('===========================');
            console.log('Proxy Address:', contractAddress);
            console.log('Implementation Address:', actualImplementation);
            console.log();
            
            // Check if implementation has different functions
            console.log('🔍 CHECKING IMPLEMENTATION CONTRACT');
            console.log('===================================');
            console.log('Implementation BSCScan:');
            console.log(`https://bscscan.com/address/${actualImplementation}#code`);
            console.log();
            console.log('Implementation Write Functions:');
            console.log(`https://bscscan.com/address/${actualImplementation}#writeContract`);
            console.log();
            
        } else {
            console.log('📄 STANDARD CONTRACT (No Proxy)');
            console.log('=================================');
        }

        // Check for admin-related functions in main contract
        const mainContractABI = [
            'function owner() view returns (address)',
            'function adminIds(uint256) view returns (address)',
            'function adminFeeRecipient() view returns (address)'
        ];

        const contract = new ethers.Contract(contractAddress, mainContractABI, provider);
        
        console.log('🔐 MAIN CONTRACT STATE');
        console.log('======================');
        const owner = await contract.owner();
        const feeRecipient = await contract.adminFeeRecipient();
        
        console.log('Owner:', owner);
        console.log('Fee Recipient:', feeRecipient);
        console.log();

        // Check for InternalAdminManager
        console.log('🎯 SEARCHING FOR ADMIN MANAGER');
        console.log('==============================');
        
        // Try to find if InternalAdminManager is deployed separately
        // Check deployment logs for InternalAdminManager address
        
        console.log('💡 POTENTIAL SOLUTIONS');
        console.log('======================');
        console.log();
        console.log('Option 1: Check Implementation Contract');
        console.log('- The implementation might have admin management functions');
        console.log('- Check BSCScan for implementation contract functions');
        console.log();
        console.log('Option 2: InternalAdminManager Contract');
        console.log('- Separate contract for managing admin IDs');
        console.log('- Need to find its deployment address');
        console.log();
        console.log('Option 3: AdminFunctions Library');
        console.log('- Admin functions might be in library');
        console.log('- Accessible through delegatecall');
        console.log();
        
        console.log('🔍 NEXT STEPS TO FIND ADMIN FUNCTIONS');
        console.log('=====================================');
        console.log('1. Check implementation contract on BSCScan');
        console.log('2. Look for InternalAdminManager deployment');
        console.log('3. Check if admin functions are inherited');
        console.log('4. Review deployment logs for all contracts');

    } catch (error) {
        console.error('❌ Error checking contracts:', error.message);
    }
}

checkProxyAndImplementation().catch(console.error);
