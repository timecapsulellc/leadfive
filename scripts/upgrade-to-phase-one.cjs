const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Starting LeadFive Phase One Upgrade Process...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "BNB");

    // Current proxy address from mainnet deployment
    const PROXY_ADDRESS = "0xbc62356BB04b7f0F18b205A5f42Dba83d4C019e6";
    
    console.log("📋 Current proxy address:", PROXY_ADDRESS);
    
    try {
        // Get the LeadFivePhaseOne contract factory
        console.log("📦 Getting LeadFivePhaseOne contract factory...");
        const LeadFivePhaseOne = await ethers.getContractFactory("LeadFivePhaseOne");
        
        // Upgrade the proxy to the new implementation
        console.log("⬆️  Upgrading proxy to LeadFivePhaseOne...");
        const upgradedContract = await upgrades.upgradeProxy(PROXY_ADDRESS, LeadFivePhaseOne);
        
        // Wait for upgrade transaction to be mined
        console.log("⏳ Waiting for upgrade transaction to be mined...");
        await upgradedContract.waitForDeployment();
        
        console.log("✅ Successfully upgraded to LeadFivePhaseOne!");
        console.log("📍 Proxy address (unchanged):", await upgradedContract.getAddress());
        
        // Get implementation address
        const implementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
        console.log("🏗️  New implementation address:", implementationAddress);
        
        // Initialize Phase One if needed
        try {
            console.log("🔄 Calling initializePhaseOne...");
            const initTx = await upgradedContract.initializePhaseOne();
            await initTx.wait();
            console.log("✅ Phase One initialization completed!");
        } catch (error) {
            if (error.message.includes("already initialized")) {
                console.log("ℹ️  Contract already initialized, skipping initialization");
            } else {
                console.log("⚠️  Initialization error (might be expected):", error.message);
            }
        }
        
        // Verify the upgrade was successful
        console.log("\n📊 Verifying upgrade...");
        const contractStats = await upgradedContract.getContractStats();
        console.log("Total users:", contractStats[0].toString());
        console.log("Platform fees collected:", ethers.formatEther(contractStats[1]), "USDT");
        console.log("Contract balance:", ethers.formatEther(contractStats[2]), "BNB");
        console.log("Next position ID:", contractStats[3].toString());
        
        // Check pool info
        const poolInfo = await upgradedContract.getPoolInfo();
        console.log("\n🏊 Pool Balances:");
        console.log("Leadership Pool:", ethers.formatEther(poolInfo[0]), "USDT");
        console.log("Community Pool:", ethers.formatEther(poolInfo[1]), "USDT");
        console.log("Club Pool:", ethers.formatEther(poolInfo[2]), "USDT");
        console.log("Algorithmic Pool:", ethers.formatEther(poolInfo[3]), "USDT");
        
        console.log("\n🎉 LeadFive Phase One upgrade completed successfully!");
        console.log("🔗 Proxy address:", PROXY_ADDRESS);
        console.log("🏗️  Implementation address:", implementationAddress);
        
        // Create upgrade summary
        const upgradeInfo = {
            timestamp: new Date().toISOString(),
            proxyAddress: PROXY_ADDRESS,
            implementationAddress: implementationAddress,
            deployerAddress: deployer.address,
            networkName: "BSC Mainnet",
            contractName: "LeadFivePhaseOne",
            gasUsed: "TBD" // Will be filled by actual transaction
        };
        
        console.log("\n📄 Upgrade Summary:");
        console.log(JSON.stringify(upgradeInfo, null, 2));
        
        return {
            success: true,
            proxyAddress: PROXY_ADDRESS,
            implementationAddress: implementationAddress,
            contract: upgradedContract
        };
        
    } catch (error) {
        console.error("❌ Upgrade failed:", error);
        throw error;
    }
}

// Handle script execution
if (require.main === module) {
    main()
        .then(() => {
            console.log("\n✅ Upgrade script completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n❌ Upgrade script failed:", error);
            process.exit(1);
        });
}

module.exports = main;
