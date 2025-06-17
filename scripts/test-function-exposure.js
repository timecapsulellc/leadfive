const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Testing contract function exposure...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy the contract
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  const instance = await upgrades.deployProxy(OrphiCrowdFund, [], {
    initializer: "initialize",
    timeout: 0,
    pollingInterval: 1000
  });

  await instance.waitForDeployment();
  console.log("Deployed to:", await instance.getAddress());
  
  // Test function exposure
  try {
    console.log("Testing constants() function...");
    const constants = await instance.constants();
    console.log("Constants result:", constants);
  } catch (error) {
    console.log("constants() function not available:", error.message);
  }
  
  try {
    console.log("Testing BASIS_POINTS...");
    const basisPoints = await instance.BASIS_POINTS();
    console.log("BASIS_POINTS result:", basisPoints);
  } catch (error) {
    console.log("BASIS_POINTS not available:", error.message);
  }
  
  try {
    console.log("Testing getBasisPoints() function...");
    const basisPoints = await instance.getBasisPoints();
    console.log("getBasisPoints result:", basisPoints);
  } catch (error) {
    console.log("getBasisPoints() function not available:", error.message);
  }
  
  try {
    console.log("Testing proposeUpgrade() function...");
    // This will fail due to access control, but we want to see if the function exists
    await instance.proposeUpgrade(ethers.ZeroAddress);
  } catch (error) {
    if (error.message.includes("AccessControl")) {
      console.log("proposeUpgrade() function is available (access control error expected)");
    } else {
      console.log("proposeUpgrade() function not available:", error.message);
    }
  }
  
  // List all available functions
  console.log("\nAvailable functions in proxy:");
  const fragment = instance.interface.fragments;
  for (const frag of fragment) {
    if (frag.type === 'function') {
      console.log(`- ${frag.name}(${frag.inputs.map(i => i.type).join(', ')})`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
