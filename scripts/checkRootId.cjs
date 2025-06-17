const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Root ID for OrphiCrowdFund Contract");
  console.log("Contract: 0xf9538Fe9FCF16C018E6057744555F2556f63cED9");
  
  const [admin] = await ethers.getSigners();
  console.log("👤 Current Account:", admin.address);
  
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach("0xf9538Fe9FCF16C018E6057744555F2556f63cED9");
  
  console.log("\n" + "=".repeat(60));
  console.log("🔍 ROOT USER INFORMATION");
  console.log("=".repeat(60));
  
  try {
    // Check contract owner (usually the root)
    const owner = await contract.owner();
    console.log("✅ Contract Owner:", owner);
    
    // Check if there's a userCounter or totalUsers
    try {
      const totalUsers = await contract.totalUsers();
      console.log("✅ Total Users:", totalUsers.toString());
      
      if (totalUsers > 0) {
        // Try to get user ID 1 (usually root)
        try {
          const rootAddress = await contract.userIdToAddress(1);
          console.log("✅ Root User (ID 1):", rootAddress);
        } catch (e) {
          console.log("⚠️ Cannot access userIdToAddress function");
        }
      }
    } catch (e) {
      console.log("⚠️ Total users not accessible:", e.message);
    }
    
    // Check admin roles
    console.log("\n🛡️ Admin Role Information:");
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const ADMIN_ROLE = await contract.ADMIN_ROLE ? await contract.ADMIN_ROLE() : null;
    
    console.log("✅ Default Admin Role Holder:", owner);
    
    // Check if current deployer has admin role
    const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
    console.log("✅ Current Account Has Admin Role:", hasAdminRole);
    
    // Check if owner has admin role
    const ownerHasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, owner);
    console.log("✅ Owner Has Admin Role:", ownerHasAdminRole);
    
    console.log("\n📋 ROOT ID INFORMATION:");
    console.log("├── Contract Owner: " + owner);
    console.log("├── Root User ID: 1 (if users exist)");
    console.log("├── Admin Wallet: 0xBcae617E213145BB76fD8023B3D9d7d4F97013e5");
    console.log("└── Current Total Users: " + (await contract.totalUsers ? await contract.totalUsers() : "Unknown"));
    
  } catch (error) {
    console.error("❌ Error checking root information:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
