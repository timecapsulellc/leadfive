const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.log("❌ Usage: npx hardhat run scripts/updateMainnetPackages.cjs --network bsc <CONTRACT_ADDRESS>");
    return;
  }

  console.log("💰 Updating OrphiCrowdFund package amounts for MAINNET production");
  console.log("📍 Contract Address:", contractAddress);

  const [admin] = await ethers.getSigners();
  console.log("👤 Admin account:", admin.address);

  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach(contractAddress);

  console.log("\n💰 Setting production package amounts...");

  // Production package amounts in BNB (based on approximate USD values)
  const productionPackages = [
    ethers.parseEther("0.01"),   // ~$3
    ethers.parseEther("0.033"),  // ~$10  
    ethers.parseEther("0.083"),  // ~$25
    ethers.parseEther("0.167"),  // ~$50
    ethers.parseEther("0.333"),  // ~$100
    ethers.parseEther("0.833"),  // ~$250
    ethers.parseEther("1.667"),  // ~$500
    ethers.parseEther("3.333")   // ~$1000
  ];

  try {
    console.log("🔄 Updating package amounts...");
    
    for (let i = 0; i < productionPackages.length; i++) {
      console.log(`⏳ Setting package ${i}: ${ethers.formatEther(productionPackages[i])} BNB`);
      
      const tx = await contract.setPackageAmount(i, productionPackages[i]);
      await tx.wait();
      
      console.log(`✅ Package ${i} updated successfully`);
    }

    console.log("\n🔍 Verifying updated packages...");
    
    const packageCount = await contract.getPackageCount();
    console.log("📦 Total packages:", packageCount.toString());
    
    for (let i = 0; i < packageCount; i++) {
      const amount = await contract.packageAmounts(i);
      const usdEquivalent = parseFloat(ethers.formatEther(amount)) * 300; // Approximate BNB price
      console.log(`   Package ${i}: ${ethers.formatEther(amount)} BNB (~$${usdEquivalent.toFixed(0)})`);
    }

    console.log("\n✅ Production package amounts updated successfully!");
    
    console.log("\n📊 MAINNET PACKAGE SUMMARY:");
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                 PRODUCTION PACKAGES ACTIVE                ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log("║ Package 0: 0.01 BNB   (~$3)                               ║");
    console.log("║ Package 1: 0.033 BNB  (~$10)                              ║");
    console.log("║ Package 2: 0.083 BNB  (~$25)                              ║");
    console.log("║ Package 3: 0.167 BNB  (~$50)                              ║");
    console.log("║ Package 4: 0.333 BNB  (~$100)                             ║");
    console.log("║ Package 5: 0.833 BNB  (~$250)                             ║");
    console.log("║ Package 6: 1.667 BNB  (~$500)                             ║");
    console.log("║ Package 7: 3.333 BNB  (~$1000)                            ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    console.log("\n🎯 Your contract is now ready for production use!");
    
  } catch (error) {
    console.error("❌ Error updating packages:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
