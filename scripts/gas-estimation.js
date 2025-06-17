const { ethers } = require("hardhat");

/**
 * ⛽ ORPHI CROWDFUND GAS ESTIMATION & COST CALCULATOR
 * 
 * This script provides detailed gas estimation for mainnet deployment:
 * 📊 Current Gas Prices
 * 💰 Deployment Costs
 * 📈 Cost Optimization Recommendations
 * ⏰ Best Time to Deploy Analysis
 */

// ==================== CONFIGURATION ====================
const GAS_CONFIG = {
    // BSC Mainnet typical gas prices (in Gwei)
    LOW_GAS: 1,      // Off-peak hours
    NORMAL_GAS: 3,   // Normal hours  
    HIGH_GAS: 8,     // Peak hours
    
    // Gas limits for different operations
    PROXY_DEPLOYMENT: 6000000,    // UUPS Proxy deployment
    CONTRACT_VERIFICATION: 50000,  // BSCScan verification
    INITIALIZATION: 500000,        // Contract initialization
    
    // Safety margins
    GAS_BUFFER: 1.2,              // 20% buffer
    
    // Cost thresholds (in USD)
    ACCEPTABLE_COST: 50,          // Below this is good
    HIGH_COST_WARNING: 100,       // Above this shows warning
    
    // BNB price for USD calculations
    BNB_PRICE_USD: 600            // Update based on current market
};

// ==================== UTILITY FUNCTIONS ====================
const formatBNB = (wei) => {
    return ethers.utils ? ethers.utils.formatEther(wei) : ethers.formatEther(wei);
};

const formatGwei = (wei) => {
    return ethers.utils ? ethers.utils.formatUnits(wei, "gwei") : ethers.formatUnits(wei, "gwei");
};

const formatUSD = (bnbAmount) => {
    return (parseFloat(bnbAmount) * GAS_CONFIG.BNB_PRICE_USD).toFixed(2);
};

const printCostAnalysis = (gasPrice, gasLimit, operation) => {
    const cost = BigInt(gasLimit) * BigInt(gasPrice);
    const costBNB = formatBNB(cost);
    const costUSD = formatUSD(costBNB);
    
    console.log(`📊 ${operation}:`);
    console.log(`   • Gas Limit: ${gasLimit.toLocaleString()}`);
    console.log(`   • Gas Price: ${formatGwei(gasPrice)} Gwei`);
    console.log(`   • Cost: ${costBNB} BNB ($${costUSD})`);
    
    if (parseFloat(costUSD) <= GAS_CONFIG.ACCEPTABLE_COST) {
        console.log(`   ✅ Cost Status: ACCEPTABLE`);
    } else if (parseFloat(costUSD) <= GAS_CONFIG.HIGH_COST_WARNING) {
        console.log(`   ⚠️  Cost Status: MODERATE`);
    } else {
        console.log(`   ❌ Cost Status: HIGH - Consider waiting`);
    }
    
    return { costBNB, costUSD, cost };
};

// ==================== GAS PRICE ANALYSIS ====================
async function getCurrentGasPrices() {
    console.log("⛽ CURRENT GAS PRICE ANALYSIS");
    console.log("=" .repeat(50));
    
    try {
        // Get current network gas data
        const feeData = await ethers.provider.getFeeData();
        const currentGasPrice = feeData.gasPrice;
        const maxFeePerGas = feeData.maxFeePerGas;
        const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        
        console.log("📊 Current Network Fees:");
        console.log(`   • Gas Price: ${formatGwei(currentGasPrice)} Gwei`);
        
        if (maxFeePerGas) {
            console.log(`   • Max Fee Per Gas: ${formatGwei(maxFeePerGas)} Gwei`);
        }
        
        if (maxPriorityFeePerGas) {
            console.log(`   • Max Priority Fee: ${formatGwei(maxPriorityFeePerGas)} Gwei`);
        }
        
        // Analyze gas price level
        const gasPriceGwei = parseInt(formatGwei(currentGasPrice));
        
        console.log("\n📈 Gas Price Analysis:");
        if (gasPriceGwei <= GAS_CONFIG.LOW_GAS) {
            console.log("✅ Gas Price: VERY LOW (Excellent time to deploy)");
        } else if (gasPriceGwei <= GAS_CONFIG.NORMAL_GAS) {
            console.log("✅ Gas Price: NORMAL (Good time to deploy)");
        } else if (gasPriceGwei <= GAS_CONFIG.HIGH_GAS) {
            console.log("⚠️  Gas Price: HIGH (Consider waiting)");
        } else {
            console.log("❌ Gas Price: VERY HIGH (Wait for better conditions)");
        }
        
        return { currentGasPrice, maxFeePerGas, maxPriorityFeePerGas, gasPriceGwei };
        
    } catch (error) {
        console.error(`❌ Failed to get gas prices: ${error.message}`);
        throw error;
    }
}

