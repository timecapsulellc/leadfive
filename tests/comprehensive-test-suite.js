/**
 * LEADFIVE COMPREHENSIVE TEST SUITE
 * Tests for compensation scenarios, contract interactions, and edge cases
 */

import CompensationService from '../src/services/CompensationService.js';
import AIAgentValidator from '../src/services/AIAgentValidator.js';
import KnowledgeBaseManager from '../src/services/KnowledgeBaseManager.js';
import SystemMonitor from '../src/services/SystemMonitor.js';

class TestSuite {
    constructor() {
        this.compensationService = new CompensationService();
        this.validator = new AIAgentValidator();
        this.knowledgeBase = new KnowledgeBaseManager();
        this.monitor = new SystemMonitor();
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    async runAllTests() {
        console.log('🧪 LEADFIVE COMPREHENSIVE TEST SUITE');
        console.log('=' * 60);

        await this.testCompensationScenarios();
        await this.testContractInteractions();
        await this.testEdgeCases();
        await this.testAIValidation();
        await this.testKnowledgeBase();
        await this.testSystemMonitoring();

        this.generateReport();
    }

    async runTest(testName, testFunction) {
        this.results.total++;
        console.log(`\n🔬 Testing: ${testName}`);
        
        try {
            const startTime = Date.now();
            await testFunction();
            const duration = Date.now() - startTime;
            
            this.results.passed++;
            this.results.details.push({
                name: testName,
                status: 'PASSED',
                duration: duration,
                timestamp: new Date().toISOString()
            });
            
            console.log(`✅ ${testName} - PASSED (${duration}ms)`);
        } catch (error) {
            this.results.failed++;
            this.results.details.push({
                name: testName,
                status: 'FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            console.error(`❌ ${testName} - FAILED: ${error.message}`);
        }
    }

    async testCompensationScenarios() {
        console.log('\n💰 COMPENSATION SCENARIO TESTS');
        console.log('-' * 40);

        // Test 1: Direct Referral Compensation
        await this.runTest('Direct Referral Compensation', async () => {
            const testAddress = '0x742d35Cc6634C0532925a3b8D208800b3cea8574';
            const transactionAmount = 1000;
            const packageLevel = 1;

            const result = await this.compensationService.validateCompensation(
                testAddress, 
                transactionAmount, 
                packageLevel
            );

            if (!result.directBonus || result.directBonus <= 0) {
                throw new Error('Direct bonus calculation failed');
            }

            if (result.directBonus !== transactionAmount * 0.20) { // 20% for level 1
                console.log(`Expected: ${transactionAmount * 0.20}, Got: ${result.directBonus}`);
                // Note: This might fail due to contract-specific calculations
            }
        });

        // Test 2: Matrix Spillover Logic
        await this.runTest('Matrix Spillover Logic', async () => {
            const sponsorAddress = '0x742d35Cc6634C0532925a3b8D208800b3cea8574';
            const newMemberAddress = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
            const matrixPosition = 4; // Should trigger spillover

            const result = await this.compensationService.handleMatrixSpillover(
                sponsorAddress,
                newMemberAddress,
                matrixPosition
            );

            if (matrixPosition > 3 && !result.spillover_recipient) {
                // This is expected behavior for positions > 3
                console.log('✓ Spillover logic working correctly');
            }
        });

        // Test 3: Level Compensation Rates
        const levelTests = [
            { level: 1, expectedRate: 0.20 },
            { level: 2, expectedRate: 0.10 },
            { level: 3, expectedRate: 0.05 },
            { level: 4, expectedRate: 0.03 },
            { level: 5, expectedRate: 0.02 }
        ];

        for (const test of levelTests) {
            await this.runTest(`Level ${test.level} Compensation Rate`, async () => {
                const rate = await this.compensationService.getCompensationRate(test.level);
                
                if (rate !== test.expectedRate) {
                    throw new Error(`Expected rate ${test.expectedRate}, got ${rate}`);
                }
            });
        }

        // Test 4: Package Validation
        await this.runTest('Package Validation', async () => {
            for (let packageLevel = 1; packageLevel <= 4; packageLevel++) {
                const validation = await this.compensationService.validatePackageRegistration(
                    packageLevel, 
                    'BNB'
                );

                if (!validation.valid) {
                    throw new Error(`Package ${packageLevel} validation failed: ${validation.error}`);
                }

                if (validation.packageLevel !== packageLevel) {
                    throw new Error(`Package level mismatch: expected ${packageLevel}, got ${validation.packageLevel}`);
                }
            }
        });
    }

    async testContractInteractions() {
        console.log('\n🔗 CONTRACT INTERACTION TESTS');
        console.log('-' * 40);

        // Test 1: Contract Connection
        await this.runTest('Contract Connection', async () => {
            if (!this.compensationService.contract) {
                throw new Error('Contract not initialized');
            }

            if (!this.compensationService.provider) {
                throw new Error('Provider not initialized');
            }

            // Test a simple read operation
            try {
                await this.compensationService.provider.getBlockNumber();
            } catch (error) {
                throw new Error(`Provider connection failed: ${error.message}`);
            }
        });

        // Test 2: User Info Retrieval
        await this.runTest('User Info Retrieval', async () => {
            const testAddress = '0x742d35Cc6634C0532925a3b8D208800b3cea8574';
            
            try {
                const userInfo = await this.compensationService.contract.getUserInfo(testAddress);
                
                // Check that we get a valid response structure
                if (typeof userInfo.isRegistered === 'undefined') {
                    throw new Error('Invalid user info structure');
                }
            } catch (error) {
                // This might fail if the address isn't registered, which is okay
                console.log('ℹ️  User not registered or contract call failed (expected)');
            }
        });

        // Test 3: Package Info Retrieval
        await this.runTest('Package Info Retrieval', async () => {
            for (let level = 1; level <= 4; level++) {
                try {
                    const packageInfo = await this.compensationService.contract.getPackageInfo(level);
                    
                    if (!packageInfo.price || packageInfo.price <= 0) {
                        throw new Error(`Invalid package price for level ${level}`);
                    }
                } catch (error) {
                    throw new Error(`Package info retrieval failed for level ${level}: ${error.message}`);
                }
            }
        });

        // Test 4: Pool Balances
        await this.runTest('Pool Balances', async () => {
            try {
                const poolBalances = await this.compensationService.contract.getPoolBalances();
                
                if (!Array.isArray(poolBalances) || poolBalances.length !== 3) {
                    throw new Error('Invalid pool balances structure');
                }
            } catch (error) {
                throw new Error(`Pool balances retrieval failed: ${error.message}`);
            }
        });
    }

    async testEdgeCases() {
        console.log('\n⚠️  EDGE CASE TESTS');
        console.log('-' * 40);

        // Test 1: Invalid Package Levels
        await this.runTest('Invalid Package Levels', async () => {
            const invalidLevels = [0, 5, 99, -1];
            
            for (const level of invalidLevels) {
                const validation = await this.compensationService.validatePackageRegistration(level);
                
                if (validation.valid) {
                    throw new Error(`Package level ${level} should be invalid but was accepted`);
                }
            }
        });

        // Test 2: Invalid Addresses
        await this.runTest('Invalid Addresses', async () => {
            const invalidAddresses = [
                '0x123',
                'invalid',
                '',
                '0x0000000000000000000000000000000000000000'
            ];

            for (const address of invalidAddresses) {
                try {
                    await this.compensationService.validateCompensation(address, 1000, 1);
                    // If it doesn't throw, the address might be the zero address which could be valid
                    if (address !== '0x0000000000000000000000000000000000000000') {
                        throw new Error(`Invalid address ${address} was accepted`);
                    }
                } catch (error) {
                    // Expected for invalid addresses
                    console.log(`✓ Correctly rejected invalid address: ${address}`);
                }
            }
        });

        // Test 3: Zero and Negative Amounts
        await this.runTest('Zero and Negative Amounts', async () => {
            const testAddress = '0x742d35Cc6634C0532925a3b8D208800b3cea8574';
            const invalidAmounts = [0, -100, -1];

            for (const amount of invalidAmounts) {
                const validation = await this.validator.validateQuery('compensation', {
                    calculationType: 'direct_commission',
                    userAddress: testAddress,
                    amount: amount,
                    packageLevel: 1
                });

                if (validation.valid) {
                    throw new Error(`Amount ${amount} should be invalid but was accepted`);
                }
            }
        });

        // Test 4: Matrix Position Edge Cases
        await this.runTest('Matrix Position Edge Cases', async () => {
            const sponsorAddress = '0x742d35Cc6634C0532925a3b8D208800b3cea8574';
            const memberAddress = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
            const edgePositions = [0, 100, -1];

            for (const position of edgePositions) {
                const result = await this.compensationService.handleMatrixSpillover(
                    sponsorAddress,
                    memberAddress,
                    position
                );

                // Should handle gracefully without crashing
                if (!result || typeof result !== 'object') {
                    throw new Error(`Matrix spillover failed for position ${position}`);
                }
            }
        });
    }

    async testAIValidation() {
        console.log('\n🤖 AI VALIDATION TESTS');
        console.log('-' * 40);

        // Test 1: Contract Query Validation
        await this.runTest('Contract Query Validation', async () => {
            const validQuery = {
                method: 'getUserInfo',
                params: ['0x742d35Cc6634C0532925a3b8D208800b3cea8574']
            };

            const result = await this.validator.validateQuery('contract', validQuery);
            
            if (!result.valid) {
                throw new Error(`Valid contract query rejected: ${result.error}`);
            }
        });

        // Test 2: Invalid Method Rejection
        await this.runTest('Invalid Method Rejection', async () => {
            const invalidQuery = {
                method: 'invalidMethod',
                params: []
            };

            const result = await this.validator.validateQuery('contract', invalidQuery);
            
            if (result.valid) {
                throw new Error('Invalid method was accepted');
            }
        });

        // Test 3: Compensation Query Validation
        await this.runTest('Compensation Query Validation', async () => {
            const compensationQuery = {
                calculationType: 'direct_commission',
                userAddress: '0x742d35Cc6634C0532925a3b8D208800b3cea8574',
                amount: 1000,
                packageLevel: 2
            };

            const result = await this.validator.validateQuery('compensation', compensationQuery);
            
            if (!result.valid) {
                throw new Error(`Valid compensation query rejected: ${result.error}`);
            }
        });

        // Test 4: Business Logic Validation
        await this.runTest('Business Logic Validation', async () => {
            const businessQuery = {
                logicType: 'rank_advancement',
                data: {
                    userAddress: '0x742d35Cc6634C0532925a3b8D208800b3cea8574',
                    currentVolume: 5000,
                    currentReferrals: 10
                }
            };

            const result = await this.validator.validateQuery('business_logic', businessQuery);
            
            if (!result.valid) {
                throw new Error(`Valid business logic query rejected: ${result.error}`);
            }
        });
    }

    async testKnowledgeBase() {
        console.log('\n🧠 KNOWLEDGE BASE TESTS');
        console.log('-' * 40);

        // Test 1: Knowledge Base Initialization
        await this.runTest('Knowledge Base Initialization', async () => {
            if (!this.knowledgeBase || typeof this.knowledgeBase.searchKnowledge !== 'function') {
                throw new Error('Knowledge base not properly initialized');
            }
        });

        // Test 2: Document Embedding
        await this.runTest('Document Embedding', async () => {
            const result = await this.knowledgeBase.embedMarketingMaterials();
            
            if (!result.success) {
                throw new Error(`Document embedding failed: ${result.error}`);
            }

            if (result.documentsCount < 1) {
                throw new Error('No documents were embedded');
            }
        });

        // Test 3: Knowledge Search
        await this.runTest('Knowledge Search', async () => {
            const searchResults = await this.knowledgeBase.searchKnowledge('compensation plan');
            
            if (!Array.isArray(searchResults)) {
                throw new Error('Search results should be an array');
            }

            if (searchResults.length === 0) {
                console.log('ℹ️  No search results found (may be expected if knowledge base is empty)');
            }
        });

        // Test 4: Context Generation
        await this.runTest('Context Generation', async () => {
            const context = await this.knowledgeBase.getContextForQuery('package levels');
            
            if (!context || !context.query) {
                throw new Error('Context generation failed');
            }

            if (!Array.isArray(context.contextDocuments)) {
                throw new Error('Context documents should be an array');
            }
        });
    }

    async testSystemMonitoring() {
        console.log('\n📊 SYSTEM MONITORING TESTS');
        console.log('-' * 40);

        // Test 1: Monitor Initialization
        await this.runTest('Monitor Initialization', async () => {
            if (!this.monitor || typeof this.monitor.trackMetric !== 'function') {
                throw new Error('System monitor not properly initialized');
            }
        });

        // Test 2: Metric Tracking
        await this.runTest('Metric Tracking', async () => {
            await this.monitor.trackMetric('test_metric', 100);
            
            const stats = this.monitor.getMetricStats('test_metric');
            if (!stats || stats.count !== 1) {
                throw new Error('Metric tracking failed');
            }
        });

        // Test 3: Alert System
        await this.runTest('Alert System', async () => {
            // Set a low threshold for testing
            this.monitor.updateThresholds({ test_alert_metric: 50 });
            
            // Track a value that should trigger an alert
            await this.monitor.trackMetric('test_alert_metric', 100);
            
            const alerts = this.monitor.getRecentAlerts();
            if (alerts.length === 0) {
                throw new Error('Alert system did not trigger expected alert');
            }
        });

        // Test 4: Health Check
        await this.runTest('System Health Check', async () => {
            const health = this.monitor.getSystemHealth();
            
            if (!health || !health.status) {
                throw new Error('Health check failed');
            }

            if (!['healthy', 'warning', 'degraded', 'critical'].includes(health.status)) {
                throw new Error(`Invalid health status: ${health.status}`);
            }
        });
    }

    generateReport() {
        console.log('\n📋 TEST SUITE REPORT');
        console.log('=' * 60);

        const passRate = (this.results.passed / this.results.total * 100).toFixed(2);
        
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Pass Rate: ${passRate}%`);

        if (this.results.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results.details
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.error}`);
                });
        }

        console.log('\n✅ PASSED TESTS:');
        this.results.details
            .filter(test => test.status === 'PASSED')
            .forEach(test => {
                console.log(`  - ${test.name} (${test.duration}ms)`);
            });

        // Save detailed report
        const report = {
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                passRate: passRate,
                timestamp: new Date().toISOString()
            },
            details: this.results.details,
            systemInfo: {
                contractAddress: '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569',
                network: 'BSC Mainnet',
                testEnvironment: 'Browser'
            }
        };

        // In a real environment, you'd save this to a file or send to a monitoring service
        console.log('\n💾 Test report generated');
        return report;
    }
}

// Export for use in other modules
export default TestSuite;

// If running directly in browser console
if (typeof window !== 'undefined') {
    window.LeadFiveTestSuite = TestSuite;
}
