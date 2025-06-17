const { ethers } = require("hardhat");

async function main() {
  const proxyAddress = "0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732";
  
  // You need to add TREASURY_PRIVATE_KEY to your .env file to run this
  if (!process.env.TREASURY_PRIVATE_KEY) {
    console.log("❌ TREASURY_PRIVATE_KEY not found in .env file");
    console.log("🔑 Current contract owner is the treasury address:", process.env.TREASURY_ADDRESS);
    console.log("📝 Please add TREASURY_PRIVATE_KEY to your .env file to transfer ownership");
    return;
  }
  
  // Get the treasury signer
  const treasuryWallet = new ethers.Wallet(process.env.TREASURY_PRIVATE_KEY, ethers.provider);
  console.log("🏦 Treasury account:", treasuryWallet.address);
  
  // Connect to contract as treasury owner
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundMain", treasuryWallet);
  const contract = OrphiCrowdFund.attach(proxyAddress);
  
  const newOwner = process.env.ADMIN_ADDRESS;
  console.log("👤 Transferring ownership to admin:", newOwner);
  
  try {
    // Transfer ownership
    const tx = await contract.transferOwnership(newOwner);
    await tx.wait();
    
    console.log("✅ Ownership transferred successfully!");
    console.log("🔗 Transaction hash:", tx.hash);
    
    // Verify the transfer
    const currentOwner = await contract.owner();
    console.log("📋 New contract owner:", currentOwner);
    
  } catch (error) {
    console.error("❌ Error transferring ownership:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
