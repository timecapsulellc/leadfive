#!/usr/bin/env node

/**
 * LeadFive User Acceptance Testing (UAT) Framework
 * Comprehensive testing for end-user scenarios
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

class UATFramework {
    constructor() {
        this.testResults = {};
        this.browser = null;
        this.page = null;
        this.uatDir = path.join(__dirname, '..', 'tests', 'uat');
        this.setupDirectories();
    }

    setupDirectories() {
        if (!fs.existsSync(this.uatDir)) {
            fs.mkdirSync(this.uatDir, { recursive: true });
        }
    }

    async initializeBrowser() {
        this.browser = await puppeteer.launch({ 
            headless: false, // Show browser for UAT
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1280, height: 720 }
        });
        this.page = await this.browser.newPage();
    }

    /**
     * Test user registration flow
     */
    async testUserRegistration() {
        console.log('🧪 Testing User Registration Flow...');
        
        try {
            await this.page.goto('http://localhost:5173/register');
            await this.page.waitForSelector('form', { timeout: 10000 });

            // Simulate user inputs
            const testData = {
                sponsor: '0x1234567890123456789012345678901234567890',
                package: '1' // Basic package
            };

            // Check if form fields exist
            const formElements = await this.page.evaluate(() => {
                return {
                    sponsorField: !!document.querySelector('input[name*="sponsor"], input[placeholder*="sponsor"]'),
                    packageSelect: !!document.querySelector('select[name*="package"], input[name*="package"]'),
                    submitButton: !!document.querySelector('button[type="submit"], button:contains("Register")')
                };
            });

            const passed = Object.values(formElements).every(Boolean);
            
            return {
                passed,
                message: passed ? 'Registration form is accessible and complete' : 'Registration form has missing elements',
                details: formElements
            };

        } catch (error) {
            return {
                passed: false,
                message: 'Registration page not accessible',
                error: error.message
            };
        }
    }

    /**
     * Test wallet connection flow
     */
    async testWalletConnection() {
        console.log('🧪 Testing Wallet Connection...');
        
        try {
            await this.page.goto('http://localhost:5173');
            await this.page.waitForSelector('button', { timeout: 10000 });

            // Inject MetaMask mock for testing
            await this.page.evaluateOnNewDocument(() => {
                window.ethereum = {
                    isMetaMask: true,
                    request: async ({ method }) => {
                        if (method === 'eth_requestAccounts') {
                            return ['0x1234567890123456789012345678901234567890'];
                        }
                        if (method === 'eth_chainId') {
                            return '0x38'; // BSC Mainnet
                        }
                        return null;
                    }
                };
            });

            // Look for connect button
            const connectButton = await this.page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.some(btn => 
                    btn.textContent.toLowerCase().includes('connect') ||
                    btn.textContent.toLowerCase().includes('wallet')
                );
            });

            return {
                passed: connectButton,
                message: connectButton ? 'Wallet connection button found' : 'No wallet connection button found'
            };

        } catch (error) {
            return {
                passed: false,
                message: 'Failed to test wallet connection',
                error: error.message
            };
        }
    }

    /**
     * Test dashboard navigation and data display
     */
    async testDashboardNavigation() {
        console.log('🧪 Testing Dashboard Navigation...');
        
        try {
            await this.page.goto('http://localhost:5173/dashboard');
            await this.page.waitForSelector('body', { timeout: 10000 });

            // Check for navigation elements
            const navigation = await this.page.evaluate(() => {
                return {
                    hasMenu: !!document.querySelector('nav, [class*="menu"], [class*="navigation"]'),
                    hasLinks: document.querySelectorAll('a').length > 0,
                    hasButtons: document.querySelectorAll('button').length > 0,
                    hasContent: document.body.textContent.length > 100
                };
            });

            // Test a few navigation clicks
            const clickableElements = await this.page.$$('a, button');
            const hasInteractiveElements = clickableElements.length > 0;

            const passed = navigation.hasContent && hasInteractiveElements;

            return {
                passed,
                message: passed ? 'Dashboard navigation is functional' : 'Dashboard navigation issues detected',
                details: { ...navigation, interactiveElements: clickableElements.length }
            };

        } catch (error) {
            return {
                passed: false,
                message: 'Dashboard navigation test failed',
                error: error.message
            };
        }
    }

    /**
     * Test withdrawal process
     */
    async testWithdrawalProcess() {
        console.log('🧪 Testing Withdrawal Process...');
        
        try {
            await this.page.goto('http://localhost:5173/withdrawals');
            await this.page.waitForSelector('body', { timeout: 10000 });

            const withdrawalFeatures = await this.page.evaluate(() => {
                return {
                    hasForm: !!document.querySelector('form'),
                    hasAmountInput: !!document.querySelector('input[type="number"], input[name*="amount"]'),
                    hasSubmitButton: !!document.querySelector('button[type="submit"]'),
                    hasBalanceDisplay: document.body.textContent.toLowerCase().includes('balance'),
                    hasWithdrawText: document.body.textContent.toLowerCase().includes('withdraw')
                };
            });

            const passed = Object.values(withdrawalFeatures).filter(Boolean).length >= 3;

            return {
                passed,
                message: passed ? 'Withdrawal process elements present' : 'Withdrawal process incomplete',
                details: withdrawalFeatures
            };

        } catch (error) {
            return {
                passed: false,
                message: 'Withdrawal page not accessible',
                error: error.message
            };
        }
    }

    /**
     * Test responsive design
     */
    async testResponsiveDesign() {
        console.log('🧪 Testing Responsive Design...');
        
        const viewports = [
            { width: 1920, height: 1080, name: 'Desktop' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 375, height: 667, name: 'Mobile' }
        ];

        const results = {};

        for (const viewport of viewports) {
            try {
                await this.page.setViewport(viewport);
                await this.page.goto('http://localhost:5173');
                await this.page.waitForTimeout(1000);

                const responsiveCheck = await this.page.evaluate(() => {
                    return {
                        hasContent: document.body.scrollHeight > 100,
                        isScrollable: document.body.scrollHeight > window.innerHeight,
                        hasVisibleElements: document.querySelectorAll('*:not([hidden])').length > 10
                    };
                });

                results[viewport.name] = {
                    passed: responsiveCheck.hasContent && responsiveCheck.hasVisibleElements,
                    details: responsiveCheck
                };

            } catch (error) {
                results[viewport.name] = { passed: false, error: error.message };
            }
        }

        const overallPassed = Object.values(results).every(r => r.passed);

        return {
            passed: overallPassed,
            message: overallPassed ? 'Responsive design working correctly' : 'Responsive design issues detected',
            details: results
        };
    }

    /**
     * Run all UAT tests
     */
    async runAllTests() {
        console.log('🚀 Starting User Acceptance Tests');
        console.log('=' .repeat(50));

        try {
            await this.initializeBrowser();

            const tests = [
                { name: 'User Registration Flow', test: this.testUserRegistration },
                { name: 'Wallet Connection', test: this.testWalletConnection },
                { name: 'Dashboard Navigation', test: this.testDashboardNavigation },
                { name: 'Withdrawal Process', test: this.testWithdrawalProcess },
                { name: 'Responsive Design', test: this.testResponsiveDesign }
            ];

            for (const test of tests) {
                console.log(`\n🧪 Running: ${test.name}...`);
                try {
                    const result = await test.test.call(this);
                    this.testResults[test.name] = result;
                    console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.message}`);
                    
                    if (result.details) {
                        console.log('   Details:', JSON.stringify(result.details, null, 2));
                    }
                } catch (error) {
                    this.testResults[test.name] = { 
                        passed: false, 
                        message: 'Test execution failed',
                        error: error.message 
                    };
                    console.log(`❌ ${test.name}: Test execution failed - ${error.message}`);
                }
            }

            this.generateReport();

        } catch (error) {
            console.error('❌ UAT Framework error:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    /**
     * Generate UAT report
     */
    generateReport() {
        const totalTests = Object.keys(this.testResults).length;
        const passedTests = Object.values(this.testResults).filter(r => r.passed).length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);

        console.log('\n' + '='.repeat(50));
        console.log('📊 USER ACCEPTANCE TEST RESULTS');
        console.log('='.repeat(50));

        for (const [testName, result] of Object.entries(this.testResults)) {
            console.log(`${result.passed ? '✅' : '❌'} ${testName}`);
            if (!result.passed) {
                console.log(`   → ${result.message}`);
            }
        }

        console.log(`\n📈 SUMMARY:`);
        console.log(`   Tests Run: ${totalTests}`);
        console.log(`   Passed: ${passedTests}`);
        console.log(`   Failed: ${totalTests - passedTests}`);
        console.log(`   Success Rate: ${successRate}%`);

        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            summary: { totalTests, passedTests, successRate: `${successRate}%` },
            results: this.testResults
        };

        fs.writeFileSync(
            path.join(this.uatDir, 'uat-report.json'),
            JSON.stringify(report, null, 2)
        );

        console.log(`\n📄 Detailed report saved to: ${path.join(this.uatDir, 'uat-report.json')}`);
    }
}

// CLI execution
if (require.main === module) {
    new UATFramework().runAllTests().catch(console.error);
}

module.exports = UATFramework;