// ==================== DEPLOYMENT COST ESTIMATION ====================
async function estimateDeploymentCosts() {
    console.log("\n💰 DEPLOYMENT COST ESTIMATION");
    console.log("=" .repeat(50));
    
    try {
        const { currentGasPrice } = await getCurrentGasPrices();
        
        // Calculate costs for different operations
        console.log("\n📋 Individual Operation Costs:");
        
        // 1. Main contract deployment (with proxy)
        const proxyDeployment = printCostAnalysis(
            currentGasPrice,
            GAS_CONFIG.PROXY_DEPLOYMENT,
            "UUPS Proxy Deployment"
        );
        
        console.log("");
        
        // 2. Contract initialization
        const initialization = printCostAnalysis(
            currentGasPrice,
            GAS_CONFIG.INITIALIZATION,
            "Contract Initialization"
        );
        
        console.log("");
        
        // 3. BSCScan verification
        const verification = printCostAnalysis(
            currentGasPrice,
            GAS_CONFIG.CONTRACT_VERIFICATION,
            "BSCScan Verification"
        );
        
        // Calculate total with buffer
        const totalGas = GAS_CONFIG.PROXY_DEPLOYMENT + GAS_CONFIG.INITIALIZATION + GAS_CONFIG.CONTRACT_VERIFICATION;
        const totalWithBuffer = Math.floor(totalGas * GAS_CONFIG.GAS_BUFFER);
        
        console.log("\n💼 TOTAL DEPLOYMENT COST:");
        const totalCost = printCostAnalysis(
            currentGasPrice,
            totalWithBuffer,
            "Complete Deployment (with 20% buffer)"
        );
        
        return {
            currentGasPrice,
            proxyDeployment,
            initialization,
            verification,
            totalCost,
            totalGas: totalWithBuffer
        };
        
    } catch (error) {
        console.error(`❌ Cost estimation failed: ${error.message}`);
        throw error;
    }
}

// ==================== GAS PRICE SCENARIOS ====================
async function analyzeGasScenarios() {
    console.log("\n📊 GAS PRICE SCENARIOS ANALYSIS");
    console.log("=" .repeat(50));
    
    const scenarios = [
        { name: "🟢 LOW GAS (Off-peak)", gwei: GAS_CONFIG.LOW_GAS },
        { name: "🔵 NORMAL GAS (Regular)", gwei: GAS_CONFIG.NORMAL_GAS },
        { name: "🟡 HIGH GAS (Peak)", gwei: GAS_CONFIG.HIGH_GAS }
    ];
    
    const totalGas = Math.floor(
        (GAS_CONFIG.PROXY_DEPLOYMENT + GAS_CONFIG.INITIALIZATION + GAS_CONFIG.CONTRACT_VERIFICATION) 
        * GAS_CONFIG.GAS_BUFFER
    );
    
    console.log(`📋 Scenarios for ${totalGas.toLocaleString()} total gas:`);
    console.log("");
    
    scenarios.forEach(scenario => {
        const gasPrice = ethers.utils ? 
            ethers.utils.parseUnits(scenario.gwei.toString(), "gwei") :
            ethers.parseUnits(scenario.gwei.toString(), "gwei");
        
        const cost = BigInt(totalGas) * BigInt(gasPrice);
        const costBNB = formatBNB(cost);
        const costUSD = formatUSD(costBNB);
        
        console.log(`${scenario.name}:`);
        console.log(`   • Gas Price: ${scenario.gwei} Gwei`);
        console.log(`   • Total Cost: ${costBNB} BNB ($${costUSD})`);
        console.log("");
    });
}

