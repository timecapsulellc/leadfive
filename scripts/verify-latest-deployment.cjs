#!/usr/bin/env node

/**
 * VERIFY LATEST DEPLOYMENT
 * Confirms the latest features are live
 */

const https = require('https');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkURL(url) {
    return new Promise((resolve) => {
        const request = https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                resolve({
                    status: response.statusCode,
                    data: data,
                    success: response.statusCode === 200
                });
            });
        });
        
        request.on('error', (error) => {
            resolve({
                status: 0,
                data: error.message,
                success: false
            });
        });
        
        request.setTimeout(10000, () => {
            request.destroy();
            resolve({
                status: 0,
                data: 'Timeout',
                success: false
            });
        });
    });
}

async function verifyDeployment() {
    log('🔍 VERIFYING LATEST LEADFIVE DEPLOYMENT', 'cyan');
    log('=======================================', 'cyan');
    
    const urls = [
        'https://leadfive.today',
        'https://leadfive-app-3f8tb.ondigitalocean.app'
    ];
    
    for (const url of urls) {
        log(`\n📡 Testing: ${url}`, 'blue');
        
        const result = await checkURL(url);
        
        if (result.success) {
            log(`✅ Status: ${result.status} - Site is live!`, 'green');
            
            // Check for DAO Overview in the content
            if (result.data.includes('DAO Overview') || result.data.includes('AI Success Coach')) {
                log('✅ Latest features detected!', 'green');
            } else {
                log('⚠️  Checking if content contains new features...', 'yellow');
            }
            
            // Check for modern dashboard features
            const features = [
                'AI Success Coach',
                'DAO Overview', 
                'Earnings Forecast',
                'Daily Coaching'
            ];
            
            let foundFeatures = 0;
            features.forEach(feature => {
                if (result.data.includes(feature)) {
                    foundFeatures++;
                    log(`  ✅ ${feature} found`, 'green');
                }
            });
            
            if (foundFeatures > 0) {
                log(`🎉 ${foundFeatures}/${features.length} latest features detected!`, 'green');
            } else {
                log('⚠️  May need cache refresh to see latest features', 'yellow');
            }
            
        } else {
            log(`❌ Status: ${result.status} - ${result.data}`, 'red');
        }
    }
    
    log('\n🚀 DEPLOYMENT VERIFICATION COMPLETE', 'cyan');
    log('===================================', 'cyan');
    log('📱 Visit https://leadfive.today to see the latest version', 'blue');
    log('🔄 If you see old content, try hard refresh (Ctrl+F5)', 'yellow');
    log('🎯 Look for: "DAO Overview" title and AI Success Coach', 'green');
}

if (require.main === module) {
    verifyDeployment().catch(console.error);
}

module.exports = { verifyDeployment };
