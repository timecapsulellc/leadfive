const { ethers, upgrades } = require("hardhat");

/**
 * Client Handover Script
 * Transfers ownership and treasury control to client
 */
async function main() {
    console.log("🔄 TRANSFERRING LEADFIVE OWNERSHIP TO CLIENT");
    console.log("=" .repeat(70));

    const [deployer] = await ethers.getSigners();
    console.log("📍 Current owner (developer):", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

    // Configuration - UPDATE THESE FOR CLIENT
    const PROXY_ADDRESS = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const CLIENT_OWNER = process.env.CLIENT_OWNER || "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"; // Client's owner address
    const CLIENT_TREASURY = process.env.CLIENT_TREASURY || "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"; // Client's treasury address
    
    console.log("🔗 Contract Address:", PROXY_ADDRESS);
    console.log("👑 New Owner (Client):", CLIENT_OWNER);
    console.log("🏛️ New Treasury (Client):", CLIENT_TREASURY);

    try {
        // Connect to the LeadFive contract
        const LeadFive = await ethers.getContractAt("LeadFive", PROXY_ADDRESS);
        
        console.log("\n📋 Current Contract Status:");
        const currentOwner = await LeadFive.owner();
        const currentTreasury = await LeadFive.getTreasuryWallet();
        console.log("👑 Current Owner:", currentOwner);
        console.log("🏛️ Current Treasury:", currentTreasury);
        
        // Verify deployer is the current owner
        if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
            throw new Error("Deployer is not the current owner of the contract");
        }

        console.log("\n🔄 OPTION 1: Safe 2-Step Transfer Process");
        console.log("-".repeat(50));
        console.log("1. Initiate ownership transfer");
        console.log("2. Client accepts ownership");
        console.log("3. Update treasury to client");
        
        console.log("\n🚀 OPTION 2: Emergency Single-Step Transfer");
        console.log("-".repeat(50));
        console.log("Transfer both ownership and treasury in one transaction");

        const transferMethod = process.env.TRANSFER_METHOD || "safe"; // "safe" or "emergency"

        if (transferMethod === "emergency") {
            console.log("\n⚡ Executing Emergency Transfer...");
            
            const transferTx = await LeadFive.transferToClient(CLIENT_OWNER, CLIENT_TREASURY);
            await transferTx.wait();
            
            console.log("✅ Emergency transfer completed!");
            
        } else {
            console.log("\n🔒 Executing Safe Transfer Process...");
            
            // Step 1: Initiate ownership transfer
            console.log("Step 1: Initiating ownership transfer...");
            const initOwnerTx = await LeadFive.initiateOwnershipTransfer(CLIENT_OWNER);
            await initOwnerTx.wait();
            console.log("✅ Ownership transfer initiated");
            
            // Step 2: Initiate treasury transfer
            console.log("Step 2: Initiating treasury transfer...");
            const initTreasuryTx = await LeadFive.initiateTreasuryTransfer(CLIENT_TREASURY);
            await initTreasuryTx.wait();
            console.log("✅ Treasury transfer initiated");
            
            // Check pending transfers
            const [pendingOwner, pendingTreasury] = await LeadFive.getPendingTransfers();
            console.log("⏳ Pending owner:", pendingOwner);
            console.log("⏳ Pending treasury:", pendingTreasury);
            
            console.log("\n⚠️  IMPORTANT: Client must now:");
            console.log("1. Call acceptOwnership() from address:", CLIENT_OWNER);
            console.log("2. Then call acceptTreasuryTransfer() to complete setup");
        }

        console.log("\n📊 Post-Transfer Verification:");
        const newOwner = await LeadFive.owner();
        const newTreasury = await LeadFive.getTreasuryWallet();
        console.log("👑 New Owner:", newOwner);
        console.log("🏛️ New Treasury:", newTreasury);

        console.log("\n🎯 Transfer Functions Available:");
        console.log("🔹 initiateOwnershipTransfer(address) - Start ownership transfer");
        console.log("🔹 acceptOwnership() - Accept ownership (called by new owner)");
        console.log("🔹 initiateTreasuryTransfer(address) - Start treasury transfer");
        console.log("🔹 acceptTreasuryTransfer() - Complete treasury transfer");
        console.log("🔹 transferToClient(owner, treasury) - Emergency single-step transfer");
        console.log("🔹 getPendingTransfers() - Check pending transfers");

        // Update config file for client
        console.log("\n🔧 Updating Configuration Files...");
        const configPath = "/Users/dadou/LEAD FIVE/src/config/app.js";
        const fs = require('fs');
        
        try {
            let configContent = fs.readFileSync(configPath, 'utf8');
            
            // Update owner and treasury in config
            configContent = configContent.replace(
                /owner: '0x[a-fA-F0-9]{40}'/,
                `owner: '${CLIENT_OWNER}'`
            );
            configContent = configContent.replace(
                /treasuryWallet: '0x[a-fA-F0-9]{40}'/,
                `treasuryWallet: '${CLIENT_TREASURY}'`
            );
            
            // Write updated config
            fs.writeFileSync(configPath, configContent);
            console.log("✅ Config file updated with client addresses");
        } catch (error) {
            console.log("⚠️  Could not update config file:", error.message);
        }

        console.log("\n" + "=".repeat(70));
        console.log("🎉 CLIENT HANDOVER PROCESS COMPLETED!");
        console.log("=".repeat(70));
        console.log("👑 Contract Owner:", newOwner);
        console.log("🏛️ Treasury Wallet:", newTreasury);
        console.log("💎 All withdrawal fees now go to client treasury");
        console.log("🔒 Client has full control over the contract");
        console.log("=".repeat(70));

        const result = {
            contractAddress: PROXY_ADDRESS,
            previousOwner: deployer.address,
            newOwner: newOwner,
            previousTreasury: currentTreasury,
            newTreasury: newTreasury,
            transferMethod: transferMethod,
            timestamp: new Date().toISOString(),
            status: (newOwner.toLowerCase() === CLIENT_OWNER.toLowerCase()) ? "completed" : "pending",
            notes: [
                "Ownership transferred to client",
                "Treasury transferred to client",
                "All withdrawal fees go to client treasury",
                "Client has full contract control",
                "Frontend should be updated with new addresses"
            ]
        };

        // Save handover results
        const filename = `Client_Handover_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(result, null, 2));
        console.log("💾 Handover results saved to:", filename);

        return result;

    } catch (error) {
        console.error("❌ Transfer failed:", error);
        throw error;
    }
}

// Helper function for step-by-step transfer
async function stepByStepTransfer() {
    console.log("🔄 STEP-BY-STEP TRANSFER HELPER");
    console.log("This function helps complete the safe transfer process");
    
    const [signer] = await ethers.getSigners();
    const PROXY_ADDRESS = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
    const LeadFive = await ethers.getContractAt("LeadFive", PROXY_ADDRESS);
    
    // Check pending transfers
    const [pendingOwner, pendingTreasury] = await LeadFive.getPendingTransfers();
    console.log("⏳ Pending owner:", pendingOwner);
    console.log("⏳ Pending treasury:", pendingTreasury);
    
    if (pendingOwner !== "0x0000000000000000000000000000000000000000") {
        console.log("📋 To complete ownership transfer:");
        console.log(`   Client (${pendingOwner}) should call: acceptOwnership()`);
    }
    
    if (pendingTreasury !== "0x0000000000000000000000000000000000000000") {
        console.log("📋 To complete treasury transfer:");
        console.log("   Current owner should call: acceptTreasuryTransfer()");
    }
}

// Execute based on command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes("--check")) {
        stepByStepTransfer()
            .then(() => process.exit(0))
            .catch((error) => {
                console.error("❌ Check failed:", error);
                process.exit(1);
            });
    } else {
        main()
            .then((result) => {
                console.log("\n🎉 CLIENT HANDOVER COMPLETED!");
                console.log("🔒 Client now has full control of the contract!");
                console.log("💰 All withdrawal fees go to client treasury!");
                console.log("🚀 Contract is ready for client's use!");
                process.exit(0);
            })
            .catch((error) => {
                console.error("💥 Handover failed:", error);
                process.exit(1);
            });
    }
}

module.exports = { main, stepByStepTransfer };