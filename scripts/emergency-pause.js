// Emergency Pause Script for LeadFive Contract
// Use this script if private key compromise is suspected

const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚨 EMERGENCY PAUSE SCRIPT ACTIVATED");
    console.log("=" * 50);

    try {
        // Get deployer account
        const [deployer] = await ethers.getSigners();
        console.log("🔐 Emergency action by:", deployer.address);

        // Get contract address from environment or prompt
        const contractAddress = process.env.LEADFIVE_MAINNET_PROXY;
        if (!contractAddress) {
            console.error("❌ Contract address not found in environment");
            console.log("Please set LEADFIVE_MAINNET_PROXY in .env file");
            process.exit(1);
        }

        // Connect to contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);

        console.log("📍 Contract Address:", contractAddress);
        console.log("⏸️  Initiating emergency pause...");

        // Execute emergency pause
        const tx = await contract.pause();
        console.log("📝 Transaction Hash:", tx.hash);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("✅ Emergency pause confirmed in block:", receipt.blockNumber);

        // Verify pause status
        const isPaused = await contract.paused();
        console.log("🔒 Contract paused status:", isPaused);

        if (isPaused) {
            console.log("\n🚨 EMERGENCY PAUSE SUCCESSFUL");
            console.log("✅ All contract functions are now paused");
            console.log("✅ No new registrations or withdrawals possible");
            console.log("✅ Contract is secured against further activity");
            
            console.log("\n📋 NEXT STEPS:");
            console.log("1. Investigate security incident");
            console.log("2. Secure new private key if compromised");
            console.log("3. Run emergency-transfer.js if needed");
            console.log("4. Resume operations when secure");
        } else {
            console.log("❌ Emergency pause failed - contract still active");
        }

    } catch (error) {
        console.error("❌ Emergency pause failed:", error.message);
        
        if (error.message.includes("Ownable: caller is not the owner")) {
            console.log("\n🔐 SECURITY NOTE:");
            console.log("Only the contract owner can pause the contract");
            console.log("If you're not the owner, contact the current owner immediately");
        }
        
        process.exit(1);
    }

    console.log("\n" + "=" * 50);
    console.log("🚨 Emergency pause script completed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Emergency script failed:", error);
        process.exit(1);
    });
