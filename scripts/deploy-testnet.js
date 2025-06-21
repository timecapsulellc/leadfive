// scripts/deploy-testnet.js
// Deploy LeadFive.sol to BSC Testnet using Hardhat

const hre = require("hardhat");

async function main() {
  // Replace with actual testnet addresses for USDT and a Chainlink price feed
  const USDT_ADDRESS = process.env.TESTNET_USDT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const PRICE_FEED_ADDRESS = process.env.TESTNET_PRICE_FEED_ADDRESS || "0x0000000000000000000000000000000000000000";

  const LeadFive = await hre.ethers.getContractFactory("LeadFive");
  const contract = await LeadFive.deploy();
  await contract.deployed();

  // Initialize contract (call initialize)
  const tx = await contract.initialize(USDT_ADDRESS, PRICE_FEED_ADDRESS);
  await tx.wait();

  console.log("LeadFive deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
