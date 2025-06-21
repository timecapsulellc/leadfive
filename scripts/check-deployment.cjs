const hre = require("hardhat");

async function main() {
  console.log("🔍 CHECKING DEPLOYMENT PREREQUISITES");
  console.log("=".repeat(50));
  
  // Check environment variables
  const bscApiKey = process.env.BSCSCAN_API_KEY;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  
  console.log("📋 Environment Check:");
  console.log("- BSCScan API Key:", bscApiKey ? "✅ Set" : "❌ Missing");
  console.log("- Private Key:", privateKey && privateKey !== "YOUR_PRIVATE_KEY_HERE" ? "✅ Set" : "❌ Missing");
  
  if (!privateKey || privateKey === "YOUR_PRIVATE_KEY_HERE") {
    console.log("\n❌ MISSING PRIVATE KEY!");
    console.log("Please add your wallet's private key to .env file:");
    console.log("DEPLOYER_PRIVATE_KEY=0x1234567890abcdef...");
    console.log("\n🔐 How to get your private key:");
    console.log("1. Open MetaMask");
    console.log("2. Click account menu (3 dots)");
    console.log("3. Account Details > Export Private Key");
    console.log("4. Enter password and copy the key");
    console.log("5. Add to .env file");
    return;
  }
  
  // Check network connection
  try {
    const signers = await hre.ethers.getSigners();
    if (signers.length === 0) {
      console.log("❌ No deployer account found");
      return;
    }
    
    const deployer = signers[0];
    console.log("- Deployer Address:", deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    const bnbBalance = parseFloat(hre.ethers.utils.formatEther(balance));
    
    console.log("- BNB Balance:", bnbBalance.toFixed(4), "BNB");
    
    if (bnbBalance < 0.05) {
      console.log("❌ Insufficient BNB! Need at least 0.05 BNB for deployment");
      console.log("💡 Add BNB to your wallet:", deployer.address);
      return;
    }
    
    console.log("\n✅ ALL PREREQUISITES MET!");
    console.log("🚀 Ready to deploy the correct LeadFive contract!");
    console.log("\nRun: npm run deploy:correct");
    
  } catch (error) {
    console.log("❌ Network connection failed:", error.message);
    console.log("💡 Check your internet connection and try again");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
