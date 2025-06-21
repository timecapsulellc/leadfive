const { ethers } = require('hardhat');
require('dotenv').config();

async function checkAdminSecurity() {
    console.log('🔍 DEPLOYER SECURITY ANALYSIS');
    console.log('='.repeat(50) + '\n');

    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
    const deployerAddress = '0x0faF67B6E49827EcB42244b4C00F9962922Eb931';
    const currentOwner = process.env.VITE_OWNER_ADDRESS;
    const feeRecipient = process.env.VITE_FEE_RECIPIENT;

    console.log('📋 ADDRESS ANALYSIS');
    console.log('===================');
    console.log('🏗️  Deployer (Hot Wallet):', deployerAddress);
    console.log('👑 Current Owner:', currentOwner);
    console.log('💰 Fee Recipient:', feeRecipient);
    console.log();

    // Connect to BSC and check basic contract state
    const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
    
    const contractABI = [
        'function owner() view returns (address)',
        'function adminFeeRecipient() view returns (address)'
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    try {
        const actualOwner = await contract.owner();
        const actualFeeRecipient = await contract.adminFeeRecipient();
        
        console.log('🔐 VERIFIED CONTRACT STATE');
        console.log('==========================');
        console.log('✅ Actual Owner:', actualOwner);
        console.log('✅ Actual Fee Recipient:', actualFeeRecipient);
        console.log();
        
        console.log('🛡️ SECURITY STATUS');
        console.log('==================');
        
        const deployerIsOwner = actualOwner.toLowerCase() === deployerAddress.toLowerCase();
        const deployerIsFeeRecipient = actualFeeRecipient.toLowerCase() === deployerAddress.toLowerCase();
        
        console.log('Deployer is Contract Owner:', deployerIsOwner ? '❌ YES (RISK!)' : '✅ NO (SECURE)');
        console.log('Deployer is Fee Recipient:', deployerIsFeeRecipient ? '❌ YES (RISK!)' : '✅ NO (SECURE)');
        
        console.log();
        console.log('📊 DEPLOYER WALLET ANALYSIS');
        console.log('===========================');
        console.log('Address:', deployerAddress);
        console.log('Type: 🔥 Hot Wallet (MetaMask)');
        console.log('Security Level: ⚠️ MEDIUM RISK');
        console.log('Purpose: ✅ Deployment only (recommended)');
        console.log();
        console.log('Current Roles:');
        console.log('- Contract Owner:', deployerIsOwner ? '❌ YES' : '✅ NO');
        console.log('- Fee Recipient:', deployerIsFeeRecipient ? '❌ YES' : '✅ NO');
        console.log('- Admin Functions:', deployerIsOwner ? '❌ FULL ACCESS' : '✅ NO ACCESS');
        
        console.log();
        console.log('🎯 SECURITY RECOMMENDATIONS');
        console.log('============================');
        
        if (!deployerIsOwner && !deployerIsFeeRecipient) {
            console.log('🎉 EXCELLENT SECURITY SETUP!');
            console.log('✅ Deployer wallet has NO sensitive roles');
            console.log('✅ Contract owner is separate address');
            console.log('✅ Fee recipient is separate address');
            console.log('✅ Hot wallet is properly isolated');
            console.log();
            console.log('💡 OPTIONAL IMPROVEMENTS:');
            console.log('- Keep current setup (already secure) ✅');
            console.log('- Or upgrade owner to hardware wallet for extra security');
            console.log('- Current owner appears to be Trezor already ✅');
        } else {
            console.log('🚨 SECURITY ISSUES FOUND:');
            if (deployerIsOwner) {
                console.log('❌ Deployer wallet is contract owner (HIGH RISK)');
                console.log('   → Transfer ownership to hardware wallet');
            }
            if (deployerIsFeeRecipient) {
                console.log('❌ Deployer wallet receives fees (MEDIUM RISK)');
                console.log('   → Change fee recipient to secure wallet');
            }
        }
        
        console.log();
        console.log('🔒 WALLET SECURITY COMPARISON');
        console.log('=============================');
        console.log();
        console.log('🔥 Hot Wallet (Deployer):');
        console.log('   Security: ⚠️ Medium Risk');
        console.log('   Pros: Easy to use, fast transactions');
        console.log('   Cons: Private key on computer, malware risk');
        console.log('   Best for: Development, small amounts');
        console.log();
        console.log('🛡️ Hardware Wallet (Trezor/Ledger):');
        console.log('   Security: ✅ High Security');
        console.log('   Pros: Private key never exposed, physical confirmation');
        console.log('   Cons: Slightly slower, costs $50-150');
        console.log('   Best for: Production ownership, large amounts');
        console.log();
        console.log('🏢 Multi-Sig Wallet:');
        console.log('   Security: ✅ Highest Security');
        console.log('   Pros: Multiple signatures required, team control');
        console.log('   Cons: Complex setup, higher gas costs');
        console.log('   Best for: DAOs, companies, very large amounts');
        
        console.log();
        console.log('💡 RECOMMENDATION FOR YOUR PROJECT');
        console.log('==================================');
        
        if (!deployerIsOwner && !deployerIsFeeRecipient) {
            console.log('✅ CURRENT SETUP IS ALREADY SECURE!');
            console.log();
            console.log('Your deployer wallet has no sensitive roles.');
            console.log('No immediate action required.');
            console.log();
            console.log('Optional upgrades (not urgent):');
            console.log('1. Keep current setup ← Recommended');
            console.log('2. Verify owner is hardware wallet');
            console.log('3. Consider multi-sig for enterprise use');
        } else {
            console.log('🚨 ACTION RECOMMENDED:');
            console.log();
            console.log('OPTION 1: Hardware Wallet Transfer (Recommended)');
            console.log('- Transfer sensitive roles to Trezor/Ledger');
            console.log('- Cost: $50-150 for hardware wallet');
            console.log('- Security: High');
            console.log('- Complexity: Low');
            console.log();
            console.log('OPTION 2: Multi-Sig Wallet (Enterprise)');
            console.log('- Setup multi-signature wallet');
            console.log('- Cost: Higher gas fees');
            console.log('- Security: Highest');
            console.log('- Complexity: High');
        }

        // Check if owner looks like Trezor address
        const ownerLooksLikeTrezor = currentOwner === '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        if (ownerLooksLikeTrezor && !deployerIsOwner) {
            console.log();
            console.log('🎉 BONUS: Your owner appears to be a Trezor wallet!');
            console.log('   This is excellent security practice.');
        }

    } catch (error) {
        console.error('❌ Error checking security:', error.message);
    }
}

checkAdminSecurity().catch(console.error);
