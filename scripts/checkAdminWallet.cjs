const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 ADMIN WALLET VERIFICATION");
  console.log("Contract: 0xf9538Fe9FCF16C018E6057744555F2556f63cED9");
  
  const [currentAccount] = await ethers.getSigners();
  console.log("👤 Current Account:", currentAccount.address);
  
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach("0xf9538Fe9FCF16C018E6057744555F2556f63cED9");
  
  console.log("\n" + "=".repeat(60));
  console.log("🛡️ ADMIN WALLET INFORMATION");
  console.log("=".repeat(60));
  
  try {
    // Get contract owner
    const owner = await contract.owner();
    console.log("✅ Contract Owner:", owner);
    
    // Check admin roles
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    
    // Check who has admin roles
    const adminFromEnv = "0xBcae617E213145BB76fD8023B3D9d7d4F97013e5";
    const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, adminFromEnv);
    console.log("✅ Admin Wallet (from .env):", adminFromEnv);
    console.log("✅ Has Admin Role:", hasAdminRole);
    
    // Check current account admin status
    const currentHasAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, currentAccount.address);
    console.log("✅ Current Account Has Admin:", currentHasAdmin);
    
    // Check deployer status
    const deployerAddress = "0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229";
    const deployerHasAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
    console.log("✅ Deployer Has Admin:", deployerHasAdmin);
    
    console.log("\n📋 ADMIN SUMMARY:");
    console.log("═══════════════════════════════════════");
    console.log("🏠 Contract Owner:", owner);
    console.log("👑 Main Admin Wallet:", adminFromEnv);
    console.log("🔑 Admin Role Status:", hasAdminRole ? "✅ ACTIVE" : "❌ NOT SET");
    console.log("🚀 Deployer Status:", deployerHasAdmin ? "🟡 Still Active" : "🟢 Revoked");
    console.log("═══════════════════════════════════════");
    
    if (owner === adminFromEnv) {
      console.log("✅ PERFECT: Owner and Admin are the same wallet");
    } else {
      console.log("⚠️ WARNING: Owner and Admin are different wallets");
    }
    
    // Check balance of admin wallet
    const adminBalance = await ethers.provider.getBalance(adminFromEnv);
    console.log("💰 Admin Wallet Balance:", ethers.formatEther(adminBalance), "BNB");
    
  } catch (error) {
    console.error("❌ Error checking admin wallet:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
