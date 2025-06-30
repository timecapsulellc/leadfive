const { ethers, upgrades } = require("hardhat");
const { getMainnetConfig } = require("./mainnet-config");

async function main() {
    console.log("🚀 LEADFIVE MAINNET DEPLOYMENT (COST OPTIMIZED)...\n");
    console.log("=".repeat(70));

    // Get mainnet configuration with cost optimization
    const config = getMainnetConfig();
    
    // Cost optimization parameters
    const OPTIMIZED_GAS_PRICE = "3000000000"; // 3 gwei (lower than standard 5 gwei)
    const OPTIMIZED_GAS_LIMIT = "6000000";    // Reduced from 10M to 6M
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 COST-OPTIMIZED DEPLOYMENT CONFIGURATION:");
    console.log(`   Network: ${config.name} (Chain ID: ${config.chainId})`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Gas Price: 3 gwei (optimized)`);
    console.log(`   Gas Limit: 6M (optimized)`);
    
    // Check deployer balance
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    const balanceBNB = ethers.formatEther(deployerBalance);
    console.log(`   Deployer Balance: ${balanceBNB} BNB`);
    
    // Calculate optimized cost estimate
    const estimatedGasUsage = 5000000; // Conservative estimate for LeadFive deployment
    const gasPriceWei = BigInt(OPTIMIZED_GAS_PRICE);
    const estimatedCostWei = BigInt(estimatedGasUsage) * gasPriceWei;
    const estimatedCostBNB = Number(estimatedCostWei) / 1e18;
    
    console.log(`   Estimated Gas Usage: ${estimatedGasUsage.toLocaleString()} gas`);
    console.log(`   Estimated Cost: ${estimatedCostBNB.toFixed(4)} BNB (~$${(estimatedCostBNB * 600).toFixed(2)})`);
    
    if (parseFloat(balanceBNB) < estimatedCostBNB + 0.02) {
        console.error("❌ Insufficient BNB for deployment!");
        console.log(`   Required: ${estimatedCostBNB.toFixed(4)} BNB + 0.02 BNB buffer`);
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

    console.log("\n📦 DEPLOYING LEADFIVE CONTRACT (OPTIMIZED):");
    console.log("=".repeat(50));

    try {
        // Deploy the LeadFive contract using upgradeable proxy with gas optimization
        console.log("   Compiling contracts...");
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        console.log("   Deploying proxy and implementation (gas optimized)...");
        console.log(`   Using USDT: ${config.contracts.usdt}`);
        console.log(`   Using Oracle: ${config.contracts.chainlinkBNBUSD}`);
        
        // Override gas settings for cost optimization
        const gasPrice = BigInt(OPTIMIZED_GAS_PRICE);
        const gasLimit = parseInt(OPTIMIZED_GAS_LIMIT);
        
        // Deploy with initialization and optimized gas settings
        const leadFive = await upgrades.deployProxy(
            LeadFive,
            [
                config.contracts.usdt,              // USDT contract address
                config.contracts.chainlinkBNBUSD    // Initial oracle address
            ],
            {
                initializer: 'initialize',
                kind: 'uups',
                timeout: 600000, // 10 minute timeout for low gas price
                gasPrice: gasPrice,
                gasLimit: gasLimit
            }
        );

        // Wait for deployment with detailed progress
        console.log("   Waiting for deployment transaction (may take longer with lower gas price)...");
        const startTime = Date.now();
        await leadFive.waitForDeployment();
        const deployTime = (Date.now() - startTime) / 1000;
        
        const proxyAddress = await leadFive.getAddress();
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
        
        // Get actual deployment transaction for cost analysis
        const deploymentTx = leadFive.deploymentTransaction();
        if (deploymentTx) {
            const receipt = await deploymentTx.wait();
            const actualGasUsed = receipt.gasUsed;
            const actualGasPrice = deploymentTx.gasPrice;
            const actualCostWei = actualGasUsed * actualGasPrice;
            const actualCostBNB = Number(actualCostWei) / 1e18;
            
            console.log("   ✅ Deployment successful!");
            console.log(`   Proxy: ${proxyAddress}`);
            console.log(`   Implementation: ${implementationAddress}`);
            console.log(`   Deployment Time: ${deployTime.toFixed(1)}s`);
            console.log(`   Actual Gas Used: ${actualGasUsed.toLocaleString()}`);
            console.log(`   Actual Gas Price: ${Number(actualGasPrice) / 1e9} gwei`);
            console.log(`   Actual Cost: ${actualCostBNB.toFixed(4)} BNB (~$${(actualCostBNB * 600).toFixed(2)})`);
        } else {
            console.log("   ✅ Deployment successful!");
            console.log(`   Proxy: ${proxyAddress}`);
            console.log(`   Implementation: ${implementationAddress}`);
            console.log(`   Deployment Time: ${deployTime.toFixed(1)}s`);
        }

        console.log("\n⚙️ POST-DEPLOYMENT CONFIGURATION:");
        console.log("=".repeat(50));

        // Configure the contract with optimized settings
        console.log("   Setting up initial configuration...");
        
        // Set daily withdrawal limit (using the current 10,000 USDT from config)
        const dailyLimit = config.security.dailyWithdrawalLimit;
        console.log(`   Setting daily withdrawal limit: ${ethers.formatEther(dailyLimit)} USDT`);
        
        const setLimitTx = await leadFive.setDailyWithdrawalLimit(dailyLimit, {
            gasPrice: gasPrice,
            gasLimit: 100000 // Small transaction
        });
        await setLimitTx.wait();
        console.log("   ✅ Daily withdrawal limit configured");

        // Verify the configuration
        const currentLimit = await leadFive.dailyWithdrawalLimit();
        console.log(`   Verified limit: ${ethers.formatEther(currentLimit)} USDT`);

        console.log("\n📊 DEPLOYMENT SUMMARY:");
        console.log("=".repeat(50));
        console.log(`   Contract Address: ${proxyAddress}`);
        console.log(`   Implementation: ${implementationAddress}`);
        console.log(`   Daily Withdrawal Limit: ${ethers.formatEther(currentLimit)} USDT`);
        console.log(`   USDT Token: ${config.contracts.usdt}`);
        console.log(`   Price Oracle: ${config.contracts.chainlinkBNBUSD}`);
        console.log(`   Gas Optimization: 3 gwei (vs 5 gwei standard)`);
        console.log(`   Cost Savings: ~40% compared to standard deployment`);

        // Save deployment info
        const deploymentInfo = {
            network: "BSC Mainnet",
            timestamp: new Date().toISOString(),
            proxyAddress,
            implementationAddress,
            deployer: deployer.address,
            dailyWithdrawalLimit: ethers.formatEther(currentLimit),
            usdtAddress: config.contracts.usdt,
            oracleAddress: config.contracts.chainlinkBNBUSD,
            gasOptimized: true,
            gasPrice: "3 gwei",
            estimatedCost: `${estimatedCostBNB.toFixed(4)} BNB`
        };

        const fs = require('fs');
        fs.writeFileSync(
            `BSC_MAINNET_OPTIMIZED_DEPLOYMENT_${Date.now()}.json`,
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n🎉 COST-OPTIMIZED MAINNET DEPLOYMENT COMPLETE!");
        console.log("   Next steps:");
        console.log("   1. Verify contract on BSCScan");
        console.log("   2. Run comprehensive tests");
        console.log("   3. Configure additional admin settings if needed");
        console.log("   4. Transfer ownership to Trezor wallet");

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.transaction) {
            console.error("   Transaction hash:", error.transaction.hash);
        }
        process.exit(1);
    }
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
