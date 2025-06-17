const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Starting OrphiCrowdFund V2 Upgrade Deployment...");
    console.log("===============================================");

    // Get network
    const network = await ethers.provider.getNetwork();
    console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB`);

    // Current proxy address (from mainnet deployment)
    const PROXY_ADDRESS = process.env.CONTRACT_ADDRESS || "0xf9538Fe9FCF16C018E6057744555F2556f63cED9";
    console.log(`📄 Proxy Address: ${PROXY_ADDRESS}`);

    try {
        // Get the V2 contract factory
        console.log("\n📦 Getting OrphiCrowdFundV2 contract factory...");
        const OrphiCrowdFundV2 = await ethers.getContractFactory("OrphiCrowdFundV2");

        // Upgrade the proxy to V2
        console.log("\n⬆️  Upgrading proxy to V2...");
        const upgradedContract = await upgrades.upgradeProxy(PROXY_ADDRESS, OrphiCrowdFundV2);
        
        console.log("⏳ Waiting for upgrade transaction to be mined...");
        await upgradedContract.waitForDeployment();

        console.log("\n✅ Upgrade successful!");
        console.log(`📄 Proxy Address: ${await upgradedContract.getAddress()}`);
        console.log(`📄 Implementation Address: ${await upgrades.erc1967.getImplementationAddress(await upgradedContract.getAddress())}`);

        // Initialize V2 features
        console.log("\n🔧 Initializing V2 features...");
        try {
            const initTx = await upgradedContract.initializeV2();
            console.log(`⏳ Waiting for initialization transaction: ${initTx.hash}`);
            await initTx.wait();
            console.log("✅ V2 initialization complete!");
        } catch (error) {
            if (error.message.includes("already initialized")) {
                console.log("ℹ️  V2 already initialized");
            } else {
                console.log(`⚠️  V2 initialization failed: ${error.message}`);
            }
        }

        // Verify the upgrade
        console.log("\n🔍 Verifying upgrade...");
        
        // Check if new functions are available
        try {
            const adminCount = await upgradedContract.getTotalAdmins();
            console.log(`👥 Total Admins: ${adminCount}`);
            
            const activeAdminCount = await upgradedContract.getActiveAdminCount();
            console.log(`✅ Active Admins: ${activeAdminCount}`);
            
            const adminFee = await upgradedContract.adminRegistrationFee();
            console.log(`💳 Admin Registration Fee: ${ethers.formatEther(adminFee)} BNB`);
            
            const publicRegistration = await upgradedContract.publicAdminRegistration();
            console.log(`🌐 Public Admin Registration: ${publicRegistration}`);
            
            const maxAdmins = await upgradedContract.maxAdmins();
            console.log(`📊 Max Admins: ${maxAdmins}`);

        } catch (error) {
            console.log(`❌ Verification failed: ${error.message}`);
            throw error;
        }

        console.log("\n🎉 UPGRADE DEPLOYMENT SUCCESSFUL!");
        console.log("===============================================");
        console.log("📄 Contract Address (same):", await upgradedContract.getAddress());
        console.log("🔧 Implementation Updated: OrphiCrowdFundV2");
        console.log("✨ New Features:");
        console.log("   • Free Admin Registration");
        console.log("   • Multi-Admin System");
        console.log("   • Admin Whitelist");
        console.log("   • Enhanced Admin Management");
        console.log("   • Admin Statistics Tracking");
        
        console.log("\n📋 Next Steps:");
        console.log("1. Verify the new implementation on BSCScan");
        console.log("2. Test admin registration functions");
        console.log("3. Update frontend to use new admin features");
        console.log("4. Register initial admins using registerFreeAdmin()");
        
        console.log("\n🔧 Admin Registration Commands:");
        console.log("• Free registration: registerFreeAdmin('contact_info')");
        console.log("• Paid registration: registerPaidAdmin('contact_info')");
        console.log("• Whitelist admin: whitelistAdmin(address)");
        console.log("• Get all admins: getAllAdmins()");

        // Save deployment info
        const deploymentInfo = {
            network: network.name,
            chainId: network.chainId,
            proxyAddress: await upgradedContract.getAddress(),
            implementationAddress: await upgrades.erc1967.getImplementationAddress(await upgradedContract.getAddress()),
            deployer: deployer.address,
            version: "V2",
            upgradedAt: new Date().toISOString(),
            features: [
                "Free Admin Registration",
                "Multi-Admin System", 
                "Admin Whitelist",
                "Enhanced Admin Management",
                "Admin Statistics Tracking"
            ]
        };

        console.log("\n📁 Deployment Info:");
        console.log(JSON.stringify(deploymentInfo, null, 2));

        return upgradedContract;

    } catch (error) {
        console.error("\n❌ Upgrade failed:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 Solution: Add more BNB to deployer wallet");
        } else if (error.message.includes("nonce")) {
            console.log("💡 Solution: Wait a moment and try again");
        } else if (error.message.includes("gas")) {
            console.log("💡 Solution: Increase gas limit or gas price");
        }
        
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => {
            console.log("\n🎯 Upgrade deployment completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("\n💥 Upgrade deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;
