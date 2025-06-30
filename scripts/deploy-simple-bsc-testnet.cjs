const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log('\n🚀 Starting LeadFive BSC Testnet Deployment...\n');

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${hre.network.name} (Chain ID: ${network.chainId})`);
    
    // Validate network
    if (network.chainId !== 97n) {
        throw new Error('❌ This script is for BSC Testnet only (Chain ID: 97)');
    }

    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const balance = await ethers.provider.getBalance(deployerAddress);
    
    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);

    if (balance < ethers.parseEther("0.05")) {
        throw new Error('❌ Insufficient BNB balance. Need at least 0.05 BNB for deployment.');
    }

    try {
        console.log('\n🔨 Step 1: Deploying Mock USDT for testing...');
        
        // Deploy MockUSDT first (use the simple one)
        const MockUSDT = await ethers.getContractFactory('MockUSDT');
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        const usdtAddress = await mockUSDT.getAddress();
        
        console.log(`✅ Mock USDT deployed at: ${usdtAddress}`);

        console.log('\n🔨 Step 2: Deploying Mock Price Oracle...');
        
        // Deploy MockPriceFeed
        const MockPriceFeed = await ethers.getContractFactory('MockPriceFeed');
        const mockOracle = await MockPriceFeed.deploy();
        await mockOracle.waitForDeployment();
        const oracleAddress = await mockOracle.getAddress();
        
        console.log(`✅ Mock Oracle deployed at: ${oracleAddress}`);

        console.log('\n🔨 Step 3: Deploying LeadFive Implementation...');
        
        // Deploy LeadFive implementation
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const leadFiveImpl = await LeadFive.deploy();
        await leadFiveImpl.waitForDeployment();
        const implAddress = await leadFiveImpl.getAddress();
        
        console.log(`✅ LeadFive Implementation deployed at: ${implAddress}`);

        console.log('\n🔨 Step 4: Deploying ERC1967Proxy...');
        
        // Prepare initialization data
        const initData = LeadFive.interface.encodeFunctionData('initialize', [
            usdtAddress,
            oracleAddress
        ]);

        // Deploy proxy
        const ERC1967Proxy = await ethers.getContractFactory('ERC1967Proxy');
        const proxy = await ERC1967Proxy.deploy(implAddress, initData);
        await proxy.waitForDeployment();
        const proxyAddress = await proxy.getAddress();
        
        console.log(`✅ LeadFive Proxy deployed at: ${proxyAddress}`);

        console.log('\n🔨 Step 5: Verifying deployment...');
        
        // Connect to proxy as LeadFive
        const leadFiveProxy = LeadFive.attach(proxyAddress);
        
        // Test basic functions
        const totalUsers = await leadFiveProxy.getTotalUsers();
        const packagePrice1 = await leadFiveProxy.getPackagePrice(1);
        const owner = await leadFiveProxy.owner();
        
        console.log(`✅ Total Users: ${totalUsers}`);
        console.log(`✅ Package 1 Price: ${ethers.formatEther(packagePrice1)} USDT`);
        console.log(`✅ Contract Owner: ${owner}`);

        // Mint some test USDT to deployer for testing
        console.log('\n🔨 Step 6: Minting test USDT...');
        await mockUSDT.mint(deployerAddress, ethers.parseEther("10000")); // 10,000 USDT
        const usdtBalance = await mockUSDT.balanceOf(deployerAddress);
        console.log(`✅ Minted ${ethers.formatEther(usdtBalance)} USDT to deployer`);

        // Final deployment summary
        console.log('\n🎉 DEPLOYMENT COMPLETE! 🎉');
        console.log('==========================================');
        console.log(`📄 LeadFive Proxy (Main Contract): ${proxyAddress}`);
        console.log(`📄 LeadFive Implementation: ${implAddress}`);
        console.log(`📄 Mock USDT: ${usdtAddress}`);
        console.log(`📄 Mock Oracle: ${oracleAddress}`);
        console.log(`👤 Owner: ${deployerAddress}`);
        console.log('==========================================');

        // Save deployment info
        const deploymentInfo = {
            network: 'BSC Testnet',
            chainId: 97,
            timestamp: new Date().toISOString(),
            deployer: deployerAddress,
            contracts: {
                LeadFiveProxy: proxyAddress,
                LeadFiveImplementation: implAddress,
                MockUSDT: usdtAddress,
                MockOracle: oracleAddress
            },
            packagePrices: {
                level1: ethers.formatEther(await leadFiveProxy.getPackagePrice(1)),
                level2: ethers.formatEther(await leadFiveProxy.getPackagePrice(2)),
                level3: ethers.formatEther(await leadFiveProxy.getPackagePrice(3)),
                level4: ethers.formatEther(await leadFiveProxy.getPackagePrice(4))
            }
        };

        // Write to file
        const fs = require('fs');
        fs.writeFileSync(
            'BSC_TESTNET_DEPLOYMENT_SUCCESS.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log('💾 Deployment info saved to BSC_TESTNET_DEPLOYMENT_SUCCESS.json');
        
        // Contract verification commands
        console.log('\n📝 Contract Verification Commands:');
        console.log(`npx hardhat verify --network bscTestnet ${implAddress}`);
        console.log(`npx hardhat verify --network bscTestnet ${usdtAddress}`);
        console.log(`npx hardhat verify --network bscTestnet ${oracleAddress}`);
        
        console.log('\n🧪 Testing Commands:');
        console.log('// In Hardhat console:');
        console.log(`const leadFive = await ethers.getContractAt("LeadFive", "${proxyAddress}");`);
        console.log(`const usdt = await ethers.getContractAt("MockUSDT", "${usdtAddress}");`);
        console.log('// Test registration, withdrawals, etc.');

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Deployment script failed:', error);
        process.exit(1);
    });
