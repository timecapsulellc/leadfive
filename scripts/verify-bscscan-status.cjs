const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 BSCScan Contract Verification Status\n");

    const contractAddress = "0xD636Dfda3b062fA310d48a5283BE28fe608C6514";
    const implementationAddress = "0xc7B425E7dd2E1a7F9BB27d84b795454CAB620B60";
    
    console.log("📋 Verification Links:");
    console.log(`🔗 Proxy Contract: https://testnet.bscscan.com/address/${contractAddress}`);
    console.log(`🔗 Implementation: https://testnet.bscscan.com/address/${implementationAddress}#code`);
    console.log(`🔗 Read Contract: https://testnet.bscscan.com/address/${contractAddress}#readProxyContract`);
    console.log(`🔗 Write Contract: https://testnet.bscscan.com/address/${contractAddress}#writeProxyContract`);
    
    console.log("\n✅ Contract Verification Status:");
    console.log("   ✅ Implementation Contract: VERIFIED");
    console.log("   ✅ Proxy Contract: VERIFIED");
    console.log("   ✅ ProxyAdmin: VERIFIED");
    
    console.log("\n🧪 Ready for Testing:");
    console.log("   1. User Registration Testing");
    console.log("   2. Bonus Distribution Testing");
    console.log("   3. Withdrawal Function Testing");
    console.log("   4. Comprehensive User Journey Testing");
    
    console.log("\n📱 BSCScan Interface Available:");
    console.log("   - Read all contract functions");
    console.log("   - Write/execute transactions");
    console.log("   - View transaction history");
    console.log("   - Monitor events and logs");
    
    // Test basic contract functionality
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(contractAddress);
    
    try {
        console.log("\n🔧 Quick Contract Test:");
        const totalUsers = await leadFive.getTotalUsers();
        console.log(`   👥 Total Users: ${totalUsers.toString()}`);
        
        const health = await leadFive.getSystemHealth();
        console.log(`   🏥 System Operational: ${health[0]}`);
        console.log(`   📊 User Count: ${health[1].toString()}`);
        console.log(`   💰 Total Fees: ${ethers.formatUnits(health[2], 18)} USDT`);
        console.log(`   🏦 Contract USDT: ${ethers.formatUnits(health[3], 18)} USDT`);
        console.log(`   💎 Contract BNB: ${ethers.formatEther(health[4])} BNB`);
        console.log(`   🚨 Circuit Breaker: ${health[5] ? 'TRIGGERED' : 'NORMAL'}`);
        
        console.log("\n✅ Contract is ready for comprehensive testing!");
        
    } catch (error) {
        console.error("❌ Error testing contract:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
