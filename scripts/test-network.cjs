// scripts/test-network.cjs
// Test network connectivity

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Testing Network Configuration");
  console.log("=" .repeat(50));
  
  try {
    const network = await ethers.provider.getNetwork();
    console.log(`✅ Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    const [signer] = await ethers.getSigners();
    console.log(`✅ Deployer: ${signer.address}`);
    
    const balance = await ethers.provider.getBalance(signer.address);
    console.log(`✅ Balance: ${ethers.formatEther(balance)} ETH/BNB`);
    
    if (network.chainId === BigInt(56)) {
      console.log("✅ Connected to BSC Mainnet!");
    } else if (network.chainId === BigInt(97)) {
      console.log("✅ Connected to BSC Testnet!");
    } else {
      console.log(`ℹ️  Connected to network with Chain ID: ${network.chainId}`);
    }
    
  } catch (error) {
    console.error("❌ Network test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
