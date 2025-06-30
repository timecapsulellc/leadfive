import { ethers } from 'ethers';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Configuration
const CONTRACT_ADDRESS = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';

// Contract ABI
const CONTRACT_ABI = [
    'function setPackageInfo(uint8 packageId, uint256 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus) external',
    'function packages(uint8) view returns (uint256 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus)',
    'function owner() view returns (address)',
    'function register(address referrer, uint8 packageLevel, bool useUSDT) external payable',
    'function getUserInfo(address user) view returns (uint8 packageLevel, uint8 currentMatrix, uint256 totalEarnings, uint256 directReferrals, address referrer)',
    'function isRegistered(address user) view returns (bool)'
];

// Package configurations to set (LeadFive Business Requirements)
const PACKAGES_TO_SET = [
    {
        id: 0,
        name: "Entry Level ($30)",
        price: "111000000000000000", // 0.111 BNB
        directBonus: 4000,  // 40%
        levelBonus: 1000,   // 10%
        uplineBonus: 1000,  // 10%
        leaderBonus: 1000,  // 10%
        helpBonus: 3000,    // 30%
        clubBonus: 0        // 0%
    },
    {
        id: 1,
        name: "Standard ($50)",
        price: "185000000000000000", // 0.185 BNB
        directBonus: 4000,  // 40%
        levelBonus: 1000,   // 10%
        uplineBonus: 1000,  // 10%
        leaderBonus: 1000,  // 10%
        helpBonus: 3000,    // 30%
        clubBonus: 0        // 0%
    },
    {
        id: 2,
        name: "Advanced ($100)",
        price: "370000000000000000", // 0.370 BNB
        directBonus: 4000,  // 40%
        levelBonus: 1000,   // 10%
        uplineBonus: 1000,  // 10%
        leaderBonus: 1000,  // 10%
        helpBonus: 3000,    // 30%
        clubBonus: 0        // 0%
    },
    {
        id: 3,
        name: "Premium ($200)",
        price: "741000000000000000", // 0.741 BNB
        directBonus: 4000,  // 40%
        levelBonus: 1000,   // 10%
        uplineBonus: 1000,  // 10%
        leaderBonus: 1000,  // 10%
        helpBonus: 3000,    // 30%
        clubBonus: 0        // 0%
    }
];

// Decryption function using AES-256-CBC (matches encrypt-env.cjs)
function decryptPrivateKey(encryptedKey, password = 'mk3R4^=l%cirS=K_orphisol') {
    try {
        // If the key looks like it's already a private key
        if (encryptedKey && encryptedKey.startsWith('0x') && encryptedKey.length === 66) {
            console.log('✅ Using provided private key directly');
            return encryptedKey;
        }
        
        // Use AES-256-CBC decryption (matching encrypt-env.cjs)
        const ALGORITHM = 'aes-256-cbc';
        const KEY_LENGTH = 32; // 256 bits
        const IV_LENGTH = 16;  // 128 bits
        
        // Create key from password
        const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
        
        // Decode from base64
        const combined = Buffer.from(encryptedKey, 'base64');
        
        // Extract IV and encrypted data
        const iv = combined.slice(0, IV_LENGTH);
        const encrypted = combined.slice(IV_LENGTH);
        
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        
        // Decrypt
        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');
        
        // Add 0x prefix if not present and validate
        const formattedKey = decrypted.startsWith('0x') ? decrypted : `0x${decrypted}`;
        
        if (!/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
            throw new Error('Invalid private key format after decryption');
        }
        
        console.log('✅ Successfully decrypted private key');
        return formattedKey;
        
    } catch (error) {
        console.log(`⚠️  Decryption failed: ${error.message}`);
        console.log('🔧 Please check your decryption password or key format');
        throw error;
    }
}

