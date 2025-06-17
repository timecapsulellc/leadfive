#!/usr/bin/env node
/**
 * BSCScan Contract Verification Script
 * Verifies the OrphiCrowdFund contract on BSC Testnet
 */

const { run } = require("hardhat");

async function main() {
    console.log("\n🔍 VERIFYING CONTRACT ON BSCSCAN TESTNET");
    console.log("═".repeat(50));
    
    const contractAddress = "0x6fA993A33AA860A79E15ae44AC9390465c5f02aC";
    const usdtTokenAddress = "0xa78E507928afA5501468a6C4D0A32b14E3cD3c04"; // BSC Testnet USDT
    const packageAmounts = [30000000, 50000000, 100000000, 200000000, 0]; // USDT amounts (6 decimals)
    
    try {
        console.log("📍 Contract Address:", contractAddress);
        console.log("🏗️  Starting verification...");
        
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [], // Proxy contract has no constructor args
            contract: "contracts/OrphiCrowdFund.sol:OrphiCrowdFund"
        });
        
        console.log("\n✅ CONTRACT VERIFICATION SUCCESSFUL!");
        console.log("🌐 View on BSCScan: https://testnet.bscscan.com/address/" + contractAddress);
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract already verified on BSCScan!");
            console.log("🌐 View on BSCScan: https://testnet.bscscan.com/address/" + contractAddress);
        } else {
            console.error("❌ Verification failed:", error.message);
            console.log("\n📝 Manual verification details:");
            console.log("Contract: OrphiCrowdFund");
            console.log("Compiler: v0.8.22+commit.4fc1097e");
            console.log("Optimization: Yes, 1000 runs");
            console.log("USDT Token:", usdtTokenAddress);
            console.log("Package Amounts:", packageAmounts);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