// ==================== OPTIMAL TIMING ANALYSIS ====================
async function analyzeOptimalTiming() {
    console.log("⏰ OPTIMAL DEPLOYMENT TIMING ANALYSIS");
    console.log("=" .repeat(50));
    
    const currentHour = new Date().getUTCHours();
    
    console.log("🌍 BSC Network Activity Patterns (UTC):");
    console.log("• Low Activity:    02:00 - 08:00 UTC (Best time)");
    console.log("• Moderate:        08:00 - 14:00 UTC (Good time)");
    console.log("• High Activity:   14:00 - 22:00 UTC (Higher costs)");
    console.log("• Peak Activity:   22:00 - 02:00 UTC (Avoid if possible)");
    
    console.log(`\n🕐 Current Time: ${new Date().toUTCString()}`);
    
    if (currentHour >= 2 && currentHour < 8) {
        console.log("✅ EXCELLENT timing - Low network activity period");
    } else if (currentHour >= 8 && currentHour < 14) {
        console.log("✅ GOOD timing - Moderate network activity");
    } else if (currentHour >= 14 && currentHour < 22) {
        console.log("⚠️  MODERATE timing - Higher network activity");
        console.log("💡 Consider waiting 2-4 hours for better rates");
    } else {
        console.log("❌ PEAK timing - Highest network activity");
        console.log("💡 Strongly recommend waiting 4-8 hours");
    }
    
    // Calculate hours until next low-activity period
    let hoursUntilOptimal;
    if (currentHour < 2) {
        hoursUntilOptimal = 2 - currentHour;
    } else if (currentHour >= 2 && currentHour < 8) {
        hoursUntilOptimal = 0; // Already optimal
    } else {
        hoursUntilOptimal = 24 - currentHour + 2; // Next day at 2 AM
    }
    
    if (hoursUntilOptimal > 0) {
        console.log(`⏰ Next optimal window in: ${hoursUntilOptimal} hours`);
    }
}

// ==================== ACCOUNT BALANCE CHECK ====================
async function checkAccountBalance() {
    console.log("\n💰 ACCOUNT BALANCE VERIFICATION");
    console.log("=" .repeat(50));
    
    try {
        const [deployer] = await ethers.getSigners();
        const deployerAddress = await deployer.getAddress();
        const balance = await ethers.provider.getBalance(deployerAddress);
        const balanceBNB = formatBNB(balance);
        
        console.log(`👤 Deployer: ${deployerAddress}`);
        console.log(`💰 Balance: ${balanceBNB} BNB ($${formatUSD(balanceBNB)})`);
        
        // Get estimated deployment cost
        const { totalCost } = await estimateDeploymentCosts();
        const estimatedCostBNB = totalCost.costBNB;
        
        console.log(`\n📊 Balance Analysis:`);
        console.log(`   • Required: ~${estimatedCostBNB} BNB`);
        console.log(`   • Available: ${balanceBNB} BNB`);
        
        const balanceAfter = parseFloat(balanceBNB) - parseFloat(estimatedCostBNB);
        console.log(`   • After Deployment: ~${balanceAfter.toFixed(6)} BNB`);
        
        if (balanceAfter > 0.05) { // Keep 0.05 BNB buffer
            console.log(`   ✅ Status: SUFFICIENT (Good buffer remaining)`);
        } else if (balanceAfter > 0) {
            console.log(`   ⚠️  Status: MINIMAL (Low buffer remaining)`);
        } else {
            console.log(`   ❌ Status: INSUFFICIENT (Need more BNB)`);
            console.log(`   💡 Add at least ${Math.abs(balanceAfter).toFixed(6)} more BNB`);
        }
        
        return { balance, balanceBNB, balanceAfter, sufficient: balanceAfter > 0 };
        
    } catch (error) {
        console.error(`❌ Balance check failed: ${error.message}`);
        throw error;
    }
}

