#!/usr/bin/env node

/**
 * =====================================================
 * 🚀 LEADFIVE BSC TESTNET DEPLOYMENT - FINAL VERSION
 * =====================================================
 * 
 * Deploys LeadFive contract with correct configuration:
 * - Package prices: $30, $50, $100, $200 USDT
 * - Uses wallet addresses as referral IDs
 * - Proper BSC testnet setup with mock USDT
 */

require('dotenv').config();
const hre = require('hardhat');
const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main() {
    console.log('\n🚀 Starting LeadFive BSC Testnet Deployment...\n');

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 97n) {
        throw new Error('❌ This script is for BSC Testnet only (Chain ID: 97)');
    }

    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`👤 Deployer: ${deployerAddress}`);

    // Check balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);

    if (balance < ethers.parseEther('0.05')) {
        throw new Error('❌ Insufficient BNB balance. Need at least 0.05 BNB for deployment.');
    }

    try {
        console.log('\n🔨 Step 1: Using BSC Testnet USDT...');
        
        // Use real BSC testnet USDT address (18 decimals)
        const usdtAddress = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'; // BSC Testnet USDT
        console.log(`� Using BSC Testnet USDT: ${usdtAddress}`);

        console.log('\n🔨 Step 2: Deploying Mock Price Feed...');
        
        // Deploy MockPriceFeed
        const MockPriceFeed = await ethers.getContractFactory('MockPriceFeed');
        const mockPriceFeed = await MockPriceFeed.deploy();
        await mockPriceFeed.waitForDeployment();
        const priceFeedAddress = await mockPriceFeed.getAddress();
        console.log(`✅ Mock Price Feed deployed at: ${priceFeedAddress}`);

        console.log('\n🔨 Step 3: Deploying LeadFive Implementation + Proxy...');

        // Get the LeadFive contract factory
        const LeadFive = await ethers.getContractFactory('LeadFive');

        // Deploy with OpenZeppelin upgrades plugin
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [usdtAddress, priceFeedAddress],
            {
                initializer: 'initialize',
                kind: 'transparent',
                timeout: 300000, // 5 minutes timeout
                pollingInterval: 5000 // Check every 5 seconds
            }
        );

        console.log('⏳ Waiting for deployment transaction to be mined...');
        await leadFive.waitForDeployment();

        const proxyAddress = await leadFive.getAddress();
        console.log(`✅ LeadFive Proxy deployed at: ${proxyAddress}`);

        // Get implementation and admin addresses
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

        console.log(`📦 Implementation: ${implementationAddress}`);
        console.log(`🔐 ProxyAdmin: ${adminAddress}`);

        console.log('\n✅ Step 4: Verifying Contract Configuration...');

        // Verify package prices
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await leadFive.verifyPackageAllocations(i);
            const priceInUSDT = ethers.formatUnits(packageInfo.price, 18);
            const totalAllocation = Number(packageInfo.totalAllocation);
            console.log(`📦 Package ${i}: $${priceInUSDT} USDT, Total Allocation: ${totalAllocation / 100}%`);
            
            // Verify total allocation is 100%
            if (totalAllocation !== 10000) { // 10000 = 100.00%
                console.warn(`⚠️  Warning: Package ${i} allocation is ${totalAllocation / 100}%, not 100%`);
            }
        }

        // Verify system health
        const health = await leadFive.getSystemHealth();
        console.log(`🏥 System Operational: ${health.isOperational}`);
        console.log(`👥 Total Users: ${health.userCount}`);
        console.log(`💰 Contract USDT Balance: ${ethers.formatUnits(health.contractUSDTBalance, 18)} USDT`);

        // Save deployment info
        const deploymentInfo = {
            network: 'BSC Testnet',
            chainId: Number(network.chainId),
            timestamp: new Date().toISOString(),
            deployer: deployerAddress,
            contracts: {
                LeadFiveProxy: proxyAddress,
                LeadFiveImplementation: implementationAddress,
                ProxyAdmin: adminAddress,
                BSCTestnetUSDT: usdtAddress,
                MockPriceFeed: priceFeedAddress
            },
            packagePrices: {
                level1: '$30 USDT',
                level2: '$50 USDT', 
                level3: '$100 USDT',
                level4: '$200 USDT'
            },
            features: {
                walletAddressReferrals: true,
                upgradeableProxy: true,
                circuitBreaker: true,
                dailyLimits: true,
                mevProtection: true
            }
        };

        // Write deployment info to file
        const filename = `BSC_TESTNET_DEPLOYMENT_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
        console.log(`\n💾 Deployment info saved to: ${filename}`);

        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('\n📋 Summary:');
        console.log(`   🔗 LeadFive Proxy: ${proxyAddress}`);
        console.log(`   💰 BSC Testnet USDT: ${usdtAddress}`);
        console.log(`   📊 Mock Price Feed: ${priceFeedAddress}`);
        console.log(`   👤 Admin: ${deployerAddress}`);

        console.log('\n🧪 Next Steps:');
        console.log('   1. Get testnet USDT from BSC testnet faucet');
        console.log('   2. Test registration with USDT');
        console.log('   3. Test registration with BNB');
        console.log('   4. Test bonus distributions');
        console.log('   5. Test withdrawal functionality');
        console.log('   6. Verify contract on BSCScan');

        // Verification command
        console.log('\n🔍 Verification Command:');
        console.log(`npx hardhat verify --network bscTestnet ${proxyAddress}`);

        return {
            leadFive: proxyAddress,
            bscTestnetUSDT: usdtAddress,
            mockPriceFeed: priceFeedAddress,
            implementation: implementationAddress,
            admin: adminAddress
        };

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Deployment script failed:', error);
            process.exit(1);
        });
}

module.exports = main;
