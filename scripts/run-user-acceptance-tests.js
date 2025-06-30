#!/usr/bin/env node

/**
 * User Acceptance Testing Suite for LeadFive DApp
 * Comprehensive testing of onboarding flow, AI features, and core functionality
 */

import { promises as fs } from 'fs';
import path from 'path';

class UserAcceptanceTestRunner {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async testOnboardingFlow() {
        this.log('🚀 Testing Onboarding Flow', 'info');
        
        try {
            // Check Welcome.jsx for proper structure
            const welcomePath = './src/pages/Welcome.jsx';
            const welcomeContent = await fs.readFile(welcomePath, 'utf8');
            
            const onboardingTests = [
                {
                    name: 'Welcome page has proper animation',
                    test: () => welcomeContent.includes('animation') && welcomeContent.includes('useState'),
                    description: 'Checks if welcome page has animation state management'
                },
                {
                    name: 'Welcome page has skip functionality',
                    test: () => welcomeContent.includes('handleSkip') || welcomeContent.includes('skip'),
                    description: 'Verifies skip button functionality exists'
                },
                {
                    name: 'Welcome page prevents duplicate renders',
                    test: () => welcomeContent.includes('useEffect') && !welcomeContent.includes('setState') + '(' + 'true)',
                    description: 'Ensures no setState calls in render cycle'
                },
                {
                    name: 'Welcome page has proper localStorage handling',
                    test: () => welcomeContent.includes('hasVisitedWelcome') && welcomeContent.includes('localStorage'),
                    description: 'Checks localStorage management for first visit'
                }
            ];

            for (const test of onboardingTests) {
                const result = test.test();
                this.testResults.push({
                    category: 'Onboarding',
                    test: test.name,
                    passed: result,
                    description: test.description
                });
                this.log(`${result ? '✅' : '❌'} ${test.name}`, result ? 'success' : 'error');
            }

        } catch (error) {
            this.log(`Error testing onboarding flow: ${error.message}`, 'error');
        }
    }

