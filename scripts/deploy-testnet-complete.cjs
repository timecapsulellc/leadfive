// scripts/deploy-testnet-complete.cjs
// Complete BSC Testnet deployment script for LeadFive with all libraries

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting BSC Testnet Deployment for LeadFive");
  console.log("=" .repeat(60));

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = deployer.address || deployer.target;
  console.log("Deploying contracts with account:", deployerAddress);
  
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log("Account balance:", balance.toString(), "wei");
  
  if (balance.toString() === "0") {
    console.warn("⚠️  Warning: Zero balance. You may need more BNB for deployment.");
  }

  // BSC Testnet addresses
  const TESTNET_USDT = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"; // BSC Testnet USDT
  const TESTNET_PRICE_FEED = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BNB/USD price feed on BSC Testnet

  // Your wallet for admin, ownership and fee recipient
  const YOUR_WALLET = "0x140aad3E7c6bCC415Bc8E830699855fF072d405D";

  console.log("Using USDT address:", TESTNET_USDT);
  console.log("Using Price Feed address:", TESTNET_PRICE_FEED);
  console.log("Your wallet (admin/owner/fees):", YOUR_WALLET);
  
  const deploymentResults = {};
  
  try {
    // Deploy libraries in correct order (respecting dependencies)
    console.log("\n📚 Deploying Libraries...");
    
    // 1. Core libraries (no dependencies)
    console.log("1. Deploying DataStructures...");
    const DataStructures = await hre.ethers.getContractFactory("DataStructures");
    const dataStructures = await DataStructures.deploy();
    deploymentResults.DataStructures = dataStructures.target || dataStructures.address;
    console.log("✓ DataStructures deployed at:", deploymentResults.DataStructures);

    console.log("2. Deploying ConstantsLib...");
    const ConstantsLib = await hre.ethers.getContractFactory("ConstantsLib");
    const constantsLib = await ConstantsLib.deploy();
    deploymentResults.ConstantsLib = constantsLib.target || constantsLib.address;
    console.log("✓ ConstantsLib deployed at:", deploymentResults.ConstantsLib);

    // 2. Operational libraries
    console.log("3. Deploying CoreOperationsLib...");
    const CoreOperationsLib = await hre.ethers.getContractFactory("CoreOperationsLib");
    const coreOperationsLib = await CoreOperationsLib.deploy();
    deploymentResults.CoreOperationsLib = coreOperationsLib.target || coreOperationsLib.address;
    console.log("✓ CoreOperationsLib deployed at:", deploymentResults.CoreOperationsLib);

    // 3. Compensation libraries
    console.log("4. Deploying BonusDistributionLib...");
    const BonusDistributionLib = await hre.ethers.getContractFactory("BonusDistributionLib");
    const bonusDistributionLib = await BonusDistributionLib.deploy();
    deploymentResults.BonusDistributionLib = bonusDistributionLib.target || bonusDistributionLib.address;
    console.log("✓ BonusDistributionLib deployed at:", deploymentResults.BonusDistributionLib);

    console.log("5. Deploying LeaderPoolLib...");
    const LeaderPoolLib = await hre.ethers.getContractFactory("LeaderPoolLib", {
      libraries: {
        BonusDistributionLib: deploymentResults.BonusDistributionLib
      }
    });
    const leaderPoolLib = await LeaderPoolLib.deploy();
    deploymentResults.LeaderPoolLib = leaderPoolLib.target || leaderPoolLib.address;
    console.log("✓ LeaderPoolLib deployed at:", deploymentResults.LeaderPoolLib);

    console.log("6. Deploying MatrixRewardsLib...");
    const MatrixRewardsLib = await hre.ethers.getContractFactory("MatrixRewardsLib", {
      libraries: {
        BonusDistributionLib: deploymentResults.BonusDistributionLib
      }
    });
    const matrixRewardsLib = await MatrixRewardsLib.deploy();
    deploymentResults.MatrixRewardsLib = matrixRewardsLib.target || matrixRewardsLib.address;
    console.log("✓ MatrixRewardsLib deployed at:", deploymentResults.MatrixRewardsLib);

    console.log("7. Deploying ViewFunctionsLib...");
    const ViewFunctionsLib = await hre.ethers.getContractFactory("ViewFunctionsLib");
    const viewFunctionsLib = await ViewFunctionsLib.deploy();
    deploymentResults.ViewFunctionsLib = viewFunctionsLib.target || viewFunctionsLib.address;
    console.log("✓ ViewFunctionsLib deployed at:", deploymentResults.ViewFunctionsLib);

    // Deploy additional required libraries
    console.log("8. Deploying BusinessLogicLib...");
    const BusinessLogicLib = await hre.ethers.getContractFactory("BusinessLogicLib");
    const businessLogicLib = await BusinessLogicLib.deploy();
    deploymentResults.BusinessLogicLib = businessLogicLib.target || businessLogicLib.address;
    console.log("✓ BusinessLogicLib deployed at:", deploymentResults.BusinessLogicLib);

    console.log("9. Deploying MatrixManagementLib...");
    const MatrixManagementLib = await hre.ethers.getContractFactory("MatrixManagementLib");
    const matrixManagementLib = await MatrixManagementLib.deploy();
    deploymentResults.MatrixManagementLib = matrixManagementLib.target || matrixManagementLib.address;
    console.log("✓ MatrixManagementLib deployed at:", deploymentResults.MatrixManagementLib);

    console.log("10. Deploying OracleManagementLib...");
    const OracleManagementLib = await hre.ethers.getContractFactory("OracleManagementLib");
    const oracleManagementLib = await OracleManagementLib.deploy();
    deploymentResults.OracleManagementLib = oracleManagementLib.target || oracleManagementLib.address;
    console.log("✓ OracleManagementLib deployed at:", deploymentResults.OracleManagementLib);

    console.log("11. Deploying PoolDistributionLib...");
    const PoolDistributionLib = await hre.ethers.getContractFactory("PoolDistributionLib");
    const poolDistributionLib = await PoolDistributionLib.deploy();
    deploymentResults.PoolDistributionLib = poolDistributionLib.target || poolDistributionLib.address;
    console.log("✓ PoolDistributionLib deployed at:", deploymentResults.PoolDistributionLib);

    // 4. Deploy main contract
    console.log("\n🏗️  Deploying Main Contract...");
    // Link only the libraries that are actually needed by the main contract
    const LeadFive = await hre.ethers.getContractFactory("LeadFive", {
      libraries: {
        BonusDistributionLib: deploymentResults.BonusDistributionLib,
        BusinessLogicLib: deploymentResults.BusinessLogicLib,
        ConstantsLib: deploymentResults.ConstantsLib,
        CoreOperationsLib: deploymentResults.CoreOperationsLib,
        LeaderPoolLib: deploymentResults.LeaderPoolLib,
        MatrixManagementLib: deploymentResults.MatrixManagementLib,
        MatrixRewardsLib: deploymentResults.MatrixRewardsLib,
        OracleManagementLib: deploymentResults.OracleManagementLib,
        PoolDistributionLib: deploymentResults.PoolDistributionLib,
        ViewFunctionsLib: deploymentResults.ViewFunctionsLib
      }
    });

    console.log("Deploying LeadFive contract...");
    const leadFive = await LeadFive.deploy();
    deploymentResults.LeadFive = leadFive.target || leadFive.address;
    console.log("✓ LeadFive deployed at:", deploymentResults.LeadFive);

    // 5. Initialize the contract
    console.log("\n⚙️  Initializing Contract...");
    const initTx = await leadFive.initialize(TESTNET_USDT, TESTNET_PRICE_FEED);
    await initTx.wait();
    console.log("✓ Contract initialized successfully");

    // 6. Configure Admin Settings and Ownership Transfer
    console.log("\n🔐 Configuring Admin Settings...");
    
    // Set all admin IDs to your wallet
    console.log("Setting admin IDs to your wallet...");
    for (let i = 0; i < 16; i++) {
      const setAdminTx = await leadFive.setAdminId(i, YOUR_WALLET);
      await setAdminTx.wait();
    }
    console.log("✓ All admin IDs set to your wallet");

    // Set admin fee recipient to your wallet
    console.log("Setting admin fee recipient to your wallet...");
    const setFeeRecipientTx = await leadFive.setAdminFeeRecipient(YOUR_WALLET);
    await setFeeRecipientTx.wait();
    console.log("✓ Admin fee recipient set to your wallet");

    // Note: We keep ownership with deployer for now - will transfer after full setup
    console.log("ℹ️  Ownership remains with deployer for setup phase");
    console.log("ℹ️  Transfer ownership to Trezor wallet after complete configuration");

    // 7. Verify deployment
    console.log("\n🔍 Verifying Deployment...");
    
    const usdtAddress = await leadFive.usdt();
    const priceOracleAddress = await leadFive.priceFeed();
    const owner = await leadFive.owner();
    const totalUsers = await leadFive.totalUsers();
    const adminId0 = await leadFive.adminIds(0);
    const adminId15 = await leadFive.adminIds(15);
    
    console.log("USDT Token:", usdtAddress);
    console.log("Price Oracle:", priceOracleAddress);
    console.log("Contract Owner:", owner);
    console.log("Total Users:", totalUsers.toString());
    console.log("Admin IDs[0] (sample):", adminId0);
    console.log("Admin IDs[15] (sample):", adminId15);

    // 8. Save deployment info
    const deploymentInfo = {
      network: "bsc-testnet",
      timestamp: new Date().toISOString(),
      deployer: deployerAddress,
      trezorWallet: TREZOR_WALLET,
      contracts: deploymentResults,
      verification: {
        usdtToken: usdtAddress,
        priceOracle: priceOracleAddress,
        owner: owner,
        totalUsers: totalUsers.toString(),
        adminId0: adminId0,
        adminId15: adminId15,
        notes: "Admin IDs and fee recipient set to Trezor wallet. Will transfer ownership after setup."
      }
    };

    const outputPath = path.join(__dirname, "../deployments", "testnet-deployment.json");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Deployment Complete!");
    console.log("=" .repeat(60));
    console.log("Main Contract Address:", deploymentResults.LeadFive);
    console.log("Deployer Address:", deployerAddress);
    console.log("Trezor Wallet Address:", TREZOR_WALLET);
    console.log("Deployment info saved to:", outputPath);
    console.log("\nConfiguration Status:");
    console.log("✓ All admin IDs set to Trezor wallet");
    console.log("✓ Admin fee recipient set to Trezor wallet");
    console.log("⏳ Ownership remains with deployer (will transfer after setup)");
    console.log("\nNext steps:");
    console.log("1. Run comprehensive functionality tests");
    console.log("2. Verify contracts on BSCScan Testnet");
    console.log("3. Test all admin functions");
    console.log("4. Configure root ID and initial setup");
    console.log("5. Transfer ownership to your wallet after setup complete");
    console.log("6. Test frontend integration");
    console.log("7. Perform security testing");
    console.log("8. Only then proceed to mainnet deployment");

    return deploymentResults;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
