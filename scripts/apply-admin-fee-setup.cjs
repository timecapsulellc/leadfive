const { ethers } = require('hardhat');
require('dotenv').config();

async function applyAdminFeeSetup() {
    console.log('🔧 ADMIN FEE RECIPIENT SETUP - STEP BY STEP GUIDE');
    console.log('='.repeat(60) + '\n');

    // Get configuration from .env
    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
    const newFeeRecipient = process.env.VITE_FEE_RECIPIENT;
    const ownerAddress = process.env.VITE_OWNER_ADDRESS;

    console.log('📋 CONFIGURATION');
    console.log('================');
    console.log('Contract Address:', contractAddress);
    console.log('New Fee Recipient:', newFeeRecipient);
    console.log('Contract Owner:', ownerAddress);
    console.log();

    // Connect to BSC Mainnet to check current status
    const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
    
    const contractABI = [
        'function owner() view returns (address)',
        'function adminFeeRecipient() view returns (address)',
        'function totalAdminFeesCollected() view returns (uint96)',
        'function setAdminFeeRecipient(address _recipient) external'
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    try {
        console.log('🔍 CHECKING CURRENT STATUS');
        console.log('==========================');
        
        const currentOwner = await contract.owner();
        const currentFeeRecipient = await contract.adminFeeRecipient();
        const totalCollected = await contract.totalAdminFeesCollected();
        
        console.log('Current Owner:', currentOwner);
        console.log('Current Fee Recipient:', currentFeeRecipient);
        console.log('Total Fees Collected:', ethers.formatUnits(totalCollected, 18), 'USDT');
        
        const isZeroAddress = currentFeeRecipient === '0x0000000000000000000000000000000000000000';
        const isCorrectRecipient = currentFeeRecipient.toLowerCase() === newFeeRecipient.toLowerCase();
        
        console.log();
        if (isZeroAddress) {
            console.log('❌ CRITICAL: Admin fee recipient is ZERO ADDRESS!');
            console.log('💸 You are losing 5% of all withdrawals!');
        } else if (isCorrectRecipient) {
            console.log('✅ PERFECT: Admin fee recipient is correctly set!');
            console.log('💰 You are collecting 5% of all withdrawals!');
            return;
        } else {
            console.log('⚠️  WARNING: Admin fee recipient is set to different address!');
        }

        console.log();
        console.log('🎯 ACTION REQUIRED: SET ADMIN FEE RECIPIENT');
        console.log('===========================================');
        console.log();
        
        console.log('🌐 STEP 1: OPEN BSCSCAN');
        console.log('------------------------');
        console.log('Click this link to open BSCScan Write Contract page:');
        console.log(`https://bscscan.com/address/${contractAddress}#writeContract`);
        console.log();
        
        console.log('🔌 STEP 2: CONNECT WALLET');
        console.log('-------------------------');
        console.log('1. Click "Connect to Web3" button');
        console.log('2. Select your wallet (MetaMask, WalletConnect, etc.)');
        console.log('3. Make sure you\'re connected with the contract owner:');
        console.log(`   ${ownerAddress}`);
        console.log('4. Ensure you\'re on BSC Mainnet (Chain ID: 56)');
        console.log();
        
        console.log('⚙️  STEP 3: EXECUTE FUNCTION');
        console.log('----------------------------');
        console.log('1. Scroll down to find function: "setAdminFeeRecipient"');
        console.log('2. Click to expand the function');
        console.log('3. In the "_recipient (address)" field, enter:');
        console.log(`   ${newFeeRecipient}`);
        console.log('4. Click "Write" button');
        console.log('5. Confirm the transaction in your wallet');
        console.log('6. Wait for transaction confirmation');
        console.log();
        
        console.log('💰 STEP 4: VERIFY SUCCESS');
        console.log('-------------------------');
        console.log('1. After transaction confirms, go to Read Contract:');
        console.log(`   https://bscscan.com/address/${contractAddress}#readContract`);
        console.log('2. Find "adminFeeRecipient" function');
        console.log('3. Click "Query" - it should return:');
        console.log(`   ${newFeeRecipient}`);
        console.log('4. Run this script again to verify');
        console.log();
        
        console.log('💡 EXPECTED RESULTS');
        console.log('==================');
        console.log('✅ Admin fee recipient set to your address');
        console.log('✅ 5% of all user withdrawals go to you');
        console.log('✅ No more fees burned/lost');
        console.log('✅ Immediate revenue stream activation');
        console.log();
        
        console.log('🚨 IMPORTANT NOTES');
        console.log('==================');
        console.log('• Gas Cost: ~$1-3 (one-time setup)');
        console.log('• Revenue Impact: Immediate 5% collection');
        console.log('• Only contract owner can execute this');
        console.log('• This fixes the revenue loss issue permanently');
        console.log();
        
        console.log('📊 REVENUE CALCULATION');
        console.log('======================');
        console.log('Example: User withdraws $1,000');
        console.log('Before fix: $50 → 🔥 Burned (lost forever)');
        console.log('After fix:  $50 → 💰 Your wallet');
        console.log('User gets:  $950 (same in both cases)');
        console.log();
        
        if (isZeroAddress) {
            console.log('🚨 URGENT: Every withdrawal is costing you money!');
            console.log('⏰ Time to fix: 2-3 minutes');
            console.log('💸 Each $1,000 withdrawal = $50 lost until fixed');
        }

    } catch (error) {
        console.error('❌ Error checking contract status:', error.message);
        console.log();
        console.log('🔧 MANUAL SETUP (IF SCRIPT FAILS)');
        console.log('==================================');
        console.log('Even if this script fails, you can still set up manually:');
        console.log();
        console.log('1. Go to BSCScan Write Contract:');
        console.log(`   https://bscscan.com/address/${contractAddress}#writeContract`);
        console.log('2. Connect your owner wallet');
        console.log('3. Use setAdminFeeRecipient function');
        console.log(`4. Set to: ${newFeeRecipient}`);
        console.log('5. Execute transaction');
    }
    
    console.log();
    console.log('🔄 VERIFICATION SCRIPT');
    console.log('======================');
    console.log('After completing the setup, run this to verify:');
    console.log('node scripts/check-admin-fee.cjs');
    console.log();
    console.log('📞 NEED HELP?');
    console.log('=============');
    console.log('If you encounter any issues:');
    console.log('1. Ensure you\'re the contract owner');
    console.log('2. Check you\'re on BSC Mainnet');
    console.log('3. Verify sufficient BNB for gas');
    console.log('4. Try refreshing BSCScan page');
}

// Run the setup guide
applyAdminFeeSetup().catch(console.error);
