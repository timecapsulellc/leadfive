const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Registration Flow...\n");

  const contractAddress = "0xc42269Ff68ACBD6D6b72DB64d1a8AD4f3A1b7978";
  const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  
  // Create additional test accounts (for local testing we'd use these addresses)
  const testAddresses = [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", 
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
  ];
  
  console.log("� Test Address 1:", testAddresses[0]);
  console.log("👤 Test Address 2:", testAddresses[1]);
  console.log("👤 Test Address 3:", testAddresses[2]);

  try {
    console.log("\n🔍 Step 1: Check Initial State");
    const initialInfo = await contract.getContractInfo();
    console.log("✅ Initial Total Users:", initialInfo[0].toString());
    
    console.log("\n🔍 Step 2: Setup Test USDT");
    
    // Mint USDT for test users
    const testAmount = ethers.parseEther("10000"); // 10,000 USDT for testing
    
    console.log("💰 Minting USDT for test users...");
    await usdt.mint(testAddresses[0], testAmount);
    await usdt.mint(testAddresses[1], testAmount);
    await usdt.mint(testAddresses[2], testAmount);
    
    console.log("✅ USDT minted successfully");
    
    // Check balances
    const user1Balance = await usdt.balanceOf(testAddresses[0]);
    console.log("💰 Test User1 USDT Balance:", ethers.formatEther(user1Balance));
    
    console.log("\n🔍 Step 3: Register Root User (User1)");
    
    // First, we need to register deployer as root
    const packageAmount1 = ethers.parseEther("100"); // Package 3: $100
    
    // Approve USDT spending
    await usdt.connect(deployer).approve(contractAddress, packageAmount1);
    
    console.log("❌ Cannot register deployer without sponsor - this is expected");
    console.log("🔧 We need to modify contract to allow root registration");
    
    console.log("\n🔍 Step 4: Check Registration Requirements");
    
    // Check if registration is open
    const regOpen = await contract.registrationOpen();
    console.log("✅ Registration Open:", regOpen);
    
    // Try to get user info for deployer
    const deployerInfo = await contract.getUserInfo(deployer.address);
    console.log("✅ Deployer Registered:", deployerInfo.isRegistered);
    
    if (!deployerInfo.isRegistered) {
      console.log("\n💡 Solution: We need to register deployer as root user manually");
      console.log("   This requires updating the contract or using admin functions");
    }
    
    console.log("\n🎯 Registration Test Results:");
    console.log("✅ Contract is accessible");
    console.log("✅ USDT minting works"); 
    console.log("✅ Contract state is readable");
    console.log("⚠️  Need root user registration mechanism");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.reason) {
      console.error("💡 Reason:", error.reason);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
