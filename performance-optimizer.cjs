#!/usr/bin/env node

/**
 * LeadFive Performance Optimizer
 * Automatically fixes common performance issues and optimizes the development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceOptimizer {
    constructor() {
        this.results = [];
        this.errors = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`[${timestamp}] ${icon} ${message}`);
        this.results.push({ timestamp, type, message });
    }

    async runCommand(command, description) {
        try {
            this.log(`Running: ${description}...`);
            const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
            this.log(`${description} completed successfully`, 'success');
            return output;
        } catch (error) {
            this.log(`${description} failed: ${error.message}`, 'error');
            this.errors.push({ command, description, error: error.message });
            return null;
        }
    }

    // Clean up node_modules and caches
    async cleanupDependencies() {
        this.log('🧹 Starting dependency cleanup...');

        // Remove node_modules
        if (fs.existsSync('./node_modules')) {
            this.log('Removing node_modules directory...');
            await this.runCommand('rm -rf node_modules', 'Remove node_modules');
        }

        // Remove package-lock.json for fresh install
        if (fs.existsSync('./package-lock.json')) {
            this.log('Removing package-lock.json for fresh install...');
            await this.runCommand('rm -f package-lock.json', 'Remove package-lock.json');
        }

        // Clean npm cache
        await this.runCommand('npm cache clean --force', 'Clean npm cache');

        // Reinstall dependencies
        this.log('Reinstalling dependencies with npm ci for faster install...');
        await this.runCommand('npm install', 'Install dependencies');
    }

    // Clear build caches
    async clearCaches() {
        this.log('🗑️  Clearing build caches...');

        const cacheDirs = [
            './node_modules/.vite',
            './node_modules/.cache',
            './cache',
            './artifacts',
            './.next',
            './dist'
        ];

        for (const dir of cacheDirs) {
            if (fs.existsSync(dir)) {
                await this.runCommand(`rm -rf "${dir}"`, `Clear ${dir}`);
            }
        }

        // Clear Hardhat cache
        try {
            await this.runCommand('npx hardhat clean', 'Clear Hardhat cache');
        } catch {
            this.log('Hardhat clean skipped (not available)', 'warning');
        }
    }

    // Optimize VS Code settings
    async optimizeVSCodeSettings() {
        this.log('⚙️  Optimizing VS Code settings...');

        const vscodeDir = '.vscode';
        const settingsFile = path.join(vscodeDir, 'settings.json');

        // Create .vscode directory if it doesn't exist
        if (!fs.existsSync(vscodeDir)) {
            fs.mkdirSync(vscodeDir);
        }

        const optimizedSettings = {
            // TypeScript performance optimizations
            "typescript.preferences.includePackageJsonAutoImports": "off",
            "typescript.suggest.autoImports": false,
            "typescript.disableAutomaticTypeAcquisition": true,
            "typescript.preferences.includePackageJsonAutoImports": "off",
            
            // File watching optimizations
            "files.watcherExclude": {
                "**/node_modules/**": true,
                "**/dist/**": true,
                "**/cache/**": true,
                "**/artifacts/**": true,
                "**/.git/**": true,
                "**/build/**": true
            },
            
            // Search optimizations
            "search.exclude": {
                "**/node_modules": true,
                "**/dist": true,
                "**/cache": true,
                "**/artifacts": true,
                "**/.git": true,
                "**/build": true,
                "**/*.log": true
            },
            
            // Editor performance
            "editor.quickSuggestions": {
                "other": true,
                "comments": false,
                "strings": false
            },
            "editor.quickSuggestionsDelay": 10,
            "editor.suggest.showKeywords": false,
            "editor.suggest.showSnippets": false,
            
            // Extension optimizations
            "extensions.autoUpdate": false,
            "extensions.autoCheckUpdates": false,
            
            // Git optimizations
            "git.enabled": true,
            "git.decorations.enabled": false,
            "git.autoRepositoryDetection": false,
            
            // Language server optimizations
            "eslint.enable": false, // Disable if not needed
            "emmet.showExpandedAbbreviation": "never",
            
            // Memory management
            "typescript.preferences.includePackageJsonAutoImports": "off",
            "javascript.preferences.includePackageJsonAutoImports": "off"
        };

        let existingSettings = {};
        if (fs.existsSync(settingsFile)) {
            try {
                const content = fs.readFileSync(settingsFile, 'utf8');
                existingSettings = JSON.parse(content);
            } catch (error) {
                this.log('Could not parse existing settings.json', 'warning');
            }
        }

        const mergedSettings = { ...existingSettings, ...optimizedSettings };
        fs.writeFileSync(settingsFile, JSON.stringify(mergedSettings, null, 2));
        this.log('VS Code settings optimized', 'success');
    }

    // Create performance monitoring scripts
    async createMonitoringScripts() {
        this.log('📊 Creating performance monitoring scripts...');

        // Memory monitor script
        const memoryMonitor = `#!/usr/bin/env node
const interval = setInterval(() => {
    const mem = process.memoryUsage();
    const used = Math.round(mem.heapUsed / 1024 / 1024);
    const total = Math.round(mem.heapTotal / 1024 / 1024);
    const external = Math.round(mem.external / 1024 / 1024);
    
    console.log(\`[\${new Date().toLocaleTimeString()}] Memory: \${used}MB/\${total}MB (External: \${external}MB)\`);
    
    if (used > 512) {
        console.log('⚠️  High memory usage detected!');
    }
}, 5000);

process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\\nMemory monitoring stopped.');
    process.exit(0);
});

console.log('🔍 Memory monitoring started. Press Ctrl+C to stop.');`;

        fs.writeFileSync('memory-monitor.cjs', memoryMonitor);
        execSync('chmod +x memory-monitor.cjs');

        // Build performance script
        const buildPerf = `#!/usr/bin/env node
const { performance } = require('perf_hooks');

const startTime = performance.now();
console.log('🚀 Starting optimized build...');

// Run build with timing
require('child_process').exec('npm run build', (error, stdout, stderr) => {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    if (error) {
        console.error('❌ Build failed:', error.message);
        return;
    }
    
    console.log('✅ Build completed in', duration, 'ms');
    console.log(stdout);
    
    if (stderr) {
        console.log('Warnings:', stderr);
    }
});`;

        fs.writeFileSync('build-performance.cjs', buildPerf);
        execSync('chmod +x build-performance.cjs');

        this.log('Performance monitoring scripts created', 'success');
    }

    // Update package.json scripts
    async optimizePackageScripts() {
        this.log('📝 Optimizing package.json scripts...');

        try {
            const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            
            // Add performance scripts
            const optimizedScripts = {
                ...packageJson.scripts,
                'dev:fast': 'vite --host 0.0.0.0 --port 5173 --force',
                'build:fast': 'vite build --mode production',
                'clean': 'rm -rf node_modules/.vite && rm -rf cache && rm -rf artifacts && rm -rf dist',
                'clean:all': 'rm -rf node_modules && npm install',
                'monitor:memory': 'node memory-monitor.cjs',
                'build:perf': 'node build-performance.cjs',
                'optimize': 'node performance-optimizer.cjs'
            };

            packageJson.scripts = optimizedScripts;
            fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
            this.log('Package.json scripts optimized', 'success');
        } catch (error) {
            this.log(`Failed to optimize package.json: ${error.message}`, 'error');
        }
    }

    // Generate optimization report
    generateReport() {
        this.log('\n' + '='.repeat(60));
        this.log('📋 PERFORMANCE OPTIMIZATION REPORT', 'success');
        this.log('='.repeat(60));

        this.log(`✅ Completed ${this.results.filter(r => r.type === 'success').length} optimizations`);
        
        if (this.errors.length > 0) {
            this.log(`❌ ${this.errors.length} operations failed:`);
            this.errors.forEach((error, i) => {
                this.log(`   ${i + 1}. ${error.description}: ${error.error}`);
            });
        }

        this.log('\n🚀 NEXT STEPS:');
        this.log('1. Reload VS Code window: Cmd+Shift+P -> "Developer: Reload Window"');
        this.log('2. Test development server: npm run dev:fast');
        this.log('3. Monitor memory usage: npm run monitor:memory');
        this.log('4. Check build performance: npm run build:perf');
        
        this.log('\n💡 PERFORMANCE TIPS:');
        this.log('• Use npm run dev:fast for faster development builds');
        this.log('• Run npm run clean periodically to clear caches');
        this.log('• Monitor memory with npm run monitor:memory');
        this.log('• Close unused VS Code tabs and extensions');
        this.log('• Consider using a faster SSD if builds are still slow');

        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            results: this.results,
            errors: this.errors,
            summary: {
                totalOperations: this.results.length,
                successful: this.results.filter(r => r.type === 'success').length,
                failed: this.errors.length
            }
        };

        fs.writeFileSync('optimization-report.json', JSON.stringify(report, null, 2));
        this.log('📄 Detailed report saved to: optimization-report.json');
    }

    // Main optimization runner
    async run() {
        console.log('🚀 LeadFive Performance Optimizer\n');
        console.log('This will clean dependencies, clear caches, and optimize VS Code settings.\n');

        try {
            // 1. Clear caches first (fastest)
            await this.clearCaches();

            // 2. Optimize VS Code settings
            await this.optimizeVSCodeSettings();

            // 3. Create monitoring tools
            await this.createMonitoringScripts();

            // 4. Optimize package.json
            await this.optimizePackageScripts();

            // 5. Clean and reinstall dependencies (slowest, but most effective)
            this.log('\n⚠️  About to clean and reinstall dependencies...');
            this.log('This may take 2-3 minutes but will significantly improve performance.');
            
            // Skip dependency cleanup if user doesn't want it
            // await this.cleanupDependencies();

            this.generateReport();

        } catch (error) {
            this.log(`Optimization failed: ${error.message}`, 'error');
        }
    }

    // Quick fix method (without dependency reinstall)
    async quickFix() {
        console.log('⚡ Running Quick Performance Fixes...\n');

        await this.clearCaches();
        await this.optimizeVSCodeSettings();
        await this.createMonitoringScripts();
        await this.optimizePackageScripts();

        this.log('\n✅ Quick fixes completed!');
        this.log('🔄 Please reload VS Code window: Cmd+Shift+P -> "Developer: Reload Window"');
        this.log('🚀 Then test with: npm run dev:fast');
    }
}

// Check command line arguments
const args = process.argv.slice(2);
const optimizer = new PerformanceOptimizer();

if (args.includes('--quick') || args.includes('-q')) {
    optimizer.quickFix().catch(console.error);
} else {
    optimizer.run().catch(console.error);
}
