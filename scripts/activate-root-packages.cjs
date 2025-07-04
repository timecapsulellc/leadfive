#!/usr/bin/env node

/**
 * ACTIVATE ALL PACKAGE LEVELS FOR ROOT USER
 * Executes the activateAllLevelsForRoot function with Trezor wallet
 */

const { ethers } = require('hardhat');
require('dotenv').config();

async function activateRootPackages() {
    console.log('🎯 ACTIVATE ALL PACKAGE LEVELS FOR ROOT USER');
    console.log('============================================');
    console.log();

    const PROXY_ADDRESS = process.env.VITE_CONTRACT_ADDRESS;
    const TREZOR_ADDRESS = process.env.TREZOR_OWNER_ADDRESS;

    console.log(`📋 Contract: ${PROXY_ADDRESS}`);
    console.log(`👤 Trezor: ${TREZOR_ADDRESS}`);
    console.log();

    try {
        // Get signer
        const [signer] = await ethers.getSigners();
        console.log(`📋 Connected account: ${signer.address}`);
        console.log(`📋 Account balance: ${ethers.formatEther(await signer.provider.getBalance(signer.address))} BNB`);
        console.log();

        // Create contract instance
        const contractABI = [
            "function owner() view returns (address)",
            "function getContractVersion() view returns (string)",
            "function activateAllLevelsForRoot() external",
            "function getUserActivatedLevels(address) view returns (uint8[])",
            "function getAllPackagePrices() view returns (uint256[6])",
            "function hasPackageLevel(address, uint8) view returns (bool)",
            "function isRootUserFixed() view returns (bool, string, address, uint32, bool, bool)"
        ];

        const contract = new ethers.Contract(PROXY_ADDRESS, contractABI, signer);

        // Verify we have the right owner and version
        const currentOwner = await contract.owner();
        const version = await contract.getContractVersion();
        
        console.log(`📋 Contract Version: ${version}`);
        console.log(`📋 Current owner: ${currentOwner}`);
        
        if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
            console.log('❌ ERROR: Connected account is not the contract owner');
            console.log(`   Expected: ${currentOwner}`);
            console.log(`   Connected: ${signer.address}`);
            return;
        }

        // Check current status
        console.log();
        console.log('🔍 CURRENT STATUS:');
        const rootStatus = await contract.isRootUserFixed();
        console.log(`   Root Fixed: ${rootStatus[0]}`);
        console.log(`   Status: ${rootStatus[1]}`);
        console.log(`   Root User: ${rootStatus[2]}`);
        console.log(`   Total Users: ${rootStatus[3]}`);

        // Check current package levels
        try {
            const currentLevels = await contract.getUserActivatedLevels(signer.address);
            console.log(`   Current Activated Levels: [${currentLevels.join(', ')}]`);
        } catch (e) {
            console.log(`   Current Levels: Unable to check (${e.message.split('(')[0]})`);
        }

        // Show package prices
        console.log();
        console.log('💰 PACKAGE PRICES:');
        try {
            const prices = await contract.getAllPackagePrices();
            for (let i = 0; i < prices.length; i++) {
                console.log(`   Level ${i + 1}: $${ethers.formatEther(prices[i])} USDT`);
            }
        } catch (e) {
            console.log(`   Error getting prices: ${e.message}`);
        }

        // Execute activation
        console.log();
        console.log('🚀 EXECUTING: activateAllLevelsForRoot()');
        
        const gasEstimate = await contract.activateAllLevelsForRoot.estimateGas();
        console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

        const tx = await contract.activateAllLevelsForRoot({
            gasLimit: Math.floor(gasEstimate * 1.2) // 20% buffer
        });

        console.log(`📋 Transaction hash: ${tx.hash}`);
        console.log('⏳ Waiting for confirmation...');

        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed! Gas used: ${receipt.gasUsed.toString()}`);
        console.log();

        // Verify activation
        console.log('🔍 VERIFYING ACTIVATION:');
        try {
            const activatedLevels = await contract.getUserActivatedLevels(signer.address);
            console.log(`✅ Activated Levels: [${activatedLevels.join(', ')}]`);
            
            // Check each level individually
            for (let level = 1; level <= 6; level++) {
                const hasLevel = await contract.hasPackageLevel(signer.address, level);
                console.log(`   Level ${level}: ${hasLevel ? '✅ ACTIVE' : '❌ INACTIVE'}`);
            }
        } catch (e) {
            console.log(`   Error verifying: ${e.message}`);
        }

        // Final status check
        console.log();
        console.log('🎉 FINAL STATUS:');
        const finalStatus = await contract.isRootUserFixed();
        console.log(`✅ Root Fixed: ${finalStatus[0]}`);
        console.log(`✅ Status: ${finalStatus[1]}`);
        console.log(`✅ All 6 package levels activated for root user!`);
        console.log(`✅ No USDT payment required (special root privilege)`);
        console.log();
        
        console.log('🚀 SUCCESS! Root user now has access to all package levels!');

    } catch (error) {
        console.error('❌ Activation failed:', error);
        if (error.transaction) {
            console.error('Transaction hash:', error.transaction.hash);
        }
    }
}

activateRootPackages().catch(console.error);
