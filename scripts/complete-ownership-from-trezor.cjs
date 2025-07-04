const { ethers } = require("hardhat");
require('dotenv').config();

async function completeOwnershipFromTrezor() {
    console.log("🔐 COMPLETE OWNERSHIP TRANSFER FROM TREZOR");
    console.log("=" * 50);
    
    const CONTRACT_ADDRESS = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("📋 Contract Address:", CONTRACT_ADDRESS);
    console.log("🔐 Trezor Address:", TREZOR_ADDRESS);
    console.log("");
    
    console.log("📋 INSTRUCTIONS FOR TREZOR COMPLETION:");
    console.log("=" * 40);
    console.log("1. Connect your Trezor device to computer");
    console.log("2. Access BSC Mainnet with your Trezor");
    console.log("3. Call the contract function below:");
    console.log("");
    console.log("📞 CONTRACT CALL:");
    console.log("   Contract: " + CONTRACT_ADDRESS);
    console.log("   Function: acceptOwnership()");
    console.log("   Parameters: None");
    console.log("   Gas Limit: 100,000");
    console.log("");
    
    console.log("🌐 NETWORK SETTINGS:");
    console.log("   Network: BSC Mainnet");
    console.log("   Chain ID: 56");
    console.log("   RPC URL: https://bsc-dataseed.binance.org/");
    console.log("   Currency: BNB");
    console.log("");
    
    try {
        // Check current status
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        
        const contractAbi = [
            "function owner() view returns (address)",
            "function pendingOwner() view returns (address)",
            "function acceptOwnership()"
        ];
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, provider);
        
        console.log("📊 CURRENT STATUS CHECK:");
        console.log("=" * 25);
        
        const [currentOwner, pendingOwner] = await Promise.all([
            contract.owner(),
            contract.pendingOwner().catch(() => "Not available")
        ]);
        
        console.log("Current Owner:", currentOwner);
        console.log("Pending Owner:", pendingOwner);
        console.log("");
        
        const isOwnerTrezor = currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase();
        const isPendingTrezor = pendingOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase();
        
        if (isOwnerTrezor) {
            console.log("🎉 SUCCESS: Ownership already completed!");
            console.log("✅ Trezor is now the owner of the contract");
            console.log("✅ No further action needed");
            return { success: true, alreadyCompleted: true };
        }
        
        if (isPendingTrezor) {
            console.log("⏳ PENDING: Ownership transfer waiting for Trezor");
            console.log("🔄 ACTION REQUIRED: Call acceptOwnership() from Trezor");
        } else {
            console.log("❌ ERROR: No pending ownership transfer to Trezor");
            console.log("   You may need to initiate the transfer again");
        }
        
        console.log("");
        console.log("🛠️  METAMASK/TREZOR INSTRUCTIONS:");
        console.log("=" * 35);
        console.log("1. Open MetaMask/Trezor with BSC Mainnet");
        console.log("2. Go to contract interaction page");
        console.log("3. Enter contract address: " + CONTRACT_ADDRESS);
        console.log("4. Select 'acceptOwnership' function");
        console.log("5. Click 'Write' or 'Send Transaction'");
        console.log("6. Confirm transaction on Trezor device");
        console.log("");
        
        console.log("🔗 USEFUL LINKS:");
        console.log("   BSCScan Contract: https://bscscan.com/address/" + CONTRACT_ADDRESS);
        console.log("   BSCScan Write Contract: https://bscscan.com/address/" + CONTRACT_ADDRESS + "#writeContract");
        console.log("");
        
        console.log("⚡ FUNCTION SIGNATURE:");
        console.log("   acceptOwnership()");
        console.log("");
        
        return {
            success: false,
            needsCompletion: isPendingTrezor,
            currentOwner,
            pendingOwner
        };
        
    } catch (error) {
        console.error("❌ Error checking status:", error.message);
        throw error;
    }
}

if (require.main === module) {
    completeOwnershipFromTrezor().catch(console.error);
}

module.exports = { completeOwnershipFromTrezor };