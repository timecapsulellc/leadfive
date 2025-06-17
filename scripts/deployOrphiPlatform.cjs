const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("╔═══════════════════════════════════════════════════════════════════════════════════════╗");
    console.log("║                                                                                       ║");
    console.log("║     ██████╗ ██████╗ ██████╗ ██╗  ██╗██╗     ██████╗██████╗  ██████╗ ██╗    ██╗██████╗ ║");
    console.log("║    ██╔═══██╗██╔══██╗██╔══██╗██║  ██║██║    ██╔════╝██╔══██╗██╔═══██╗██║    ██║██╔══██╗║");
    console.log("║    ██║   ██║██████╔╝██████╔╝███████║██║    ██║     ██████╔╝██║   ██║██║ █╗ ██║██║  ██║║");
    console.log("║    ██║   ██║██╔══██╗██╔═══╝ ██╔══██║██║    ██║     ██╔══██╗██║   ██║██║███╗██║██║  ██║║");
    console.log("║    ╚██████╔╝██║  ██║██║     ██║  ██║██║    ╚██████╗██║  ██║╚██████╔╝╚███╔███╔╝██████╔╝║");
    console.log("║     ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝     ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝ ╚═════╝ ║");
    console.log("║                                                                                       ║");
    console.log("║                        ◆ ORPHI CROWDFUND PLATFORM ◆                                  ║");
    console.log("║                   ◇ Dual-Branch Progressive Reward Network ◇                         ║");
    console.log("║                                                                                       ║");
    console.log("╚═══════════════════════════════════════════════════════════════════════════════════════╝");
    console.log("");
    console.log("🚀 DEPLOYING NEW ORPHI CROWDFUND PLATFORM TO BSC MAINNET");
    console.log("═".repeat(80));
    
    // Get configuration
    const adminAddress = process.env.METAMASK_ADMIN_WALLET;
    const treasuryAddress = process.env.TREASURY_ADDRESS;
    const distributorAddress = process.env.DISTRIBUTOR_ADDRESS;
    const platformAddress = process.env.PLATFORM_ADDRESS;
    const auditAddress = process.env.AUDIT_ADDRESS;
    
    console.log("\n👥 ROLE CONFIGURATION:");
    console.log("├── Admin (Owner):", adminAddress);
    console.log("├── Treasury:", treasuryAddress);
    console.log("├── Distributor:", distributorAddress);
    console.log("├── Platform:", platformAddress);
    console.log("└── Audit:", auditAddress);
    
    // Validate addresses
    if (!adminAddress || !treasuryAddress || !distributorAddress || !platformAddress || !auditAddress) {
        throw new Error("❌ Missing required addresses in .env file");
    }
    
    console.log("\n🏗️  DEPLOYING ORPHI CROWDFUND PLATFORM...");
    
    // Get contract factory
    const OrphiCrowdFundPlatform = await ethers.getContractFactory("OrphiCrowdFund");
    
    // Deploy with proxy
    const contract = await upgrades.deployProxy(
        OrphiCrowdFundPlatform,
        [
            adminAddress,      // admin
            treasuryAddress,   // treasury
            platformAddress,   // platform
            distributorAddress, // distributor
            auditAddress       // audit
        ],
        {
            initializer: 'initialize',
            kind: 'uups'
        }
    );
    
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
    
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("═".repeat(50));
    console.log("📍 Proxy Address:", contractAddress);
    console.log("📍 Implementation:", implementationAddress);
    console.log("🌐 Network: BSC Mainnet");
    console.log("⛽ Gas Used: Optimized deployment");
    
    // Verify roles
    console.log("\n🔐 VERIFYING ROLE ASSIGNMENTS...");
    
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
    const PLATFORM_ROLE = await contract.PLATFORM_ROLE();
    const AUDIT_ROLE = await contract.AUDIT_ROLE();
    const EMERGENCY_ROLE = await contract.EMERGENCY_ROLE();
    
    const hasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, adminAddress);
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, adminAddress);
    const hasDistributorRole = await contract.hasRole(DISTRIBUTOR_ROLE, distributorAddress);
    const hasPlatformRole = await contract.hasRole(PLATFORM_ROLE, platformAddress);
    const hasAuditRole = await contract.hasRole(AUDIT_ROLE, auditAddress);
    const hasEmergencyRole = await contract.hasRole(EMERGENCY_ROLE, adminAddress);
    
    console.log("✅ Default Admin Role:", hasDefaultAdmin ? "✓" : "✗");
    console.log("✅ Admin Role:", hasAdminRole ? "✓" : "✗");
    console.log("✅ Distributor Role:", hasDistributorRole ? "✓" : "✗");
    console.log("✅ Platform Role:", hasPlatformRole ? "✓" : "✗");
    console.log("✅ Audit Role:", hasAuditRole ? "✓" : "✗");
    console.log("✅ Emergency Role:", hasEmergencyRole ? "✓" : "✗");
    
    // Verify package configuration
    console.log("\n💰 VERIFYING PACKAGE CONFIGURATION...");
    const packageCount = await contract.getPackageCount();
    console.log("📦 Package Count:", packageCount.toString());
    
    for (let i = 0; i < packageCount; i++) {
        const amount = await contract.packageAmounts(i);
        const bnbAmount = ethers.formatEther(amount);
        const usdEquivalent = (parseFloat(bnbAmount) * 300).toFixed(2); // Assuming BNB = $300
        console.log(`├── Package ${i}: ${bnbAmount} BNB (~$${usdEquivalent})`);
    }
    
    // Verify bonus configuration
    console.log("\n🎯 VERIFYING BONUS CONFIGURATION...");
    const directBonus = await contract.directBonus();
    console.log("💸 Direct Bonus:", (directBonus / 100).toString() + "%");
    
    for (let level = 1; level <= 8; level++) {
        const levelBonus = await contract.levelBonuses(level);
        console.log(`├── Level ${level} Bonus: ${(levelBonus / 100).toString()}%`);
    }
    
    // Verify GHP configuration
    console.log("\n💎 VERIFYING GHP CONFIGURATION...");
    const ghpPercentage = await contract.ghpPercentage();
    const ghpInterval = await contract.ghpDistributionInterval();
    console.log("🏦 GHP Contribution:", (ghpPercentage / 100).toString() + "%");
    console.log("⏰ GHP Interval:", (ghpInterval / 3600).toString() + " hours");
    
    // Verify earnings cap
    const earningsCap = await contract.earningsCap();
    console.log("📊 Earnings Cap:", (earningsCap / 100).toString() + "%");
    
    console.log("\n🔗 BLOCKCHAIN VERIFICATION:");
    console.log("📱 BSCScan URL:", `https://bscscan.com/address/${contractAddress}`);
    console.log("🔍 Implementation URL:", `https://bscscan.com/address/${implementationAddress}`);
    
    console.log("\n⏭️  NEXT STEPS:");
    console.log("1. 🔍 Verify contract on BSCScan");
    console.log("2. 🧪 Test contract functions");
    console.log("3. 🎯 Update frontend configuration");
    console.log("4. 🚀 Launch platform");
    
    // Save deployment info
    const deploymentInfo = {
        contractName: "OrphiCrowdFund Platform",
        network: "bsc-mainnet",
        proxyAddress: contractAddress,
        implementationAddress: implementationAddress,
        adminAddress: adminAddress,
        treasuryAddress: treasuryAddress,
        distributorAddress: distributorAddress,
        platformAddress: platformAddress,
        auditAddress: auditAddress,
        deploymentDate: new Date().toISOString(),
        packageCount: packageCount.toString(),
        directBonus: directBonus.toString(),
        ghpPercentage: ghpPercentage.toString(),
        earningsCap: earningsCap.toString()
    };
    
    console.log("\n💾 SAVING DEPLOYMENT INFO...");
    require('fs').writeFileSync(
        'ORPHI_PLATFORM_DEPLOYMENT.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("═".repeat(80));
    console.log("🎉 ORPHI CROWDFUND PLATFORM DEPLOYMENT COMPLETE!");
    console.log("📍 Contract Address:", contractAddress);
    console.log("🌐 Ready for BSCScan verification and frontend integration!");
    console.log("═".repeat(80));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
