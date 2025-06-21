const { ethers } = require('hardhat');
require('dotenv').config();

async function analyzeAdminSecurity() {
    console.log('🔍 ADMIN SECURITY ANALYSIS');
    console.log('='.repeat(50) + '\n');

    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
    const deployerAddress = '0x0faF67B6E49827EcB42244b4C00F9962922Eb931';
    const currentOwner = process.env.VITE_OWNER_ADDRESS;
    const feeRecipient = process.env.VITE_FEE_RECIPIENT;

    console.log('📋 CURRENT ADDRESSES');
    console.log('====================');
    console.log('Contract:', contractAddress);
    console.log('Deployer (Hot):', deployerAddress);
    console.log('Current Owner:', currentOwner);
    console.log('Fee Recipient:', feeRecipient);
    console.log();

    // Connect to BSC and check contract state
    const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
    
    const contractABI = [
        'function owner() view returns (address)',
        'function adminFeeRecipient() view returns (address)',
        'function adminIds(uint256) view returns (address)',
        'function isAdmin(address) view returns (bool)'
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    try {
        const actualOwner = await contract.owner();
        const actualFeeRecipient = await contract.adminFeeRecipient();
        
        console.log('🔐 CONTRACT STATE');
        console.log('=================');
        console.log('Actual Owner:', actualOwner);
        console.log('Actual Fee Recipient:', actualFeeRecipient);
        
        // Check if deployer has any admin roles
        const isDeployerAdmin = await contract.isAdmin(deployerAddress);
        console.log('Deployer is Admin:', isDeployerAdmin ? 'YES ⚠️' : 'NO ✅');
        
        console.log();
        console.log('🛡️ SECURITY ASSESSMENT');
        console.log('======================');
        
        const isOwnerSecure = actualOwner !== deployerAddress;
        const isFeeRecipientSecure = actualFeeRecipient !== deployerAddress;
        
        console.log('Owner Security:', isOwnerSecure ? '✅ SECURE (Not deployer)' : '❌ RISK (Is deployer)');
        console.log('Fee Recipient Security:', isFeeRecipientSecure ? '✅ SECURE (Not deployer)' : '❌ RISK (Is deployer)');
        console.log('Admin Role Security:', !isDeployerAdmin ? '✅ SECURE (No admin role)' : '⚠️ RISK (Has admin role)');
        
        console.log();
        console.log('📊 DEPLOYER ADDRESS ANALYSIS');
        console.log('============================');
        console.log('Deployer Address:', deployerAddress);
        console.log('Type: Hot Wallet (MetaMask)');
        console.log('Used for: Initial deployment only');
        console.log('Current Roles:');
        console.log('- Contract Owner:', actualOwner === deployerAddress ? 'YES ❌' : 'NO ✅');
        console.log('- Admin Roles:', isDeployerAdmin ? 'YES ⚠️' : 'NO ✅');
        console.log('- Fee Recipient:', actualFeeRecipient === deployerAddress ? 'YES ❌' : 'NO ✅');
        
        console.log();
        console.log('🎯 SECURITY RECOMMENDATIONS');
        console.log('===========================');
        
        if (actualOwner === deployerAddress) {
            console.log('❌ CRITICAL: Transfer ownership from hot deployer wallet!');
            console.log('   Recommended: Hardware wallet (Trezor/Ledger)');
        } else {
            console.log('✅ GOOD: Ownership already transferred from deployer');
        }
        
        if (actualFeeRecipient === deployerAddress) {
            console.log('⚠️ WARNING: Change fee recipient from deployer wallet');
            console.log('   Recommended: Hardware wallet or multi-sig');
        } else {
            console.log('✅ GOOD: Fee recipient is not the deployer');
        }
        
        if (isDeployerAdmin) {
            console.log('⚠️ WARNING: Remove admin roles from deployer wallet');
            console.log('   Action: Use removeAdmin() function');
        } else {
            console.log('✅ GOOD: Deployer has no admin roles');
        }
        
        console.log();
        console.log('💡 WALLET SECURITY COMPARISON');
        console.log('=============================');
        console.log('Hot Wallet (Current Deployer):');
        console.log('- Security: ⚠️ Medium risk');
        console.log('- Private key stored on computer');
        console.log('- Vulnerable to malware/hacks');
        console.log('- Good for: Development only');
        console.log();
        
        console.log('Hardware Wallet (Trezor/Ledger):');
        console.log('- Security: ✅ High security');
        console.log('- Private key never leaves device');
        console.log('- Requires physical confirmation');
        console.log('- Good for: Production ownership');
        console.log();
        
        console.log('Multi-Sig Wallet:');
        console.log('- Security: ✅ Highest security');
        console.log('- Requires multiple signatures');
        console.log('- Best for large projects');
        console.log('- Good for: High-value operations');
        
        console.log();
        console.log('🔄 NEXT ACTIONS');
        console.log('===============');
        
        if (actualOwner === deployerAddress || actualFeeRecipient === deployerAddress || isDeployerAdmin) {
            console.log('🚨 ACTION REQUIRED: Secure the deployer roles');
            console.log();
            console.log('Option 1: Transfer to Hardware Wallet');
            console.log('- Most secure for individual ownership');
            console.log('- Trezor or Ledger recommended');
            console.log('- Easy to use for admin functions');
            console.log();
            console.log('Option 2: Transfer to Multi-Sig');
            console.log('- Best for team/company ownership');
            console.log('- Requires multiple people to sign');
            console.log('- More complex but highest security');
        } else {
            console.log('✅ EXCELLENT: All critical roles secured!');
            console.log('The deployer wallet has no sensitive roles.');
            console.log('Your contract is properly secured.');
        }

    } catch (error) {
        console.error('❌ Error analyzing security:', error.message);
    }
}

analyzeAdminSecurity().catch(console.error);
