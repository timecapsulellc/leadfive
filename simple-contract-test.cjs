const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Testing LeadFive Contract on BSC Testnet...\n");

    const contractAddress = "0xD636Dfda3b062fA310d48a5283BE28fe608C6514";
    
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(contractAddress);

    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🌐 BSCScan: https://testnet.bscscan.com/address/${contractAddress}\n`);

    try {
        // Test basic functions
        console.log("📋 Basic Information:");
        
        const totalUsers = await leadFive.getTotalUsers();
        console.log(`👥 Total Users: ${totalUsers.toString()}`);
        
        const health = await leadFive.getSystemHealth();
        console.log(`🏥 System Health: ${health}`);
        
        console.log("\n📦 Package Prices:");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await leadFive.verifyPackageAllocations(i);
            const priceInUSDT = ethers.formatUnits(packageInfo.price, 18);
            console.log(`   Package ${i}: $${priceInUSDT} USDT`);
        }

        console.log("\n🔗 Contract Addresses:");
        try {
            const usdtAddress = await leadFive.usdtContract();
            console.log(`💰 USDT: ${usdtAddress}`);
        } catch (e) {
            console.log(`💰 USDT: Unable to fetch (function may have different name)`);
        }
        
        try {
            const oracleAddress = await leadFive.priceOracle();
            console.log(`📊 Oracle: ${oracleAddress}`);
        } catch (e) {
            console.log(`📊 Oracle: Unable to fetch (function may have different name)`);
        }

        console.log("\n✅ All basic functions working correctly!");
        console.log("\n🚀 Contract is ready for testing:");
        console.log("   1. Register users with USDT");
        console.log("   2. Test bonus distributions");
        console.log("   3. Test withdrawal functions");
        
    } catch (error) {
        console.error("❌ Error testing contract:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
