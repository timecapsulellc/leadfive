#!/usr/bin/env node
/**
 * LEADFIVE SYSTEM AUDIT & ISSUE TRIAGE
 * Comprehensive diagnostic tool for AI agent developer environment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SystemAuditor {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.status = {
            critical: [],
            warnings: [],
            passed: []
        };
    }

    async runFullAudit() {
        console.log('🔍 LEADFIVE SYSTEM AUDIT & ISSUE TRIAGE');
        console.log('=' * 60);
        
        await this.auditFrontendBackend();
        await this.auditSmartContractIntegration();
        await this.auditCompensationPlan();
        await this.auditMarketingAutomation();
        await this.generateReport();
    }

    async auditFrontendBackend() {
        console.log('\n🎯 1. FRONTEND/BACKEND DIAGNOSTIC');
        console.log('-'.repeat(40));

        try {
            // Check build system
            const buildResult = execSync('npm run build', { encoding: 'utf8', cwd: process.cwd() });
            this.status.passed.push('✅ Frontend build system working');
            
            // Check key components
            const criticalFiles = [
                'src/main.jsx',
                'src/App.jsx',
                'vite.config.js',
                'package.json'
            ];

            for (const file of criticalFiles) {
                if (fs.existsSync(file)) {
                    this.status.passed.push(`✅ ${file} exists`);
                } else {
                    this.status.critical.push(`❌ Missing critical file: ${file}`);
                }
            }

            // Check Web3 integration
            const web3ServicePath = 'src/services/Web3Service.js';
            if (fs.existsSync(web3ServicePath)) {
                const content = fs.readFileSync(web3ServicePath, 'utf8');
                if (content.includes('ethers') && content.includes('0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569')) {
                    this.status.passed.push('✅ Web3 service configured correctly');
                } else {
                    this.status.warnings.push('⚠️  Web3 service needs contract address update');
                }
            }

        } catch (error) {
            this.status.critical.push(`❌ Build system error: ${error.message}`);
        }
    }

    async auditSmartContractIntegration() {
        console.log('\n🔗 2. SMART CONTRACT INTEGRATION');
        console.log('-'.repeat(40));

        try {
            // Check contract configuration
            const configPath = 'src/config/app.js';
            if (fs.existsSync(configPath)) {
                const content = fs.readFileSync(configPath, 'utf8');
                
                if (content.includes('0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569')) {
                    this.status.passed.push('✅ Contract address configured correctly');
                } else {
                    this.status.critical.push('❌ Contract address mismatch in app config');
                }

                if (content.includes('chainId: 56')) {
                    this.status.passed.push('✅ BSC Mainnet configuration correct');
                } else {
                    this.status.warnings.push('⚠️  Network configuration needs verification');
                }
            }

            // Check environment variables
            const envPath = '.env.production';
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                
                if (envContent.includes('VITE_CONTRACT_ADDRESS=0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569')) {
                    this.status.passed.push('✅ Production environment variables correct');
                } else {
                    this.status.critical.push('❌ Production environment variables incorrect');
                }
            } else {
                this.status.critical.push('❌ Missing .env.production file');
            }

        } catch (error) {
            this.status.critical.push(`❌ Contract integration error: ${error.message}`);
        }
    }

    async auditCompensationPlan() {
        console.log('\n💰 3. COMPENSATION PLAN AUDIT');
        console.log('-'.repeat(40));

        try {
            // Check for compensation components
            const compensationFiles = [
                'src/components/compensation',
                'src/services/CompensationService.js',
                'src/utils/compensation.js'
            ];

            let compensationFound = false;
            for (const file of compensationFiles) {
                if (fs.existsSync(file)) {
                    compensationFound = true;
                    this.status.passed.push(`✅ Found compensation component: ${file}`);
                }
            }

            if (!compensationFound) {
                this.status.warnings.push('⚠️  No dedicated compensation components found');
                this.fixes.push('Create dedicated compensation service and components');
            }

            // Check for LEAD FIVE presentation integration
            if (fs.existsSync('LEAD_FIVE_presentation.pdf')) {
                this.status.passed.push('✅ Marketing materials available');
            } else {
                this.status.warnings.push('⚠️  Marketing presentation not found');
            }

        } catch (error) {
            this.status.warnings.push(`⚠️  Compensation audit error: ${error.message}`);
        }
    }

    async auditMarketingAutomation() {
        console.log('\n📧 4. MARKETING AUTOMATION AUDIT');
        console.log('-'.repeat(40));

        try {
            // Check for marketing automation components
            const marketingComponents = [
                'src/components/marketing',
                'src/services/MarketingService.js',
                'src/utils/referrals.js'
            ];

            let marketingFound = false;
            for (const component of marketingComponents) {
                if (fs.existsSync(component)) {
                    marketingFound = true;
                    this.status.passed.push(`✅ Found marketing component: ${component}`);
                }
            }

            if (!marketingFound) {
                this.status.warnings.push('⚠️  No dedicated marketing automation found');
                this.fixes.push('Implement marketing automation system');
            }

            // Check for referral system
            const referralFiles = fs.readdirSync('src').filter(file => 
                file.toLowerCase().includes('referral') || 
                file.toLowerCase().includes('genealogy')
            );

            if (referralFiles.length > 0) {
                this.status.passed.push(`✅ Referral system components found: ${referralFiles.length} files`);
            } else {
                this.status.warnings.push('⚠️  Referral system not fully implemented');
            }

        } catch (error) {
            this.status.warnings.push(`⚠️  Marketing automation audit error: ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n📊 SYSTEM AUDIT REPORT');
        console.log('=' * 60);

        console.log('\n✅ PASSED CHECKS:');
        this.status.passed.forEach(item => console.log(`  ${item}`));

        console.log('\n⚠️  WARNINGS:');
        this.status.warnings.forEach(item => console.log(`  ${item}`));

        console.log('\n❌ CRITICAL ISSUES:');
        this.status.critical.forEach(item => console.log(`  ${item}`));

        console.log('\n🔧 RECOMMENDED FIXES:');
        this.fixes.forEach(item => console.log(`  - ${item}`));

        // Priority recommendations
        console.log('\n🎯 IMMEDIATE ACTIONS (24H):');
        console.log('  1. Complete DigitalOcean deployment setup');
        console.log('  2. Verify smart contract integration');
        console.log('  3. Test compensation calculations');
        console.log('  4. Implement live network data integration');

        console.log('\n📈 SYSTEM HEALTH SCORE:');
        const totalChecks = this.status.passed.length + this.status.warnings.length + this.status.critical.length;
        const score = Math.round((this.status.passed.length / totalChecks) * 100);
        console.log(`  ${score}% (${this.status.passed.length}/${totalChecks} checks passed)`);

        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            score: score,
            passed: this.status.passed,
            warnings: this.status.warnings,
            critical: this.status.critical,
            fixes: this.fixes
        };

        fs.writeFileSync('system-audit-report.json', JSON.stringify(report, null, 2));
        console.log('\n💾 Report saved to: system-audit-report.json');
    }
}

// Run audit if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const auditor = new SystemAuditor();
    auditor.runFullAudit().catch(console.error);
}

export default SystemAuditor;
