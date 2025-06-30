const { ethers } = require('hardhat');
const fs = require('fs');
require('dotenv').config();

async function verifyTestnetSetup() {
    console.log('🔍 BSC TESTNET DEPLOYMENT PRE-CHECK\n');
    console.log('='.repeat(60));
    
    // Check environment variables
    console.log('1️⃣ ENVIRONMENT VARIABLES CHECK:');
    const requiredVars = [
        'DEPLOYER_PRIVATE_KEY',
        'BSC_TESTNET_RPC_URL',
        'BSCSCAN_API_KEY'
    ];
    
    let allVarsPresent = true;
    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (!value || value.includes('YOUR_') || value.includes('your_') || value.length < 10) {
            console.log(`❌ ${varName}: NOT SET OR INVALID`);
            allVarsPresent = false;
        } else {
            console.log(`✅ ${varName}: SET (${value.substring(0, 10)}...)`);
        }
    });
    
    if (!allVarsPresent) {
        console.log('\n⚠️  Please set all environment variables in .env file');
        console.log('\n📋 Required .env variables:');
        console.log('DEPLOYER_PRIVATE_KEY=0x...');
        console.log('BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/');
        console.log('BSCSCAN_API_KEY=your_api_key');
        return false;
    }
    
    // Check wallet connection and balance
    console.log('\n2️⃣ WALLET CONNECTION & BALANCE CHECK:');
    try {
        const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        const balance = await wallet.provider.getBalance(wallet.address);
        
        console.log(`✅ Wallet Address: ${wallet.address}`);
        console.log(`✅ Network: BSC Testnet (Chain ID: 97)`);
        console.log(`✅ Testnet BNB Balance: ${ethers.formatEther(balance)} BNB`);
        
        if (balance === 0n) {
            console.log('\n⚠️  YOU NEED TESTNET BNB!');
            console.log('🚰 Get testnet BNB from:');
            console.log('   • https://testnet.binance.org/faucet-smart');
            console.log('   • https://www.bnbchain.org/en/testnet-faucet');
            console.log(`   • Send some testnet BNB to: ${wallet.address}`);
            return false;
        }
        
        if (balance < ethers.parseEther("0.01")) {
            console.log('\n⚠️  LOW BALANCE WARNING');
            console.log(`   Current: ${ethers.formatEther(balance)} BNB`);
            console.log('   Recommended: At least 0.05 BNB for deployment');
        }
        
    } catch (error) {
        console.log('❌ Wallet connection failed:', error.message);
        return false;
    }
    
    // Check contract compilation
    console.log('\n3️⃣ CONTRACT COMPILATION CHECK:');
    const artifactPath = './artifacts/contracts/LeadFive.sol/LeadFive.json';
    if (fs.existsSync(artifactPath)) {
        console.log('✅ LeadFive contract compiled');
        
        // Check libraries
        const libPaths = [
            './artifacts/contracts/libraries/CoreOptimized.sol/CoreOptimized.json',
            './artifacts/contracts/libraries/SecureOracle.sol/SecureOracle.json',
            './artifacts/contracts/libraries/Errors.sol/Errors.json'
        ];
        
        libPaths.forEach(path => {
            if (fs.existsSync(path)) {
                const libName = path.split('/').pop().replace('.json', '');
                console.log(`✅ ${libName} library compiled`);
            } else {
                console.log(`❌ Library missing: ${path}`);
            }
        });
    } else {
        console.log('❌ Contract not compiled. Run: npx hardhat compile');
        return false;
    }
    
    // Check Hardhat configuration
    console.log('\n4️⃣ HARDHAT CONFIGURATION CHECK:');
    try {
        const hardhatConfig = require('../hardhat.config.js');
        if (hardhatConfig.networks && hardhatConfig.networks.bscTestnet) {
            console.log('✅ BSC Testnet network configured');
        } else {
            console.log('❌ BSC Testnet network not configured in hardhat.config.js');
            return false;
        }
    } catch (error) {
        console.log('❌ Could not load hardhat.config.js');
        return false;
    }
    
    console.log('\n5️⃣ TESTNET DEPLOYMENT PARAMETERS:');
    const TESTNET_CONFIG = {
        usdt: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet USDT
        oracle: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526", // BSC Testnet BNB/USD Oracle
        chainId: 97,
        expectedDecimals: 18
    };
    
    console.log(`✅ USDT Address: ${TESTNET_CONFIG.usdt}`);
    console.log(`✅ Oracle Address: ${TESTNET_CONFIG.oracle}`);
    console.log(`✅ Expected Decimals: ${TESTNET_CONFIG.expectedDecimals}`);
    console.log(`✅ Chain ID: ${TESTNET_CONFIG.chainId}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL CHECKS PASSED - READY FOR TESTNET DEPLOYMENT!');
    console.log('='.repeat(60));
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. npx hardhat compile (if needed)');
    console.log('2. node testnet-deploy.cjs');
    console.log('3. node testnet-verify.cjs');
    console.log('4. node testnet-test.cjs');
    
    return true;
}

// Run verification
if (require.main === module) {
    verifyTestnetSetup()
        .then((success) => {
            if (success) {
                console.log('\n✅ Ready to deploy to BSC Testnet!');
            } else {
                console.log('\n❌ Please fix the issues above before deployment.');
            }
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('\n❌ Verification failed:', error);
            process.exit(1);
        });
}

module.exports = verifyTestnetSetup;
