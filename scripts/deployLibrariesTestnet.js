const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("📚 DEPLOYING LIBRARIES TO BSC TESTNET");
    console.log("=" .repeat(50));

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    const libraries = {};

    try {
        // Deploy libraries one by one
        const librariesToDeploy = [
            "AdvancedFeaturesLib",
            "BusinessLogicLib", 
            "PoolDistributionLib",
            "WithdrawalSafetyLib",
            "MatrixManagementLib"
        ];

        for (const libName of librariesToDeploy) {
            try {
                console.log(`\n📚 Deploying ${libName}...`);
                const LibFactory = await ethers.getContractFactory(`contracts/libraries/${libName}.sol:${libName}`);
                const lib = await LibFactory.deploy();
                await lib.waitForDeployment();
                
                libraries[libName] = lib.target;
                console.log(`✅ ${libName} deployed to:`, lib.target);
            } catch (error) {
                console.log(`⚠️  ${libName} deployment skipped:`, error.message);
            }
        }

        console.log("\n📋 DEPLOYED LIBRARIES:");
        console.log("=".repeat(30));
        Object.entries(libraries).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });

        // Save library addresses for contract deployment
        const fs = require('fs');
        const libraryData = {
            network: "BSC Testnet",
            timestamp: new Date().toISOString(),
            libraries: libraries
        };
        
        fs.writeFileSync('testnet-libraries.json', JSON.stringify(libraryData, null, 2));
        console.log("\n💾 Library addresses saved to: testnet-libraries.json");

        return libraries;

    } catch (error) {
        console.error("❌ Library deployment failed:", error);
        throw error;
    }
}

if (require.main === module) {
    main()
        .then((libraries) => {
            console.log("\n🎉 LIBRARIES DEPLOYED TO TESTNET!");
            console.log("🔧 Ready for main contract deployment!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Library deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;