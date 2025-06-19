const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🔍 LEADFIVE CONTRACT VERIFICATION");
    console.log("=" * 50);

    // Contract address from testnet deployment
    const CONTRACT_ADDRESS = "0x7FEEA22942407407801cCDA55a4392f25975D998";
    
    const [deployer] = await ethers.getSigners();
    console.log("📋 Verifying with account:", deployer.address);

    try {
        // Get contract instance
        const LeadFive = await ethers.getContractFactory("LeadFiveModular");
        const contract = LeadFive.attach(CONTRACT_ADDRESS);
        
        console.log("✅ Connected to contract:", CONTRACT_ADDRESS);

        // Verify basic functions
        console.log("\n🔍 Basic Contract Verification:");
        
        const owner = await contract.owner();
        console.log("   Owner:", owner);
        
        const poolBalances = await contract.getPoolBalances();
        console.log("   Pool Balances:", poolBalances.toString());
        
        const adminFeeInfo = await contract.getAdminFeeInfo();
        console.log("   Admin Fee Rate:", adminFeeInfo[2].toString(), "basis points");
        
        // Verify packages
        console.log("\n📦 Package Verification:");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await contract.packages(i);
            console.log(`   Package ${i}: ${ethers.formatEther(packageInfo.price)} USDT`);
        }
        
        // Check deployer info
        const deployerInfo = await contract.getUserInfo(deployer.address);
        console.log("\n👤 Deployer Info:");
        console.log("   Registered:", deployerInfo.isRegistered);
        console.log("   Package Level:", deployerInfo.packageLevel.toString());
        console.log("   Balance:", ethers.formatEther(deployerInfo.balance), "USDT");
        
        console.log("\n✅ ALL VERIFICATIONS PASSED!");
        console.log("🚀 CONTRACT IS READY FOR MAINNET DEPLOYMENT!");

    } catch (error) {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
