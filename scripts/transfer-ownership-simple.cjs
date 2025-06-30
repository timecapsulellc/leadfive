// Simple and safe ownership transfer to Trezor
const { ethers } = require("hardhat");
require("dotenv").config();

const CONFIG = {
  CONTRACT_ADDRESS: "0x29dcCb502D10C042BcC6a02a7762C49595A9E498",
  TREZOR_ADDRESS: "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"
};

async function main() {
  console.log("🔄 SIMPLE OWNERSHIP TRANSFER TO TREZOR");
  console.log("=" .repeat(50));
  
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Current Owner: ${deployer.address}`);
  console.log(`🏦 Target Trezor: ${CONFIG.TREZOR_ADDRESS}`);
  console.log(`📍 Contract: ${CONFIG.CONTRACT_ADDRESS}`);
  
  // Verify network
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== BigInt(56)) {
    throw new Error(`❌ Wrong network! Expected BSC Mainnet (56), got ${network.chainId}`);
  }
  console.log("✅ Network: BSC Mainnet");
  
  // Connect to contract
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(CONFIG.CONTRACT_ADDRESS);
  
  // Verify current ownership
  console.log("\n🔍 Verifying current state...");
  const currentOwner = await leadFive.owner();
  const totalUsers = await leadFive.getTotalUsers();
  const isPaused = await leadFive.paused();
  const feeRecipient = await leadFive.platformFeeRecipient();
  
  console.log("📋 Current State:");
  console.log(`├─ Owner: ${currentOwner}`);
  console.log(`├─ Total Users: ${totalUsers.toString()}`);
  console.log(`├─ Contract Paused: ${isPaused}`);
  console.log(`├─ Fee Recipient: ${feeRecipient}`);
  
  if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error("❌ You are not the current owner!");
  }
  
  if (currentOwner.toLowerCase() === CONFIG.TREZOR_ADDRESS.toLowerCase()) {
    console.log("✅ Ownership is already with Trezor wallet!");
    return;
  }
  
  console.log("\n⚠️  OWNERSHIP TRANSFER CONFIRMATION");
  console.log("=" .repeat(50));
  console.log("This will transfer contract ownership to Trezor:");
  console.log(`From: ${currentOwner}`);
  console.log(`To:   ${CONFIG.TREZOR_ADDRESS}`);
  console.log("");
  console.log("After this transfer, you will need Trezor to:");
  console.log("├─ Change contract settings");
  console.log("├─ Upgrade contracts");
  console.log("├─ Withdraw platform fees");
  console.log("├─ Add/remove admins");
  console.log("└─ Make any administrative changes");
  console.log("");
  
  // Wait for confirmation
  console.log("⏳ Proceeding with transfer in 10 seconds...");
  console.log("Press Ctrl+C now to cancel!");
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  console.log("\n🔄 Transferring ownership...");
  
  try {
    // Step 1: Transfer contract ownership
    console.log("1️⃣  Transferring contract ownership...");
    const ownershipTx = await leadFive.transferOwnership(CONFIG.TREZOR_ADDRESS);
    console.log(`📜 Transaction sent: ${ownershipTx.hash}`);
    await ownershipTx.wait();
    console.log("✅ Contract ownership transferred");
    
    // Step 2: Add Trezor as admin (if not already)
    console.log("2️⃣  Adding Trezor as admin...");
    try {
      const addAdminTx = await leadFive.addAdmin(CONFIG.TREZOR_ADDRESS);
      console.log(`📜 Admin transaction sent: ${addAdminTx.hash}`);
      await addAdminTx.wait();
      console.log("✅ Trezor added as admin");
    } catch (adminError) {
      console.log("⚠️  Admin addition failed (may already be admin)");
    }
    
    // Step 3: Update platform fee recipient (optional)
    console.log("3️⃣  Updating platform fee recipient...");
    try {
      if (feeRecipient.toLowerCase() !== CONFIG.TREZOR_ADDRESS.toLowerCase()) {
        const feeRecipientTx = await leadFive.setPlatformFeeRecipient(CONFIG.TREZOR_ADDRESS);
        console.log(`📜 Fee recipient transaction sent: ${feeRecipientTx.hash}`);
        await feeRecipientTx.wait();
        console.log("✅ Platform fee recipient updated");
      } else {
        console.log("✅ Platform fee recipient already set correctly");
      }
    } catch (feeError) {
      console.log("⚠️  Fee recipient update failed (may not have permission)");
    }
    
    // Verify final state
    console.log("\n🔍 Verifying final state...");
    const newOwner = await leadFive.owner();
    const newFeeRecipient = await leadFive.platformFeeRecipient();
    const isNewAdmin = await leadFive.isAdmin(CONFIG.TREZOR_ADDRESS);
    
    console.log("📋 Final State:");
    console.log(`├─ New Owner: ${newOwner}`);
    console.log(`├─ Fee Recipient: ${newFeeRecipient}`);
    console.log(`├─ Trezor is Admin: ${isNewAdmin}`);
    
    if (newOwner.toLowerCase() === CONFIG.TREZOR_ADDRESS.toLowerCase()) {
      console.log("\n🎉 OWNERSHIP TRANSFER SUCCESSFUL!");
      console.log("=" .repeat(50));
      console.log("✅ Contract is now owned by Trezor wallet");
      console.log("✅ All administrative functions require Trezor");
      console.log("✅ Platform is secure and decentralized");
      console.log("");
      console.log("📝 IMPORTANT NEXT STEPS:");
      console.log("1. Save this transaction record");
      console.log("2. Test Trezor access to contract");
      console.log("3. Document Trezor wallet security");
      console.log("4. Update frontend with new owner address");
      
      // Save transfer record
      const transferRecord = {
        timestamp: new Date().toISOString(),
        network: "BSC Mainnet",
        chainId: network.chainId.toString(),
        contractAddress: CONFIG.CONTRACT_ADDRESS,
        fromOwner: deployer.address,
        toOwner: CONFIG.TREZOR_ADDRESS,
        ownershipTx: ownershipTx.hash,
        success: true
      };
      
      const fs = require('fs');
      fs.writeFileSync(
        'ownership-transfer-record.json', 
        JSON.stringify(transferRecord, null, 2)
      );
      console.log("📄 Transfer record saved to ownership-transfer-record.json");
      
    } else {
      throw new Error("❌ Ownership transfer verification failed!");
    }
    
  } catch (error) {
    console.error("❌ Ownership transfer failed:", error.message);
    
    // Check current state after failure
    console.log("\n🔍 Checking current state after failure...");
    const currentState = await leadFive.owner();
    console.log(`Current Owner: ${currentState}`);
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
