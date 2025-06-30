const { ethers, upgrades } = require('hardhat');

async function deployToTestnet() {
    console.log('🚀 DEPLOYING LEADFIVE TO BSC TESTNET\n');
    
    const [deployer] = await ethers.getSigners();
    console.log('Deploying with account:', deployer.address);
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'BNB\n');
    
    // BSC Testnet configuration
    const config = {
        usdt: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', // BSC Testnet USDT
        oracle: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526', // BSC Testnet BNB/USD
        expectedDecimals: 18 // BSC testnet USDT usually has 18 decimals
    };
    
    console.log('=== DEPLOYMENT CONFIGURATION ===');
    console.log('USDT Address:', config.usdt);
    console.log('Oracle Address:', config.oracle);
    console.log('Expected Decimals:', config.expectedDecimals);
    console.log('Network: BSC Testnet');
    console.log('Chain ID: 97\n');
    
    try {
        // Deploy libraries first
        console.log('📚 Deploying libraries...');
        
        const CoreOptimized = await ethers.getContractFactory('CoreOptimized');
        const coreOptimized = await CoreOptimized.deploy();
        await coreOptimized.waitForDeployment();
        console.log('✅ CoreOptimized deployed at:', await coreOptimized.getAddress());
        
        const SecureOracle = await ethers.getContractFactory('SecureOracle');
        const secureOracle = await SecureOracle.deploy();
        await secureOracle.waitForDeployment();
        console.log('✅ SecureOracle deployed at:', await secureOracle.getAddress());
        
        const Errors = await ethers.getContractFactory('Errors');
        const errors = await Errors.deploy();
        await errors.waitForDeployment();
        console.log('✅ Errors deployed at:', await errors.getAddress());
        
        console.log('📄 Deploying LeadFive contract...');
        
        // Deploy main contract
        const LeadFive = await ethers.getContractFactory('LeadFive', {
            libraries: {
                CoreOptimized: await coreOptimized.getAddress(),
                SecureOracle: await secureOracle.getAddress(),
                Errors: await errors.getAddress()
            }
        });
        
        // Deploy with proxy
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [config.usdt, config.oracle],
            { 
                initializer: 'initialize',
                kind: 'uups',
                libraries: {
                    CoreOptimized: await coreOptimized.getAddress(),
                    SecureOracle: await secureOracle.getAddress(),
                    Errors: await errors.getAddress()
                }
            }
        );
        
        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();
        
        console.log('🎉 DEPLOYMENT SUCCESSFUL!\n');
        console.log('=== CONTRACT ADDRESSES ===');
        console.log('LeadFive Proxy:', contractAddress);
        console.log('CoreOptimized Library:', await coreOptimized.getAddress());
        console.log('SecureOracle Library:', await secureOracle.getAddress());
        console.log('Errors Library:', await errors.getAddress());
        
        // Verify basic functionality
        console.log('\n🔍 VERIFYING DEPLOYMENT...');
        
        const totalUsers = await leadFive.getTotalUsers();
        const isAdmin = await leadFive.isAdmin(deployer.address);
        const packagePrice = await leadFive.getPackagePrice(1);
        
        console.log('✅ Total Users:', totalUsers.toString());
        console.log('✅ Deployer is Admin:', isAdmin);
        console.log('✅ Package 1 Price:', ethers.formatUnits(packagePrice, 18), 'USDT');
        
        // Test USDT configuration
        try {
            const usdtConfig = await leadFive.getUSDTConfiguration();
            console.log('✅ USDT Address:', usdtConfig[0]);
            console.log('✅ USDT Decimals:', usdtConfig[1].toString());
            console.log('✅ Decimal Multiplier:', usdtConfig[2].toString());
        } catch (error) {
            console.log('ℹ️ USDT config check failed (normal for current contract)');
        }
        
        console.log('\n=== NEXT STEPS ===');
        console.log('1. Update .env with testnet contract address');
        console.log('2. Run comprehensive tests');
        console.log('3. Test registration and withdrawal flows');
        console.log('4. Verify on BSCScan testnet');
        console.log('5. Deploy to mainnet after successful testing');
        
        console.log('\n=== TESTNET VERIFICATION COMMAND ===');
        console.log(`npx hardhat verify --network bscTestnet ${contractAddress}`);
        
        return {
            contract: contractAddress,
            libraries: {
                CoreOptimized: await coreOptimized.getAddress(),
                SecureOracle: await secureOracle.getAddress(),
                Errors: await errors.getAddress()
            }
        };
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        throw error;
    }
}

// Run deployment
deployToTestnet()
    .then((result) => {
        console.log('\n✅ Testnet deployment completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Testnet deployment failed:', error);
        process.exit(1);
    });
