// scripts/deploy-testnet-simple.cjs
// Simplified deployment script to test the issue

const hre = require("hardhat");

async function main() {
  console.log("🔍 Testing LeadFive Contract Deployment");
  console.log("=" .repeat(60));

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // BSC Testnet addresses
  const TESTNET_USDT = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684";
  const TESTNET_PRICE_FEED = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";
  
  // Use the already deployed libraries
  const libraries = {
    BonusDistributionLib: "0x07474d56f47F208C377eC5bBfB66a1e64C2C3b9B",
    BusinessLogicLib: "0x76b95a37963cAAA86593ecA06A7c68e1B0B4E98d",
    ConstantsLib: "0xc58620dd8fD9d244453e421E700c2D3FCFB595b4",
    CoreOperationsLib: "0x5cb32e2cCd59b60C45606487dB902160728f7528",
    LeaderPoolLib: "0xb0536EDf05b7FEAf281E8C29B9b5bfAd5A31608B",
    MatrixManagementLib: "0x52Afce53666CDA80E11852Ee5104F1fFf6F1b9Fd",
    MatrixRewardsLib: "0x90bf7Caa2Ccfd116590d9c3707a430b9c1BFb92e",
    OracleManagementLib: "0x26600490281928353D9F05474C14B1f41996A321",
    PoolDistributionLib: "0xb0B7AFDD785A51c972EC984cA449ADA62424A5Da",
    ViewFunctionsLib: "0xC4CF05D23A078b48F20b3E51A2f156c02d584FC1"
  };

  try {
    console.log("\n📋 Testing contract interaction...");
    
    // Test if the deployed contract can be interacted with
    const contractAddress = "0xE11a3ef76cf0AA955E6549131aEf156508BEdb58";
    const LeadFive = await hre.ethers.getContractFactory("LeadFive", { libraries });
    const leadFive = LeadFive.attach(contractAddress);
    
    console.log("Attached to contract:", contractAddress);
    
    // Try to check if it's already initialized
    try {
      const isInitialized = await leadFive.hasRole(await leadFive.DEFAULT_ADMIN_ROLE(), deployer.address);
      console.log("✓ Contract is accessible, admin role check:", isInitialized);
    } catch (error) {
      console.log("❌ Error checking admin role:", error.message);
    }

    // Try to initialize with more gas
    console.log("\n🔄 Attempting initialization with higher gas limit...");
    try {
      const initTx = await leadFive.initialize(TESTNET_USDT, TESTNET_PRICE_FEED, {
        gasLimit: 1000000 // Increased gas limit
      });
      console.log("⏳ Transaction sent:", initTx.hash);
      await initTx.wait();
      console.log("✅ Initialization successful!");
    } catch (error) {
      console.log("❌ Initialization failed:", error.message);
      
      // Let's try a fresh deployment
      console.log("\n🚀 Deploying fresh contract...");
      const freshLeadFive = await LeadFive.deploy();
      console.log("✓ Fresh LeadFive deployed at:", freshLeadFive.target || freshLeadFive.address);
      
      console.log("🔄 Initializing fresh contract...");
      const freshInitTx = await freshLeadFive.initialize(TESTNET_USDT, TESTNET_PRICE_FEED, {
        gasLimit: 1000000
      });
      await freshInitTx.wait();
      console.log("✅ Fresh contract initialized successfully!");
      
      return {
        contractAddress: freshLeadFive.target || freshLeadFive.address,
        status: "success"
      };
    }
    
  } catch (error) {
    console.error("❌ Deployment test failed:", error.message);
    throw error;
  }
}

main()
  .then((result) => {
    if (result) {
      console.log("\n🎉 Deployment Success!");
      console.log("Contract Address:", result.contractAddress);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
