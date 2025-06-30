// scripts/deploy-testnet-complete.js
// Complete BSC Testnet deployment script for LeadFive with all libraries

import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting BSC Testnet Deployment for LeadFive");
  console.log("=" .repeat(60));

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "BNB");
  
  if (balance.lt(hre.ethers.utils.parseEther("0.1"))) {
    console.warn("⚠️  Warning: Low BNB balance. You may need more BNB for deployment.");
  }

  // BSC Testnet addresses
  const TESTNET_USDT = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"; // BSC Testnet USDT
  const TESTNET_PRICE_FEED = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BNB/USD price feed on BSC Testnet

  console.log("Using USDT address:", TESTNET_USDT);
  console.log("Using Price Feed address:", TESTNET_PRICE_FEED);
  
  const deploymentResults = {};
  
  try {
    // Deploy libraries in correct order (respecting dependencies)
    console.log("\n📚 Deploying Libraries...");
    
    // 1. Core libraries (no dependencies)
    console.log("1. Deploying DataStructures...");
    const DataStructures = await hre.ethers.getContractFactory("DataStructures");
    const dataStructures = await DataStructures.deploy();
    await dataStructures.deployed();
    deploymentResults.DataStructures = dataStructures.address;
    console.log("✓ DataStructures deployed at:", dataStructures.address);

    console.log("2. Deploying ConstantsLib...");
    const ConstantsLib = await hre.ethers.getContractFactory("ConstantsLib");
    const constantsLib = await ConstantsLib.deploy();
    await constantsLib.deployed();
    deploymentResults.ConstantsLib = constantsLib.address;
    console.log("✓ ConstantsLib deployed at:", constantsLib.address);

    // 2. Operational libraries
    console.log("3. Deploying CoreOperationsLib...");
    const CoreOperationsLib = await hre.ethers.getContractFactory("CoreOperationsLib", {
      libraries: {
        DataStructures: dataStructures.address
      }
    });
    const coreOperationsLib = await CoreOperationsLib.deploy();
    await coreOperationsLib.deployed();
    deploymentResults.CoreOperationsLib = coreOperationsLib.address;
    console.log("✓ CoreOperationsLib deployed at:", coreOperationsLib.address);

    // 3. Compensation libraries
    console.log("4. Deploying BonusDistributionLib...");
    const BonusDistributionLib = await hre.ethers.getContractFactory("BonusDistributionLib", {
      libraries: {
        DataStructures: dataStructures.address,
        CoreOperationsLib: coreOperationsLib.address
      }
    });
    const bonusDistributionLib = await BonusDistributionLib.deploy();
    await bonusDistributionLib.deployed();
    deploymentResults.BonusDistributionLib = bonusDistributionLib.address;
    console.log("✓ BonusDistributionLib deployed at:", bonusDistributionLib.address);

    console.log("5. Deploying LeaderPoolLib...");
    const LeaderPoolLib = await hre.ethers.getContractFactory("LeaderPoolLib", {
      libraries: {
        DataStructures: dataStructures.address
      }
    });
    const leaderPoolLib = await LeaderPoolLib.deploy();
    await leaderPoolLib.deployed();
    deploymentResults.LeaderPoolLib = leaderPoolLib.address;
    console.log("✓ LeaderPoolLib deployed at:", leaderPoolLib.address);

    console.log("6. Deploying MatrixRewardsLib...");
    const MatrixRewardsLib = await hre.ethers.getContractFactory("MatrixRewardsLib", {
      libraries: {
        DataStructures: dataStructures.address,
        CoreOperationsLib: coreOperationsLib.address
      }
    });
    const matrixRewardsLib = await MatrixRewardsLib.deploy();
    await matrixRewardsLib.deployed();
    deploymentResults.MatrixRewardsLib = matrixRewardsLib.address;
    console.log("✓ MatrixRewardsLib deployed at:", matrixRewardsLib.address);

    console.log("7. Deploying ViewFunctionsLib...");
    const ViewFunctionsLib = await hre.ethers.getContractFactory("ViewFunctionsLib", {
      libraries: {
        DataStructures: dataStructures.address,
        CoreOperationsLib: coreOperationsLib.address
      }
    });
    const viewFunctionsLib = await ViewFunctionsLib.deploy();
    await viewFunctionsLib.deployed();
    deploymentResults.ViewFunctionsLib = viewFunctionsLib.address;
    console.log("✓ ViewFunctionsLib deployed at:", viewFunctionsLib.address);

    // 4. Deploy main contract
    console.log("\n🏗️  Deploying Main Contract...");
    const LeadFive = await hre.ethers.getContractFactory("LeadFive", {
      libraries: {
        DataStructures: dataStructures.address,
        CoreOperationsLib: coreOperationsLib.address,
        BonusDistributionLib: bonusDistributionLib.address,
        LeaderPoolLib: leaderPoolLib.address,
        MatrixRewardsLib: matrixRewardsLib.address,
        ViewFunctionsLib: viewFunctionsLib.address
      }
    });

    console.log("Deploying LeadFive contract...");
    const leadFive = await LeadFive.deploy();
    await leadFive.deployed();
    deploymentResults.LeadFive = leadFive.address;
    console.log("✓ LeadFive deployed at:", leadFive.address);

    // 5. Initialize the contract
    console.log("\n⚙️  Initializing Contract...");
    const initTx = await leadFive.initialize(TESTNET_USDT, TESTNET_PRICE_FEED);
    await initTx.wait();
    console.log("✓ Contract initialized successfully");

    // 6. Verify deployment
    console.log("\n🔍 Verifying Deployment...");
    
    const isInitialized = await leadFive.initialized();
    const usdtAddress = await leadFive.usdtToken();
    const priceOracleAddress = await leadFive.priceOracle();
    const owner = await leadFive.owner();
    
    console.log("Contract initialized:", isInitialized);
    console.log("USDT Token:", usdtAddress);
    console.log("Price Oracle:", priceOracleAddress);
    console.log("Contract Owner:", owner);

    // 7. Save deployment info
    const deploymentInfo = {
      network: "bsc-testnet",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: deploymentResults,
      verification: {
        initialized: isInitialized,
        usdtToken: usdtAddress,
        priceOracle: priceOracleAddress,
        owner: owner
      }
    };

    const outputPath = path.join(__dirname, "../deployments", "testnet-deployment.json");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Deployment Complete!");
    console.log("=" .repeat(60));
    console.log("Main Contract Address:", leadFive.address);
    console.log("Deployment info saved to:", outputPath);
    console.log("\nNext steps:");
    console.log("1. Verify contracts on BSCScan Testnet");
    console.log("2. Run comprehensive functionality tests");
    console.log("3. Test frontend integration");
    console.log("4. Perform security testing");
    console.log("5. Only then proceed to mainnet deployment");

    return deploymentResults;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export default main;
