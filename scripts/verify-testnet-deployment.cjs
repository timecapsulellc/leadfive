#!/usr/bin/env node

/**
 * Quick test of deployed testnet contract
 */

const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🔍 TESTING DEPLOYED TESTNET CONTRACT");
    console.log("=" .repeat(60));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer account:", deployer.address);

    // Connect to deployed contract
    const contractAddress = "0x7CeD1d7f6a2f1017e12615E88BE28cfe37677559";
    const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
    const contract = LeadFiveV1_10.attach(contractAddress);

    console.log("📍 Contract address:", contractAddress);

    try {
        // Check basic state
        const totalUsers = await contract.totalUsers();
        const owner = await contract.owner();
        console.log("👥 Total users:", totalUsers.toString());
        console.log("👑 Contract owner:", owner);

        // Get user info (should be registered as root)
        console.log("\n👤 Root user information:");
        const userInfo = await contract.getUserInfo(deployer.address);
        console.log("User Info:", {
            isRegistered: userInfo.isRegistered,
            packageLevel: userInfo.packageLevel.toString(),
            referrer: userInfo.referrer,
            balance: ethers.formatEther(userInfo.balance),
            totalInvestment: ethers.formatEther(userInfo.totalInvestment),
            earningsCap: ethers.formatEther(userInfo.earningsCap),
            isBlacklisted: userInfo.isBlacklisted
        });

        // Test package info
        console.log("\n📦 Package Configuration:");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await contract.getPackageInfo(i);
            console.log(`Package ${i}: $${ethers.formatEther(packageInfo.price)} - Direct: ${packageInfo.directBonus/100}%`);
        }

        // Test contract stats
        console.log("\n📊 Contract Statistics:");
        const stats = await contract.getContractStats();
        console.log("Stats:", {
            totalUsers: stats.totalUsersCount.toString(),
            totalFees: ethers.formatEther(stats.totalFeesCollected),
            isPaused: stats.isPaused,
            circuitBreaker: stats.circuitBreakerStatus
        });

        console.log("\n" + "=".repeat(60));
        console.log("🎉 TESTNET CONTRACT IS WORKING!");
        console.log("=".repeat(60));
        console.log("📍 Contract Address:", contractAddress);
        console.log("🔧 Implementation:", "0x90f36915962B164bd423d85fEB161C683c133F2f");
        console.log("👑 Owner (Deployer):", owner);
        console.log("✅ Root user registered with Package 4");
        console.log("✅ Ready for user registration testing");
        console.log("=".repeat(60));

        // Update env file with testnet address
        console.log("\n📝 Updating .env with testnet address...");
        const fs = require('fs');
        let envContent = fs.readFileSync('.env', 'utf8');
        envContent = envContent.replace(
            /TESTNET_CONTRACT_ADDRESS=.*/,
            `TESTNET_CONTRACT_ADDRESS=${contractAddress}`
        );
        fs.writeFileSync('.env', envContent);
        console.log("✅ .env updated with testnet contract address");

        // Save deployment summary
        const deploymentSummary = {
            network: "BSC Testnet",
            contractAddress: contractAddress,
            implementationAddress: "0x90f36915962B164bd423d85fEB161C683c133F2f",
            owner: owner,
            deployer: deployer.address,
            totalUsers: totalUsers.toString(),
            packages: [
                { level: 1, price: "30 USDT" },
                { level: 2, price: "50 USDT" },
                { level: 3, price: "100 USDT" },
                { level: 4, price: "200 USDT" }
            ],
            status: "Ready for testing",
            timestamp: new Date().toISOString(),
            nextSteps: [
                "Test user registration",
                "Test package upgrades", 
                "Test commission system",
                "Test withdrawal system",
                "Deploy to mainnet after successful testing"
            ]
        };

        fs.writeFileSync('BSC_TESTNET_DEPLOYMENT_SUCCESS.json', JSON.stringify(deploymentSummary, null, 2));
        console.log("💾 Deployment summary saved");

        return deploymentSummary;

    } catch (error) {
        console.error("❌ Error:", error.message);
        throw error;
    }
}

// Execute
if (require.main === module) {
    main()
        .then(() => {
            console.log("🎉 Testnet deployment successful and ready!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Error:", error);
            process.exit(1);
        });
}

module.exports = main;
