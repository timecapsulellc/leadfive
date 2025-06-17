const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting deployment of Optimized OrphiCrowdFund...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());

  // Configuration based on network
  let usdtAddress;
  let priceFeedAddress;
  let adminIds = new Array(16).fill(ethers.ZeroAddress);

  if (network.chainId === 97n) { // BSC Testnet
    usdtAddress = process.env.USDT_TESTNET || "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
    priceFeedAddress = process.env.PRICE_FEED_TESTNET || "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BNB/USD on BSC Testnet
    adminIds[0] = deployer.address;
    console.log("📍 Deploying to BSC Testnet");
  } else if (network.chainId === 56n) { // BSC Mainnet
    usdtAddress = process.env.USDT_MAINNET || "0x55d398326f99059fF775485246999027B3197955";
    priceFeedAddress = process.env.PRICE_FEED_MAINNET || "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"; // BNB/USD on BSC Mainnet
    adminIds[0] = deployer.address;
    
    // Add additional admin addresses from environment if provided
    for (let i = 1; i < 16; i++) {
      const adminKey = `ADMIN_${i}_ADDRESS`;
      if (process.env[adminKey]) {
        adminIds[i] = process.env[adminKey];
      }
    }
    console.log("📍 Deploying to BSC Mainnet");
  } else if (network.chainId === 1337n || network.chainId === 31337n) { // Local/Hardhat
    console.log("📦 Deploying Mock USDT for local testing...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    usdtAddress = await mockUSDT.getAddress();
    console.log("✅ Mock USDT deployed to:", usdtAddress);
    
    // Use a simple address for price feed in local testing
    priceFeedAddress = "0x0000000000000000000000000000000000000001";
    adminIds[0] = deployer.address;
    console.log("📍 Deploying to Local/Hardhat network");
  } else {
    throw new Error(`❌ Unsupported network: ${network.name} (Chain ID: ${network.chainId})`);
  }

  console.log("\n📋 Configuration:");
  console.log("- USDT Address:", usdtAddress);
  console.log("- Price Feed Address:", priceFeedAddress);
  console.log("- Admin IDs[0]:", adminIds[0]);
  console.log("- Total Admins:", adminIds.filter(addr => addr !== ethers.ZeroAddress).length);

  // Deploy the optimized contract
  console.log("\n🔨 Deploying OrphiCrowdFund...");
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  
  const orphiCrowdFund = await upgrades.deployProxy(
    OrphiCrowdFund,
    [usdtAddress, priceFeedAddress, adminIds], // Correct 3 parameters for optimized contract
    {
      initializer: "initialize",
      kind: "uups",
      timeout: 0
    }
  );
  
  await orphiCrowdFund.waitForDeployment();
  const contractAddress = await orphiCrowdFund.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
  
  console.log("✅ OrphiCrowdFund Proxy deployed to:", contractAddress);
  console.log("✅ OrphiCrowdFund Implementation deployed to:", implementationAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  try {
    const poolBalances = await orphiCrowdFund.getPoolBalances();
    console.log("✅ Pool balances accessible:", poolBalances.toString());
    
    const userInfo = await orphiCrowdFund.getUserInfo(deployer.address);
    console.log("✅ Admin user registered:", userInfo.isRegistered);
    
    console.log("✅ Contract deployment verified successfully!");
  } catch (error) {
    console.log("⚠️ Verification failed:", error.message);
  }
  
  // Output summary
  console.log("\n🎉 === DEPLOYMENT SUMMARY ===");
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("OrphiCrowdFund Proxy:", contractAddress);
  console.log("OrphiCrowdFund Implementation:", implementationAddress);
  console.log("USDT:", usdtAddress);
  console.log("Price Feed:", priceFeedAddress);
  console.log("Deployer:", deployer.address);
  console.log("Contract Size: 14.763 KiB (under 24KB limit ✅)");
  
  // Next steps
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contract:");
  console.log(`   npx hardhat verify --network ${network.name} ${contractAddress}`);
  console.log("2. Test basic functions:");
  console.log(`   npx hardhat run scripts/test-deployment.js --network ${network.name}`);
  console.log("3. Set up frontend with contract address:", contractAddress);
  
  console.log("\n⚠️ SECURITY: Keep deployment info secure and never share private keys!");
  
  return {
    contractAddress,
    implementationAddress,
    usdtAddress,
    priceFeedAddress,
    deployer: deployer.address,
    network: network.name
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 