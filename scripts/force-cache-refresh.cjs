#!/usr/bin/env node

/**
 * FORCE CACHE REFRESH DEPLOYMENT
 * Clears all caches and forces fresh deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');

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

function runCommand(command, description) {
    log(`\n🔄 ${description}...`, 'cyan');
    try {
        const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
        log(`✅ ${description} completed`, 'green');
        return result;
    } catch (error) {
        log(`❌ ${description} failed: ${error.message}`, 'red');
        throw error;
    }
}

async function forceCacheRefresh() {
    log('🔄 FORCING CACHE REFRESH DEPLOYMENT', 'cyan');
    log('===================================', 'cyan');

    try {
        // 1. Clean all build artifacts
        log('\n📦 STEP 1: CLEAN BUILD ARTIFACTS', 'yellow');
        if (fs.existsSync('dist')) {
            runCommand('rm -rf dist', 'Removing old build');
        }
        if (fs.existsSync('node_modules/.vite')) {
            runCommand('rm -rf node_modules/.vite', 'Clearing Vite cache');
        }

        // 2. Add cache busting timestamp to index.html
        log('\n⏰ STEP 2: ADD CACHE BUSTING', 'yellow');
        const timestamp = Date.now();
        const cacheBustContent = `<!-- Cache bust: ${timestamp} -->\n<!-- Deploy time: ${new Date().toISOString()} -->\n`;
        
        // Read current index.html and add cache bust
        let indexHtml = fs.readFileSync('index.html', 'utf8');
        if (!indexHtml.includes('Cache bust:')) {
            indexHtml = indexHtml.replace('</head>', `${cacheBustContent}</head>`);
            fs.writeFileSync('index.html', indexHtml);
            log(`✅ Added cache bust timestamp: ${timestamp}`, 'green');
        }

        // 3. Update version in package.json
        log('\n📝 STEP 3: UPDATE VERSION', 'yellow');
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        packageJson.version = `1.10.${timestamp}`;
        packageJson.deploymentTimestamp = timestamp;
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        log(`✅ Updated version to: ${packageJson.version}`, 'green');

        // 4. Build with fresh cache
        log('\n🏗️ STEP 4: FRESH BUILD', 'yellow');
        runCommand('npm run build', 'Building with fresh cache');

        // 5. Commit and push
        log('\n📤 STEP 5: DEPLOY WITH CACHE BUST', 'yellow');
        runCommand('git add .', 'Adding changes');
        runCommand(`git commit -m "🔄 Force cache refresh - v1.10.${timestamp}"`, 'Committing');
        runCommand('git push origin main', 'Deploying to production');

        // 6. Cloudflare cache purge (if possible)
        log('\n☁️ STEP 6: CLOUDFLARE CACHE PURGE', 'yellow');
        try {
            const purgeCommand = `curl -X POST "https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache" \\
  -H "Authorization: Bearer ${process.env.CLOUDFLARE_API_TOKEN}" \\
  -H "Content-Type: application/json" \\
  --data '{"purge_everything":true}'`;
            
            runCommand(purgeCommand, 'Purging Cloudflare cache');
        } catch (error) {
            log('⚠️ Cloudflare cache purge skipped (API restrictions)', 'yellow');
        }

        log('\n🎉 CACHE REFRESH DEPLOYMENT COMPLETE!', 'green');
        log('====================================', 'green');
        log('📱 URLs to test:', 'cyan');
        log('   Production: https://leadfive.today', 'blue');
        log('   DO App: https://leadfive-app-3f8tb.ondigitalocean.app', 'blue');
        log('\n🔧 To see changes immediately:', 'cyan');
        log('   1. Wait 2-3 minutes for deployment', 'blue');
        log('   2. Open incognito/private window', 'blue');
        log('   3. Or hard refresh: Ctrl+F5 / Cmd+Shift+R', 'blue');
        log('   4. Check for "DAO Overview" title', 'blue');

    } catch (error) {
        log('\n❌ CACHE REFRESH FAILED!', 'red');
        log(`Error: ${error.message}`, 'red');
        process.exit(1);
    }
}

if (require.main === module) {
    forceCacheRefresh().catch(console.error);
}

module.exports = { forceCacheRefresh };
