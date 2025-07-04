const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔧 INITIALIZING LEADFIVE V1.10 TESTNET CONTRACT");
        console.log("================================================");
        
        const contractAddress = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944";
        
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(contractAddress);
        
        const [deployer] = await ethers.getSigners();
        console.log("🔑 Using deployer:", deployer.address);
        console.log("👑 Contract owner:", await contract.owner());
        
        // Step 1: Initialize v1.1 features if needed
        console.log("\n🔧 Step 1: Initialize v1.1 features...");
        try {
            const tx1 = await contract.initializeV1_1();
            await tx1.wait();
            console.log("✅ V1.1 initialization complete");
        } catch (error) {
            if (error.message.includes("Already initialized")) {
                console.log("ℹ️  V1.1 already initialized");
            } else {
                console.log("❌ V1.1 initialization error:", error.message);
            }
        }
        
        // Step 2: Fix root user issue
        console.log("\n🔧 Step 2: Fix root user issue...");
        try {
            const tx2 = await contract.fixRootUserIssue();
            await tx2.wait();
            console.log("✅ Root user issue fixed");
        } catch (error) {
            console.log("❌ Root user fix error:", error.message);
        }
        
        // Step 3: Register as root with highest package
        console.log("\n🔧 Step 3: Register as root user...");
        try {
            const tx3 = await contract.registerAsRoot(4); // Highest package
            await tx3.wait();
            console.log("✅ Registered as root with package 4");
        } catch (error) {
            if (error.message.includes("Already registered")) {
                console.log("ℹ️  Already registered as root");
            } else {
                console.log("❌ Root registration error:", error.message);
            }
        }
        
        // Step 4: Activate all levels for root
        console.log("\n🔧 Step 4: Activate all levels for root...");
        try {
            const tx4 = await contract.activateAllLevelsForRoot();
            await tx4.wait();
            console.log("✅ All levels activated for root");
        } catch (error) {
            console.log("❌ Level activation error:", error.message);
        }
        
        // Step 5: Check final status
        console.log("\n📊 Final Contract Status:");
        try {
            const stats = await contract.getContractStats();
            console.log("👥 Total users:", stats.totalUsers.toString());
            console.log("💰 Total volume:", ethers.formatUnits(stats.totalVolume, 18), "USDT");
        } catch (error) {
            console.log("❌ Error getting stats:", error.message);
        }
        
        // Check package prices
        console.log("\n📦 Package Information:");
        for (let i = 1; i <= 4; i++) {
            try {
                const packageInfo = await contract.getPackageInfo(i);
                console.log(`   Package ${i}: ${ethers.formatUnits(packageInfo.price, 18)} USDT`);
            } catch (error) {
                console.log(`❌ Error getting package ${i} info:`, error.message);
            }
        }
        
        console.log("\n🎉 TESTNET CONTRACT SETUP COMPLETE!");
        console.log("📍 Contract Address:", contractAddress);
        console.log("👑 Owner:", await contract.owner());
        console.log("\n✅ Ready for comprehensive testing!");
        
    } catch (error) {
        console.error("💥 Setup failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
