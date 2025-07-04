#!/usr/bin/env node

/**
 * PREPARE LEADFIVE v1.1 DEPLOYMENT
 * Compiles the contract and generates deployment information for web interface
 */

const { ethers } = require('hardhat');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
require('dotenv').config();

async function prepareV1_1Deployment() {
    console.log('🛠️ PREPARING LEADFIVE v1.1 DEPLOYMENT');
    console.log('=====================================');
    console.log();

    try {
        // Compile contracts
        console.log('📦 Compiling contracts...');
        await execAsync('npx hardhat compile');
        console.log('✅ Contracts compiled successfully');
        console.log();

        // Get contract factory
        const LeadFivev1_1 = await ethers.getContractFactory('LeadFivev1_1');
        
        // Get bytecode and ABI
        const bytecode = LeadFivev1_1.bytecode;
        const abi = LeadFivev1_1.interface.formatJson();
        
        console.log('📋 CONTRACT INFORMATION:');
        console.log(`   Bytecode size: ${(bytecode.length / 2).toLocaleString()} bytes`);
        console.log(`   ABI functions: ${JSON.parse(abi).length}`);
        console.log();

        // Estimate deployment gas
        const gasEstimate = await ethers.provider.estimateGas({
            data: bytecode
        });
        console.log(`⛽ Estimated deployment gas: ${gasEstimate.toString()}`);
        console.log();

        // Generate deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            contractName: 'LeadFivev1_1',
            version: 'v1.1.0',
            network: 'BSC_MAINNET',
            proxyAddress: process.env.VITE_CONTRACT_ADDRESS,
            bytecode: bytecode,
            abi: JSON.parse(abi),
            estimatedGas: gasEstimate.toString(),
            features: [
                'Root package activation',
                'All 6 package levels (1-6)',
                'Package prices: $30, $60, $120, $240, $480, $960',
                'Admin privilege for root user',
                'No USDT payment for root packages'
            ],
            webInterface: {
                url: 'http://localhost:8080/trezor-v1.1-deployment-interface.html',
                requiredWallet: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29',
                network: 'BSC Mainnet (Chain ID: 56)'
            }
        };

        // Save deployment preparation
        const fs = require('fs');
        const filename = `BSC_MAINNET_V1.1_DEPLOYMENT_PREP_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        
        console.log('🎯 DEPLOYMENT PREPARATION COMPLETE!');
        console.log('===================================');
        console.log(`✅ Deployment info saved: ${filename}`);
        console.log(`✅ Web interface: http://localhost:8080/trezor-v1.1-deployment-interface.html`);
        console.log();
        
        console.log('🚀 NEXT STEPS:');
        console.log('1. Open the web interface in your browser');
        console.log('2. Connect your Trezor wallet via MetaMask');
        console.log('3. Follow the step-by-step deployment process');
        console.log('4. All transactions will be signed with your Trezor hardware wallet');
        console.log();
        
        console.log('📋 MANUAL DEPLOYMENT OPTION:');
        console.log('If web interface has issues, you can deploy manually:');
        console.log(`1. Go to: https://bscscan.com/`);
        console.log(`2. Deploy new contract with bytecode from: ${filename}`);
        console.log(`3. Call upgradeTo() on proxy: ${process.env.VITE_CONTRACT_ADDRESS}`);
        console.log(`4. Call initializeV1_1() on proxy`);
        console.log(`5. Call activateAllLevelsForRoot() on proxy`);

        return deploymentInfo;

    } catch (error) {
        console.error('❌ Preparation failed:', error.message);
        throw error;
    }
}

if (require.main === module) {
    prepareV1_1Deployment()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { prepareV1_1Deployment };