async function completeContractSetup() {
    console.log('🚀 LEADFIVE COMPLETE CONTRACT SETUP');
    console.log('===================================\n');

    try {
        // Get encrypted private key from environment
        const encryptedPrivateKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED || process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
        
        if (!encryptedPrivateKey) {
            console.log('❌ No private key found in environment variables!');
            console.log('💡 Make sure your .env file contains:');
            console.log('   DEPLOYER_PRIVATE_KEY_ENCRYPTED=your_encrypted_key');
            console.log('   or');
            console.log('   DEPLOYER_PRIVATE_KEY=your_key');
            console.log('   or');
            console.log('   PRIVATE_KEY=your_key');
            return;
        }

        console.log('🔐 Decrypting private key...');
        const privateKey = decryptPrivateKey(encryptedPrivateKey);
        
        console.log('🔗 Connecting to BSC...');
        const provider = new ethers.JsonRpcProvider(BSC_RPC);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

        console.log(`💰 Deployer Address: ${wallet.address}`);
        
        // Verify ownership
        const owner = await contract.owner();
        console.log(`👑 Contract Owner: ${owner}`);
        
        if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
            console.log('❌ ERROR: Wallet is not the contract owner!');
            return;
        }
        
        console.log('✅ Ownership verified\n');

        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`💳 Wallet Balance: ${ethers.formatEther(balance)} BNB\n`);

        if (parseFloat(ethers.formatEther(balance)) < 0.5) {
            console.log('⚠️  WARNING: Low BNB balance. Recommend at least 0.5 BNB for setup + registration.\n');
        }

        // PHASE 1: Fix all package configurations
        console.log('📦 PHASE 1: FIXING PACKAGE CONFIGURATIONS');
        console.log('==========================================\n');

        for (let i = 0; i < PACKAGES_TO_SET.length; i++) {
            const pkg = PACKAGES_TO_SET[i];
            
            console.log(`🔧 Setting up ${pkg.name}...`);
            console.log(`   Package ID: ${pkg.id}`);
            console.log(`   Price: ${ethers.formatEther(pkg.price)} BNB`);
            console.log(`   Commissions: ${pkg.directBonus/100}%/${pkg.levelBonus/100}%/${pkg.uplineBonus/100}%/${pkg.leaderBonus/100}%/${pkg.helpBonus/100}%/${pkg.clubBonus/100}%`);

            try {
                const tx = await contract.setPackageInfo(
                    pkg.id,
                    pkg.price,
                    pkg.directBonus,
                    pkg.levelBonus,
                    pkg.uplineBonus,
                    pkg.leaderBonus,
                    pkg.helpBonus,
                    pkg.clubBonus,
                    { gasLimit: 300000 }
                );

                console.log(`   📤 Transaction: ${tx.hash}`);
                console.log(`   ⏳ Waiting for confirmation...`);

                const receipt = await tx.wait();
                console.log(`   ✅ Confirmed! Block: ${receipt.blockNumber}`);
                console.log(`   ⛽ Gas Used: ${receipt.gasUsed.toString()}\n`);

            } catch (error) {
                console.log(`   ❌ Failed: ${error.message}\n`);
                return;
            }
        }

        // Verify all packages are set correctly
        console.log('🔍 PHASE 2: VERIFICATION');
        console.log('========================\n');

        let allCorrect = true;
        for (let i = 0; i < PACKAGES_TO_SET.length; i++) {
            const packageInfo = await contract.packages(i);
            const expectedPrice = PACKAGES_TO_SET[i].price;
            const actualPrice = packageInfo.price.toString();
            
            if (actualPrice === expectedPrice) {
                console.log(`✅ Package ${i + 1}: ${ethers.formatEther(actualPrice)} BNB - CORRECT`);
            } else {
                console.log(`❌ Package ${i + 1}: Expected ${ethers.formatEther(expectedPrice)} BNB, got ${ethers.formatEther(actualPrice)} BNB`);
                allCorrect = false;
            }
        }

        if (!allCorrect) {
            console.log('\n❌ Package verification failed. Please check and retry.');
            return;
        }

        console.log('\n✅ All packages verified correct!\n');

        // PHASE 3: Register deployer as ROOT user
        console.log('👑 PHASE 3: REGISTERING ROOT USER');
        console.log('=================================\n');

        // Check if already registered
        const isAlreadyRegistered = await contract.isRegistered(wallet.address);
        if (isAlreadyRegistered) {
            console.log('ℹ️  Deployer is already registered as ROOT user');
            const userInfo = await contract.getUserInfo(wallet.address);
            console.log(`   Package Level: ${userInfo.packageLevel}`);
            console.log(`   Total Earnings: ${ethers.formatEther(userInfo.totalEarnings)} BNB`);
            console.log(`   Direct Referrals: ${userInfo.directReferrals}`);
            console.log(`   Referrer: ${userInfo.referrer}\n`);
        } else {
            console.log('🎯 Registering deployer as ROOT user with Package 1...');
            
            // Get Package 1 price for registration
            const package1Info = await contract.packages(0);
            const registrationPrice = package1Info.price;
            
            console.log(`   Registration Price: ${ethers.formatEther(registrationPrice)} BNB`);
            console.log(`   Referrer: 0x0000000000000000000000000000000000000000 (ROOT)`);
            console.log(`   Package: 1 (Entry Level)`);

            try {
                const tx = await contract.register(
                    '0x0000000000000000000000000000000000000000', // Zero address for ROOT
                    1, // Package 1 (Entry Level)
                    false, // Use BNB, not USDT
                    { 
                        value: registrationPrice,
                        gasLimit: 500000 
                    }
                );

                console.log(`   📤 Registration Transaction: ${tx.hash}`);
                console.log(`   ⏳ Waiting for confirmation...`);

                const receipt = await tx.wait();
                console.log(`   ✅ ROOT registration confirmed! Block: ${receipt.blockNumber}`);
                console.log(`   ⛽ Gas Used: ${receipt.gasUsed.toString()}\n`);

                // Verify registration
                const userInfo = await contract.getUserInfo(wallet.address);
                console.log('🎉 ROOT USER SUCCESSFULLY CREATED!');
                console.log(`   Address: ${wallet.address}`);
                console.log(`   Package Level: ${userInfo.packageLevel}`);
                console.log(`   Referrer: ${userInfo.referrer}`);
                console.log(`   Status: ROOT USER ✅\n`);

            } catch (error) {
                console.log(`   ❌ Registration failed: ${error.message}`);
                
                // Check if it's a revert reason
                if (error.message.includes('revert')) {
                    console.log('   💡 This might be because:');
                    console.log('      • Packages are not properly initialized');
                    console.log('      • Contract is paused');
                    console.log('      • Insufficient BNB sent');
                    console.log('      • Already registered');
                }
                return;
            }
        }

        // PHASE 4: Final status report
        console.log('📋 PHASE 4: FINAL STATUS REPORT');
        console.log('==============================\n');

        console.log('✅ CONTRACT SETUP COMPLETE!');
        console.log('✅ All 4 packages properly configured');
        console.log('✅ ROOT user established');
        console.log('✅ Platform ready for users\n');

        console.log('🎯 NEXT STEPS:');
        console.log('1. Users can now register with Package 1-4');
        console.log('2. ROOT user can start building the network');
        console.log('3. Transfer ownership to Trezor when ready');
        console.log('4. Launch marketing and user acquisition\n');

        console.log('🔗 ROOT USER INFO:');
        console.log(`   Address: ${wallet.address}`);
        console.log(`   Package: Entry Level ($30)`);
        console.log(`   Role: Network ROOT/Founder`);
        console.log(`   Referral Link: Use zero address as referrer\n`);

        console.log('💰 PACKAGE PRICES FOR USERS:');
        for (let i = 0; i < PACKAGES_TO_SET.length; i++) {
            const pkg = await contract.packages(i);
            const priceInBNB = ethers.formatEther(pkg.price);
            const priceInUSD = (parseFloat(priceInBNB) * 270).toFixed(0); // Approximate USD
            console.log(`   Package ${i + 1}: ${priceInBNB} BNB (~$${priceInUSD})`);
        }

        console.log('\n🚀 LEADFIVE PLATFORM IS NOW LIVE AND OPERATIONAL! 🚀');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('• Check your .env file has the correct private key');
        console.log('• Ensure you have enough BNB for gas and registration');
        console.log('• Verify the contract address is correct');
        console.log('• Make sure BSC RPC is accessible');
    }
}

// Run the complete setup
completeContractSetup();
