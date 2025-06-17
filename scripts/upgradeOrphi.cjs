const { ethers, upgrades } = require("hardhat");

async function main() {
  // Determine proxy address based on network
  const network = hre.network.name;
  let proxyAddress;
  
  if (network === 'bsc' || network === 'bsc_mainnet') {
    proxyAddress = "0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732"; // BSC Mainnet
  } else if (network === 'bsc_testnet') {
    // Deploy new contract on testnet for testing
    console.log("⚠️  No existing testnet deployment. Deploy fresh contract first.");
    return;
  } else {
    throw new Error(`Unsupported network: ${network}`);
  }
  
  console.log(`Upgrading OrphiCrowdFund at proxy: ${proxyAddress} on ${network}`);

  // Get the ContractFactory for the updated OrphiCrowdFund
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundMain");

  // Perform the upgrade
  const upgraded = await upgrades.upgradeProxy(proxyAddress, OrphiCrowdFund);

  console.log("✅ OrphiCrowdFund upgraded successfully to implementation:", upgraded.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
