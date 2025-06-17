const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.log("❌ Usage: npx hardhat run scripts/verifyOwnership.cjs --network bsc <CONTRACT_ADDRESS>");
    return;
  }

  console.log("🔍 VERIFYING COMPLETE OWNERSHIP TRANSFER");
  console.log("📍 Contract Address:", contractAddress);

  const finalAdminAddress = process.env.METAMASK_ADMIN_WALLET;
  const distributorAddress = process.env.DISTRIBUTOR_ADDRESS;
  const platformAddress = process.env.PLATFORM_ADDRESS;
  const auditAddress = process.env.AUDIT_ADDRESS;

  console.log("\n👥 Expected Role Assignments:");
  console.log("├── Final Admin (MetaMask):", finalAdminAddress);
  console.log("├── Distributor:", distributorAddress);
  console.log("├── Platform:", platformAddress);
  console.log("└── Audit:", auditAddress);

  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach(contractAddress);

  console.log("\n" + "=".repeat(60));
  console.log("🔐 OWNERSHIP & ROLE VERIFICATION");
  console.log("=".repeat(60));

  try {
    // Check ownership
    const owner = await contract.owner();
    console.log("\n👑 CONTRACT OWNERSHIP:");
    console.log("✅ Current owner:", owner);
    console.log("✅ Owner matches MetaMask admin:", owner.toLowerCase() === finalAdminAddress.toLowerCase());

    // Check all roles
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
    const PLATFORM_ROLE = await contract.PLATFORM_ROLE();
    const AUDIT_ROLE = await contract.AUDIT_ROLE();
    const EMERGENCY_ROLE = await contract.EMERGENCY_ROLE();

    console.log("\n🛡️  ROLE VERIFICATION:");
    
    // MetaMask Admin roles
    const hasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, finalAdminAddress);
    const hasAdmin = await contract.hasRole(ADMIN_ROLE, finalAdminAddress);
    const hasEmergency = await contract.hasRole(EMERGENCY_ROLE, finalAdminAddress);
    
    console.log("📋 MetaMask Admin Roles:");
    console.log("├── DEFAULT_ADMIN_ROLE:", hasDefaultAdmin ? "✅" : "❌");
    console.log("├── ADMIN_ROLE:", hasAdmin ? "✅" : "❌");
    console.log("└── EMERGENCY_ROLE:", hasEmergency ? "✅" : "❌");

    // Specific role assignments
    const hasDistributor = await contract.hasRole(DISTRIBUTOR_ROLE, distributorAddress);
    const hasPlatform = await contract.hasRole(PLATFORM_ROLE, platformAddress);
    const hasAudit = await contract.hasRole(AUDIT_ROLE, auditAddress);

    console.log("\n📋 Specific Role Assignments:");
    console.log("├── DISTRIBUTOR_ROLE:", hasDistributor ? "✅" : "❌");
    console.log("├── PLATFORM_ROLE:", hasPlatform ? "✅" : "❌");
    console.log("└── AUDIT_ROLE:", hasAudit ? "✅" : "❌");

    // Check contract configuration
    console.log("\n⚙️  CONTRACT CONFIGURATION:");
    const treasury = await contract.treasury();
    const platform = await contract.platformWallet();
    const paused = await contract.paused();
    const packageCount = await contract.getPackageCount();

    console.log("├── Treasury:", treasury);
    console.log("├── Platform Wallet:", platform);
    console.log("├── Contract Paused:", paused);
    console.log("└── Package Count:", packageCount.toString());

    // Show package amounts
    console.log("\n💰 PACKAGE CONFIGURATION:");
    for (let i = 0; i < Math.min(packageCount, 8); i++) {
      const amount = await contract.packageAmounts(i);
      const usdEquivalent = parseFloat(ethers.formatEther(amount)) * 300;
      console.log(`   Package ${i}: ${ethers.formatEther(amount)} BNB (~$${usdEquivalent.toFixed(0)})`);
    }

    // Check bonus configuration
    console.log("\n🎯 BONUS CONFIGURATION:");
    const directBonus = await contract.directBonus();
    const ghpPercentage = await contract.ghpPercentage();
    const earningsCap = await contract.earningsCap();

    console.log("├── Direct Bonus:", directBonus.toString(), "basis points");
    console.log("├── GHP Percentage:", ghpPercentage.toString(), "basis points");
    console.log("└── Earnings Cap:", earningsCap.toString(), "basis points");

    // Security check - ensure deployer has no roles
    console.log("\n🔒 SECURITY VERIFICATION:");
    const [deployer] = await ethers.getSigners();
    const deployerHasDefaultAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const deployerHasAdmin = await contract.hasRole(ADMIN_ROLE, deployer.address);
    const deployerHasEmergency = await contract.hasRole(EMERGENCY_ROLE, deployer.address);

    console.log("📋 Deployer Security Check:");
    console.log("├── Deployer has DEFAULT_ADMIN_ROLE:", deployerHasDefaultAdmin ? "⚠️ WARNING" : "✅ CLEAN");
    console.log("├── Deployer has ADMIN_ROLE:", deployerHasAdmin ? "⚠️ WARNING" : "✅ CLEAN");
    console.log("└── Deployer has EMERGENCY_ROLE:", deployerHasEmergency ? "⚠️ WARNING" : "✅ CLEAN");

    // Final verification summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 VERIFICATION SUMMARY");
    console.log("=".repeat(60));

    const allVerified = (
      owner.toLowerCase() === finalAdminAddress.toLowerCase() &&
      hasDefaultAdmin && hasAdmin && hasEmergency &&
      hasDistributor && hasPlatform && hasAudit &&
      !deployerHasDefaultAdmin && !deployerHasAdmin && !deployerHasEmergency
    );

    if (allVerified) {
      console.log("🎉 ✅ ALL VERIFICATIONS PASSED!");
      console.log("🔐 ✅ Contract ownership fully transferred");
      console.log("🛡️ ✅ All roles properly assigned");
      console.log("🧹 ✅ Security cleanup completed");
      console.log("🚀 ✅ Contract ready for production use");
    } else {
      console.log("⚠️ ❌ SOME VERIFICATIONS FAILED!");
      if (owner.toLowerCase() !== finalAdminAddress.toLowerCase()) {
        console.log("❌ Ownership not transferred properly");
      }
      if (!hasDefaultAdmin || !hasAdmin || !hasEmergency) {
        console.log("❌ MetaMask admin roles not properly assigned");
      }
      if (deployerHasDefaultAdmin || deployerHasAdmin || deployerHasEmergency) {
        console.log("❌ Deployer still has administrative roles - security risk!");
      }
    }

    console.log("\n🔑 FINAL STATUS:");
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║                    CONTRACT STATUS                          ║");
    console.log("╠══════════════════════════════════════════════════════════════╣");
    console.log(`║ Owner: ${owner.slice(0,20)}...                    ║`);
    console.log(`║ Admin: ${finalAdminAddress.slice(0,20)}...                    ║`);
    console.log("║ Ownership Transfer: " + (allVerified ? "✅ COMPLETE" : "❌ INCOMPLETE") + "                        ║");
    console.log("║ Security Status: " + (allVerified ? "✅ SECURE" : "⚠️ REVIEW NEEDED") + "                           ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");

  } catch (error) {
    console.error("\n❌ Verification failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Verification completed!");
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
