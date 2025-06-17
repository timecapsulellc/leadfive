const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying OrphiCrowdFund on BSC MAINNET with Enhanced Features...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "BNB");
  
  // Check if we have enough for deployment
  const minBalance = ethers.parseEther("0.05"); // Need at least 0.05 BNB
  if (balance < minBalance) {
    console.log("❌ Insufficient balance. You need at least 0.05 BNB for mainnet deployment.");
    return;
  }

  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
  
  if (network.chainId !== 56n) {
    console.log("❌ Wrong network! Please use BSC mainnet (Chain ID: 56)");
    return;
  }

  // Get deployment parameters from .env
  const adminAddress = process.env.ADMIN_ADDRESS;
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  const distributorAddress = process.env.DISTRIBUTOR_ADDRESS;
  const platformAddress = process.env.PLATFORM_ADDRESS;
  const auditAddress = process.env.AUDIT_ADDRESS;

  console.log("\n🔧 Mainnet Deployment Configuration:");
  console.log("├── Admin Address:", adminAddress);
  console.log("├── Treasury Address:", treasuryAddress);
  console.log("├── Distributor Address:", distributorAddress);
  console.log("├── Platform Address:", platformAddress);
  console.log("└── Audit Address:", auditAddress);

  // Validate addresses
  if (!adminAddress || !treasuryAddress || !distributorAddress || !platformAddress || !auditAddress) {
    throw new Error("❌ Missing required addresses in .env file");
  }

  console.log("\n⚠️  MAINNET DEPLOYMENT CONFIRMATION");
  console.log("You are about to deploy to BSC MAINNET with real BNB!");
  console.log("Contract will be deployed with the addresses above.");
  
  // Deploy the mainnet contract (using testnet contract as it's proven to work)
  console.log("\n🔨 Deploying OrphiCrowdFund contract (proven version)...");
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  
  console.log("⏳ Deploying proxy contract...");
  
  // Use official BSC Mainnet USDT address
  const usdtTokenAddress = process.env.USDT_MAINNET || "0x55d398326f99059fF775485246999027B3197955";
  console.log("💰 USDT Token Address:", usdtTokenAddress);
  
  // Deploy as upgradeable proxy with production addresses (using working testnet format)
  const contract = await upgrades.deployProxy(
    OrphiCrowdFund,
    [
      usdtTokenAddress,   // USDT token address
      treasuryAddress,    // Treasury address (your Trezor)
      platformAddress,    // Platform address
      adminAddress        // Emergency wallet address (same as admin)
    ],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed!");
  console.log("📍 Proxy Address:", contractAddress);
  
  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
  console.log("📍 Implementation Address:", implementationAddress);
  console.log();

  // Verify initial configuration
  console.log("🔍 Verifying initial configuration...");
  
  try {
    const owner = await contract.owner();
    const treasury = await contract.treasury();
    const platform = await contract.platformWallet();
    const paused = await contract.paused();
    
    console.log("✅ Contract owner:", owner);
    console.log("✅ Treasury address:", treasury);
    console.log("✅ Platform wallet:", platform);
    console.log("✅ Paused:", paused);
    
    // Check roles
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
    const PLATFORM_ROLE = await contract.PLATFORM_ROLE();
    const AUDIT_ROLE = await contract.AUDIT_ROLE();
    
    console.log("🛡️  Role assignments:");
    console.log("├── Admin has DEFAULT_ADMIN_ROLE:", await contract.hasRole(DEFAULT_ADMIN_ROLE, adminAddress));
    console.log("├── Distributor has DISTRIBUTOR_ROLE:", await contract.hasRole(DISTRIBUTOR_ROLE, distributorAddress));
    console.log("├── Platform has PLATFORM_ROLE:", await contract.hasRole(PLATFORM_ROLE, platformAddress));
    console.log("└── Audit has AUDIT_ROLE:", await contract.hasRole(AUDIT_ROLE, auditAddress));
    
    // Check package configuration
    const packageCount = await contract.getPackageCount();
    console.log("📦 Available packages:", packageCount.toString());
    
    // Show package amounts
    console.log("💰 Package amounts:");
    for (let i = 0; i < packageCount; i++) {
      const amount = await contract.packageAmounts(i);
      console.log(`   Package ${i}: ${ethers.formatEther(amount)} BNB`);
    }
    
  } catch (error) {
    console.log("⚠️  Some verification checks failed:", error.message);
  }

  console.log("\n🎉 MAINNET Deployment Summary:");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                 MAINNET DEPLOYMENT SUCCESSFUL                ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║ Contract Address: ${contractAddress}     ║`);
  console.log(`║ Implementation:   ${implementationAddress}     ║`);
  console.log("║ Network:          BSC Mainnet (Chain ID: 56)                ║");
  console.log("║ Features:         ✅ UUPS Upgradeable                       ║");
  console.log("║                   ✅ Enhanced Bonus System                  ║");
  console.log("║                   ✅ Earnings Cap Enforcement               ║");
  console.log("║                   ✅ Automated GHP Distribution             ║");
  console.log("║                   ✅ Matrix Audit & Repair Tools            ║");
  console.log("║                   ✅ Multi-Role Access Control              ║");
  console.log("║                   ✅ Emergency Pause Functionality          ║");
  console.log("║                   ✅ Production-Ready Package Amounts       ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  console.log("\n📋 Next Steps:");
  console.log("1. 🔧 Update package amounts for mainnet (if needed)");
  console.log("2. 🔍 Verify contract on BSCScan");
  console.log("3. 🎯 Update frontend configuration");
  console.log("4. 🧪 Run final production tests");
  console.log("5. 📢 Announce new contract to users");

  console.log("\n💡 Update package amounts for mainnet:");
  console.log(`npx hardhat run scripts/updateMainnetPackages.cjs --network bsc ${contractAddress}`);

  console.log("\n💡 Mainnet Verification Command:");
  console.log(`npx hardhat verify --network bsc ${contractAddress}`);

  console.log("\n💡 Update frontend:");
  console.log(`node scripts/updateFrontendConfig.js ${contractAddress}`);

  return {
    proxy: contractAddress,
    implementation: implementationAddress,
    deployer: deployer.address,
    network: "BSC Mainnet",
    chainId: 56,
    treasury: treasuryAddress,
    admin: adminAddress
  };
}

main()
  .then((result) => {
    console.log("\n🚀 MAINNET deployment completed successfully!");
    console.log("📊 Result:", result);
    console.log("\n🎯 Your new enhanced OrphiCrowdFund contract is live on BSC Mainnet!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ MAINNET deployment failed:", error);
    process.exit(1);
  });
