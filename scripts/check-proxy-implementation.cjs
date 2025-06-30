#!/usr/bin/env node

/**
 * =====================================================
 * 🔍 PROXY IMPLEMENTATION CHECKER - BSC TESTNET
 * =====================================================
 * 
 * This script checks the proxy implementation address and tests
 * calling the implementation directly.
 */

require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    console.log('\n🔍 Checking Proxy Implementation...\n');

    const proxyAddress = '0x74bDd79552f00125ECD72F3a08aCB8EAf5e48Ce4';
    const implementationAddress = '0x8f03305f8BAcC25bA4B9FF2c0010b0646a09Fd79';
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`👤 Deployer: ${deployerAddress}`);

    console.log(`📍 Proxy Address: ${proxyAddress}`);
    console.log(`🔧 Implementation: ${implementationAddress}`);

    try {
        // Check implementation storage slot (EIP-1967)
        const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
        
        console.log('\n🔍 Checking EIP-1967 Implementation Slot...');
        const storedImpl = await ethers.provider.send("eth_getStorageAt", [proxyAddress, IMPLEMENTATION_SLOT, "latest"]);
        const cleanImpl = '0x' + storedImpl.slice(-40);
        console.log(`   Stored Implementation: ${cleanImpl}`);
        console.log(`   Expected Implementation: ${implementationAddress.toLowerCase()}`);
        
        if (cleanImpl.toLowerCase() === implementationAddress.toLowerCase()) {
            console.log('✅ Proxy is pointing to correct implementation');
        } else {
            console.log('❌ Proxy is NOT pointing to correct implementation!');
        }

        // Test calling implementation directly (this should fail for initializable contracts)
        console.log('\n🧪 Testing Implementation Contract Directly...');
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const implContract = LeadFive.attach(implementationAddress);

        try {
            const owner = await implContract.owner();
            console.log(`   Implementation Owner: ${owner}`);
        } catch (e) {
            console.log(`   ✅ Implementation owner call failed (expected): ${e.message.substring(0, 50)}...`);
        }

        // Check proxy admin slot
        const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
        console.log('\n🔍 Checking Proxy Admin...');
        const storedAdmin = await ethers.provider.send("eth_getStorageAt", [proxyAddress, ADMIN_SLOT, "latest"]);
        const cleanAdmin = '0x' + storedAdmin.slice(-40);
        console.log(`   Proxy Admin: ${cleanAdmin}`);

        // Try to call initialize on implementation directly (should fail)
        console.log('\n🧪 Testing Initialize on Implementation (should fail)...');
        try {
            const initTx = await implContract.initialize('0x337610d27c682E347C9cD60BD4b3b107C9d34dDd');
            console.log(`   ❌ Initialize succeeded (unexpected): ${initTx.hash}`);
        } catch (e) {
            console.log(`   ✅ Initialize failed on implementation (expected): ${e.message.substring(0, 50)}...`);
        }

        // Check if proxy has any code
        console.log('\n🔍 Checking Proxy Code...');
        const proxyCode = await ethers.provider.getCode(proxyAddress);
        console.log(`   Proxy code length: ${proxyCode.length} chars`);
        console.log(`   Proxy code preview: ${proxyCode.substring(0, 100)}...`);

        // Check if implementation has code
        console.log('\n🔍 Checking Implementation Code...');
        const implCode = await ethers.provider.getCode(implementationAddress);
        console.log(`   Implementation code length: ${implCode.length} chars`);
        console.log(`   Implementation code preview: ${implCode.substring(0, 100)}...`);

        // Try low-level call to proxy
        console.log('\n🔍 Testing Low-Level Call to Proxy...');
        const ownerSelector = '0x8da5cb5b'; // owner() function selector
        
        try {
            const result = await ethers.provider.call({
                to: proxyAddress,
                data: ownerSelector
            });
            console.log(`   Raw result: ${result}`);
            
            if (result === '0x') {
                console.log('   ❌ Proxy returns empty data for owner() call');
            } else {
                const decoded = ethers.AbiCoder.defaultAbiCoder().decode(['address'], result);
                console.log(`   ✅ Owner decoded: ${decoded[0]}`);
            }
        } catch (e) {
            console.log(`   ❌ Low-level call failed: ${e.message}`);
        }

    } catch (error) {
        console.error('\n❌ Check failed:', error.message);
        throw error;
    }
}

// Execute check
main()
    .then(() => {
        console.log('\n✅ Proxy implementation check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Check failed:', error.message);
        process.exit(1);
    });
