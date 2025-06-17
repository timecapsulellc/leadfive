const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🔍 Verifying proxy function exposure...");
  console.log("📍 Deployer address:", deployer.address);
  
  try {
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
    console.log("✅ Contract factory created");
    
    const instance = await upgrades.deployProxy(OrphiCrowdFund, [], {
      initializer: "initialize",
      kind: "uups"
    });
    
    await instance.waitForDeployment();
    const proxyAddress = await instance.getAddress();
    console.log("📍 Proxy deployed at:", proxyAddress);
    
    // Initialize roles
    const upgraderRole = ethers.keccak256(ethers.toUtf8Bytes("UPGRADER_ROLE"));
    const emergencyRole = ethers.keccak256(ethers.toUtf8Bytes("EMERGENCY_ROLE"));
    const poolManagerRole = ethers.keccak256(ethers.toUtf8Bytes("POOL_MANAGER_ROLE"));
    
    await instance.grantRole(upgraderRole, deployer.address);
    await instance.grantRole(emergencyRole, deployer.address);
    await instance.grantRole(poolManagerRole, deployer.address);
    console.log("✅ Roles initialized");
    
    // Test function exposure
    const functionsToCheck = [
      { name: 'proposeUpgrade', type: 'function', testCall: false },
      { name: 'executeUpgrade', type: 'function', testCall: false },
      { name: 'cancelUpgrade', type: 'function', testCall: false },
      { name: 'register', type: 'function', testCall: false },
      { name: 'contribute', type: 'function', testCall: false },
      { name: 'BASIS_POINTS', type: 'constant', testCall: true },
      { name: 'getBasisPoints', type: 'view', testCall: true },
      { name: 'POOL_MANAGER_ROLE', type: 'constant', testCall: true },
      { name: 'UPGRADE_DELAY', type: 'constant', testCall: true },
      { name: 'constants', type: 'view', testCall: true },
      { name: 'getProxyAdmin', type: 'view', testCall: true },
      { name: 'getImplementation', type: 'view', testCall: true },
      { name: 'getPendingUpgrades', type: 'view', testCall: true },
      { name: 'getUserEarnings', type: 'view', testCall: false },
      { name: 'globalHelpPoolBalance', type: 'view', testCall: true }
    ];
    
    console.log("\n🧪 Testing function availability:");
    console.log("=" .repeat(50));
    
    for (const func of functionsToCheck) {
      try {
        if (func.testCall) {
          // Test actual function call
          if (func.name === 'getUserEarnings') {
            await instance[func.name](deployer.address);
          } else {
            await instance[func.name]();
          }
          console.log(`✅ ${func.name} (${func.type}): Available & callable`);
        } else {
          // Just check if function exists in interface
          const hasFunction = typeof instance[func.name] === 'function';
          if (hasFunction) {
            console.log(`✅ ${func.name} (${func.type}): Available in interface`);
          } else {
            console.log(`❌ ${func.name} (${func.type}): Not found in interface`);
          }
        }
      } catch (e) {
        if (e.message.includes("not a function")) {
          console.log(`❌ ${func.name} (${func.type}): Not available - Function not found`);
        } else {
          console.log(`⚠️  ${func.name} (${func.type}): Available but error on call - ${e.message.split('\n')[0]}`);
        }
      }
    }
    
    console.log("\n📊 Contract Information:");
    console.log("=" .repeat(50));
    
    try {
      console.log("Implementation:", await instance.getImplementation());
    } catch (e) {
      console.log("Implementation error:", e.message.split('\n')[0]);
    }
    
    try {
      console.log("Proxy Admin:", await instance.getProxyAdmin());
    } catch (e) {
      console.log("Proxy Admin error:", e.message.split('\n')[0]);
    }
    
    try {
      console.log("BASIS_POINTS:", await instance.getBasisPoints());
    } catch (e) {
      console.log("BASIS_POINTS error:", e.message.split('\n')[0]);
    }
    
    try {
      console.log("UPGRADE_DELAY:", await instance.UPGRADE_DELAY());
    } catch (e) {
      console.log("UPGRADE_DELAY error:", e.message.split('\n')[0]);
    }
    
    // Test constants function
    try {
      const constants = await instance.constants();
      console.log("Constants (basisPoints, upgradeDelay):", constants);
    } catch (e) {
      console.log("Constants function error:", e.message);
    }
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
