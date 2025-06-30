#!/usr/bin/env node

/**
 * =====================================================
 * 🔧 INITIALIZE WITH SINGLE PARAMETER - BSC TESTNET
 * =====================================================
 * 
 * This script initializes the deployed contract with the correct
 * single parameter that it expects.
 */

require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔧 Initializing contract with single parameter...\n');

    // Contract address from previous deployment
    const contractAddress = '0x74bDd79552f00125ECD72F3a08aCB8EAf5e48Ce4';
    
    // Configuration
    const config = {
        usdtAddress: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', // BSC Testnet USDT
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

        // Attempt to initialize with single parameter
        console.log('⏳ Calling initialize with USDT address...');
        const initTx = await leadFive.initialize(
            config.usdtAddress,
            {
                gasLimit: 5000000 // 5M gas limit
            }
        );

        console.log(`   Transaction hash: ${initTx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await initTx.wait();
        console.log(`✅ Initialization successful! Gas used: ${receipt.gasUsed}`);

        // Verify initialization
        console.log('\n📊 Testing contract functions...');
        
        try {
            const owner = await leadFive.owner();
            console.log(`   ✅ Owner: ${owner}`);
        } catch (e) {
            console.log(`   ❌ Owner: ${e.message}`);
        }

        try {
            const totalUsers = await leadFive.getTotalUsers();
            console.log(`   ✅ Total Users: ${totalUsers}`);
        } catch (e) {
            console.log(`   ❌ Total Users: ${e.message}`);
        }

        try {
            const usdt = await leadFive.usdt();
            console.log(`   ✅ USDT Contract: ${usdt}`);
        } catch (e) {
            console.log(`   ❌ USDT Contract: ${e.message}`);
        }

        try {
            const paused = await leadFive.paused();
            console.log(`   ✅ Paused: ${paused}`);
        } catch (e) {
            console.log(`   ❌ Paused: ${e.message}`);
        }

        try {
            const isAdmin = await leadFive.isAdminAddress(deployerAddress);
            console.log(`   ✅ Is Admin: ${isAdmin}`);
        } catch (e) {
            console.log(`   ❌ Is Admin: ${e.message}`);
        }

        return {
            success: true,
            message: 'Contract initialized successfully'
        };

    } catch (error) {
        console.error('\n❌ Initialization failed:', error.message);
        
        if (error.message.includes('already initialized')) {
            console.log('\n💡 Contract is already initialized. This is expected.');
            
            // Try to test functions anyway
            console.log('\n📊 Testing functions on already initialized contract...');
            const LeadFive = await ethers.getContractFactory('LeadFive');
            const leadFive = LeadFive.attach(contractAddress);
            
            try {
                const owner = await leadFive.owner();
                console.log(`   ✅ Owner: ${owner}`);
            } catch (e) {
                console.log(`   ❌ Owner still returns empty: ${e.message}`);
            }
            
            return {
                success: true,
                message: 'Contract already initialized'
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
            console.log('✅ Contract should now be ready for testing!');
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error.message);
        console.log('\n💡 If this fails, we may need to deploy a fresh contract.');
        process.exit(1);
    });
