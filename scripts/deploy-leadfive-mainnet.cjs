const { ethers, upgrades } = require("hardhat");
const { getMainnetConfig, estimateDeploymentCost } = require("./mainnet-config");

async function main() {
    console.log("🚀 LEADFIVE MAINNET DEPLOYMENT STARTING...\n");
    console.log("=".repeat(70));

    // Get mainnet configuration
    const config = getMainnetConfig();
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 DEPLOYMENT CONFIGURATION:");
    console.log(`   Network: ${config.name} (Chain ID: ${config.chainId})`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Explorer: ${config.explorer}`);
    
    // Check deployer balance
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    const balanceBNB = ethers.formatEther(deployerBalance);
    console.log(`   Deployer Balance: ${balanceBNB} BNB`);
    
    // Estimate deployment cost
    const gasPrice = await ethers.provider.getGasPrice();
    const costEstimate = estimateDeploymentCost(gasPrice.toString());
    console.log(`   Estimated Cost: ${costEstimate.costBNB} BNB (~$${costEstimate.costUSD})`);
    
    if (parseFloat(balanceBNB) < parseFloat(costEstimate.costBNB) + 0.1) {
        console.error("❌ Insufficient BNB for deployment!");
        console.log(`   Required: ${costEstimate.costBNB} BNB + 0.1 BNB buffer`);
        console.log(`   Available: ${balanceBNB} BNB`);
        process.exit(1);
    }

    console.log("\n🔍 PRE-DEPLOYMENT VERIFICATION:");
    console.log("=".repeat(50));
    
    // Verify USDT contract exists on mainnet
    console.log("   Verifying mainnet USDT contract...");
    const usdtCode = await ethers.provider.getCode(config.contracts.usdt);
    if (usdtCode === "0x") {
        console.error(`❌ USDT contract not found at ${config.contracts.usdt}`);
        process.exit(1);
    }
    console.log(`   ✅ USDT contract verified: ${config.contracts.usdt}`);
    
    // Check USDT contract details
    try {
        const usdtContract = await ethers.getContractAt("IERC20Metadata", config.contracts.usdt);
        const usdtName = await usdtContract.name();
        const usdtSymbol = await usdtContract.symbol();
        const usdtDecimals = await usdtContract.decimals();
        
        console.log(`   USDT Details: ${usdtName} (${usdtSymbol}), Decimals: ${usdtDecimals}`);
        
        if (usdtDecimals !== 18) {
            console.error(`❌ USDT decimals mismatch! Expected 18, got ${usdtDecimals}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error checking USDT contract: ${error.message}`);
        process.exit(1);
    }

    console.log("\n📦 DEPLOYING LEADFIVE CONTRACT:");
    console.log("=".repeat(50));

    try {
        // Deploy the LeadFive contract using upgradeable proxy
        console.log("   Compiling contracts...");
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        console.log("   Deploying proxy and implementation...");
        console.log(`   Using USDT: ${config.contracts.usdt}`);
        console.log(`   Using Oracle: ${config.contracts.chainlinkBNBUSD}`);
        
        // Deploy with initialization
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [
                config.contracts.usdt,              // USDT contract address
                config.contracts.chainlinkBNBUSD    // Initial oracle address
            ],
            {
                initializer: 'initialize',
                kind: 'uups',
                timeout: 300000 // 5 minute timeout
            }
        );

        // Wait for deployment
        console.log("   Waiting for deployment transaction...");
        await leadFive.waitForDeployment();
        
        const proxyAddress = await leadFive.getAddress();
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        
        console.log("   ✅ Deployment successful!");
        console.log(`   Proxy: ${proxyAddress}`);
        console.log(`   Implementation: ${implementationAddress}`);

        // Save deployment info
        const deploymentInfo = {
            network: config.name,
            chainId: config.chainId,
            timestamp: new Date().toISOString(),
            deployer: deployer.address,
            contracts: {
                proxy: proxyAddress,
                implementation: implementationAddress,
                usdt: config.contracts.usdt,
                oracle: config.contracts.chainlinkBNBUSD
            },
            transactionHash: leadFive.deploymentTransaction()?.hash,
            gasUsed: costEstimate.gasUsed,
            deploymentCost: costEstimate
        };

        // Write deployment info to file
        const fs = require('fs');
        const deploymentFileName = `BSC_MAINNET_DEPLOYMENT_${Date.now()}.json`;
        fs.writeFileSync(deploymentFileName, JSON.stringify(deploymentInfo, null, 2));
        console.log(`   📄 Deployment info saved to: ${deploymentFileName}`);

        console.log("\n🔧 POST-DEPLOYMENT CONFIGURATION:");
        console.log("=".repeat(50));

        // Configure mainnet-specific parameters
        console.log("   Setting mainnet security parameters...");
        
        // Set daily withdrawal limit (10,000 USDT)
        const dailyLimit = ethers.parseUnits("10000", 18);
        const setLimitTx = await leadFive.setDailyWithdrawalLimit(dailyLimit);
        await setLimitTx.wait();
        console.log(`   ✅ Daily withdrawal limit set: 10,000 USDT`);
        
        // Set circuit breaker threshold (100 BNB)
        const circuitThreshold = ethers.parseEther("100");
        const setCircuitTx = await leadFive.setCircuitBreaker(circuitThreshold);
        await setCircuitTx.wait();
        console.log(`   ✅ Circuit breaker threshold set: 100 BNB`);

        console.log("\n✅ INITIAL VERIFICATION:");
        console.log("=".repeat(40));

        // Verify basic contract state
        const totalUsers = await leadFive.getTotalUsers();
        console.log(`   Total Users: ${totalUsers}`);

        // Check package configurations
        for (let i = 1; i <= 4; i++) {
            const packagePrice = await leadFive.getPackagePrice(i);
            console.log(`   Package ${i}: ${ethers.formatUnits(packagePrice, 18)} USDT`);
        }

        // Check deployer status
        const deployerInfo = await leadFive.getUserBasicInfo(deployer.address);
        console.log(`   Deployer registered: ${deployerInfo[0]}`);
        console.log(`   Deployer package: ${deployerInfo[1]}`);

        // Check admin status
        const isAdmin = await leadFive.isAdmin(deployer.address);
        console.log(`   Deployer is admin: ${isAdmin}`);

        console.log("\n🎯 MAINNET DEPLOYMENT COMPLETED!");
        console.log("=".repeat(50));
        console.log("✅ Contract deployed and configured successfully");
        console.log("✅ Security parameters set for mainnet");
        console.log("✅ Initial verification completed");
        console.log("✅ Ready for BSCScan verification");
        
        console.log("\n📋 NEXT STEPS:");
        console.log("1. Verify contract on BSCScan");
        console.log("2. Run comprehensive mainnet testing");
        console.log("3. Set up monitoring and alerts");
        console.log("4. Prepare for production launch");
        
        console.log("\n🔗 MAINNET LINKS:");
        console.log(`   Proxy: ${config.explorer}address/${proxyAddress}`);
        console.log(`   Implementation: ${config.explorer}address/${implementationAddress}`);
        console.log(`   USDT: ${config.explorer}address/${config.contracts.usdt}`);

        return {
            proxy: proxyAddress,
            implementation: implementationAddress,
            usdt: config.contracts.usdt,
            deployer: deployer.address
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        console.error("Stack trace:", error.stack);
        process.exit(1);
    }
}

// Export for use in other scripts
module.exports = { main };

// Run if called directly
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
