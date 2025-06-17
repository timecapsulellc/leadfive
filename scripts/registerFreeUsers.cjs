const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Registering Free Users from Root ID");
  console.log("Contract: 0xf9538Fe9FCF16C018E6057744555F2556f63cED9");
  
  const [admin] = await ethers.getSigners();
  console.log("👤 Admin Account:", admin.address);
  
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach("0xf9538Fe9FCF16C018E6057744555F2556f63cED9");
  
  // Users to register
  const usersToRegister = [
    "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29",
    "0x96264D29910eC58CD9fE4e9367931C191416b1e1", 
    "0xDB54f3f8F42e0165a15A33736550790BB0662Ac6",
    "0xE347b326Af572a7115aec536EBf68F72b263D816",
    "0x998D3a620BC02dFB5Bf78088bd80cF2b6FC28211",
    "0xb7B4eBa62C2142804d1FbbE598156c95D3ab56c9",
    "0x4F4baF27bcD080683Bd96F5e0464F23d7C8b56f0"
  ];
  
  console.log("\n" + "=".repeat(60));
  console.log("👥 REGISTERING USERS FROM ROOT");
  console.log("=".repeat(60));
  
  try {
    // First, register the root user (admin) if not already registered
    const totalUsers = await contract.totalUsers();
    console.log("Current total users:", totalUsers.toString());
    
    let rootAddress = admin.address;
    
    if (totalUsers == 0) {
      console.log("\n📋 Registering Root User First...");
      
      // Check if there's a registerRootUser function
      try {
        // Register root user with tier 1 (smallest package)
        const tx = await contract.registerRootUser(admin.address, 1);
        await tx.wait();
        console.log("✅ Root user registered:", admin.address);
        rootAddress = admin.address;
      } catch (e) {
        console.log("⚠️ registerRootUser function not available, trying contribute...");
        
        // Try to register using contribute function
        try {
          const packageAmount = ethers.parseEther("0.01"); // Small amount for root
          const tx = await contract.contribute(0, ethers.ZeroAddress, { value: packageAmount });
          await tx.wait();
          console.log("✅ Root user registered via contribute");
          rootAddress = admin.address;
        } catch (e2) {
          console.log("❌ Could not register root user:", e2.message);
          return;
        }
      }
    } else {
      // Get existing root user
      try {
        rootAddress = await contract.userIdToAddress(1);
        console.log("✅ Existing root user found:", rootAddress);
      } catch (e) {
        console.log("⚠️ Using admin as root:", admin.address);
        rootAddress = admin.address;
      }
    }
    
    console.log("\n👥 Registering Users with Root as Sponsor...");
    
    for (let i = 0; i < usersToRegister.length; i++) {
      const userAddress = usersToRegister[i];
      console.log(`\n${i + 1}. Registering: ${userAddress}`);
      
      try {
        // Check if user already exists
        const userExists = await contract.users ? await contract.users(userAddress) : false;
        
        if (userExists && userExists.exists) {
          console.log("   ⚠️ User already registered");
          continue;
        }
        
        // Try different registration methods
        try {
          // Method 1: Direct registration with admin privileges
          const tx = await contract.registerUser(userAddress, rootAddress, 1);
          await tx.wait();
          console.log("   ✅ Registered via registerUser");
        } catch (e1) {
          try {
            // Method 2: Free registration if available
            const tx = await contract.registerFreeUser(userAddress, rootAddress);
            await tx.wait();
            console.log("   ✅ Registered via registerFreeUser");
          } catch (e2) {
            try {
              // Method 3: Admin registration
              const tx = await contract.adminRegisterUser(userAddress, rootAddress, 1);
              await tx.wait();
              console.log("   ✅ Registered via adminRegisterUser");
            } catch (e3) {
              console.log("   ❌ Could not register:", e3.message);
            }
          }
        }
        
        // Small delay between registrations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`   ❌ Registration failed: ${error.message}`);
      }
    }
    
    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 REGISTRATION SUMMARY");
    console.log("=".repeat(60));
    
    const finalTotalUsers = await contract.totalUsers();
    console.log("✅ Total users after registration:", finalTotalUsers.toString());
    
    console.log("\n🎉 Free user registration completed!");
    
  } catch (error) {
    console.error("❌ Registration process failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
