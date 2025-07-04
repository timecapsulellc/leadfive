const { ethers } = require("hardhat");
require('dotenv').config();

async function simpleOwnershipCheck() {
    console.log("🔍 Simple Contract Ownership Check");
    console.log("=" * 40);
    
    const contractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("📋 Contract Address:", contractAddress);
    console.log("🔐 Target Trezor Address:", trezorAddress);
    console.log("");
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        
        // Basic ownership check
        const basicAbi = [
            "function owner() view returns (address)",
            "function totalUsers() view returns (uint32)",
            "function rootUser() view returns (address)"
        ];
        const contract = new ethers.Contract(contractAddress, basicAbi, provider);
        
        // Get basic info
        const [currentOwner, totalUsers, rootUser] = await Promise.all([
            contract.owner(),
            contract.totalUsers(),
            contract.rootUser()
        ]);
        
        console.log("📊 BASIC CONTRACT INFO:");
        console.log("=" * 25);
        console.log("✅ Current Owner:", currentOwner);
        console.log("👤 Root User:", rootUser);
        console.log("📈 Total Users:", totalUsers.toString());
        console.log("");
        
        // Check if owner is already Trezor
        const isOwnerTrezor = currentOwner.toLowerCase() === trezorAddress.toLowerCase();
        
        console.log("🎯 OWNERSHIP STATUS:");
        console.log("=" * 20);
        console.log("🔐 Owner is Trezor:", isOwnerTrezor ? "✅ YES" : "❌ NO");
        console.log("");
        
        if (isOwnerTrezor) {
            console.log("🎉 SUCCESS: Contract is already owned by Trezor!");
            console.log("💰 Now checking treasury settings...");
            
            // Try to check treasury with the enhanced ABI
            try {
                const treasuryAbi = [
                    "function treasuryWallet() view returns (address)",
                    "function getTreasuryWallet() view returns (address)"
                ];
                const treasuryContract = new ethers.Contract(contractAddress, treasuryAbi, provider);
                
                let treasuryAddress;
                try {
                    treasuryAddress = await treasuryContract.treasuryWallet();
                } catch {
                    treasuryAddress = await treasuryContract.getTreasuryWallet();
                }
                
                const isTreasuryTrezor = treasuryAddress.toLowerCase() === trezorAddress.toLowerCase();
                console.log("💰 Treasury Address:", treasuryAddress);
                console.log("💰 Treasury is Trezor:", isTreasuryTrezor ? "✅ YES" : "❌ NO");
                
                if (!isTreasuryTrezor) {
                    console.log("");
                    console.log("🔄 NEXT STEP: Set treasury to Trezor wallet");
                    console.log("   Use: setTreasuryWallet('" + trezorAddress + "')");
                } else {
                    console.log("");
                    console.log("🎉 COMPLETE: Both ownership and treasury are set to Trezor!");
                }
                
            } catch (treasuryError) {
                console.log("⚠️  Could not check treasury address");
                console.log("   This might need to be set manually");
            }
            
        } else {
            console.log("🔄 TRANSFER NEEDED: Ownership must be transferred to Trezor");
            console.log("   Current Owner:", currentOwner);
            console.log("   Target Owner:", trezorAddress);
        }
        
        return {
            currentOwner,
            rootUser,
            totalUsers: totalUsers.toString(),
            isOwnerTrezor,
            needsTransfer: !isOwnerTrezor
        };
        
    } catch (error) {
        console.error("❌ Error checking contract:", error.message);
        throw error;
    }
}

if (require.main === module) {
    simpleOwnershipCheck().catch(console.error);
}

module.exports = { simpleOwnershipCheck };