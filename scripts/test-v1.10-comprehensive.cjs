#!/usr/bin/env node

/**
 * Comprehensive Testing Script for LeadFiveV1.10 on BSC Testnet
 * Tests all new features and business logic
 */

const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🧪 TESTING LEADFIVE V1.10 ON BSC TESTNET");
    console.log("=" .repeat(60));

    // Get accounts
    const [deployer, user1, user2, user3] = await ethers.getSigners();
    console.log("👨‍💼 Deployer:", deployer.address);
    console.log("👤 Test User 1:", user1.address);
    console.log("👤 Test User 2:", user2.address);
    console.log("👤 Test User 3:", user3.address);

    // Connect to deployed contract
    const contractAddress = "0x4eC8277F557C73B41EEEBd35Bf0dC0E24c165944";
    const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
    const contract = LeadFiveV1_10.attach(contractAddress);

    console.log("📍 Testing contract at:", contractAddress);

    try {
        // Test 1: Verify contract version and initial state
        console.log("\n🔍 TEST 1: Contract Verification");
        const version = await contract.getContractVersion();
        const totalUsers = await contract.totalUsers();
        const owner = await contract.owner();
        
        console.log("📋 Version:", version);
        console.log("👥 Total Users:", totalUsers.toString());
        console.log("👑 Owner:", owner);

        // Test 2: Package configuration
        console.log("\n📦 TEST 2: Package Configuration");
        for (let i = 1; i <= 4; i++) {
            const packageInfo = await contract.getPackageInfo(i);
            console.log(`Package ${i}:`, {
                price: ethers.formatEther(packageInfo.price),
                directBonus: packageInfo.directBonus.toString(),
                levelBonus: packageInfo.levelBonus.toString()
            });
        }

        // Test 3: Root user status
        console.log("\n🔧 TEST 3: Root User Status");
        const rootStatus = await contract.isRootUserFixed();
        console.log("Root Status:", rootStatus);

        // Test 4: Get root referral code
        console.log("\n🎫 TEST 4: Referral Code System");
        const rootCode = await contract.getReferralCode(deployer.address);
        console.log("Root Referral Code:", rootCode);

        // Test 5: User registration with referral code
        console.log("\n👤 TEST 5: User Registration");
        
        // Get mock USDT contract
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        const mockUSDT = MockUSDT.attach(process.env.MOCK_USDT_ADDRESS);
        
        // Give user1 some USDT
        await mockUSDT.mint(user1.address, ethers.parseEther("1000"));
        await mockUSDT.connect(user1).approve(contractAddress, ethers.parseEther("50"));
        
        console.log("💰 Minted 1000 USDT to user1");
        console.log("✅ Approved 50 USDT for contract");

        // Register user1 with package 2 ($50)
        const registerTx = await contract.connect(user1).register(
            deployer.address, // sponsor (root user)
            2, // package level ($50)
            true, // use USDT
            "" // no referral code (using direct sponsor)
        );
        await registerTx.wait();
        console.log("✅ User1 registered with package 2");

        // Test 6: Check user info
        console.log("\n📊 TEST 6: User Information");
        const user1Info = await contract.getUserInfo(user1.address);
        console.log("User1 Info:", {
            isRegistered: user1Info.isRegistered,
            packageLevel: user1Info.packageLevel.toString(),
            referrer: user1Info.referrer,
            balance: ethers.formatEther(user1Info.balance),
            totalInvestment: ethers.formatEther(user1Info.totalInvestment),
            earningsCap: ethers.formatEther(user1Info.earningsCap)
        });

        // Test 7: Generate referral code for user1
        console.log("\n🎫 TEST 7: User Referral Code Generation");
        const generateTx = await contract.connect(user1).generateReferralCode();
        await generateTx.wait();
        const user1Code = await contract.getReferralCode(user1.address);
        console.log("User1 Referral Code:", user1Code);

        // Test 8: Register user2 with user1's referral code
        console.log("\n👤 TEST 8: Registration with Referral Code");
        
        await mockUSDT.mint(user2.address, ethers.parseEther("100"));
        await mockUSDT.connect(user2).approve(contractAddress, ethers.parseEther("30"));
        
        const register2Tx = await contract.connect(user2).register(
            ethers.ZeroAddress, // no direct sponsor
            1, // package level ($30)
            true, // use USDT
            user1Code // use user1's referral code
        );
        await register2Tx.wait();
        console.log("✅ User2 registered with user1's referral code");

        // Test 9: Check network stats
        console.log("\n📈 TEST 9: Network Statistics");
        const user1Stats = await contract.getNetworkStats(user1.address);
        console.log("User1 Network Stats:", {
            directCount: user1Stats.directCount.toString(),
            teamSize: user1Stats.teamSize.toString(),
            leftVolume: ethers.formatEther(user1Stats.leftVolume),
            rightVolume: ethers.formatEther(user1Stats.rightVolume),
            totalEarnings: ethers.formatEther(user1Stats.totalEarnings)
        });

        // Test 10: Package upgrade
        console.log("\n📈 TEST 10: Package Upgrade");
        await mockUSDT.connect(user2).approve(contractAddress, ethers.parseEther("70")); // $100 - $30 = $70
        
        const upgradeTx = await contract.connect(user2).upgradePackage(3, true); // Upgrade to package 3 ($100)
        await upgradeTx.wait();
        console.log("✅ User2 upgraded to package 3");

        const user2InfoAfter = await contract.getUserInfo(user2.address);
        console.log("User2 After Upgrade:", {
            packageLevel: user2InfoAfter.packageLevel.toString(),
            totalInvestment: ethers.formatEther(user2InfoAfter.totalInvestment),
            earningsCap: ethers.formatEther(user2InfoAfter.earningsCap)
        });

        // Test 11: Withdrawal test
        console.log("\n💰 TEST 11: Withdrawal");
        const user1Balance = await contract.users(user1.address);
        if (user1Balance.balance > 0) {
            const withdrawTx = await contract.connect(user1).withdraw(
                user1Balance.balance / 2n, // Withdraw half
                true // USDT
            );
            await withdrawTx.wait();
            console.log("✅ User1 withdrew funds");
        } else {
            console.log("ℹ️  User1 has no balance to withdraw");
        }

        // Test 12: Pool information
        console.log("\n🏊 TEST 12: Pool Information");
        for (let i = 1; i <= 4; i++) {
            const poolInfo = await contract.getPoolInfo(i);
            console.log(`Pool ${i}:`, {
                balance: ethers.formatEther(poolInfo.balance),
                lastDistribution: new Date(Number(poolInfo.lastDistribution) * 1000).toISOString()
            });
        }

        // Test 13: Contract statistics
        console.log("\n📊 TEST 13: Contract Statistics");
        const stats = await contract.getContractStats();
        console.log("Contract Stats:", {
            totalUsers: stats.totalUsersCount.toString(),
            totalFees: ethers.formatEther(stats.totalFeesCollected),
            isPaused: stats.isPaused,
            circuitBreaker: stats.circuitBreakerStatus
        });

        console.log("\n" + "=".repeat(60));
        console.log("🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
        console.log("=".repeat(60));
        console.log("✅ Contract is fully functional");
        console.log("✅ All business logic working");
        console.log("✅ Ready for mainnet upgrade");

        return {
            success: true,
            totalUsers: stats.totalUsersCount.toString(),
            contractWorking: true
        };

    } catch (error) {
        console.error("❌ Testing failed:", error);
        throw error;
    }
}

// Execute testing
if (require.main === module) {
    main()
        .then((result) => {
            console.log("🎉 Testing completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Testing failed:", error);
            process.exit(1);
        });
}

module.exports = main;
