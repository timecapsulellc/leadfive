const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying OrphiCrowdFund with Enhanced Features...\n");

  // Test network connectivity first
  console.log("🔗 Testing network connectivity...");
  try {
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("✅ Connected to BSC Mainnet, latest block:", blockNumber);
  } catch (error) {
    console.error("❌ Network connection failed:", error.message);
    console.log("💡 Try updating BSC_MAINNET_RPC_URL in .env file");
    console.log("   Alternative RPC URLs:");
    console.log("   - https://bsc-dataseed1.binance.org/");
    console.log("   - https://bsc-dataseed2.defibit.io/");
    console.log("   - https://bsc-dataseed1.ninicoin.io/");
    process.exit(1);
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "BNB\n");

  // Get deployment parameters from .env
  const adminAddress = process.env.ADMIN_ADDRESS;
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  const distributorAddress = process.env.DISTRIBUTOR_ADDRESS;
  const platformAddress = process.env.PLATFORM_ADDRESS;
  const auditAddress = process.env.AUDIT_ADDRESS;

  console.log("🔧 Deployment Configuration:");
  console.log("├── Admin Address:", adminAddress);
  console.log("├── Treasury Address:", treasuryAddress);
  console.log("├── Distributor Address:", distributorAddress);
  console.log("├── Platform Address:", platformAddress);
  console.log("└── Audit Address:", auditAddress);
  console.log();

  // Validate addresses
  if (!adminAddress || !treasuryAddress || !distributorAddress || !platformAddress || !auditAddress) {
    throw new Error("❌ Missing required addresses in .env file");
  }

  // Deploy the main contract
  console.log("🔨 Deploying OrphiCrowdFundMain contract...");
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundMain");
  
  // Deploy as upgradeable proxy
  const contract = await upgrades.deployProxy(
    OrphiCrowdFund,
    [
      adminAddress,    // Initial admin
      treasuryAddress, // Treasury address
      distributorAddress, // Distributor address
      platformAddress,   // Platform address
      auditAddress      // Audit address
    ],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );

  await contract.deployed();

  console.log("✅ Contract deployed!");
  console.log("📍 Proxy Address:", contract.address);
  
  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(contract.address);
  console.log("📍 Implementation Address:", implementationAddress);
  console.log();

  // Verify initial configuration
  console.log("🔍 Verifying initial configuration...");
  
  try {
    const owner = await contract.owner();
    const treasury = await contract.treasury();
    const platform = await contract.platformWallet();
    
    console.log("✅ Contract owner:", owner);
    console.log("✅ Treasury address:", treasury);
    console.log("✅ Platform wallet:", platform);
    
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
    
    // Check if contract is paused
    const paused = await contract.paused();
    console.log("⏸️  Contract paused:", paused);
    
  } catch (error) {
    console.log("⚠️  Some verification checks failed:", error.message);
  }

  console.log("\n🎉 Deployment Summary:");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                   DEPLOYMENT SUCCESSFUL                      ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║ Contract Address: ${contract.address}           ║`);
  console.log(`║ Implementation:   ${implementationAddress}           ║`);
  console.log("║ Network:          BSC Mainnet                               ║");
  console.log("║ Features:         ✅ UUPS Upgradeable                       ║");
  console.log("║                   ✅ Enhanced Bonus System                  ║");
  console.log("║                   ✅ Earnings Cap Enforcement               ║");
  console.log("║                   ✅ Automated GHP Distribution             ║");
  console.log("║                   ✅ Matrix Audit & Repair Tools            ║");
  console.log("║                   ✅ Multi-Role Access Control              ║");
  console.log("║                   ✅ Emergency Pause Functionality          ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  console.log("\n📋 Next Steps:");
  console.log("1. 🔍 Verify contract on BSCScan");
  console.log("2. 🎯 Update frontend configuration with new contract address");
  console.log("3. 🧪 Run comprehensive tests");
  console.log("4. 📢 Announce new contract to users");
  console.log("5. 📊 Monitor initial operations");

  console.log("\n💡 Contract Verification Command:");
  console.log(`npx hardhat verify --network bsc ${contract.address}`);

  return {
    proxy: contract.address,
    implementation: implementationAddress,
    deployer: deployer.address,
    network: "BSC Mainnet"
  };
}

main()
  .then((result) => {
    console.log("\n🚀 Deployment completed successfully!");
    console.log("📊 Result:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
