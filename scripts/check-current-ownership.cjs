const { ethers } = require("hardhat");
require('dotenv').config();

async function checkCurrentOwnership() {
    console.log("🔍 Checking Current LeadFive Contract Ownership");
    console.log("=" * 50);
    
    const contractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("📋 Contract Address:", contractAddress);
    console.log("🔐 Target Trezor Address:", trezorAddress);
    console.log("");
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        
        // Get contract instance with ownership functions
        const contractAbi = [
            "function owner() view returns (address)",
            "function pendingOwner() view returns (address)",
            "function treasuryWallet() view returns (address)",
            "function pendingTreasuryWallet() view returns (address)",
            "function getPendingTransfers() view returns (address pendingOwnerAddress, address pendingTreasuryAddress)",
            "function getTreasuryWallet() view returns (address)",
            "function rootUser() view returns (address)",
            "function totalUsers() view returns (uint32)"
        ];
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        
        // Get current status
        const [currentOwner, pendingOwner, currentTreasury, pendingTreasury, totalUsers, rootUser] = await Promise.all([
            contract.owner(),
            contract.pendingOwner(),
            contract.treasuryWallet(),
            contract.pendingTreasuryWallet(),
            contract.totalUsers(),
            contract.rootUser()
        ]);
        
        console.log("📊 CURRENT CONTRACT STATUS:");
        console.log("=" * 30);
        console.log("✅ Current Owner:", currentOwner);
        console.log("⏳ Pending Owner:", pendingOwner);
        console.log("💰 Current Treasury:", currentTreasury);
        console.log("⏳ Pending Treasury:", pendingTreasury);
        console.log("👤 Root User:", rootUser);
        console.log("📈 Total Users:", totalUsers.toString());
        console.log("");
        
        // Check ownership status
        const isOwnerTrezor = currentOwner.toLowerCase() === trezorAddress.toLowerCase();
        const isTreasuryTrezor = currentTreasury.toLowerCase() === trezorAddress.toLowerCase();
        const isPendingOwnerTrezor = pendingOwner.toLowerCase() === trezorAddress.toLowerCase();
        const isPendingTreasuryTrezor = pendingTreasury.toLowerCase() === trezorAddress.toLowerCase();
        
        console.log("🎯 TREZOR STATUS ANALYSIS:");
        console.log("=" * 30);
        console.log("🔐 Owner is Trezor:", isOwnerTrezor ? "✅ YES" : "❌ NO");
        console.log("💰 Treasury is Trezor:", isTreasuryTrezor ? "✅ YES" : "❌ NO");
        console.log("⏳ Pending Owner is Trezor:", isPendingOwnerTrezor ? "✅ YES" : "❌ NO");
        console.log("⏳ Pending Treasury is Trezor:", isPendingTreasuryTrezor ? "✅ YES" : "❌ NO");
        console.log("");
        
        // Check if there are pending operations
        const hasPendingOwnership = pendingOwner !== ethers.ZeroAddress;
        const hasPendingTreasury = pendingTreasury !== ethers.ZeroAddress;
        
        console.log("⚡ PENDING OPERATIONS:");
        console.log("=" * 20);
        console.log("📋 Pending Ownership Transfer:", hasPendingOwnership ? "⚠️  YES" : "✅ NO");
        console.log("📋 Pending Treasury Transfer:", hasPendingTreasury ? "⚠️  YES" : "✅ NO");
        console.log("");
        
        // Recommendations
        console.log("🎯 RECOMMENDED ACTIONS:");
        console.log("=" * 25);
        
        if (hasPendingOwnership && isPendingOwnerTrezor) {
            console.log("1. ✅ COMPLETE OWNERSHIP TRANSFER - Trezor needs to call acceptOwnership()");
        } else if (!isOwnerTrezor && !hasPendingOwnership) {
            console.log("1. 🔄 INITIATE OWNERSHIP TRANSFER - Call initiateOwnershipTransfer(trezor)");
        } else if (isOwnerTrezor) {
            console.log("1. ✅ OWNERSHIP ALREADY TRANSFERRED TO TREZOR");
        }
        
        if (hasPendingTreasury && isPendingTreasuryTrezor) {
            console.log("2. ✅ PENDING TREASURY SETUP - Will be set when ownership transfer completes");
        } else if (!isTreasuryTrezor) {
            console.log("2. 🔄 SET TREASURY TO TREZOR - Call setTreasuryWallet(trezor)");
        } else {
            console.log("2. ✅ TREASURY ALREADY SET TO TREZOR");
        }
        
        console.log("");
        console.log("🚀 CONTRACT IS READY FOR OPERATIONS");
        
        return {
            currentOwner,
            pendingOwner,
            currentTreasury,
            pendingTreasury,
            isOwnerTrezor,
            isTreasuryTrezor,
            hasPendingOwnership,
            hasPendingTreasury,
            isPendingOwnerTrezor,
            isPendingTreasuryTrezor
        };
        
    } catch (error) {
        console.error("❌ Error checking ownership:", error.message);
        throw error;
    }
}

if (require.main === module) {
    checkCurrentOwnership().catch(console.error);
}

module.exports = { checkCurrentOwnership };