// Private Key Encryption Utility for LeadFive
// Encrypts your private key with a password for maximum security

const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function encryptPrivateKey(privateKey, password) {
    try {
        // Generate a key from password using PBKDF2
        const salt = crypto.randomBytes(32);
        const key = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
        
        // Generate random IV
        const iv = crypto.randomBytes(IV_LENGTH);
        
        // Create cipher
        const cipher = crypto.createCipher(ALGORITHM, key);
        cipher.setAAD(Buffer.from('leadfive-private-key'));
        
        // Encrypt the private key
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Get authentication tag
        const tag = cipher.getAuthTag();
        
        // Combine all components
        const encryptedData = {
            algorithm: ALGORITHM,
            salt: salt.toString('hex'),
            iv: iv.toString('hex'),
            tag: tag.toString('hex'),
            encrypted: encrypted,
            timestamp: new Date().toISOString()
        };
        
        return encryptedData;
    } catch (error) {
        throw new Error('Encryption failed: ' + error.message);
    }
}

function saveEncryptedKey(encryptedData) {
    try {
        // Save to encrypted file
        fs.writeFileSync('.env.encrypted', JSON.stringify(encryptedData, null, 2));
        console.log('✅ Private key encrypted and saved to .env.encrypted');
        
        // Update .env with encrypted reference
        const envContent = `# LEADFIVE ENCRYPTED CONFIGURATION
# Your private key is encrypted in .env.encrypted
# Use decrypt-key.js to decrypt when needed

# Encrypted private key file
ENCRYPTED_KEY_FILE=.env.encrypted

# Other configuration
BSC_MAINNET_RPC_URL=https://bsc-dataseed.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
NETWORK=bsc-testnet
CHAIN_ID=97

# Contract addresses (will be updated after deployment)
LEADFIVE_TESTNET_PROXY=
LEADFIVE_TESTNET_IMPLEMENTATION=
LEADFIVE_MAINNET_PROXY=
LEADFIVE_MAINNET_IMPLEMENTATION=

# BSCScan API Key (optional)
BSCSCAN_API_KEY=

# Admin settings
LEADFIVE_ADMIN_WALLET=
LEADFIVE_EMERGENCY_WALLET=
`;
        
        fs.writeFileSync('.env', envContent);
        console.log('✅ .env file updated with encrypted configuration');
        
    } catch (error) {
        throw new Error('Failed to save encrypted key: ' + error.message);
    }
}

async function main() {
    console.log('🔐 LEADFIVE PRIVATE KEY ENCRYPTION');
    console.log('=' * 50);
    console.log('This tool will encrypt your private key with a password');
    console.log('Your key will be stored encrypted and never exposed\n');
    
    try {
        // Get private key
        const privateKey = await new Promise((resolve) => {
            rl.question('Enter your private key (64 characters): ', (answer) => {
                resolve(answer.trim());
            });
        });
        
        // Validate private key format
        if (!privateKey || privateKey.length !== 64) {
            if (privateKey.startsWith('0x') && privateKey.length === 66) {
                // Remove 0x prefix
                privateKey = privateKey.slice(2);
            } else {
                throw new Error('Invalid private key format. Must be 64 hex characters.');
            }
        }
        
        // Get encryption password
        const password = await new Promise((resolve) => {
            rl.question('Enter encryption password (min 12 characters): ', (answer) => {
                resolve(answer);
            });
        });
        
        if (password.length < 12) {
            throw new Error('Password must be at least 12 characters long');
        }
        
        // Confirm password
        const confirmPassword = await new Promise((resolve) => {
            rl.question('Confirm encryption password: ', (answer) => {
                resolve(answer);
            });
        });
        
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        console.log('\n🔐 Encrypting private key...');
        
        // Encrypt the private key
        const encryptedData = encryptPrivateKey(privateKey, password);
        
        // Save encrypted key
        saveEncryptedKey(encryptedData);
        
        console.log('\n✅ PRIVATE KEY ENCRYPTION COMPLETE!');
        console.log('🔒 Your private key is now encrypted with AES-256-GCM');
        console.log('🔑 Encryption password is required for deployment');
        console.log('📁 Encrypted key saved to: .env.encrypted');
        console.log('⚠️  IMPORTANT: Remember your encryption password!');
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Your private key is now encrypted and secure');
        console.log('2. Use decrypt-key.js when you need to deploy');
        console.log('3. Never share your encryption password');
        console.log('4. Keep .env.encrypted file secure');
        
        console.log('\n🚀 TO DEPLOY:');
        console.log('node scripts/decrypt-key.js');
        console.log('npx hardhat run scripts/deploy-leadfive-testnet.js --network bscTestnet');
        
    } catch (error) {
        console.error('❌ Encryption failed:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
