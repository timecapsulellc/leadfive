const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

/**
 * 🚀 ORPHI CROWDFUND SIMPLE MAINNET DEPLOYMENT
 * 
 * This script deploys to BSC Mainnet using only .env configuration
 * Immediately transfers ownership to MetaMask admin for security
 */

async function main() {
    console.log("🚀 ORPHI CROWDFUND MAINNET DEPLOYMENT STARTING...");
    console.log("═".repeat(60));
    
    // Validate environment variables
    const requiredEnvVars = [
        'DEPLOYER_PRIVATE_KEY',
        'METAMASK_ADMIN_WALLET',
        'USDT_MAINNET',
        'BSCSCAN_API_KEY'
    ];
    
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar] || process.env[envVar].includes('YOUR_') || process.env[envVar].includes('your_')) {
            throw new Error(`❌ Missing or invalid ${envVar} in .env file`);
        }
    }
    
    // Get configuration from .env
    const config = {
        usdtAddress: process.env.USDT_MAINNET,
        metamaskAdmin: process.env.METAMASK_ADMIN_WALLET,
        treasuryAddress: process.env.TREASURY_ADDRESS,
        emergencyAddress: process.env.EMERGENCY_ADDRESS,
        poolManagerAddress: process.env.POOL_MANAGER_ADDRESS,
        gasPrice: process.env.GAS_PRICE || "3000000000",
        gasLimit: parseInt(process.env.GAS_LIMIT) || 6000000
    };
    
    console.log("📋 DEPLOYMENT CONFIGURATION:");
    console.log(`   • USDT Address: ${config.usdtAddress}`);
    console.log(`   • MetaMask Admin: ${config.metamaskAdmin}`);
    console.log(`   • Treasury: ${config.treasuryAddress}`);
    console.log(`   • Emergency: ${config.emergencyAddress}`);
    console.log(`   • Pool Manager: ${config.poolManagerAddress}`);
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    
    console.log(`\n👤 Deployer: ${deployerAddress}`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    const balanceBNB = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceBNB} BNB`);
    
    if (parseFloat(balanceBNB) < 0.1) {
        throw new Error(`❌ Insufficient balance! Need at least 0.1 BNB, have ${balanceBNB} BNB`);
    }
    
    // Validate network
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 56n) {
        console.log("⚠️  Warning: Not on BSC Mainnet, but proceeding with deployment...");
    }
    
    // Deploy contract
    console.log("\n🏗️  DEPLOYING CONTRACT...");
    
    const ContractFactory = await ethers.getContractFactory("OrphiCrowdFund");
    
    const initArgs = [
        config.usdtAddress,
        [30000000, 50000000, 100000000, 200000000, 300000000] // Package amounts in USDT (6 decimals)
    ];
    
    console.log("🔄 Deploying UUPS proxy...");
    
    const contract = await upgrades.deployProxy(
        ContractFactory,
        initArgs,
        {
            initializer: "initialize",
            kind: "uups",
            gasLimit: config.gasLimit,
            gasPrice: config.gasPrice
        }
    );
    
    console.log("⏳ Waiting for deployment...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`✅ Contract deployed at: ${contractAddress}`);
    
    // Wait for confirmations
    console.log("⏳ Waiting for confirmations...");
    const deployTx = contract.deploymentTransaction();
    const receipt = await deployTx.wait(5);
    
    console.log(`📦 Block: ${receipt.blockNumber}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toLocaleString()}`);
    
    // Verify ownership transfer is needed
    console.log("\n🔐 CHECKING OWNERSHIP...");
    const currentOwner = await contract.owner();
    console.log(`👑 Current Owner: ${currentOwner}`);
    
    if (currentOwner.toLowerCase() !== config.metamaskAdmin.toLowerCase()) {
        console.log("🔄 Transferring ownership to MetaMask admin...");
        
        const transferTx = await contract.transferOwnership(config.metamaskAdmin, {
            gasLimit: 100000,
            gasPrice: config.gasPrice
        });
        
        console.log("⏳ Waiting for ownership transfer...");
        await transferTx.wait();
        
        // Verify transfer
        const newOwner = await contract.owner();
        if (newOwner.toLowerCase() === config.metamaskAdmin.toLowerCase()) {
            console.log("✅ Ownership successfully transferred!");
        } else {
            console.log("❌ Ownership transfer failed!");
            throw new Error("Ownership transfer verification failed");
        }
    } else {
        console.log("✅ Contract already owned by MetaMask admin");
    }
    
    // Verify contract configuration
    console.log("\n🔍 VERIFYING CONTRACT CONFIGURATION...");
    
    const usdtToken = await contract.usdtToken();
    console.log(`💵 USDT Token: ${usdtToken}`);
    
    if (usdtToken.toLowerCase() !== config.usdtAddress.toLowerCase()) {
        throw new Error("❌ USDT address mismatch!");
    }
    
    // Check package amounts
    const packageAmounts = await contract.getPackageAmounts();
    console.log("📦 Package Amounts:");
    
    const expectedAmounts = [30000000, 50000000, 100000000, 200000000]; // 6 decimals
    for (let i = 0; i < packageAmounts.length; i++) {
        const amount = Number(packageAmounts[i]);
        const usdAmount = amount / 1000000;
        console.log(`   Package ${i + 1}: $${usdAmount} USDT`);
        
        if (amount !== expectedAmounts[i]) {
            throw new Error(`❌ Package ${i + 1} amount incorrect!`);
        }
    }
    
    // Contract verification
    if (process.env.VERIFY_ON_BSCSCAN === 'true') {
        console.log("\n🔍 VERIFYING ON BSCSCAN...");
        
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: []
            });
            console.log("✅ Contract verified on BSCScan!");
        } catch (error) {
            console.log(`⚠️  Verification failed: ${error.message}`);
            console.log("💡 You can verify manually later");
        }
    }
    
    // Save deployment info
    const deploymentData = {
        timestamp: new Date().toISOString(),
        network: "BSC Mainnet",
        chainId: Number(network.chainId),
        contractAddress: contractAddress,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        deployer: deployerAddress,
        owner: config.metamaskAdmin,
        gasUsed: Number(receipt.gasUsed),
        packages: ["$30", "$50", "$100", "$200"],
        usdtAddress: config.usdtAddress,
        verified: process.env.VERIFY_ON_BSCSCAN === 'true'
    };
    
    const fs = require("fs");
    const deploymentFile = `mainnet-deployment-${Date.now()}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    
    // Final summary
    console.log("\n" + "═".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("═".repeat(60));
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`👑 Owner: ${config.metamaskAdmin}`);
    console.log(`🔗 BSCScan: https://bscscan.com/address/${contractAddress}`);
    console.log(`📄 Deployment saved: ${deploymentFile}`);
    
    console.log("\n🎯 NEXT STEPS:");
    console.log("1. ✅ Contract deployed and secured");
    console.log("2. 🔄 Update frontend with contract address");
    console.log("3. 🧪 Test all functions");
    console.log("4. 📢 Announce launch");
    
    console.log("\n🚀 CONTRACT IS LIVE ON BSC MAINNET!");
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => {
            console.log("\n✅ Deployment script completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Deployment failed:", error.message);
            process.exit(1);
        });
}

module.exports = main;
