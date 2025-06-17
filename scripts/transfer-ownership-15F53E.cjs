
// OWNERSHIP TRANSFER SCRIPT - Execute after frontend is ready
// Generated on: 2025-06-16T12:28:55.610Z
// Contract: 0x15F53E08a4F4732192778CCEB532694349D26684
// Current Owner: 0x69fBE3E29d32d3518ca53db0D3d017FC163F0E8C
// Future Owner: 0x69fBE3E29d32d3518ca53db0D3d017FC163F0E8C

const { ethers } = require("hardhat");

async function transferOwnership() {
  const contract = await ethers.getContractAt("OrphiCrowdFund", "0x15F53E08a4F4732192778CCEB532694349D26684");
  const [signer] = await ethers.getSigners();
  
  console.log("Transferring ownership from", signer.address, "to", "0x69fBE3E29d32d3518ca53db0D3d017FC163F0E8C");
  
  const tx = await contract.transferOwnership("0x69fBE3E29d32d3518ca53db0D3d017FC163F0E8C");
  await tx.wait();
  
  console.log("✅ Ownership transferred successfully!");
  console.log("Transaction hash:", tx.hash);
}

transferOwnership().catch(console.error);
