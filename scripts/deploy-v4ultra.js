const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Starting deployment of OrphiCrowdFundV4UltraSecure...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());

  let usdtAddress;

  // Deploy MockUSDT for local testing (hardhat or localhost)
  if (network.name === "hardhat" || network.name === "localhost" || network.chainId === 31337n || network.chainId === 1337n) {
    console.log("Deploying MockUSDT for local testing...");
    const MockUSDT = await ethers.getContractFactory("standalone-v4ultra/MockUSDT.sol:MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    usdtAddress = await mockUSDT.getAddress();
    console.log("MockUSDT deployed to:", usdtAddress);
  } else if (network.chainId === 97n) { // BSC Testnet
    usdtAddress = process.env.USDT_TESTNET || "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // Example, replace with actual or .env
    console.log("Using BSC Testnet USDT:", usdtAddress);
  } else {
    throw new Error(`Unsupported network: ${network.name} (Chain ID: ${network.chainId}). Please configure USDT address.`);
  }

  const adminAddress = deployer.address; // Using deployer as admin for this deployment

  console.log("\nConfiguration:");
  console.log("- USDT Address:", usdtAddress);
  console.log("- Admin Address:", adminAddress);

  // Deploy OrphiCrowdFundV4UltraSecure
  console.log("\nDeploying OrphiCrowdFundV4UltraSecure...");
  const OrphiCrowdFundV4UltraSecure = await ethers.getContractFactory("standalone-v4ultra/OrphiCrowdFundV4UltraSecure.sol:OrphiCrowdFundV4UltraSecure");
  const orphiCrowdFundV4UltraSecure = await OrphiCrowdFundV4UltraSecure.deploy(usdtAddress, adminAddress);
  await orphiCrowdFundV4UltraSecure.waitForDeployment();
  const contractAddress = await orphiCrowdFundV4UltraSecure.getAddress();

  console.log("OrphiCrowdFundV4UltraSecure deployed to:", contractAddress);

  // Output summary
  console.log("\n=== DEPLOYMENT SUMMARY (OrphiCrowdFundV4UltraSecure) ===");
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("OrphiCrowdFundV4UltraSecure Address:", contractAddress);
  console.log("MockUSDT Address (if local):", network.name === "hardhat" || network.name === "localhost" ? usdtAddress : "N/A (using pre-existing USDT)");
  console.log("Admin Address:", adminAddress);
  console.log("Deployer:", deployer.address);

  // Save deployment info to a file (optional, but good practice)
  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  const filename = `deployment-v4ultra-${network.name}-${Date.now()}.json`;
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractName: "OrphiCrowdFundV4UltraSecure",
    address: contractAddress,
    usdtAddress: usdtAddress,
    adminAddress: adminAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(path.join(deploymentsDir, filename), JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: deployments/${filename}`);

  console.log("\n⚠️ IMPORTANT: If deploying to a live network, verify the contract and manage keys securely.");

  return {
    contractAddress,
    usdtAddress,
    adminAddress,
    deployer: deployer.address
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
