const { ethers } = require("hardhat");

async function main() {
  // Get the new contract address from environment variable or hardcoded
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x774eF5aABD9bbC2579DDCA2cCc3656130acc75f1";
  
  if (!contractAddress) {
    console.log("❌ Please set CONTRACT_ADDRESS environment variable");
    return;
  }

  console.log("⚙️ Configuring OrphiCrowdFund at:", contractAddress);

  // Get the deployer/admin account
  const [admin] = await ethers.getSigners();
  console.log("👤 Admin account:", admin.address);

  // Connect to the contract
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundMain");
  const contract = OrphiCrowdFund.attach(contractAddress);

  console.log("\n📦 Setting up package configuration...");

  // Package amounts in BNB (18 decimals)
  const packages = [
    ethers.parseEther("0.01"),  // $3 equivalent
    ethers.parseEther("0.033"), // $10 equivalent  
    ethers.parseEther("0.083"), // $25 equivalent
    ethers.parseEther("0.167"), // $50 equivalent
    ethers.parseEther("0.333"), // $100 equivalent
    ethers.parseEther("0.833"), // $250 equivalent
    ethers.parseEther("1.667"), // $500 equivalent
    ethers.parseEther("3.333")  // $1000 equivalent
  ];

  try {
    // Set package amounts
    console.log("💰 Setting package amounts...");
    for (let i = 0; i < packages.length; i++) {
      const tx = await contract.setPackageAmount(i, packages[i]);
      await tx.wait();
      console.log(`✅ Package ${i}: ${ethers.formatEther(packages[i])} BNB`);
    }

    console.log("\n🎯 Setting bonus percentages...");
    
    // Set direct bonus (10%)
    await (await contract.setDirectBonus(1000)).wait(); // 10% = 1000 basis points
    console.log("✅ Direct bonus: 10%");
    
    // Set level bonuses (5%, 3%, 2%, 1%, 1%, 1%, 1%, 1%)
    const levelBonuses = [500, 300, 200, 100, 100, 100, 100, 100];
    for (let i = 0; i < levelBonuses.length; i++) {
      await (await contract.setLevelBonus(i + 1, levelBonuses[i])).wait();
      console.log(`✅ Level ${i + 1} bonus: ${levelBonuses[i] / 100}%`);
    }

    console.log("\n💎 Setting GHP distribution...");
    
    // Set GHP percentage (3%)
    await (await contract.setGHPPercentage(300)).wait(); // 3% = 300 basis points
    console.log("✅ GHP percentage: 3%");

    console.log("\n📊 Setting earnings cap...");
    
    // Set earnings cap (300% of investment)
    await (await contract.setEarningsCap(30000)).wait(); // 300% = 30000 basis points
    console.log("✅ Earnings cap: 300%");

    console.log("\n⏰ Setting GHP distribution interval...");
    
    // Set GHP distribution to every 24 hours (86400 seconds)
    await (await contract.setGHPDistributionInterval(86400)).wait();
    console.log("✅ GHP distribution interval: 24 hours");

    console.log("\n🛡️ Verifying role assignments...");
    
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
    const PLATFORM_ROLE = await contract.PLATFORM_ROLE();
    const AUDIT_ROLE = await contract.AUDIT_ROLE();
    
    console.log("├── Admin role assigned:", await contract.hasRole(DEFAULT_ADMIN_ROLE, process.env.ADMIN_ADDRESS));
    console.log("├── Distributor role assigned:", await contract.hasRole(DISTRIBUTOR_ROLE, process.env.DISTRIBUTOR_ADDRESS));
    console.log("├── Platform role assigned:", await contract.hasRole(PLATFORM_ROLE, process.env.PLATFORM_ADDRESS));
    console.log("└── Audit role assigned:", await contract.hasRole(AUDIT_ROLE, process.env.AUDIT_ADDRESS));

    console.log("\n🔍 Final verification...");
    
    // Verify all settings
    const packageCount = await contract.getPackageCount();
    const directBonus = await contract.directBonus();
    const ghpPercentage = await contract.ghpPercentage();
    const earningsCap = await contract.earningsCap();
    const ghpInterval = await contract.ghpDistributionInterval();
    
    console.log("📦 Total packages:", packageCount.toString());
    console.log("💰 Direct bonus:", directBonus.toString(), "basis points");
    console.log("💎 GHP percentage:", ghpPercentage.toString(), "basis points");
    console.log("📊 Earnings cap:", earningsCap.toString(), "basis points");
    console.log("⏰ GHP interval:", ghpInterval.toString(), "seconds");

    console.log("\n✅ Contract configuration completed successfully!");
    
    // Unpause the contract if it's paused
    const paused = await contract.paused();
    if (paused) {
      console.log("▶️ Unpausing contract...");
      await (await contract.unpause()).wait();
      console.log("✅ Contract unpaused and ready for use!");
    } else {
      console.log("✅ Contract is already active and ready for use!");
    }

  } catch (error) {
    console.error("❌ Configuration error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
