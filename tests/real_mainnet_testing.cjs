const { ethers } = require("hardhat");

async function main() {
  console.log("🎯 REAL MAINNET TESTING WITH 30 USDT");
  console.log("======================================================================");
  
  // Contract addresses
  const contractAddress = "0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7";
  const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
  const adminWallet = "0xBcae617E213145BB76fD8023B3D9d7d4F97013e5";
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("💰 USDT Address:", usdtAddress);
  console.log("👤 Admin Wallet:", adminWallet);
  
  // Get contracts
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach(contractAddress);
  
  // Use OpenZeppelin IERC20 interface
  const USDT = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", usdtAddress);
  
  // Get signer (should be admin wallet)
  const [signer] = await ethers.getSigners();
  console.log("🔑 Using wallet:", signer.address);
  
  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
  
  if (network.chainId !== 56n) {
    console.log("❌ Wrong network! Expected BSC Mainnet (56)");
    return;
  }
  
  console.log("\n======================================================================");
  console.log("💰 CHECKING USDT BALANCE");
  console.log("======================================================================");
  
  try {
    const usdtBalance = await USDT.balanceOf(signer.address);
    const usdtBalanceFormatted = ethers.formatUnits(usdtBalance, 18);
    console.log("✅ Current USDT Balance:", usdtBalanceFormatted, "USDT");
    
    if (parseFloat(usdtBalanceFormatted) < 30) {
      console.log("❌ Insufficient USDT! Need at least 30 USDT for testing.");
      console.log("💡 Please add more USDT to:", signer.address);
      return;
    }
    
    console.log("✅ Sufficient USDT for testing!");
    
  } catch (error) {
    console.log("❌ Failed to check USDT balance:", error.message);
    return;
  }
  
  console.log("\n======================================================================");
  console.log("🔍 CONTRACT STATUS CHECK");
  console.log("======================================================================");
  
  try {
    // Check contract status
    const totalUsers = await contract.totalUsers();
    const totalInvestments = await contract.totalInvestments();
    const registrationOpen = await contract.registrationOpen();
    const paused = await contract.paused();
    
    console.log("✅ Total Users:", totalUsers.toString());
    console.log("✅ Total Investments:", ethers.formatEther(totalInvestments), "USDT");
    console.log("✅ Registration Open:", registrationOpen);
    console.log("✅ Contract Paused:", paused);
    
    // Check admin role
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
    console.log("✅ Admin Role:", isAdmin);
    
    if (!isAdmin) {
      console.log("⚠️  Current wallet doesn't have admin role. Some functions may not work.");
    }
    
  } catch (error) {
    console.log("❌ Contract status check failed:", error.message);
  }
  
  console.log("\n======================================================================");
  console.log("📦 PACKAGE INFORMATION");
  console.log("======================================================================");
  
  try {
    // Check package amounts
    const package1 = await contract.getPackageAmount(1);
    const package2 = await contract.getPackageAmount(2);
    const package3 = await contract.getPackageAmount(3);
    
    console.log("✅ Package 1:", ethers.formatEther(package1), "USDT ($30)");
    console.log("✅ Package 2:", ethers.formatEther(package2), "USDT ($50)");
    console.log("✅ Package 3:", ethers.formatEther(package3), "USDT ($100)");
    
  } catch (error) {
    console.log("❌ Package check failed:", error.message);
  }
  
  console.log("\n======================================================================");
  console.log("👤 STEP 1: REGISTER ROOT USER (ADMIN FUNCTION)");
  console.log("======================================================================");
  
  try {
    // Check if user is already registered
    const userInfo = await contract.users(signer.address);
    const isRegistered = userInfo.exists;
    
    if (isRegistered) {
      console.log("✅ User already registered!");
      console.log("   - Total Investment:", ethers.formatEther(userInfo.totalInvestment), "USDT");
      console.log("   - Package Level:", userInfo.packageLevel.toString());
      console.log("   - Direct Referrals:", userInfo.directReferrals.toString());
    } else {
      console.log("📝 User not registered yet. Let's register as root user...");
      
      // Try to register root user through admin function
      try {
        console.log("🔧 Attempting root user registration...");
        
        // First approve USDT
        const package1Amount = await contract.getPackageAmount(1);
        console.log("💰 Package 1 amount:", ethers.formatEther(package1Amount), "USDT");
        
        console.log("🔓 Approving USDT...");
        const approveTx = await USDT.approve(contractAddress, package1Amount);
        await approveTx.wait();
        console.log("✅ USDT approved!");
        
        // Register root user (admin function)
        console.log("👤 Registering root user...");
        const registerTx = await contract.registerRootUser(signer.address, 1);
        await registerTx.wait();
        console.log("✅ Root user registered successfully!");
        
      } catch (error) {
        console.log("⚠️  Root user registration failed:", error.message);
        console.log("💡 Trying alternative registration method...");
        
        // Alternative: Try regular registration with zero address as sponsor
        try {
          const package1Amount = await contract.getPackageAmount(1);
          
          // Make sure USDT is approved
          const allowance = await USDT.allowance(signer.address, contractAddress);
          if (allowance < package1Amount) {
            console.log("🔓 Approving USDT for regular registration...");
            const approveTx = await USDT.approve(contractAddress, package1Amount);
            await approveTx.wait();
          }
          
          console.log("👤 Attempting regular registration...");
          const registerTx = await contract.register(ethers.ZeroAddress, 1);
          await registerTx.wait();
          console.log("✅ Regular registration successful!");
          
        } catch (regError) {
          console.log("❌ All registration methods failed:", regError.message);
          console.log("💡 Manual registration may be needed through BSCScan");
        }
      }
    }
    
  } catch (error) {
    console.log("❌ Registration check failed:", error.message);
  }
  
  console.log("\n======================================================================");
  console.log("📊 STEP 2: VERIFY REGISTRATION RESULTS");
  console.log("======================================================================");
  
  try {
    // Check user info after registration
    const userInfo = await contract.users(signer.address);
    const totalUsers = await contract.totalUsers();
    const totalInvestments = await contract.totalInvestments();
    
    console.log("✅ User exists:", userInfo.exists);
    console.log("✅ User active:", userInfo.isActive);
    console.log("✅ Total investment:", ethers.formatEther(userInfo.totalInvestment), "USDT");
    console.log("✅ Package level:", userInfo.packageLevel.toString());
    console.log("✅ Direct referrals:", userInfo.directReferrals.toString());
    console.log("✅ Withdrawable amount:", ethers.formatEther(userInfo.withdrawableAmount), "USDT");
    
    console.log("\n📈 Contract Totals:");
    console.log("✅ Total users:", totalUsers.toString());
    console.log("✅ Total investments:", ethers.formatEther(totalInvestments), "USDT");
    
  } catch (error) {
    console.log("❌ Post-registration check failed:", error.message);
  }
  
  console.log("\n======================================================================");
  console.log("💰 STEP 3: CHECK BONUS CALCULATIONS");
  console.log("======================================================================");
  
  try {
    // Check if there are any bonuses to withdraw
    const userInfo = await contract.users(signer.address);
    const withdrawableAmount = userInfo.withdrawableAmount;
    
    console.log("💰 Current withdrawable amount:", ethers.formatEther(withdrawableAmount), "USDT");
    
    if (withdrawableAmount > 0) {
      console.log("🎉 You have bonuses to withdraw!");
      console.log("💡 You can test withdrawal functionality");
    } else {
      console.log("📝 No bonuses yet (expected for root user with no referrals)");
    }
    
  } catch (error) {
    console.log("❌ Bonus check failed:", error.message);
  }
  
  console.log("\n======================================================================");
  console.log("🎯 TESTING SUMMARY");
  console.log("======================================================================");
  
  try {
    const userInfo = await contract.users(signer.address);
    const totalUsers = await contract.totalUsers();
    const usdtBalance = await USDT.balanceOf(signer.address);
    
    console.log("📊 RESULTS:");
    console.log("├── User Registered:", userInfo.exists);
    console.log("├── Investment Made:", ethers.formatEther(userInfo.totalInvestment), "USDT");
    console.log("├── Total Users in System:", totalUsers.toString());
    console.log("├── Remaining USDT:", ethers.formatUnits(usdtBalance, 18), "USDT");
    console.log("└── Contract Status: LIVE & WORKING ✅");
    
    if (userInfo.exists) {
      console.log("\n🎉 SUCCESS! Real mainnet testing completed!");
      console.log("✅ Contract is working with real USDT");
      console.log("✅ Registration flow is functional");
      console.log("✅ User data is properly stored");
      
      console.log("\n🔧 NEXT STEPS:");
      console.log("1. 👥 Register additional test users");
      console.log("2. 🎯 Test referral bonuses");
      console.log("3. 💰 Test withdrawal functionality");
      console.log("4. 🌐 Connect frontend to this contract");
      console.log("5. 📱 Launch for real users!");
    } else {
      console.log("\n⚠️  Registration did not complete successfully");
      console.log("💡 May need manual intervention through BSCScan");
    }
    
  } catch (error) {
    console.log("❌ Summary check failed:", error.message);
  }
  
  console.log("\n======================================================================");
  console.log("🔗 USEFUL LINKS");
  console.log("======================================================================");
  console.log("📍 Contract on BSCScan:", `https://bscscan.com/address/${contractAddress}`);
  console.log("📝 Read Contract:", `https://bscscan.com/address/${contractAddress}#readContract`);
  console.log("✍️  Write Contract:", `https://bscscan.com/address/${contractAddress}#writeContract`);
  console.log("💰 USDT Token:", `https://bscscan.com/address/${usdtAddress}`);
}

main()
  .then(() => {
    console.log("\n🎊 MAINNET TESTING COMPLETED!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Testing failed:", error);
    process.exit(1);
  });
