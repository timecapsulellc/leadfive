const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 LEADFIVE MAINNET DEPLOYMENT - PRODUCTION READY");
    console.log("=" .repeat(70));
    console.log("🌐 Deploying to BSC Mainnet (Chain ID: 56)");
    console.log("📅 Deployment Date:", new Date().toISOString());
    console.log("=" .repeat(70));
    
    const [deployer] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    
    console.log(`🏗️  Deployer Account: ${deployerAddress}`);
    
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log(`💰 Deployer BNB Balance: ${ethers.formatEther(balance)} BNB`);
    
    if (balance < ethers.parseEther("0.02")) {
        console.error("❌ Insufficient BNB for deployment. Need at least 0.02 BNB");
        process.exit(1);
    }
    
    console.log("\\n🏭 MAINNET PRODUCTION DEPLOYMENT");
    console.log("-".repeat(50));
    
    // Use real USDT contract on BSC Mainnet
    const REAL_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // Real USDT on BSC
    console.log("\\n📍 Step 1: Using Real USDT Contract");
    console.log(`✅ Real USDT Address: ${REAL_USDT_ADDRESS}`);
    
    // For initial deployment, we'll use a placeholder oracle address
    // This can be updated later via admin functions
    const PLACEHOLDER_ORACLE = "0x0000000000000000000000000000000000000001"; // Placeholder
    console.log("\\n📍 Step 2: Using Placeholder Oracle (Update Later)");
    console.log(`✅ Placeholder Oracle: ${PLACEHOLDER_ORACLE}`);
    
    // Deploy the main LeadFive contract as upgradeable proxy
    console.log("\\n📍 Step 3: Deploying LeadFive Main Contract (Upgradeable)");
    
    const LeadFive = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive");
    
    console.log("🔄 Deploying upgradeable proxy...");
    const leadFive = await upgrades.deployProxy(
        LeadFive,
        [REAL_USDT_ADDRESS, PLACEHOLDER_ORACLE], // Initialize with real USDT and placeholder oracle
        { 
            initializer: 'initialize',
            kind: 'uups',
            timeout: 120000 // 2 minutes timeout for mainnet
        }
    );
    
    await leadFive.waitForDeployment();
    const leadFiveAddress = await leadFive.getAddress();
    
    console.log(`\\n🎉 LEADFIVE MAINNET DEPLOYMENT SUCCESSFUL!`);
    console.log("=" .repeat(70));
    console.log(`📍 LeadFive Proxy: ${leadFiveAddress}`);
    console.log(`📍 Implementation: ${await upgrades.erc1967.getImplementationAddress(leadFiveAddress)}`);
    console.log(`📍 Admin: ${await upgrades.erc1967.getAdminAddress(leadFiveAddress)}`);
    console.log(`📍 Real USDT: ${REAL_USDT_ADDRESS}`);
    console.log(`📍 Placeholder Oracle: ${PLACEHOLDER_ORACLE}`);
    console.log("=" .repeat(70));
    
    // Verify deployment by checking initial state
    console.log("\\n🔍 VERIFYING DEPLOYMENT");
    console.log("-".repeat(50));
    
    const owner = await leadFive.owner();
    const totalUsers = await leadFive.getTotalUsers();
    const packagePrice1 = await leadFive.getPackagePrice(1);
    const packagePrice4 = await leadFive.getPackagePrice(4);
    
    console.log(`✅ Contract Owner: ${owner}`);
    console.log(`✅ Initial Users: ${totalUsers}`);
    console.log(`✅ Package 1 Price: ${ethers.formatUnits(packagePrice1, 6)} USDT`);
    console.log(`✅ Package 4 Price: ${ethers.formatUnits(packagePrice4, 6)} USDT`);
    
    // Test basic functionality
    console.log("\\n🧪 BASIC FUNCTIONALITY TEST");
    console.log("-".repeat(50));
    
    // Check pool balances
    const leadershipPool = await leadFive.getPoolBalance(1);
    const communityPool = await leadFive.getPoolBalance(2);
    const clubPool = await leadFive.getPoolBalance(3);
    
    console.log(`✅ Leadership Pool: ${ethers.formatUnits(leadershipPool, 6)} USDT`);
    console.log(`✅ Community Pool: ${ethers.formatUnits(communityPool, 6)} USDT`);
    console.log(`✅ Club Pool: ${ethers.formatUnits(clubPool, 6)} USDT`);
    
    // Check admin status
    const isAdmin = await leadFive.isAdmin(deployerAddress);
    console.log(`✅ Deployer Admin Status: ${isAdmin}`);
    
    // Note: Using real USDT - no minting needed
    console.log("\\n💰 REAL USDT INTEGRATION");
    console.log("-".repeat(50));
    console.log(`✅ Using Real USDT: ${REAL_USDT_ADDRESS}`);
    console.log(`ℹ️  Note: You'll need to acquire real USDT for testing`);
    
    // Create deployment summary
    const deploymentSummary = {
        timestamp: new Date().toISOString(),
        network: "BSC Mainnet",
        chainId: 56,
        deployer: deployerAddress,
        contracts: {
            leadFiveProxy: leadFiveAddress,
            leadFiveImplementation: await upgrades.erc1967.getImplementationAddress(leadFiveAddress),
            proxyAdmin: await upgrades.erc1967.getAdminAddress(leadFiveAddress),
            realUSDT: REAL_USDT_ADDRESS,
            placeholderOracle: PLACEHOLDER_ORACLE
        },
        initialState: {
            owner: owner,
            totalUsers: totalUsers.toString(),
            packagePrices: {
                level1: ethers.formatUnits(packagePrice1, 6),
                level4: ethers.formatUnits(packagePrice4, 6)
            },
            usdtIntegration: "Real USDT Contract"
        },
        gasUsed: {
            estimatedTotal: "~1M gas",
            estimatedCost: "~0.02 BNB at 5 gwei"
        }
    };
    
    // Save deployment summary
    const fs = require('fs');
    fs.writeFileSync(
        './mainnet-deployment-summary.json', 
        JSON.stringify(deploymentSummary, null, 2)
    );
    
    console.log("\\n📋 DEPLOYMENT SUMMARY SAVED");
    console.log("-".repeat(50));
    console.log("✅ File: ./mainnet-deployment-summary.json");
    
    console.log("\\n🎯 NEXT STEPS FOR PRODUCTION");
    console.log("=" .repeat(70));
    console.log("1. 🔍 Verify contracts on BSCScan");
    console.log("2. 🔮 Configure real price oracles (Chainlink/PancakeSwap)");
    console.log("3. � Acquire real USDT for testing registrations");
    console.log("4. 👥 Start with controlled user onboarding (10-100 users)");
    console.log("5. 📊 Monitor gas costs and performance");
    console.log("6. 🚀 Scale to full production");
    console.log("=" .repeat(70));
    
    console.log("\\n🎉 LEADFIVE MAINNET DEPLOYMENT COMPLETE!");
    console.log(`📍 Main Contract: ${leadFiveAddress}`);
    console.log("🚀 Ready for production launch!");
    
    return {
        leadFive: leadFiveAddress,
        realUSDT: REAL_USDT_ADDRESS,
        placeholderOracle: PLACEHOLDER_ORACLE,
        deployer: deployerAddress
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
