const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🧪 Deploying OrphiCrowdFund on BSC TESTNET with Enhanced Features...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "tBNB");
  
  // Check if we have enough for deployment
  const minBalance = ethers.parseEther("0.1"); // Need at least 0.1 tBNB
  if (balance < minBalance) {
    console.log("❌ Insufficient balance. You need at least 0.1 tBNB for testnet deployment.");
    console.log("🔗 Get testnet BNB from: https://testnet.binance.org/faucet-smart");
    return;
  }

  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
  
  if (network.chainId !== 97n) {
    console.log("❌ Wrong network! Please use BSC testnet (Chain ID: 97)");
    return;
  }

  // Use deployer address for all roles on testnet (for testing)
  const deployerAddress = deployer.address;
  
  console.log("\n🔧 Testnet Deployment Configuration:");
  console.log("├── All roles assigned to deployer for testing");
  console.log("├── Admin Address:", deployerAddress);
  console.log("├── Treasury Address:", deployerAddress);
  console.log("├── Distributor Address:", deployerAddress);
  console.log("├── Platform Address:", deployerAddress);
  console.log("└── Audit Address:", deployerAddress);
  console.log();

  // Deploy the testnet contract
  console.log("🔨 Deploying OrphiCrowdFund contract...");
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  
  console.log("⏳ Deploying proxy contract...");
  
  // Set the deployed MockUSDT address for testnet
  const usdtTokenAddress = "0x0485c5962391d5d5D8A379B50B94eFC7Ca1cd0FA";

  // Deploy as upgradeable proxy with correct arguments
  const contract = await upgrades.deployProxy(
    OrphiCrowdFund,
    [
      usdtTokenAddress,   // USDT token address
      deployerAddress,    // Treasury address
      deployerAddress,    // Platform wallet address
      deployerAddress     // Emergency wallet address
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
    
    console.log("✅ Contract owner:", owner);
    console.log("✅ Treasury address:", treasury);
    console.log("✅ Platform wallet:", platform);
    
    // Check roles
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
    const PLATFORM_ROLE = await contract.PLATFORM_ROLE();
    const AUDIT_ROLE = await contract.AUDIT_ROLE();
    
    console.log("🛡️  Role assignments:");
    console.log("├── Admin has DEFAULT_ADMIN_ROLE:", await contract.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress));
    console.log("├── Distributor has DISTRIBUTOR_ROLE:", await contract.hasRole(DISTRIBUTOR_ROLE, deployerAddress));
    console.log("├── Platform has PLATFORM_ROLE:", await contract.hasRole(PLATFORM_ROLE, deployerAddress));
    console.log("└── Audit has AUDIT_ROLE:", await contract.hasRole(AUDIT_ROLE, deployerAddress));
    
    // Check package configuration
    const packageCount = await contract.getPackageCount();
    console.log("📦 Available packages:", packageCount.toString());
    
    // Check if contract is paused
    const paused = await contract.paused();
    console.log("⏸️  Contract paused:", paused);
    
  } catch (error) {
    console.log("⚠️  Some verification checks failed:", error.message);
  }

  console.log("\n🎉 Testnet Deployment Summary:");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                 TESTNET DEPLOYMENT SUCCESSFUL                ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║ Contract Address: ${contractAddress}     ║`);
  console.log(`║ Implementation:   ${implementationAddress}     ║`);
  console.log("║ Network:          BSC Testnet (Chain ID: 97)                ║");
  console.log("║ Features:         ✅ UUPS Upgradeable                       ║");
  console.log("║                   ✅ Enhanced Bonus System                  ║");
  console.log("║                   ✅ Earnings Cap Enforcement               ║");
  console.log("║                   ✅ Automated GHP Distribution             ║");
  console.log("║                   ✅ Matrix Audit & Repair Tools            ║");
  console.log("║                   ✅ Multi-Role Access Control              ║");
  console.log("║                   ✅ Emergency Pause Functionality          ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  console.log("\n📋 Next Steps:");
  console.log("1. 🔧 Configure contract with packages and bonuses");
  console.log("2. 🧪 Run comprehensive tests");
  console.log("3. 🎯 Test all enhanced features");
  console.log("4. 🔍 Verify contract on BSCScan testnet");
  console.log("5. ✅ If all tests pass, deploy to mainnet");

  console.log("\n💡 Configuration Command:");
  console.log(`npx hardhat run scripts/configureNewContract.cjs --network bsc_testnet ${contractAddress}`);
  
  console.log("\n💡 Testing Command:");
  console.log(`npx hardhat run scripts/testNewContract.cjs --network bsc_testnet ${contractAddress}`);

  console.log("\n💡 Testnet Verification Command:");
  console.log(`npx hardhat verify --network bsc_testnet ${contractAddress}`);

  return {
    proxy: contractAddress,
    implementation: implementationAddress,
    deployer: deployer.address,
    network: "BSC Testnet",
    chainId: 97
  };
}

main()
  .then((result) => {
    console.log("\n🚀 Testnet deployment completed successfully!");
    console.log("📊 Result:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Testnet deployment failed:", error);
    process.exit(1);
  });
