const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Available Functions in Contract");
  console.log("Contract: 0xf9538Fe9FCF16C018E6057744555F2556f63cED9");
  
  const [admin] = await ethers.getSigners();
  console.log("👤 Admin Account:", admin.address);
  
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach("0xf9538Fe9FCF16C018E6057744555F2556f63cED9");
  
  console.log("\n" + "=".repeat(60));
  console.log("🔍 CONTRACT FUNCTION ANALYSIS");
  console.log("=".repeat(60));
  
  // Get contract interface
  const contractInterface = contract.interface;
  
  console.log("\n📋 Available Functions:");
  const functions = Object.keys(contractInterface.functions);
  
  const registrationFunctions = functions.filter(f => 
    f.toLowerCase().includes('register') || 
    f.toLowerCase().includes('contribute') ||
    f.toLowerCase().includes('invest') ||
    f.toLowerCase().includes('join')
  );
  
  console.log("\n🎯 Registration-related functions:");
  registrationFunctions.forEach(func => {
    console.log("   -", func);
  });
  
  console.log("\n📊 User-related functions:");
  const userFunctions = functions.filter(f => 
    f.toLowerCase().includes('user') ||
    f.toLowerCase().includes('referral') ||
    f.toLowerCase().includes('sponsor')
  );
  
  userFunctions.forEach(func => {
    console.log("   -", func);
  });
  
  console.log("\n🛡️ Admin functions:");
  const adminFunctions = functions.filter(f => 
    f.toLowerCase().includes('admin') ||
    f.toLowerCase().includes('owner') ||
    f.toLowerCase().includes('role')
  );
  
  adminFunctions.forEach(func => {
    console.log("   -", func);
  });
  
  console.log("\n💰 Payment functions:");
  const paymentFunctions = functions.filter(f => 
    f.toLowerCase().includes('pay') ||
    f.toLowerCase().includes('withdraw') ||
    f.toLowerCase().includes('deposit') ||
    f.toLowerCase().includes('balance')
  );
  
  paymentFunctions.forEach(func => {
    console.log("   -", func);
  });
  
  // Try to find the main registration function
  console.log("\n🔍 Testing Available Registration Methods:");
  
  // Test basic contract state
  try {
    const paused = await contract.paused();
    console.log("✅ Contract paused:", paused);
  } catch (e) {
    console.log("❌ Cannot check paused state");
  }
  
  try {
    const owner = await contract.owner();
    console.log("✅ Contract owner:", owner);
  } catch (e) {
    console.log("❌ Cannot get owner");
  }
  
  try {
    const totalUsers = await contract.totalUsers();
    console.log("✅ Total users:", totalUsers.toString());
  } catch (e) {
    console.log("❌ Cannot get total users");
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📋 ANALYSIS COMPLETE");
  console.log("=".repeat(60));
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
