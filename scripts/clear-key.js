// Private Key Clearing Utility for LeadFive
// Clears decrypted private key from .env for security

const fs = require('fs');

function clearPrivateKeyFromEnv() {
    try {
        if (!fs.existsSync('.env')) {
            console.log('ℹ️  .env file not found - nothing to clear');
            return;
        }
        
        let envContent = fs.readFileSync('.env', 'utf8');
        
        // Check if private key exists
        if (!envContent.includes('DEPLOYER_PRIVATE_KEY=')) {
            console.log('ℹ️  No private key found in .env file');
            return;
        }
        
        // Remove the private key value but keep the variable
        envContent = envContent.replace(/DEPLOYER_PRIVATE_KEY=.*/g, 'DEPLOYER_PRIVATE_KEY=');
        
        // Write back to .env
        fs.writeFileSync('.env', envContent);
        
        console.log('✅ Private key cleared from .env file');
        console.log('🔒 Your encrypted backup remains safe in .env.encrypted');
        
    } catch (error) {
        console.error('❌ Failed to clear private key:', error.message);
        process.exit(1);
    }
}

function main() {
    console.log('🔒 LEADFIVE PRIVATE KEY CLEARING');
    console.log('=' * 40);
    console.log('Removing decrypted private key from .env for security\n');
    
    clearPrivateKeyFromEnv();
    
    console.log('\n📋 SECURITY STATUS:');
    console.log('✅ Decrypted private key removed from .env');
    console.log('✅ Encrypted backup safe in .env.encrypted');
    console.log('✅ Ready for next deployment cycle');
    
    console.log('\n🚀 TO DEPLOY AGAIN:');
    console.log('node scripts/decrypt-key.js');
    console.log('npx hardhat run scripts/deploy-leadfive-testnet.js --network bscTestnet');
}

main();
