// scripts/check-setup.cjs
// Check deployment setup and available accounts

const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking Deployment Setup");
  console.log("=" .repeat(50));

  try {
    // Get signers
    const signers = await hre.ethers.getSigners();
    console.log("Available signers:", signers.length);
    
    if (signers.length === 0) {
      console.log("❌ No signers available. Please check your private key configuration.");
      return;
    }

    const deployer = signers[0];
    console.log("Deployer address:", deployer.address);
    
    // Check balance
    try {
      const balance = await hre.ethers.provider.getBalance(deployer.address);
      console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH");
      
      if (balance.eq(0)) {
        console.log("⚠️  Zero balance detected. This might be a configuration issue or you need testnet BNB.");
        console.log("To get testnet BNB, visit: https://testnet.binance.org/faucet-smart");
      }
    } catch (balanceError) {
      console.log("❌ Error checking balance:", balanceError.message);
    }

    // Network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("Connected to network:", network.name, "Chain ID:", network.chainId);
    
    if (network.chainId === 97) {
      console.log("✅ Successfully connected to BSC Testnet");
    } else {
      console.log("⚠️  Not connected to BSC Testnet (Chain ID should be 97)");
    }

  } catch (error) {
    console.error("❌ Setup check failed:", error.message);
    console.log("\nPossible solutions:");
    console.log("1. Check your DEPLOYER_PRIVATE_KEY in .env file");
    console.log("2. Ensure your private key is properly encrypted");
    console.log("3. Try using a direct private key (not encrypted) for testing");
    console.log("4. Check network configuration in hardhat.config.js");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
