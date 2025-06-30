// scripts/test-connection.cjs
const hre = require("hardhat");

async function main() {
  console.log("🔍 Testing BSC Testnet Connection");
  console.log("=" .repeat(50));

  try {
    // Check network
    const network = await hre.ethers.provider.getNetwork();
    console.log("Connected to network:", network.name);
    console.log("Chain ID:", network.chainId.toString());
    
    // Get signers
    const signers = await hre.ethers.getSigners();
    console.log("Available signers:", signers.length);
    
    if (signers.length > 0) {
      const deployer = signers[0];
      const deployerAddress = deployer.address || deployer.target;
      console.log("Deployer address:", deployerAddress);
      
      // Check balance
      const balance = await hre.ethers.provider.getBalance(deployerAddress);
      const balanceInBNB = hre.ethers.formatEther(balance);
      console.log("Balance:", balanceInBNB, "BNB");
      
      if (parseFloat(balanceInBNB) === 0) {
        console.log("⚠️  Warning: Zero balance detected!");
        console.log("📝 To get BSC Testnet BNB:");
        console.log("   1. Go to: https://testnet.bnbchain.org/faucet-smart");
        console.log("   2. Enter address:", deployerAddress);
        console.log("   3. Request 0.1 BNB for testing");
        console.log("   4. Wait for transaction confirmation");
      } else {
        console.log("✅ Sufficient balance for deployment");
      }
      
      // Test a simple call
      const blockNumber = await hre.ethers.provider.getBlockNumber();
      console.log("Current block number:", blockNumber);
      
    } else {
      console.log("❌ No signers available. Check private key configuration.");
    }
    
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    if (error.message.includes("could not detect network")) {
      console.log("💡 Possible solutions:");
      console.log("   1. Check internet connection");
      console.log("   2. Verify BSC Testnet RPC URL is working");
      console.log("   3. Try alternative RPC: https://data-seed-prebsc-2-s1.binance.org:8545/");
    }
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
