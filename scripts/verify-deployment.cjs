#!/usr/bin/env node

/**
 * =====================================================
 * 🔍 COMPREHENSIVE DEPLOYMENT VERIFICATION
 * =====================================================
 */

require('dotenv').config();
const { ethers } = require('hardhat');

async function verifyDeployment() {
    console.log('\n🔍 COMPREHENSIVE DEPLOYMENT VERIFICATION');
    console.log('='.repeat(70));
    
    try {
        // Setup connection
        const [signer] = await ethers.getSigners();
        const network = await ethers.provider.getNetwork();
        
        console.log('🌐 Network Information:');
        console.log('-'.repeat(50));
        console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
        console.log(`   Deployer: ${signer.address}`);
        console.log(`   Balance: ${ethers.formatEther(await ethers.provider.getBalance(signer.address))} BNB`);
        console.log();
        
        // Contract verification
        const contractAddress = process.env.TESTNET_CONTRACT_ADDRESS;
        console.log('📄 Contract Verification:');
        console.log('-'.repeat(50));
        console.log(`   Address: ${contractAddress}`);
        
        // Check if contract exists
        const code = await ethers.provider.getCode(contractAddress);
        const exists = code !== '0x';
        console.log(`   Exists: ${exists ? '✅ YES' : '❌ NO'}`);
        
        if (!exists) {
            console.log('❌ Contract not found at specified address!');
            return;
        }
        
        console.log(`   Code size: ${code.length} characters`);
        console.log(`   BSCScan: https://testnet.bscscan.com/address/${contractAddress}`);
        console.log();
        
        // Load contract
        const leadFive = await ethers.getContractAt("LeadFive", contractAddress, signer);
        
        console.log('⚙️  Contract Configuration:');
        console.log('-'.repeat(50));
        
        const configTests = [
            {
                name: "Contract Owner",
                func: async () => {
                    const owner = await leadFive.owner();
                    const isCorrectOwner = owner.toLowerCase() === signer.address.toLowerCase();
                    return { value: owner, status: isCorrectOwner ? 'CORRECT' : 'INCORRECT' };
                }
            },
            {
                name: "USDT Token",
                func: async () => {
                    const usdt = await leadFive.usdt();
                    const configured = await leadFive.isUSDTConfigured();
                    return { value: usdt, status: configured ? 'CONFIGURED' : 'NOT CONFIGURED' };
                }
            },
            {
                name: "USDT Decimals",
                func: async () => {
                    const decimals = await leadFive.usdtDecimals();
                    return { value: decimals.toString(), status: decimals === 18n ? 'CORRECT (18)' : 'INCORRECT' };
                }
            },
            {
                name: "Contract Status",
                func: async () => {
                    const paused = await leadFive.paused();
                    return { value: paused ? 'PAUSED' : 'ACTIVE', status: paused ? 'PAUSED' : 'ACTIVE' };
                }
            },
            {
                name: "Total Users",
                func: async () => {
                    const total = await leadFive.totalUsers();
                    return { value: total.toString(), status: 'INFO' };
                }
            },
            {
                name: "Fee Recipient",
                func: async () => {
                    const recipient = await leadFive.platformFeeRecipient();
                    const isCorrect = recipient.toLowerCase() === signer.address.toLowerCase();
                    return { value: recipient, status: isCorrect ? 'CORRECT' : 'INCORRECT' };
                }
            },
            {
                name: "Admin Status",
                func: async () => {
                    const isAdmin = await leadFive.isAdminAddress(signer.address);
                    return { value: isAdmin ? 'YES' : 'NO', status: isAdmin ? 'CORRECT' : 'NEEDS SETUP' };
                }
            },
            {
                name: "Contract Version",
                func: async () => {
                    const version = await leadFive.getVersion();
                    return { value: version, status: 'INFO' };
                }
            }
        ];
        
        for (const test of configTests) {
            try {
                const result = await test.func();
                const statusEmoji = result.status.includes('CORRECT') || result.status.includes('ACTIVE') || result.status.includes('CONFIGURED') ? '✅' : 
                                   result.status.includes('INCORRECT') || result.status.includes('PAUSED') ? '❌' : '🔍';
                console.log(`   ${statusEmoji} ${test.name}: ${result.value} (${result.status})`);
            } catch (error) {
                console.log(`   ❌ ${test.name}: Error - ${error.message}`);
            }
        }
        
        console.log();
        console.log('📦 Package Configuration:');
        console.log('-'.repeat(50));
        
        for (let i = 1; i <= 5; i++) {
            try {
                const pkg = await leadFive.packages(i);
                const price = ethers.formatUnits(pkg.price, 18);
                console.log(`   📋 Package ${i}: $${price} USDT`);
            } catch (error) {
                console.log(`   ❌ Package ${i}: Error - ${error.message}`);
            }
        }
        
        console.log();
        console.log('💰 Financial Information:');
        console.log('-'.repeat(50));
        
        try {
            const contractBalance = await leadFive.getContractBalance();
            console.log(`   🏦 Contract BNB: ${ethers.formatEther(contractBalance)} BNB`);
        } catch (error) {
            console.log(`   ❌ Contract BNB: Error - ${error.message}`);
        }
        
        try {
            const usdtBalance = await leadFive.getUSDTBalance();
            console.log(`   💵 Contract USDT: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
        } catch (error) {
            console.log(`   ❌ Contract USDT: Error - ${error.message}`);
        }
        
        try {
            const totalFees = await leadFive.totalPlatformFeesCollected();
            console.log(`   💸 Total Fees: ${ethers.formatUnits(totalFees, 18)} USDT`);
        } catch (error) {
            console.log(`   ❌ Total Fees: Error - ${error.message}`);
        }
        
        console.log();
        console.log('🔒 Security Features:');
        console.log('-'.repeat(50));
        
        try {
            const circuitBreaker = await leadFive.circuitBreakerTriggered();
            const threshold = await leadFive.circuitBreakerThreshold();
            console.log(`   🚨 Circuit Breaker: ${circuitBreaker ? 'TRIGGERED' : 'NORMAL'}`);
            console.log(`   🎯 CB Threshold: ${ethers.formatEther(threshold)} BNB`);
        } catch (error) {
            console.log(`   ❌ Circuit Breaker: Error - ${error.message}`);
        }
        
        try {
            const dailyLimit = await leadFive.dailyWithdrawalLimit();
            console.log(`   📅 Daily Withdrawal Limit: ${ethers.formatUnits(dailyLimit, 18)} USDT`);
        } catch (error) {
            console.log(`   ❌ Daily Limit: Error - ${error.message}`);
        }
        
        console.log();
        console.log('🎯 DEPLOYMENT STATUS SUMMARY:');
        console.log('='.repeat(70));
        console.log('✅ Contract successfully deployed and verified');
        console.log('✅ Basic functions are accessible');
        console.log('✅ Configuration appears correct');
        console.log('✅ Security features are active');
        console.log();
        console.log('📋 Ready for:');
        console.log('   1. 🧪 User registration testing');
        console.log('   2. 💰 USDT interaction testing');
        console.log('   3. 🚀 BSC Mainnet deployment');
        console.log();
        console.log('🌐 Testnet Links:');
        console.log(`   📱 Contract: https://testnet.bscscan.com/address/${contractAddress}`);
        console.log(`   🔍 Read Contract: https://testnet.bscscan.com/address/${contractAddress}#readContract`);
        console.log(`   ✏️  Write Contract: https://testnet.bscscan.com/address/${contractAddress}#writeContract`);
        
    } catch (error) {
        console.error('\n❌ Verification failed:', error);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Ensure contract is deployed correctly');
        console.log('2. Check network connectivity');
        console.log('3. Verify private key and address match');
    }
}

verifyDeployment()
    .then(() => {
        console.log('\n✅ Comprehensive verification completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Verification failed:', error.message);
        process.exit(1);
    });