// ==================== RECOMMENDATIONS ====================
function generateRecommendations(gasData, balanceData) {
    console.log("\n💡 DEPLOYMENT RECOMMENDATIONS");
    console.log("=" .repeat(50));
    
    const recommendations = [];
    
    // Gas price recommendations
    if (gasData.gasPriceGwei <= GAS_CONFIG.NORMAL_GAS) {
        recommendations.push("✅ Gas prices are favorable for deployment");
    } else {
        recommendations.push("⚠️  Consider waiting for lower gas prices");
    }
    
    // Balance recommendations
    if (balanceData.sufficient && balanceData.balanceAfter > 0.05) {
        recommendations.push("✅ Account balance is sufficient with good buffer");
    } else if (balanceData.sufficient) {
        recommendations.push("⚠️  Account balance is sufficient but with minimal buffer");
    } else {
        recommendations.push("❌ Add more BNB to your account before deployment");
    }
    
    // Timing recommendations
    const currentHour = new Date().getUTCHours();
    if (currentHour >= 2 && currentHour < 8) {
        recommendations.push("✅ Current time is optimal for deployment");
    } else {
        recommendations.push("⏰ Consider deploying during off-peak hours (2-8 UTC)");
    }
    
    // Cost optimization
    const costUSD = parseFloat(gasData.totalCost.costUSD);
    if (costUSD <= GAS_CONFIG.ACCEPTABLE_COST) {
        recommendations.push("✅ Deployment cost is within acceptable range");
    } else {
        recommendations.push("💰 High deployment cost - consider optimizations");
    }
    
    console.log("📋 Summary:");
    recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
    });
    
    // Overall recommendation
    const favorableConditions = recommendations.filter(r => r.includes('✅')).length;
    const totalConditions = recommendations.length;
    
    console.log(`\n📊 Favorable Conditions: ${favorableConditions}/${totalConditions}`);
    
    if (favorableConditions === totalConditions) {
        console.log("🎉 RECOMMENDATION: DEPLOY NOW");
        console.log("✅ All conditions are optimal for deployment");
    } else if (favorableConditions >= totalConditions * 0.75) {
        console.log("✅ RECOMMENDATION: GOOD TO DEPLOY");
        console.log("⚠️  Some conditions could be better, but deployment is viable");
    } else {
        console.log("⚠️  RECOMMENDATION: CONSIDER WAITING");
        console.log("🔧 Address the warnings before deployment for optimal results");
    }
}

// ==================== MAIN FUNCTION ====================
async function runGasEstimation() {
    console.log("⛽ ORPHI CROWDFUND GAS ESTIMATION & COST CALCULATOR");
    console.log("═".repeat(80));
    console.log("📊 Analyzing current gas prices and deployment costs");
    console.log("💰 Providing cost optimization recommendations");
    console.log("═".repeat(80));
    
    try {
        // Get current gas prices
        const gasData = await getCurrentGasPrices();
        
        // Estimate deployment costs
        const deploymentCosts = await estimateDeploymentCosts();
        
        // Analyze gas scenarios
        await analyzeGasScenarios();
        
        // Analyze optimal timing
        await analyzeOptimalTiming();
        
        // Check account balance
        const balanceData = await checkAccountBalance();
        
        // Generate recommendations
        generateRecommendations(deploymentCosts, balanceData);
        
        console.log("\n═".repeat(80));
        console.log("✅ Gas estimation completed successfully!");
        console.log("📋 Use this information to plan your mainnet deployment");
        console.log("═".repeat(80));
        
        return {
            gasData: deploymentCosts,
            balanceData,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`❌ Gas estimation failed: ${error.message}`);
        throw error;
    }
}

// Execute if run directly
if (require.main === module) {
    runGasEstimation()
        .then(() => {
            console.log("✅ Gas estimation completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Gas estimation failed:", error);
            process.exit(1);
        });
}

module.exports = { runGasEstimation, getCurrentGasPrices, estimateDeploymentCosts };
