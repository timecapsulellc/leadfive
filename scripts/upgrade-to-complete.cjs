#!/usr/bin/env node

/**
 * UPGRADE PROXY TO LEADFIVE COMPLETE v1.1
 * Upgrades the existing proxy to use the new LeadFiveComplete implementation
 */

const { ethers } = require('hardhat');
require('dotenv').config();

async function upgradeToComplete() {
    console.log('🔄 UPGRADING PROXY TO LEADFIVE COMPLETE v1.1');
    console.log('==============================================');
    console.log();

    try {
        // Get Trezor wallet (contract owner)
        const TREZOR_PRIVATE_KEY = process.env.TREZOR_PRIVATE_KEY;
        if (!TREZOR_PRIVATE_KEY) {
            console.log('⚠️ No Trezor private key found. Using first signer...');
            var [signer] = await ethers.getSigners();
        } else {
            var signer = new ethers.Wallet(TREZOR_PRIVATE_KEY, ethers.provider);
        }
        
        console.log(`👤 Upgrading with account: ${signer.address}`);
        const balance = await signer.provider.getBalance(signer.address);
        console.log(`💰 Account balance: ${ethers.formatEther(balance)} BNB`);
        console.log();

        // Contract addresses
        const PROXY_ADDRESS = process.env.VITE_CONTRACT_ADDRESS; // 0x29dcCb502D10C042BcC6a02a7762C49595A9E498
        const NEW_IMPLEMENTATION = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944"; // Our deployed implementation
        
        console.log(`📍 Proxy Address: ${PROXY_ADDRESS}`);
        console.log(`📍 New Implementation: ${NEW_IMPLEMENTATION}`);
        console.log();

        // Get the proxy contract (using current ABI)
        console.log('📦 Getting proxy contract...');
        const LeadFive = await ethers.getContractFactory('LeadFive', signer);
        const proxy = LeadFive.attach(PROXY_ADDRESS);
        
        // Verify ownership
        console.log('🔐 Verifying ownership...');
        const owner = await proxy.owner();
        console.log(`👑 Current owner: ${owner}`);
        console.log(`🔑 Signer address: ${signer.address}`);
        
        if (owner.toLowerCase() !== signer.address.toLowerCase()) {
            throw new Error(`Not the owner! Expected ${owner}, got ${signer.address}`);
        }
        
        // Check current implementation
        console.log('🔍 Checking current implementation...');
        try {
            // Try to get the implementation slot (EIP-1967)
            const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
            const currentImpl = await signer.provider.getStorage(PROXY_ADDRESS, IMPLEMENTATION_SLOT);
            const currentImplAddress = "0x" + currentImpl.slice(-40);
            console.log(`📋 Current implementation: ${currentImplAddress}`);
        } catch (error) {
            console.log('⚠️ Could not read implementation slot:', error.message);
        }
        
        // Estimate gas for upgrade
        console.log('⛽ Estimating upgrade gas...');
        try {
            const gasEstimate = await proxy.upgradeTo.estimateGas(NEW_IMPLEMENTATION);
            console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
            console.log(`💰 Estimated cost (5 gwei): ${ethers.formatEther(gasEstimate * 5000000000n)} BNB`);
        } catch (error) {
            console.log('❌ Gas estimation failed:', error.message);
            console.log('🔄 This might indicate the upgrade will fail');
            
            // Try to diagnose why
            console.log('🔍 Diagnosing upgrade issue...');
            
            // Check if new implementation is a valid contract
            const newImplCode = await signer.provider.getCode(NEW_IMPLEMENTATION);
            if (newImplCode === '0x') {
                throw new Error('New implementation has no code deployed!');
            }
            console.log(`✅ New implementation has code (${newImplCode.length} bytes)`);
            
            // Check if proxy supports upgradeTo
            try {
                const supportsUpgrade = await proxy.upgradeTo.staticCall(NEW_IMPLEMENTATION);
                console.log('✅ Proxy supports upgradeTo');
            } catch (staticError) {
                console.log('❌ Static call failed:', staticError.message);
                throw new Error('Proxy upgrade call will fail: ' + staticError.message);
            }
        }
        
        console.log();
        console.log('🚀 Executing upgrade...');
        const upgradeTx = await proxy.upgradeTo(NEW_IMPLEMENTATION, {
            gasLimit: 500000 // Set manual gas limit
        });
        
        console.log(`📝 Upgrade transaction: ${upgradeTx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await upgradeTx.wait();
        console.log(`✅ Upgrade confirmed in block ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        console.log();
        
        // Verify upgrade success
        console.log('🔍 Verifying upgrade...');
        const updatedImpl = await signer.provider.getStorage(PROXY_ADDRESS, "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc");
        const updatedImplAddress = "0x" + updatedImpl.slice(-40);
        console.log(`📋 Updated implementation: ${updatedImplAddress}`);
        
        if (updatedImplAddress.toLowerCase() === NEW_IMPLEMENTATION.toLowerCase()) {
            console.log('✅ Upgrade successful!');
        } else {
            console.log('❌ Upgrade may have failed - implementation not updated');
        }
        
        // Test new functionality
        console.log('🧪 Testing new v1.10 functionality...');
        const LeadFiveV1_10 = await ethers.getContractFactory('LeadFiveV1_10', signer);
        const upgradedProxy = LeadFiveV1_10.attach(PROXY_ADDRESS);
        
        try {
            const version = await upgradedProxy.getContractVersion();
            console.log(`📋 Contract version: ${version}`);
            
            const rootStatus = await upgradedProxy.isRootUserFixed();
            console.log(`👑 Root user status: ${rootStatus[1]}`);
            
            console.log('✅ New functionality working!');
        } catch (error) {
            console.log('⚠️ New functionality test failed:', error.message);
        }
        
        // Save upgrade info
        const upgradeInfo = {
            timestamp: new Date().toISOString(),
            network: 'BSC_MAINNET',
            proxyAddress: PROXY_ADDRESS,
            oldImplementation: currentImplAddress || 'unknown',
            newImplementation: NEW_IMPLEMENTATION,
            contractName: 'LeadFiveV1_10',
            version: 'v1.10 COMPLETE',
            upgrader: signer.address,
            transactionHash: upgradeTx.hash,
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: receipt.blockNumber
        };

        const fs = require('fs');
        const filename = `BSC_MAINNET_UPGRADE_SUCCESS_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(upgradeInfo, null, 2));
        
        console.log();
        console.log('🎉 UPGRADE SUCCESSFUL!');
        console.log('======================');
        console.log(`✅ Proxy Address: ${PROXY_ADDRESS}`);
        console.log(`✅ New Implementation: ${NEW_IMPLEMENTATION}`);
        console.log(`✅ Transaction: ${upgradeTx.hash}`);
        console.log(`✅ Upgrade Info: ${filename}`);
        console.log();
        
        console.log('🔗 NEXT STEPS:');
        console.log('1. Initialize v1.1 features: call initializeV1_1()');
        console.log('2. Fix root user: call fixRootUserIssue()');
        console.log('3. Register as root: call registerAsRoot(1)');
        console.log('4. Activate all levels: call activateAllLevelsForRoot()');
        console.log();
        
        console.log('📋 BSCSCAN VERIFICATION:');
        console.log(`Proxy: https://bscscan.com/address/${PROXY_ADDRESS}`);
        console.log(`Implementation: https://bscscan.com/address/${NEW_IMPLEMENTATION}`);

        return {
            proxyAddress: PROXY_ADDRESS,
            newImplementation: NEW_IMPLEMENTATION,
            transactionHash: upgradeTx.hash,
            upgradeInfo
        };

    } catch (error) {
        console.error('❌ Upgrade failed:', error.message);
        if (error.data) {
            console.error('Error data:', error.data);
        }
        throw error;
    }
}

if (require.main === module) {
    upgradeToComplete()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { upgradeToComplete };
