// Private Key Decryption Utility for LeadFive
// Decrypts your private key for deployment (temporarily)

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

function decryptPrivateKey(encryptedData, password) {
    try {
        // Recreate the key from password and salt
        const salt = Buffer.from(encryptedData.salt, 'hex');
        const key = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
        
        // Get components
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const tag = Buffer.from(encryptedData.tag, 'hex');
        const encrypted = encryptedData.encrypted;
        
        // Create decipher
        const decipher = crypto.createDecipher(ALGORITHM, key);
        decipher.setAAD(Buffer.from('leadfive-private-key'));
        decipher.setAuthTag(tag);
        
        // Decrypt the private key
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed: Invalid password or corrupted data');
    }
}

function updateEnvWithDecryptedKey(privateKey) {
    try {
        // Read current .env content
        let envContent = '';
        if (fs.existsSync('.env')) {
            envContent = fs.readFileSync('.env', 'utf8');
        }
        
        // Add or update the private key
        if (envContent.includes('DEPLOYER_PRIVATE_KEY=')) {
            // Replace existing line
            envContent = envContent.replace(
                /DEPLOYER_PRIVATE_KEY=.*/,
                `DEPLOYER_PRIVATE_KEY=${privateKey}`
            );
        } else {
            // Add new line
            envContent += `\nDEPLOYER_PRIVATE_KEY=${privateKey}\n`;
        }
        
        // Write back to .env
        fs.writeFileSync('.env', envContent);
        console.log('✅ Private key temporarily added to .env for deployment');
        
    } catch (error) {
        throw new Error('Failed to update .env file: ' + error.message);
    }
}

function clearPrivateKeyFromEnv() {
    try {
        if (fs.existsSync('.env')) {
            let envContent = fs.readFileSync('.env', 'utf8');
            
            // Remove the private key line
            envContent = envContent.replace(/DEPLOYER_PRIVATE_KEY=.*/g, 'DEPLOYER_PRIVATE_KEY=');
            
            fs.writeFileSync('.env', envContent);
            console.log('✅ Private key cleared from .env file');
        }
    } catch (error) {
        console.error('⚠️  Warning: Could not clear private key from .env:', error.message);
    }
}

async function main() {
    console.log('🔓 LEADFIVE PRIVATE KEY DECRYPTION');
    console.log('=' * 50);
    console.log('This tool will temporarily decrypt your private key for deployment');
    console.log('The key will be cleared after deployment\n');
    
    try {
        // Check if encrypted file exists
        if (!fs.existsSync('.env.encrypted')) {
            throw new Error('Encrypted key file (.env.encrypted) not found. Run encrypt-key.js first.');
        }
        
        // Load encrypted data
        const encryptedData = JSON.parse(fs.readFileSync('.env.encrypted', 'utf8'));
        console.log('📁 Loaded encrypted key file');
        console.log('🕒 Encrypted on:', encryptedData.timestamp);
        
        // Get decryption password
        const password = await new Promise((resolve) => {
            rl.question('Enter decryption password: ', (answer) => {
                resolve(answer);
            });
        });
        
        console.log('\n🔓 Decrypting private key...');
        
        // Decrypt the private key
        const privateKey = decryptPrivateKey(encryptedData, password);
        
        // Validate decrypted key
        if (!privateKey || privateKey.length !== 64) {
            throw new Error('Decryption failed: Invalid key format');
        }
        
        console.log('✅ Private key decrypted successfully');
        
        // Ask what to do next
        const action = await new Promise((resolve) => {
            rl.question('\nChoose action:\n1. Deploy to testnet\n2. Deploy to mainnet\n3. Just decrypt to .env\n4. Cancel\nEnter choice (1-4): ', (answer) => {
                resolve(answer.trim());
            });
        });
        
        // Update .env with decrypted key
        updateEnvWithDecryptedKey('0x' + privateKey);
        
        switch (action) {
            case '1':
                console.log('\n🧪 Deploying to BSC Testnet...');
                console.log('Run: npx hardhat run scripts/deploy-leadfive-testnet.js --network bscTestnet');
                break;
                
            case '2':
                console.log('\n🚀 Ready for BSC Mainnet deployment...');
                console.log('Run: npx hardhat run scripts/deploy-leadfive.js --network bsc');
                break;
                
            case '3':
                console.log('\n✅ Private key decrypted to .env file');
                console.log('⚠️  Remember to clear it after use!');
                break;
                
            case '4':
                console.log('\n❌ Operation cancelled');
                clearPrivateKeyFromEnv();
                break;
                
            default:
                console.log('\n✅ Private key ready in .env file');
                break;
        }
        
        if (action !== '4') {
            console.log('\n🔒 SECURITY REMINDER:');
            console.log('- Your private key is temporarily in .env');
            console.log('- Run clear-key.js after deployment to remove it');
            console.log('- Or manually remove DEPLOYER_PRIVATE_KEY from .env');
            console.log('- Your encrypted backup remains safe in .env.encrypted');
        }
        
    } catch (error) {
        console.error('❌ Decryption failed:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n🔒 Clearing private key for security...');
    clearPrivateKeyFromEnv();
    process.exit(0);
});

process.on('SIGTERM', () => {
    clearPrivateKeyFromEnv();
    process.exit(0);
});

main();
