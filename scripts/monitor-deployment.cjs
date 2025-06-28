#!/usr/bin/env node

/**
 * DIGITAL OCEAN DEPLOYMENT MONITOR
 * Monitors the latest deployment progress
 */

const { execSync } = require('child_process');

const APP_ID = '1bf4bce6-dd10-4534-9405-268289a3fd5c';
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

function checkDeployment() {
    try {
        const output = execSync(`doctl apps list-deployments ${APP_ID} --format ID,Phase,Progress`, 
            { encoding: 'utf8' });
        
        const lines = output.trim().split('\n');
        if (lines.length > 1) {
            const [id, phase, progress] = lines[1].split(/\s+/);
            
            log('\n🚀 LEADFIVE DEPLOYMENT STATUS', 'cyan');
            log('=============================', 'cyan');
            log(`📋 Deployment ID: ${id}`, 'blue');
            log(`📊 Phase: ${phase}`, phase === 'ACTIVE' ? 'green' : phase === 'BUILDING' ? 'yellow' : 'blue');
            log(`⏳ Progress: ${progress}`, 'blue');
            
            if (phase === 'ACTIVE') {
                log('\n🎉 DEPLOYMENT SUCCESSFUL!', 'green');
                log('========================', 'green');
                log('✅ Production: https://leadfive.today', 'green');
                log('✅ DO App: https://leadfive-app-3f8tb.ondigitalocean.app', 'green');
                log('✅ All features deployed successfully', 'green');
                return true;
            } else if (phase === 'ERROR' || phase === 'FAILED') {
                log('\n❌ DEPLOYMENT FAILED!', 'red');
                log('=====================', 'red');
                log('🔧 Check Digital Ocean console for details', 'yellow');
                return true;
            } else {
                log(`\n⏳ Deployment in progress... (${phase})`, 'yellow');
                log('📱 Visit https://cloud.digitalocean.com/apps for real-time status', 'blue');
                return false;
            }
        }
    } catch (error) {
        log(`❌ Error checking deployment: ${error.message}`, 'red');
        return true;
    }
}

function monitorDeployment() {
    log('🔍 MONITORING LEADFIVE DEPLOYMENT', 'cyan');
    log('=================================', 'cyan');
    
    const maxChecks = 20; // 10 minutes max
    let checks = 0;
    
    const monitor = setInterval(() => {
        checks++;
        
        if (checkDeployment() || checks >= maxChecks) {
            clearInterval(monitor);
            
            if (checks >= maxChecks) {
                log('\n⏰ Monitoring timeout reached', 'yellow');
                log('📱 Please check Digital Ocean console manually', 'blue');
            }
            
            log('\n📊 FINAL STATUS SUMMARY', 'cyan');
            log('=======================', 'cyan');
            log(`Monitoring duration: ${checks * 30} seconds`, 'blue');
            log('Next: Test all features on the live site', 'green');
        }
    }, 30000); // Check every 30 seconds
    
    // Initial check
    checkDeployment();
}

if (require.main === module) {
    monitorDeployment();
}

module.exports = { checkDeployment, monitorDeployment };
