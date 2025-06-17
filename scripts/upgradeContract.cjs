const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🔄 Upgrading OrphiCrowdFund contract...\n");

  const proxyAddress = "0xc42269Ff68ACBD6D6b72DB64d1a8AD4f3A1b7978";
  
  console.log("📍 Proxy Address:", proxyAddress);
  
  // Get the new contract factory
  const OrphiCrowdFundV2 = await ethers.getContractFactory("OrphiCrowdFund");
  
  console.log("🔨 Upgrading implementation...");
  
  // Upgrade the proxy to the new implementation
  const upgraded = await upgrades.upgradeProxy(proxyAddress, OrphiCrowdFundV2);
  
  console.log("✅ Contract upgraded successfully!");
  console.log("📍 Proxy Address (unchanged):", upgraded.target);
  
  // Verify the upgrade
  const version = await upgraded.version();
  console.log("✅ New Version:", version);
  
  console.log("\n🎉 Upgrade completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
