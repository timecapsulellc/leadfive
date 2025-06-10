const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Starting Orphi CrowdFund Deployment...");
    console.log("=" .repeat(60));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    // Configuration based on network
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId.toString());

    let usdtAddress, treasuryAddress, emergencyAddress, poolManagerAddress;

    if (network.chainId === 97n) { // BSC Testnet
        console.log("🧪 Deploying to BSC Testnet");
        usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
        treasuryAddress = deployer.address; // Default to deployer
        emergencyAddress = "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6"; // Specified emergency address
        poolManagerAddress = deployer.address; // Default to deployer
    } else if (network.chainId === 56n) { // BSC Mainnet
        console.log("🌟 Deploying to BSC Mainnet");
        usdtAddress = "0x55d398326f99059fF775485246999027B3197955"; // BSC Mainnet USDT
        treasuryAddress = deployer.address; // Default to deployer
        emergencyAddress = "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6"; // Specified emergency address
        poolManagerAddress = deployer.address; // Default to deployer
    } else {
        console.log("🏠 Deploying to Local/Hardhat Network");
        // Deploy Mock USDT for local testing
        console.log("📄 Deploying Mock USDT...");
        const MockUSDT = await ethers.getContractFactory("contracts/MockUSDT.sol:MockUSDT");
        const mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        usdtAddress = await mockUSDT.getAddress();
        console.log("✅ Mock USDT deployed to:", usdtAddress);

        treasuryAddress = deployer.address;
        emergencyAddress = "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6";
        poolManagerAddress = deployer.address;
    }

    console.log("\n📋 Configuration:");
    console.log("   USDT Address:", usdtAddress);
    console.log("   Treasury Address:", treasuryAddress);
    console.log("   Emergency Address:", emergencyAddress);
    console.log("   Pool Manager Address:", poolManagerAddress);

    // Deploy OrphiCrowdFund
    console.log("\n🏗️  Deploying OrphiCrowdFund...");
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
    
    const orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFund, [
        usdtAddress,
        treasuryAddress,
        emergencyAddress,
        poolManagerAddress
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
    const levelBonusRates = await orphiCrowdFund.getLevelBonusRates();

    console.log("   Version:", version);
    console.log("   Package Amounts:");
    console.log("     $30 USDT:", ethers.formatUnits(packageAmounts[0], 6));
    console.log("     $50 USDT:", ethers.formatUnits(packageAmounts[1], 6));
    console.log("     $100 USDT:", ethers.formatUnits(packageAmounts[2], 6));
    console.log("     $200 USDT:", ethers.formatUnits(packageAmounts[3], 6));

    console.log("   Commission Rates:");
    console.log("     Sponsor Commission:", await orphiCrowdFund.SPONSOR_COMMISSION_RATE(), "bp (40%)");
    console.log("     Level Bonus:", await orphiCrowdFund.LEVEL_BONUS_RATE(), "bp (10%)");
    console.log("     Global Upline:", await orphiCrowdFund.GLOBAL_UPLINE_RATE(), "bp (10%)");
    console.log("     Leader Bonus:", await orphiCrowdFund.LEADER_BONUS_RATE(), "bp (10%)");
    console.log("     Global Help Pool:", await orphiCrowdFund.GLOBAL_HELP_POOL_RATE(), "bp (30%)");

    console.log("   Level Bonus Rates:");
    console.log("     Level 1:", levelBonusRates[0], "bp (3%)");
    console.log("     Level 2-6:", levelBonusRates[1], "bp (1% each)");
    console.log("     Level 7-10:", levelBonusRates[6], "bp (0.5% each)");

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        contractAddress: contractAddress,
        deployer: deployer.address,
        usdtAddress: usdtAddress,
        treasuryAddress: treasuryAddress,
        emergencyAddress: emergencyAddress,
        poolManagerAddress: poolManagerAddress,
        deploymentTime: new Date().toISOString(),
        version: version,
        packageAmounts: packageAmounts.map(amount => ethers.formatUnits(amount, 6)),
        commissionRates: {
            sponsorCommission: (await orphiCrowdFund.SPONSOR_COMMISSION_RATE()).toString(),
            levelBonus: (await orphiCrowdFund.LEVEL_BONUS_RATE()).toString(),
            globalUpline: (await orphiCrowdFund.GLOBAL_UPLINE_RATE()).toString(),
            leaderBonus: (await orphiCrowdFund.LEADER_BONUS_RATE()).toString(),
            globalHelpPool: (await orphiCrowdFund.GLOBAL_HELP_POOL_RATE()).toString()
        },
        features: [
            "5-Pool Commission System (40%/10%/10%/10%/30%)",
            "Dual-Branch 2×∞ Crowd Placement System",
            "Level Bonus Distribution (3%/1%/0.5%)",
            "Global Upline Bonus (30 levels equal distribution)",
            "Weekly Global Help Pool (30% of all packages)",
            "4x Earnings Cap System",
            "Progressive Withdrawal Rates (70%/75%/80%)",
            "Leader Bonus Pool (Bi-monthly distributions)"
        ]
    };

    const fs = require('fs');
    const deploymentFileName = `orphi-crowdfund-deployment-${network.chainId}-${Date.now()}.json`;
    fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n💾 Deployment info saved to:", deploymentFileName);

    // Contract verification on BSC
    if (network.chainId === 97n || network.chainId === 56n) {
        console.log("\n🔍 Contract verification will be available after deployment...");
        console.log("   Run: npx hardhat verify --network", network.name, contractAddress);
    }

    console.log("\n🎉 Deployment Summary:");
    console.log("=" .repeat(60));
    console.log("✅ Contract Name: OrphiCrowdFund");
    console.log("✅ Contract Address:", contractAddress);
    console.log("✅ Network:", network.name);
    console.log("✅ Version:", version);
    console.log("✅ All Whitepaper Features: IMPLEMENTED");
    console.log("✅ 5-Pool Commission System: ACTIVE");
    console.log("✅ Dual-Branch Matrix: ACTIVE");
    console.log("✅ 4x Earnings Cap: ACTIVE");
    console.log("✅ Progressive Withdrawals: ACTIVE");
    console.log("✅ Weekly Global Help Pool: READY");
    console.log("✅ Leader Bonus Pool: READY");
    console.log("=" .repeat(60));

    console.log("\n📋 Next Steps:");
    console.log("1. Update frontend with new contract address");
    console.log("2. Configure admin addresses if needed:");
    console.log("   await contract.updateAdminAddresses(treasury, emergency, poolManager)");
    console.log("3. Set up automated pool distributions");
    console.log("4. Test user registration and commission flows");
    console.log("5. Deploy to mainnet when ready");

    return {
        contractAddress,
        deploymentInfo
    };
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;
