#!/usr/bin/env node

/**
 * DEPLOY LEADFIVE v1.1 - ROOT PACKAGE ACTIVATION
 * Upgrades the proxy to v1.1 with package activation capabilities
 */

const { ethers, upgrades } = require('hardhat');
require('dotenv').config();

async function deployV1_1() {
    console.log('🚀 LEADFIVE v1.1 DEPLOYMENT - ROOT PACKAGE ACTIVATION');
    console.log('==================================================');
    console.log();

    const PROXY_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;
    console.log(`📋 Proxy Address: ${PROXY_ADDRESS}`);
    console.log();

    try {
        // Get Trezor wallet (contract owner)
        const TREZOR_PRIVATE_KEY = process.env.TREZOR_PRIVATE_KEY;
        if (!TREZOR_PRIVATE_KEY) {
            throw new Error('TREZOR_PRIVATE_KEY not found in .env file');
        }
        
        const trezorWallet = new ethers.Wallet(TREZOR_PRIVATE_KEY, ethers.provider);
        console.log(`👤 Deploying with Trezor wallet: ${trezorWallet.address}`);
        console.log(`💰 Account balance: ${ethers.formatEther(await trezorWallet.provider.getBalance(trezorWallet.address))} BNB`);
        
        // Verify this is the contract owner
        const EXPECTED_TREZOR = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        if (trezorWallet.address.toLowerCase() !== EXPECTED_TREZOR.toLowerCase()) {
            throw new Error(`Wrong Trezor address! Expected: ${EXPECTED_TREZOR}, Got: ${trezorWallet.address}`);
        }
        console.log('✅ Trezor wallet verified as contract owner');
        console.log();

        // Get the v1.1 contract factory with Trezor signer
        console.log('📦 Getting LeadFivev1_1 contract factory...');
        const LeadFivev1_1 = await ethers.getContractFactory('LeadFivev1_1', trezorWallet);
        
        // Estimate deployment gas
        const deploymentData = LeadFivev1_1.bytecode;
        const gasEstimate = await trezorWallet.provider.estimateGas({
            data: deploymentData
        });
        console.log(`⛽ Estimated deployment gas: ${gasEstimate.toString()}`);
        console.log();

        // Deploy new implementation
        console.log('🔨 Deploying new v1.1 implementation...');
        const newImplementation = await LeadFivev1_1.deploy();
        await newImplementation.waitForDeployment();
        
        const newImplAddress = await newImplementation.getAddress();
        console.log(`✅ New implementation deployed: ${newImplAddress}`);
        console.log();

        // Upgrade the proxy
        console.log('🔄 Upgrading proxy to v1.1...');
        const upgradedContract = await upgrades.upgradeProxy(
            PROXY_ADDRESS,
            LeadFivev1_1,
            {
                call: {
                    fn: 'initializeV1_1',
                    args: []
                }
            }
        );
        
        await upgradedContract.waitForDeployment();
        console.log('✅ Proxy upgraded successfully!');
        console.log();

        // Verify the upgrade
        console.log('🔍 Verifying upgrade...');
        const contract = LeadFivev1_1.attach(PROXY_ADDRESS);
        
        const version = await contract.getContractVersion();
        const owner = await contract.owner();
        const totalUsers = await contract.totalUsers();
        
        console.log(`📋 Contract Version: ${version}`);
        console.log(`👤 Owner: ${owner}`);
        console.log(`👥 Total Users: ${totalUsers}`);
        console.log();

        // Check package prices
        console.log('💰 Package Prices:');
        try {
            const prices = await contract.getAllPackagePrices();
            for (let i = 0; i < prices.length; i++) {
                console.log(`   Level ${i + 1}: ${ethers.formatEther(prices[i])} USDT`);
            }
        } catch (e) {
            console.log(`   Error getting prices: ${e.message}`);
        }
        console.log();

        // Save deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: 'BSC_MAINNET',
            proxyAddress: PROXY_ADDRESS,
            newImplementation: newImplAddress,
            version: 'v1.1.0',
            deployer: trezorWallet.address,
            gasUsed: gasEstimate.toString(),
            features: [
                'Root package activation',
                'All 6 package levels available',
                'No USDT payment for root user',
                'Package price configuration'
            ]
        };

        const fs = require('fs');
        const filename = `BSC_MAINNET_V1.1_UPGRADE_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        
        console.log('🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('========================');
        console.log(`✅ Proxy: ${PROXY_ADDRESS} (unchanged)`);
        console.log(`✅ New Implementation: ${newImplAddress}`);
        console.log(`✅ Version: LeadFive v1.1.0`);
        console.log(`✅ Deployment Info: ${filename}`);
        console.log();
        
        console.log('🔥 NEXT STEPS:');
        console.log('1. Execute: activateAllLevelsForRoot() with Trezor wallet');
        console.log('2. This will give root user access to all 6 package levels');
        console.log('3. No USDT payment required (special root privilege)');
        console.log();

        return {
            proxyAddress: PROXY_ADDRESS,
            newImplementation: newImplAddress,
            version: 'v1.1.0'
        };

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        if (error.transaction) {
            console.error('Transaction hash:', error.transaction.hash);
        }
        throw error;
    }
}

if (require.main === module) {
    deployV1_1()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { deployV1_1 };
