const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🔄 Upgrading existing proxy to LeadFive Phase One on BSC Testnet...");
    
    // Your existing testnet proxy address (if you have one)
    const existingProxyAddress = process.env.EXISTING_TESTNET_PROXY || "REPLACE_WITH_EXISTING_PROXY";
    
    if (existingProxyAddress === "REPLACE_WITH_EXISTING_PROXY") {
        console.log("❌ Please set EXISTING_TESTNET_PROXY environment variable");
        console.log("Or use deploy-testnet-phase-one.cjs to deploy a new proxy");
        return;
    }
    
    const [deployer] = await ethers.getSigners();
    console.log("Upgrader:", deployer.address);
    
    try {
        console.log("\n📋 Deploying new LeadFivePhaseOne implementation...");
        const LeadFivePhaseOne = await ethers.getContractFactory("LeadFivePhaseOne");
        
        console.log("🔄 Upgrading proxy to Phase One...");
        const upgraded = await upgrades.upgradeProxy(existingProxyAddress, LeadFivePhaseOne);
        
        console.log("✅ Proxy upgraded successfully");
        console.log("Proxy address:", await upgraded.getAddress());
        
        // Initialize Phase One features
        console.log("\n🔧 Initializing Phase One features...");
        try {
            const initTx = await upgraded.initializePhaseOne();
            await initTx.wait();
            console.log("✅ Phase One initialization complete");
        } catch (error) {
            if (error.message.includes("already initialized")) {
                console.log("ℹ️  Phase One already initialized");
            } else {
                throw error;
            }
        }
        
        // Verify upgrade
        console.log("\n🔍 Verifying upgrade...");
        const nextPosition = await upgraded.nextPositionId();
        console.log("Next position ID:", nextPosition.toString());
        
        const poolInfo = await upgraded.getPoolInfo();
        console.log("Algorithmic pool balance:", ethers.formatEther(poolInfo[3]));
        
        console.log("\n✅ TESTNET UPGRADE COMPLETE");
        console.log("Ready for feature testing!");
        
    } catch (error) {
        console.error("❌ Upgrade failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
