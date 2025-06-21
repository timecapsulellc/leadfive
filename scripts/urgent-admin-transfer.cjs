const { ethers } = require('hardhat');
require('dotenv').config();

async function urgentAdminTransfer() {
    console.log('🚨 URGENT: ADMIN ID SECURITY TRANSFER');
    console.log('='.repeat(50) + '\n');

    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
    const hotWallet = '0x0faF67B6E49827EcB42244b4C00F9962922Eb931';
    const trezorWallet = process.env.VITE_OWNER_ADDRESS;

    console.log('🔥 CURRENT SECURITY RISK');
    console.log('========================');
    console.log('Hot Wallet (VULNERABLE):', hotWallet);
    console.log('Trezor Wallet (SECURE):', trezorWallet);
    console.log('Contract:', contractAddress);
    console.log();
    console.log('❌ Hot wallet currently has ALL admin powers!');
    console.log('⚠️ This is like leaving your house keys in an unlocked car!');
    console.log();

    console.log('🎯 SOLUTION: TRANSFER TO TREZOR');
    console.log('===============================');
    console.log('We need to transfer ALL admin IDs from hot wallet to Trezor.');
    console.log();

    console.log('📋 STEP-BY-STEP INSTRUCTIONS');
    console.log('============================');
    console.log();
    console.log('1. 🌐 OPEN BSCSCAN:');
    console.log(`   https://bscscan.com/address/${contractAddress}#writeContract`);
    console.log();
    console.log('2. 🔐 CONNECT TREZOR:');
    console.log('   - Click "Connect to Web3"');
    console.log('   - Select your Trezor/MetaMask connected to Trezor');
    console.log(`   - Verify connected address: ${trezorWallet}`);
    console.log();
    console.log('3. 🔄 EXECUTE TRANSFERS:');
    console.log('   Execute each of these functions ONE BY ONE:');
    console.log();

    // Generate transfer instructions for all admin IDs
    for (let i = 0; i <= 9; i++) {
        console.log(`   Transfer Admin ID ${i}:`);
        console.log(`   Function: setAdminId`);
        console.log(`   Parameters: ${i}, ${trezorWallet}`);
        console.log(`   Gas: ~$1-2`);
        console.log();
    }

    console.log('📊 BEFORE vs AFTER');
    console.log('==================');
    console.log();
    console.log('BEFORE (CURRENT - DANGEROUS):');
    console.log('- Admin 0-9: Hot wallet 🔥 (VULNERABLE)');
    console.log('- Risk Level: 🚨 CRITICAL');
    console.log('- If compromised: Total loss of control');
    console.log();
    console.log('AFTER (TARGET - SECURE):');
    console.log('- Admin 0-9: Trezor wallet 🛡️ (SECURE)');
    console.log('- Risk Level: ✅ MINIMAL');
    console.log('- If hot wallet compromised: No impact on contract');
    console.log();

    console.log('💰 COST & TIME');
    console.log('==============');
    console.log('- Time: 10-15 minutes');
    console.log('- Gas Cost: ~$15-25 total (10 transactions)');
    console.log('- Security Value: PRICELESS');
    console.log();

    console.log('⚡ ALTERNATIVE: BATCH SCRIPT');
    console.log('============================');
    console.log('If you want to do this programmatically:');
    console.log();
    console.log('1. Create a script that connects with Trezor');
    console.log('2. Loop through admin IDs 0-9');
    console.log('3. Call setAdminId(i, trezorAddress) for each');
    console.log('4. Confirm each transaction on Trezor device');
    console.log();

    console.log('🔍 VERIFICATION STEPS');
    console.log('=====================');
    console.log('After completing all transfers:');
    console.log();
    console.log('1. Run verification script:');
    console.log('   node scripts/check-admin-ids.cjs');
    console.log();
    console.log('2. Expected output:');
    console.log('   ✅ Admin 0: ' + trezorWallet);
    console.log('   ✅ Admin 1: ' + trezorWallet);
    console.log('   ✅ Admin 2: ' + trezorWallet);
    console.log('   ✅ ... (all should show Trezor address)');
    console.log();
    console.log('3. If any still show hot wallet address, repeat transfer for that ID');
    console.log();

    console.log('🚨 CRITICAL REMINDERS');
    console.log('=====================');
    console.log('❗ Do this BEFORE any other tasks');
    console.log('❗ Each admin ID is a separate transaction');
    console.log('❗ Confirm each transaction on your Trezor device');
    console.log('❗ Don\'t skip any admin IDs');
    console.log('❗ Verify completion with the check script');
    console.log();

    console.log('🏁 FINAL GOAL');
    console.log('=============');
    console.log('Hot wallet powers: NONE ✅');
    console.log('Trezor wallet powers: FULL ADMIN ✅');
    console.log('Security status: MAXIMUM ✅');
    console.log();
    console.log('Once this is done, your contract will be properly secured!');
}

urgentAdminTransfer().catch(console.error);
