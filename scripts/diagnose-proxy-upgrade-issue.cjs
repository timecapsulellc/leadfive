#!/usr/bin/env node

/**
 * DIAGNOSE PROXY UPGRADE ISSUE
 * Check why the proxy upgrade is failing with gas estimation error
 */

const { ethers } = require('hardhat');
require('dotenv').config();

async function diagnoseProxyUpgradeIssue() {
    console.log('🔍 DIAGNOSING PROXY UPGRADE ISSUE');
    console.log('==================================');
    console.log();

    try {
        const [signer] = await ethers.getSigners();
        const proxyAddress = process.env.VITE_CONTRACT_ADDRESS;
        const implementationAddress = '0x0A0d0e8546D2B0207D9Ea25CCBA4Be00eD2fa350';
        const trezorAddress = process.env.TREZOR_ADDRESS;
        
        console.log(`📍 Proxy Address: ${proxyAddress}`);
        console.log(`📍 Implementation Address: ${implementationAddress}`);
        console.log(`📍 Trezor Address: ${trezorAddress}`);
        console.log(`📍 Current Signer: ${signer.address}`);
        console.log();

        // Check proxy admin
        console.log('1️⃣ CHECKING PROXY ADMIN...');
        try {
            // Try to get proxy admin using the standard slot
            const adminSlot = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
            const adminData = await signer.provider.getStorage(proxyAddress, adminSlot);
            const proxyAdmin = ethers.getAddress('0x' + adminData.slice(-40));
            console.log(`   Proxy Admin: ${proxyAdmin}`);
            
            // Check if Trezor is the admin
            if (proxyAdmin.toLowerCase() === trezorAddress.toLowerCase()) {
                console.log('   ✅ Trezor is the proxy admin');
            } else {
                console.log('   ⚠️ Trezor is NOT the proxy admin');
            }
        } catch (error) {
            console.log('   ❌ Could not retrieve proxy admin:', error.message);
        }
        console.log();

        // Check current implementation
        console.log('2️⃣ CHECKING CURRENT IMPLEMENTATION...');
        try {
            const implSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
            const implData = await signer.provider.getStorage(proxyAddress, implSlot);
            const currentImpl = ethers.getAddress('0x' + implData.slice(-40));
            console.log(`   Current Implementation: ${currentImpl}`);
            
            if (currentImpl.toLowerCase() === implementationAddress.toLowerCase()) {
                console.log('   ⚠️ Implementation is already set to the target address!');
            } else {
                console.log('   ✅ Implementation needs to be upgraded');
            }
        } catch (error) {
            console.log('   ❌ Could not retrieve current implementation:', error.message);
        }
        console.log();

        // Check if new implementation is a valid contract
        console.log('3️⃣ CHECKING NEW IMPLEMENTATION CONTRACT...');
        try {
            const code = await signer.provider.getCode(implementationAddress);
            if (code === '0x') {
                console.log('   ❌ Implementation address has no code!');
            } else {
                console.log('   ✅ Implementation contract exists');
                console.log(`   Contract size: ${(code.length - 2) / 2} bytes`);
            }
        } catch (error) {
            console.log('   ❌ Error checking implementation:', error.message);
        }
        console.log();

        // Try to interact with the proxy directly
        console.log('4️⃣ TESTING PROXY INTERACTION...');
        try {
            // Get the LeadFive contract interface
            const LeadFive = await ethers.getContractFactory('LeadFive');
            const proxyContract = LeadFive.attach(proxyAddress);
            
            // Try a simple read operation
            const owner = await proxyContract.owner();
            console.log(`   Contract owner: ${owner}`);
            
            if (owner.toLowerCase() === trezorAddress.toLowerCase()) {
                console.log('   ✅ Trezor is the contract owner');
            } else {
                console.log('   ⚠️ Trezor is NOT the contract owner');
            }
        } catch (error) {
            console.log('   ❌ Error interacting with proxy:', error.message);
        }
        console.log();

        // Check upgrade function signature
        console.log('5️⃣ CHECKING UPGRADE FUNCTION...');
        try {
            const upgradeSelector = '0x3659cfe6'; // upgradeTo(address)
            console.log(`   Upgrade function selector: ${upgradeSelector}`);
            
            // Check if the proxy supports this function
            const proxyCode = await signer.provider.getCode(proxyAddress);
            if (proxyCode.includes(upgradeSelector.slice(2))) {
                console.log('   ✅ Proxy supports upgradeTo function');
            } else {
                console.log('   ⚠️ Proxy may not support upgradeTo function');
            }
        } catch (error) {
            console.log('   ❌ Error checking upgrade function:', error.message);
        }
        console.log();

        // Check if this is a TransparentUpgradeableProxy
        console.log('6️⃣ CHECKING PROXY TYPE...');
        try {
            // Try to call the admin() function (only works for TransparentUpgradeableProxy)
            const adminInterface = new ethers.Interface([
                'function admin() external view returns (address)'
            ]);
            
            const adminCall = adminInterface.encodeFunctionData('admin');
            const result = await signer.provider.call({
                to: proxyAddress,
                data: adminCall
            });
            
            if (result && result !== '0x') {
                const admin = ethers.getAddress('0x' + result.slice(-40));
                console.log(`   TransparentUpgradeableProxy Admin: ${admin}`);
                console.log('   ✅ This is a TransparentUpgradeableProxy');
            }
        } catch (error) {
            console.log('   ⚠️ Not a TransparentUpgradeableProxy or admin() call failed');
            console.log('   This might be a different proxy type');
        }
        console.log();

        // Provide recommendations
        console.log('🎯 RECOMMENDATIONS:');
        console.log('==================');
        console.log('Based on the diagnosis above:');
        console.log();
        console.log('If Trezor is NOT the proxy admin:');
        console.log('  - The upgrade must be called by the current proxy admin');
        console.log('  - You may need to transfer admin rights first');
        console.log();
        console.log('If this is a TransparentUpgradeableProxy:');
        console.log('  - Use the ProxyAdmin contract to upgrade');
        console.log('  - Or call upgrade() from the admin address');
        console.log();
        console.log('If implementation is already set:');
        console.log('  - The upgrade may have already succeeded');
        console.log('  - Check if initialization is needed instead');

    } catch (error) {
        console.error('❌ Diagnosis failed:', error.message);
        throw error;
    }
}

if (require.main === module) {
    diagnoseProxyUpgradeIssue()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { diagnoseProxyUpgradeIssue };
