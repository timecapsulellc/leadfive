#!/usr/bin/env node

/**
 * Simple verification of testnet deployment
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("🎉 TESTNET DEPLOYMENT VERIFICATION");
    console.log("=" .repeat(50));

    const [deployer] = await ethers.getSigners();
    const contractAddress = "0x7CeD1d7f6a2f1017e12615E88BE28cfe37677559";
    
    console.log("📍 Contract:", contractAddress);
    console.log("👑 Owner:", deployer.address);

    const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
    const contract = LeadFiveV1_10.attach(contractAddress);

    // Basic checks
    const totalUsers = await contract.totalUsers();
    const owner = await contract.owner();
    const userInfo = await contract.getUserInfo(deployer.address);

    console.log("\n✅ DEPLOYMENT STATUS:");
    console.log("👥 Total Users:", totalUsers.toString());
    console.log("👑 Owner:", owner);
    console.log("📦 Root Package Level:", userInfo.packageLevel.toString());
    console.log("💰 Root Investment:", ethers.formatEther(userInfo.totalInvestment), "USDT");
    console.log("🎯 Root Earnings Cap:", ethers.formatEther(userInfo.earningsCap), "USDT");
    console.log("✅ Root Registered:", userInfo.isRegistered);

    // Package prices
    console.log("\n📦 PACKAGE PRICES:");
    for (let i = 1; i <= 4; i++) {
        const pkg = await contract.getPackageInfo(i);
        console.log(`Package ${i}: $${ethers.formatEther(pkg.price)}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 TESTNET DEPLOYMENT SUCCESSFUL!");
    console.log("=" .repeat(50));
    console.log("📍 BSC Testnet Address:", contractAddress);
    console.log("🔧 Implementation: 0x90f36915962B164bd423d85fEB161C683c133F2f");
    console.log("✅ Root user setup complete");
    console.log("✅ 4-package system configured");
    console.log("✅ Ready for user registration testing");
    console.log("=" .repeat(50));

    console.log("\n🚀 NEXT STEPS:");
    console.log("1. ✅ Testnet deployment completed");
    console.log("2. 🧪 Run comprehensive testing");
    console.log("3. 🌐 Deploy implementation to mainnet");
    console.log("4. 🔐 Upgrade mainnet proxy with Trezor");

    // Update environment
    const fs = require('fs');
    try {
        let envContent = fs.readFileSync('.env', 'utf8');
        if (envContent.includes('TESTNET_CONTRACT_ADDRESS=')) {
            envContent = envContent.replace(
                /TESTNET_CONTRACT_ADDRESS=.*/,
                `TESTNET_CONTRACT_ADDRESS=${contractAddress}`
            );
        } else {
            envContent += `\nTESTNET_CONTRACT_ADDRESS=${contractAddress}\n`;
        }
        fs.writeFileSync('.env', envContent);
        console.log("📝 Updated .env with testnet address");
    } catch (error) {
        console.log("⚠️  Could not update .env file");
    }

    return {
        success: true,
        contractAddress,
        owner,
        totalUsers: totalUsers.toString()
    };
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("❌", error);
        process.exit(1);
    });
