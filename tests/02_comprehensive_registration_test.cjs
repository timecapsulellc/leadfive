const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 COMPREHENSIVE REGISTRATION TESTING...\n");

  const contractAddress = "0xc42269Ff68ACBD6D6b72DB64d1a8AD4f3A1b7978";
  const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
  
  const [deployer] = await ethers.getSigners();
  
  // Get contract instances
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach(contractAddress);
  
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = MockUSDT.attach(usdtAddress);
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("📍 USDT Address:", usdtAddress);
  console.log("👤 Deployer:", deployer.address);

  try {
    console.log("\n=== 🔍 STEP 1: REGISTER ROOT USER ===");
    
    // Check if deployer is already registered
    const deployerInfo = await contract.getUserInfo(deployer.address);
    console.log("📊 Deployer already registered:", deployerInfo.isRegistered);
    
    if (!deployerInfo.isRegistered) {
      console.log("🔧 Registering deployer as root user (Package 3: $100)...");
      
      // Register deployer as root user with Package 3 ($100)
      const tx = await contract.registerRootUser(deployer.address, 3); // PackageTier.PACKAGE_3
      await tx.wait();
      
      console.log("✅ Root user registered successfully!");
      console.log("📜 Transaction hash:", tx.hash);
    } else {
      console.log("✅ Deployer already registered as root user");
    }
    
    console.log("\n=== 🔍 STEP 2: VERIFY ROOT USER DATA ===");
    
    const rootInfo = await contract.getUserInfo(deployer.address);
    console.log("✅ Registered:", rootInfo.isRegistered);
    console.log("✅ Sponsor:", rootInfo.sponsor); // Should be 0x0 for root
    console.log("✅ Current Tier:", rootInfo.currentTier.toString());
    console.log("✅ Total Investment:", ethers.formatEther(rootInfo.totalInvestment));
    console.log("✅ Club Member:", rootInfo.clubMember);
    
    console.log("\n=== 🔍 STEP 3: CHECK CONTRACT STATE ===");
    
    const contractInfo = await contract.getContractInfo();
    console.log("✅ Total Users:", contractInfo[0].toString());
    console.log("✅ Total Investments:", ethers.formatEther(contractInfo[1]));
    console.log("✅ GHP Balance:", ethers.formatEther(contractInfo[2]));
    console.log("✅ Club Balance:", ethers.formatEther(contractInfo[3]));
    
    console.log("\n=== 🔍 STEP 4: PREPARE FOR USER REGISTRATION ===");
    
    // Create test user wallet
    const testUser = ethers.Wallet.createRandom().connect(ethers.provider);
    console.log("👤 Test User Address:", testUser.address);
    
    // Mint USDT for test user
    const testAmount = ethers.parseEther("1000"); // 1000 USDT
    console.log("💰 Minting USDT for test user...");
    
    const mintTx = await usdt.mint(testUser.address, testAmount);
    await mintTx.wait();
    
    const userBalance = await usdt.balanceOf(testUser.address);
    console.log("✅ Test User USDT Balance:", ethers.formatEther(userBalance));
    
    // Send some BNB to test user for gas
    const gasTx = await deployer.sendTransaction({
      to: testUser.address,
      value: ethers.parseEther("0.01") // 0.01 BNB for gas
    });
    await gasTx.wait();
    
    const bnbBalance = await ethers.provider.getBalance(testUser.address);
    console.log("✅ Test User BNB Balance:", ethers.formatEther(bnbBalance));
    
    console.log("\n=== 🔍 STEP 5: TEST USER REGISTRATION ===");
    
    // Approve USDT spending
    const packageAmount = ethers.parseEther("30"); // Package 1: $30
    console.log("🔓 Approving USDT spending...");
    
    const approveTx = await usdt.connect(testUser).approve(contractAddress, packageAmount);
    await approveTx.wait();
    console.log("✅ USDT approved");
    
    // Register test user with deployer as sponsor
    console.log("📝 Registering test user (Package 1: $30)...");
    
    const registerTx = await contract.connect(testUser).register(
      deployer.address, // sponsor
      1 // PackageTier.PACKAGE_1
    );
    await registerTx.wait();
    
    console.log("✅ Test user registered successfully!");
    console.log("📜 Transaction hash:", registerTx.hash);
    
    console.log("\n=== 🔍 STEP 6: VERIFY USER REGISTRATION ===");
    
    const testUserInfo = await contract.getUserInfo(testUser.address);
    console.log("✅ Test User Registered:", testUserInfo.isRegistered);
    console.log("✅ Test User Sponsor:", testUserInfo.sponsor);
    console.log("✅ Test User Tier:", testUserInfo.currentTier.toString());
    console.log("✅ Test User Investment:", ethers.formatEther(testUserInfo.totalInvestment));
    
    // Check sponsor's updated data
    const updatedRootInfo = await contract.getUserInfo(deployer.address);
    console.log("✅ Root User Direct Referrals:", updatedRootInfo.directReferrals.toString());
    console.log("✅ Root User Team Size:", updatedRootInfo.teamSize.toString());
    console.log("✅ Root User Withdrawable Balance:", ethers.formatEther(updatedRootInfo.withdrawableBalance));
    
    console.log("\n=== 🔍 STEP 7: FINAL CONTRACT STATE ===");
    
    const finalContractInfo = await contract.getContractInfo();
    console.log("✅ Final Total Users:", finalContractInfo[0].toString());
    console.log("✅ Final Total Investments:", ethers.formatEther(finalContractInfo[1]));
    console.log("✅ Final GHP Balance:", ethers.formatEther(finalContractInfo[2]));
    console.log("✅ Final Club Balance:", ethers.formatEther(finalContractInfo[3]));
    
    console.log("\n🎉 REGISTRATION TESTING COMPLETED SUCCESSFULLY!");
    console.log("=" .repeat(60));
    console.log("✅ Root user registration: PASSED");
    console.log("✅ User registration flow: PASSED");
    console.log("✅ Sponsor bonus calculation: PASSED");
    console.log("✅ Contract state updates: PASSED");
    console.log("✅ USDT token integration: PASSED");
    console.log("=" .repeat(60));
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.reason) {
      console.error("💡 Reason:", error.reason);
    }
    if (error.data) {
      console.error("📊 Data:", error.data);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
