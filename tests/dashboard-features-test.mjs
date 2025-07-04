/**
 * Comprehensive Dashboard Feature Testing System
 * Tests all dashboard components and functionality
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class DashboardTester {
    constructor() {
        this.testResults = [];
        this.errors = [];
        this.basePath = '/Users/dadou/LEAD FIVE';
        this.startTime = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        console.log(logMessage);
        
        this.testResults.push({
            timestamp,
            type,
            message,
            success: type === 'success'
        });
    }

    error(message, error = null) {
        this.log(message, 'error');
        if (error) {
            this.errors.push({ message, error: error.toString() });
        }
    }

    success(message) {
        this.log(`✅ ${message}`, 'success');
    }

    info(message) {
        this.log(`ℹ️  ${message}`, 'info');
    }

    warning(message) {
        this.log(`⚠️  ${message}`, 'warning');
    }

    // Test 1: File Structure and Dependencies
    async testFileStructure() {
        this.info('Testing file structure and dependencies...');
        
        const requiredFiles = [
            'src/pages/Dashboard.jsx',
            'src/components/enhanced/ComprehensiveDashboard.jsx',
            'src/components/enhanced/EnhancedWithdrawalSystem.jsx',
            'src/components/AICoachingPanel.jsx',
            'src/components/AIEarningsPrediction.jsx',
            'src/components/PerformanceMetrics.jsx',
            'src/components/CommunityLevelsVisualization.jsx',
            'src/config/contracts.js',
            'src/config/rootUser.js',
            'src/styles/brandColors.css'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(this.basePath, file);
            if (fs.existsSync(filePath)) {
                this.success(`Found required file: ${file}`);
            } else {
                this.error(`Missing required file: ${file}`);
            }
        }
    }

    // Test 2: Brand Color Integration
    async testBrandColors() {
        this.info('Testing brand color integration...');
        
        const brandColorsPath = path.join(this.basePath, 'src/styles/brandColors.css');
        if (fs.existsSync(brandColorsPath)) {
            const content = fs.readFileSync(brandColorsPath, 'utf8');
            
            const requiredColors = [
                '--brand-cyber-blue: #00D4FF',
                '--brand-royal-purple: #7B2CBF',
                '--brand-energy-orange: #FF6B35',
                '--brand-success-green: #00FF88',
                '--brand-premium-gold: #FFD700'
            ];

            for (const color of requiredColors) {
                if (content.includes(color)) {
                    this.success(`Brand color defined: ${color}`);
                } else {
                    this.error(`Missing brand color: ${color}`);
                }
            }
        } else {
            this.error('Brand colors file not found');
        }
    }

    // Test 3: Dashboard Components
    async testDashboardComponents() {
        this.info('Testing dashboard components...');
        
        const dashboardPath = path.join(this.basePath, 'src/pages/Dashboard.jsx');
        if (fs.existsSync(dashboardPath)) {
            const content = fs.readFileSync(dashboardPath, 'utf8');
            
            const requiredImports = [
                'ComprehensiveDashboard',
                'EnhancedWithdrawalSystem',
                'AICoachingPanel',
                'PerformanceMetrics'
            ];

            for (const importName of requiredImports) {
                if (content.includes(importName)) {
                    this.success(`Dashboard imports: ${importName}`);
                } else {
                    this.warning(`Missing dashboard import: ${importName}`);
                }
            }
        }
    }

    // Test 4: Smart Contract Integration
    async testSmartContractConfig() {
        this.info('Testing smart contract configuration...');
        
        const contractsPath = path.join(this.basePath, 'src/config/contracts.js');
        if (fs.existsSync(contractsPath)) {
            const content = fs.readFileSync(contractsPath, 'utf8');
            
            const requiredConfig = [
                '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
                'CONTRACT_ABI',
                'BSC_MAINNET'
            ];

            for (const config of requiredConfig) {
                if (content.includes(config)) {
                    this.success(`Contract config found: ${config}`);
                } else {
                    this.error(`Missing contract config: ${config}`);
                }
            }
        }
    }

    // Test 5: Root User Configuration
    async testRootUserConfig() {
        this.info('Testing root user configuration...');
        
        const rootUserPath = path.join(this.basePath, 'src/config/rootUser.js');
        if (fs.existsSync(rootUserPath)) {
            const content = fs.readFileSync(rootUserPath, 'utf8');
            
            const requiredConfig = [
                '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335',
                'K9NBHT',
                'generateReferralLink',
                'getReferralTarget'
            ];

            for (const config of requiredConfig) {
                if (content.includes(config)) {
                    this.success(`Root user config found: ${config}`);
                } else {
                    this.error(`Missing root user config: ${config}`);
                }
            }
        }
    }

    // Test 6: Build System
    async testBuildSystem() {
        this.info('Testing build system...');
        
        try {
            const buildOutput = execSync('npm run build', { 
                cwd: this.basePath, 
                encoding: 'utf8',
                timeout: 120000 // 2 minutes timeout
            });
            
            if (buildOutput.includes('✓ built in')) {
                this.success('Build completed successfully');
            } else {
                this.warning('Build completed but with warnings');
            }
        } catch (error) {
            this.error('Build failed', error);
        }
    }

    // Test 7: Component Functionality
    async testComponentFunctionality() {
        this.info('Testing component functionality...');
        
        const components = [
            'src/components/AICoachingPanel.jsx',
            'src/components/AIEarningsPrediction.jsx',
            'src/components/PerformanceMetrics.jsx',
            'src/components/CommunityLevelsVisualization.jsx'
        ];

        for (const component of components) {
            const componentPath = path.join(this.basePath, component);
            if (fs.existsSync(componentPath)) {
                const content = fs.readFileSync(componentPath, 'utf8');
                
                // Check for React hooks
                if (content.includes('useState') || content.includes('useEffect')) {
                    this.success(`Component uses React hooks: ${component}`);
                } else {
                    this.warning(`Component may be missing React hooks: ${component}`);
                }
                
                // Check for export
                if (content.includes('export default')) {
                    this.success(`Component properly exported: ${component}`);
                } else {
                    this.error(`Component not properly exported: ${component}`);
                }
            }
        }
    }

    // Test 8: CSS and Styling
    async testStyling() {
        this.info('Testing CSS and styling...');
        
        const styleFiles = [
            'src/styles/brandColors.css',
            'src/pages/Dashboard.css',
            'src/styles/CommunityStructureDashboard.css'
        ];

        for (const styleFile of styleFiles) {
            const stylePath = path.join(this.basePath, styleFile);
            if (fs.existsSync(stylePath)) {
                this.success(`Style file exists: ${styleFile}`);
                
                const content = fs.readFileSync(stylePath, 'utf8');
                if (content.includes('--brand-') || content.includes('#00D4FF')) {
                    this.success(`Brand colors used in: ${styleFile}`);
                }
            } else {
                this.warning(`Style file missing: ${styleFile}`);
            }
        }
    }

    // Test 9: Demo Data Generation
    async testDemoData() {
        this.info('Testing demo data generation...');
        
        const dashboardComponent = path.join(this.basePath, 'src/components/enhanced/ComprehensiveDashboard.jsx');
        if (fs.existsSync(dashboardComponent)) {
            const content = fs.readFileSync(dashboardComponent, 'utf8');
            
            if (content.includes('generateDemoData') || content.includes('loadDemoData')) {
                this.success('Demo data generation functions found');
            } else {
                this.warning('Demo data generation may be missing');
            }
        }
    }

    // Test 10: Production Readiness
    async testProductionReadiness() {
        this.info('Testing production readiness...');
        
        const packageJsonPath = path.join(this.basePath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            if (packageJson.scripts && packageJson.scripts.build) {
                this.success('Build script configured');
            }
            
            if (packageJson.dependencies) {
                const requiredDeps = ['react', 'react-dom', 'ethers'];
                for (const dep of requiredDeps) {
                    if (packageJson.dependencies[dep]) {
                        this.success(`Required dependency found: ${dep}`);
                    } else {
                        this.error(`Missing required dependency: ${dep}`);
                    }
                }
            }
        }
    }

    // Generate Test Report
    generateReport() {
        const endTime = Date.now();
        const duration = (endTime - this.startTime) / 1000;
        
        const successCount = this.testResults.filter(r => r.type === 'success').length;
        const errorCount = this.testResults.filter(r => r.type === 'error').length;
        const warningCount = this.testResults.filter(r => r.type === 'warning').length;
        const totalTests = this.testResults.length;
        
        const report = {
            summary: {
                totalTests,
                successCount,
                errorCount,
                warningCount,
                duration: `${duration}s`,
                successRate: `${((successCount / totalTests) * 100).toFixed(1)}%`
            },
            results: this.testResults,
            errors: this.errors,
            recommendations: this.generateRecommendations()
        };
        
        // Save report
        const reportPath = path.join(this.basePath, 'DASHBOARD_TEST_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.errors.length > 0) {
            recommendations.push('Fix all error-level issues before production deployment');
        }
        
        if (this.testResults.filter(r => r.type === 'warning').length > 0) {
            recommendations.push('Review and address warning-level issues');
        }
        
        recommendations.push('Test wallet connectivity with real users');
        recommendations.push('Verify smart contract integration on mainnet');
        recommendations.push('Perform load testing before Digital Ocean deployment');
        
        return recommendations;
    }

    // Run All Tests
    async runAllTests() {
        console.log('🚀 Starting Comprehensive Dashboard Testing...');
        console.log('================================================');
        
        await this.testFileStructure();
        await this.testBrandColors();
        await this.testDashboardComponents();
        await this.testSmartContractConfig();
        await this.testRootUserConfig();
        await this.testComponentFunctionality();
        await this.testStyling();
        await this.testDemoData();
        await this.testProductionReadiness();
        await this.testBuildSystem();
        
        const report = this.generateReport();
        
        console.log('\n📊 Test Summary:');
        console.log('================');
        console.log(`✅ Successful: ${report.summary.successCount}`);
        console.log(`❌ Errors: ${report.summary.errorCount}`);
        console.log(`⚠️  Warnings: ${report.summary.warningCount}`);
        console.log(`⏱️  Duration: ${report.summary.duration}`);
        console.log(`📈 Success Rate: ${report.summary.successRate}`);
        
        if (report.summary.errorCount === 0) {
            console.log('\n🎉 DASHBOARD READY FOR PRODUCTION!');
        } else {
            console.log('\n🔧 FIXES NEEDED BEFORE PRODUCTION');
        }
        
        console.log(`\n📄 Full report saved to: DASHBOARD_TEST_REPORT.json`);
        
        return report;
    }
}

// Run the tests
const tester = new DashboardTester();
tester.runAllTests().catch(console.error);

export default DashboardTester;