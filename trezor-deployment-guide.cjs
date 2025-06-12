const fs = require('fs');

console.log('\n' + '='.repeat(80));
console.log('🔐 TREZOR SUITE WEB DEPLOYMENT INSTRUCTIONS');
console.log('='.repeat(80));

const TREZOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
const USDT_TESTNET = '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684';

console.log('\n📋 DEPLOYMENT CONFIGURATION:');
console.log(`   • Contract: OrphiCrowdFund`);
console.log(`   • Network: BSC Testnet (Chain ID: 97)`);
console.log(`   • Trezor Address: ${TREZOR_ADDRESS}`);
console.log(`   • USDT Token: ${USDT_TESTNET}`);
console.log(`   • All Admin Roles: Assigned to Trezor`);

console.log('\n🚀 TREZOR SUITE WEB DEPLOYMENT STEPS:');
console.log('════════════════════════════════════════');

console.log('\n1. 🌐 OPEN TREZOR SUITE WEB:');
console.log('   https://suite.trezor.io/web/');

console.log('\n2. 🔌 CONNECT YOUR TREZOR:');
console.log('   • Connect device via USB');
console.log('   • Unlock with PIN');
console.log('   • Allow Suite Web to connect');

console.log('\n3. ⚙️ ADD BSC TESTNET NETWORK:');
console.log('   • Go to Settings → Coins → Add Network');
console.log('   • Add custom network:');
console.log('     - Name: BSC Testnet');
console.log('     - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/');
console.log('     - Chain ID: 97');
console.log('     - Symbol: BNB');
console.log('     - Explorer: https://testnet.bscscan.com');

console.log('\n4. 📍 VERIFY YOUR ADDRESS:');
console.log(`   Expected: ${TREZOR_ADDRESS}`);
console.log('   Confirm this matches in Trezor Suite Web');

console.log('\n5. 💰 CHECK BALANCE:');
console.log('   • You have 0.1 test BNB (sufficient for deployment)');
console.log('   • If needed, get more from: https://testnet.binance.org/faucet-smart');

console.log('\n6. 🚀 DEPLOY CONTRACT:');
console.log('   OPTION A - Use Trezor Suite Web Apps:');
console.log('   • Look for "Apps" or "DeFi" section');
console.log('   • Find smart contract deployment tools');
console.log('   • Deploy OrphiCrowdFund contract');
console.log('');
console.log('   OPTION B - Manual Transaction:');
console.log('   • Go to "Send" section');
console.log('   • Advanced/Raw transaction mode');
console.log('   • Create contract deployment transaction');

console.log('\n7. ⚡ INITIALIZE CONTRACT:');
console.log('   After deployment, call initialize() with:');
console.log(`   • _usdtToken: ${USDT_TESTNET}`);
console.log(`   • _treasuryAddress: ${TREZOR_ADDRESS}`);
console.log(`   • _emergencyAddress: ${TREZOR_ADDRESS}`);
console.log(`   • _poolManagerAddress: ${TREZOR_ADDRESS}`);

console.log('\n8. ✅ VERIFY DEPLOYMENT:');
console.log('   • Check contract on: https://testnet.bscscan.com');
console.log('   • Verify admin roles assigned to your Trezor');

console.log('\n🔗 USEFUL LINKS:');
console.log(`   • Trezor Suite Web: https://suite.trezor.io/web/`);
console.log(`   • Your Explorer: https://testnet.bscscan.com/address/${TREZOR_ADDRESS}`);
console.log(`   • BSC Testnet Faucet: https://testnet.binance.org/faucet-smart`);

console.log('\n🛡️ SECURITY REMINDERS:');
console.log('   • Only use https://suite.trezor.io/web/');
console.log('   • Verify all transaction details on Trezor screen');
console.log('   • Your private keys never leave the hardware device');
console.log('   • All admin functions will require Trezor confirmation');

console.log('\n✅ YOU ARE READY TO DEPLOY!');
console.log('   Open Trezor Suite Web and follow the steps above');

// Check if contract artifacts exist
const contractPath = './artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json';
if (fs.existsSync(contractPath)) {
    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    console.log('\n📄 CONTRACT DATA AVAILABLE:');
    console.log(`   • Bytecode length: ${contractArtifact.bytecode.length} characters`);
    console.log(`   • ABI functions: ${contractArtifact.abi.length} entries`);
    console.log('   • Ready for deployment via Trezor Suite Web');
} else {
    console.log('\n⚠️ Contract needs compilation first:');
    console.log('   Run: npx hardhat compile');
}

console.log('\n🎯 NEXT ACTION: Open https://suite.trezor.io/web/ and begin deployment!');
