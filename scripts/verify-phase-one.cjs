const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying LeadFive Phase One Contract...");
    
    const PROXY_ADDRESS = "0xbc62356BB04b7f0F18b205A5f42Dba83d4C019e6";
    
    // Connect to the contract
    const LeadFivePhaseOne = await ethers.getContractFactory("LeadFivePhaseOne");
    const contract = LeadFivePhaseOne.attach(PROXY_ADDRESS);
    
    console.log("📍 Contract address:", PROXY_ADDRESS);
    
    try {
        // Basic contract info
        console.log("\n📊 Contract Statistics:");
        const stats = await contract.getContractStats();
        console.log("- Total Users:", stats[0].toString());
        console.log("- Platform Fees Collected:", ethers.formatEther(stats[1]), "USDT");
        console.log("- Contract Balance:", ethers.formatEther(stats[2]), "BNB");
        console.log("- Next Position ID:", stats[3].toString());
        
        // Pool information
        console.log("\n🏊 Pool Information:");
        const poolInfo = await contract.getPoolInfo();
        console.log("- Leadership Pool:", ethers.formatEther(poolInfo[0]), "USDT");
        console.log("- Community Pool:", ethers.formatEther(poolInfo[1]), "USDT");
        console.log("- Club Pool:", ethers.formatEther(poolInfo[2]), "USDT");
        console.log("- Algorithmic Pool:", ethers.formatEther(poolInfo[3]), "USDT");
        
        // Check owner
        const owner = await contract.owner();
        console.log("\n👤 Contract Owner:", owner);
        
        // Check if contract is paused
        const isPaused = await contract.paused();
        console.log("⏸️  Contract Paused:", isPaused);
        
        // Test package info
        console.log("\n📦 Package Information:");
        for (let i = 1; i <= 4; i++) {
            try {
                const packageInfo = await contract.packages(i);
                console.log(`- Package ${i}: ${ethers.formatEther(packageInfo.price)} USDT`);
            } catch (error) {
                console.log(`- Package ${i}: Error reading package`);
            }
        }
        
        // Test oracle functionality
        console.log("\n🔮 Oracle Status:");
        try {
            const priceConfig = await contract.priceConfig();
            console.log("- Min Price:", priceConfig.minPrice.toString());
            console.log("- Max Price:", priceConfig.maxPrice.toString());
            console.log("- Max Stale Time:", priceConfig.maxStaleTime.toString());
        } catch (error) {
            console.log("- Oracle configuration error:", error.message);
        }
        
        console.log("\n✅ Contract verification completed!");
        
    } catch (error) {
        console.error("❌ Verification failed:", error);
    }
}

main()
    .then(() => {
        console.log("\n✅ Verification script completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Verification script failed:", error);
        process.exit(1);
    });
