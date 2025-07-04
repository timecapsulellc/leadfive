#!/usr/bin/env node

/**
 * Connect to deployed testnet contract and test it
 */

const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🔍 CONNECTING TO DEPLOYED TESTNET CONTRACT");
    console.log("=" .repeat(60));

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer account:", deployer.address);

    // Connect to deployed contract
    const contractAddress = "0x7CeD1d7f6a2f1017e12615E88BE28cfe37677559"; // From deployment
    const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
    const contract = LeadFiveV1_10.attach(contractAddress);

    console.log("📍 Contract address:", contractAddress);

    try {
        // Check basic functions
        console.log("\n🔍 Testing basic functions...");
        
        // Check total users
        const totalUsers = await contract.totalUsers();
        console.log("👥 Total users:", totalUsers.toString());

        // Check owner
        const owner = await contract.owner();
        console.log("👑 Contract owner:", owner);

        // Check if paused
        const isPaused = await contract.paused();
        console.log("⏸️  Is paused:", isPaused);

        // Test package prices
        console.log("\n📦 Testing package configuration...");
        for (let i = 1; i <= 4; i++) {
            try {
                const packageInfo = await contract.getPackageInfo(i);
                console.log(`Package ${i}:`, {
                    price: ethers.formatEther(packageInfo.price),
                    directBonus: packageInfo.directBonus.toString(),
                    levelBonus: packageInfo.levelBonus.toString()
                });
            } catch (error) {
                console.log(`Package ${i}: Error -`, error.message);
            }
        }

        // Now test root user fix functions
        console.log("\n🔧 Testing root user fix functions...");
        
        // Fix root user issue
        console.log("Calling fixRootUserIssue()...");
        const fixTx = await contract.fixRootUserIssue();
        await fixTx.wait();
        console.log("✅ Root user issue fixed");

        // Register as root
        console.log("Calling registerAsRoot(4)...");
        const registerTx = await contract.registerAsRoot(4); // Register with package 4
        await registerTx.wait();
        console.log("✅ Registered as root user");

        // Check total users after root registration
        const totalUsersAfter = await contract.totalUsers();
        console.log("👥 Total users after root:", totalUsersAfter.toString());

        // Activate all levels
        console.log("Calling activateAllLevelsForRoot()...");
        const activateTx = await contract.activateAllLevelsForRoot();
        await activateTx.wait();
        console.log("✅ All levels activated for root");

        // Generate referral code
        console.log("Generating referral code...");
        const generateCodeTx = await contract.generateReferralCode();
        await generateCodeTx.wait();
        const referralCode = await contract.getReferralCode(deployer.address);
        console.log("🎫 Root referral code:", referralCode);

        // Get user info
        console.log("\n👤 Root user information:");
        const userInfo = await contract.getUserInfo(deployer.address);
        console.log("User Info:", {
            isRegistered: userInfo.isRegistered,
            packageLevel: userInfo.packageLevel.toString(),
            referrer: userInfo.referrer,
            balance: ethers.formatEther(userInfo.balance),
            totalInvestment: ethers.formatEther(userInfo.totalInvestment),
            earningsCap: ethers.formatEther(userInfo.earningsCap),
            isBlacklisted: userInfo.isBlacklisted,
            referralCode: userInfo.referralCode
        });

        console.log("\n" + "=".repeat(60));
        console.log("🎉 TESTNET CONTRACT SETUP SUCCESSFUL!");
        console.log("=".repeat(60));
        console.log("📍 Contract Address:", contractAddress);
        console.log("👑 Owner:", owner);
        console.log("🎫 Referral Code:", referralCode);
        console.log("👥 Total Users:", totalUsersAfter.toString());
        console.log("=".repeat(60));

        // Save testnet info
        const testnetInfo = {
            network: "BSC Testnet",
            contractAddress: contractAddress,
            implementationAddress: "0x90f36915962B164bd423d85fEB161C683c133F2f",
            owner: owner,
            deployer: deployer.address,
            referralCode: referralCode,
            totalUsers: totalUsersAfter.toString(),
            timestamp: new Date().toISOString()
        };

        const fs = require('fs');
        fs.writeFileSync('BSC_TESTNET_DEPLOYMENT_SUCCESS.json', JSON.stringify(testnetInfo, null, 2));
        console.log("💾 Testnet info saved to: BSC_TESTNET_DEPLOYMENT_SUCCESS.json");

        return testnetInfo;

    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    }
}

// Execute
if (require.main === module) {
    main()
        .then((result) => {
            console.log("🎉 Setup completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Setup failed:", error);
            process.exit(1);
        });
}

module.exports = main;
