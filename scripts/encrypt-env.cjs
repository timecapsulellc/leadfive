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
 * Encrypt a string using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @param {string} password - Password for encryption
 * @returns {string} - Encrypted text with IV and tag (base64 encoded)
 */
function encrypt(text, password) {
    // Create key from password
    const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
    
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV + encrypted and encode as base64
    const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
}

/**
 * Decrypt a string using AES-256-GCM
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
        
        // Hide password input
        rl.stdoutMuted = true;
        rl.question(prompt, (password) => {
            rl.close();
            console.log(''); // New line after hidden input
            resolve(password);
        });
        
        rl._writeToOutput = function _writeToOutput(stringToWrite) {
            if (rl.stdoutMuted) {
                rl.output.write('*');
            } else {
                rl.output.write(stringToWrite);
            }
        };
    });
}

async function main() {
    const envPath = path.join(__dirname, '..', '.env');
    
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found!');
        process.exit(1);
    }
    
    console.log('🔐 LeadFive Private Key Encryption Tool');
    console.log('=====================================');
    
    try {
        // Read current .env file
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Check if private key is already encrypted
        if (envContent.includes('DEPLOYER_PRIVATE_KEY_ENCRYPTED=')) {
            console.log('✅ Private key is already encrypted in .env file');
            
            const decrypt_choice = await promptPassword('Do you want to decrypt and re-encrypt? (y/N): ');
            if (decrypt_choice.toLowerCase() !== 'y') {
                console.log('✅ No changes made. Private key remains encrypted.');
                return;
            }
        }
        
        // Extract current private key
        const privateKeyMatch = envContent.match(/DEPLOYER_PRIVATE_KEY=([^\r\n]+)/);
        if (!privateKeyMatch) {
            console.error('❌ DEPLOYER_PRIVATE_KEY not found in .env file!');
            process.exit(1);
        }
        
        const currentPrivateKey = privateKeyMatch[1].trim();
        
        // Validate private key format (64 hex characters)
        if (!/^[0-9a-fA-F]{64}$/.test(currentPrivateKey)) {
            console.error('❌ Invalid private key format! Must be 64 hex characters.');
            process.exit(1);
        }
        
        console.log('✅ Found private key in .env file');
        console.log('⚠️  This will encrypt your private key with a password you choose.');
        console.log('⚠️  REMEMBER this password - you\'ll need it for deployment!');
        console.log('');
        
        // Get encryption password
        const password1 = await promptPassword('Enter encryption password: ');
        if (password1.length < 8) {
            console.error('❌ Password must be at least 8 characters long!');
            process.exit(1);
        }
        
        const password2 = await promptPassword('Confirm encryption password: ');
        if (password1 !== password2) {
            console.error('❌ Passwords do not match!');
            process.exit(1);
        }
        
        // Encrypt the private key
        console.log('🔄 Encrypting private key...');
        const encryptedPrivateKey = encrypt(currentPrivateKey, password1);
        
        // Update .env file
        const updatedEnvContent = envContent
            .replace(
                /DEPLOYER_PRIVATE_KEY=([^\r\n]+)/,
                `# ==================== ENCRYPTED PRIVATE KEY ====================
# ⚠️ Private key is encrypted - use decrypt-env.js to decrypt for deployment
DEPLOYER_PRIVATE_KEY_ENCRYPTED=${encryptedPrivateKey}
# Original DEPLOYER_PRIVATE_KEY line removed for security`
            );
        
        // Write updated .env file
        fs.writeFileSync(envPath, updatedEnvContent);
        
        console.log('✅ Private key encrypted successfully!');
        console.log('✅ .env file updated with encrypted private key');
        console.log('');
        console.log('🔒 Your private key is now encrypted and secure');
        console.log('📝 Use scripts/decrypt-env.js when you need to deploy');
        console.log('⚠️  KEEP YOUR ENCRYPTION PASSWORD SAFE!');
        
        // Test decryption to verify
        try {
            const decrypted = decrypt(encryptedPrivateKey, password1);
            if (decrypted === currentPrivateKey) {
                console.log('✅ Encryption verified successfully');
            } else {
                console.error('❌ Encryption verification failed!');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Encryption verification failed:', error.message);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { encrypt, decrypt, promptPassword };
