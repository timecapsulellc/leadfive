const { ethers, upgrades } = require("hardhat");

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║                    ◆ GAS ESTIMATION UTILITY ◆                                        ║
 * ║                  ◇ Trezor-Optimized Gas Analysis ◇                                   ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

const formatBNB = (wei) => ethers.utils.formatEther(wei);
const formatGwei = (wei) => ethers.utils.formatUnits(wei, "gwei");

const GAS_PRICES = {
    SLOW: ethers.utils.parseUnits("3", "gwei"),    // 3 gwei
    STANDARD: ethers.utils.parseUnits("5", "gwei"), // 5 gwei  
    FAST: ethers.utils.parseUnits("8", "gwei"),    // 8 gwei
    INSTANT: ethers.utils.parseUnits("12", "gwei")  // 12 gwei
};

const BNB_PRICES = {
    CONSERVATIVE: 250, // $250
    CURRENT: 300,      // $300
    OPTIMISTIC: 400    // $400
};

async function estimateDeploymentGas(contractName = "OrphichainCrowdfundPlatformUpgradeable") {
    console.log("⛽ ORPHICHAIN GAS ESTIMATION TOOL");
    console.log("=".repeat(50));
    
    try {
        // Get current network
        const network = await ethers.provider.getNetwork();
        console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        // Get current gas price
        const currentGasPrice = await ethers.provider.getGasPrice();
        console.log(`📊 Current Gas Price: ${formatGwei(currentGasPrice)} gwei`);
        
        // Get contract factory
        console.log(`\n📦 Loading ${contractName}...`);
        const ContractFactory = await ethers.getContractFactory(contractName);
        
        // Get deployer
        const [deployer] = await ethers.getSigners();
        
        // Prepare initialization arguments
        const initArgs = [
            "0x55d398326f99059fF775485246999027B3197955", // USDT
            deployer.address, // treasury
            deployer.address, // emergency
            deployer.address  // pool manager
        ];
        
        console.log("\n⚡ Estimating gas usage...");
        
        let gasEstimate;
        try {
            // Try to estimate upgradeable proxy deployment
            gasEstimate = await upgrades.estimateGas(ContractFactory, initArgs);
            console.log(`✅ Proxy deployment gas estimate: ${gasEstimate.toLocaleString()}`);
        } catch (error) {
            console.log(`⚠️  Proxy estimation failed, using fallback: ${error.message}`);
            // Fallback estimation
            gasEstimate = ethers.BigNumber.from("3000000"); // 3M gas
        }
        
        // Add buffer for safety
        const gasWithBuffer = Math.ceil(gasEstimate.toNumber() * 1.2); // 20% buffer
        
        console.log("\n📊 GAS ESTIMATION RESULTS");
        console.log("-".repeat(50));
        console.log(`Base Estimate: ${gasEstimate.toLocaleString()} gas`);
        console.log(`With Buffer (20%): ${gasWithBuffer.toLocaleString()} gas`);
        
        console.log("\n💰 COST ANALYSIS");
        console.log("-".repeat(50));
        
        // Calculate costs for different gas prices
        Object.entries(GAS_PRICES).forEach(([speed, gasPrice]) => {
            const cost = gasPrice.mul(gasWithBuffer);
            const costBNB = formatBNB(cost);
            
            console.log(`${speed.padEnd(10)} (${formatGwei(gasPrice).padEnd(2)} gwei):`);
            console.log(`  • Cost: ${costBNB} BNB`);
            
            // USD estimates
            Object.entries(BNB_PRICES).forEach(([scenario, bnbPrice]) => {
                const usdCost = parseFloat(costBNB) * bnbPrice;
                console.log(`  • USD (BNB=$${bnbPrice}): $${usdCost.toFixed(2)}`);
            });
            console.log();
        });
        
        // Current gas price estimate
        const currentCost = currentGasPrice.mul(gasWithBuffer);
        console.log("🎯 CURRENT ESTIMATE");
        console.log("-".repeat(50));
        console.log(`Gas Price: ${formatGwei(currentGasPrice)} gwei`);
        console.log(`Total Gas: ${gasWithBuffer.toLocaleString()}`);
        console.log(`Cost: ${formatBNB(currentCost)} BNB`);
        console.log(`USD (BNB=$300): $${(parseFloat(formatBNB(currentCost)) * 300).toFixed(2)}`);
        
        // Recommendations
        console.log("\n💡 RECOMMENDATIONS");
        console.log("-".repeat(50));
        
        if (currentGasPrice.gt(GAS_PRICES.FAST)) {
            console.log("⚠️  Current gas price is HIGH. Consider waiting for lower prices.");
        } else if (currentGasPrice.lt(GAS_PRICES.STANDARD)) {
            console.log("✅ Current gas price is GOOD for deployment.");
        } else {
            console.log("📊 Current gas price is MODERATE.");
        }
        
        console.log("\n🔧 OPTIMIZATION TIPS");
        console.log("-".repeat(50));
        console.log("• Deploy during low network activity (weekends, early morning UTC)");
        console.log("• Use 'auto' gas price for dynamic optimization");
        console.log("• Consider deploying implementation first, then proxy");
        console.log("• Monitor gas prices using BSCScan gas tracker");
        
        return {
            gasEstimate: gasEstimate.toNumber(),
            gasWithBuffer,
            currentGasPrice,
            currentCost: formatBNB(currentCost),
            recommendations: currentGasPrice.gt(GAS_PRICES.FAST) ? "WAIT" : "DEPLOY"
        };
        
    } catch (error) {
        console.error("❌ Gas estimation failed:", error.message);
        throw error;
    }
}

// Export for use in other scripts
module.exports = estimateDeploymentGas;

// Run if called directly
if (require.main === module) {
    const contractName = process.argv[2] || "OrphichainCrowdfundPlatformUpgradeable";
    
    estimateDeploymentGas(contractName)
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Error:", error);
            process.exit(1);
        });
}
