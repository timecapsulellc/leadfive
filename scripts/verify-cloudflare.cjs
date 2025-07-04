#!/usr/bin/env node

/**
 * Cloudflare Configuration Verification Script
 * Tests your Cloudflare API credentials and displays zone information
 */

require('dotenv').config();

const https = require('https');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeCloudflareRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.cloudflare.com',
            port: 443,
            path: endpoint,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ status: res.statusCode, data: response });
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function verifyCloudflareConfig() {
    log('🔍 Verifying Cloudflare Configuration...', 'cyan');
    log('=' .repeat(50), 'cyan');

    // Check if required environment variables are set
    const requiredVars = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ZONE_ID', 'CLOUDFLARE_ACCOUNT_ID'];
    const missingVars = requiredVars.filter(varName => !process.env[varName] || process.env[varName].includes('your_'));
    
    if (missingVars.length > 0) {
        log('❌ Missing or placeholder Cloudflare credentials:', 'red');
        missingVars.forEach(varName => {
            log(`   - ${varName}: ${process.env[varName] || 'Not set'}`, 'yellow');
        });
        log('\n📖 Please see CLOUDFLARE_SETUP_GUIDE.md for setup instructions', 'yellow');
        return;
    }

    try {
        // Test API token validity
        log('🔑 Testing API Token...', 'yellow');
        const tokenVerify = await makeCloudflareRequest('/client/v4/user/tokens/verify');
        
        if (tokenVerify.status === 200 && tokenVerify.data.success) {
            log('✅ API Token is valid', 'green');
            log(`   Token ID: ${tokenVerify.data.result.id}`, 'cyan');
            log(`   Status: ${tokenVerify.data.result.status}`, 'cyan');
        } else {
            log('❌ API Token verification failed', 'red');
            log(`   Status: ${tokenVerify.status}`, 'red');
            log(`   Errors: ${JSON.stringify(tokenVerify.data.errors)}`, 'red');
            return;
        }

        // Test zone access
        log('\n🌍 Testing Zone Access...', 'yellow');
        const zoneInfo = await makeCloudflareRequest(`/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}`);
        
        if (zoneInfo.status === 200 && zoneInfo.data.success) {
            log('✅ Zone access successful', 'green');
            log(`   Zone Name: ${zoneInfo.data.result.name}`, 'cyan');
            log(`   Zone Status: ${zoneInfo.data.result.status}`, 'cyan');
            log(`   Name Servers: ${zoneInfo.data.result.name_servers.join(', ')}`, 'cyan');
        } else {
            log('❌ Zone access failed', 'red');
            log(`   Status: ${zoneInfo.status}`, 'red');
            log(`   Errors: ${JSON.stringify(zoneInfo.data.errors)}`, 'red');
            return;
        }

        // Test account access
        log('\n🏢 Testing Account Access...', 'yellow');
        const accountInfo = await makeCloudflareRequest(`/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}`);
        
        if (accountInfo.status === 200 && accountInfo.data.success) {
            log('✅ Account access successful', 'green');
            log(`   Account Name: ${accountInfo.data.result.name}`, 'cyan');
            log(`   Account Type: ${accountInfo.data.result.type}`, 'cyan');
        } else {
            log('❌ Account access failed', 'red');
            log(`   Status: ${accountInfo.status}`, 'red');
            log(`   Errors: ${JSON.stringify(accountInfo.data.errors)}`, 'red');
            return;
        }

        // List current DNS records for the zone
        log('\n📋 Current DNS Records:', 'yellow');
        const dnsRecords = await makeCloudflareRequest(`/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`);
        
        if (dnsRecords.status === 200 && dnsRecords.data.success) {
            const records = dnsRecords.data.result;
            log(`   Found ${records.length} DNS records:`, 'cyan');
            records.forEach(record => {
                log(`   - ${record.type} ${record.name} → ${record.content}`, 'cyan');
            });
        }

        log('\n🎉 All Cloudflare tests passed!', 'green');
        log('✅ Configuration is ready for production deployment', 'green');

    } catch (error) {
        log(`❌ Error during verification: ${error.message}`, 'red');
    }
}

// Run verification
if (require.main === module) {
    verifyCloudflareConfig().catch(console.error);
}

module.exports = { verifyCloudflareConfig };
