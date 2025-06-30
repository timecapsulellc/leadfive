import { ethers } from 'ethers';

// Configuration
const CONTRACT_ADDRESS = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';

// Minimal ABI for testing registration
const CONTRACT_ABI = [
    'function register(address referrer, uint8 packageLevel, bool useUSDT) external payable',
    'function packages(uint8) view returns (uint256 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus)',
    'function isRegistered(address) view returns (bool)',
    'function getUserInfo(address) view returns (uint8, uint8, uint256, uint256, address)'
];

async function testRegistration(testWalletPrivateKey = null) {
    console.log('🧪 LEADFIVE REGISTRATION TEST');
    console.log('============================\n');
    
    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    try {
        // First, verify packages are initialized
        console.log('📦 Checking package initialization...');
        const pkg1 = await contract.packages(0);
        
        if (pkg1.price.eq(0)) {
            console.log('❌ Package 1 is not initialized!');
            console.log('   Run: node initialize-contract.js for setup instructions');
            return;
        }
        
        const priceInBNB = ethers.formatEther(pkg1.price);
        console.log(`✅ Package 1 price: ${priceInBNB} BNB`);
        console.log(`✅ Direct bonus: ${pkg1.directBonus / 100}%\n`);
        
        // If private key provided, attempt actual registration
        if (testWalletPrivateKey) {
            console.log('🚀 Attempting test registration...');
            
            const wallet = new ethers.Wallet(testWalletPrivateKey, provider);
            const contractWithSigner = contract.connect(wallet);
            
            // Check if already registered
            const isRegistered = await contract.isRegistered(wallet.address);
            if (isRegistered) {
                console.log('⚠️  This wallet is already registered!');
                
                // Get user info
                const userInfo = await contract.getUserInfo(wallet.address);
                console.log(`   Current package level: ${userInfo[0]}`);
                console.log(`   Registration successful - wallet can be used!`);
                return;
            }
            
            // Check balance
            const balance = await provider.getBalance(wallet.address);
            const balanceInBNB = ethers.formatEther(balance);
            
            if (balance.lt(pkg1.price)) {
                console.log(`❌ Insufficient balance: ${balanceInBNB} BNB`);
                console.log(`   Need at least: ${priceInBNB} BNB for Package 1`);
                return;
            }
            
            console.log(`✅ Wallet balance: ${balanceInBNB} BNB`);
            
            // Attempt registration
            const nullAddress = '0x0000000000000000000000000000000000000000';
            
            try {
                const tx = await contractWithSigner.register(
                    nullAddress, // referrer (null for root)
                    1,          // package level 1
                    false,      // use BNB, not USDT
                    { 
                        value: pkg1.price,
                        gasLimit: 300000
                    }
                );
                
                console.log(`📋 Transaction sent: ${tx.hash}`);
                console.log('⏳ Waiting for confirmation...');
                
                const receipt = await tx.wait();
                
                if (receipt.status === 1) {
                    console.log('🎉 REGISTRATION SUCCESSFUL!');
                    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
                    console.log(`   Block: ${receipt.blockNumber}`);
                    
                    // Verify registration
                    const isNowRegistered = await contract.isRegistered(wallet.address);
                    const userInfo = await contract.getUserInfo(wallet.address);
                    
                    console.log(`✅ Verified registered: ${isNowRegistered}`);
                    console.log(`✅ Package level: ${userInfo[0]}`);
                    console.log(`✅ User ID: ${userInfo[1]}`);
                } else {
                    console.log('❌ Transaction failed!');
                }
                
            } catch (error) {
                console.log('❌ Registration failed:', error.message);
                
                if (error.message.includes('revert')) {
                    console.log('   This is likely a contract logic error');
                    console.log('   Check if packages are properly initialized');
                }
            }
            
        } else {
            console.log('📋 MANUAL REGISTRATION INSTRUCTIONS:');
            console.log('====================================');
            console.log('Since no private key provided, here are manual steps:\n');
            
            console.log('1. Go to BSCScan Write Contract:');
            console.log('   https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract\n');
            
            console.log('2. Connect your Trezor wallet\n');
            
            console.log('3. Find the "register" function and enter:');
            console.log(`   referrer: 0x0000000000000000000000000000000000000000`);
            console.log(`   packageLevel: 1`);
            console.log(`   useUSDT: false`);
            console.log(`   Value to send: ${priceInBNB} BNB\n`);
            
            console.log('4. Click "Write" and confirm with Trezor\n');
            
            console.log(`💰 Expected cost: ${priceInBNB} BNB + gas fees (~0.001 BNB)`);
            console.log(`🎯 Total needed: ~${(parseFloat(priceInBNB) + 0.001).toFixed(3)} BNB\n`);
        }
        
    } catch (error) {
        console.error('❌ Error during test:', error.message);
    }
}

// Help text
function showHelp() {
    console.log('📚 USAGE:');
    console.log('=========');
    console.log('node test-registration.js                    # Check if registration is possible');
    console.log('node test-registration.js YOUR_PRIVATE_KEY   # Actually test registration');
    console.log('');
    console.log('⚠️  WARNING: Never share your private key!');
    console.log('   Only use test wallets with small amounts for testing');
}

// Run test
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] === '--help')) {
    showHelp();
} else {
    testRegistration(args[0]);
}
