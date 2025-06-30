// scripts/deploy-mock-tokens.cjs
// Deploy mock tokens for comprehensive testing

const { ethers } = require("hardhat");

async function deployMockTokens() {
  console.log("🪙 Deploying Mock Tokens for Testing");
  console.log("=".repeat(50));

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deploying with account: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);

    // Deploy Mock USDT
    console.log("\n📦 Deploying Mock USDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDTTestnet");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    
    const usdtAddress = await mockUSDT.getAddress();
    console.log(`✅ Mock USDT deployed at: ${usdtAddress}`);

    // Mint initial supply for testing
    console.log("🔄 Minting initial USDT supply...");
    const mintAmount = ethers.parseEther("1000000"); // 1M USDT for testing
    await mockUSDT.mint(deployer.address, mintAmount);
    console.log(`✅ Minted ${ethers.formatEther(mintAmount)} USDT`);

    // Deploy Mock Price Feed (if needed)
    console.log("\n📦 Deploying Mock Price Feed...");
    const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
    const mockPriceFeed = await MockPriceFeed.deploy();
    await mockPriceFeed.waitForDeployment();
    
    const priceFeedAddress = await mockPriceFeed.getAddress();
    console.log(`✅ Mock Price Feed deployed at: ${priceFeedAddress}`);

    console.log("\n📋 Deployment Summary:");
    console.log("-".repeat(30));
    console.log(`Mock USDT: ${usdtAddress}`);
    console.log(`Mock Price Feed: ${priceFeedAddress}`);
    console.log(`Deployer USDT Balance: ${ethers.formatEther(await mockUSDT.balanceOf(deployer.address))} USDT`);

    return {
      mockUSDT: usdtAddress,
      mockPriceFeed: priceFeedAddress
    };

  } catch (error) {
    console.error("❌ Mock token deployment failed:", error.message);
    throw error;
  }
}

// Run deployment
deployMockTokens()
  .then((addresses) => {
    console.log("\n✅ Mock tokens deployed successfully!");
    console.log("Update your .env file with these addresses:");
    console.log(`MOCK_USDT_ADDRESS=${addresses.mockUSDT}`);
    console.log(`MOCK_PRICEFEED_ADDRESS=${addresses.mockPriceFeed}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
