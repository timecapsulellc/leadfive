#!/usr/bin/env node

/**
 * Secure Private Key Manager for LeadFive
 * Handles private key management securely for production deployment
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecureKeyManager {
    constructor() {
        this.envPath = path.join(__dirname, '..', '.env');
        this.keyVaultPath = path.join(__dirname, '..', '.keys');
        this.algorithm = 'aes-256-gcm';
    }

    /**
     * Encrypt a private key with a master password
     */
    encryptKey(privateKey, masterPassword) {
        const iv = crypto.randomBytes(16);
        const salt = crypto.randomBytes(32);
        const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha256');
        
        const cipher = crypto.createCipher(this.algorithm, key);
        cipher.setAAD(Buffer.from('leadfive-key', 'utf8'));
        
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            salt: salt.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }

    /**
     * Decrypt a private key with a master password
     */
    decryptKey(encryptedData, masterPassword) {
        const salt = Buffer.from(encryptedData.salt, 'hex');
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha256');
        
        const decipher = crypto.createDecipher(this.algorithm, key);
        decipher.setAAD(Buffer.from('leadfive-key', 'utf8'));
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    /**
     * Store encrypted keys securely
     */
    storeKeys(keys, masterPassword) {
        const encryptedKeys = {};
        
        for (const [keyName, privateKey] of Object.entries(keys)) {
            encryptedKeys[keyName] = this.encryptKey(privateKey, masterPassword);
        }
        
        // Ensure .keys directory is in .gitignore
        this.ensureGitIgnore();
        
        // Store encrypted keys
        if (!fs.existsSync(path.dirname(this.keyVaultPath))) {
            fs.mkdirSync(path.dirname(this.keyVaultPath), { recursive: true });
        }
        
        fs.writeFileSync(this.keyVaultPath, JSON.stringify(encryptedKeys, null, 2));
        console.log('✅ Keys stored securely');
    }

    /**
     * Retrieve and decrypt keys
     */
    retrieveKeys(masterPassword) {
        if (!fs.existsSync(this.keyVaultPath)) {
            throw new Error('No encrypted keys found. Please store keys first.');
        }
        
        const encryptedKeys = JSON.parse(fs.readFileSync(this.keyVaultPath, 'utf8'));
        const decryptedKeys = {};
        
        for (const [keyName, encryptedData] of Object.entries(encryptedKeys)) {
            try {
                decryptedKeys[keyName] = this.decryptKey(encryptedData, masterPassword);
            } catch (error) {
                throw new Error(`Failed to decrypt ${keyName}: Invalid password or corrupted data`);
            }
        }
        
        return decryptedKeys;
    }

    /**
     * Set environment variables securely for deployment
     */
    setEnvironmentKeys(masterPassword) {
        try {
            const keys = this.retrieveKeys(masterPassword);
            
            // Set environment variables
            for (const [keyName, privateKey] of Object.entries(keys)) {
                process.env[keyName] = privateKey;
            }
            
            console.log('✅ Environment keys set securely');
            return true;
        } catch (error) {
            console.error('❌ Failed to set environment keys:', error.message);
            return false;
        }
    }

    /**
     * Ensure .keys is in .gitignore
     */
    ensureGitIgnore() {
        const gitignorePath = path.join(__dirname, '..', '.gitignore');
        let gitignoreContent = '';
        
        if (fs.existsSync(gitignorePath)) {
            gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        }
        
        const keysEntry = '.keys';
        const envEntry = '.env.local';
        
        if (!gitignoreContent.includes(keysEntry)) {
            gitignoreContent += `\n# Encrypted private keys\n${keysEntry}\n`;
        }
        
        if (!gitignoreContent.includes(envEntry)) {
            gitignoreContent += `\n# Local environment\n${envEntry}\n`;
        }
        
        fs.writeFileSync(gitignorePath, gitignoreContent);
    }

    /**
     * Generate deployment instructions
     */
    generateInstructions() {
        console.log(`
🔐 SECURE KEY MANAGEMENT INSTRUCTIONS
=====================================

1. Store your private keys securely:
   node scripts/secure-key-manager.cjs store

2. Before deployment, set environment variables:
   node scripts/secure-key-manager.cjs deploy

3. For production servers, use environment variables:
   export DEPLOYER_PRIVATE_KEY="your_key_here"
   export TREZOR_PRIVATE_KEY="your_trezor_key_here"

4. Use cloud key management services for production:
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - HashiCorp Vault

SECURITY NOTES:
- Private keys are encrypted with AES-256-GCM
- Master password is required for decryption
- .keys file is automatically added to .gitignore
- Never commit private keys to version control
`);
    }
}

// CLI Interface
async function main() {
    const keyManager = new SecureKeyManager();
    const command = process.argv[2];
    
    switch (command) {
        case 'store':
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            console.log('🔐 Secure Key Storage');
            console.log('Enter your private keys (they will be encrypted):\n');
            
            const keys = {};
            
            rl.question('Deployer Private Key: ', (deployerKey) => {
                keys.DEPLOYER_PRIVATE_KEY = deployerKey;
                
                rl.question('Trezor Private Key (optional): ', (trezorKey) => {
                    if (trezorKey) keys.TREZOR_PRIVATE_KEY = trezorKey;
                    
                    rl.question('Master Password (for encryption): ', { hidden: true }, (password) => {
                        keyManager.storeKeys(keys, password);
                        rl.close();
                    });
                });
            });
            break;
            
        case 'deploy':
            const deployPassword = process.env.MASTER_PASSWORD || 
                                 await new Promise((resolve) => {
                                     const rl = require('readline').createInterface({
                                         input: process.stdin,
                                         output: process.stdout
                                     });
                                     rl.question('Master Password: ', { hidden: true }, (password) => {
                                         resolve(password);
                                         rl.close();
                                     });
                                 });
            
            keyManager.setEnvironmentKeys(deployPassword);
            break;
            
        case 'instructions':
        default:
            keyManager.generateInstructions();
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SecureKeyManager;
