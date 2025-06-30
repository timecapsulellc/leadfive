// scripts/ownership-transfer.js
// Script to transfer ownership and admin rights after configuration is complete

import hre from "hardhat";
import fs from "fs";

const { ethers } = hre;

async function main() {
  console.log("🔄 LeadFive Ownership Transfer Script");
  console.log("=" .repeat(50));

  // Get current deployer/owner account
  const [deployer] = await ethers.getSigners();
  console.log("Current account:", deployer.address);
  
  // Contract address (update this with your deployed contract address)
  const CONTRACT_ADDRESS = process.env.LEADFIVE_CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE";
  
  // New owner address (update this with the target owner address)
  const NEW_OWNER_ADDRESS = process.env.NEW_OWNER_ADDRESS || "NEW_OWNER_ADDRESS_HERE";
  
  // New platform fee recipient (can be same as new owner or different)
  const NEW_FEE_RECIPIENT = process.env.NEW_FEE_RECIPIENT || NEW_OWNER_ADDRESS;
  
  if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
    console.error("❌ Please set the CONTRACT_ADDRESS in the script or environment");
    process.exit(1);
  }
  
  if (NEW_OWNER_ADDRESS === "NEW_OWNER_ADDRESS_HERE") {
    console.error("❌ Please set the NEW_OWNER_ADDRESS in the script or environment");
    process.exit(1);
  }
  
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("New Owner Address:", NEW_OWNER_ADDRESS);
  console.log("New Fee Recipient:", NEW_FEE_RECIPIENT);
  
  try {
    // Connect to the deployed contract
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(CONTRACT_ADDRESS);
    
    console.log("\n🔍 Verifying Current State...");
    
    // Check current owner
    const currentOwner = await leadFive.owner();
    console.log("Current Owner:", currentOwner);
    
    if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error("❌ Current account is not the contract owner!");
    }
    
    // Check current platform fee recipient
    const currentFeeRecipient = await leadFive.platformFeeRecipient();
    console.log("Current Fee Recipient:", currentFeeRecipient);
    
    // Check if new owner address is valid
    if (!ethers.isAddress(NEW_OWNER_ADDRESS)) {
      throw new Error("❌ Invalid new owner address!");
    }
    
    console.log("✅ Current account confirmed as owner");
    console.log("✅ New owner address is valid");
    
    // Step 1: Update platform fee recipient if different
    if (NEW_FEE_RECIPIENT.toLowerCase() !== currentFeeRecipient.toLowerCase()) {
      console.log("\n💰 Updating Platform Fee Recipient...");
      const setPlatformFeeTx = await leadFive.setPlatformFeeRecipient(NEW_FEE_RECIPIENT);
      await setPlatformFeeTx.wait();
      console.log("✅ Platform fee recipient updated to:", NEW_FEE_RECIPIENT);
      console.log("Transaction hash:", setPlatformFeeTx.hash);
    } else {
      console.log("\n💰 Platform fee recipient already set correctly");
    }
    
    // Step 2: Add new owner as admin (if they're not already)
    console.log("\n👤 Adding New Owner as Admin...");
    try {
      const addAdminTx = await leadFive.addAdmin(NEW_OWNER_ADDRESS);
      await addAdminTx.wait();
      console.log("✅ New owner added as admin");
      console.log("Transaction hash:", addAdminTx.hash);
    } catch (error) {
      if (error.message.includes("Already admin")) {
        console.log("✅ New owner is already an admin");
      } else {
        console.log("⚠️ Could not add new owner as admin:", error.message);
      }
    }
    
    // Step 3: Transfer ownership
    console.log("\n🔄 Transferring Ownership...");
    const transferTx = await leadFive.transferOwnership(NEW_OWNER_ADDRESS);
    await transferTx.wait();
    console.log("✅ Ownership transfer initiated");
    console.log("Transaction hash:", transferTx.hash);
    
    // Verify ownership transfer
    const newOwner = await leadFive.owner();
    console.log("New Owner:", newOwner);
    
    if (newOwner.toLowerCase() === NEW_OWNER_ADDRESS.toLowerCase()) {
      console.log("✅ Ownership successfully transferred!");
    } else {
      console.log("⚠️ Ownership transfer pending - new owner must accept");
    }
    
    // Save transfer record
    const transferRecord = {
      timestamp: new Date().toISOString(),
      contractAddress: CONTRACT_ADDRESS,
      previousOwner: deployer.address,
      newOwner: NEW_OWNER_ADDRESS,
      newFeeRecipient: NEW_FEE_RECIPIENT,
      transferTxHash: transferTx.hash,
      network: "BSC Testnet",
      status: newOwner.toLowerCase() === NEW_OWNER_ADDRESS.toLowerCase() ? "Complete" : "Pending Acceptance"
    };
    
    const recordFile = `ownership-transfer-${Date.now()}.json`;
    fs.writeFileSync(recordFile, JSON.stringify(transferRecord, null, 2));
    console.log(`\n💾 Transfer record saved to: ${recordFile}`);
    
    console.log("\n🎉 Ownership Transfer Process Completed!");
    console.log("=" .repeat(50));
    console.log("📋 TRANSFER SUMMARY");
    console.log("=" .repeat(50));
    console.log(`Contract: ${CONTRACT_ADDRESS}`);
    console.log(`Previous Owner: ${deployer.address}`);
    console.log(`New Owner: ${NEW_OWNER_ADDRESS}`);
    console.log(`Fee Recipient: ${NEW_FEE_RECIPIENT}`);
    console.log(`Status: ${transferRecord.status}`);
    console.log("=" .repeat(50));
    
    if (transferRecord.status === "Pending Acceptance") {
      console.log("\n⚠️ IMPORTANT: New owner must call acceptOwnership() to complete transfer");
      console.log("The new owner should connect with their wallet and call:");
      console.log(`leadFive.acceptOwnership()`);
    }
    
    console.log("\n✅ ADMIN FUNCTIONS NOW AVAILABLE TO NEW OWNER:");
    console.log("• addAdmin(address) - Add new admins");
    console.log("• removeAdmin(address) - Remove admins");
    console.log("• setPlatformFeeRecipient(address) - Change fee recipient");
    console.log("• pause() / unpause() - Emergency controls");
    console.log("• addOracle(address) / removeOracle(address) - Oracle management");
    
    return transferRecord;

  } catch (error) {
    console.error("❌ Transfer failed:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

// Run transfer script
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Transfer script failed:", error);
      process.exit(1);
    });
}

export default main;
