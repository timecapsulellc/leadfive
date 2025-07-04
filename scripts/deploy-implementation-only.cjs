#!/usr/bin/env node

/**
 * DEPLOY LEADFIVE COMPLETE IMPLEMENTATION ONLY
 * Deploys just the implementation contract to get the address
 */

const { ethers } = require('hardhat');
require('dotenv').config();

async function deployImplementationOnly() {
    console.log('🚀 DEPLOYING LEADFIVE COMPLETE IMPLEMENTATION');
    console.log('============================================');
    console.log();

    try {
        // Get Trezor wallet (contract owner)
        const TREZOR_PRIVATE_KEY = process.env.TREZOR_PRIVATE_KEY;
        let signer;
        
        if (!TREZOR_PRIVATE_KEY) {
            console.log('⚠️ No Trezor private key found. Using first signer...');
            [signer] = await ethers.getSigners();
        } else {
            signer = new ethers.Wallet(TREZOR_PRIVATE_KEY, ethers.provider);
        }
        
        if (!signer) {
            throw new Error('No signer available for deployment');
        }
        
        console.log(`👤 Deploying with account: ${signer.address}`);
        const balance = await signer.provider.getBalance(signer.address);
        console.log(`💰 Account balance: ${ethers.formatEther(balance)} BNB`);
        console.log();

        // Get the contract factory
        console.log('📦 Getting LeadFiveV1_10 contract factory...');
        const ContractFactory = await ethers.getContractFactory('LeadFiveV1_10', signer);
        
        // Estimate deployment gas
        const gasEstimate = await signer.provider.estimateGas({
            data: ContractFactory.bytecode
        });
        console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
        console.log(`💰 Estimated cost (5 gwei): ${ethers.formatEther(gasEstimate * 5000000000n)} BNB`);
        console.log();

        // Deploy implementation
        console.log('🔨 Deploying LeadFiveV1_10 implementation...');
        const implementation = await ContractFactory.deploy();
        await implementation.waitForDeployment();
        
        const implementationAddress = await implementation.getAddress();
        console.log(`✅ Implementation deployed: ${implementationAddress}`);
        console.log();

        // Save deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: 'BSC_MAINNET',
            implementationAddress: implementationAddress,
            contractName: 'LeadFiveV1_10',
            version: 'v1.10 COMPLETE',
            deployer: signer.address,
            gasUsed: gasEstimate.toString(),
            proxyAddress: process.env.VITE_CONTRACT_ADDRESS
        };

        const fs = require('fs');
        const filename = `BSC_MAINNET_IMPLEMENTATION_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        
        console.log('🎉 IMPLEMENTATION DEPLOYMENT SUCCESSFUL!');
        console.log('========================================');
        console.log(`✅ Implementation Address: ${implementationAddress}`);
        console.log(`✅ Deployment Info: ${filename}`);
        console.log();
        
        console.log('🔗 NEXT STEPS FOR WEB INTERFACE:');
        console.log('1. Copy this implementation address:');
        console.log(`   ${implementationAddress}`);
        console.log('2. Paste it in the web interface dialog box');
        console.log('3. Continue with the upgrade process');
        console.log();
        
        console.log('📋 BSCSCAN VERIFICATION:');
        console.log(`https://bscscan.com/address/${implementationAddress}`);

        return {
            implementationAddress,
            deploymentInfo
        };

    } catch (error) {
        console.error('❌ Implementation deployment failed:', error.message);
        throw error;
    }
}

if (require.main === module) {
    deployImplementationOnly()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { deployImplementationOnly };
