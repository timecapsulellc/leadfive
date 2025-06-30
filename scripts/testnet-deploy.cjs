const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
require('dotenv').config();

async function deployToTestnet() {
    console.log('🚀 DEPLOYING LEADFIVE TO BSC TESTNET');
    console.log('='.repeat(60));
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log('Deploying with account:', deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'BNB');
    
    if (balance < ethers.parseEther("0.01")) {
        throw new Error('❌ Insufficient BNB balance for deployment (need at least 0.01 BNB)');
    }
    
    // BSC Testnet configuration
    const TESTNET_CONFIG = {
        usdt: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet USDT
        oracle: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526", // BSC Testnet BNB/USD Oracle
        chainId: 97,
        networkName: "BSC Testnet"
    };
    
    console.log('\n📋 DEPLOYMENT CONFIGURATION:');
    console.log('- Network:', TESTNET_CONFIG.networkName);
    console.log('- Chain ID:', TESTNET_CONFIG.chainId);
    console.log('- USDT Address:', TESTNET_CONFIG.usdt);
    console.log('- Oracle Address:', TESTNET_CONFIG.oracle);
    console.log('- Deployer:', deployer.address);
    
    try {
        console.log('\n📚 DEPLOYING LIBRARIES...');
        
        // Deploy CoreOptimized library
        console.log('Deploying CoreOptimized library...');
        const CoreOptimized = await ethers.getContractFactory('CoreOptimized');
        const coreOptimized = await CoreOptimized.deploy();
        await coreOptimized.waitForDeployment();
        const coreOptimizedAddress = await coreOptimized.getAddress();
        console.log('✅ CoreOptimized deployed at:', coreOptimizedAddress);
        
        // Deploy SecureOracle library
        console.log('Deploying SecureOracle library...');
        const SecureOracle = await ethers.getContractFactory('SecureOracle');
        const secureOracle = await SecureOracle.deploy();
        await secureOracle.waitForDeployment();
        const secureOracleAddress = await secureOracle.getAddress();
        console.log('✅ SecureOracle deployed at:', secureOracleAddress);
        
        // Deploy Errors library
        console.log('Deploying Errors library...');
        const Errors = await ethers.getContractFactory('Errors');
        const errors = await Errors.deploy();
        await errors.waitForDeployment();
        const errorsAddress = await errors.getAddress();
        console.log('✅ Errors deployed at:', errorsAddress);
        
        console.log('\n📄 DEPLOYING MAIN CONTRACT...');
        
        // Deploy LeadFive with libraries
        const LeadFive = await ethers.getContractFactory('LeadFive', {
            libraries: {
                CoreOptimized: coreOptimizedAddress,
                SecureOracle: secureOracleAddress,
                Errors: errorsAddress
            }
        });
        
        console.log('Deploying LeadFive as upgradeable proxy...');
        
        // Deploy with proxy
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [TESTNET_CONFIG.usdt, TESTNET_CONFIG.oracle],
            { 
                initializer: 'initialize',
                kind: 'uups',
                libraries: {
                    CoreOptimized: coreOptimizedAddress,
                    SecureOracle: secureOracleAddress,
                    Errors: errorsAddress
                },
                timeout: 0 // No timeout for testnet
            }
        );
        
        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
        
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('='.repeat(60));
        console.log('Proxy Address:', contractAddress);
        console.log('Implementation:', implementationAddress);
        console.log('CoreOptimized Library:', coreOptimizedAddress);
        console.log('SecureOracle Library:', secureOracleAddress);
        console.log('Errors Library:', errorsAddress);
        
        // Save deployment info
        const deploymentInfo = {
            network: "bsc-testnet",
            chainId: TESTNET_CONFIG.chainId,
            deploymentDate: new Date().toISOString(),
            deployer: deployer.address,
            addresses: {
                proxy: contractAddress,
                implementation: implementationAddress,
                libraries: {
                    CoreOptimized: coreOptimizedAddress,
                    SecureOracle: secureOracleAddress,
                    Errors: errorsAddress
                },
                usdt: TESTNET_CONFIG.usdt,
                oracle: TESTNET_CONFIG.oracle
            },
            deploymentTx: leadFive.deploymentTransaction()?.hash,
            gasUsed: 'pending'
        };
        
        // Wait for deployment transaction to be mined
        if (leadFive.deploymentTransaction()) {
            const receipt = await leadFive.deploymentTransaction().wait();
            deploymentInfo.gasUsed = receipt.gasUsed.toString();
            deploymentInfo.blockNumber = receipt.blockNumber;
        }
        
        fs.writeFileSync(
            './testnet-deployment-info.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n📄 Deployment info saved to: testnet-deployment-info.json');
        
        // Initial verification
        console.log('\n🔍 VERIFYING DEPLOYMENT...');
        
        try {
            const totalUsers = await leadFive.getTotalUsers();
            const isAdmin = await leadFive.isAdmin(deployer.address);
            const packagePrice = await leadFive.getPackagePrice(1);
            const usdtAddress = await leadFive.usdt();
            
            console.log('✅ Total Users:', totalUsers.toString());
            console.log('✅ Deployer is Admin:', isAdmin);
            console.log('✅ Package 1 Price:', ethers.formatUnits(packagePrice, 18), 'USDT');
            console.log('✅ USDT Address:', usdtAddress);
            
            // Test system health
            const systemHealth = await leadFive.getSystemHealth();
            console.log('✅ System Operational:', systemHealth[0]);
            console.log('✅ User Count:', systemHealth[1].toString());
            console.log('✅ Contract BNB Balance:', ethers.formatEther(systemHealth[4]), 'BNB');
            
        } catch (error) {
            console.log('⚠️  Initial verification failed:', error.message);
        }
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Verify contract on BSCScan:');
        console.log(`   node testnet-verify.cjs`);
        console.log('2. Run comprehensive tests:');
        console.log(`   node testnet-test.cjs`);
        console.log('3. View on BSCScan Testnet:');
        console.log(`   https://testnet.bscscan.com/address/${contractAddress}`);
        console.log('4. Get testnet USDT for testing:');
        console.log('   Use a BSC testnet faucet or swap for test USDT');
        
        console.log('\n🎯 DEPLOYMENT COMPLETE!');
        console.log('Contract is ready for testing on BSC Testnet');
        
        return {
            proxy: contractAddress,
            implementation: implementationAddress,
            libraries: {
                CoreOptimized: coreOptimizedAddress,
                SecureOracle: secureOracleAddress,
                Errors: errorsAddress
            }
        };
        
    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED:', error);
        
        // Save error info for debugging
        const errorInfo = {
            timestamp: new Date().toISOString(),
            network: "bsc-testnet",
            deployer: deployer.address,
            error: error.message,
            stack: error.stack
        };
        
        fs.writeFileSync(
            './testnet-deployment-error.json',
            JSON.stringify(errorInfo, null, 2)
        );
        
        throw error;
    }
}

// Run deployment
if (require.main === module) {
    deployToTestnet()
        .then((result) => {
            console.log('\n✅ BSC Testnet deployment completed successfully!');
            console.log('Proxy address:', result.proxy);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ BSC Testnet deployment failed:', error);
            process.exit(1);
        });
}

module.exports = deployToTestnet;
