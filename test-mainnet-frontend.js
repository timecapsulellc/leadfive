#!/usr/bin/env node

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║    🧪 ORPHI CROWDFUND MAINNET FRONTEND CONNECTION TEST                                ║
 * ║                                                                                       ║
 * ║    Tests the frontend environment variables and contract connectivity                 ║
 * ║    for the newly deployed BSC mainnet contract                                       ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

require('dotenv').config();
const { ethers } = require('ethers');

console.log('\n' + '='.repeat(80));
console.log('🧪 ORPHI CROWDFUND MAINNET FRONTEND CONNECTION TEST');
console.log('='.repeat(80));

async function testMainnetFrontendConfig() {
    try {
        console.log('\n📋 FRONTEND ENVIRONMENT VARIABLES:');
        console.log('─'.repeat(50));
        
        // Test React App Variables
        const reactVars = {
            'REACT_APP_NETWORK': process.env.REACT_APP_NETWORK,
            'REACT_APP_CHAIN_ID': process.env.REACT_APP_CHAIN_ID,
            'REACT_APP_CONTRACT_ADDRESS': process.env.REACT_APP_CONTRACT_ADDRESS,
            'REACT_APP_USDT_ADDRESS': process.env.REACT_APP_USDT_ADDRESS,
            'REACT_APP_DEBUG': process.env.REACT_APP_DEBUG,
            'REACT_APP_VERSION': process.env.REACT_APP_VERSION,
            'REACT_APP_ENVIRONMENT': process.env.REACT_APP_ENVIRONMENT
        };
        
        let allConfigured = true;
        
        for (const [key, value] of Object.entries(reactVars)) {
            const status = value ? '✅' : '❌';
            console.log(`${status} ${key}: ${value || 'NOT SET'}`);
            if (!value) allConfigured = false;
        }
        
        if (!allConfigured) {
            throw new Error('❌ Some required frontend environment variables are missing!');
        }
        
        console.log('\n🔍 CONFIGURATION VALIDATION:');
        console.log('─'.repeat(50));
        
        // Validate Network Configuration
        if (process.env.REACT_APP_NETWORK !== 'mainnet') {
            console.log('⚠️  Warning: REACT_APP_NETWORK should be "mainnet"');
        } else {
            console.log('✅ Network: Correctly set to mainnet');
        }
        
        if (process.env.REACT_APP_CHAIN_ID !== '56') {
            console.log('⚠️  Warning: REACT_APP_CHAIN_ID should be "56" for BSC mainnet');
        } else {
            console.log('✅ Chain ID: Correctly set to 56 (BSC Mainnet)');
        }
        
        // Validate Contract Address
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        if (!ethers.isAddress(contractAddress)) {
            throw new Error('❌ Invalid contract address format');
        } else {
            console.log('✅ Contract Address: Valid format');
        }
        
        // Validate USDT Address
        const usdtAddress = process.env.REACT_APP_USDT_ADDRESS;
        if (!ethers.isAddress(usdtAddress)) {
            throw new Error('❌ Invalid USDT address format');
        } else {
            console.log('✅ USDT Address: Valid format');
        }
        
        // Check if it's the correct BSC mainnet USDT
        if (usdtAddress.toLowerCase() !== '0x55d398326f99059fF775485246999027B3197955'.toLowerCase()) {
            console.log('⚠️  Warning: USDT address may not be BSC mainnet USDT');
        } else {
            console.log('✅ USDT Address: Correct BSC mainnet USDT');
        }
        
        console.log('\n🌐 NETWORK CONNECTION TEST:');
        console.log('─'.repeat(50));
        
        // Test BSC Mainnet Connection
        try {
            const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
            const network = await provider.getNetwork();
            
            if (network.chainId === 56) {
                console.log('✅ BSC Mainnet RPC: Connected successfully');
                console.log(`   Chain ID: ${network.chainId}`);
                console.log(`   Network Name: ${network.name}`);
            } else {
                console.log(`⚠️  Warning: Connected to chain ID ${network.chainId}, expected 56`);
            }
            
            // Test Contract Existence
            const code = await provider.getCode(contractAddress);
            if (code && code !== '0x') {
                console.log('✅ Contract: Exists on BSC mainnet');
                console.log(`   Contract Address: ${contractAddress}`);
                console.log(`   Bytecode Length: ${code.length} characters`);
            } else {
                console.log('❌ Contract: Not found at specified address');
            }
            
        } catch (error) {
            console.log(`❌ Network Connection: Failed - ${error.message}`);
        }
        
        console.log('\n📊 DEPLOYMENT INFORMATION:');
        console.log('─'.repeat(50));
        console.log(`🚀 Contract Address: ${contractAddress}`);
        console.log(`💰 USDT Token: ${usdtAddress}`);
        console.log(`🌐 Network: BSC Mainnet (Chain ID: 56)`);
        console.log(`🔗 BSCScan: https://bscscan.com/address/${contractAddress}`);
        console.log(`📱 Frontend Environment: ${process.env.REACT_APP_ENVIRONMENT || 'production'}`);
        console.log(`🔧 Debug Mode: ${process.env.REACT_APP_DEBUG || 'false'}`);
        
        console.log('\n📋 NEXT STEPS FOR FRONTEND:');
        console.log('─'.repeat(50));
        console.log('1. ✅ Environment variables configured correctly');
        console.log('2. 🔄 Restart your React development server');
        console.log('3. 🧪 Test wallet connection with MetaMask');
        console.log('4. 💰 Test USDT approval and package purchase');
        console.log('5. 📊 Verify commission calculations');
        console.log('6. 🔍 Monitor transactions on BSCScan');
        
        console.log('\n🎉 FRONTEND CONFIGURATION COMPLETE!');
        console.log('Your frontend is now configured for BSC mainnet deployment.');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ CONFIGURATION TEST FAILED:');
        console.error(`Error: ${error.message}`);
        
        console.log('\n💡 TROUBLESHOOTING STEPS:');
        console.log('1. Check your .env file has all required REACT_APP_ variables');
        console.log('2. Ensure contract address is correct: 0x8F826B18096Dcf7AF4515B06Cb563475d189ab50');
        console.log('3. Verify USDT address: 0x55d398326f99059fF775485246999027B3197955');
        console.log('4. Confirm network is set to "mainnet" and chain ID is "56"');
        console.log('5. Restart your development server after changes');
        
        return false;
    }
}

// Run the test
if (require.main === module) {
    testMainnetFrontendConfig()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = testMainnetFrontendConfig;
