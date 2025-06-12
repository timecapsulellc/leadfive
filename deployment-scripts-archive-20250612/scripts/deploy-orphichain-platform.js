const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * ORPHICHAIN CROWDFUND PLATFORM - UNIFIED DEPLOYMENT SCRIPT
 * 
 * This script deploys the unified Orphichain Crowdfund Platform with:
 * 1. Proper branding alignment with whitepaper
 * 2. Consolidated features from all previous versions
 * 3. Production-ready configuration
 * 4. Comprehensive validation and testing
 * 5. Security best practices
 */

async function main() {
    console.log("🚀 ORPHICHAIN CROWDFUND PLATFORM - UNIFIED DEPLOYMENT");
    console.log("=" .repeat(80));
    
    // Get network information
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);
    
    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`💰 Balance: ${ethers.formatEther(deployerBalance)} ETH/BNB`);
    
    // Determine USDT address based on network
    let usdtAddress;
    if (network.chainId === 56n) {
        // BSC Mainnet
        usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        console.log(`💵 Using BSC Mainnet USDT: ${usdtAddress}`);
    } else if (network.chainId === 97n) {
        // BSC Testnet
        usdtAddress = "0x7ef95a0FEE0Dd31b22626fF2E1d9d0E4C2b8e0d6"; // BSC Testnet USDT
        console.log(`💵 Using BSC Testnet USDT: ${usdtAddress}`);
    } else if (network.chainId === 31337n || network.chainId === 1337n) {
        // Local network - deploy mock USDT
        console.log("🏗️  Deploying Mock USDT for local testing...");
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        usdtAddress = await mockUSDT.getAddress();
        console.log(`💵 Mock USDT deployed: ${usdtAddress}`);
    } else {
        throw new Error(`❌ Unsupported network! Chain ID: ${network.chainId}`);
    }
    
    // Validate USDT contract exists (except for local)
    if (network.chainId !== 31337n && network.chainId !== 1337n) {
        const usdtCode = await ethers.provider.getCode(usdtAddress);
        if (usdtCode === "0x") {
            throw new Error(`❌ USDT contract not found at ${usdtAddress}`);
        }
        console.log("✅ USDT contract validated");
    }
    
    // Pre-deployment configuration
    const deploymentConfig = {
        contractName: "OrphichainCrowdfundPlatform",
        version: "v1.0.0",
        usdtAddress: usdtAddress,
        deployer: deployerAddress,
        network: network.name,
        chainId: Number(network.chainId),
        timestamp: new Date().toISOString(),
        branding: "Orphichain Crowdfund Platform"
    };
    
    console.log("\n📋 DEPLOYMENT CONFIGURATION");
    console.log("-" .repeat(50));
    console.log(`Contract: ${deploymentConfig.contractName}`);
    console.log(`Version: ${deploymentConfig.version}`);
    console.log(`Branding: ${deploymentConfig.branding}`);
    console.log(`USDT: ${deploymentConfig.usdtAddress}`);
    console.log(`Deployer: ${deploymentConfig.deployer}`);
    console.log(`Network: ${deploymentConfig.network}`);
    
    // Get contract factory
    console.log("\n🏗️  PREPARING CONTRACT DEPLOYMENT");
    console.log("-" .repeat(50));
    
    const OrphichainPlatform = await ethers.getContractFactory("OrphichainCrowdfundPlatform");
    
    // Estimate deployment gas
    const deploymentData = OrphichainPlatform.getDeployTransaction(usdtAddress);
    const estimatedGas = await ethers.provider.estimateGas(deploymentData);
    const gasPrice = await ethers.provider.getGasPrice();
    const estimatedCost = estimatedGas * gasPrice;
    
    console.log(`⛽ Estimated Gas: ${estimatedGas.toString()}`);
    console.log(`💰 Gas Price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);
    console.log(`💸 Estimated Cost: ${ethers.formatEther(estimatedCost)} ETH/BNB`);
    
    // Deploy contract
    console.log("\n🚀 DEPLOYING ORPHICHAIN CROWDFUND PLATFORM");
    console.log("-" .repeat(50));
    
    const startTime = Date.now();
    
    const contract = await OrphichainPlatform.deploy(usdtAddress, {
        gasLimit: estimatedGas + BigInt(100000), // Add buffer
        gasPrice: gasPrice
    });
    
    console.log(`📝 Transaction Hash: ${contract.deploymentTransaction().hash}`);
    console.log("⏳ Waiting for deployment confirmation...");
    
    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    const deploymentTime = Date.now() - startTime;
    console.log(`✅ Contract deployed successfully!`);
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`⏱️  Deployment Time: ${deploymentTime}ms`);
    
    // Get deployment transaction details
    const deployTx = await ethers.provider.getTransaction(contract.deploymentTransaction().hash);
    const deployReceipt = await ethers.provider.getTransactionReceipt(contract.deploymentTransaction().hash);
    
    console.log(`⛽ Gas Used: ${deployReceipt.gasUsed.toString()}`);
    console.log(`💰 Actual Cost: ${ethers.formatEther(deployReceipt.gasUsed * deployTx.gasPrice)} ETH/BNB`);
    
    // Post-deployment validation
    console.log("\n✅ POST-DEPLOYMENT VALIDATION");
    console.log("-" .repeat(50));
    
    // Validate contract deployment
    const deployedCode = await ethers.provider.getCode(contractAddress);
    if (deployedCode === "0x") {
        throw new Error("❌ Contract deployment failed - no code at address");
    }
    console.log("✅ Contract code validated");
    
    // Validate contract owner
    const owner = await contract.owner();
    if (owner !== deployerAddress) {
        throw new Error(`❌ Owner mismatch! Expected ${deployerAddress}, got ${owner}`);
    }
    console.log(`✅ Contract owner validated: ${owner}`);
    
    // Validate USDT integration
    const contractUsdtToken = await contract.usdtToken();
    if (contractUsdtToken !== usdtAddress) {
        throw new Error(`❌ USDT mismatch! Expected ${usdtAddress}, got ${contractUsdtToken}`);
    }
    console.log(`✅ USDT integration validated: ${contractUsdtToken}`);
    
    // Validate package configuration
    const packageAmounts = await contract.getPackageAmounts();
    if (packageAmounts.length !== 4) {
        throw new Error(`❌ Package configuration error! Expected 4 packages, got ${packageAmounts.length}`);
    }
    console.log(`✅ Package configuration validated: ${packageAmounts.length} packages`);
    
    // Validate version and branding
    const contractVersion = await contract.version();
    console.log(`✅ Contract version: ${contractVersion}`);
    
    // Test basic functions
    console.log("\n🧪 BASIC FUNCTION TESTING");
    console.log("-" .repeat(50));
    
    try {
        // Test package prices
        for (let i = 1; i <= 4; i++) {
            const packagePrice = await contract.getPackagePrice(i);
            console.log(`✅ Package ${i} price: $${ethers.formatUnits(packagePrice, 6)}`);
        }
        
        // Test platform statistics
        const [totalUsers, totalVolume, poolBalances] = await contract.getPlatformStats();
        console.log(`✅ Platform stats: ${totalUsers} users, $${ethers.formatUnits(totalVolume, 6)} volume`);
        
        // Test user registration status
        const isRegistered = await contract.isUserRegistered(deployerAddress);
        console.log(`✅ Deployer registration status: ${isRegistered}`);
        
        // Test rank requirements
        const [teamSize, volume] = await contract.getRankRequirements(1); // Shining Star
        console.log(`✅ Shining Star requirements: ${teamSize} team, $${ethers.formatUnits(volume, 6)} volume`);
        
    } catch (error) {
        console.error(`❌ Function testing failed: ${error.message}`);
        throw error;
    }
    
    // Save deployment information
    const deploymentInfo = {
        ...deploymentConfig,
        contractAddress,
        transactionHash: contract.deploymentTransaction().hash,
        blockNumber: deployReceipt.blockNumber,
        gasUsed: deployReceipt.gasUsed.toString(),
        actualCost: ethers.formatEther(deployReceipt.gasUsed * deployTx.gasPrice),
        deploymentTime,
        packageAmounts: packageAmounts.map(amount => ethers.formatUnits(amount, 6)),
        validated: true,
        features: [
            "Multi-tier package system ($30, $50, $100, $200)",
            "Binary matrix placement system",
            "Multiple commission pools",
            "Rank advancement system",
            "Secure withdrawal system",
            "Comprehensive earnings tracking",
            "Administrative functions",
            "Security features (reentrancy protection, input validation)"
        ]
    };
    
    // Save to file
    const deploymentFile = `orphichain-deployment-${network.name}-${Date.now()}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n📄 DEPLOYMENT SUMMARY");
    console.log("=" .repeat(80));
    console.log(`✅ Orphichain Crowdfund Platform deployed successfully!`);
    console.log(`📍 Address: ${contractAddress}`);
    console.log(`🔗 Explorer: ${getExplorerUrl(network.chainId, contractAddress)}`);
    console.log(`📝 Transaction: ${getExplorerUrl(network.chainId, contract.deploymentTransaction().hash, 'tx')}`);
    console.log(`💰 Cost: ${deploymentInfo.actualCost} ETH/BNB`);
    console.log(`📄 Details saved: ${deploymentFile}`);
    
    console.log("\n🎯 NEXT STEPS");
    console.log("-" .repeat(50));
    console.log("1. 🔍 Verify contract on block explorer");
    console.log("2. 🧪 Run comprehensive testing");
    console.log("3. 🌐 Update frontend configuration");
    console.log("4. 📢 Update documentation and branding");
    console.log("5. 🚀 Prepare for production launch");
    
    console.log("\n🏆 ORPHICHAIN CROWDFUND PLATFORM FEATURES");
    console.log("-" .repeat(50));
    deploymentInfo.features.forEach((feature, index) => {
        console.log(`${index + 1}. ✅ ${feature}`);
    });
    
    return {
        contractAddress,
        transactionHash: contract.deploymentTransaction().hash,
        deploymentInfo,
        success: true
    };
}

// Helper function to get explorer URL
function getExplorerUrl(chainId, hash, type = 'address') {
    const explorers = {
        1: 'https://etherscan.io',
        56: 'https://bscscan.com',
        97: 'https://testnet.bscscan.com',
        137: 'https://polygonscan.com',
        80001: 'https://mumbai.polygonscan.com'
    };
    
    const baseUrl = explorers[chainId] || 'https://etherscan.io';
    return `${baseUrl}/${type}/${hash}`;
}

// Execute deployment
if (require.main === module) {
    main()
        .then((result) => {
            console.log("\n🎉 ORPHICHAIN CROWDFUND PLATFORM DEPLOYMENT COMPLETED!");
            console.log(`📍 Contract Address: ${result.contractAddress}`);
            console.log(`🔗 Explorer: ${getExplorerUrl(result.deploymentInfo.chainId, result.contractAddress)}`);
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ ORPHICHAIN CROWDFUND PLATFORM DEPLOYMENT FAILED!");
            console.error(`Error: ${error.message}`);
            console.error(error.stack);
            process.exit(1);
        });
}

module.exports = main;
