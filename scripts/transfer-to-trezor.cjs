const { ethers } = require("hardhat");
require('dotenv').config();

async function transferToTrezor() {
    console.log("🔐 TRANSFERRING OWNERSHIP TO TREZOR WALLET");
    console.log("=" * 50);
    
    const contractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("📋 Contract Address:", contractAddress);
    console.log("🔐 Trezor Address:", trezorAddress);
    console.log("");
    
    try {
        // Get signer (current owner)
        const [signer] = await ethers.getSigners();
        console.log("👤 Current Signer:", signer.address);
        
        // Connect to contract
        const contractAbi = [
            "function owner() view returns (address)",
            "function transferOwnership(address newOwner)",
            "function setTreasuryWallet(address _treasuryWallet)",
            "function treasuryWallet() view returns (address)",
            "function getTreasuryWallet() view returns (address)"
        ];
        
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);
        
        // Check current status
        console.log("📊 CHECKING CURRENT STATUS...");
        const currentOwner = await contract.owner();
        console.log("   Current Owner:", currentOwner);
        
        // Check if signer is the owner
        if (currentOwner.toLowerCase() !== signer.address.toLowerCase()) {
            throw new Error(`Signer ${signer.address} is not the contract owner ${currentOwner}`);
        }
        
        // Check current treasury
        let currentTreasury;
        try {
            currentTreasury = await contract.treasuryWallet();
        } catch {
            try {
                currentTreasury = await contract.getTreasuryWallet();
            } catch {
                currentTreasury = "Not available";
            }
        }
        console.log("   Current Treasury:", currentTreasury);
        console.log("");
        
        // Step 1: Set Treasury to Trezor (if not already set)
        const isTreasuryTrezor = currentTreasury.toLowerCase() === trezorAddress.toLowerCase();
        if (!isTreasuryTrezor && currentTreasury !== "Not available") {
            console.log("🏦 STEP 1: Setting Treasury to Trezor...");
            try {
                const treasuryTx = await contract.setTreasuryWallet(trezorAddress);
                console.log("   Transaction Hash:", treasuryTx.hash);
                console.log("   Waiting for confirmation...");
                await treasuryTx.wait();
                console.log("   ✅ Treasury set to Trezor!");
            } catch (treasuryError) {
                console.log("   ⚠️  Could not set treasury (might not be available in this contract version)");
                console.log("   Error:", treasuryError.message);
            }
        } else if (isTreasuryTrezor) {
            console.log("✅ STEP 1: Treasury already set to Trezor");
        } else {
            console.log("⚠️  STEP 1: Treasury function not available in this contract");
        }
        console.log("");
        
        // Step 2: Transfer Ownership to Trezor
        console.log("👑 STEP 2: Transferring Ownership to Trezor...");
        const ownershipTx = await contract.transferOwnership(trezorAddress);
        console.log("   Transaction Hash:", ownershipTx.hash);
        console.log("   Waiting for confirmation...");
        await ownershipTx.wait();
        console.log("   ✅ Ownership transfer initiated!");
        console.log("");
        
        // Step 3: Verify transfer
        console.log("🔍 STEP 3: Verifying Transfer...");
        const newOwner = await contract.owner();
        console.log("   New Owner:", newOwner);
        
        const isOwnershipTransferred = newOwner.toLowerCase() === trezorAddress.toLowerCase();
        console.log("   Ownership Transferred:", isOwnershipTransferred ? "✅ YES" : "❌ NO");
        
        if (isOwnershipTransferred) {
            console.log("");
            console.log("🎉 SUCCESS: OWNERSHIP TRANSFERRED TO TREZOR!");
            console.log("=" * 45);
            console.log("✅ Contract Owner:", newOwner);
            console.log("✅ Treasury Wallet:", currentTreasury !== "Not available" ? currentTreasury : "Set to Trezor if function available");
            console.log("");
            console.log("🔐 SECURITY STATUS:");
            console.log("   ✅ Contract is now controlled by Trezor wallet");
            console.log("   ✅ All admin functions require Trezor signature");
            console.log("   ✅ Hot wallet private keys no longer needed");
            console.log("");
            console.log("🎯 NEXT STEPS:");
            console.log("   • Trezor wallet can now manage the contract");
            console.log("   • Store private keys securely");
            console.log("   • Contract is production-ready");
        } else {
            console.log("❌ TRANSFER FAILED - Please check transaction");
        }
        
        return {
            success: isOwnershipTransferred,
            newOwner,
            currentTreasury,
            transactionHash: ownershipTx.hash
        };
        
    } catch (error) {
        console.error("❌ TRANSFER FAILED:", error.message);
        
        if (error.message.includes("not the contract owner")) {
            console.log("");
            console.log("🔑 SOLUTION: You need to run this script with the current owner's private key");
            console.log("   Current owner should be in your .env file as PRIVATE_KEY");
        }
        
        throw error;
    }
}

if (require.main === module) {
    transferToTrezor().catch(console.error);
}

module.exports = { transferToTrezor };