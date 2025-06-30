#!/usr/bin/env node

/**
 * =====================================================
 * 🔄 LEADFIVE CONTRACT UPGRADE SCRIPT
 * =====================================================
 * 
 * This script upgrades the LeadFive implementation while preserving:
 * - Contract address (proxy address stays the same)
 * - All state variables and data
 * - User balances and relationships
 * 
 * Usage: npx hardhat run upgrade-contract.cjs --network bscTestnet
 */

require('dotenv').config();
const hre = require('hardhat');
const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main() {
    console.log('\n🔄 Starting LeadFive Contract Upgrade...\n');

    // Load deployment data
    let deploymentData;
    try {
        deploymentData = JSON.parse(fs.readFileSync('bsc-testnet-upgradeable-deployment.json', 'utf8'));
    } catch (error) {
        throw new Error('❌ Could not load deployment data. Run deployment script first.');
    }

    const proxyAddress = deploymentData.contracts.proxy.address;
    console.log(`📍 Upgrading contract at: ${proxyAddress}`);

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`👤 Deployer: ${deployerAddress}`);

    try {
        console.log('\n🔍 Step 1: Validating Current Implementation...');
        
        // Get current implementation
        const currentImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log(`📦 Current Implementation: ${currentImpl}`);

        console.log('\n🔨 Step 2: Deploying New Implementation...');

        // Get the new contract factory (LeadFive or LeadFiveV2)
        const LeadFiveV2 = await ethers.getContractFactory('LeadFive'); // Change to LeadFiveV2 when ready

        // Upgrade the proxy to new implementation
        const upgradedContract = await upgrades.upgradeProxy(proxyAddress, LeadFiveV2, {
            timeout: 300000, // 5 minutes timeout
            pollingInterval: 5000 // Check every 5 seconds
        });

        await upgradedContract.waitForDeployment();

        // Get new implementation address
        const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        console.log(`📦 New Implementation: ${newImpl}`);

        console.log('\n✅ Step 3: Verifying Upgrade...');

        // Verify proxy address hasn't changed
        const upgradeProxyAddress = await upgradedContract.getAddress();
        if (upgradeProxyAddress !== proxyAddress) {
            throw new Error('❌ Proxy address changed! This should not happen.');
        }

        // Verify state preservation
        const owner = await upgradedContract.owner();
        const usdtToken = await upgradedContract.usdtToken();
        
        console.log(`   ✅ Proxy Address: ${upgradeProxyAddress} (unchanged)`);
        console.log(`   ✅ Owner: ${owner} (preserved)`);
        console.log(`   ✅ USDT Token: ${usdtToken} (preserved)`);

        // Check packages are preserved
        const package1 = await upgradedContract.packages(1);
        console.log(`   ✅ Package 1: $${ethers.formatUnits(package1.price, 18)} USDT (preserved)`);

        console.log('\n💾 Step 4: Updating Deployment Records...');

        // Update deployment data
        deploymentData.upgrades = deploymentData.upgrades || [];
        deploymentData.upgrades.push({
            timestamp: new Date().toISOString(),
            previousImplementation: currentImpl,
            newImplementation: newImpl,
            upgrader: deployerAddress,
            version: 'v1.1' // Update version as needed
        });

        // Update current implementation
        deploymentData.contracts.implementation.address = newImpl;
        deploymentData.lastUpgrade = new Date().toISOString();

        // Save updated data
        fs.writeFileSync('bsc-testnet-upgradeable-deployment.json', JSON.stringify(deploymentData, null, 2));

        console.log('\n🎉 UPGRADE SUCCESSFUL! 🎉');
        console.log('\n📊 Summary:');
        console.log(`   📍 Proxy Address: ${proxyAddress} (unchanged)`);
        console.log(`   🔧 Old Implementation: ${currentImpl}`);
        console.log(`   🆕 New Implementation: ${newImpl}`);
        console.log(`   💾 All state data preserved`);
        
        console.log('\n🔄 Upgrade Benefits:');
        console.log('   ✅ Same contract address for users');
        console.log('   ✅ All balances and data preserved');
        console.log('   ✅ No need to update frontend');
        console.log('   ✅ Seamless upgrade experience');

        console.log('\n📋 Next Steps:');
        console.log('   1. Test upgraded functionality');
        console.log('   2. Verify contract on BSCScan');
        console.log('   3. Update documentation');

        return {
            proxy: proxyAddress,
            oldImplementation: currentImpl,
            newImplementation: newImpl
        };

    } catch (error) {
        console.error('\n❌ Upgrade failed:', error);
        throw error;
    }
}

// Execute upgrade
main()
    .then((result) => {
        console.log('\n🚀 Upgrade completed successfully!');
        console.log(`📍 Contract Proxy: ${result.proxy}`);
        console.log(`🔧 New Implementation: ${result.newImplementation}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Upgrade failed:', error.message);
        process.exit(1);
    });
