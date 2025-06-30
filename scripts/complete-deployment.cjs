// scripts/complete-deployment.cjs
// Complete deployment of all contracts needed for testing

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Complete LeadFive Deployment with All Dependencies");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} BNB`);

  try {
    let mockUsdtAddress, mockWbnbAddress, mockPriceFeedAddress;

    // 1. Deploy Mock USDT
    console.log("\n📦 1. Deploying Mock USDT...");
    const MockUSDT = await ethers.getContractFactory("MockUSDTTestnet");
    const mockUsdt = await MockUSDT.deploy();
    await mockUsdt.waitForDeployment();
    mockUsdtAddress = await mockUsdt.getAddress();
    console.log(`✅ Mock USDT deployed at: ${mockUsdtAddress}`);

    // 2. Deploy Mock WBNB
    console.log("\n📦 2. Deploying Mock WBNB...");
    const MockWBNB = await ethers.getContractFactory("MockWBNB");
    const mockWbnb = await MockWBNB.deploy();
    await mockWbnb.waitForDeployment();
    mockWbnbAddress = await mockWbnb.getAddress();
    console.log(`✅ Mock WBNB deployed at: ${mockWbnbAddress}`);

    // 3. Deploy Mock PriceFeed
    console.log("\n📦 3. Deploying Mock PriceFeed...");
    const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
    const mockPriceFeed = await MockPriceFeed.deploy();
    await mockPriceFeed.waitForDeployment();
    mockPriceFeedAddress = await mockPriceFeed.getAddress();
    console.log(`✅ Mock PriceFeed deployed at: ${mockPriceFeedAddress}`);

    // 4. Deploy LeadFive
    console.log("\n📦 4. Deploying LeadFive contract...");
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = await LeadFive.deploy();
    await leadFive.waitForDeployment();
    const contractAddress = await leadFive.getAddress();
    console.log(`✅ LeadFive deployed at: ${contractAddress}`);

    // 5. Initialize LeadFive
    console.log("\n🔧 5. Initializing LeadFive contract...");
    const initTx = await leadFive.initialize(mockUsdtAddress, mockPriceFeedAddress);
    await initTx.wait();
    console.log("✅ LeadFive initialized successfully!");

    // 6. Verify deployment
    console.log("\n🔍 6. Verifying deployment...");
    const owner = await leadFive.owner();
    const usdtAddress = await leadFive.usdt();
    const totalUsers = await leadFive.totalUsers();

    console.log("✅ Contract verification:");
    console.log(`👑 Contract Owner: ${owner}`);
    console.log(`🪙 USDT Address: ${usdtAddress}`);
    console.log(`👥 Total Users: ${totalUsers}`);
    
    // 7. Test Mock USDT functionality
    console.log("\n🧪 7. Testing Mock USDT functionality...");
    const usdtBalance = await mockUsdt.balanceOf(deployer.address);
    console.log(`💰 Deployer USDT Balance: ${ethers.formatUnits(usdtBalance, 18)} USDT`);

    // 8. Test Mock WBNB functionality
    console.log("\n🧪 8. Testing Mock WBNB functionality...");
    const wbnbBalance = await mockWbnb.balanceOf(deployer.address);
    console.log(`💰 Deployer WBNB Balance: ${ethers.formatUnits(wbnbBalance, 18)} WBNB`);

    // 9. Test PriceFeed functionality
    console.log("\n🧪 9. Testing PriceFeed functionality...");
    const bnbPrice = await mockPriceFeed.getPrice(ethers.ZeroAddress);
    console.log(`📊 BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);

    const deploymentInfo = {
      network: "hardhat",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        leadFive: contractAddress,
        mockUsdt: mockUsdtAddress,
        mockWbnb: mockWbnbAddress,
        mockPriceFeed: mockPriceFeedAddress
      },
      verification: {
        owner: owner,
        usdtAddress: usdtAddress,
        totalUsers: totalUsers.toString(),
        deployerUsdtBalance: ethers.formatUnits(usdtBalance, 18),
        deployerWbnbBalance: ethers.formatUnits(wbnbBalance, 18),
        bnbPrice: ethers.formatUnits(bnbPrice, 8)
      }
    };

    console.log("\n💾 Complete Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Complete deployment successful!");
    console.log("All contracts deployed and verified!");
    console.log("\n📋 Contract Addresses:");
    console.log(`LeadFive: ${contractAddress}`);
    console.log(`Mock USDT: ${mockUsdtAddress}`);
    console.log(`Mock WBNB: ${mockWbnbAddress}`);
    console.log(`Mock PriceFeed: ${mockPriceFeedAddress}`);

    return deploymentInfo;

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("✅ Complete deployment script finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Complete deployment script failed:", error);
    process.exit(1);
  });
