const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Starting LeadFive Final Contract Deployment to BSC Testnet...");
    
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    
    // Get account balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.05")) {
        throw new Error("❌ Insufficient BNB balance. Need at least 0.05 BNB for deployment.");
    }

    // BSC Testnet contract addresses
    const USDT_TESTNET = "0x55d398326f99059fF775485246999027B3197955"; // BSC Testnet USDT
    const MOCK_ORACLE = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BSC Testnet BNB/USD Price Feed
    
    console.log("🔍 Using USDT address:", USDT_TESTNET);
    console.log("🔍 Using Oracle address:", MOCK_ORACLE);

    try {
        // Deploy the LeadFive contract as upgradeable proxy
        console.log("\n📦 Deploying LeadFive Contract...");
        
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [USDT_TESTNET, MOCK_ORACLE],
            {
                initializer: "initialize",
                kind: "uups",
                timeout: 0,
            }
        );
        
        await leadFive.waitForDeployment();
        const contractAddress = await leadFive.getAddress();
        
        console.log("✅ LeadFive deployed to:", contractAddress);
        
        // Verify the deployment
        console.log("\n🔍 Verifying deployment...");
        
        const totalUsers = await leadFive.getTotalUsers();
        const owner = await leadFive.owner();
        const packagePrice = await leadFive.getPackagePrice(1);
        
        console.log("👥 Total users:", totalUsers.toString());
        console.log("👑 Owner:", owner);
        console.log("💵 Package 1 price:", ethers.formatUnits(packagePrice, 6), "USDT");
        
        // Check if deployer is admin
        const isAdmin = await leadFive.isAdmin(deployer.address);
        console.log("🔑 Deployer is admin:", isAdmin);
        
        console.log("\n✅ Deployment completed successfully!");
        console.log("📝 Contract Summary:");
        console.log("   - Contract Address:", contractAddress);
        console.log("   - Network: BSC Testnet");
        console.log("   - Owner:", owner);
        console.log("   - USDT Token:", USDT_TESTNET);
        console.log("   - Oracle:", MOCK_ORACLE);
        
        // Save deployment info
        const deploymentInfo = {
            network: "BSC Testnet",
            contractAddress: contractAddress,
            owner: owner,
            deployer: deployer.address,
            usdtToken: USDT_TESTNET,
            oracle: MOCK_ORACLE,
            timestamp: new Date().toISOString(),
            transactionHash: leadFive.deploymentTransaction()?.hash,
            blockNumber: await ethers.provider.getBlockNumber()
        };
        
        const fs = require('fs');
        fs.writeFileSync(
            'leadfive-final-deployment.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("💾 Deployment info saved to leadfive-final-deployment.json");
        
        return {
            success: true,
            contractAddress: contractAddress,
            owner: owner
        };
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.reason) {
            console.error("📋 Reason:", error.reason);
        }
        if (error.data) {
            console.error("📋 Data:", error.data);
        }
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then((result) => {
            console.log("🎉 Deployment successful!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Deployment error:", error);
            process.exit(1);
        });
}

module.exports = main;
