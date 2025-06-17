const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Starting BSC Testnet Deployment of OrphiCrowdFund...\n");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("🔑 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB\n");

    try {
        // Deploy OrphiCrowdFund with proxy
        console.log("📦 Deploying OrphiCrowdFund...");
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        
        console.log("🔄 Deploying proxy contract...");
        const contract = await upgrades.deployProxy(OrphiCrowdFund, [], {
            initializer: "initialize",
            kind: "uups"
        });
        
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        console.log("✅ OrphiCrowdFund deployed to:", contractAddress);
        
        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
        console.log("📄 Implementation address:", implementationAddress);
        
        // Set up initial packages
        console.log("\n🔧 Setting up initial packages...");
        
        const packageConfigs = [
            { tier: 1, amount: ethers.parseEther("0.05"), bnb: ethers.parseEther("0.05"), usdt: ethers.parseUnits("300", 18) },
            { tier: 2, amount: ethers.parseEther("0.08"), bnb: ethers.parseEther("0.08"), usdt: ethers.parseUnits("500", 18) },
            { tier: 3, amount: ethers.parseEther("0.17"), bnb: ethers.parseEther("0.17"), usdt: ethers.parseUnits("1000", 18) },
            { tier: 4, amount: ethers.parseEther("0.33"), bnb: ethers.parseEther("0.33"), usdt: ethers.parseUnits("2000", 18) }
        ];
        
        for (const pkg of packageConfigs) {
            try {
                await contract.updatePackage(pkg.tier, pkg.amount, pkg.bnb, pkg.usdt, true);
                console.log(`✅ Package ${pkg.tier} configured: ${ethers.formatEther(pkg.amount)} BNB`);
            } catch (error) {
                console.log(`⚠️ Package ${pkg.tier} configuration failed:`, error.message);
            }
        }
        
        // Register root user (deployer)
        console.log("\n👑 Registering root user...");
        try {
            await contract.registerRootUser(deployer.address, 1); // Package tier 1
            console.log("✅ Root user registered:", deployer.address);
        } catch (error) {
            console.log("⚠️ Root user registration failed:", error.message);
        }
        
        console.log("\n🎉 Deployment completed successfully!");
        console.log("📋 Contract Details:");
        console.log("   - Proxy Address:", contractAddress);
        console.log("   - Implementation:", implementationAddress);
        console.log("   - Network: BSC Testnet");
        console.log("   - Deployer:", deployer.address);
        
        // Save deployment info
        const fs = require('fs');
        const deploymentInfo = {
            network: "bsc_testnet",
            proxyAddress: contractAddress,
            implementationAddress: implementationAddress,
            deployer: deployer.address,
            deployedAt: new Date().toISOString(),
            packages: packageConfigs
        };
        
        fs.writeFileSync(
            './deployment-info-testnet.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log("💾 Deployment info saved to deployment-info-testnet.json");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
