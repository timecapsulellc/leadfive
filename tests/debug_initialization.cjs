const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 DEBUGGING CONTRACT INITIALIZATION...\n");

  const contractAddress = "0xc42269Ff68ACBD6D6b72DB64d1a8AD4f3A1b7978";
  const expectedUSDT = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
  
  const [deployer] = await ethers.getSigners();
  
  // Get contract instance
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach(contractAddress);
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Deployer:", deployer.address);

  try {
    console.log("\n🔍 Current Contract State:");
    
    const usdtToken = await contract.usdtToken();
    console.log("📍 Current USDT Token:", usdtToken);
    console.log("📍 Expected USDT Token:", expectedUSDT);
    
    const treasury = await contract.treasury();
    console.log("📍 Treasury Address:", treasury);
    
    const priceOracle = await contract.priceOracle();
    console.log("📍 Price Oracle:", priceOracle);
    
    console.log("\n🔍 Checking if we can update USDT address...");
    
    // Check if there's a function to update USDT address
    try {
      console.log("🔧 Attempting to read contract interface...");
      
      // Let's check what functions are available
      const registrationOpen = await contract.registrationOpen();
      console.log("✅ Registration status accessible:", registrationOpen);
      
      console.log("\n💡 Solution Options:");
      console.log("1. The contract was initialized with a different USDT address");
      console.log("2. We need to either:");
      console.log("   a) Use the USDT address the contract expects");
      console.log("   b) Add an admin function to update USDT address");
      console.log("   c) Redeploy with correct initialization");
      
      console.log("\n🔍 Let's test with the current USDT address:");
      
      // Get the USDT contract that the main contract expects
      const MockUSDT = await ethers.getContractFactory("MockUSDT");
      const currentUSDT = MockUSDT.attach(usdtToken);
      
      console.log("💰 Testing current USDT contract...");
      
      // Try to mint with current USDT
      const testAmount = ethers.parseEther("1000");
      const mintTx = await currentUSDT.mint(deployer.address, testAmount);
      await mintTx.wait();
      
      const balance = await currentUSDT.balanceOf(deployer.address);
      console.log("✅ Successfully minted USDT:", ethers.formatEther(balance));
      
      console.log("✅ SOLUTION: Use USDT address", usdtToken, "for testing");
      
    } catch (innerError) {
      console.log("❌ Current USDT test failed:", innerError.message);
      
      console.log("\n🔧 Alternative: Add USDT update function to contract");
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
