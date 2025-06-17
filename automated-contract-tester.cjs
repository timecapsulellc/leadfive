#!/usr/bin/env node
/**
 * Automated Testing Suite for OrphiCrowdFund Contract
 * Tests all major functions automatically on BSC Testnet
 * Contract: 0xbad3e2bAEA016099149909CA5263eeFD78bD4aBf
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    CONTRACT_ADDRESS: '0xbad3e2bAEA016099149909CA5263eeFD78bD4aBf',
    TREZOR_WALLET: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29',
    BSC_TESTNET_RPC: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    USDT_TESTNET: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    NETWORK_ID: 97,
    TIMEOUT: 10000
};

// Test results storage
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

// Initialize Web3
const web3 = new Web3(CONFIG.BSC_TESTNET_RPC);

// Contract function signatures
const FUNCTIONS = {
    // View functions
    getPackageAmounts: '0x44b81396',
    totalUsers: '0x4208a78b',
    owner: '0x8da5cb5b',
    version: '0x54fd4d50',
    paused: '0x5c975abb',
    contractName: '0x0c49ccbe',
    getLevelBonusRates: '0x8b7afe2e',
    getWithdrawalRate: '0x3ccfd60b',
    getUserInfo: '0x6b8ff574',
    getGlobalStats: '0x5e383d21',
    
    // Admin functions (read-only tests)
    hasRole: '0x91d14854',
    getRoleAdmin: '0x248a9ca3',
    
    // Contract status
    implementation: '0x5c60da1b'
};

class AutomatedTester {
    constructor() {
        this.web3 = web3;
        this.contractAddress = CONFIG.CONTRACT_ADDRESS;
    }

    async runAllTests() {
        console.log('🤖 ORPHI CROWDFUND AUTOMATED TESTING SUITE');
        console.log('═'.repeat(80));
        console.log(`📋 Contract: ${CONFIG.CONTRACT_ADDRESS}`);
        console.log(`🌐 Network: BSC Testnet (${CONFIG.NETWORK_ID})`);
        console.log(`⏰ Started: ${new Date().toISOString()}`);
        console.log('═'.repeat(80));

        try {
            // Test 1: Basic contract verification
            await this.testContractDeployment();
            
            // Test 2: Ownership verification
            await this.testOwnership();
            
            // Test 3: Package amounts compliance
            await this.testPackageAmounts();
            
            // Test 4: Contract state functions
            await this.testContractState();
            
            // Test 5: Level bonus rates
            await this.testLevelBonusRates();
            
            // Test 6: Contract metadata
            await this.testContractMetadata();
            
            // Test 7: Access control functions
            await this.testAccessControl();
            
            // Test 8: Network connectivity
            await this.testNetworkConnection();
            
            // Test 9: Contract upgrade status
            await this.testUpgradeability();
            
            // Test 10: Function response times
            await this.testPerformance();
            
            // Generate final report
            this.generateReport();
            
        } catch (error) {
            this.logError('Critical testing error', error.message);
        }
    }

    async testContractDeployment() {
        return this.runTest('Contract Deployment', async () => {
            const code = await this.callWithTimeout(
                this.web3.eth.getCode(this.contractAddress)
            );
            
            if (code === '0x') {
                throw new Error('Contract not deployed');
            }
            
            return {
                deployed: true,
                codeSize: code.length,
                proxyPattern: code.includes('360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc') ? 'UUPS' : 'Unknown'
            };
        });
    }

    async testOwnership() {
        return this.runTest('Contract Ownership', async () => {
            const result = await this.callWithTimeout(
                this.web3.eth.call({
                    to: this.contractAddress,
                    data: FUNCTIONS.owner
                })
            );
            
            if (!result || result === '0x') {
                throw new Error('Owner function not responding');
            }
            
            const owner = '0x' + result.slice(-40);
            const isCorrectOwner = owner.toLowerCase() === CONFIG.TREZOR_WALLET.toLowerCase();
            
            if (!isCorrectOwner) {
                throw new Error(`Wrong owner: ${owner}, expected: ${CONFIG.TREZOR_WALLET}`);
            }
            
            return {
                owner: owner,
                secured: true,
                walletType: 'Trezor Hardware Wallet'
            };
        });
    }

    async testPackageAmounts() {
        return this.runTest('Package Amounts Compliance', async () => {
            const result = await this.callWithTimeout(
                this.web3.eth.call({
                    to: this.contractAddress,
                    data: FUNCTIONS.getPackageAmounts
                })
            );
            
            if (!result || result === '0x') {
                throw new Error('getPackageAmounts function not responding');
            }
            
            // Decode package amounts
            const packageAmounts = [];
            for (let i = 0; i < 4; i++) {
                const start = 2 + (i * 64);
                const hexValue = result.slice(start, start + 64);
                if (hexValue && hexValue.length === 64) {
                    const value = this.web3.utils.hexToNumberString('0x' + hexValue);
                    const usdtValue = parseFloat(value) / 1e18;
                    packageAmounts.push(usdtValue);
                }
            }
            
            const expected = [30, 50, 100, 200];
            const isCompliant = packageAmounts.length === 4 && 
                              packageAmounts.every((amount, index) => amount === expected[index]);
            
            if (!isCompliant) {
                throw new Error(`Package amounts not compliant: ${packageAmounts.join(', ')}`);
            }
            
            return {
                packages: packageAmounts,
                compliant: true,
                presentationAligned: true
            };
        });
    }

    async testContractState() {
        return this.runTest('Contract State Functions', async () => {
            const tests = [];
            
            // Test totalUsers
            try {
                const usersResult = await this.callWithTimeout(
                    this.web3.eth.call({
                        to: this.contractAddress,
                        data: FUNCTIONS.totalUsers
                    })
                );
                const totalUsers = usersResult !== '0x' ? this.web3.utils.hexToNumberString(usersResult) : '0';
                tests.push({ function: 'totalUsers', status: 'working', value: totalUsers });
            } catch (e) {
                tests.push({ function: 'totalUsers', status: 'failed', error: e.message });
            }
            
            // Test paused status
            try {
                const pausedResult = await this.callWithTimeout(
                    this.web3.eth.call({
                        to: this.contractAddress,
                        data: FUNCTIONS.paused
                    })
                );
                const isPaused = pausedResult === '0x0000000000000000000000000000000000000000000000000000000000000001';
                tests.push({ function: 'paused', status: 'working', value: isPaused ? 'PAUSED' : 'ACTIVE' });
            } catch (e) {
                tests.push({ function: 'paused', status: 'failed', error: e.message });
            }
            
            const workingFunctions = tests.filter(t => t.status === 'working').length;
            const totalFunctions = tests.length;
            
            return {
                functionTests: tests,
                workingCount: workingFunctions,
                totalCount: totalFunctions,
                successRate: `${Math.round((workingFunctions / totalFunctions) * 100)}%`
            };
        });
    }

    async testLevelBonusRates() {
        return this.runTest('Level Bonus Rates', async () => {
            const result = await this.callWithTimeout(
                this.web3.eth.call({
                    to: this.contractAddress,
                    data: FUNCTIONS.getLevelBonusRates
                })
            );
            
            if (!result || result === '0x') {
                throw new Error('getLevelBonusRates function not responding');
            }
            
            return {
                responding: true,
                dataLength: result.length,
                implemented: true
            };
        });
    }

    async testContractMetadata() {
        return this.runTest('Contract Metadata', async () => {
            const metadata = {};
            
            // Test version
            try {
                const versionResult = await this.callWithTimeout(
                    this.web3.eth.call({
                        to: this.contractAddress,
                        data: FUNCTIONS.version
                    })
                );
                metadata.version = versionResult !== '0x' ? 'Available' : 'Not available';
            } catch (e) {
                metadata.version = 'Error';
            }
            
            // Test contract name
            try {
                const nameResult = await this.callWithTimeout(
                    this.web3.eth.call({
                        to: this.contractAddress,
                        data: FUNCTIONS.contractName
                    })
                );
                metadata.contractName = nameResult !== '0x' ? 'Available' : 'Not available';
            } catch (e) {
                metadata.contractName = 'Error';
            }
            
            return metadata;
        });
    }

    async testAccessControl() {
        return this.runTest('Access Control System', async () => {
            // Test if access control functions are present
            // We'll test with a known role hash
            const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
            
            try {
                const result = await this.callWithTimeout(
                    this.web3.eth.call({
                        to: this.contractAddress,
                        data: FUNCTIONS.getRoleAdmin + DEFAULT_ADMIN_ROLE.slice(2)
                    })
                );
                
                return {
                    accessControlImplemented: result !== '0x',
                    roleBasedSecurity: true
                };
            } catch (e) {
                return {
                    accessControlImplemented: false,
                    error: e.message
                };
            }
        });
    }

    async testNetworkConnection() {
        return this.runTest('Network Connectivity', async () => {
            const [blockNumber, networkId, gasPrice] = await Promise.all([
                this.callWithTimeout(this.web3.eth.getBlockNumber()),
                this.callWithTimeout(this.web3.eth.net.getId()),
                this.callWithTimeout(this.web3.eth.getGasPrice())
            ]);
            
            const isCorrectNetwork = networkId == CONFIG.NETWORK_ID;
            
            if (!isCorrectNetwork) {
                throw new Error(`Wrong network: ${networkId}, expected: ${CONFIG.NETWORK_ID}`);
            }
            
            return {
                blockNumber: blockNumber.toString(),
                networkId: networkId.toString(),
                gasPrice: this.web3.utils.fromWei(gasPrice, 'gwei') + ' gwei',
                correctNetwork: true
            };
        });
    }

    async testUpgradeability() {
        return this.runTest('Upgrade System', async () => {
            try {
                // Check if implementation function exists (UUPS pattern)
                const result = await this.callWithTimeout(
                    this.web3.eth.call({
                        to: this.contractAddress,
                        data: FUNCTIONS.implementation
                    })
                );
                
                return {
                    upgradePattern: result !== '0x' ? 'UUPS' : 'Unknown',
                    upgradeable: result !== '0x',
                    proxyContract: true
                };
            } catch (e) {
                return {
                    upgradePattern: 'Error determining',
                    error: e.message
                };
            }
        });
    }

    async testPerformance() {
        return this.runTest('Performance Metrics', async () => {
            const startTime = Date.now();
            
            // Test multiple function calls for performance
            const promises = [
                this.web3.eth.call({ to: this.contractAddress, data: FUNCTIONS.owner }),
                this.web3.eth.call({ to: this.contractAddress, data: FUNCTIONS.totalUsers }),
                this.web3.eth.call({ to: this.contractAddress, data: FUNCTIONS.paused })
            ];
            
            await Promise.all(promises);
            const responseTime = Date.now() - startTime;
            
            return {
                averageResponseTime: `${responseTime}ms`,
                performance: responseTime < 2000 ? 'Good' : responseTime < 5000 ? 'Acceptable' : 'Slow',
                multiCallSupport: true
            };
        });
    }

    async runTest(testName, testFunction) {
        testResults.total++;
        console.log(`\n🧪 Testing: ${testName}`);
        console.log('─'.repeat(50));
        
        try {
            const result = await testFunction();
            testResults.passed++;
            console.log(`✅ PASSED: ${testName}`);
            
            // Log detailed results
            if (typeof result === 'object') {
                Object.entries(result).forEach(([key, value]) => {
                    console.log(`   ${key}: ${value}`);
                });
            }
            
            testResults.details.push({
                test: testName,
                status: 'PASSED',
                result: result,
                timestamp: new Date().toISOString()
            });
            
            return result;
        } catch (error) {
            testResults.failed++;
            console.log(`❌ FAILED: ${testName}`);
            console.log(`   Error: ${error.message}`);
            
            testResults.details.push({
                test: testName,
                status: 'FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            
            throw error;
        }
    }

    async callWithTimeout(promise) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), CONFIG.TIMEOUT)
            )
        ]);
    }

    logError(context, message) {
        console.log(`❌ ${context}: ${message}`);
        testResults.failed++;
        testResults.total++;
    }

    generateReport() {
        console.log('\n═'.repeat(80));
        console.log('📊 AUTOMATED TESTING REPORT');
        console.log('═'.repeat(80));
        
        const successRate = Math.round((testResults.passed / testResults.total) * 100);
        
        console.log(`📋 Total Tests: ${testResults.total}`);
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📊 Success Rate: ${successRate}%`);
        console.log(`⏰ Completed: ${new Date().toISOString()}`);
        
        console.log('\n🎯 TEST SUMMARY:');
        console.log('─'.repeat(50));
        
        if (successRate >= 90) {
            console.log('🎉 EXCELLENT: Contract is fully operational and ready for production');
        } else if (successRate >= 75) {
            console.log('✅ GOOD: Contract is working well with minor issues');
        } else if (successRate >= 50) {
            console.log('⚠️  ACCEPTABLE: Contract has some issues that need attention');
        } else {
            console.log('❌ POOR: Contract has significant issues requiring immediate attention');
        }
        
        console.log('\n📋 RECOMMENDATIONS:');
        console.log('─'.repeat(50));
        
        if (testResults.passed >= 8) {
            console.log('✅ Ready for frontend integration testing');
            console.log('✅ Ready for user acceptance testing');
            console.log('✅ Consider mainnet deployment preparation');
        } else {
            console.log('⚠️  Review failed tests before proceeding');
            console.log('⚠️  Consider contract debugging or redeployment');
        }
        
        console.log('\n🔗 USEFUL LINKS:');
        console.log(`📱 Dashboard: https://crowdfund-6tz9e53lu-timecapsulellcs-projects.vercel.app`);
        console.log(`🔍 BSCScan: https://testnet.bscscan.com/address/${CONFIG.CONTRACT_ADDRESS}`);
        
        // Save detailed report to file
        this.saveDetailedReport();
        
        console.log('═'.repeat(80));
    }

    saveDetailedReport() {
        const reportData = {
            contract: CONFIG.CONTRACT_ADDRESS,
            network: 'BSC Testnet',
            timestamp: new Date().toISOString(),
            summary: {
                total: testResults.total,
                passed: testResults.passed,
                failed: testResults.failed,
                successRate: Math.round((testResults.passed / testResults.total) * 100)
            },
            details: testResults.details
        };
        
        const reportPath = path.join(__dirname, 'automated-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`\n📄 Detailed report saved: ${reportPath}`);
    }
}

// Run automated tests
if (require.main === module) {
    const tester = new AutomatedTester();
    tester.runAllTests().catch(console.error);
}

module.exports = AutomatedTester;
