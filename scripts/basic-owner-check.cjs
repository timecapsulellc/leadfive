const { ethers } = require("hardhat");
require('dotenv').config();

async function basicOwnerCheck() {
    console.log("🔍 Basic Owner Check");
    console.log("=" * 30);
    
    const contractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("📋 Contract:", contractAddress);
    console.log("🔐 Trezor:", trezorAddress);
    console.log("");
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        
        // Only check owner function
        const ownerAbi = ["function owner() view returns (address)"];
        const contract = new ethers.Contract(contractAddress, ownerAbi, provider);
        
        // Get current owner
        const currentOwner = await contract.owner();
        
        console.log("✅ Current Owner:", currentOwner);
        
        // Check if owner is Trezor
        const isOwnerTrezor = currentOwner.toLowerCase() === trezorAddress.toLowerCase();
        
        console.log("🔐 Owner is Trezor:", isOwnerTrezor ? "✅ YES" : "❌ NO");
        console.log("");
        
        if (isOwnerTrezor) {
            console.log("🎉 OWNERSHIP ALREADY TRANSFERRED TO TREZOR!");
            console.log("✅ No ownership transfer needed");
        } else {
            console.log("🔄 OWNERSHIP TRANSFER REQUIRED");
            console.log("   From:", currentOwner);
            console.log("   To:", trezorAddress);
        }
        
        return {
            currentOwner,
            isOwnerTrezor,
            needsTransfer: !isOwnerTrezor
        };
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        throw error;
    }
}

if (require.main === module) {
    basicOwnerCheck().catch(console.error);
}

module.exports = { basicOwnerCheck };