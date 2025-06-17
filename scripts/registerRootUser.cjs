const { ethers } = require("hardhat");

async function main() {
  console.log("👤 REGISTERING ROOT USER ON MAINNET");
  console.log("======================================================================");
  
  // Mainnet contract address
  const contractAddress = "0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7";
  const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("💰 USDT Address:", usdtAddress);
  
  // Get the contract
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach(contractAddress);
  
  // Get deployer account (should be admin)
  const [deployer] = await ethers.getSigners();
  console.log("👤 Admin Account:", deployer.address);
  
  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
  
  if (network.chainId !== 56n) {
    console.log("❌ Wrong network! Expected BSC Mainnet (56)");
    return;
  }
  
  // Check admin role
  try {
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    console.log("🛡️  Admin Role:", isAdmin);
    
    if (!isAdmin) {
      console.log("❌ Current account is not admin. Please use admin wallet.");
      return;
    }
  } catch (e) {
    console.log("⚠️  Could not check admin role:", e.message);
  }
  
  console.log("\n======================================================================");
  console.log("🔍 CHECKING ROOT USER STATUS");
  console.log("======================================================================");
  
  // Check if root user already exists
  const totalUsers = await contract.totalUsers();
  console.log("👥 Total Users:", totalUsers.toString());
  
  if (totalUsers > 0n) {
    console.log("✅ Root user already exists! Total users:", totalUsers.toString());
    // Get first user
    try {
      const firstUser = await contract.userIdToAddress(1);
      console.log("👤 First User (Root):", firstUser);
      
      const userInfo = await contract.users(firstUser);
      console.log("📊 Root User Info:");
      console.log("   - Exists:", userInfo.exists);
      console.log("   - Active:", userInfo.isActive);
      console.log("   - Package Level:", userInfo.packageLevel.toString());
      console.log("   - Total Investment:", ethers.formatEther(userInfo.totalInvestment), "USDT");
      
      console.log("\n✅ Root user is already registered. Ready for more users!");
      return;
    } catch (e) {
      console.log("⚠️  Could not get root user info:", e.message);
    }
  }
  
  console.log("\n======================================================================");
  console.log("👤 REGISTERING ROOT USER");
  console.log("======================================================================");
  
  // Root user will be the admin wallet for now
  const rootUserAddress = "0xBcae617E213145BB76fD8023B3D9d7d4F97013e5"; // MetaMask admin wallet
  const packageTier = 3; // Package 3 ($100) for root user
  
  console.log("👤 Root User Address:", rootUserAddress);
  console.log("📦 Package Tier:", packageTier, "($100 USDT)");
  
  try {
    // Check if we have a registerRootUser function
    console.log("🔧 Attempting to register root user...");
    
    // Try different methods to register the root user
    let tx;
    try {
      // Method 1: Try registerRootUser if it exists
      tx = await contract.registerRootUser(rootUserAddress, packageTier);
      console.log("✅ Using registerRootUser function");
    } catch (e1) {
      try {
        // Method 2: Try manual admin registration
        tx = await contract.adminRegisterUser(rootUserAddress, packageTier);
        console.log("✅ Using adminRegisterUser function");
      } catch (e2) {
        try {
          // Method 3: Try direct registration (admin bypass)
          tx = await contract.register(ethers.ZeroAddress, packageTier);
          console.log("✅ Using direct register function");
        } catch (e3) {
          console.log("❌ Could not register root user with any method:");
          console.log("   Method 1:", e1.message);
          console.log("   Method 2:", e2.message);  
          console.log("   Method 3:", e3.message);
          
          console.log("\n💡 Manual root registration required:");
          console.log("1. Connect to BSCScan write contract interface");
          console.log("2. Use admin functions to register first user");
          console.log("3. Or modify contract to add root user registration");
          return;
        }
      }
    }
    
    console.log("⏳ Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("🔗 Transaction Hash:", receipt.hash);
    console.log("⛽ Gas Used:", receipt.gasUsed.toString());
    
    // Verify registration
    const newTotalUsers = await contract.totalUsers();
    console.log("👥 New Total Users:", newTotalUsers.toString());
    
    if (newTotalUsers > totalUsers) {
      console.log("🎉 ROOT USER SUCCESSFULLY REGISTERED!");
      
      // Get root user info
      const rootUser = await contract.userIdToAddress(1);
      const rootUserInfo = await contract.users(rootUser);
      
      console.log("\n📊 Root User Details:");
      console.log("   - Address:", rootUser);
      console.log("   - Package Level:", rootUserInfo.packageLevel.toString());
      console.log("   - Investment:", ethers.formatEther(rootUserInfo.totalInvestment), "USDT");
      console.log("   - Active:", rootUserInfo.isActive);
      console.log("   - Registration Time:", new Date(Number(rootUserInfo.registrationTime) * 1000).toLocaleString());
    }
    
  } catch (error) {
    console.error("❌ Root user registration failed:", error);
    
    console.log("\n💡 ALTERNATIVE METHODS:");
    console.log("1. 🔗 Use BSCScan Write Contract:");
    console.log(`   https://bscscan.com/address/${contractAddress}#writeContract`);
    console.log("2. 👤 Connect with MetaMask admin wallet");
    console.log("3. 🔧 Use admin functions to register first user");
    console.log("4. 📝 Or use frontend admin panel when ready");
  }
  
  console.log("\n======================================================================");
  console.log("🎯 NEXT STEPS AFTER ROOT USER REGISTRATION");
  console.log("======================================================================");
  console.log("1. 🧪 Test user registration flow");
  console.log("2. 💰 Test USDT transactions");
  console.log("3. 🎯 Connect frontend to mainnet");
  console.log("4. 👥 Onboard real users");
}

main()
  .then(() => {
    console.log("\n🎊 ROOT USER REGISTRATION PROCESS COMPLETED!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Root user registration failed:", error);
    process.exit(1);
  });
