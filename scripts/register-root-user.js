#!/usr/bin/env node

const { ethers } = require('ethers');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Decryption function for encrypted private key
function decryptPrivateKey(encryptedKey, password = 'mk3R4^=l%cirS=K_orphisol') {
    try {
        if (encryptedKey && encryptedKey.startsWith('0x') && encryptedKey.length === 66) {
            return encryptedKey;
        }
        
        const ALGORITHM = 'aes-256-cbc';
        const KEY_LENGTH = 32;
        const IV_LENGTH = 16;
        
        const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
        const combined = Buffer.from(encryptedKey, 'base64');
        const iv = combined.slice(0, IV_LENGTH);
        const encrypted = combined.slice(IV_LENGTH);
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');
        
        const formattedKey = decrypted.startsWith('0x') ? decrypted : `0x${decrypted}`;
        
        if (!/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
            throw new Error('Invalid private key format after decryption');
        }
        
        return formattedKey;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

async function registerRootUser() {
    console.log('👑 LEADFIVE ROOT USER REGISTRATION');
    console.log('==================================\n');

    // Contract address (update this after deployment)
    const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS;
    
    if (!CONTRACT_ADDRESS) {
        console.log('❌ CONTRACT_ADDRESS not found in environment');
        console.log('💡 Set CONTRACT_ADDRESS in your .env file or export it');
        return;
    }

    // Get deployer from encrypted private key
    const encryptedPrivateKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
    if (!encryptedPrivateKey) {
        console.log('❌ DEPLOYER_PRIVATE_KEY_ENCRYPTED not found in .env');
        return;
    }

    console.log('🔐 Decrypting deployer private key...');
    const privateKey = decryptPrivateKey(encryptedPrivateKey);
    
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const deployer = new ethers.Wallet(privateKey, provider);
    
    console.log('Deployer address:', deployer.address);
    console.log('Contract address:', CONTRACT_ADDRESS);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('Deployer balance:', ethers.formatEther(balance), 'BNB\n');

    // Contract ABI for registration
    const abi = [
        'function register(address referrer, uint8 packageLevel, bool useUSDT) external payable',
        'function getUserInfo(address user) external view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate, uint32 lastHelpPoolClaim, bool isEligibleForHelpPool, uint32 matrixPosition, uint8 matrixLevel, uint32 registrationTime, string referralCode, uint96 pendingRewards, uint32 lastWithdrawal, uint32 matrixCycles, uint8 leaderRank, uint96 leftLegVolume, uint96 rightLegVolume, uint32 fastStartExpiry, bool isActive))',
        'function packages(uint8) external view returns (uint96 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus)',
        'function totalUsers() external view returns (uint32)',
        'function _getBNBPrice(uint96 usdAmount) external view returns (uint96)'
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, deployer);
    
    try {
        // Check if deployer is already registered
        console.log('🔍 Checking registration status...');
        const userInfo = await contract.getUserInfo(deployer.address);
        
        if (userInfo.isRegistered) {
            console.log('✅ Deployer is already registered as ROOT user!');
            console.log(`  Package Level: ${userInfo.packageLevel}`);
            console.log(`  Total Investment: $${ethers.formatEther(userInfo.totalInvestment)}`);
            console.log(`  Earnings Cap: $${ethers.formatEther(userInfo.earningsCap)}`);
            console.log(`  Rank: ${userInfo.rank}`);
            console.log(`  Matrix Position: ${userInfo.matrixPosition}`);
            console.log(`  Registration Time: ${new Date(Number(userInfo.registrationTime) * 1000)}`);
            console.log(`  Withdrawal Rate: ${userInfo.withdrawalRate}%`);
            console.log(`  Team Size: ${userInfo.teamSize}`);
            console.log(`  Status: ROOT USER ✅`);
            return;
        }
        
        // Get Package 4 (Premium - $200) for ROOT registration
        console.log('📦 Getting Package 4 details...');
        const package4 = await contract.packages(4);
        const priceUSD = ethers.formatEther(package4.price);
        
        console.log(`Package 4 (Premium):`);
        console.log(`  Price: $${priceUSD} USD`);
        console.log(`  Direct Bonus: ${package4.directBonus / 100}%`);
        console.log(`  Level Bonus: ${package4.levelBonus / 100}%`);
        console.log(`  Help Pool: ${package4.helpBonus / 100}%`);
        
        // Calculate BNB required (approximate $200 at ~$270/BNB)
        const bnbRequired = ethers.parseEther('0.741'); // ~$200 worth of BNB
        const bnbAmount = ethers.formatEther(bnbRequired);
        
        console.log(`\n💰 Registration Requirements:`);
        console.log(`  BNB Required: ${bnbAmount} BNB (~$200)`);
        console.log(`  Referrer: 0x0000000000000000000000000000000000000000 (ROOT)`);
        console.log(`  Package: 4 (Premium)`);
        console.log(`  Payment: BNB (not USDT)`);
        
        if (parseFloat(ethers.formatEther(balance)) < parseFloat(bnbAmount) + 0.01) {
            console.log('\n❌ Insufficient BNB balance for registration + gas');
            console.log(`  Required: ${parseFloat(bnbAmount) + 0.01} BNB`);
            console.log(`  Available: ${ethers.formatEther(balance)} BNB`);
            return;
        }
        
        // Register as ROOT user
        console.log('\n🚀 Registering as ROOT user with Package 4...');
        console.log('⏳ Sending registration transaction...');
        
        const registerTx = await contract.register(
            ethers.ZeroAddress, // No referrer (ROOT user)
            4, // Package 4 (Premium)
            false, // Use BNB payment, not USDT
            { 
                value: bnbRequired,
                gasLimit: 500000,
                gasPrice: ethers.parseUnits('5', 'gwei')
            }
        );
        
        console.log(`📤 Transaction sent: ${registerTx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await registerTx.wait();
        console.log(`✅ Registration confirmed in block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        
        // Verify registration
        console.log('\n🔍 Verifying ROOT user registration...');
        const newUserInfo = await contract.getUserInfo(deployer.address);
        const totalUsers = await contract.totalUsers();
        
        console.log('\n🎉 ROOT USER SUCCESSFULLY CREATED!');
        console.log('===================================');
        console.log(`👑 Address: ${deployer.address}`);
        console.log(`📋 Registration Details:`);
        console.log(`  Package Level: ${newUserInfo.packageLevel} (Premium)`);
        console.log(`  Total Investment: $${ethers.formatEther(newUserInfo.totalInvestment)}`);
        console.log(`  Earnings Cap: $${ethers.formatEther(newUserInfo.earningsCap)}`);
        console.log(`  Rank: ${newUserInfo.rank}`);
        console.log(`  Matrix Position: ${newUserInfo.matrixPosition}`);
        console.log(`  Withdrawal Rate: ${newUserInfo.withdrawalRate}%`);
        console.log(`  Registration Time: ${new Date(Number(newUserInfo.registrationTime) * 1000)}`);
        console.log(`  Fast Start Expiry: ${new Date(Number(newUserInfo.fastStartExpiry) * 1000)}`);
        
        console.log(`\n📊 Network Status:`);
        console.log(`  Total Users: ${totalUsers}`);
        console.log(`  ROOT User: ${deployer.address} ✅`);
        console.log(`  Network Status: INITIALIZED ✅`);
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. ✅ ROOT user registered with Package 4');
        console.log('2. 🔄 Test user registration functionality');
        console.log('3. 🔄 Verify contract on BSCScan');
        console.log('4. 🔄 Transfer ownership to Trezor');
        console.log('5. 🔄 Launch platform for users');
        
        console.log('\n🔗 ROOT USER REFERRAL INFO:');
        console.log(`Network Founder: ${deployer.address}`);
        console.log(`Referral Link: Use zero address as referrer for direct ROOT referrals`);
        console.log(`Status: READY FOR NETWORK GROWTH! 🚀`);

    } catch (error) {
        console.error('\n❌ ROOT user registration failed:', error.message);
        
        if (error.message.includes('revert')) {
            console.log('\n💡 Possible reasons:');
            console.log('• Already registered');
            console.log('• Insufficient BNB sent');
            console.log('• Contract is paused');
            console.log('• Invalid parameters');
        }
        
        if (error.message.includes('insufficient funds')) {
            console.log('• Insufficient BNB for gas + registration');
        }
        
        throw error;
    }
}

if (require.main === module) {
    registerRootUser()
        .then(() => {
            console.log('\n🎉 ROOT user registration completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Registration failed:', error);
            process.exit(1);
        });
}

module.exports = registerRootUser;
