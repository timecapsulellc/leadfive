const { ethers } = require("hardhat");

/**
 * Estimate gas costs for secure deployment
 */
async function estimateDeploymentGas() {
    console.log("🔍 ESTIMATING DEPLOYMENT GAS COSTS");
    console.log("=" .repeat(50));
    
    try {
        // Get current gas price
        const gasPrice = await ethers.provider.getGasPrice();
        console.log(`⛽ Current Gas Price: ${ethers.formatUnits(gasPrice, "gwei")} Gwei`);
        
        // Estimated gas usage for each step
        const gasEstimates = {
            "Deploy InternalAdminManager": 2500000,
            "Deploy OrphiCrowdFund": 3000000,
            "Link contracts": 100000,
            "Initialize admin manager": 150000,
            "Add internal admins": 200000,
            "Transfer ownerships (2x)": 200000,
            "Transfer roles (6x)": 600000,
            "Buffer (safety margin)": 500000
        };
        
        let totalGas = 0;
        console.log("\n📊 Gas Breakdown:");
        
        for (const [step, gas] of Object.entries(gasEstimates)) {
            const cost = gasPrice * BigInt(gas);
            const costBNB = ethers.formatEther(cost);
            console.log(`   ${step}: ${gas.toLocaleString()} gas = ${costBNB} BNB`);
            totalGas += gas;
        }
        
        const totalCost = gasPrice * BigInt(totalGas);
        const totalCostBNB = ethers.formatEther(totalCost);
        
        console.log("\n💰 TOTAL ESTIMATED COST:");
        console.log(`   Total Gas: ${totalGas.toLocaleString()}`);
        console.log(`   Total Cost: ${totalCostBNB} BNB`);
        
        const recommendedFunding = parseFloat(totalCostBNB) * 1.5; // 50% buffer
        console.log(`   Recommended Funding: ${recommendedFunding.toFixed(4)} BNB`);
        
        console.log("\n💡 RECOMMENDATIONS:");
        console.log(`   • Fund with: ${recommendedFunding.toFixed(4)} BNB (includes 50% safety buffer)`);
        console.log(`   • Expected leftover: ~${(recommendedFunding - parseFloat(totalCostBNB)).toFixed(4)} BNB`);
        console.log(`   • Leftover will be lost when private key is destroyed`);
        
        return {
            totalGas,
            totalCostBNB: parseFloat(totalCostBNB),
            recommendedFunding
        };
        
    } catch (error) {
        console.error("❌ Error estimating gas:", error.message);
        console.log("\n🔄 Fallback recommendation: Fund with 0.1 BNB");
        return {
            totalGas: 7000000,
            totalCostBNB: 0.05,
            recommendedFunding: 0.1
        };
    }
}

// Run estimation
if (require.main === module) {
    estimateDeploymentGas()
        .then(() => process.exit(0))
        .catch(console.error);
}

module.exports = estimateDeploymentGas;
