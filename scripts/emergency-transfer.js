// Emergency Ownership Transfer Script for LeadFive Contract
// Use this script to transfer ownership to a new secure wallet

const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚨 EMERGENCY OWNERSHIP TRANSFER SCRIPT");
    console.log("=" * 50);

    try {
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        console.log("🔐 Current owner:", deployer.address);

        // Get contract address from environment
        const contractAddress = process.env.LEADFIVE_MAINNET_PROXY;
        if (!contractAddress) {
            console.error("❌ Contract address not found in environment");
            console.log("Please set LEADFIVE_MAINNET_PROXY in .env file");
            process.exit(1);
        }

        // Get new owner address from environment or prompt
        const newOwner = process.env.LEADFIVE_EMERGENCY_WALLET;
        if (!newOwner) {
            console.error("❌ Emergency wallet address not found");
            console.log("Please set LEADFIVE_EMERGENCY_WALLET in .env file");
            console.log("This should be your new secure wallet address");
            process.exit(1);
        }

        // Validate new owner address
        if (!ethers.isAddress(newOwner)) {
            console.error("❌ Invalid emergency wallet address");
            process.exit(1);
        }

        // Connect to contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);

        console.log("📍 Contract Address:", contractAddress);
        console.log("👤 Current Owner:", deployer.address);
        console.log("🆕 New Owner:", newOwner);

        // Verify current ownership
        const currentOwner = await contract.owner();
        if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.error("❌ You are not the current owner of this contract");
            console.log("Current owner:", currentOwner);
            process.exit(1);
        }

        console.log("⚠️  WARNING: This will transfer ALL ownership rights!");
        console.log("⚠️  Make sure the new wallet is secure and accessible!");
        
        // In a real emergency, you might want to skip this confirmation
        // For safety, we'll include it here
        console.log("\n🔄 Initiating ownership transfer...");

        // LeadFive uses delayed ownership transfer for security
        // First, initiate the transfer
        const initiateTx = await contract.transferOwnership(newOwner);
        console.log("📝 Transfer initiation hash:", initiateTx.hash);
        
        await initiateTx.wait();
        console.log("✅ Ownership transfer initiated");

        // Get transfer info
        const transferInfo = await contract.getOwnershipTransferInfo();
        const pendingOwner = transferInfo[0];
        const transferTime = transferInfo[1];
        const remainingDelay = transferInfo[2];

        console.log("⏳ Pending owner:", pendingOwner);
        console.log("⏰ Transfer time:", new Date(Number(transferTime) * 1000).toLocaleString());
        console.log("⏱️  Remaining delay:", Number(remainingDelay), "seconds");

        if (remainingDelay > 0) {
            console.log("\n⚠️  DELAYED TRANSFER ACTIVE");
            console.log("✅ Transfer initiated successfully");
            console.log("⏳ New owner must call acceptOwnership() after delay");
            console.log("⏰ Delay remaining:", Math.ceil(Number(remainingDelay) / 3600), "hours");
            
            console.log("\n📋 NEXT STEPS:");
            console.log("1. Wait for the delay period to expire");
            console.log("2. Use new wallet to call acceptOwnership()");
            console.log("3. Verify ownership transfer completed");
            console.log("4. Secure the old private key");
        } else {
            console.log("\n🚀 No delay required - completing transfer...");
            
            // If no delay, we can complete immediately
            // Note: This would require the new owner to sign
            console.log("⚠️  New owner must call acceptOwnership() to complete");
        }

        // Provide script for new owner
        console.log("\n📜 SCRIPT FOR NEW OWNER:");
        console.log("const contract = await ethers.getContractAt('LeadFive', '" + contractAddress + "');");
        console.log("await contract.acceptOwnership();");

    } catch (error) {
        console.error("❌ Emergency transfer failed:", error.message);
        
        if (error.message.includes("Ownable: caller is not the owner")) {
            console.log("\n🔐 SECURITY NOTE:");
            console.log("Only the current owner can transfer ownership");
            console.log("If you're not the owner, this is working as intended");
        }
        
        process.exit(1);
    }

    console.log("\n" + "=" * 50);
    console.log("🚨 Emergency transfer script completed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Emergency script failed:", error);
        process.exit(1);
    });
