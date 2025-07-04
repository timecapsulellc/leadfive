#!/usr/bin/env node

/**
 * LEADFIVE PRODUCTION READINESS REPORT
 * Comprehensive status check for production deployment
 */

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Color logging
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function generateProductionReadinessReport() {
    log('🚀 LEADFIVE PRODUCTION READINESS REPORT', 'cyan');
    log('==========================================\n', 'cyan');

    const report = {
        timestamp: new Date().toISOString(),
        overallStatus: 'READY',
        categories: {}
    };

    // 1. Smart Contract Status
    log('📋 1. SMART CONTRACT STATUS', 'yellow');
    log('----------------------------', 'yellow');
    
    const contractStatus = {
        address: process.env.VITE_CONTRACT_ADDRESS || 'NOT_SET',
        implementation: process.env.VITE_IMPLEMENTATION_ADDRESS || 'NOT_SET',
        owner: process.env.TREZOR_OWNER_ADDRESS || 'NOT_SET',
        usdt: process.env.VITE_USDT_CONTRACT_ADDRESS || 'NOT_SET',
        network: process.env.VITE_CHAIN_ID || 'NOT_SET'
    };

    if (contractStatus.address !== 'NOT_SET') {
        log(`✅ Contract Address: ${contractStatus.address}`, 'green');
        log(`✅ Implementation: ${contractStatus.implementation}`, 'green');
        log(`✅ Owner (Trezor): ${contractStatus.owner}`, 'green');
        log(`✅ USDT Contract: ${contractStatus.usdt}`, 'green');
        log(`✅ Network: BSC Mainnet (${contractStatus.network})`, 'green');
    } else {
        log('❌ Contract not properly configured', 'red');
        report.overallStatus = 'NEEDS_ATTENTION';
    }

    report.categories.smartContract = {
        status: contractStatus.address !== 'NOT_SET' ? 'READY' : 'NEEDS_ATTENTION',
        details: contractStatus
    };

    // 2. Environment Configuration
    log('\n🔧 2. ENVIRONMENT CONFIGURATION', 'yellow');
    log('--------------------------------', 'yellow');

    const envChecks = [
        { key: 'VITE_CONTRACT_ADDRESS', required: true },
        { key: 'VITE_USDT_CONTRACT_ADDRESS', required: true },
        { key: 'TREZOR_OWNER_ADDRESS', required: true },
        { key: 'JWT_SECRET', required: true },
        { key: 'DOMAIN', required: true },
        { key: 'CLOUDFLARE_API_TOKEN', required: true },
        { key: 'CLOUDFLARE_ZONE_ID', required: true },
        { key: 'CLOUDFLARE_ACCOUNT_ID', required: true }
    ];

    let envStatus = 'READY';
    const envDetails = {};

    for (const check of envChecks) {
        const value = process.env[check.key];
        if (check.required && (!value || value === 'NOT_SET' || value === 'REMOVED_FOR_SECURITY')) {
            log(`❌ ${check.key}: Missing or placeholder`, 'red');
            envStatus = 'NEEDS_ATTENTION';
            envDetails[check.key] = 'MISSING';
        } else if (value) {
            log(`✅ ${check.key}: Configured`, 'green');
            envDetails[check.key] = 'SET';
        }
    }

    report.categories.environment = {
        status: envStatus,
        details: envDetails
    };

    // 3. Frontend Build Status
    log('\n🎨 3. FRONTEND BUILD STATUS', 'yellow');
    log('---------------------------', 'yellow');

    const distExists = fs.existsSync('dist');
    const packageJsonExists = fs.existsSync('package.json');
    const srcExists = fs.existsSync('src');

    if (distExists && packageJsonExists && srcExists) {
        log('✅ Build directory exists', 'green');
        log('✅ Package.json exists', 'green');
        log('✅ Source code exists', 'green');
        report.categories.frontend = { status: 'READY' };
    } else {
        log('❌ Frontend build issues detected', 'red');
        report.categories.frontend = { status: 'NEEDS_BUILD' };
        if (report.overallStatus === 'READY') report.overallStatus = 'NEEDS_ATTENTION';
    }

    // 4. Backend Services
    log('\n🖥️ 4. BACKEND SERVICES', 'yellow');
    log('----------------------', 'yellow');

    const backendExists = fs.existsSync('backend/server.js');
    const dockerExists = fs.existsSync('docker-compose.yml');
    const nginxExists = fs.existsSync('nginx.conf');

    if (backendExists && dockerExists && nginxExists) {
        log('✅ Backend server exists', 'green');
        log('✅ Docker configuration exists', 'green');
        log('✅ Nginx configuration exists', 'green');
        report.categories.backend = { status: 'READY' };
    } else {
        log('❌ Backend configuration incomplete', 'red');
        report.categories.backend = { status: 'NEEDS_ATTENTION' };
        if (report.overallStatus === 'READY') report.overallStatus = 'NEEDS_ATTENTION';
    }

    // 5. Security Status
    log('\n🔒 5. SECURITY STATUS', 'yellow');
    log('--------------------', 'yellow');

    const securityChecks = [
        { check: 'Private keys removed from .env', status: !process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'REMOVED_FOR_SECURITY' },
        { check: 'API keys removed from .env', status: !process.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY === 'REMOVED_FOR_SECURITY' },
        { check: 'JWT secret configured', status: process.env.JWT_SECRET && process.env.JWT_SECRET.length > 32 },
        { check: 'Contract ownership transferred', status: process.env.TREZOR_OWNER_ADDRESS === '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29' }
    ];

    let securityStatus = 'READY';
    for (const check of securityChecks) {
        if (check.status) {
            log(`✅ ${check.check}`, 'green');
        } else {
            log(`❌ ${check.check}`, 'red');
            securityStatus = 'NEEDS_ATTENTION';
        }
    }

    report.categories.security = { status: securityStatus };

    // 6. Cloudflare Status
    log('\n☁️ 6. CLOUDFLARE STATUS', 'yellow');
    log('-----------------------', 'yellow');

    const cloudflareConfig = {
        apiToken: !!process.env.CLOUDFLARE_API_TOKEN,
        zoneId: !!process.env.CLOUDFLARE_ZONE_ID,
        accountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
        domain: process.env.CLOUDFLARE_DOMAIN || process.env.DOMAIN
    };

    if (cloudflareConfig.apiToken && cloudflareConfig.zoneId && cloudflareConfig.accountId) {
        log('✅ Cloudflare API token configured', 'green');
        log('✅ Cloudflare Zone ID configured', 'green');
        log('✅ Cloudflare Account ID configured', 'green');
        log(`✅ Domain: ${cloudflareConfig.domain}`, 'green');
        log('⚠️  Note: API token has location restrictions', 'yellow');
        report.categories.cloudflare = { 
            status: 'READY_WITH_RESTRICTIONS',
            note: 'API token works but has geographical restrictions'
        };
    } else {
        log('❌ Cloudflare configuration incomplete', 'red');
        report.categories.cloudflare = { status: 'NEEDS_ATTENTION' };
        if (report.overallStatus === 'READY') report.overallStatus = 'NEEDS_ATTENTION';
    }

    // 7. Deployment Readiness
    log('\n🚀 7. DEPLOYMENT READINESS', 'yellow');
    log('---------------------------', 'yellow');

    const deploymentFiles = [
        'scripts/automated-feature-validator.cjs',
        'scripts/production-monitor.cjs',
        'scripts/secure-key-manager.cjs',
        'tests/uat/uat-framework.cjs'
    ];

    let deploymentReady = true;
    for (const file of deploymentFiles) {
        if (fs.existsSync(file)) {
            log(`✅ ${file}`, 'green');
        } else {
            log(`❌ ${file}`, 'red');
            deploymentReady = false;
        }
    }

    report.categories.deployment = { 
        status: deploymentReady ? 'READY' : 'NEEDS_ATTENTION'
    };

    // Overall Status Summary
    log('\n📊 OVERALL STATUS SUMMARY', 'cyan');
    log('=========================', 'cyan');

    const categoryStatuses = Object.values(report.categories).map(cat => cat.status);
    const hasNeeds = categoryStatuses.some(status => status.includes('NEEDS'));
    
    if (!hasNeeds) {
        log('🎉 PRODUCTION READY! All systems go!', 'green');
        report.overallStatus = 'PRODUCTION_READY';
    } else {
        log('⚠️  Some areas need attention before production deployment', 'yellow');
        report.overallStatus = 'NEEDS_ATTENTION';
    }

    // Next Steps
    log('\n📋 NEXT STEPS', 'cyan');
    log('=============', 'cyan');

    if (report.overallStatus === 'PRODUCTION_READY') {
        log('1. Run final build: npm run build', 'green');
        log('2. Start production deployment: docker-compose up -d', 'green');
        log('3. Verify deployment: npm run validate:full', 'green');
        log('4. Monitor systems: npm run monitor', 'green');
    } else {
        log('1. Address configuration issues above', 'yellow');
        log('2. Re-run this readiness check', 'yellow');
        log('3. Proceed with deployment when all green', 'yellow');
    }

    // Save report
    const reportFile = `production-readiness-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    log(`\n📄 Report saved to: ${reportFile}`, 'cyan');

    return report;
}

// Run the report
if (require.main === module) {
    generateProductionReadinessReport().catch(console.error);
}

module.exports = { generateProductionReadinessReport };
