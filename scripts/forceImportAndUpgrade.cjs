const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732";
  const implementationAddress = "0x4CE48E3565E85cF74794C245463878672627fc1D";
  
  console.log(`Force importing proxy at: ${proxyAddress}`);
  console.log(`Current implementation: ${implementationAddress}`);

  // Get the current implementation contract factory
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundMain");

  // Force import the existing proxy
  await upgrades.forceImport(proxyAddress, OrphiCrowdFund);
  
  console.log("✅ Proxy successfully imported for upgrade management");
  
  // Now perform the upgrade
  console.log("Performing upgrade...");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, OrphiCrowdFund);
  
  console.log("✅ OrphiCrowdFund upgraded successfully!");
  console.log("New implementation address:", await upgrades.erc1967.getImplementationAddress(proxyAddress));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
