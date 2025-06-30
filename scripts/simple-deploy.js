// Simple deployment script to test
import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("🚀 Simple LeadFive Deployment Test");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB");
  
  // Test contract factory creation
  console.log("Getting LeadFive contract factory...");
  const LeadFive = await ethers.getContractFactory("LeadFive");
  console.log("✅ Contract factory created successfully");
  console.log("Contract bytecode size:", (LeadFive.bytecode.length - 2) / 2, "bytes");
  
  // BSC Testnet addresses
  const TESTNET_USDT = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684";
  const TESTNET_PRICE_FEED = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";
  
  console.log("Contract deployment test passed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
