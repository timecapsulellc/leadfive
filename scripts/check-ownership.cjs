const { ethers } = require("hardhat");
require('dotenv').config();

async function checkOwnership() {
    console.log("🔍 Checking Contract Ownership Status");
    console.log("=" * 50);
    
    const contractAddress = "0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569";
    const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    const hotWalletAddress = "0x0faF67B6E49827EcB42244b4C00F9962922Eb931";
    
    console.log("📋 Contract Address:", contractAddress);
    console.log("🔐 Trezor Address:", trezorAddress);
    console.log("🔥 Hot Wallet Address:", hotWalletAddress);
    console.log("");
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        
        // Get contract instance
        const contractAbi = [
            "function owner() view returns (address)"
        ];
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        
        // Get current owner
        const currentOwner = await contract.owner();
        
        console.log("✅ CURRENT CONTRACT OWNER:", currentOwner);
        console.log("");
        
        // Check which address is the owner
        if (currentOwner.toLowerCase() === trezorAddress.toLowerCase()) {
            console.log("🎉 SUCCESS: Trezor wallet IS the owner!");
            console.log("🔐 Your contract is secured with Trezor");
        } else if (currentOwner.toLowerCase() === hotWalletAddress.toLowerCase()) {
            console.log("⚠️  Hot wallet is still the owner");
            console.log("🔄 Ownership transfer may be needed");
        } else {
            console.log("❓ Unknown owner address");
            console.log("🔍 This is a different address");
        }
        
        console.log("");
        console.log("📊 Address Comparison:");
        console.log("- Current Owner: ", currentOwner);
        console.log("- Trezor Address:", trezorAddress);
        console.log("- Match:", currentOwner.toLowerCase() === trezorAddress.toLowerCase() ? "✅ YES" : "❌ NO");
        
    } catch (error) {
        console.error("❌ Error checking ownership:", error.message);
    }
}

checkOwnership().catch(console.error);
