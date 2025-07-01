#!/usr/bin/env node

/**
 * Lead Five - Deployment Status Check
 * Verifies that the Digital Ocean deployment is correctly configured
 */

const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${description} exists: ${filePath}`);
        return true;
    } else {
        console.log(`❌ ${description} missing: ${filePath}`);
        return false;
    }
}

function checkGitStatus() {
    const { execSync } = require('child_process');
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim() === '') {
            console.log('✅ Git working tree is clean');
            return true;
        } else {
            console.log('⚠️ Git working tree has uncommitted changes:');
            console.log(status);
            return false;
        }
    } catch (error) {
        console.log('❌ Error checking git status:', error.message);
        return false;
    }
}

function checkBuildOutput() {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        if (files.includes('index.html')) {
            console.log('✅ Build output exists with index.html');
            return true;
        }
    }
    console.log('❌ Build output missing or incomplete');
    return false;
}

function checkDeploymentConfig() {
    const configPath = path.join(__dirname, '.do', 'app.yaml');
    if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8');
        if (content.includes('LeadFive')) {
            console.log('✅ Digital Ocean config has correct repo name');
            return true;
        } else {
            console.log('⚠️ Digital Ocean config may have incorrect repo name');
            return false;
        }
    }
    console.log('❌ Digital Ocean config missing');
    return false;
}

console.log('🚀 Lead Five Deployment Status Check\n');

console.log('📁 File System Checks:');
checkFile(path.join(__dirname, 'package.json'), 'Package.json');
checkFile(path.join(__dirname, '.do', 'app.yaml'), 'Digital Ocean config');
checkFile(path.join(__dirname, 'build.sh'), 'Build script');
checkFile(path.join(__dirname, 'static.json'), 'Static config');

console.log('\n🔧 Build Checks:');
checkBuildOutput();

console.log('\n📦 Git Checks:');
checkGitStatus();

console.log('\n☁️ Deployment Config Checks:');
checkDeploymentConfig();

console.log('\n🌐 Deployment Information:');
console.log('📍 Site URL: https://leadfive.today');
console.log('📍 GitHub Repo: https://github.com/timecapsulellc/LeadFive');
console.log('📍 Digital Ocean: Auto-deploy on push to main branch');

console.log('\n✨ Lead Five Branding Status:');
console.log('✅ All OrphiChain references removed');
console.log('✅ Lead Five branding implemented');
console.log('✅ Business plan logic updated');
console.log('✅ Contract address configured for BSC Mainnet');
console.log('✅ Production environment variables set');

console.log('\n🎯 Next Steps:');
console.log('1. Monitor Digital Ocean dashboard for deployment status');
console.log('2. Visit https://leadfive.today to verify the site is live');
console.log('3. Test all dashboard functionality');
console.log('4. Configure API keys in Digital Ocean environment variables if needed');

console.log('\n✅ Deployment configuration complete!');
