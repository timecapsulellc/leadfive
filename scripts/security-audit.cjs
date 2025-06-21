#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Security audit to check for exposed credentials
 */
function auditCredentials() {
    console.log('🔍 LeadFive Security Credential Audit');
    console.log('====================================');
    
    const envPath = path.join(process.cwd(), '.env');
    let issuesFound = 0;
    
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found!');
        return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    console.log('📋 Checking for security issues...\n');
    
    // Check for plaintext private keys
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Check for unencrypted private key
        if (line.includes('DEPLOYER_PRIVATE_KEY=') && !line.includes('ENCRYPTED') && !line.includes('#')) {
            console.log(`⚠️  Line ${lineNum}: Unencrypted private key found!`);
            console.log(`   ${line.substring(0, 30)}...`);
            issuesFound++;
        }
        
        // Check for unencrypted API key
        if (line.includes('BSCSCAN_API_KEY=') && !line.includes('ENCRYPTED') && !line.includes('#')) {
            console.log(`⚠️  Line ${lineNum}: Unencrypted BSC API key found!`);
            console.log(`   ${line.substring(0, 30)}...`);
            issuesFound++;
        }
        
        // Check for potential private key patterns (64 hex chars)
        const hexPattern = /[0-9a-fA-F]{64}/;
        if (hexPattern.test(line) && !line.includes('ENCRYPTED') && !line.includes('#')) {
            console.log(`⚠️  Line ${lineNum}: Potential private key pattern detected!`);
            console.log(`   ${line.substring(0, 30)}...`);
            issuesFound++;
        }
    });
    
    // Check for required encrypted fields
    if (!envContent.includes('DEPLOYER_PRIVATE_KEY_ENCRYPTED=')) {
        console.log('❌ Missing encrypted private key!');
        issuesFound++;
    } else {
        console.log('✅ Encrypted private key found');
    }
    
    if (!envContent.includes('BSCSCAN_API_KEY_ENCRYPTED=')) {
        console.log('❌ Missing encrypted BSC API key!');
        issuesFound++;
    } else {
        console.log('✅ Encrypted BSC API key found');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (issuesFound === 0) {
        console.log('✅ SECURITY AUDIT PASSED!');
        console.log('🔒 All credentials are properly encrypted');
        console.log('🛡️  No plaintext secrets detected');
    } else {
        console.log(`❌ SECURITY AUDIT FAILED!`);
        console.log(`🚨 Found ${issuesFound} security issue(s)`);
        console.log('⚠️  Please encrypt all credentials before deployment');
    }
    
    console.log('\n📝 Next steps:');
    console.log('1. Use scripts/decrypt-env.cjs to get credentials for deployment');
    console.log('2. Never commit plaintext credentials to git');
    console.log('3. Rotate credentials after deployment');
    
    return issuesFound === 0;
}

// Run audit
if (require.main === module) {
    const passed = auditCredentials();
    process.exit(passed ? 0 : 1);
}

module.exports = { auditCredentials };
