const { ethers, upgrades } = require("hardhat");
const fs = require('fs');

async function deployToBSCTestnet() {
    console.log('🚀 DEPLOYING LEADFIVE TO BSC TESTNET VIA HARDHAT');
    console.log('='.repeat(60));
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    
    console.log('📋 DEPLOYMENT CONFIGURATION:');
    console.log('- Network: BSC Testnet (Hardhat)');
    console.log('- Chain ID: 97');
    console.log('- Deployer Address:', deployerAddress);
    console.log('- Expected Address: 0xCeaEfDaDE5a0D574bFd5577665dC58d132995335');
    
    // Verify deployer address matches expected
    const expectedAddress = '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335';
    if (deployerAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        console.log('⚠️  WARNING: Deployer address mismatch!');
        console.log('- Current:', deployerAddress);
        console.log('- Expected:', expectedAddress);
        console.log('- Please update your private key in .env file');
        
        // Ask for confirmation
        console.log('\n🤔 Do you want to continue with current address?');
        console.log('Type "yes" to continue or Ctrl+C to cancel...');
        // In production, you'd add readline here
    }
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployerAddress);
    console.log('- Account Balance:', ethers.formatEther(balance), 'BNB');
    
    if (balance < ethers.parseEther("0.005")) {
        console.log('\n⚠️  LOW BALANCE WARNING!');
        console.log('- Current Balance:', ethers.formatEther(balance), 'BNB');
        console.log('- Recommended: At least 0.01 BNB');
        console.log('- Get testnet BNB from: https://testnet.binance.org/faucet-smart');
        console.log(`- Send to address: ${deployerAddress}`);
        
        if (balance === 0n) {
            throw new Error('❌ Zero balance! Cannot deploy without testnet BNB.');
        }
    }
    
    // BSC Testnet configuration
    const TESTNET_CONFIG = {
        usdt: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet USDT
        oracle: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526", // BSC Testnet Oracle
        chainId: 97,
        networkName: "BSC Testnet"
    };
    
    console.log('- USDT Address:', TESTNET_CONFIG.usdt);
    console.log('- Oracle Address:', TESTNET_CONFIG.oracle);
    
    try {
        console.log('\n� DEPLOYING MAIN CONTRACT...');
        
        // Deploy LeadFive (libraries are included inline)
        const LeadFiveFactory = await ethers.getContractFactory('LeadFive');
        
        console.log('Deploying LeadFive as upgradeable proxy...');
        
        // Deploy with UUPS proxy
        const leadFive = await upgrades.deployProxy(
            LeadFiveFactory,
            [TESTNET_CONFIG.usdt, TESTNET_CONFIG.oracle],
            { 
                initializer: 'initialize',
                kind: 'uups',
                libraries: {
                    CoreOptimized: coreOptimizedAddress,
                    SecureOracle: secureOracleAddress,
                    Errors: errorsAddress
                },
                timeout: 120000 // 2 minutes timeout
            }
        );
        
        await leadFive.waitForDeployment();
        const proxyAddress = await leadFive.getAddress();
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('='.repeat(60));
        console.log('📍 CONTRACT ADDRESSES:');
        console.log('- Proxy (Main):', proxyAddress);
        console.log('- Implementation:', implementationAddress);
        console.log('- CoreOptimized:', coreOptimizedAddress);
        console.log('- SecureOracle:', secureOracleAddress);
        console.log('- Errors:', errorsAddress);
        
        // Get deployment transaction details
        const deployTx = leadFive.deploymentTransaction();
        const receipt = deployTx ? await deployTx.wait() : null;
        
        // Save comprehensive deployment info
        const deploymentInfo = {
            network: "bsc-testnet",
            chainId: TESTNET_CONFIG.chainId,
            deploymentDate: new Date().toISOString(),
            deployer: deployerAddress,
            expectedDeployer: expectedAddress,
            addresses: {
                proxy: proxyAddress,
                implementation: implementationAddress,
                config: {
                    usdt: TESTNET_CONFIG.usdt,
                    oracle: TESTNET_CONFIG.oracle
                }
            },
            transaction: {
                hash: deployTx?.hash || 'unknown',
                blockNumber: receipt?.blockNumber || 'pending',
                gasUsed: receipt?.gasUsed?.toString() || 'pending',
                gasPrice: receipt?.gasPrice?.toString() || 'pending'
            },
            verification: {
                bscscanLinks: {
                    proxy: `https://testnet.bscscan.com/address/${proxyAddress}`,
                    implementation: `https://testnet.bscscan.com/address/${implementationAddress}`
                }
            }
        };
        
        // Save to file
        fs.writeFileSync(
            './bsc-testnet-deployment.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n📄 Deployment info saved to: bsc-testnet-deployment.json');
        
        console.log('\n🔍 STEP 3: INITIAL VERIFICATION...');
        
        try {
            // Test basic contract functions
            const totalUsers = await leadFive.getTotalUsers();
            const isAdmin = await leadFive.isAdmin(deployerAddress);
            const packagePrice = await leadFive.getPackagePrice(1);
            const usdtAddress = await leadFive.usdt();
            const owner = await leadFive.owner();
            
            console.log('✅ Contract Initialized');
            console.log(`  - Total Users: ${totalUsers}`);
            console.log(`  - Owner: ${owner}`);
            console.log(`  - Deployer is Admin: ${isAdmin}`);
            console.log(`  - Package 1 Price: ${ethers.formatUnits(packagePrice, 18)} USDT`);
            console.log(`  - USDT Contract: ${usdtAddress}`);
            
            // Set deployer as default admin
            if (!isAdmin) {
                console.log('Adding deployer as admin...');
                const addAdminTx = await leadFive.addAdmin(deployerAddress);
                await addAdminTx.wait();
                console.log('✅ Deployer added as admin');
            }
            
        } catch (error) {
            console.log('⚠️  Initial verification failed:', error.message);
        }
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Verify contracts on BSCScan:');
        console.log(`   npx hardhat verify --network bscTestnet ${implementationAddress}`);
        console.log('2. View on BSCScan:');
        console.log(`   https://testnet.bscscan.com/address/${proxyAddress}`);
        console.log('3. Get testnet USDT for testing');
        console.log('4. Test user registration');
        console.log('5. Deploy to mainnet after testing');
        
        console.log('\n🎯 BSC TESTNET DEPLOYMENT COMPLETE!');
        console.log(`Main Contract: ${proxyAddress}`);
        
        return {
            proxy: proxyAddress,
            implementation: implementationAddress,
            libraries: {
                CoreOptimized: coreOptimizedAddress,
                SecureOracle: secureOracleAddress,
                Errors: errorsAddress
            },
            deployer: deployerAddress
        };
        
    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED:', error);
        
        // Save error info
        const errorInfo = {
            timestamp: new Date().toISOString(),
            network: "bsc-testnet",
            deployer: deployerAddress,
            error: error.message,
            stack: error.stack?.split('\n').slice(0, 10) // First 10 lines
        };
        
        fs.writeFileSync(
            './bsc-testnet-deployment-error.json',
            JSON.stringify(errorInfo, null, 2)
        );
        
        console.log('Error details saved to: bsc-testnet-deployment-error.json');
        throw error;
    }
}

// Main execution
if (require.main === module) {
    deployToBSCTestnet()
        .then((result) => {
            console.log('\n✅ BSC TESTNET DEPLOYMENT COMPLETED!');
            console.log('Contract Address:', result.proxy);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Deployment failed:', error.message);
            process.exit(1);
        });
}

module.exports = deployToBSCTestnet;
