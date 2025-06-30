const { ethers } = require('hardhat');

// MAINNET CONTRACT ADDRESSES
const LEADFIVE_PROXY = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
const USDT_MAINNET = '0x55d398326f99059fF775485246999027B3197955';
const SPONSOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'; // Trezor wallet (new owner)

async function testMainnetRegistration() {
    console.log('🎯 LEADFIVE MAINNET REGISTRATION TEST');
    console.log('====================================');
    console.log(`Contract: ${LEADFIVE_PROXY}`);
    console.log(`USDT: ${USDT_MAINNET}`);
    console.log(`Sponsor: ${SPONSOR_ADDRESS}`);
    console.log('');
    
    // Connect to BSC Mainnet
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    
    // You'll need to add your wallet private key here
    // NEVER commit private keys to version control!
    console.log('⚠️  WALLET SETUP REQUIRED:');
    console.log('To test registration, you need to:');
    console.log('1. Add your wallet private key to environment variable');
    console.log('2. Ensure wallet has enough USDT + BNB for gas');
    console.log('3. Run: export PRIVATE_KEY=your_private_key_here');
    console.log('');
    
    if (!process.env.PRIVATE_KEY) {
        console.log('❌ Private key not found in environment variables');
        console.log('Please set PRIVATE_KEY environment variable to test registration');
        return;
    }
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`💰 Testing wallet: ${wallet.address}`);
    
    // Check wallet balances
    const bnbBalance = await provider.getBalance(wallet.address);
    console.log(`BNB Balance: ${ethers.formatEther(bnbBalance)} BNB`);
    
    const usdtContract = new ethers.Contract(USDT_MAINNET, [
        "function balanceOf(address) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)"
    ], wallet);
    
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    console.log(`USDT Balance: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
    
    // LeadFive contract interface
    const leadFiveContract = new ethers.Contract(LEADFIVE_PROXY, [
        "function register(address sponsor, uint8 packageLevel, bool useUSDT) payable",
        "function getPackagePrice(uint8 packageLevel) view returns (uint96)",
        "function getUserBasicInfo(address user) view returns (bool, uint8, uint96)",
        "function getTotalUsers() view returns (uint32)"
    ], wallet);
    
    // Check if user is already registered
    try {
        const userInfo = await leadFiveContract.getUserBasicInfo(wallet.address);
        if (userInfo[0]) {
            console.log('');
            console.log('⚠️  User already registered!');
            console.log(`Package Level: ${userInfo[1]}`);
            console.log(`Total Earnings: ${ethers.formatUnits(userInfo[2], 18)} USDT`);
            return;
        }
    } catch (e) {
        console.log('Checking registration status...');
    }
    
    console.log('');
    console.log('📋 REGISTRATION OPTIONS:');
    
    // Show package prices
    for (let level = 1; level <= 4; level++) {
        try {
            const price = await leadFiveContract.getPackagePrice(level);
            console.log(`Level ${level}: ${ethers.formatUnits(price, 18)} USDT`);
        } catch (e) {
            console.log(`Level ${level}: Unable to fetch price`);
        }
    }
    
    console.log('');
    console.log('🎯 TO REGISTER A NEW USER:');
    console.log('');
    console.log('1. Choose package level (1-4)');
    console.log('2. Ensure USDT balance >= package price');
    console.log('3. Ensure BNB balance >= 0.01 BNB for gas');
    console.log('4. Approve USDT spending first');
    console.log('5. Call register function');
    console.log('');
    
    // Example registration commands
    console.log('📝 EXAMPLE REGISTRATION COMMANDS:');
    console.log('');
    console.log('// For Level 1 ($30 USDT):');
    console.log(`const price = await leadFiveContract.getPackagePrice(1);`);
    console.log(`await usdtContract.approve("${LEADFIVE_PROXY}", price);`);
    console.log(`await leadFiveContract.register("${SPONSOR_ADDRESS}", 1, true);`);
    console.log('');
    console.log('// For Level 2 ($50 USDT):');
    console.log(`const price = await leadFiveContract.getPackagePrice(2);`);
    console.log(`await usdtContract.approve("${LEADFIVE_PROXY}", price);`);
    console.log(`await leadFiveContract.register("${SPONSOR_ADDRESS}", 2, true);`);
    console.log('');
    
    // Interactive registration (if sufficient balance)
    const level1Price = await leadFiveContract.getPackagePrice(1);
    const requiredBalance = level1Price;
    
    if (usdtBalance >= requiredBalance && bnbBalance >= ethers.parseEther('0.01')) {
        console.log('✅ Sufficient balance for Level 1 registration!');
        console.log('');
        console.log('Would you like to proceed with Level 1 registration?');
        console.log('Uncomment the following lines to execute:');
        console.log('');
        console.log('// STEP 1: Approve USDT spending');
        console.log(`// await usdtContract.approve("${LEADFIVE_PROXY}", "${level1Price}");`);
        console.log('');
        console.log('// STEP 2: Register user');
        console.log(`// await leadFiveContract.register("${SPONSOR_ADDRESS}", 1, true);`);
        console.log('');
        console.log('// STEP 3: Verify registration');
        console.log('// const newUserInfo = await leadFiveContract.getUserBasicInfo(wallet.address);');
        console.log('// console.log("Registration successful:", newUserInfo[0]);');
        
    } else {
        console.log('❌ Insufficient balance for registration');
        console.log(`Required USDT: ${ethers.formatUnits(requiredBalance, 18)}`);
        console.log(`Required BNB: 0.01 (for gas)`);
    }
    
    const totalUsers = await leadFiveContract.getTotalUsers();
    console.log('');
    console.log(`📊 Current total users: ${totalUsers}`);
}

testMainnetRegistration()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
