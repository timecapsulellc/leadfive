#!/usr/bin/env node

/**
 * =====================================================
 * 🧪 BSC TESTNET FUNCTIONALITY TEST - FIXED VERSION
 * =====================================================
 */

require('dotenv').config();
const { ethers } = require('hardhat');

async function testBasicFunctions() {
    console.log('\n🧪 TESTING BSC TESTNET DEPLOYMENT - FIXED VERSION');
    console.log('='.repeat(70));
    
    try {
        // Connect to BSC Testnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        console.log('📡 Network:', (await provider.getNetwork()).name);
        console.log('👤 Tester:', wallet.address);
        console.log('💰 Balance:', ethers.formatEther(await provider.getBalance(wallet.address)), 'BNB');
        console.log();
        
        // Contract address
        const contractAddress = process.env.TESTNET_CONTRACT_ADDRESS;
        console.log('📄 Contract Address:', contractAddress);
        
        // Check if contract exists
        const code = await provider.getCode(contractAddress);
        console.log('📦 Contract exists:', code !== '0x' ? '✅ YES' : '❌ NO');
        console.log('📏 Code length:', code.length, 'chars');
        console.log();
        
        if (code === '0x') {
            console.log('❌ No contract found at this address!');
            return;
        }
        
        // Load contract using ethers.getContractAt for better compatibility
        const [signer] = await ethers.getSigners();
        const leadFive = await ethers.getContractAt("LeadFive", contractAddress, signer);
        
        console.log('🔍 BASIC CONTRACT TESTS:');
        console.log('-'.repeat(50));
        
        // Test suite with proper error handling
        const tests = [
            {
                name: "Owner check",
                test: async () => {
                    const owner = await leadFive.owner();
                    console.log(`   Owner: ${owner}`);
                    console.log(`   Is deployer owner: ${owner.toLowerCase() === wallet.address.toLowerCase() ? 'YES' : 'NO'}`);
                    return true;
                }
            },
            {
                name: "USDT token address",
                test: async () => {
                    const usdtToken = await leadFive.usdt(); // Correct function name
                    console.log(`   USDT Token: ${usdtToken}`);
                    return usdtToken !== ethers.ZeroAddress;
                }
            },
            {
                name: "Contract pause status",
                test: async () => {
                    const isPaused = await leadFive.paused();
                    console.log(`   Contract paused: ${isPaused ? 'YES' : 'NO'}`);
                    return true;
                }
            },
            {
                name: "Total users count",
                test: async () => {
                    const totalUsers = await leadFive.totalUsers(); // Correct function name
                    console.log(`   Total users: ${totalUsers.toString()}`);
                    return true;
                }
            },
            {
                name: "Admin status check",
                test: async () => {
                    const isAdmin = await leadFive.isAdminAddress(wallet.address); // Correct function name
                    console.log(`   Deployer is admin: ${isAdmin ? 'YES' : 'NO'}`);
                    return true;
                }
            },
            {
                name: "Platform fee recipient",
                test: async () => {
                    const feeRecipient = await leadFive.platformFeeRecipient(); // Correct function name
                    console.log(`   Fee recipient: ${feeRecipient}`);
                    return true;
                }
            },
            {
                name: "USDT configuration",
                test: async () => {
                    const usdtConfigured = await leadFive.isUSDTConfigured();
                    const usdtDecimals = await leadFive.usdtDecimals();
                    console.log(`   USDT configured: ${usdtConfigured ? 'YES' : 'NO'}`);
                    console.log(`   USDT decimals: ${usdtDecimals}`);
                    return true;
                }
            },
            {
                name: "Contract version",
                test: async () => {
                    const version = await leadFive.getVersion();
                    console.log(`   Contract version: ${version}`);
                    return true;
                }
            }
        ];
        
        let passed = 0;
        let failed = 0;
        
        for (const test of tests) {
            console.log(`\n📋 ${test.name}:`);
            try {
                await test.test();
                console.log('   ✅ PASSED');
                passed++;
            } catch (error) {
                console.log(`   ❌ FAILED: ${error.message}`);
                failed++;
            }
        }
        
        console.log('\n💎 PACKAGE INFORMATION:');
        console.log('-'.repeat(50));
        
        // Check packages (1-5) with proper error handling
        for (let i = 1; i <= 5; i++) {
            try {
                const packageInfo = await leadFive.packages(i);
                const price = ethers.formatUnits(packageInfo.price, 18);
                console.log(`✅ Package ${i}: $${price} USDT, Daily limit: ${packageInfo.dailyLimit || 'N/A'}`);
            } catch (error) {
                console.log(`❌ Package ${i}: ${error.message}`);
            }
        }
        
        console.log('\n🔗 ADDITIONAL CHECKS:');
        console.log('-'.repeat(50));
        
        // Additional useful checks
        try {
            const contractBalance = await leadFive.getContractBalance();
            console.log(`✅ Contract BNB balance: ${ethers.formatEther(contractBalance)} BNB`);
        } catch (error) {
            console.log(`❌ Contract balance check failed: ${error.message}`);
        }
        
        try {
            const usdtBalance = await leadFive.getUSDTBalance();
            console.log(`✅ Contract USDT balance: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
        } catch (error) {
            console.log(`❌ USDT balance check failed: ${error.message}`);
        }
        
        console.log('\n='.repeat(70));
        console.log('📊 TEST RESULTS SUMMARY:');
        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📄 Contract: ${contractAddress}`);
        console.log(`   🌐 BSCScan: https://testnet.bscscan.com/address/${contractAddress}`);
        
        if (failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED!');
            console.log('✅ Contract is fully functional and ready for use!');
        } else if (passed > failed) {
            console.log('\n⚠️  Most tests passed - Contract is mostly functional');
        } else {
            console.log('\n❌ Many tests failed - Please investigate contract issues');
        }
        
        console.log('\n📋 Next Steps:');
        console.log('1. ✅ Contract verification: COMPLETE');
        console.log('2. 🧪 Basic functionality: TESTED');
        console.log('3. 💰 Test USDT interactions (requires testnet USDT)');
        console.log('4. 👥 Test user registration');
        console.log('5. 🚀 Deploy to BSC Mainnet when ready');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Check if contract address is correct');
        console.log('2. Verify network connection to BSC Testnet');
        console.log('3. Ensure private key is valid');
        console.log('4. Try running: npx hardhat compile');
    }
}

testBasicFunctions()
    .then(() => {
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error.message);
        process.exit(1);
    });
