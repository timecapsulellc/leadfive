// scripts/deploy-libraries-and-main.cjs
// Deploy all libraries first, then the main LeadFive contract

const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 DEPLOYING LEADFIVE TO BSC MAINNET");
  console.log("=====================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BNB");
  
  if (balance < hre.ethers.parseEther("0.1")) {
    console.log("❌ Insufficient BNB for deployment. Need at least 0.1 BNB");
    process.exit(1);
  }

  const deploymentResults = {};
  const libraries = {};

  try {
    // Deploy libraries in correct order (dependencies first)
    console.log("\n📚 DEPLOYING LIBRARIES...");
    
    const libraryNames = [
      "DataStructures",
      "ConstantsLib", 
      "OracleManagementLib",
      "CoreOperationsLib",
      "UserManagementLib",
      "ReferralLib",
      "BonusDistributionLib",
      "MatrixManagementLib",
      "PoolDistributionLib",
      "WithdrawalSafetyLib",
      "BusinessLogicLib",
      "AdvancedFeaturesLib",
      "LeaderPoolLib",
      "MatrixRewardsLib",
      "ViewFunctionsLib"
    ];

    for (const libName of libraryNames) {
      console.log(`Deploying ${libName}...`);
      const Library = await hre.ethers.getContractFactory(libName);
      const library = await Library.deploy();
      await library.waitForDeployment();
      
      const address = await library.getAddress();
      libraries[libName] = address;
      deploymentResults[libName] = address;
      
      console.log(`✅ ${libName}: ${address}`);
    }

    console.log("\n🏗️ DEPLOYING MAIN CONTRACT...");
    
    // Deploy main contract with library links
    const LeadFive = await hre.ethers.getContractFactory("LeadFive", {
      libraries: libraries
    });
    
    const leadFive = await LeadFive.deploy();
    await leadFive.waitForDeployment();
    
    const contractAddress = await leadFive.getAddress();
    deploymentResults.LeadFive = contractAddress;
    
    console.log(`✅ LeadFive: ${contractAddress}`);

    // Initialize the contract
    console.log("\n⚙️ INITIALIZING CONTRACT...");
    
    const usdtAddress = process.env.VITE_USDT_CONTRACT_ADDRESS || "0x55d398326f99059fF775485246999027B3197955";
    const priceFeedAddress = process.env.VITE_CHAINLINK_PRICE_FEED || "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
    
    const initTx = await leadFive.initialize(usdtAddress, priceFeedAddress);
    await initTx.wait();
    
    console.log("✅ Contract initialized");

    // Set admin fee recipient to deployer
    console.log("\n👑 SETTING ADMIN RIGHTS...");
    
    const setAdminTx = await leadFive.setAdminFeeRecipient(deployer.address);
    await setAdminTx.wait();
    
    console.log(`✅ Admin fee recipient set to: ${deployer.address}`);

    // Verify ownership and admin rights
    const owner = await leadFive.owner();
    const adminFeeRecipient = await leadFive.adminFeeRecipient();
    
    console.log(`✅ Contract owner: ${owner}`);
    console.log(`✅ Admin fee recipient: ${adminFeeRecipient}`);

    // Save deployment results
    const deploymentFile = {
      network: "bsc-mainnet",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deploymentResults,
      libraries: libraries,
      mainContract: contractAddress,
      gasUsed: "Estimated ~0.05-0.08 BNB total",
      verification: "Ready for BSCScan verification"
    };

    fs.writeFileSync(
      "deployment-mainnet-results.json",
      JSON.stringify(deploymentFile, null, 2)
    );

    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("==========================");
    console.log(`📋 Main Contract: ${contractAddress}`);
    console.log(`👑 Owner: ${owner}`);
    console.log(`💰 Admin Fee Recipient: ${adminFeeRecipient}`);
    console.log(`📁 Results saved to: deployment-mainnet-results.json`);
    
    console.log("\n🔧 NEXT STEPS:");
    console.log("1. Verify contracts on BSCScan");
    console.log("2. Update frontend with new contract address");
    console.log("3. Transfer ownership if needed");
    console.log("4. Begin user onboarding");
    
    console.log("\n📝 UPDATE .ENV FILE:");
    console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
