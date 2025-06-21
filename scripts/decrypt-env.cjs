#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits

/**
 * Decrypt a string using AES-256-CBC
 * @param {string} encryptedData - Encrypted data (base64 encoded)
 * @param {string} password - Password for decryption
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedData, password) {
    try {
        // Create key from password
        const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
        
        // Decode from base64
        const combined = Buffer.from(encryptedData, 'base64');
        
        // Extract IV and encrypted data
        const iv = combined.slice(0, IV_LENGTH);
        const encrypted = combined.slice(IV_LENGTH);
        
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        
        // Decrypt
        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed. Wrong password or corrupted data.');
    }
}

/**
 * Prompt user for password
 */
function promptPassword(prompt) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Hide input
        const stdin = process.openStdin();
        process.stdin.on('data', char => {
            char = char + '';
            switch (char) {
                case '\n':
                case '\r':
                case '\u0004':
                    stdin.pause();
                    break;
                default:
                    process.stdout.write('\b \b');
                    break;
            }
        });

        rl.question(prompt, (password) => {
            rl.close();
            console.log(''); // New line after hidden input
            resolve(password);
        });
    });
}

/**
 * Main function
 */
async function main() {
    console.log('🔓 LeadFive Credentials Decryption Tool');
    console.log('=======================================');
    
    const envPath = path.join(process.cwd(), '.env');
    
    // Check if .env exists
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found!');
        process.exit(1);
    }
    
    // Read .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Find encrypted credentials
    const encryptedKeyMatch = envContent.match(/DEPLOYER_PRIVATE_KEY_ENCRYPTED=(.+)/);
    const encryptedApiMatch = envContent.match(/BSCSCAN_API_KEY_ENCRYPTED=(.+)/);
    
    if (!encryptedKeyMatch && !encryptedApiMatch) {
        console.log('❌ No encrypted credentials found in .env file!');
        console.log('💡 Use scripts/encrypt-env.cjs first to encrypt your credentials');
        process.exit(1);
    }
    
    console.log('✅ Found encrypted credentials in .env file');
    
    try {
        // Get password from user
        const password = await promptPassword('Enter decryption password: ');
        
        if (!password) {
            console.log('❌ Password is required!');
            process.exit(1);
        }
        
        console.log('🔄 Decrypting credentials...');
        console.log('');
        
        // Decrypt private key if exists
        if (encryptedKeyMatch) {
            const encryptedKey = encryptedKeyMatch[1].trim();
            const decryptedKey = decrypt(encryptedKey, password);
            
            // Add 0x prefix if not present and validate length
            const formattedKey = decryptedKey.startsWith('0x') ? decryptedKey : `0x${decryptedKey}`;
            
            if (!/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
                throw new Error('Invalid private key format after decryption');
            }
            
            console.log('✅ Private key decrypted successfully!');
            console.log(`📋 DEPLOYER_PRIVATE_KEY=${formattedKey}`);
            console.log('');
        }
        
        // Decrypt API key if exists
        if (encryptedApiMatch) {
            const encryptedApi = encryptedApiMatch[1].trim();
            const decryptedApi = decrypt(encryptedApi, password);
            
            console.log('✅ BSC API key decrypted successfully!');
            console.log(`📋 BSCSCAN_API_KEY=${decryptedApi}`);
            console.log('');
        }
        
        console.log('🔒 Keep these credentials secure!');
        console.log('⚠️  Never share these keys or commit them to git!');
        console.log('💡 You can copy these values for deployment scripts');
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { decrypt };
