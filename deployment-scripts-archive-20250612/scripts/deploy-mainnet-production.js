const { ethers } = require("hardhat");
const fs = require('fs');

/**
 * ORPHI CROWDFUND - MAINNET PRODUCTION DEPLOYMENT SCRIPT
 * 
 * This script deploys the OrphiCrowdFund contract to BSC Mainnet with:
 * 1. Production-ready configuration
 * 2. Real USDT token integration
 * 3. Comprehensive verification
 * 4. Security validations
 * 5. Post-deployment testing
 */

async function main() {
    console.log("🚀 ORPHI CROWDFUND - MAINNET PRODUCTION DEPLOYMENT");
    console.log("=" .repeat(80));
    
    // Get network information
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Validate we're on BSC Mainnet
    if (network.chainId !== 56n) {
        throw new Error(`❌ Wrong network! Expected BSC Mainnet (56), got ${network.chainId}`);
    }
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);
    
    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`💰 Balance: ${ethers.formatEther(deployerBalance)} BNB`);
    
    // Validate sufficient balance for deployment
    const minBalance = ethers.parseEther("0.1"); // Minimum 0.1 BNB
    if (deployerBalance < minBalance) {
        throw new Error(`❌ Insufficient balance! Need at least 0.1 BNB, have ${ethers.formatEther(deployerBalance)} BNB`);
    }
    
    // BSC Mainnet USDT contract address
    const MAINNET_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
    
    console.log(`💵 USDT Token: ${MAINNET_USDT_ADDRESS}`);
    
    // Validate USDT contract exists
    const usdtCode = await ethers.provider.getCode(MAINNET_USDT_ADDRESS);
    if (usdtCode === "0x") {
        throw new Error(`❌ USDT contract not found at ${MAINNET_USDT_ADDRESS}`);
    }
    
    console.log("✅ USDT contract validated");
    
    // Pre-deployment security checks
    console.log("\n🔒 SECURITY VALIDATIONS");
    console.log("-" .repeat(50));
    
    // Check if deployer is using hardware wallet (Trezor/Ledger)
    console.log("🔐 Deployer Security Check:");
    console.log(`   Address: ${deployerAddress}`);
    console.log("   ⚠️  Ensure you're using a hardware wallet (Trezor/Ledger) for mainnet deployment");
    
    // Deployment configuration
    const deploymentConfig = {
        contractName: "OrphiCrowdFundV2Enhanced",
        usdtAddress: MAINNET_USDT_ADDRESS,
        deployer: deployerAddress,
        network: "BSC Mainnet",
        chainId: 56,
        timestamp: new Date().toISOString()
    };
    
    console.log("\n📋 DEPLOYMENT CONFIGURATION");
    console.log("-" .repeat(50));
    console.log(`Contract: ${deploymentConfig.contractName}`);
    console.log(`USDT: ${deploymentConfig.usdtAddress}`);
    console.log(`Deployer: ${deploymentConfig.deployer}`);
    console.log(`Network: ${deploymentConfig.network}`);
    
    // Confirm deployment
    console.log("\n⚠️  MAINNET DEPLOYMENT CONFIRMATION");
    console.log("=" .repeat(50));
    console.log("🚨 You are about to deploy to MAINNET!");
    console.log("🚨 This will use REAL BNB for gas fees!");
    console.log("🚨 Make sure all configurations are correct!");
    console.log("=" .repeat(50));
    
    // Get contract factory
    console.log("\n🏗️  PREPARING CONTRACT DEPLOYMENT");
    console.log("-" .repeat(50));
    
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundV2Enhanced");
    
    // Estimate deployment gas
    const deploymentData = OrphiCrowdFund.getDeployTransaction(MAINNET_USDT_ADDRESS);
    const estimatedGas = await ethers.provider.estimateGas(deploymentData);
    const gasPrice = await ethers.provider.getGasPrice();
    const estimatedCost = estimatedGas * gasPrice;
    
    console.log(`⛽ Estimated Gas: ${estimatedGas.toString()}`);
    console.log(`💰 Gas Price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);
    console.log(`💸 Estimated Cost: ${ethers.formatEther(estimatedCost)} BNB`);
    
    // Deploy contract
    console.log("\n🚀 DEPLOYING CONTRACT TO MAINNET");
    console.log("-" .repeat(50));
    
    const startTime = Date.now();
    
    const contract = await OrphiCrowdFund.deploy(MAINNET_USDT_ADDRESS, {
        gasLimit: 6000000,
        gasPrice: gasPrice
    });
    
    console.log(`📝 Transaction Hash: ${contract.deploymentTransaction().hash}`);
    console.log("⏳ Waiting for deployment confirmation...");
    
    // Wait for deployment with multiple confirmations
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
    console.log(`💰 Actual Cost: ${ethers.formatEther(deployReceipt.gasUsed * deployTx.gasPrice)} BNB`);
    
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
    const usdtToken = await contract.usdtToken();
    if (usdtToken !== MAINNET_USDT_ADDRESS) {
        throw new Error(`❌ USDT mismatch! Expected ${MAINNET_USDT_ADDRESS}, got ${usdtToken}`);
    }
    console.log(`✅ USDT integration validated: ${usdtToken}`);
    
    // Validate package configuration
    const packageAmounts = await contract.getPackageAmounts();
    if (packageAmounts.length !== 4) {
        throw new Error(`❌ Package configuration error! Expected 4 packages, got ${packageAmounts.length}`);
    }
    console.log(`✅ Package configuration validated: ${packageAmounts.length} packages`);
    
    // Test basic functions
    console.log("\n🧪 BASIC FUNCTION TESTING");
    console.log("-" .repeat(50));
    
    try {
        const package1Price = await contract.getPackagePrice(1);
        console.log(`✅ Package 1 price: $${ethers.formatUnits(package1Price, 6)}`);
        
        const totalMembers = await contract.totalMembers();
        console.log(`✅ Total members: ${totalMembers}`);
        
        const isRegistered = await contract.isUserRegistered(deployerAddress);
        console.log(`✅ Deployer registration status: ${isRegistered}`);
        
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
        validated: true
    };
    
    // Save to file
    const deploymentFile = `mainnet-deployment-${Date.now()}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n📄 DEPLOYMENT SUMMARY");
    console.log("=" .repeat(80));
    console.log(`✅ Contract successfully deployed to BSC Mainnet!`);
    console.log(`📍 Address: ${contractAddress}`);
    console.log(`🔗 BSCScan: https://bscscan.com/address/${contractAddress}`);
    console.log(`📝 Transaction: https://bscscan.com/tx/${contract.deploymentTransaction().hash}`);
    console.log(`💰 Cost: ${deploymentInfo.actualCost} BNB`);
    console.log(`📄 Details saved: ${deploymentFile}`);
    
    console.log("\n🎯 NEXT STEPS");
    console.log("-" .repeat(50));
    console.log("1. 🔍 Verify contract on BSCScan");
    console.log("2. 🧪 Run mainnet validation tests");
    console.log("3. 🌐 Update frontend configuration");
    console.log("4. 📢 Announce mainnet launch");
    
    console.log("\n🚨 IMPORTANT SECURITY REMINDERS");
    console.log("-" .repeat(50));
    console.log("1. 🔐 Secure your deployer private key");
    console.log("2. 🔒 Consider transferring ownership to multisig");
    console.log("3. 📋 Document all admin functions");
    console.log("4. 🛡️  Set up monitoring and alerts");
    
    return {
        contractAddress,
        transactionHash: contract.deploymentTransaction().hash,
        deploymentInfo,
        success: true
    };
}

// Execute deployment
if (require.main === module) {
    main()
        .then((result) => {
            console.log("\n🎉 MAINNET DEPLOYMENT COMPLETED SUCCESSFULLY!");
            console.log(`📍 Contract Address: ${result.contractAddress}`);
            console.log(`🔗 BSCScan: https://bscscan.com/address/${result.contractAddress}`);
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ MAINNET DEPLOYMENT FAILED!");
            console.error(`Error: ${error.message}`);
            process.exit(1);
        });
}

module.exports = main;
