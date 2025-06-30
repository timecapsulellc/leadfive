// scripts/deploy-with-mock-usdt.cjs
// Deploy LeadFive contract using our Mock USDT for testing

const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying LeadFive with Mock USDT");
  console.log("=".repeat(50));

  // Contract addresses we want to use
  const MOCK_USDT = "0x00175c710A7448920934eF830f2F22D6370E0642";
  const MOCK_PRICEFEED = "0xb4BCe54d31B49CAF37A4a8C9Eb3AC333A7Ee7766";

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} BNB`);

  console.log(`🪙 Using Mock USDT: ${MOCK_USDT}`);
  console.log(`📊 Using Mock PriceFeed: ${MOCK_PRICEFEED}`);

  try {
    // Deploy LeadFive with our mock USDT
    console.log("\n📦 Deploying LeadFive contract...");
    const LeadFive = await ethers.getContractFactory("LeadFive");
    
    const leadFive = await upgrades.deployProxy(
      LeadFive,
      [MOCK_USDT, MOCK_PRICEFEED],
      { 
        initializer: "initialize",
        kind: "uups"
      }
    );

    await leadFive.waitForDeployment();
    const proxyAddress = await leadFive.getAddress();
    
    console.log("✅ LeadFive deployed successfully!");
    console.log(`📍 Proxy Address: ${proxyAddress}`);

    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log(`📍 Implementation Address: ${implementationAddress}`);

    // Verify deployment
    const owner = await leadFive.owner();
    const usdtAddress = await leadFive.usdt();
    const totalUsers = await leadFive.totalUsers();
    const feeRecipient = await leadFive.platformFeeRecipient();

    console.log("\n✅ Contract verification:");
    console.log(`👑 Contract Owner: ${owner}`);
    console.log(`🪙 USDT Address: ${usdtAddress}`);
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`💰 Fee Recipient: ${feeRecipient}`);
    
    // Check if deployer is the owner
    console.log(`✅ Deployer is owner: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);

    console.log("\n💾 Deployment Summary:");
    const deploymentInfo = {
      network: "bsc-testnet",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      proxyAddress: proxyAddress,
      implementationAddress: implementationAddress,
      mockUsdt: MOCK_USDT,
      mockPriceFeed: MOCK_PRICEFEED,
      owner: owner,
      feeRecipient: feeRecipient
    };

    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Deployment completed successfully!");
    console.log("Contract is ready for testing with Mock USDT!");
    console.log(`\n📋 Update your test scripts to use: ${proxyAddress}`);

    return {
      proxyAddress,
      implementationAddress,
      deploymentInfo
    };

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("✅ Deployment script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment script failed:", error);
    process.exit(1);
  });