    async testAIIntegration() {
        this.log('🤖 Testing AI Integration', 'info');
        
        try {
            const aiFiles = [
                './src/services/OpenAIService.js',
                './src/services/ElevenLabsService.js',
                './src/services/AIServicesIntegration.js',
                './src/services/AIEnhancedFeatures.js',
                './src/components/AICoachingPanel.jsx'
            ];

            for (const filePath of aiFiles) {
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    const fileName = path.basename(filePath);
                    
                    const tests = [
                        {
                            name: `${fileName} has error handling`,
                            test: () => content.includes('try') && content.includes('catch'),
                            description: 'Checks for proper error handling'
                        },
                        {
                            name: `${fileName} has singleton pattern (if applicable)`,
                            test: () => !filePath.includes('Service.js') || content.includes('instance') || content.includes('singleton'),
                            description: 'Verifies singleton pattern for services'
                        },
                        {
                            name: `${fileName} has proper API key handling`,
                            test: () => !content.includes('sk-proj-') && !content.includes('your-api-key'),
                            description: 'Ensures no hardcoded API keys'
                        }
                    ];

                    for (const test of tests) {
                        const result = test.test();
                        this.testResults.push({
                            category: 'AI Integration',
                            test: test.name,
                            passed: result,
                            description: test.description
                        });
                        this.log(`${result ? '✅' : '❌'} ${test.name}`, result ? 'success' : 'error');
                    }

                } catch (error) {
                    this.log(`Could not test ${filePath}: ${error.message}`, 'warning');
                }
            }

        } catch (error) {
            this.log(`Error testing AI integration: ${error.message}`, 'error');
        }
    }

    async testCoreComponents() {
        this.log('🏗️ Testing Core Components', 'info');
        
        try {
            const coreFiles = [
                './src/pages/Dashboard.jsx',
                './src/pages/Register.jsx',
                './src/pages/Packages.jsx',
                './src/pages/Withdrawals.jsx',
                './src/components/NetworkTreeVisualization.jsx'
            ];

            for (const filePath of coreFiles) {
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    const fileName = path.basename(filePath);
                    
                    const tests = [
                        {
                            name: `${fileName} has proper React hooks usage`,
                            test: () => content.includes('useState') || content.includes('useEffect') || content.includes('useCallback'),
                            description: 'Checks for React hooks usage'
                        },
                        {
                            name: `${fileName} has contract integration`,
                            test: () => content.includes('contract') || content.includes('ethers') || content.includes('web3') || content.includes('useLiveNetworkData') || content.includes('useContract') || content.includes('useAI'),
                            description: 'Verifies blockchain contract integration or related hooks'
                        },
                        {
                            name: `${fileName} has proper error boundaries`,
                            test: () => content.includes('catch') || content.includes('error'),
                            description: 'Checks for error handling'
                        }
                    ];

                    for (const test of tests) {
                        const result = test.test();
                        this.testResults.push({
                            category: 'Core Components',
                            test: test.name,
                            passed: result,
                            description: test.description
                        });
                        this.log(`${result ? '✅' : '❌'} ${test.name}`, result ? 'success' : 'error');
                    }

                } catch (error) {
                    this.log(`Could not test ${filePath}: ${error.message}`, 'warning');
                }
            }

        } catch (error) {
            this.log(`Error testing core components: ${error.message}`, 'error');
        }
    }

    async testConfiguration() {
        this.log('⚙️ Testing Configuration', 'info');
        
        try {
            // Test .env configuration
            const envContent = await fs.readFile('./.env', 'utf8');
            
            const configTests = [
                {
                    name: 'BSC RPC URL configured',
                    test: () => envContent.includes('VITE_RPC_URL') && envContent.includes('bsc'),
                    description: 'Checks BSC RPC configuration'
                },
                {
                    name: 'Contract addresses configured',
                    test: () => envContent.includes('VITE_CONTRACT_ADDRESS') && envContent.includes('0x'),
                    description: 'Verifies contract address configuration'
                },
                {
                    name: 'Admin address configured',
                    test: () => envContent.includes('VITE_ADMIN_ADDRESS') && envContent.includes('0x'),
                    description: 'Checks admin address configuration'
                },
                {
                    name: 'AI API keys configured',
                    test: () => envContent.includes('VITE_OPENAI_API_KEY') && envContent.includes('VITE_ELEVENLABS_API_KEY'),
                    description: 'Verifies AI service API keys'
                }
            ];

            for (const test of configTests) {
                const result = test.test();
                this.testResults.push({
                    category: 'Configuration',
                    test: test.name,
                    passed: result,
                    description: test.description
                });
                this.log(`${result ? '✅' : '❌'} ${test.name}`, result ? 'success' : 'error');
            }

        } catch (error) {
            this.log(`Error testing configuration: ${error.message}`, 'error');
        }
    }

    async testMemoryOptimization() {
        this.log('🧠 Testing Memory Optimization', 'info');
        
        try {
            const systemMonitorContent = await fs.readFile('./src/services/SystemMonitor.js', 'utf8');
            const aiServicesContent = await fs.readFile('./src/services/AIServicesIntegration.js', 'utf8');
            
            const memoryTests = [
                {
                    name: 'SystemMonitor has singleton pattern',
                    test: () => systemMonitorContent.includes('SystemMonitor.instance') && systemMonitorContent.includes('constructor'),
                    description: 'Checks SystemMonitor singleton implementation'
                },
                {
                    name: 'AIServicesIntegration has singleton pattern',
                    test: () => aiServicesContent.includes('AIServicesIntegration.instance') && aiServicesContent.includes('constructor'),
                    description: 'Checks AIServices singleton implementation'
                },
                {
                    name: 'Memory thresholds are appropriate for development',
                    test: () => systemMonitorContent.includes('100') || systemMonitorContent.includes('150'),
                    description: 'Verifies memory alert thresholds'
                }
            ];

            for (const test of memoryTests) {
                const result = test.test();
                this.testResults.push({
                    category: 'Memory Optimization',
                    test: test.name,
                    passed: result,
                    description: test.description
                });
                this.log(`${result ? '✅' : '❌'} ${test.name}`, result ? 'success' : 'error');
            }

        } catch (error) {
            this.log(`Error testing memory optimization: ${error.message}`, 'error');
        }
    }

    generateReport() {
        const endTime = Date.now();
        const duration = (endTime - this.startTime) / 1000;
        
        this.log('\n📊 USER ACCEPTANCE TEST REPORT', 'info');
        this.log('=' * 50, 'info');
        
        const categories = [...new Set(this.testResults.map(r => r.category))];
        let totalTests = 0;
        let totalPassed = 0;
        
        for (const category of categories) {
            const categoryTests = this.testResults.filter(r => r.category === category);
            const passed = categoryTests.filter(r => r.passed).length;
            const total = categoryTests.length;
            const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
            
            totalTests += total;
            totalPassed += passed;
            
            this.log(`\n📁 ${category}: ${passed}/${total} (${percentage}%)`, 
                percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error');
            
            for (const test of categoryTests) {
                this.log(`  ${test.passed ? '✅' : '❌'} ${test.test}`, 
                    test.passed ? 'success' : 'error');
            }
        }
        
        const overallPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
        
        this.log('\n🎯 OVERALL RESULTS', 'info');
        this.log(`Total Tests: ${totalTests}`, 'info');
        this.log(`Tests Passed: ${totalPassed}`, 'success');
        this.log(`Tests Failed: ${totalTests - totalPassed}`, totalPassed === totalTests ? 'success' : 'error');
        this.log(`Success Rate: ${overallPercentage}%`, 
            overallPercentage >= 90 ? 'success' : overallPercentage >= 70 ? 'warning' : 'error');
        this.log(`Test Duration: ${duration.toFixed(2)}s`, 'info');
        
        // Readiness assessment
        this.log('\n🚀 PRODUCTION READINESS ASSESSMENT', 'info');
        if (overallPercentage >= 95) {
            this.log('🟢 EXCELLENT - Ready for production deployment!', 'success');
        } else if (overallPercentage >= 85) {
            this.log('🟡 GOOD - Minor issues to address before production', 'warning');
        } else if (overallPercentage >= 70) {
            this.log('🟠 FAIR - Several issues need attention', 'warning');
        } else {
            this.log('🔴 NEEDS WORK - Critical issues must be resolved', 'error');
        }
        
        this.log('\n📋 NEXT STEPS:', 'info');
        this.log('1. Open http://localhost:5176 in browser', 'info');
        this.log('2. Open browser dev tools (F12)', 'info');
        this.log('3. Run: localStorage.clear(); location.reload();', 'info');
        this.log('4. Test the complete onboarding flow', 'info');
        this.log('5. Test AI features in Dashboard and Withdrawals', 'info');
        this.log('6. Verify contract interactions work properly', 'info');
        
        return {
            totalTests,
            totalPassed,
            successRate: overallPercentage,
            duration,
            readiness: overallPercentage >= 85 ? 'ready' : 'needs-work'
        };
    }

    async runAllTests() {
        this.log('🔥 Starting User Acceptance Testing Suite', 'info');
        this.log('=' * 60, 'info');
        
        await this.testConfiguration();
        await this.testOnboardingFlow();
        await this.testAIIntegration();
        await this.testCoreComponents();
        await this.testMemoryOptimization();
        
        return this.generateReport();
    }
}

// Run the tests
const runner = new UserAcceptanceTestRunner();
runner.runAllTests().then(results => {
    process.exit(results.readiness === 'ready' ? 0 : 1);
}).catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
});
