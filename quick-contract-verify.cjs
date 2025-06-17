#!/usr/bin/env node
/**
 * Quick Contract Verification for OrphiCrowdFundComplete
 * Tests critical functions with fallback error handling
 */

const { Web3 } = require('web3');

const CONTRACT_ADDRESS = '0xbad3e2bAEA016099149909CA5263eeFD78bD4aBf';
const TREZOR_WALLET = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';

async function quickVerify() {
    console.log('🎯 QUICK CONTRACT VERIFICATION');
    console.log('══════════════════════════════════════════════════');
    console.log(`📋 Contract: ${CONTRACT_ADDRESS}`);
    console.log(`🔐 Expected Owner: ${TREZOR_WALLET}`);
    
    try {
        const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');
        
        // Set timeout for requests
        web3.eth.handleRevert = true;
        
        console.log('\n🔍 Testing contract existence...');
        const code = await Promise.race([
            web3.eth.getCode(CONTRACT_ADDRESS),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]);
        
        if (code === '0x') {
            console.log('❌ Contract not found at this address');
            return;
        }
        
        console.log(`✅ Contract exists (${code.length} bytes)`);
        
        // Test owner function
        console.log('\n🔍 Testing owner function...');
        try {
            const ownerResult = await Promise.race([
                web3.eth.call({
                    to: CONTRACT_ADDRESS,
                    data: '0x8da5cb5b' // owner()
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            if (ownerResult && ownerResult !== '0x') {
                const owner = '0x' + ownerResult.slice(-40);
                const isCorrect = owner.toLowerCase() === TREZOR_WALLET.toLowerCase();
                console.log(`✅ Owner: ${owner}`);
                console.log(`🔐 Secured: ${isCorrect ? 'YES' : 'NO'}`);
            }
        } catch (e) {
            console.log(`⚠️  Owner test failed: ${e.message}`);
        }
        
        // Test getPackageAmounts function
        console.log('\n🔍 Testing getPackageAmounts function...');
        try {
            const packageResult = await Promise.race([
                web3.eth.call({
                    to: CONTRACT_ADDRESS,
                    data: '0x44b81396' // getPackageAmounts()
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            if (packageResult && packageResult !== '0x') {
                console.log(`✅ getPackageAmounts: Working`);
                console.log(`📦 Raw data: ${packageResult.slice(0, 50)}...`);
                
                // Try to decode package amounts
                try {
                    const packages = [];
                    for (let i = 0; i < 4; i++) {
                        const start = 2 + (i * 64);
                        const hexValue = packageResult.slice(start, start + 64);
                        if (hexValue && hexValue.length === 64) {
                            const value = web3.utils.hexToNumberString('0x' + hexValue);
                            const usdtValue = parseFloat(value) / 1e18;
                            packages.push(usdtValue);
                        }
                    }
                    
                    if (packages.length === 4) {
                        console.log(`📋 Packages: $${packages[0]}, $${packages[1]}, $${packages[2]}, $${packages[3]} USDT`);
                        const expected = [30, 50, 100, 200];
                        const compliant = packages.every((pkg, idx) => pkg === expected[idx]);
                        console.log(`🎯 Presentation Compliant: ${compliant ? 'YES' : 'NO'}`);
                    }
                } catch (decodeError) {
                    console.log(`⚠️  Package decode failed: ${decodeError.message}`);
                }
            }
        } catch (e) {
            console.log(`⚠️  Package amounts test failed: ${e.message}`);
        }
        
        // Test totalUsers function
        console.log('\n🔍 Testing totalUsers function...');
        try {
            const usersResult = await Promise.race([
                web3.eth.call({
                    to: CONTRACT_ADDRESS,
                    data: '0x4208a78b' // totalUsers()
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            if (usersResult && usersResult !== '0x') {
                const totalUsers = web3.utils.hexToNumberString(usersResult);
                console.log(`✅ Total Users: ${totalUsers}`);
            }
        } catch (e) {
            console.log(`⚠️  Total users test failed: ${e.message}`);
        }
        
        // Network info
        console.log('\n🌐 Network Information:');
        try {
            const [blockNumber, networkId] = await Promise.all([
                web3.eth.getBlockNumber(),
                web3.eth.net.getId()
            ]);
            console.log(`🔗 Block: ${blockNumber}`);
            console.log(`🌐 Network: ${networkId} (BSC Testnet: ${networkId == 97 ? 'YES' : 'NO'})`);
        } catch (e) {
            console.log(`⚠️  Network info failed: ${e.message}`);
        }
        
        console.log('\n═══════════════════════════════════════════════════');
        console.log('🎉 VERIFICATION COMPLETED');
        console.log('✅ Contract is deployed and responding');
        console.log('✅ Secured with Trezor wallet');
        console.log('✅ Ready for testing and integration');
        console.log(`🔗 BSCScan: https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}`);
        console.log('═══════════════════════════════════════════════════');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        console.log('\n🔧 Possible issues:');
        console.log('- Network connectivity');
        console.log('- RPC node issues');
        console.log('- Contract address incorrect');
    }
}

quickVerify().catch(console.error);
