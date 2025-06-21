const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🔐 LEADFIVE OWNERSHIP TRANSFER");
    console.log("=".repeat(60));
    
    // Load deployment info
    const fs = require('fs');
    let deploymentInfo;
    
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('mainnet-deployment.json', 'utf8'));
        console.log("📄 Loaded deployment info from mainnet-deployment.json");
    } catch (error) {
        console.error("❌ Could not load mainnet-deployment.json");
        console.log("Please provide contract address manually:");
        // You can hardcode the address here if needed
        const contractAddress = "YOUR_MAINNET_CONTRACT_ADDRESS"; // Replace with actual address
        deploymentInfo = { contractAddress };
    }
    
    // Configuration
    const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || "0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569";
    const NEW_OWNER_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"; // Trezor wallet address
    
    console.log("🔍 TRANSFER CONFIGURATION:");
    console.log("- Contract Address:", CONTRACT_ADDRESS);
    console.log("- New Owner (Trezor):", NEW_OWNER_ADDRESS);
    
    // Validate addresses
    if (!ethers.isAddress(CONTRACT_ADDRESS)) {
        throw new Error("❌ Invalid contract address");
    }
    
    if (!ethers.isAddress(NEW_OWNER_ADDRESS)) {
        throw new Error("❌ Invalid new owner address");
    }
    
    if (NEW_OWNER_ADDRESS === "YOUR_TREZOR_WALLET_ADDRESS") {
        throw new Error("❌ Please replace YOUR_TREZOR_WALLET_ADDRESS with your actual Trezor wallet address");
    }
    
    // Get current deployer
    const [deployer] = await ethers.getSigners();
    console.log("- Current deployer:", deployer.address);
    
    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("- Deployer balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.005")) {
        throw new Error("❌ Insufficient BNB balance for transaction. Need at least 0.005 BNB");
    }
    
    // Connect to contract
    const LeadFive = await ethers.getContractAt("LeadFive", CONTRACT_ADDRESS);
    
    // Verify current ownership
    console.log("\n🔍 VERIFYING CURRENT STATE:");
    const currentOwner = await LeadFive.owner();
    console.log("- Current owner:", currentOwner);
    
    if (currentOwner !== deployer.address) {
        throw new Error("❌ Deployer is not the current owner of the contract");
    }
    
    if (currentOwner === NEW_OWNER_ADDRESS) {
        console.log("✅ Contract is already owned by the specified address");
        return;
    }
    
    console.log("\n⚠️  SECURITY CONFIRMATION:");
    console.log("This will transfer ownership to:", NEW_OWNER_ADDRESS);
    console.log("After this transfer, only the new owner can:");
    console.log("- Pause/unpause the contract");
    console.log("- Upgrade the contract");
    console.log("- Transfer ownership again");
    console.log("- Access owner-only functions");
    
    console.log("\n🔄 Initiating ownership transfer...");
    
    try {
        // Transfer ownership
        const transferTx = await LeadFive.transferOwnership(NEW_OWNER_ADDRESS);
        console.log("📤 Transaction submitted:", transferTx.hash);
        
        console.log("⏳ Waiting for confirmation...");
        const receipt = await transferTx.wait();
        console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
        
        // Verify ownership transfer
        console.log("\n🔍 Verifying ownership transfer...");
        const newOwner = await LeadFive.owner();
        console.log("- New owner:", newOwner);
        
        if (newOwner === NEW_OWNER_ADDRESS) {
            console.log("✅ OWNERSHIP TRANSFER SUCCESSFUL!");
        } else {
            throw new Error("❌ Ownership transfer verification failed");
        }
        
        // Update deployment info
        deploymentInfo.ownershipTransfer = {
            previousOwner: currentOwner,
            newOwner: newOwner,
            transferTime: new Date().toISOString(),
            transactionHash: transferTx.hash,
            blockNumber: receipt.blockNumber
        };
        
        // Save updated deployment info
        fs.writeFileSync(
            'mainnet-deployment.json', 
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log("\n🎉 OWNERSHIP TRANSFER COMPLETE!");
        console.log("=".repeat(60));
        console.log("✅ Contract ownership transferred to Trezor wallet");
        console.log("✅ Transaction hash:", transferTx.hash);
        console.log("✅ New owner:", newOwner);
        
        console.log("\n🔗 VERIFICATION LINKS:");
        console.log("- Transaction:", `https://bscscan.com/tx/${transferTx.hash}`);
        console.log("- Contract:", `https://bscscan.com/address/${CONTRACT_ADDRESS}`);
        
        console.log("\n🔄 NEXT STEPS:");
        console.log("1. ✅ Ownership transferred to secure Trezor wallet");
        console.log("2. 🔑 IMMEDIATELY rotate exposed credentials");
        console.log("3. 🔍 Verify contract on BSCScan");
        console.log("4. 🔗 Update frontend configuration");
        console.log("5. 📊 Set up contract monitoring");
        console.log("6. 🧪 Test all functions with new owner");
        
        console.log("\n⚠️  CRITICAL SECURITY REMINDERS:");
        console.log("- Keep your Trezor device secure");
        console.log("- Test Trezor connectivity before critical operations");
        console.log("- Backup your Trezor seed phrase securely");
        console.log("- Never share your seed phrase or private keys");
        
        return {
            previousOwner: currentOwner,
            newOwner: newOwner,
            transactionHash: transferTx.hash
        };
        
    } catch (error) {
        console.error("\n💥 OWNERSHIP TRANSFER FAILED:", error.message);
        throw error;
    }
}

main()
    .then((result) => {
        console.log("\n🎉 OWNERSHIP TRANSFER COMPLETED SUCCESSFULLY!");
        console.log("New Owner:", result.newOwner);
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Ownership transfer failed:", error.message);
        process.exit(1);
    });
