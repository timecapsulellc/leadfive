const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Deploying OrphiCrowdFund with UUPS Proxy...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying from account:", deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "BNB");
    
    if (balance.lt(ethers.utils.parseEther("0.05"))) {
        throw new Error("❌ Insufficient BNB balance for deployment");
    }

    // BSC Mainnet addresses
    const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
    const TREASURY = process.env.TREASURY_ADDRESS || deployer.address;

    console.log("🔧 Configuration:");
    console.log("- USDT Token:", USDT_BSC);
    console.log("- Treasury:", TREASURY);

    // Get contract factory
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
    
    console.log("📦 Contract size check...");
    const bytecode = OrphiCrowdFund.bytecode;
    const size = Buffer.byteLength(bytecode, 'hex') / 2;
    console.log(`📏 Contract size: ${(size / 1024).toFixed(2)} KB`);
    
    // Deploy with proxy
    console.log("🔄 Deploying implementation and proxy...");
    
    const proxy = await upgrades.deployProxy(
        OrphiCrowdFund,
        [], // Empty initializer args - initialize() will be called
        {
            kind: "uups",
            timeout: 120000,
            gasLimit: 6000000,
            gasPrice: ethers.utils.parseUnits("3", "gwei")
        }
    );

    await proxy.deployed();
    
    console.log("✅ Proxy deployed to:", proxy.address);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxy.address);
    console.log("✅ Implementation deployed to:", implementationAddress);
    
    // Setup initial configuration
    console.log("🔧 Setting up initial configuration...");
    
    try {
        // Set USDT token
        const tx1 = await proxy.setUsdtToken(USDT_BSC);
        await tx1.wait();
        console.log("✅ USDT token configured");
        
        // Set treasury
        const tx2 = await proxy.setTreasury(TREASURY);
        await tx2.wait();
        console.log("✅ Treasury configured");
        
        console.log("🎉 Deployment and setup complete!");
        
        // Summary
        console.log("\n📋 DEPLOYMENT SUMMARY");
        console.log("======================");
        console.log("Proxy Address:", proxy.address);
        console.log("Implementation:", implementationAddress);
        console.log("USDT Token:", USDT_BSC);
        console.log("Treasury:", TREASURY);
        console.log("Network: BSC Mainnet");
        
        console.log("\n🔗 Next Steps:");
        console.log("1. Verify contracts on BSCScan");
        console.log("2. Transfer admin roles to treasury");
        console.log("3. Test basic functions");
        console.log("4. Announce to community");
        
    } catch (error) {
        console.log("⚠️  Deployment successful but setup failed:", error.message);
        console.log("💡 You can complete setup manually using the proxy address:", proxy.address);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
