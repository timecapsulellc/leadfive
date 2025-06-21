#!/usr/bin/env node

/**
 * LeadFive Contract Feature Comparison Script
 * Compares LeadFiveModular vs Full LeadFive contract features
 */

console.log("🔍 LEADFIVE CONTRACT FEATURE COMPARISON");
console.log("=" * 60);

const features = {
    "Basic MLM Features": {
        "User Registration": { modular: "✅", full: "✅" },
        "Package System (4 levels)": { modular: "✅", full: "✅" },
        "Binary Matrix": { modular: "✅", full: "✅" },
        "Direct Referral Bonuses": { modular: "✅", full: "✅" },
        "Level Bonuses": { modular: "✅", full: "✅" },
        "Pool Systems (3 pools)": { modular: "✅", full: "✅" },
        "Admin Fee (5%)": { modular: "✅", full: "✅" },
        "Progressive Withdrawal": { modular: "✅", full: "✅" }
    },
    "Advanced Features": {
        "Root User System": { modular: "❌", full: "✅" },
        "Referral Code Generation": { modular: "❌", full: "✅" },
        "Register by Referral Code": { modular: "❌", full: "✅" },
        "Team Size Calculation": { modular: "❌", full: "✅" },
        "Auto-Reinvestment Upgrades": { modular: "❌", full: "✅" },
        "Enhanced Help Pool (Batch)": { modular: "❌", full: "✅" },
        "Help Pool Eligibility Management": { modular: "❌", full: "✅" },
        "Leader Qualification System": { modular: "❌", full: "✅" },
        "Matrix Level Calculations": { modular: "❌", full: "✅" },
        "Delayed Ownership Transfer": { modular: "❌", full: "✅" }
    },
    "Security Features": {
        "MEV Protection": { modular: "✅", full: "✅" },
        "Reentrancy Guards": { modular: "✅", full: "✅" },
        "Pausable Contract": { modular: "✅", full: "✅" },
        "Gas Limit Protection": { modular: "✅", full: "✅" },
        "Earnings Cap Enforcement": { modular: "✅", full: "✅" },
        "7-Day Ownership Delay": { modular: "❌", full: "✅" },
        "Enhanced Blacklisting": { modular: "❌", full: "✅" },
        "Overflow Protection": { modular: "✅", full: "✅" }
    },
    "Statistics & Analytics": {
        "Basic User Info": { modular: "✅", full: "✅" },
        "Pool Balances": { modular: "✅", full: "✅" },
        "Admin Fee Info": { modular: "✅", full: "✅" },
        "Leader Statistics": { modular: "❌", full: "✅" },
        "System-wide Statistics": { modular: "❌", full: "✅" },
        "Withdrawal Breakdown": { modular: "❌", full: "✅" },
        "Matrix Position Info": { modular: "❌", full: "✅" },
        "Team Size Reports": { modular: "❌", full: "✅" }
    },
    "Technical Features": {
        "UUPS Upgradeability": { modular: "✅", full: "✅" },
        "Library-based Architecture": { modular: "✅", full: "❌" },
        "Comprehensive Events": { modular: "✅", full: "✅" },
        "Price Oracle Integration": { modular: "✅", full: "✅" },
        "Dual Payment (BNB/USDT)": { modular: "✅", full: "✅" },
        "Emergency Functions": { modular: "✅", full: "✅" },
        "Gas Optimization": { modular: "✅", full: "✅" }
    }
};

function printComparison() {
    for (const [category, categoryFeatures] of Object.entries(features)) {
        console.log(`\n📂 ${category.toUpperCase()}`);
        console.log("-" * 50);
        
        for (const [feature, support] of Object.entries(categoryFeatures)) {
            const modularStatus = support.modular;
            const fullStatus = support.full;
            console.log(`${feature.padEnd(35)} | ${modularStatus} | ${fullStatus}`);
        }
    }
}

function calculateStats() {
    let modularTotal = 0;
    let fullTotal = 0;
    let totalFeatures = 0;
    
    for (const [category, categoryFeatures] of Object.entries(features)) {
        for (const [feature, support] of Object.entries(categoryFeatures)) {
            totalFeatures++;
            if (support.modular === "✅") modularTotal++;
            if (support.full === "✅") fullTotal++;
        }
    }
    
    console.log("\n" + "=" * 60);
    console.log("📊 FEATURE COMPARISON SUMMARY");
    console.log("=" * 60);
    console.log(`Total Features Analyzed: ${totalFeatures}`);
    console.log(`LeadFiveModular Support: ${modularTotal}/${totalFeatures} (${Math.round(modularTotal/totalFeatures*100)}%)`);
    console.log(`Full LeadFive Support: ${fullTotal}/${totalFeatures} (${Math.round(fullTotal/totalFeatures*100)}%)`);
    console.log(`Missing Features in Modular: ${fullTotal - modularTotal}`);
    
    console.log("\n🚨 CRITICAL FINDING:");
    console.log(`You're missing ${fullTotal - modularTotal} advanced features in LeadFiveModular!`);
    console.log(`Feature completeness: ${Math.round(modularTotal/fullTotal*100)}%`);
}

printComparison();
calculateStats();

console.log("\n🔧 RECOMMENDATION:");
console.log("Deploy the FULL LeadFive contract to get all 100% of features!");
console.log("Use: scripts/deploy-leadfive-testnet.cjs (now updated to use full contract)");

console.log("\n✅ SCRIPT UPDATED:");
console.log("The testnet deployment script has been fixed to use the full LeadFive contract.");
