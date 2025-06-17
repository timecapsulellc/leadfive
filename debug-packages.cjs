const { ethers } = require("hardhat");

const CONTRACT_ADDRESS = "0x01F1fCf1aA7072B6b9d95974174AecbF753795FF";

async function main() {
  console.log("🔍 DEBUGGING PACKAGE SYSTEM");
  console.log("Contract:", CONTRACT_ADDRESS);
  
  const [deployer] = await ethers.getSigners();
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach(CONTRACT_ADDRESS);

  console.log("\n📦 Testing Package Access:");
  
  // Test package 1 specifically
  try {
    console.log("Testing package 1...");
    const pkg1 = await contract.packages(1);
    console.log("✅ Package 1 Raw:", pkg1);
    console.log("✅ Package 1 Price:", ethers.formatUnits(pkg1.price, 18), "USD");
    console.log("✅ Package 1 Direct Bonus:", pkg1.directBonus.toString(), "basis points");
    console.log("✅ Package 1 Level Bonus:", pkg1.levelBonus.toString(), "basis points");
  } catch (error) {
    console.log("❌ Package 1 Error:", error.message);
    console.log("Error details:", error);
  }
  
  // Test all packages
  console.log("\n📦 All Packages:");
  for (let i = 1; i <= 8; i++) {
    try {
      const pkg = await contract.packages(i);
      if (pkg.price > 0) {
        console.log(`✅ Package ${i}: $${ethers.formatUnits(pkg.price, 18)} | Direct: ${pkg.directBonus/100}%`);
      } else {
        console.log(`⚠️ Package ${i}: Price is 0`);
      }
    } catch (error) {
      console.log(`❌ Package ${i}: ${error.message}`);
    }
  }
  
  // Check contract initialization
  console.log("\n🔍 Contract State:");
  try {
    const owner = await contract.owner();
    const adminInfo = await contract.getUserInfo(deployer.address);
    console.log("✅ Owner:", owner);
    console.log("✅ Admin registered:", adminInfo.isRegistered);
    console.log("✅ Admin package level:", adminInfo.packageLevel.toString());
  } catch (error) {
    console.log("❌ State check error:", error.message);
  }
}

main().catch(console.error); 