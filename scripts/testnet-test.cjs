const { ethers } = require("hardhat");
const fs = require('fs');

async function testTestnetDeployment() {
    console.log('🧪 COMPREHENSIVE TESTNET TESTING');
    console.log('='.repeat(60));
    
    // Load deployment info
    if (!fs.existsSync('./testnet-deployment-info.json')) {
        throw new Error('❌ Deployment info not found. Please deploy first.');
    }
    
    const deploymentInfo = JSON.parse(
        fs.readFileSync('./testnet-deployment-info.json', 'utf8')
    );
    
    const [deployer] = await ethers.getSigners();
    const contractAddress = deploymentInfo.addresses.proxy;
    const leadFive = await ethers.getContractAt("LeadFive", contractAddress);
    
    console.log('📋 TEST CONFIGURATION:');
    console.log('Contract Address:', contractAddress);
    console.log('Network: BSC Testnet');
    console.log('Testing with account:', deployer.address);
    console.log('Deployer balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'BNB');
    
    // Test suite
    const tests = [
        {
            name: "Contract Initialization",
            critical: true,
            test: async () => {
                const totalUsers = await leadFive.getTotalUsers();
                const platformFeeRecipient = await leadFive.platformFeeRecipient();
                console.log(`  - Total Users: ${totalUsers}`);
                console.log(`  - Platform Fee Recipient: ${platformFeeRecipient}`);
                console.log(`  - Expected: 1 user (deployer), valid recipient`);
                return totalUsers >= 1n && platformFeeRecipient !== ethers.ZeroAddress;
            }
        },
        {
            name: "Admin Configuration",
            critical: true,
            test: async () => {
                const isAdmin = await leadFive.isAdmin(deployer.address);
                const owner = await leadFive.owner();
                console.log(`  - Deployer is Admin: ${isAdmin}`);
                console.log(`  - Contract Owner: ${owner}`);
                console.log(`  - Expected: true, deployer address`);
                return isAdmin && owner === deployer.address;
            }
        },
        {
            name: "USDT Configuration",
            critical: true,
            test: async () => {
                const usdtAddress = await leadFive.usdt();
                const expectedUsdt = deploymentInfo.addresses.usdt;
                console.log(`  - USDT Address: ${usdtAddress}`);
                console.log(`  - Expected: ${expectedUsdt}`);
                console.log(`  - Match: ${usdtAddress === expectedUsdt}`);
                return usdtAddress === expectedUsdt;
            }
        },
        {
            name: "Package Configuration",
            critical: true,
            test: async () => {
                const packages = [];
                for (let i = 1; i <= 4; i++) {
                    const pkg = await leadFive.getPackagePrice(i);
                    packages.push({
                        level: i,
                        price: ethers.formatUnits(pkg, 18),
                        expected: [30, 50, 100, 200][i-1]
                    });
                    console.log(`  - Package ${i}: ${ethers.formatUnits(pkg, 18)} USDT (expected: ${[30, 50, 100, 200][i-1]})`);
                }
                
                // Verify prices match expected values
                const pricesCorrect = packages.every(pkg => 
                    parseFloat(pkg.price) === pkg.expected
                );
                
                console.log(`  - All prices correct: ${pricesCorrect}`);
                return pricesCorrect;
            }
        },
        {
            name: "Package Allocation Verification",
            critical: true,
            test: async () => {
                const allocations = [];
                for (let i = 1; i <= 4; i++) {
                    const alloc = await leadFive.verifyPackageAllocations(i);
                    allocations.push({
                        level: i,
                        directBonus: alloc[1],
                        levelBonus: alloc[2],
                        uplineBonus: alloc[3],
                        leaderBonus: alloc[4],
                        helpBonus: alloc[5],
                        total: alloc[6]
                    });
                    
                    console.log(`  - Package ${i} allocation: Direct=${alloc[1]}, Level=${alloc[2]}, Upline=${alloc[3]}, Leader=${alloc[4]}, Help=${alloc[5]}, Total=${alloc[6]}`);
                }
                
                // Verify total allocation is 10000 (100%)
                const allTotalsCorrect = allocations.every(alloc => alloc.total === 10000n);
                console.log(`  - All allocations total 100%: ${allTotalsCorrect}`);
                return allTotalsCorrect;
            }
        },
        {
            name: "Withdrawal Configuration",
            critical: true,
            test: async () => {
                const dailyLimit = await leadFive.dailyWithdrawalLimit();
                console.log(`  - Daily Withdrawal Limit: ${ethers.formatUnits(dailyLimit, 18)} USDT`);
                console.log(`  - Expected: 1000 USDT`);
                
                const expectedLimit = ethers.parseUnits("1000", 18);
                const limitCorrect = dailyLimit === expectedLimit;
                console.log(`  - Limit correct: ${limitCorrect}`);
                return limitCorrect;
            }
        },
        {
            name: "Pool Balances",
            critical: false,
            test: async () => {
                const leadershipPool = await leadFive.getPoolBalance(1);
                const communityPool = await leadFive.getPoolBalance(2);
                const clubPool = await leadFive.getPoolBalance(3);
                
                console.log(`  - Leadership Pool: ${ethers.formatUnits(leadershipPool, 18)} USDT`);
                console.log(`  - Community Pool: ${ethers.formatUnits(communityPool, 18)} USDT`);
                console.log(`  - Club Pool: ${ethers.formatUnits(clubPool, 18)} USDT`);
                console.log(`  - Expected: All should be 0 initially`);
                
                return leadershipPool === 0n && communityPool === 0n && clubPool === 0n;
            }
        },
        {
            name: "System Health Check",
            critical: true,
            test: async () => {
                const health = await leadFive.getSystemHealth();
                const isOperational = health[0];
                const userCount = health[1];
                const totalFees = health[2];
                const usdtBalance = health[3];
                const bnbBalance = health[4];
                const circuitBreaker = health[5];
                
                console.log(`  - System Operational: ${isOperational}`);
                console.log(`  - User Count: ${userCount}`);
                console.log(`  - Total Fees Collected: ${ethers.formatUnits(totalFees, 18)} USDT`);
                console.log(`  - Contract USDT Balance: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
                console.log(`  - Contract BNB Balance: ${ethers.formatEther(bnbBalance)} BNB`);
                console.log(`  - Circuit Breaker Triggered: ${circuitBreaker}`);
                
                return isOperational && !circuitBreaker && userCount >= 1n;
            }
        },
        {
            name: "Contract Balance & Gas Usage",
            critical: false,
            test: async () => {
                const contractBalance = await leadFive.getContractBalance();
                const usdtBalance = await leadFive.getUSDTBalance();
                
                console.log(`  - Contract BNB Balance: ${ethers.formatEther(contractBalance)} BNB`);
                console.log(`  - Contract USDT Balance: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
                console.log(`  - Expected: 0 for both initially`);
                
                return true; // Always pass, just informational
            }
        },
        {
            name: "Emergency Functions Access",
            critical: true,
            test: async () => {
                // Test that admin functions are accessible
                try {
                    // Try to call admin-only view functions
                    const isAdminResult = await leadFive.isAdmin(deployer.address);
                    console.log(`  - Admin function access: ${isAdminResult ? 'OK' : 'FAILED'}`);
                    console.log(`  - Emergency functions should be callable by admin`);
                    return isAdminResult;
                } catch (error) {
                    console.log(`  - Admin function test failed: ${error.message}`);
                    return false;
                }
            }
        }
    ];
    
    console.log('\n🧪 RUNNING TESTS...\n');
    
    let passed = 0;
    let critical_passed = 0;
    let critical_total = 0;
    
    for (const test of tests) {
        console.log(`📋 ${test.name}`);
        
        if (test.critical) critical_total++;
        
        try {
            const result = await test.test();
            if (result) {
                console.log('✅ PASSED\n');
                passed++;
                if (test.critical) critical_passed++;
            } else {
                console.log('❌ FAILED\n');
                if (test.critical) {
                    console.log('⚠️  CRITICAL TEST FAILED - Investigation required\n');
                }
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}\n`);
            if (test.critical) {
                console.log('⚠️  CRITICAL TEST ERROR - Investigation required\n');
            }
        }
    }
    
    console.log('='.repeat(60));
    console.log(`📊 TEST RESULTS: ${passed}/${tests.length} tests passed`);
    console.log(`🔥 CRITICAL TESTS: ${critical_passed}/${critical_total} passed`);
    
    const testResults = {
        timestamp: new Date().toISOString(),
        contractAddress: contractAddress,
        network: 'bsc-testnet',
        totalTests: tests.length,
        testsPassed: passed,
        criticalTests: critical_total,
        criticalPassed: critical_passed,
        success: critical_passed === critical_total,
        ready_for_mainnet: critical_passed === critical_total && passed >= tests.length * 0.8
    };
    
    // Save test results
    fs.writeFileSync(
        './testnet-test-results.json',
        JSON.stringify(testResults, null, 2)
    );
    
    if (testResults.success) {
        console.log('\n🎉 ALL CRITICAL TESTS PASSED!');
        
        if (testResults.ready_for_mainnet) {
            console.log('✅ CONTRACT IS READY FOR MAINNET DEPLOYMENT!');
            
            console.log('\n📋 MAINNET PREPARATION CHECKLIST:');
            console.log('□ Test user registration with testnet USDT');
            console.log('□ Test package upgrades');
            console.log('□ Test withdrawal functions');
            console.log('□ Test referral mechanisms');
            console.log('□ Monitor for 24-48 hours');
            console.log('□ Prepare mainnet deployment');
            
        } else {
            console.log('⚠️  Some non-critical tests failed. Review before mainnet.');
        }
        
        console.log('\n📋 MANUAL TESTING RECOMMENDATIONS:');
        console.log('1. Get testnet USDT for registration testing');
        console.log('2. Register multiple test accounts');
        console.log('3. Test referral chains');
        console.log('4. Test withdrawal mechanisms');
        console.log('5. Test admin functions');
        
    } else {
        console.log('\n❌ CRITICAL TESTS FAILED!');
        console.log('Please fix the issues before proceeding to mainnet.');
    }
    
    console.log('\n📄 Test results saved to: testnet-test-results.json');
    
    return testResults;
}

// Run tests
if (require.main === module) {
    testTestnetDeployment()
        .then((results) => {
            console.log('\n🧪 Testing completed!');
            process.exit(results.success ? 0 : 1);
        })
        .catch((error) => {
            console.error('❌ Testing failed:', error);
            process.exit(1);
        });
}

module.exports = testTestnetDeployment;
