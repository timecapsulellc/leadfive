const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🔍 Testing direct contract access vs proxy access...");
  
  // Get the implementation contract
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const IOrphiCrowdFund = await ethers.getContractFactory("IOrphiCrowdFund");
  
  console.log("✅ Contract factories created");
  
  // Deploy the proxy
  const proxyInstance = await upgrades.deployProxy(OrphiCrowdFund, [], {
    initializer: "initialize",
    kind: "uups"
  });
  
  await proxyInstance.waitForDeployment();
  const proxyAddress = await proxyInstance.getAddress();
  console.log("📍 Proxy deployed at:", proxyAddress);
  
  // Try to attach our interface to the proxy
  try {
    const interfaceInstance = IOrphiCrowdFund.attach(proxyAddress);
    console.log("✅ Interface attached to proxy");
    
    // Test interface functions
    console.log("\n🧪 Testing interface functions:");
    console.log("=" .repeat(50));
    
    try {
      const basisPoints = await interfaceInstance.BASIS_POINTS();
      console.log("✅ BASIS_POINTS via interface:", basisPoints.toString());
    } catch (e) {
      console.log("❌ BASIS_POINTS via interface:", e.message.split('\n')[0]);
    }
    
    try {
      const basisPoints = await interfaceInstance.getBasisPoints();
      console.log("✅ getBasisPoints via interface:", basisPoints.toString());
    } catch (e) {
      console.log("❌ getBasisPoints via interface:", e.message.split('\n')[0]);
    }
    
    try {
      const constants = await interfaceInstance.constants();
      console.log("✅ constants via interface:", constants);
    } catch (e) {
      console.log("❌ constants via interface:", e.message.split('\n')[0]);
    }
    
  } catch (e) {
    console.log("❌ Failed to attach interface:", e.message);
  }
  
  // Try direct proxy calls
  console.log("\n🧪 Testing direct proxy calls:");
  console.log("=" .repeat(50));
  
  try {
    // Call functions that we know exist
    const hasFunction = typeof proxyInstance.contribute === 'function';
    console.log("contribute function exists:", hasFunction);
    
    const hasProposeUpgrade = typeof proxyInstance.proposeUpgrade === 'function';
    console.log("proposeUpgrade function exists:", hasProposeUpgrade);
    
    const hasBasisPoints = typeof proxyInstance.BASIS_POINTS === 'function';
    console.log("BASIS_POINTS function exists:", hasBasisPoints);
    
    const hasGetBasisPoints = typeof proxyInstance.getBasisPoints === 'function';
    console.log("getBasisPoints function exists:", hasGetBasisPoints);
    
    // Try to call getBasisPoints directly
    if (hasGetBasisPoints) {
      const result = await proxyInstance.getBasisPoints();
      console.log("✅ getBasisPoints result:", result.toString());
    }
    
  } catch (e) {
    console.log("❌ Direct proxy call error:", e.message);
  }
  
  // Check the proxy's actual interface
  console.log("\n📋 Proxy Interface Analysis:");
  console.log("=" .repeat(50));
  
  const proxyInterface = proxyInstance.interface;
  const functions = Object.keys(proxyInterface.functions);
  console.log("Available functions in proxy interface:");
  functions.forEach(func => {
    console.log(`  - ${func}`);
  });
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
