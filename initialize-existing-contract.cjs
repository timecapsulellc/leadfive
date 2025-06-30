#!/usr/bin/env node

/**
 * =====================================================
 * 🔧 INITIALIZE EXISTING CONTRACT - BSC TESTNET
 * =====================================================
 * 
 * This script attempts to initialize an existing deployed contract
 * that may not have been properly initialized during deployment.
 */

require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔧 Attempting to initialize existing contract...\n');

    // Contract address from previous deployment
    const contractAddress = '0x74bDd79552f00125ECD72F3a08aCB8EAf5e48Ce4';
    
    // Configuration
    const config = {
        usdtAddress: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', // BSC Testnet USDT
        priceFeedAddress: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526', // BSC Testnet BNB/USD
    };

    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`👤 Deployer: ${deployerAddress}`);

    try {
        // Connect to the existing contract
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const leadFive = LeadFive.attach(contractAddress);

        console.log(`📍 Connected to contract: ${contractAddress}`);

        // Check if already initialized
        try {
            const owner = await leadFive.owner();
            console.log(`   Current owner: ${owner}`);
            
            if (owner !== '0x0000000000000000000000000000000000000000') {
                console.log('✅ Contract appears to already be initialized!');
                
                // Test some functions
                const totalUsers = await leadFive.getTotalUsers();
                console.log(`   Total users: ${totalUsers}`);
                
                return {
                    success: true,
                    message: 'Contract already initialized'
                };
            }
        } catch (error) {
            console.log('🔄 Contract not initialized yet, attempting to initialize...');
        }

        // Attempt to initialize
        console.log('⏳ Calling initialize function...');
        const initTx = await leadFive.initialize(
            config.usdtAddress,
            config.priceFeedAddress,
            {
                gasLimit: 5000000 // 5M gas limit
            }
        );

        console.log(`   Transaction hash: ${initTx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await initTx.wait();
        console.log(`✅ Initialization successful! Gas used: ${receipt.gasUsed}`);

        // Verify initialization
        const owner = await leadFive.owner();
        const totalUsers = await leadFive.getTotalUsers();
        const usdt = await leadFive.usdt();

        console.log('\n📊 Verification:');
        console.log(`   Owner: ${owner}`);
        console.log(`   Total Users: ${totalUsers}`);
        console.log(`   USDT Contract: ${usdt}`);

        return {
            success: true,
            message: 'Contract initialized successfully'
        };

    } catch (error) {
        console.error('\n❌ Initialization failed:', error.message);
        
        if (error.message.includes('already initialized')) {
            console.log('\n💡 Contract is already initialized. This is expected.');
            return {
                success: true,
                message: 'Contract already initialized'
            };
        }
        
        if (error.message.includes('revert')) {
            console.log('\n💡 Contract may need to be redeployed with proper initialization.');
            return {
                success: false,
                message: 'Initialization failed - redeploy needed'
            };
        }
        
        throw error;
    }
}

// Execute initialization
main()
    .then((result) => {
        console.log(`\n🎉 Result: ${result.message}`);
        if (result.success) {
            console.log('✅ Contract is ready for testing!');
        } else {
            console.log('❌ Manual redeployment may be required.');
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error.message);
        process.exit(1);
    });
