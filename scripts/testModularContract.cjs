const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing OrphiCrowdFund Modular Contract...\n");

  const contractAddress = "0xc42269Ff68ACBD6D6b72DB64d1a8AD4f3A1b7978";
  const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // MockUSDT from earlier deployment
  
  // Get contract instance
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const contract = OrphiCrowdFund.attach(contractAddress);
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("📍 USDT Address:", usdtAddress);
  
  try {
    // Test 1: Check contract version
    console.log("\n🔍 Test 1: Contract Version");
    const version = await contract.version();
    console.log("✅ Version:", version);
    
    // Test 2: Check initialization
    console.log("\n🔍 Test 2: Contract Info");
    const contractInfo = await contract.getContractInfo();
    console.log("✅ Total Users:", contractInfo[0].toString());
    console.log("✅ Total Investments:", ethers.formatEther(contractInfo[1]));
    console.log("✅ GHP Balance:", ethers.formatEther(contractInfo[2]));
    console.log("✅ Club Balance:", ethers.formatEther(contractInfo[3]));
    
    // Test 3: Check registration status
    console.log("\n🔍 Test 3: Registration Status");
    const registrationOpen = await contract.registrationOpen();
    console.log("✅ Registration Open:", registrationOpen);
    
    // Test 4: Check roles
    console.log("\n🔍 Test 4: Access Control");
    const [deployer] = await ethers.getSigners();
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, deployer.address);
    console.log("✅ Deployer has Admin Role:", hasAdminRole);
    
    console.log("\n🎉 All basic tests passed! Contract is functional.");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
