#!/usr/bin/env node

/**
 * DEPLOY LATEST LEADFIVE TO DIGITAL OCEAN
 * Clean deployment script to push the latest version
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color logging
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
    log(`\n🔄 ${description}...`, 'cyan');
    try {
        const result = execSync(command, { 
            encoding: 'utf8', 
            stdio: ['inherit', 'pipe', 'pipe'],
            cwd: process.cwd()
        });
        log(`✅ ${description} completed`, 'green');
        return result;
    } catch (error) {
        log(`❌ ${description} failed: ${error.message}`, 'red');
        throw error;
    }
}

async function deployLatestVersion() {
    log('🚀 DEPLOYING LATEST LEADFIVE TO DIGITAL OCEAN', 'cyan');
    log('================================================', 'cyan');

    try {
        // 1. Clean build
        log('\n📦 STEP 1: CLEAN BUILD', 'yellow');
        
        // Clean previous builds
        if (fs.existsSync('dist')) {
            runCommand('rm -rf dist', 'Cleaning previous build');
        }
        
        // Install dependencies
        runCommand('npm install', 'Installing dependencies');
        
        // Build for production
        runCommand('npm run build', 'Building for production');
        
        // 2. Prepare deployment
        log('\n🔧 STEP 2: PREPARE DEPLOYMENT', 'yellow');
        
        // Update package.json version
        const packagePath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        packageJson.version = `1.10.${timestamp}`;
        packageJson.deploymentDate = new Date().toISOString();
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        
        log(`✅ Updated version to: ${packageJson.version}`, 'green');
        
        // 3. Git operations
        log('\n📝 STEP 3: GIT OPERATIONS', 'yellow');
        
        // Add all changes
        runCommand('git add .', 'Adding changes to git');
        
        // Commit with timestamp
        const commitMessage = `Deploy v${packageJson.version} - Latest LeadFive with DAO features`;
        runCommand(`git commit -m "${commitMessage}"`, 'Committing changes');
        
        // Push to GitHub (this will trigger DO auto-deploy)
        runCommand('git push origin main', 'Pushing to GitHub');
        
        // 4. Monitor deployment
        log('\n👀 STEP 4: MONITOR DEPLOYMENT', 'yellow');
        
        log('🔍 Checking current Digital Ocean apps...', 'cyan');
        const apps = runCommand('doctl apps list --format ID,Spec.Name,DefaultIngress', 'Getting app list');
        console.log(apps);
        
        // Get the app ID (assuming it's the leadfive-production app)
        const appId = '1bf4bce6-dd10-4534-9405-268289a3fd5c';
        
        log(`\n📊 Monitoring deployment for app: ${appId}`, 'cyan');
        
        // Wait a bit for deployment to start
        setTimeout(() => {
            try {
                const deployments = runCommand(`doctl apps list-deployments ${appId} --format ID,Phase,CreatedAt`, 'Getting latest deployments');
                console.log('\nLatest deployments:');
                console.log(deployments);
            } catch (error) {
                log('Could not fetch deployment status automatically', 'yellow');
            }
        }, 10000);
        
        // 5. Cleanup old deployments (optional)
        log('\n🧹 STEP 5: CLEANUP RECOMMENDATIONS', 'yellow');
        log('ℹ️  Consider cleaning up old ERROR/CANCELED deployments manually', 'blue');
        log('ℹ️  Digital Ocean keeps deployment history automatically', 'blue');
        
        // 6. Deployment URLs
        log('\n🌐 STEP 6: DEPLOYMENT URLS', 'yellow');
        log('✅ Production: https://leadfive.today', 'green');
        log('✅ DO App URL: https://leadfive-app-3f8tb.ondigitalocean.app', 'green');
        log('✅ GitHub: https://github.com/timecapsulellc/leadfive', 'green');
        
        log('\n🎉 DEPLOYMENT INITIATED SUCCESSFULLY!', 'green');
        log('================================================', 'green');
        log('📋 Next Steps:', 'cyan');
        log('1. Monitor deployment progress in Digital Ocean console', 'blue');
        log('2. Check GitHub Actions for build status', 'blue');
        log('3. Test the live site once deployment completes', 'blue');
        log('4. Verify all features are working correctly', 'blue');
        
        // Final status check
        log('\n📊 FINAL STATUS:', 'cyan');
        log(`Version: ${packageJson.version}`, 'green');
        log(`Commit: ${commitMessage}`, 'green');
        log(`Timestamp: ${new Date().toISOString()}`, 'green');
        
    } catch (error) {
        log('\n❌ DEPLOYMENT FAILED!', 'red');
        log(`Error: ${error.message}`, 'red');
        log('\n🔧 Troubleshooting:', 'yellow');
        log('1. Check Git repository status', 'blue');
        log('2. Verify Digital Ocean CLI is configured', 'blue');
        log('3. Check build logs for errors', 'blue');
        log('4. Ensure all dependencies are installed', 'blue');
        process.exit(1);
    }
}

// Run deployment
if (require.main === module) {
    deployLatestVersion().catch(console.error);
}

module.exports = { deployLatestVersion };
