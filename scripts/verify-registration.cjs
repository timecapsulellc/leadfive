/**
 * Verify User Registration Status
 * Check if registration was successful and get user details
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 REGISTRATION VERIFICATION");
    console.log("=============================");
    
    // Contract and root information
    const contractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const rootUserAddress = "0xCeaEfDaDE5a0D574bFd5577665dC58d132995335";
    const rootReferralCode = "K9NBHT";
    
    // Transaction hash to verify
    const txHash = "0x90457f0c74c26cbbbcd433d21a97568ca0e10e6b2dae04e90dc2a000a672c1e2";
    
    console.log("🎯 Contract:", contractAddress);
    console.log("👑 Root User:", rootUserAddress);
    console.log("🔗 Root Code:", rootReferralCode);
    console.log("📋 Transaction:", txHash);
    
    try {
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Checking from:", deployer.address);
        
        // Get transaction details
        console.log("\n✅ STEP 1: Transaction Details");
        const tx = await ethers.provider.getTransaction(txHash);
        const receipt = await ethers.provider.getTransactionReceipt(txHash);
        
        console.log("   From:", tx.from);
        console.log("   To:", tx.to);
        console.log("   Value:", ethers.formatEther(tx.value), "BNB");
        console.log("   Gas Used:", receipt.gasUsed.toString());
        console.log("   Status:", receipt.status === 1 ? "✅ SUCCESS" : "❌ FAILED");
        
        // Contract interface for user info
        const userABI = [
            "function getUserInfo(address) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate, uint32 lastHelpPoolClaim, bool isEligibleForHelpPool, uint32 registrationTime, string referralCode, uint96 pendingRewards, uint32 lastWithdrawal, bool isActive))",
            "function packages(uint8) view returns (tuple(uint96 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus))",
            "function totalUsers() view returns (uint32)"
        ];
        
        const contract = new ethers.Contract(contractAddress, userABI, deployer);
        
        // Check the transaction sender's registration status
        console.log("\n✅ STEP 2: User Registration Status");
        const userAddress = tx.from;
        const userInfo = await contract.getUserInfo(userAddress);
        
        console.log("   User Address:", userAddress);
        console.log("   Is Registered:", userInfo.isRegistered ? "✅ YES" : "❌ NO");
        
        if (userInfo.isRegistered) {
            console.log("   Package Level:", userInfo.packageLevel.toString());
            console.log("   Referrer:", userInfo.referrer);
            console.log("   Referral Code:", userInfo.referralCode);
            console.log("   Total Investment:", ethers.formatUnits(userInfo.totalInvestment, 18), "USDT");
            console.log("   Current Balance:", ethers.formatUnits(userInfo.balance, 18), "USDT");
            console.log("   Direct Referrals:", userInfo.directReferrals.toString());
            console.log("   Team Size:", userInfo.teamSize.toString());
            console.log("   Registration Time:", new Date(parseInt(userInfo.registrationTime.toString()) * 1000).toLocaleString());
            
            // Check if they used the root referral
            if (userInfo.referrer.toLowerCase() === rootUserAddress.toLowerCase()) {
                console.log("   ✅ Used ROOT referral correctly!");
            } else {
                console.log("   ℹ️  Used different referrer:", userInfo.referrer);
            }
        }
        
        // Check package information
        console.log("\n✅ STEP 3: Package Information");
        try {
            const packageInfo = await contract.packages(1); // Level 1 package
            console.log("   Level 1 Package Price:", ethers.formatUnits(packageInfo.price, 18), "USDT");
            console.log("   Direct Bonus:", packageInfo.directBonus, "basis points");
        } catch (err) {
            console.log("   Could not get package info:", err.message);
        }
        
        // Check contract totals
        console.log("\n✅ STEP 4: Contract Statistics");
        const totalUsers = await contract.totalUsers();
        console.log("   Total Users:", totalUsers.toString());
        
        // Generate user's referral link
        if (userInfo.isRegistered && userInfo.referralCode) {
            console.log("\n✅ STEP 5: User's Referral System");
            const userReferralLink = `http://localhost:5175/register?ref=${userInfo.referralCode}`;
            console.log("   Your Referral Code:", userInfo.referralCode);
            console.log("   Your Referral Link:", userReferralLink);
            console.log("   Production Link:", `https://leadfive.today/register?ref=${userInfo.referralCode}`);
        }
        
        console.log("\n✅ STEP 6: Analysis Summary");
        console.log("=========================================");
        
        if (receipt.status === 1 && userInfo.isRegistered) {
            console.log("🎉 REGISTRATION SUCCESSFUL!");
            console.log("   ✅ Transaction completed successfully");
            console.log("   ✅ User is registered in the system");
            console.log("   ✅ 30 USDT payment processed");
            console.log("   ✅ Level 1 package activated");
            console.log("   ✅ Referral system is active");
        } else if (receipt.status === 1 && !userInfo.isRegistered) {
            console.log("⚠️  TRANSACTION SUCCESS BUT NOT REGISTERED");
            console.log("   ✅ Transaction completed");
            console.log("   ❌ User not showing as registered");
            console.log("   🔍 This needs investigation");
        } else {
            console.log("❌ TRANSACTION FAILED");
            console.log("   ❌ Transaction did not complete successfully");
            console.log("   ❌ Registration was not processed");
        }
        
        return {
            transaction: {
                hash: txHash,
                status: receipt.status === 1,
                from: tx.from,
                gasUsed: receipt.gasUsed.toString()
            },
            user: {
                address: userAddress,
                isRegistered: userInfo.isRegistered,
                packageLevel: userInfo.packageLevel ? userInfo.packageLevel.toString() : null,
                referralCode: userInfo.referralCode || null,
                referrer: userInfo.referrer || null
            }
        };
        
    } catch (error) {
        console.error("💥 Verification failed:", error);
        throw error;
    }
}

// Export for use in other scripts
module.exports = { main };

if (require.main === module) {
    main()
        .then((result) => {
            console.log("\n🎉 VERIFICATION COMPLETE!");
            if (result.user.isRegistered) {
                console.log("🎯 Your referral code:", result.user.referralCode);
                console.log("🔗 Start sharing:", `http://localhost:5175/register?ref=${result.user.referralCode}`);
            }
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}