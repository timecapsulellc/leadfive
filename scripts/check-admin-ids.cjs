const { ethers } = require('hardhat');
require('dotenv').config();

async function checkAdminIds() {
    console.log('🔍 CHECKING ADMIN ID CONFIGURATION');
    console.log('='.repeat(50) + '\n');

    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
    const deployerAddress = '0x0faF67B6E49827EcB42244b4C00F9962922Eb931';
    const currentOwner = process.env.VITE_OWNER_ADDRESS;
    const feeRecipient = process.env.VITE_FEE_RECIPIENT;

    console.log('📋 ADDRESSES TO CHECK');
    console.log('=====================');
    console.log('Contract:', contractAddress);
    console.log('Deployer (Hot):', deployerAddress);
    console.log('Current Owner:', currentOwner);
    console.log('Fee Recipient:', feeRecipient);
    console.log();

    // Connect to BSC Mainnet
    const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
    
    const contractABI = [
        'function owner() view returns (address)',
        'function adminFeeRecipient() view returns (address)',
        'function adminIds(uint256) view returns (address)',
        'function getAdminIdCount() view returns (uint256)',
        'function setAdminId(uint256 _id, address _admin) external',
        'function removeAdminId(uint256 _id) external'
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    try {
        console.log('🔐 CONTRACT STATE');
        console.log('=================');
        
        const actualOwner = await contract.owner();
        const actualFeeRecipient = await contract.adminFeeRecipient();
        
        console.log('Contract Owner:', actualOwner);
        console.log('Fee Recipient:', actualFeeRecipient);
        console.log();
        
        console.log('👥 ADMIN ID CONFIGURATION');
        console.log('=========================');
        
        // Check admin IDs 0-9 (most contracts use this range)
        const adminIds = [];
        const deployerAdminIds = [];
        
        for (let i = 0; i < 10; i++) {
            try {
                const adminAddress = await contract.adminIds(i);
                adminIds.push({ id: i, address: adminAddress });
                
                console.log(`Admin ${i}:`, adminAddress);
                
                // Check if this admin ID is set to the deployer
                if (adminAddress.toLowerCase() === deployerAddress.toLowerCase()) {
                    deployerAdminIds.push(i);
                }
                
                // Check if it's zero address (not set)
                if (adminAddress === '0x0000000000000000000000000000000000000000') {
                    console.log(`         ↳ ⚪ Not set (zero address)`);
                } else if (adminAddress.toLowerCase() === deployerAddress.toLowerCase()) {
                    console.log(`         ↳ ⚠️  DEPLOYER WALLET (SECURITY RISK!)`);
                } else if (adminAddress.toLowerCase() === currentOwner.toLowerCase()) {
                    console.log(`         ↳ ✅ Current Owner (secure)`);
                } else {
                    console.log(`         ↳ 🔍 Other address`);
                }
                
            } catch (error) {
                // This admin ID doesn't exist or contract doesn't support it
                break;
            }
        }
        
        console.log();
        console.log('📊 SECURITY ANALYSIS');
        console.log('====================');
        
        if (deployerAdminIds.length > 0) {
            console.log('🚨 SECURITY ISSUE FOUND!');
            console.log(`❌ Deployer wallet has ${deployerAdminIds.length} admin ID(s): ${deployerAdminIds.join(', ')}`);
            console.log('⚠️  This gives the hot wallet admin privileges!');
            console.log();
            console.log('🎯 IMMEDIATE ACTION REQUIRED:');
            console.log('============================');
            console.log('You need to remove or reassign these admin IDs from the deployer wallet.');
            console.log();
            
            console.log('🔧 HOW TO FIX:');
            console.log('==============');
            console.log('Go to BSCScan Write Contract:');
            console.log(`https://bscscan.com/address/${contractAddress}#writeContract`);
            console.log();
            
            for (const adminId of deployerAdminIds) {
                console.log(`Option 1 - Remove Admin ID ${adminId}:`);
                console.log(`   Function: removeAdminId(${adminId})`);
                console.log();
                console.log(`Option 2 - Reassign Admin ID ${adminId} to secure wallet:`);
                console.log(`   Function: setAdminId(${adminId}, ${currentOwner})`);
                console.log();
            }
            
            console.log('💡 RECOMMENDATION:');
            console.log('- Reassign admin IDs 1-2 to your Trezor wallet');
            console.log('- Remove or reassign any others');
            console.log('- Keep only necessary admin IDs active');
            
        } else {
            console.log('✅ EXCELLENT: No security issues found!');
            console.log('✅ Deployer wallet has no admin IDs');
            console.log('✅ Admin system is properly secured');
        }
        
        console.log();
        console.log('🎯 RECOMMENDED ADMIN SETUP');
        console.log('==========================');
        console.log('Optimal configuration:');
        console.log(`- Admin 1: ${currentOwner} (Trezor - primary admin)`);
        console.log(`- Admin 2: ${currentOwner} (Trezor - backup admin)`);
        console.log('- Admin 3+: Not set (keep minimal)');
        console.log();
        console.log('This gives you admin functions while keeping security high.');

    } catch (error) {
        console.error('❌ Error checking admin IDs:', error.message);
        console.log();
        console.log('ℹ️  This might mean the contract doesn\'t use admin IDs,');
        console.log('   or they\'re implemented differently.');
        console.log();
        console.log('🔍 MANUAL CHECK:');
        console.log('================');
        console.log('1. Go to BSCScan Read Contract:');
        console.log(`   https://bscscan.com/address/${contractAddress}#readContract`);
        console.log('2. Look for functions like:');
        console.log('   - adminIds');
        console.log('   - getAdmin');
        console.log('   - isAdmin');
        console.log('3. Check if deployer has admin roles');
    }
}

checkAdminIds().catch(console.error);
