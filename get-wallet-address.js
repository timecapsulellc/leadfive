const { Wallet } = require('ethers');

// Your newly generated private key
const privateKey = '87b0bcee82a537bb103123af2b4089219f51736660e41100cd6118ea4222671f';

// Create wallet instance
const wallet = new Wallet(privateKey);

console.log('🔐 NEW TEMPORARY DEPLOYMENT WALLET GENERATED');
console.log('============================================');
console.log(`Private Key: ${privateKey}`);
console.log(`Address: ${wallet.address}`);
console.log('');
console.log('⚠️  SECURITY NOTES:');
console.log('   • This is a TEMPORARY key for deployment only');
console.log('   • Fund this address with ~0.1 BNB for gas');
console.log('   • ALL ownership will be transferred to your Trezor');
console.log('   • DESTROY this key after deployment completes');
console.log('');
console.log(`🏦 Fund this address: ${wallet.address}`);
console.log('   Send at least 0.1 BNB to this address on BSC Mainnet');
