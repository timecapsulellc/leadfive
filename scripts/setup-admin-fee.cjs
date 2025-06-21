const { ethers } = require('hardhat');
require('dotenv').config();

async function setupAdminFee() {
    console.log('🔧 ADMIN FEE RECIPIENT SETUP GUIDE');
    console.log('=====================================\n');

    // Contract details
    const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
    const trezorAddress = process.env.VITE_OWNER_ADDRESS;
    
    if (!contractAddress || !trezorAddress) {
        console.log('❌ Missing contract or Trezor address in .env');
        return;
    }

    console.log('📋 Contract Address:', contractAddress);
    console.log('🔐 Trezor Address:', trezorAddress);
    console.log();

    // Connect to BSC Mainnet
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    
    // Contract ABI (minimal for checking)
    const contractABI = [
        'function adminFeeRecipient() view returns (address)',
        'function owner() view returns (address)',
        'function totalAdminFeesCollected() view returns (uint96)',
        'function setAdminFeeRecipient(address _recipient) external'
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    try {
        // Check current state
        console.log('🔍 CURRENT STATE CHECK');
        console.log('======================');
        
        const currentRecipient = await contract.adminFeeRecipient();
        const currentOwner = await contract.owner();
        const totalCollected = await contract.totalAdminFeesCollected();
        
        console.log('👑 Current Owner:', currentOwner);
        console.log('💰 Current Admin Fee Recipient:', currentRecipient);
        console.log('📊 Total Admin Fees Collected:', ethers.formatUnits(totalCollected, 18), 'USDT');
        console.log();

        // Check if recipient is zero address
        const isZeroAddress = currentRecipient === '0x0000000000000000000000000000000000000000';
        
        if (isZeroAddress) {
            console.log('❌ CRITICAL: Admin fee recipient is ZERO ADDRESS!');
            console.log('💸 ALL ADMIN FEES ARE BEING BURNED!');
            console.log('🚨 You are losing 5% of all user withdrawals!');
        } else if (currentRecipient.toLowerCase() === trezorAddress.toLowerCase()) {
            console.log('✅ PERFECT: Admin fee recipient is set to your Trezor!');
            console.log('💰 You are collecting 5% of all withdrawals!');
        } else {
            console.log('⚠️  WARNING: Admin fee recipient is set to unknown address!');
            console.log('🤔 Expected:', trezorAddress);
            console.log('🔍 Actual:', currentRecipient);
        }
        
        console.log();
        console.log('📋 SETUP INSTRUCTIONS');
        console.log('=====================');
        console.log();
        
        if (isZeroAddress || currentRecipient.toLowerCase() !== trezorAddress.toLowerCase()) {
            console.log('🎯 ACTION REQUIRED: Set admin fee recipient to your Trezor');
            console.log();
            console.log('📝 Method 1: BSCScan Web Interface (RECOMMENDED)');
            console.log('------------------------------------------------');
            console.log('1. Go to BSCScan Write Contract:');
            console.log(`   https://bscscan.com/address/${contractAddress}#writeContract`);
            console.log();
            console.log('2. Connect your Trezor wallet (must be contract owner)');
            console.log();
            console.log('3. Find function: setAdminFeeRecipient');
            console.log();
            console.log('4. Enter recipient address:');
            console.log(`   ${trezorAddress}`);
            console.log();
            console.log('5. Execute the transaction');
            console.log();
            console.log('💡 Gas fee: ~$1-2 (one-time setup)');
            console.log('💰 Revenue impact: Start collecting 5% of all withdrawals');
            console.log();
            
            console.log('📱 Method 2: Programmatic (Advanced)');
            console.log('------------------------------------');
            console.log('// With Trezor connected to dApp:');
            console.log('await contract.setAdminFeeRecipient(');
            console.log(`  "${trezorAddress}"`);
            console.log(');');
            console.log();
        }
        
        console.log('🔍 VERIFICATION STEPS');
        console.log('=====================');
        console.log('After setting admin fee recipient:');
        console.log();
        console.log('1. Run this script again to verify');
        console.log('2. Check BSCScan Read Contract:');
        console.log(`   https://bscscan.com/address/${contractAddress}#readContract`);
        console.log('3. Look for adminFeeRecipient → should show your Trezor');
        console.log('4. Make a test withdrawal to verify fee collection');
        console.log();
        
        console.log('💡 REVENUE IMPACT');
        console.log('=================');
        console.log('• Admin Fee Rate: 5% of all withdrawals');
        console.log('• Revenue Stream: Immediate after setup');
        console.log('• Example: $1,000 withdrawal → $50 to your Trezor');
        console.log('• Monthly potential: $1,000s depending on platform usage');
        console.log();
        
        if (isZeroAddress) {
            console.log('🚨 URGENT: Every minute you delay costs potential revenue!');
            console.log('⏰ Setup time: 2-3 minutes via BSCScan');
            console.log('💸 Current loss: 5% of every withdrawal goes to void');
        }

    } catch (error) {
        console.error('❌ Error checking contract state:', error.message);
        console.log();
        console.log('🔧 MANUAL SETUP INSTRUCTIONS');
        console.log('============================');
        console.log('If script fails, you can still set up via BSCScan:');
        console.log();
        console.log('1. Go to:');
        console.log(`   https://bscscan.com/address/${contractAddress}#writeContract`);
        console.log();
        console.log('2. Connect Trezor wallet');
        console.log('3. Use setAdminFeeRecipient function');
        console.log(`4. Set to: ${trezorAddress}`);
    }
}

// Run the setup guide
setupAdminFee().catch(console.error);
