#!/usr/bin/env node

/**
 * TRIGGER DIGITAL OCEAN DEPLOYMENT
 * Creates a clean deployment trigger without secrets
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TRIGGERING LATEST DIGITAL OCEAN DEPLOYMENT');
console.log('==============================================');

try {
    // 1. Update deployment metadata
    const deploymentMeta = {
        version: '1.10.latest',
        deploymentDate: new Date().toISOString(),
        features: [
            'Advanced DAO Dashboard',
            'AI Success Coach',
            'Matrix Visualization', 
            'Earnings Forecast',
            'Real-time Analytics',
            'Smart Contract v1.10',
            'Security Hardened',
            'Production Ready'
        ],
        commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        branch: 'main'
    };

    fs.writeFileSync('deployment-meta.json', JSON.stringify(deploymentMeta, null, 2));
    console.log('✅ Created deployment metadata');

    // 2. Ensure build exists
    if (!fs.existsSync('dist')) {
        console.log('🔨 Building production version...');
        execSync('npm run build', { stdio: 'inherit' });
    }

    // 3. Git operations
    execSync('git add deployment-meta.json', { stdio: 'inherit' });
    execSync('git commit -m "🚀 Deploy latest LeadFive with advanced features"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('\n✅ DEPLOYMENT TRIGGERED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('📋 Deployment Details:');
    console.log(`   Version: ${deploymentMeta.version}`);
    console.log(`   Commit: ${deploymentMeta.commit}`);
    console.log(`   Features: ${deploymentMeta.features.length} advanced features`);
    console.log('\n🌐 URLs:');
    console.log('   Production: https://leadfive.today');
    console.log('   DO App: https://leadfive-app-3f8tb.ondigitalocean.app');
    console.log('\n⏰ Expected deployment time: 3-5 minutes');

} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}
