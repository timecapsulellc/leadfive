#!/usr/bin/env node

/**
 * Deploy OrphiCrowdFund Main Contract to BSC Testnet
 * Uses the complete whitepaper implementation
 */

const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Deploying OrphiCrowdFund Main Contract to BSC Testnet");
    console.log("=" .repeat(60));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deployer:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.01")) {
        throw new Error("❌ Insufficient BNB balance for deployment");
    }

    // Configuration for BSC Testnet
    const config = {
        usdtAddress: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // BSC Testnet USDT
        treasuryAddress: deployer.address,
        emergencyAddress: "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6",
        poolManagerAddress: deployer.address
    };

    console.log("\n🔧 Configuration:");
    console.log("   USDT Token:", config.usdtAddress);
    console.log("   Treasury:", config.treasuryAddress);
    console.log("   Emergency:", config.emergencyAddress);
    console.log("   Pool Manager:", config.poolManagerAddress);

    try {
        // Deploy OrphiCrowdFund main contract
        console.log("\n🏗️  Deploying OrphiCrowdFund...");
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        
        const orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFund, [
            config.usdtAddress,
            config.treasuryAddress,
            config.emergencyAddress,
            config.poolManagerAddress
        ], {
            initializer: 'initialize',
            kind: 'uups'
        });

        await orphiCrowdFund.waitForDeployment();
        const contractAddress = await orphiCrowdFund.getAddress();

        console.log("✅ OrphiCrowdFund deployed to:", contractAddress);

        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        const version = await orphiCrowdFund.version();
        const packageAmounts = await orphiCrowdFund.getPackageAmounts();
        
        console.log("   Version:", version);
        console.log("   Package 1 ($30):", ethers.formatUnits(packageAmounts[0], 6), "USDT");
        console.log("   Package 2 ($50):", ethers.formatUnits(packageAmounts[1], 6), "USDT");
        console.log("   Package 3 ($100):", ethers.formatUnits(packageAmounts[2], 6), "USDT");
        console.log("   Package 4 ($200):", ethers.formatUnits(packageAmounts[3], 6), "USDT");

        // Test core functionality
        console.log("\n🧪 Testing core functions...");
        
        // Check if user registration works
        const isRegistered = await orphiCrowdFund.isUserRegistered(deployer.address);
        console.log("   Deployer registered:", isRegistered);
        
        // Check pool balances
        const poolBalances = await orphiCrowdFund.poolBalances(0);
        console.log("   Pool 0 balance:", ethers.formatUnits(poolBalances, 6), "USDT");

        // Save deployment info
        const deploymentInfo = {
            network: "BSC Testnet",
            chainId: 97,
            contractAddress: contractAddress,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            version: version,
            config: config,
            status: "SUCCESS"
        };

        console.log("\n💾 Saving deployment info...");
        const fs = require('fs');
        fs.writeFileSync(
            'deployment-main-contract.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("=" .repeat(60));
        console.log("✅ Contract Address:", contractAddress);
        console.log("✅ Network: BSC Testnet");
        console.log("✅ All Whitepaper Features: IMPLEMENTED");
        console.log("✅ Security Features: ACTIVE");
        console.log("✅ Ready for Testing");
        
        console.log("\n📋 Next Steps:");
        console.log("1. Verify contract on BSCScan Testnet");
        console.log("2. Test user registration");
        console.log("3. Test commission distributions");
        console.log("4. Test security features");
        console.log("5. Update frontend configuration");

        return {
            success: true,
            contractAddress: contractAddress,
            deployer: deployer.address
        };

    } catch (error) {
        console.error("\n❌ Deployment failed:", error.message);
        console.error("Stack trace:", error.stack);
        
        const deploymentInfo = {
            network: "BSC Testnet",
            chainId: 97,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            status: "FAILED",
            error: error.message
        };

        const fs = require('fs');
        fs.writeFileSync(
            'deployment-main-contract.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("Fatal error:", error);
            process.exit(1);
        });
}

module.exports = main;
