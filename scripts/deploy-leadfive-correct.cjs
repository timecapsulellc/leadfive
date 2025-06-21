const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 DEPLOYING THE CORRECT LEADFIVE.SOL CONTRACT TO BSC MAINNET");
  console.log("=".repeat(70));
  
  // Check if we have a deployer
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("❌ No deployer account found. Please check your DEPLOYER_PRIVATE_KEY in .env file.");
  }
  
  const deployer = signers[0];
  console.log("📍 Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log("💰 Deployer balance:", ethers.utils.formatEther(balance), "BNB");
  
  if (parseFloat(ethers.utils.formatEther(balance)) < 0.05) {
    throw new Error("❌ Insufficient BNB balance. Need at least 0.05 BNB for deployment.");
  }
  
  // BSC Mainnet Configuration
  const config = {
    USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955", // BSC USDT
    PRICE_FEED: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE",   // BNB/USD Chainlink
    ADMIN_COUNT: 16
  };
  
  // Set deployer as all admin IDs initially (you can change later)
  const adminIds = Array(config.ADMIN_COUNT).fill(deployer.address);
  
  console.log("\n📋 DEPLOYMENT CONFIGURATION:");
  console.log("- Contract:", "LeadFive.sol");
  console.log("- USDT Address:", config.USDT_ADDRESS);
  console.log("- Price Feed:", config.PRICE_FEED);
  console.log("- Initial Admin:", deployer.address);
  console.log("- Network:", "BSC Mainnet (56)");
  
  try {
    // Get contract factory
    console.log("\n📦 Getting LeadFive contract factory...");
    const LeadFive = await ethers.getContractFactory("LeadFive");
    
    // Deploy as upgradeable proxy
    console.log("🚀 Deploying upgradeable proxy...");
    const leadFive = await upgrades.deployProxy(
      LeadFive,
      [config.USDT_ADDRESS, config.PRICE_FEED, adminIds],
      { 
        initializer: 'initialize',
        kind: 'uups',
        timeout: 0 // No timeout for mainnet deployment
      }
    );
    
    await leadFive.deployed();
    console.log("✅ Proxy deployed successfully!");
    console.log("📍 Proxy Address:", leadFive.address);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(leadFive.address);
    console.log("📍 Implementation Address:", implementationAddress);
    
    // Set admin fee recipient
    console.log("\n⚙️ Configuring admin fee recipient...");
    const setRecipientTx = await leadFive.setAdminFeeRecipient(deployer.address);
    await setRecipientTx.wait();
    console.log("✅ Admin fee recipient set to:", deployer.address);
    
    // Wait for confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    await leadFive.deployTransaction.wait(5);
    
    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
      network: "BSC Mainnet",
      chainId: 56,
      deploymentDate: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        proxy: leadFive.address,
        implementation: implementationAddress
      },
      configuration: {
        usdt: config.USDT_ADDRESS,
        priceFeed: config.PRICE_FEED,
        adminFeeRecipient: deployer.address,
        adminIds: adminIds
      },
      oldContract: {
        address: "0x7FEEA22942407407801cCDA55a4392f25975D998",
        note: "DEPRECATED - DO NOT USE"
      }
    };
    
    // Create deployments directory if it doesn't exist
    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }
    
    fs.writeFileSync(
      './deployments/mainnet-deployment.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n" + "=".repeat(70));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(70));
    console.log("📍 NEW CONTRACT ADDRESS (USE THIS):", leadFive.address);
    console.log("📍 Implementation Address:", implementationAddress);
    console.log("📍 Network: BSC Mainnet (56)");
    console.log("📍 Admin Fee Recipient:", deployer.address);
    console.log("=".repeat(70));
    console.log("\n⚠️  CRITICAL: UPDATE YOUR FRONTEND WITH THE PROXY ADDRESS!");
    console.log("⚠️  OLD CONTRACT IS DEPRECATED:", "0x7FEEA22942407407801cCDA55a4392f25975D998");
    console.log("⚠️  NEW CONTRACT ADDRESS:", leadFive.address);
    console.log("\n💾 Deployment info saved to: ./deployments/mainnet-deployment.json");
    
    return {
      proxy: leadFive.address,
      implementation: implementationAddress
    };
    
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:");
    console.error(error.message);
    throw error;
  }
}

// Verify implementation after deployment
async function verifyContracts(addresses) {
  console.log("\n🔍 STARTING CONTRACT VERIFICATION...");
  console.log("=".repeat(50));
  
  try {
    console.log("📋 Verifying implementation contract...");
    await hre.run("verify:verify", {
      address: addresses.implementation,
      constructorArguments: [],
    });
    
    console.log("✅ Implementation verified successfully!");
    console.log("🔗 View on BSCScan:", `https://bscscan.com/address/${addresses.proxy}`);
    
  } catch (error) {
    if (error.message.includes("already verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      console.log("💡 You can verify manually later using:");
      console.log(`npx hardhat verify --network bsc ${addresses.implementation}`);
    }
  }
}

// Execute deployment
main()
  .then(async (addresses) => {
    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    await verifyContracts(addresses);
    
    console.log("\n🎉 DEPLOYMENT AND VERIFICATION COMPLETE!");
    console.log("🚀 Your LeadFive contract is ready for production!");
    
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 DEPLOYMENT FAILED:", error);
    process.exit(1);
  });
