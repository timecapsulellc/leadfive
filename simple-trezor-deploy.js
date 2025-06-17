const { ethers, upgrades } = require("hardhat");
require("dotenv").config({ path: ".env.trezor" });

async function main() {
    console.log("=".repeat(70));
    console.log("🚀 ORPHI CROWDFUND TREZOR DEPLOYMENT - BSC TESTNET");
    console.log("=".repeat(70));
    console.log("📅 Date:", new Date().toISOString());
    
    try {
        // Network verification
        const network = await ethers.provider.getNetwork();
        console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        if (Number(network.chainId) !== 97) {
            throw new Error("❌ Not connected to BSC Testnet! Expected Chain ID: 97");
        }
        
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        console.log(`👤 Deployer: ${deployer.address}`);
        
        // Check balance
        const balance = await ethers.provider.getBalance(deployer.address);
        const balanceEth = ethers.formatEther(balance);
        console.log(`💰 Balance: ${balanceEth} BNB`);
        
        if (Number(balanceEth) < 0.05) {
            throw new Error("❌ Insufficient BNB balance! Need at least 0.05 BNB for deployment.");
        }
        
        // Configuration
        const trezorWallet = process.env.TREZOR_WALLET || "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        const usdtAddress = process.env.USDT_TESTNET || "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
        
        console.log("\n🔧 Configuration:");
        console.log(`   USDT Token: ${usdtAddress}`);
        console.log(`   Trezor Wallet: ${trezorWallet}`);
        console.log(`   All admin roles will be assigned to Trezor wallet`);
        
        // Deploy contract
        console.log("\n🏗️ Starting deployment...");
        const ContractFactory = await ethers.getContractFactory("OrphiCrowdFund");
        
        console.log("📦 Deploying UUPS proxy...");
        const contract = await upgrades.deployProxy(ContractFactory, [
            usdtAddress,    // USDT token
            trezorWallet,   // Treasury address
            trezorWallet,   // Emergency address
            trezorWallet    // Pool manager address
        ], {
            initializer: 'initialize',
            kind: 'uups',
            timeout: 300000 // 5 minutes
        });
        
        console.log("⏳ Waiting for deployment...");
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        console.log(`✅ Contract deployed: ${contractAddress}`);
        
        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        const owner = await contract.owner();
        console.log(`   Owner: ${owner}`);
        console.log(`   Is Trezor owner: ${owner.toLowerCase() === trezorWallet.toLowerCase()}`);
        
        // Save deployment info
        const deploymentInfo = {
            network: "BSC Testnet",
            chainId: 97,
            contractAddress,
            deployer: deployer.address,
            trezorWallet,
            usdtToken: usdtAddress,
            deploymentTime: new Date().toISOString(),
            txHash: contract.deploymentTransaction()?.hash || "N/A"
        };
        
        const fs = require('fs');
        fs.writeFileSync(
            'fresh-trezor-deployment.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n🎉 DEPLOYMENT COMPLETED!");
        console.log("=".repeat(70));
        console.log(`📍 Contract: ${contractAddress}`);
        console.log(`🔗 BSCScan: https://testnet.bscscan.com/address/${contractAddress}`);
        console.log(`💾 Info saved: fresh-trezor-deployment.json`);
        
        return {
            success: true,
            contractAddress,
            deploymentInfo
        };
        
    } catch (error) {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error.message);
        
        // Save error info
        const errorInfo = {
            network: "BSC Testnet",
            status: "FAILED",
            error: error.message,
            timestamp: new Date().toISOString()
        };
        
        const fs = require('fs');
        fs.writeFileSync(
            'deployment-error.json',
            JSON.stringify(errorInfo, null, 2)
        );
        
        throw error;
    }
}

if (require.main === module) {
    main()
        .then(() => {
            console.log("✅ Script completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Fatal error:", error.message);
            process.exit(1);
        });
}

module.exports = main;
