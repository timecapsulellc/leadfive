#!/usr/bin/env node

/**
 * LeadFive Performance Diagnostic Tool
 * Analyzes system performance and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceDiagnostics {
    constructor() {
        this.results = {
            system: {},
            project: {},
            recommendations: [],
            criticalIssues: []
        };
    }

    // System diagnostics
    async diagnoseSystem() {
        console.log('🔍 Running System Performance Diagnostics...\n');
        
        try {
            // Memory usage
            const memory = process.memoryUsage();
            this.results.system.memory = {
                heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
                external: `${Math.round(memory.external / 1024 / 1024)} MB`,
                percentage: Math.round((memory.heapUsed / memory.heapTotal) * 100)
            };

            // CPU usage
            const cpuUsage = process.cpuUsage();
            this.results.system.cpu = {
                user: cpuUsage.user,
                system: cpuUsage.system
            };

            // Node.js version
            this.results.system.nodeVersion = process.version;
            this.results.system.platform = process.platform;
            this.results.system.arch = process.arch;

        } catch (error) {
            console.error('System diagnostics failed:', error.message);
        }
    }

    // Project-specific diagnostics
    async diagnoseProject() {
        console.log('📊 Analyzing Project Structure...\n');

        try {
            // Check node_modules size
            const nodeModulesSize = this.getDirectorySize('./node_modules');
            this.results.project.nodeModulesSize = nodeModulesSize;

            // Check TypeScript cache
            const tsConfigExists = fs.existsSync('./tsconfig.json');
            this.results.project.hasTypeScript = tsConfigExists;

            // Check for cache directories
            const viteCache = fs.existsSync('./node_modules/.vite');
            const hardhatCache = fs.existsSync('./cache');
            this.results.project.caches = {
                vite: viteCache,
                hardhat: hardhatCache
            };

            // Count source files
            const srcFiles = this.countFiles('./src', ['.js', '.jsx', '.ts', '.tsx']);
            this.results.project.sourceFiles = srcFiles;

            // Check package.json dependencies
            const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            const depCount = Object.keys(packageJson.dependencies || {}).length;
            const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
            this.results.project.dependencies = { prod: depCount, dev: devDepCount };

            // Check for large files
            const largeFiles = this.findLargeFiles('./src', 100 * 1024); // 100KB+
            this.results.project.largeFiles = largeFiles;

        } catch (error) {
            console.error('Project diagnostics failed:', error.message);
        }
    }

    // VS Code diagnostics
    async diagnoseVSCode() {
        console.log('⚡ Analyzing VS Code Performance...\n');

        try {
            // Check for TypeScript language server processes
            const processes = execSync('ps aux | grep -E "(tsserver|typescript)" | grep -v grep || true', { encoding: 'utf8' });
            const tsProcesses = processes.trim().split('\n').filter(line => line.trim());
            
            this.results.vscode = {
                tsServerProcesses: tsProcesses.length,
                processes: tsProcesses
            };

            // Check VS Code settings that might affect performance
            const vscodeSettings = this.checkVSCodeSettings();
            this.results.vscode.settings = vscodeSettings;

        } catch (error) {
            console.error('VS Code diagnostics failed:', error.message);
        }
    }

    // Generate performance recommendations
    generateRecommendations() {
        console.log('💡 Generating Performance Recommendations...\n');

        const { system, project, vscode } = this.results;

        // Memory recommendations
        if (system.memory.percentage > 80) {
            this.results.criticalIssues.push('High memory usage detected');
            this.results.recommendations.push({
                category: 'Memory',
                issue: 'High memory usage',
                solution: 'Restart VS Code and clear caches',
                priority: 'HIGH'
            });
        }

        // Node modules size
        if (project.nodeModulesSize > 1000) { // 1GB+
            this.results.criticalIssues.push('Large node_modules directory');
            this.results.recommendations.push({
                category: 'Dependencies',
                issue: 'Large node_modules directory (>1GB)',
                solution: 'Run npm prune and consider removing unused dependencies',
                priority: 'MEDIUM'
            });
        }

        // TypeScript server issues
        if (vscode.tsServerProcesses > 2) {
            this.results.criticalIssues.push('Multiple TypeScript servers running');
            this.results.recommendations.push({
                category: 'VS Code',
                issue: 'Multiple TypeScript language servers',
                solution: 'Reload VS Code window (Cmd+Shift+P -> "Developer: Reload Window")',
                priority: 'HIGH'
            });
        }

        // Large files
        if (project.largeFiles.length > 0) {
            this.results.recommendations.push({
                category: 'Code Quality',
                issue: `${project.largeFiles.length} large files found`,
                solution: 'Consider splitting large files into smaller modules',
                priority: 'MEDIUM'
            });
        }

        // Cache cleanup
        if (project.caches.vite || project.caches.hardhat) {
            this.results.recommendations.push({
                category: 'Performance',
                issue: 'Cache directories present',
                solution: 'Clear caches if experiencing build issues',
                priority: 'LOW'
            });
        }
    }

    // Helper methods
    getDirectorySize(dirPath) {
        try {
            const size = execSync(`du -sm "${dirPath}" 2>/dev/null | cut -f1`, { encoding: 'utf8' });
            return parseInt(size.trim()) || 0;
        } catch {
            return 0;
        }
    }

    countFiles(dirPath, extensions) {
        let count = 0;
        try {
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const file of files) {
                const fullPath = path.join(dirPath, file.name);
                if (file.isDirectory()) {
                    count += this.countFiles(fullPath, extensions);
                } else if (extensions.some(ext => file.name.endsWith(ext))) {
                    count++;
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
        }
        return count;
    }

    findLargeFiles(dirPath, sizeThreshold) {
        const largeFiles = [];
        try {
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const file of files) {
                const fullPath = path.join(dirPath, file.name);
                if (file.isDirectory()) {
                    largeFiles.push(...this.findLargeFiles(fullPath, sizeThreshold));
                } else {
                    try {
                        const stats = fs.statSync(fullPath);
                        if (stats.size > sizeThreshold) {
                            largeFiles.push({
                                path: fullPath,
                                size: `${Math.round(stats.size / 1024)} KB`
                            });
                        }
                    } catch {
                        // File can't be accessed
                    }
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
        }
        return largeFiles;
    }

    checkVSCodeSettings() {
        const settings = {};
        try {
            const vscodeDir = '.vscode';
            const settingsFile = path.join(vscodeDir, 'settings.json');
            if (fs.existsSync(settingsFile)) {
                const content = fs.readFileSync(settingsFile, 'utf8');
                const parsed = JSON.parse(content);
                settings.hasSettings = true;
                settings.count = Object.keys(parsed).length;
            } else {
                settings.hasSettings = false;
            }
        } catch {
            settings.hasSettings = false;
        }
        return settings;
    }

    // Print results
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 PERFORMANCE DIAGNOSTIC REPORT');
        console.log('='.repeat(60));

        // System info
        console.log('\n🖥️  SYSTEM INFORMATION');
        console.log(`   Node.js: ${this.results.system.nodeVersion}`);
        console.log(`   Platform: ${this.results.system.platform} (${this.results.system.arch})`);
        console.log(`   Memory: ${this.results.system.memory.heapUsed}/${this.results.system.memory.heapTotal} (${this.results.system.memory.percentage}%)`);

        // Project info
        console.log('\n📦 PROJECT INFORMATION');
        console.log(`   Dependencies: ${this.results.project.dependencies.prod} prod, ${this.results.project.dependencies.dev} dev`);
        console.log(`   Source files: ${this.results.project.sourceFiles}`);
        console.log(`   node_modules size: ${this.results.project.nodeModulesSize} MB`);
        console.log(`   TypeScript: ${this.results.project.hasTypeScript ? 'Yes' : 'No'}`);

        // VS Code info
        if (this.results.vscode) {
            console.log('\n⚡ VS CODE INFORMATION');
            console.log(`   TypeScript servers: ${this.results.vscode.tsServerProcesses}`);
            console.log(`   Settings file: ${this.results.vscode.settings.hasSettings ? 'Yes' : 'No'}`);
        }

        // Critical issues
        if (this.results.criticalIssues.length > 0) {
            console.log('\n🚨 CRITICAL ISSUES');
            this.results.criticalIssues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
        }

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS');
        if (this.results.recommendations.length === 0) {
            console.log('   ✅ No performance issues detected!');
        } else {
            this.results.recommendations.forEach((rec, i) => {
                const priority = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
                console.log(`   ${i + 1}. ${priority} [${rec.category}] ${rec.issue}`);
                console.log(`      Solution: ${rec.solution}`);
            });
        }

        console.log('\n' + '='.repeat(60));
    }

    // Main diagnostic runner
    async run() {
        console.log('🚀 LeadFive Performance Diagnostics Tool\n');
        
        await this.diagnoseSystem();
        await this.diagnoseProject();
        await this.diagnoseVSCode();
        this.generateRecommendations();
        this.printResults();

        // Save results to file
        const resultsFile = 'performance-diagnostic-results.json';
        fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
    }
}

// Run diagnostics
const diagnostics = new PerformanceDiagnostics();
diagnostics.run().catch(console.error);
