#!/usr/bin/env node
/**
 * Verify BSC Testnet Deployment
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔍 VERIFYING BSC TESTNET DEPLOYMENT");
    console.log("═".repeat(50));
    
    const contractAddress = "0x6fA993A33AA860A79E15ae44AC9390465c5f02aC";
    const contract = await ethers.getContractAt("OrphiCrowdFund", contractAddress);
    
    try {
        console.log("📍 Contract Address:", contractAddress);
        console.log("📄 Contract Name:", await contract.contractName());
        console.log("🏷️  Version:", await contract.version());
        console.log("💵 USDT Token:", await contract.usdtToken());
        console.log("👥 Total Users:", (await contract.totalUsers()).toString());
        console.log("💰 Package Amounts:", (await contract.getPackageAmounts()).map(n => ethers.formatUnits(n, 6)));
        console.log("🔐 Trezor Admin:", await contract.TREZOR_ADMIN_WALLET());
        console.log("⏸️  Paused:", await contract.paused());
        
        console.log("\n✅ CONTRACT VERIFICATION SUCCESSFUL!");
        console.log("🚀 Ready for BSC Testnet Testing");
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
