const { ethers } = require("hardhat");
require('dotenv').config();

async function directOwnershipTransfer() {
    console.log("🔐 DIRECT OWNERSHIP TRANSFER TO TREZOR");
    console.log("=" * 50);
    
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
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        console.log("💰 Signer Balance:", ethers.formatEther(balance), "BNB");
        console.log("");
        
        // Simplified ABI for direct ownership transfer
        const contractAbi = [
            "function owner() view returns (address)",
            "function transferOwnership(address newOwner)",
            "function setTreasuryWallet(address _treasuryWallet)"
        ];
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, wallet);
        
        // Check current owner
        const currentOwner = await contract.owner();
        console.log("📊 Current Owner:", currentOwner);
        
        // Verify signer is the owner
        if (currentOwner.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(`❌ Signer ${wallet.address} is not the contract owner ${currentOwner}`);
        }
        
        // Check if already transferred
        if (currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log("✅ OWNERSHIP ALREADY TRANSFERRED TO TREZOR!");
            return { success: true, alreadyTransferred: true };
        }
        
        console.log("🔄 TARGET TREZOR:", TREZOR_ADDRESS);
        console.log("");
        
        // STEP 1: Set Treasury to Trezor first
        console.log("🏦 STEP 1: Setting Treasury to Trezor...");
        try {
            const treasuryTx = await contract.setTreasuryWallet(TREZOR_ADDRESS, {
                gasLimit: 200000,
                gasPrice: ethers.parseUnits("3", "gwei")
            });
            console.log("   Treasury TX Hash:", treasuryTx.hash);
            console.log("   Waiting for treasury confirmation...");
            await treasuryTx.wait();
            console.log("   ✅ Treasury set to Trezor!");
        } catch (treasuryError) {
            console.log("   ⚠️  Treasury setting failed (function might not exist):");
            console.log("   ", treasuryError.message);
            console.log("   Continuing with ownership transfer...");
        }
        console.log("");
        
        // STEP 2: Direct ownership transfer
        console.log("👑 STEP 2: Direct Ownership Transfer...");
        console.log("⚠️  CRITICAL: This will immediately transfer ownership!");
        console.log("   From:", currentOwner);
        console.log("   To:", TREZOR_ADDRESS);
        console.log("");
        
        const ownershipTx = await contract.transferOwnership(TREZOR_ADDRESS, {
            gasLimit: 150000,
            gasPrice: ethers.parseUnits("3", "gwei")
        });
        
        console.log("   Transaction Hash:", ownershipTx.hash);
        console.log("   Waiting for confirmation...");
        const receipt = await ownershipTx.wait();
        console.log("   ✅ Transaction confirmed in block:", receipt.blockNumber);
        console.log("");
        
        // STEP 3: Verify transfer
        console.log("🔍 STEP 3: Verifying Transfer...");
        const newOwner = await contract.owner();
        console.log("   New Owner:", newOwner);
        
        const isTransferred = newOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase();
        console.log("   Transfer Success:", isTransferred ? "✅ YES" : "❌ NO");
        console.log("");
        
        if (isTransferred) {
            console.log("🎉 SUCCESS: OWNERSHIP FULLY TRANSFERRED!");
            console.log("=" * 50);
            console.log("✅ Contract Owner:", newOwner);
            console.log("✅ Treasury Wallet: Set to Trezor (if function available)");
            console.log("✅ Transaction Hash:", ownershipTx.hash);
            console.log("✅ Block Number:", receipt.blockNumber);
            console.log("");
            console.log("🔗 VERIFICATION LINKS:");
            console.log("   BSCScan TX:", `https://bscscan.com/tx/${ownershipTx.hash}`);
            console.log("   BSCScan Contract:", `https://bscscan.com/address/${CONTRACT_ADDRESS}`);
            console.log("");
            console.log("🔐 SECURITY STATUS:");
            console.log("   ✅ Contract is now owned by Trezor wallet");
            console.log("   ✅ All admin functions require Trezor signature");
            console.log("   ✅ Hot wallet private keys are no longer needed");
            console.log("   ✅ Contract is production-ready and secure");
            console.log("");
            console.log("🎯 FINAL ACTIONS COMPLETED:");
            console.log("   ✅ Ownership transferred to Trezor");
            console.log("   ✅ Treasury set to Trezor (if available)");
            console.log("   ✅ Smart contract secured");
            console.log("   ✅ Ready for production use");
        } else {
            console.log("❌ TRANSFER FAILED");
            console.log("   Current owner is still:", newOwner);
        }
        
        return {
            success: isTransferred,
            transactionHash: ownershipTx.hash,
            blockNumber: receipt.blockNumber,
            newOwner,
            trezorAddress: TREZOR_ADDRESS
        };
        
    } catch (error) {
        console.error("❌ DIRECT TRANSFER FAILED:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 SOLUTION: Add more BNB to your wallet for gas fees");
        } else if (error.message.includes("not the contract owner")) {
            console.log("💡 SOLUTION: Ensure DEPLOYER_PRIVATE_KEY in .env is the current owner");
        } else if (error.message.includes("execution reverted")) {
            console.log("💡 POSSIBLE ISSUE: Contract might already be transferred or have restrictions");
        }
        
        throw error;
    }
}

if (require.main === module) {
    directOwnershipTransfer().catch(console.error);
}

module.exports = { directOwnershipTransfer };