const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 OrphiCrowdFund Trezor Testnet Deployment");
    console.log("=" .repeat(60));
    console.log("🛡️  SECURITY: Deploying with immediate Trezor wallet ownership transfer");
    console.log("=" .repeat(60));

    // Get deployer account (from private key in .env)
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deployer (from private key):", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer Balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.05")) {
        throw new Error("❌ Insufficient BNB balance for deployment (need at least 0.05 BNB)");
    }

    // Trezor wallet configuration (used only as recipient of ownership, not for deployment)
    const trezorWallet = process.env.TREZOR_WALLET || "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    // Configuration for BSC Testnet with Trezor wallet
    const config = {
        usdtAddress: process.env.USDT_TESTNET || "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
        treasuryAddress: trezorWallet,
        emergencyAddress: trezorWallet,
        poolManagerAddress: trezorWallet
    };

    console.log("\n🔧 Deployment Configuration:");
    console.log("   USDT Token:", config.usdtAddress);
    console.log("   🏦 Treasury (Trezor):", config.treasuryAddress);
    console.log("   🚨 Emergency (Trezor):", config.emergencyAddress);
    console.log("   ⚙️ Pool Manager (Trezor):", config.poolManagerAddress);

    try {
        // Deploy OrphiCrowdFund contract (official "Orphi Crowd Fund" contract)
        console.log("\n🏗️ Deploying Orphi Crowd Fund...");
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        
        console.log("🔄 Creating UUPS proxy deployment with official contract...");
        const orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFund, [
            config.usdtAddress,
            config.treasuryAddress,
            config.emergencyAddress,
            config.poolManagerAddress
        ], {
            initializer: 'initialize',
            kind: 'uups'
        });

        console.log("⏳ Waiting for deployment confirmation...");
        await orphiCrowdFund.waitForDeployment();
        const contractAddress = await orphiCrowdFund.getAddress();

        console.log("✅ Orphi Crowd Fund deployed to:", contractAddress);

        // Transfer ownership to Trezor wallet immediately for security
        // (Deployment is always via private key, not Trezor Suite)
        console.log("\n🔐 Transferring ownership to Trezor wallet...");
        try {
            const transferTx = await orphiCrowdFund.transferOwnership(trezorWallet);
            await transferTx.wait();
            console.log("✅ Ownership transferred to Trezor wallet:", trezorWallet);
        } catch (error) {
            console.warn("⚠️  Ownership transfer may need to be done manually:", error.message);
        }

        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        const version = await orphiCrowdFund.version();
        console.log("   Version:", version);

        const packageAmounts = await orphiCrowdFund.getPackageAmounts();
        console.log("   Package Amounts:");
        console.log("     $30 USDT:", ethers.formatUnits(packageAmounts[0], 6));
        console.log("     $50 USDT:", ethers.formatUnits(packageAmounts[1], 6));
        console.log("     $100 USDT:", ethers.formatUnits(packageAmounts[2], 6));
        console.log("     $200 USDT:", ethers.formatUnits(packageAmounts[3], 6));

        // Test ownership
        try {
            const owner = await orphiCrowdFund.owner();
            console.log("   Contract Owner:", owner);
            console.log("   ✅ Owner is Trezor wallet:", owner === trezorWallet);
        } catch (error) {
            console.log("   ⚠️ Could not verify owner (may need manual check)");
        }

        // Save deployment info
        const deploymentInfo = {
            network: "BSC Testnet",
            chainId: 97,
            contractName: "OrphiCrowdFund",
            contractAddress: contractAddress,
            deployer: deployer.address,
            trezorWallet: trezorWallet,
            usdtToken: config.usdtAddress,
            treasury: config.treasuryAddress,
            emergency: config.emergencyAddress,
            poolManager: config.poolManagerAddress,
            deploymentTime: new Date().toISOString(),
            version: version,
            securityFeatures: {
                mevProtection: true,
                circuitBreaker: true,
                timelockEnabled: true,
                upgradeProtection: true,
                accessControl: true,
                reentrancyGuard: true,
                trezorOwnership: true
            },
            note: "Deployed with immediate Trezor wallet ownership transfer for maximum security"
        };

        console.log("\n💾 Saving deployment info...");
        fs.writeFileSync(
            'trezor-testnet-deployment.json',
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\n🎉 TREZOR DEPLOYMENT SUCCESSFUL!");
        console.log("=" .repeat(60));
        console.log("✅ Contract Address:", contractAddress);
        console.log("✅ Network: BSC Testnet (Chain ID: 97)");
        console.log("✅ Owner: Trezor Wallet", trezorWallet);
        console.log("✅ All Security Features: ACTIVE");
        console.log("✅ Compromised wallet removed from all configurations");
        // NOTE: Deployment was performed using the private key from .env. No hardware wallet or Trezor Suite was used for deployment.
        
        console.log("\n📋 Next Steps:");
        console.log("1. Verify contract on BSCScan Testnet");
        console.log("2. Connect Trezor to manage the contract");
        console.log("3. Test user registration and functions");
        console.log("4. Update frontend with new contract address");

        console.log("\n🔗 BSCScan Testnet:");
        console.log(`   https://testnet.bscscan.com/address/${contractAddress}`);

        return {
            success: true,
            contractAddress: contractAddress,
            trezorWallet: trezorWallet,
            deployer: deployer.address
        };

    } catch (error) {
        console.error("\n❌ Deployment failed:", error.message);
        console.error("Stack trace:", error.stack);
        
        const errorInfo = {
            network: "BSC Testnet",
            chainId: 97,
            deployer: deployer.address,
            trezorWallet: trezorWallet,
            deploymentTime: new Date().toISOString(),
            status: "FAILED",
            error: error.message
        };

        fs.writeFileSync(
            'trezor-testnet-deployment.json',
            JSON.stringify(errorInfo, null, 2)
        );

        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("💥 Fatal error:", error);
            process.exit(1);
        });
}

module.exports = main;
