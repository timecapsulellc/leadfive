/**
 * Root User Setup & Migration Script
 * Sets up the root user and retrieves real referral codes for the frontend
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 ROOT USER SETUP & REFERRAL SYSTEM");
    console.log("=====================================");
    
    // Current contract address from frontend config
    const contractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const rootUserAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"; // Trezor
    
    const [deployer] = await ethers.getSigners();
    console.log("👨‍💼 Deployer:", deployer.address);
    console.log("🎯 Contract:", contractAddress);
    console.log("👑 Root User:", rootUserAddress);
    
    try {
        // Create a simple interface to interact with the contract
        const simpleABI = [
            "function rootUser() view returns (address)",
            "function rootUserSet() view returns (bool)",
            "function owner() view returns (address)",
            "function getUserInfo(address) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate, uint32 lastHelpPoolClaim, bool isEligibleForHelpPool, uint32 registrationTime, string referralCode, uint96 pendingRewards, uint32 lastWithdrawal, bool isActive))",
            "function totalUsers() view returns (uint32)",
            "function directReferrals(address, uint256) view returns (address)",
            "function referralCodeToUser(string) view returns (address)"
        ];
        
        const contract = new ethers.Contract(contractAddress, simpleABI, deployer);
        
        console.log("\n✅ STEP 1: Contract Status Check");
        const owner = await contract.owner();
        const rootUser = await contract.rootUser();
        const rootUserSet = await contract.rootUserSet();
        const totalUsers = await contract.totalUsers();
        
        console.log("   Contract Owner:", owner);
        console.log("   Root User:", rootUser);
        console.log("   Root User Set:", rootUserSet);
        console.log("   Total Users:", totalUsers.toString());
        
        console.log("\n✅ STEP 2: Check Root User Info");
        try {
            const rootInfo = await contract.getUserInfo(rootUserAddress);
            console.log("   Root Registered:", rootInfo.isRegistered);
            console.log("   Root Package:", rootInfo.packageLevel);
            console.log("   Root Referral Code:", rootInfo.referralCode);
            console.log("   Root Direct Referrals:", rootInfo.directReferrals.toString());
            console.log("   Root Team Size:", rootInfo.teamSize.toString());
            
            // Store the root referral code for frontend
            const rootReferralCode = rootInfo.referralCode;
            
            console.log("\n✅ STEP 3: Generate Real Referral Links");
            console.log("🔗 ROOT REFERRAL CODE:", rootReferralCode);
            console.log("🌐 ROOT REFERRAL LINK:", `http://localhost:5175/register?ref=${rootReferralCode}`);
            console.log("🌐 PRODUCTION LINK:", `https://leadfive.today/register?ref=${rootReferralCode}`);
            
            // Check if we can get some other users for testing
            console.log("\n✅ STEP 4: Check Other Users");
            try {
                const deployerInfo = await contract.getUserInfo(deployer.address);
                if (deployerInfo.isRegistered) {
                    console.log("   Deployer Referral Code:", deployerInfo.referralCode);
                    console.log("   Deployer Link:", `http://localhost:5175/register?ref=${deployerInfo.referralCode}`);
                }
            } catch (err) {
                console.log("   Deployer not registered");
            }
            
            // Get first few direct referrals of root for testing
            console.log("\n✅ STEP 5: Sample Direct Referrals");
            for (let i = 0; i < Math.min(3, rootInfo.directReferrals); i++) {
                try {
                    const referralAddress = await contract.directReferrals(rootUserAddress, i);
                    const referralInfo = await contract.getUserInfo(referralAddress);
                    console.log(`   Referral ${i + 1}:`, referralAddress);
                    console.log(`   Referral ${i + 1} Code:`, referralInfo.referralCode);
                    console.log(`   Referral ${i + 1} Link:`, `http://localhost:5175/register?ref=${referralInfo.referralCode}`);
                } catch (err) {
                    console.log(`   Could not get referral ${i + 1}`);
                }
            }
            
        } catch (error) {
            console.error("   ❌ Error getting root user info:", error.message);
        }
        
        console.log("\n✅ STEP 6: Frontend Configuration");
        console.log("Update your frontend configuration:");
        console.log("=====================================");
        console.log("CONTRACT_ADDRESS:", contractAddress);
        console.log("ROOT_USER:", rootUserAddress);
        console.log("ROOT_REFERRAL_CODE:", rootInfo.referralCode || "NOT_FOUND");
        
        // Generate the frontend config update
        const frontendConfig = {
            contractAddress: contractAddress,
            rootUser: rootUserAddress,
            rootReferralCode: rootInfo.referralCode || "",
            defaultReferralLink: `http://localhost:5175/register?ref=${rootInfo.referralCode || ""}`,
            productionReferralLink: `https://leadfive.today/register?ref=${rootInfo.referralCode || ""}`
        };
        
        console.log("\n✅ STEP 7: Referral System Options");
        console.log("🔧 OPTION 1: Use Wallet Address as Referral");
        console.log("   - Direct wallet addresses as referral codes");
        console.log("   - Example: http://localhost:5175/register?ref=0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29");
        
        console.log("\n🔧 OPTION 2: Use Custom Referral Codes");
        console.log("   - Generate human-readable codes");
        console.log("   - Example: http://localhost:5175/register?ref=LEADFIVE001");
        
        console.log("\n🔧 OPTION 3: Mixed System (Recommended)");
        console.log("   - Accept both wallet addresses and custom codes");
        console.log("   - Fallback to root user if code not found");
        
        console.log("\n✅ STEP 8: Next Steps");
        console.log("1. ✅ Root user identified:", rootUserAddress);
        console.log("2. 🔧 Update referral system in frontend");
        console.log("3. 🧪 Test registration flow");
        console.log("4. 🚀 Deploy updated frontend");
        
        return frontendConfig;
        
    } catch (error) {
        console.error("💥 Setup failed:", error);
        throw error;
    }
}

// Export for use in other scripts
module.exports = { main };

if (require.main === module) {
    main()
        .then((config) => {
            console.log("\n🎉 ROOT USER SETUP COMPLETE!");
            console.log("Frontend Config:", JSON.stringify(config, null, 2));
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}