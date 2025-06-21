const { ethers } = require("hardhat");
require('dotenv').config();

async function checkAdminFeeRecipient() {
    console.log("🔍 CHECKING ADMIN FEE RECIPIENT STATUS");
    console.log("=" * 50);
    
    const contractAddress = "0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569";
    const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    try {
        // Connect to BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        
        // Contract ABI for checking admin fee recipient
        const contractAbi = [
            "function adminFeeRecipient() view returns (address)",
            "function owner() view returns (address)"
        ];
        
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);
        
        // Check current admin fee recipient
        const currentFeeRecipient = await contract.adminFeeRecipient();
        const currentOwner = await contract.owner();
        
        console.log("📋 Contract Address:", contractAddress);
        console.log("🔐 Trezor Address:", trezorAddress);
        console.log("👑 Current Owner:", currentOwner);
        console.log("💰 Current Admin Fee Recipient:", currentFeeRecipient);
        console.log("");
        
        // Check if it's set to zero address
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        
        if (currentFeeRecipient === zeroAddress) {
            console.log("❌ STATUS: Admin fee recipient is NOT SET (zero address)");
            console.log("💡 This means NO admin fees are being collected!");
            console.log("⚠️  All admin fees are being lost/burned!");
            console.log("");
            console.log("🎯 ACTION NEEDED:");
            console.log("1. Go to BSCScan Write Contract");
            console.log("2. Execute: setAdminFeeRecipient");
            console.log("3. Set to: " + trezorAddress);
            console.log("4. Start collecting admin fees immediately!");
        } else if (currentFeeRecipient.toLowerCase() === trezorAddress.toLowerCase()) {
            console.log("✅ PERFECT: Admin fee recipient is YOUR TREZOR!");
            console.log("💰 All admin fees are being collected to your secure wallet");
            console.log("🎉 Revenue generation is ACTIVE!");
        } else {
            console.log("⚠️  WARNING: Admin fee recipient is set to different address");
            console.log("📧 Current recipient:", currentFeeRecipient);
            console.log("🔄 Consider changing to your Trezor for security");
        }
        
        console.log("");
        console.log("🔗 BSCScan Link:");
        console.log("https://bscscan.com/address/" + contractAddress + "#readContract");
        console.log("");
        console.log("📝 To change admin fee recipient:");
        console.log("https://bscscan.com/address/" + contractAddress + "#writeContract");
        
    } catch (error) {
        console.error("❌ Error checking admin fee recipient:", error.message);
    }
}

checkAdminFeeRecipient().catch(console.error);
