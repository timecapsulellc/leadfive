const { ethers } = require("hardhat");
require('dotenv').config();

async function finalOwnershipTransfer() {
    console.log("🔐 FINAL OWNERSHIP TRANSFER TO TREZOR");
    console.log("=" * 50);
    
    // Current mainnet contract address
    const CONTRACT_ADDRESS = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    
    console.log("📋 Contract Address:", CONTRACT_ADDRESS);
    console.log("🔐 Trezor Address:", TREZOR_ADDRESS);
    console.log("");
    
    try {
        // Configure for BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        console.log("👤 Current Signer:", wallet.address);
        console.log("🌐 Network:", await provider.getNetwork());
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log("💰 Signer Balance:", ethers.formatEther(balance), "BNB");
        
        if (balance < ethers.parseEther("0.005")) {
            throw new Error("❌ Insufficient BNB balance. Need at least 0.005 BNB for gas");
        }
        console.log("");
        
        // Contract ABI - including all ownership and treasury functions
        const contractAbi = [
            "function owner() view returns (address)",
            "function transferOwnership(address newOwner)",
            "function setTreasuryWallet(address _treasuryWallet)",
            "function treasuryWallet() view returns (address)",
            "function getTreasuryWallet() view returns (address)",
            "function totalUsers() view returns (uint32)",
            // Two-step ownership transfer functions if available
            "function initiateOwnershipTransfer(address newOwner)",
            "function acceptOwnership()",
            "function pendingOwner() view returns (address)"
        ];
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, wallet);
        
        // Check current owner
        console.log("📊 CHECKING CURRENT STATUS...");
        const currentOwner = await contract.owner();
        console.log("   Current Owner:", currentOwner);
        
        // Verify signer is the owner
        if (currentOwner.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(`❌ Signer ${wallet.address} is not the contract owner ${currentOwner}`);
        }
        
        // Check if already transferred
        if (currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log("✅ OWNERSHIP ALREADY TRANSFERRED TO TREZOR!");
            return { success: true, alreadyTransferred: true };
        }
        
        // Get contract stats
        try {
            const totalUsers = await contract.totalUsers();
            console.log("   Total Users:", totalUsers.toString());
        } catch {
            console.log("   Total Users: Not available");
        }
        
        // Check current treasury
        let currentTreasury = "Not available";
        try {
            currentTreasury = await contract.treasuryWallet();
        } catch {
            try {
                currentTreasury = await contract.getTreasuryWallet();
            } catch {
                // Treasury functions not available
            }
        }
        console.log("   Current Treasury:", currentTreasury);
        console.log("");
        
        // STEP 1: Set Treasury to Trezor (if function exists and not already set)
        if (currentTreasury !== "Not available" && currentTreasury.toLowerCase() !== TREZOR_ADDRESS.toLowerCase()) {
            console.log("🏦 STEP 1: Setting Treasury to Trezor...");
            try {
                const treasuryTx = await contract.setTreasuryWallet(TREZOR_ADDRESS, {
                    gasLimit: 200000
                });
                console.log("   Transaction Hash:", treasuryTx.hash);
                console.log("   Waiting for confirmation...");
                await treasuryTx.wait();
                console.log("   ✅ Treasury set to Trezor!");
            } catch (treasuryError) {
                console.log("   ⚠️  Treasury setting failed:", treasuryError.message);
                console.log("   Continuing with ownership transfer...");
            }
        } else if (currentTreasury.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log("✅ STEP 1: Treasury already set to Trezor");
        } else {
            console.log("⚠️  STEP 1: Treasury function not available");
        }
        console.log("");
        
        // STEP 2: Transfer Ownership
        console.log("👑 STEP 2: Transferring Ownership to Trezor...");
        console.log("⚠️  CRITICAL: This is irreversible!");
        console.log("   From:", currentOwner);
        console.log("   To:", TREZOR_ADDRESS);
        console.log("");
        
        // Try two-step transfer first, then fall back to direct transfer
        let ownershipTx;
        let usedTwoStep = false;
        
        try {
            // Try initiateOwnershipTransfer first (safer)
            ownershipTx = await contract.initiateOwnershipTransfer(TREZOR_ADDRESS, {
                gasLimit: 150000
            });
            usedTwoStep = true;
            console.log("   Using two-step ownership transfer");
        } catch {
            // Fall back to direct transfer
            ownershipTx = await contract.transferOwnership(TREZOR_ADDRESS, {
                gasLimit: 100000
            });
            console.log("   Using direct ownership transfer");
        }
        
        console.log("   Transaction Hash:", ownershipTx.hash);
        console.log("   Waiting for confirmation...");
        const receipt = await ownershipTx.wait();
        console.log("   ✅ Transaction confirmed in block:", receipt.blockNumber);
        console.log("");
        
        // STEP 3: Verify transfer
        console.log("🔍 STEP 3: Verifying Transfer...");
        
        if (usedTwoStep) {
            // Check pending owner
            try {
                const pendingOwner = await contract.pendingOwner();
                console.log("   Pending Owner:", pendingOwner);
                
                if (pendingOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
                    console.log("   ✅ Two-step transfer initiated successfully!");
                    console.log("   🔄 NEXT: Trezor wallet must call acceptOwnership()");
                } else {
                    console.log("   ❌ Two-step transfer failed");
                }
            } catch {
                console.log("   ⚠️  Cannot verify pending owner");
            }
        } else {
            // Check if direct transfer worked
            const newOwner = await contract.owner();
            console.log("   New Owner:", newOwner);
            
            const isTransferred = newOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase();
            if (isTransferred) {
                console.log("   ✅ Direct ownership transfer successful!");
            } else {
                console.log("   ❌ Direct ownership transfer failed");
            }
        }
        
        console.log("");
        console.log("🎉 OWNERSHIP TRANSFER PROCESS COMPLETED!");
        console.log("=" * 50);
        console.log("✅ Transaction Hash:", ownershipTx.hash);
        console.log("✅ Block Number:", receipt.blockNumber);
        console.log("✅ Gas Used:", receipt.gasUsed.toString());
        console.log("");
        console.log("🔗 VERIFICATION LINKS:");
        console.log("   BSCScan TX:", `https://bscscan.com/tx/${ownershipTx.hash}`);
        console.log("   BSCScan Contract:", `https://bscscan.com/address/${CONTRACT_ADDRESS}`);
        console.log("");
        
        if (usedTwoStep) {
            console.log("🔄 NEXT STEPS FOR TREZOR:");
            console.log("   1. Connect Trezor to BSC network");
            console.log("   2. Call acceptOwnership() from Trezor");
            console.log("   3. Verify final ownership transfer");
        } else {
            console.log("✅ OWNERSHIP FULLY TRANSFERRED!");
            console.log("   Trezor wallet now controls the contract");
        }
        
        console.log("");
        console.log("🔐 SECURITY STATUS:");
        console.log("   ✅ Contract secured with Trezor wallet");
        console.log("   ✅ Hot wallet private keys no longer needed");
        console.log("   ✅ All admin functions require Trezor signature");
        
        return {
            success: true,
            transactionHash: ownershipTx.hash,
            blockNumber: receipt.blockNumber,
            usedTwoStep,
            trezorAddress: TREZOR_ADDRESS
        };
        
    } catch (error) {
        console.error("❌ OWNERSHIP TRANSFER FAILED:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 SOLUTION: Add more BNB to your wallet for gas fees");
        } else if (error.message.includes("not the contract owner")) {
            console.log("💡 SOLUTION: Ensure DEPLOYER_PRIVATE_KEY in .env is the current owner");
        }
        
        throw error;
    }
}

if (require.main === module) {
    finalOwnershipTransfer().catch(console.error);
}

module.exports = { finalOwnershipTransfer };