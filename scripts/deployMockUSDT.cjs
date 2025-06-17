const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MockUSDT with account:", deployer.address);
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const address = await usdt.getAddress();
  console.log("✅ MockUSDT deployed at:", address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
