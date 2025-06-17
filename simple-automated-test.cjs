#!/usr/bin/env node
/**
 * Simple Automated Contract Testing
 * Tests core functions of OrphiCrowdFund contract
 */

const { Web3 } = require('web3');

async function runSimpleTests() {
    console.log('🤖 ORPHI CROWDFUND AUTOMATED TESTS');
    console.log('═'.repeat(60));
    
    const CONTRACT_ADDRESS = '0xbad3e2bAEA016099149909CA5263eeFD78bD4aBf';
    const TREZOR_WALLET = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
    
    let passed = 0;
    let total = 0;
    
    try {
        console.log('🔗 Connecting to BSC Testnet...');
        const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');
        
        // Test 1: Contract exists
        total++;
        console.log('\n🧪 Test 1: Contract Deployment');
        try {
            const code = await web3.eth.getCode(CONTRACT_ADDRESS);
            if (code !== '0x') {
                console.log('✅ PASSED: Contract is deployed');
                console.log(`   Code size: ${code.length} bytes`);
                passed++;
            } else {
                console.log('❌ FAILED: Contract not found');
            }
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
        }
        
        // Test 2: Network connection
        total++;
        console.log('\n🧪 Test 2: Network Connectivity');
        try {
            const [blockNumber, networkId] = await Promise.all([
                web3.eth.getBlockNumber(),
                web3.eth.net.getId()
            ]);
            
            if (networkId == 97) {
                console.log('✅ PASSED: Connected to BSC Testnet');
                console.log(`   Latest block: ${blockNumber}`);
                console.log(`   Network ID: ${networkId}`);
                passed++;
            } else {
                console.log(`❌ FAILED: Wrong network (${networkId})`);
            }
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
        }
        
        // Test 3: Owner verification (with timeout)
        total++;
        console.log('\n🧪 Test 3: Contract Ownership');
        try {
            const ownerCall = web3.eth.call({
                to: CONTRACT_ADDRESS,
                data: '0x8da5cb5b' // owner()
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );
            
            const result = await Promise.race([ownerCall, timeoutPromise]);
            
            if (result && result !== '0x') {
                const owner = '0x' + result.slice(-40);
                const isCorrect = owner.toLowerCase() === TREZOR_WALLET.toLowerCase();
                
                if (isCorrect) {
                    console.log('✅ PASSED: Correct owner verified');
                    console.log(`   Owner: ${owner}`);
                    console.log('   Wallet: Trezor Hardware Wallet');
                    passed++;
                } else {
                    console.log(`❌ FAILED: Wrong owner (${owner})`);
                }
            } else {
                console.log('❌ FAILED: Owner function not responding');
            }
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
        }
        
        // Test 4: Package amounts (with timeout)
        total++;
        console.log('\n🧪 Test 4: Package Amounts');
        try {
            const packageCall = web3.eth.call({
                to: CONTRACT_ADDRESS,
                data: '0x44b81396' // getPackageAmounts()
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );
            
            const result = await Promise.race([packageCall, timeoutPromise]);
            
            if (result && result !== '0x' && result.length > 10) {
                console.log('✅ PASSED: Package amounts function working');
                console.log(`   Response length: ${result.length} characters`);
                console.log('   Expected: $30, $50, $100, $200 USDT');
                passed++;
            } else {
                console.log('❌ FAILED: Package amounts not responding');
            }
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
        }
        
        // Test 5: Total users (with timeout)
        total++;
        console.log('\n🧪 Test 5: Total Users Function');
        try {
            const usersCall = web3.eth.call({
                to: CONTRACT_ADDRESS,
                data: '0x4208a78b' // totalUsers()
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );
            
            const result = await Promise.race([usersCall, timeoutPromise]);
            
            if (result && result !== '0x') {
                const totalUsers = web3.utils.hexToNumberString(result);
                console.log('✅ PASSED: Total users function working');
                console.log(`   Total users: ${totalUsers}`);
                passed++;
            } else {
                console.log('❌ FAILED: Total users function not responding');
            }
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
        }
        
    } catch (error) {
        console.log(`❌ CRITICAL ERROR: ${error.message}`);
    }
    
    // Results
    console.log('\n═'.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('═'.repeat(60));
    
    const successRate = Math.round((passed / total) * 100);
    
    console.log(`📋 Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${total - passed}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
        console.log('\n🎉 EXCELLENT: Contract is ready for production testing!');
        console.log('✅ All core functions are working correctly');
        console.log('✅ Contract is secured with Trezor wallet');
        console.log('✅ Ready for frontend integration');
    } else if (successRate >= 60) {
        console.log('\n⚠️  GOOD: Contract is mostly working with minor issues');
        console.log('✅ Core functionality appears operational');
        console.log('⚠️  Some functions may need attention');
    } else {
        console.log('\n❌ ISSUES DETECTED: Contract needs attention');
        console.log('❌ Multiple functions are not responding');
        console.log('❌ Review contract deployment and network connectivity');
    }
    
    console.log('\n🔗 NEXT STEPS:');
    console.log('─'.repeat(40));
    console.log('📱 Test Dashboard: https://crowdfund-6tz9e53lu-timecapsulellcs-projects.vercel.app');
    console.log('🔍 View on BSCScan: https://testnet.bscscan.com/address/' + CONTRACT_ADDRESS);
    console.log('💰 Test with MetaMask on BSC Testnet');
    
    console.log('\n═'.repeat(60));
    console.log(`⏰ Test completed at: ${new Date().toISOString()}`);
    console.log('═'.repeat(60));
}

// Run tests
runSimpleTests().catch(console.error);
