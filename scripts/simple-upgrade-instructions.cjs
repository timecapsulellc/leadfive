#!/usr/bin/env node

/**
 * SIMPLE PROXY UPGRADE - TREZOR COMPATIBLE
 * Upgrades the proxy to LeadFiveComplete implementation
 */

const { ethers } = require('hardhat');
require('dotenv').config();

async function simpleUpgrade() {
    console.log('🔄 SIMPLE PROXY UPGRADE TO v1.1');
    console.log('===============================');
    console.log();

    const PROXY_ADDRESS = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const NEW_IMPLEMENTATION = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944";
    const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";

    console.log(`📍 Proxy: ${PROXY_ADDRESS}`);
    console.log(`🆕 New Implementation: ${NEW_IMPLEMENTATION}`);
    console.log(`👑 Required Owner: ${TREZOR_ADDRESS}`);
    console.log();

    console.log('📋 UPGRADE INSTRUCTIONS:');
    console.log('========================');
    console.log();
    console.log('1. 🔗 Connect your Trezor wallet to MetaMask/Web3 wallet');
    console.log('2. 🌐 Make sure you\'re on BSC Mainnet (Chain ID: 56)');
    console.log('3. 📝 Call the upgradeTo function on the proxy contract');
    console.log();
    console.log('📋 Transaction Details:');
    console.log(`   • To Address: ${PROXY_ADDRESS}`);
    console.log(`   • Function: upgradeTo(address)`);
    console.log(`   • Parameter: ${NEW_IMPLEMENTATION}`);
    console.log(`   • Gas Limit: 500,000`);
    console.log();
    console.log('🔧 You can use:');
    console.log('   • The web interface I created');
    console.log('   • BSCScan write contract function');
    console.log('   • MetaMask with contract interaction');
    console.log();

    // Generate the transaction data for manual execution
    const iface = new ethers.Interface(['function upgradeTo(address newImplementation)']);
    const txData = iface.encodeFunctionData('upgradeTo', [NEW_IMPLEMENTATION]);
    
    console.log('📋 RAW TRANSACTION DATA (for advanced users):');
    console.log(`   • Data: ${txData}`);
    console.log();

    console.log('✅ After upgrade, the proxy will:');
    console.log('   • Keep the same address: ' + PROXY_ADDRESS);
    console.log('   • Use new v1.1 Complete logic');
    console.log('   • Preserve all existing data');
    console.log('   • Require initialization of v1.1 features');
    console.log();

    console.log('🔗 Useful Links:');
    console.log(`   • Proxy on BSCScan: https://bscscan.com/address/${PROXY_ADDRESS}`);
    console.log(`   • Implementation: https://bscscan.com/address/${NEW_IMPLEMENTATION}`);
    console.log();

    return {
        proxyAddress: PROXY_ADDRESS,
        newImplementation: NEW_IMPLEMENTATION,
        requiredOwner: TREZOR_ADDRESS,
        txData: txData
    };
}

if (require.main === module) {
    simpleUpgrade()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { simpleUpgrade };
