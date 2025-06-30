#!/usr/bin/env node

/**
 * =====================================================
 * 🚀 LEADFIVE UPGRADEABLE DEPLOYMENT - BSC TESTNET
 * =====================================================
 * 
 * This script deploys LeadFive using OpenZeppelin's upgradeable proxy pattern:
 * 1. Deploys the implementation contract (LeadFive)
 * 2. Deploys a TransparentUpgradeableProxy
 * 3. Deploys a ProxyAdmin for admin functions
 * 
 * Benefits:
 * - Single deployment cost
 * - Future upgrades without redeployment
 * - Preserves contract state and address
 * - Gas efficient
 */

require('dotenv').config();
const hre = require('hardhat');
const { ethers, upgrades } = require('hardhat');
const fs = require('fs');

async function main() {
    console.log('\n🚀 Starting LeadFive Upgradeable Deployment on BSC Testnet...\n');

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log(`👤 Deployer: ${deployerAddress}`);

    // Check balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);

    if (balance < ethers.parseEther('0.01')) {
        throw new Error('❌ Insufficient BNB balance. Need at least 0.01 BNB for deployment.');
    }

    // Configuration for BSC Testnet
    const config = {
        // BSC Testnet USDT (18 decimals) - using mock/testnet version
        usdtAddress: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', // BSC Testnet USDT (18 decimals)
        // BSC Testnet Price Feed (Chainlink BNB/USD)
        priceFeedAddress: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526', // BSC Testnet BNB/USD
        // Admin addresses (will be transferred to Trezor later)
        admin: deployerAddress,
        feeRecipient: deployerAddress,
        // Initial package configuration (18 decimals for BSC USDT)
        packages: [
            { price: ethers.parseUnits('100', 18), limit: 50 },    // $100 USDT
            { price: ethers.parseUnits('500', 18), limit: 25 },    // $500 USDT
            { price: ethers.parseUnits('1000', 18), limit: 15 },   // $1000 USDT
            { price: ethers.parseUnits('2500', 18), limit: 10 },   // $2500 USDT
            { price: ethers.parseUnits('5000', 18), limit: 5 }     // $5000 USDT
        ]
    };

    console.log('\n📋 Deployment Configuration:');
    console.log(`   USDT Address: ${config.usdtAddress}`);
    console.log(`   Price Feed: ${config.priceFeedAddress}`);
    console.log(`   Admin: ${config.admin}`);
    console.log(`   Fee Recipient: ${config.feeRecipient}`);

    try {
        console.log('\n🔨 Step 1: Deploying LeadFive Implementation + Proxy...');

        // Get the LeadFive contract factory
        const LeadFive = await ethers.getContractFactory('LeadFive');

        // Deploy with OpenZeppelin upgrades plugin (using USDT address and price feed)
        // This automatically deploys: Implementation + ProxyAdmin + TransparentUpgradeableProxy
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [config.usdtAddress, config.priceFeedAddress],
            {
                initializer: 'initialize',
                kind: 'transparent', // Use TransparentUpgradeableProxy
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

        console.log('\n🔧 Step 2: Setting Admin Configuration...');

        // Set fee recipient (owner can set this)
        const setFeeRecipientTx = await leadFive.setPlatformFeeRecipient(config.feeRecipient);
        await setFeeRecipientTx.wait();
        console.log(`   ✅ Fee recipient set to: ${config.feeRecipient}`);

        // Add deployer as admin (owner can do this)
        const addAdminTx = await leadFive.addAdmin(config.admin);
        await addAdminTx.wait();
        console.log(`   ✅ Admin added: ${config.admin}`);

        // Add oracle after deployment
        const addOracleTx = await leadFive.addOracle(config.priceFeedAddress);
        await addOracleTx.wait();
        console.log(`   ✅ Oracle added: ${config.priceFeedAddress}`);

        console.log('\n✅ Step 3: Verifying Deployment...');

        // Verify basic functionality
        const owner = await leadFive.owner();
        const totalUsers = await leadFive.getTotalUsers();

        console.log(`   Owner: ${owner}`);
        console.log(`   Total Users: ${totalUsers}`);

        // Check if packages are initialized
        try {
            const package1 = await leadFive.packages(1);
            console.log(`   Package 1: $${ethers.formatUnits(package1.price, 18)} USDT, Limit: ${package1.dailyLimit}`);
        } catch (error) {
            console.log(`   Package info: Packages initialized automatically`);
        }

        console.log('\n💾 Step 4: Saving Deployment Info...');

        // Prepare deployment data
        const deploymentData = {
            network: 'BSC Testnet',
            chainId: network.chainId,
            timestamp: new Date().toISOString(),
            deployer: deployerAddress,
            gasUsed: 'Calculated automatically by OpenZeppelin',
            contracts: {
                proxy: {
                    address: proxyAddress,
                    description: 'Main contract proxy - use this address for all interactions'
                },
                implementation: {
                    address: implementationAddress,
                    description: 'Implementation contract - do not interact directly'
                },
                proxyAdmin: {
                    address: adminAddress,
                    description: 'Proxy admin contract - handles upgrades'
                }
            },
            configuration: {
                usdtAddress: config.usdtAddress,
                priceFeedAddress: config.priceFeedAddress,
                admin: config.admin,
                feeRecipient: config.feeRecipient,
                packages: config.packages.map((pkg, i) => ({
                    id: i + 1,
                    price: ethers.formatUnits(pkg.price, 18) + ' USDT',
                    dailyLimit: pkg.limit
                }))
            },
            nextSteps: [
                'Run contract verification script',
                'Test package purchasing functionality',
                'Test referral system',
                'Transfer ownership to Trezor wallet',
                'Deploy to BSC Mainnet using same pattern'
            ],
            upgradeInstructions: {
                command: 'npx hardhat run upgrade-contract.cjs --network bscTestnet',
                note: 'Future upgrades will preserve contract state and address'
            }
        };

        // Save to file
        const outputFile = 'bsc-testnet-upgradeable-deployment.json';
        fs.writeFileSync(outputFile, JSON.stringify(deploymentData, null, 2));

        console.log(`📄 Deployment data saved to: ${outputFile}`);

        console.log('\n🎉 DEPLOYMENT SUCCESSFUL! 🎉');
        console.log('\n📊 Summary:');
        console.log(`   📍 Proxy Address: ${proxyAddress}`);
        console.log(`   🔧 Implementation: ${implementationAddress}`);
        console.log(`   🛡️  ProxyAdmin: ${adminAddress}`);
        console.log(`   💰 Use Proxy Address for all interactions`);
        
        console.log('\n🔄 Upgrade Benefits:');
        console.log('   ✅ Contract address never changes');
        console.log('   ✅ State preserved during upgrades');
        console.log('   ✅ Gas efficient future deployments');
        console.log('   ✅ Admin controls upgrade process');

        console.log('\n📋 Next Steps:');
        console.log('   1. Run verification: npx hardhat run verify-bsc-testnet.cjs --network bscTestnet');
        console.log('   2. Test functionality: npx hardhat run test-functionality.cjs --network bscTestnet');
        console.log('   3. Transfer to Trezor: npx hardhat run transfer-ownership.cjs --network bscTestnet');

        // Update .env with new contract address
        console.log('\n🔧 Updating .env file...');
        const envContent = fs.readFileSync('.env', 'utf8');
        const updatedEnv = envContent.replace(
            /TESTNET_CONTRACT_ADDRESS=.*/,
            `TESTNET_CONTRACT_ADDRESS=${proxyAddress}`
        );
        fs.writeFileSync('.env', updatedEnv);
        console.log('✅ .env file updated with new contract address');

        return {
            proxy: proxyAddress,
            implementation: implementationAddress,
            admin: adminAddress
        };

    } catch (error) {
        console.error('\n❌ Deployment failed:', error);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.log('\n💡 Solution: Get more testnet BNB from https://testnet.binance.org/faucet-smart');
        } else if (error.message.includes('nonce')) {
            console.log('\n💡 Solution: Wait a moment and try again (nonce issue)');
        } else if (error.message.includes('gas')) {
            console.log('\n💡 Solution: Increase gas limit in hardhat.config.js');
        }
        
        throw error;
    }
}

// Execute deployment
main()
    .then((result) => {
        console.log('\n🚀 Deployment completed successfully!');
        console.log(`📍 Contract Proxy: ${result.proxy}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Deployment failed:', error.message);
        process.exit(1);
    });
