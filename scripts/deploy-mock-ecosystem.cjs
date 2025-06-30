// scripts/deploy-mock-ecosystem.cjs
// Deploy complete mock testing ecosystem with USDT, WBNB, and testing infrastructure

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying Complete Mock Testing Ecosystem");
  console.log("=" .repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BNB");

  const deploymentResults = {};

  try {
    // 1. Deploy MockUSDT
    console.log("\n💰 Deploying MockUSDT...");
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    
    deploymentResults.mockUSDT = mockUSDT.target || mockUSDT.address;
    console.log("✅ MockUSDT deployed at:", deploymentResults.mockUSDT);

    // 2. Deploy MockWBNB
    console.log("\n🌐 Deploying MockWBNB...");
    const MockWBNB = await hre.ethers.getContractFactory("MockWBNB");
    const mockWBNB = await MockWBNB.deploy();
    await mockWBNB.waitForDeployment();
    
    deploymentResults.mockWBNB = mockWBNB.target || mockWBNB.address;
    console.log("✅ MockWBNB deployed at:", deploymentResults.mockWBNB);

    // 3. Deploy MockPriceFeed if needed
    console.log("\n📊 Deploying MockPriceFeed...");
    const MockPriceFeed = await hre.ethers.getContractFactory("MockPriceFeed");
    const mockPriceFeed = await MockPriceFeed.deploy();
    await mockPriceFeed.waitForDeployment();
    
    deploymentResults.mockPriceFeed = mockPriceFeed.target || mockPriceFeed.address;
    console.log("✅ MockPriceFeed deployed at:", deploymentResults.mockPriceFeed);

    // 4. Setup initial funding
    console.log("\n💸 Setting up initial funding...");
    
    // Mint USDT to deployer for testing
    const mintUSDTTx = await mockUSDT.mint(deployer.address, hre.ethers.parseEther("1000000")); // 1M USDT
    await mintUSDTTx.wait();
    console.log("✅ Minted 1,000,000 USDT to deployer");

    // Mint WBNB to deployer for testing
    const mintWBNBTx = await mockWBNB.mint(deployer.address, hre.ethers.parseEther("10000")); // 10K WBNB
    await mintWBNBTx.wait();
    console.log("✅ Minted 10,000 WBNB to deployer");

    // 5. Verify deployments
    console.log("\n🔍 Verifying deployments...");
    
    const usdtBalance = await mockUSDT.balanceOf(deployer.address);
    const wbnbBalance = await mockWBNB.balanceOf(deployer.address);
    
    console.log("USDT Balance:", hre.ethers.formatEther(usdtBalance));
    console.log("WBNB Balance:", hre.ethers.formatEther(wbnbBalance));

    // 6. Save deployment info
    const deploymentInfo = {
      network: "bscTestnet",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: {
        mockUSDT: {
          address: deploymentResults.mockUSDT,
          name: "MockUSDT",
          symbol: "USDT",
          decimals: 18,
          initialSupply: "1000000000000000000000000", // 1M tokens
        },
        mockWBNB: {
          address: deploymentResults.mockWBNB,
          name: "MockWBNB",
          symbol: "WBNB", 
          decimals: 18,
          initialSupply: "1000000000000000000000000", // 1M tokens
        },
        mockPriceFeed: {
          address: deploymentResults.mockPriceFeed,
          name: "MockPriceFeed",
          initialPrice: "300000000000", // $300 with 8 decimals
        },
        leadFiveOptimized: {
          address: process.env.VITE_CONTRACT_ADDRESS,
          name: "LeadFiveOptimized"
        }
      },
      testingInstructions: {
        usdtFaucet: `Use mockUSDT.faucet() to get test USDT`,
        wbnbFaucet: `Use mockWBNB.faucet() to get test WBNB`,
        massDistribution: `Use the mass-testing script to distribute to 1000+ users`,
        registration: `Users can now register with mock USDT`
      }
    };

    // Save to deployments directory
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(deploymentsDir, 'mock-ecosystem-testnet.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n🎉 MOCK ECOSYSTEM DEPLOYMENT SUCCESSFUL!");
    console.log("=" .repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY:");
    console.log("• MockUSDT:", deploymentResults.mockUSDT);
    console.log("• MockWBNB:", deploymentResults.mockWBNB);
    console.log("• MockPriceFeed:", deploymentResults.mockPriceFeed);
    console.log("• LeadFive:", process.env.VITE_CONTRACT_ADDRESS);
    console.log("=" .repeat(60));

    console.log("\n🔧 NEXT STEPS:");
    console.log("1. Run mass testing script with mock tokens");
    console.log("2. Test user registration with MockUSDT");
    console.log("3. Test withdrawals and rewards");
    console.log("4. Validate system with 1000+ users");

    console.log("\n💡 TESTING COMMANDS:");
    console.log("# Check mock token balances");
    console.log("npx hardhat run scripts/check-mock-balances.cjs --network bscTestnet");
    console.log("");
    console.log("# Run mass testing");
    console.log("npx hardhat run scripts/mass-testing-with-mocks.cjs --network bscTestnet");

    // Update .env with mock addresses
    console.log("\n📝 ADD TO .ENV FILE:");
    console.log(`MOCK_USDT_ADDRESS=${deploymentResults.mockUSDT}`);
    console.log(`MOCK_WBNB_ADDRESS=${deploymentResults.mockWBNB}`);
    console.log(`MOCK_PRICEFEED_ADDRESS=${deploymentResults.mockPriceFeed}`);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
