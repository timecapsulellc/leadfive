const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 DEPLOYING ORPHI CROWDFUND WITH ALL FEATURES...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploy Mock USDT for testing
    console.log("\n📄 Deploying Mock USDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();
    console.log("✅ Mock USDT deployed at:", mockUSDT.address);

    // Deploy Mock Oracle
    console.log("\n🔮 Deploying Mock Price Oracle...");
    const MockOracle = await ethers.getContractFactory("MockPriceOracle");
    const mockOracle = await MockOracle.deploy();
    await mockOracle.deployed();
    console.log("✅ Mock Oracle deployed at:", mockOracle.address);

    // Set initial BNB/USD price (e.g., $300)
    await mockOracle.setPrice(ethers.utils.parseEther("300"));
    console.log("📊 Oracle price set to $300 per BNB");

    // Deploy OrphiCrowdFund as upgradeable proxy
    console.log("\n🏗️  Deploying OrphiCrowdFund (Upgradeable)...");
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
    
    const treasuryAddress = deployer.address; // You can change this
    const matrixRootAddress = deployer.address; // Root user address
    
    const orphiContract = await upgrades.deployProxy(
        OrphiCrowdFund,
        [
            mockUSDT.address,
            treasuryAddress,
            matrixRootAddress,
            mockOracle.address
        ],
        {
            initializer: "initialize",
            kind: "uups"
        }
    );
    
    await orphiContract.deployed();
    console.log("✅ OrphiCrowdFund deployed at:", orphiContract.address);

    // Grant USDT allowance for testing
    console.log("\n💰 Setting up USDT allowances...");
    const mintAmount = ethers.utils.parseEther("1000000"); // 1M USDT for testing
    await mockUSDT.mint(deployer.address, mintAmount);
    await mockUSDT.approve(orphiContract.address, mintAmount);
    console.log("✅ Minted and approved 1M USDT for testing");

    // Register root user (admin privilege)
    console.log("\n👑 Registering root user...");
    await orphiContract.registerRootUser();
    console.log("✅ Root user registered successfully");

    // Set up upgrade multisig (demonstration)
    console.log("\n🔐 Setting up upgrade multisig...");
    const signers = [deployer.address]; // Add more addresses for production
    await orphiContract.setupUpgradeMultiSig(signers, 1);
    console.log("✅ Upgrade multisig configured");

    // Test all 8 package tiers
    console.log("\n📦 Verifying all package tiers...");
    for (let i = 0; i < 8; i++) {
        const packageInfo = await orphiContract.getPackage(i);
        console.log(`Package ${i}: $${ethers.utils.formatEther(packageInfo.amount)} - Active: ${packageInfo.isActive}`);
    }

    // Display contract statistics
    console.log("\n📊 INITIAL CONTRACT STATS:");
    const stats = await orphiContract.getContractStats();
    console.log("Total Users:", stats._totalUsers.toString());
    console.log("Total Investment:", ethers.utils.formatEther(stats._totalInvestment), "ETH");
    console.log("Global Help Pool Balance:", ethers.utils.formatEther(stats._ghpBalance), "ETH");
    console.log("Leader Pool Balance:", ethers.utils.formatEther(stats._leaderPoolBalance), "ETH");

    // Save deployment information
    const deploymentInfo = {
        network: await ethers.provider.getNetwork(),
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            OrphiCrowdFund: orphiContract.address,
            MockUSDT: mockUSDT.address,
            MockOracle: mockOracle.address
        },
        features: {
            packages: 8,
            sponsorCommission: "40%",
            levelBonuses: "10% (10 levels)",
            globalHelpPool: "30%",
            leaderBonusPool: "10%",
            withdrawalRates: ["70%", "75%", "80%"],
            earningsCap: "4x investment",
            upgradeable: true,
            accessControl: true,
            dualCurrency: true
        }
    };

    fs.writeFileSync(
        "deployment-info.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("📄 Deployment info saved to deployment-info.json");
    console.log("\n🔗 Contract Addresses:");
    console.log("OrphiCrowdFund:", orphiContract.address);
    console.log("Mock USDT:", mockUSDT.address);
    console.log("Mock Oracle:", mockOracle.address);
    
    console.log("\n🚀 Ready for testing and interaction!");
    console.log("Next steps:");
    console.log("1. Run comprehensive tests: npx hardhat test");
    console.log("2. Verify contracts: npx hardhat verify");
    console.log("3. Test user registration and compensation");

    return {
        orphiContract,
        mockUSDT,
        mockOracle,
        deployer
    };
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;
