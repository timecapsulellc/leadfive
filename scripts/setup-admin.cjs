const { ethers } = require("hardhat");
require('dotenv').config();

async function setupAdminConfiguration() {
    console.log("🔧 LEADFIVE ADMIN CONFIGURATION SETUP");
    console.log("=" * 60);
    
    const contractAddress = "0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569";
    const trezorOwner = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("📋 Contract Address:", contractAddress);
    console.log("🔐 Trezor Owner:", trezorOwner);
    console.log("");
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        
        // Contract ABI for admin functions
        const contractAbi = [
            "function owner() view returns (address)",
            "function adminIds(uint256) view returns (address)",
            "function setAdminFeeRecipient(address) external",
            "function adminFeeRecipient() view returns (address)",
            "function getUserInfo(address) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate, uint32 lastHelpPoolClaim, bool isEligibleForHelpPool, uint32 matrixPosition, uint8 matrixLevel, uint32 registrationTime, string referralCode, uint96 pendingRewards, uint32 lastWithdrawal, uint32 matrixCycles, uint8 leaderRank, uint96 leftLegVolume, uint96 rightLegVolume, uint32 fastStartExpiry, bool isActive))"
        ];
        
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        
        // Check current owner
        const currentOwner = await contract.owner();
        console.log("✅ Current Owner:", currentOwner);
        
        // Check admin IDs (first few)
        console.log("\n📋 Current Admin IDs:");
        for (let i = 0; i < 5; i++) {
            try {
                const adminId = await contract.adminIds(i);
                console.log(`- Admin ${i}:`, adminId);
            } catch (error) {
                console.log(`- Admin ${i}: Error reading`);
            }
        }
        
        // Check admin fee recipient
        try {
            const adminFeeRecipient = await contract.adminFeeRecipient();
            console.log("\n💰 Admin Fee Recipient:", adminFeeRecipient);
        } catch (error) {
            console.log("\n💰 Admin Fee Recipient: Not set or error reading");
        }
        
        // Check owner's user info
        try {
            const ownerInfo = await contract.getUserInfo(currentOwner);
            console.log("\n👤 Owner User Info:");
            console.log("- Registered:", ownerInfo.isRegistered);
            console.log("- Package Level:", ownerInfo.packageLevel.toString());
            console.log("- Rank:", ownerInfo.rank.toString());
            console.log("- Balance:", ethers.formatEther(ownerInfo.balance), "USDT");
        } catch (error) {
            console.log("\n👤 Owner User Info: Error reading");
        }
        
        // Frontend configuration suggestions
        console.log("\n🎯 FRONTEND CONFIGURATION NEEDED:");
        console.log("1. Set admin fee recipient address");
        console.log("2. Update admin IDs if needed");
        console.log("3. Configure frontend with contract address");
        console.log("4. Set up proper admin interface");
        console.log("5. Test contract functions");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

setupAdminConfiguration().catch(console.error);
