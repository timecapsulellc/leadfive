// scripts/test-testnet-deployment.js
// Comprehensive testing script for LeadFive on BSC Testnet

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Starting Comprehensive Testnet Testing");
  console.log("=" .repeat(60));

  // Load deployment info
  const deploymentPath = path.join(__dirname, "../deployments", "testnet-deployment.json");
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("Deployment info not found. Please deploy first.");
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.contracts.LeadFive;

  console.log("Testing contract at:", contractAddress);

  // Get signers for testing
  const [deployer, user1, user2, user3] = await hre.ethers.getSigners();
  console.log("Test accounts:");
  console.log("- Deployer:", deployer.address);
  console.log("- User1:", user1.address);
  console.log("- User2:", user2.address);
  console.log("- User3:", user3.address);

  // Get contract instance
  const LeadFive = await hre.ethers.getContractFactory("LeadFive", {
    libraries: {
      DataStructures: deploymentInfo.contracts.DataStructures,
      CoreOperationsLib: deploymentInfo.contracts.CoreOperationsLib,
      BonusDistributionLib: deploymentInfo.contracts.BonusDistributionLib,
      LeaderPoolLib: deploymentInfo.contracts.LeaderPoolLib,
      MatrixRewardsLib: deploymentInfo.contracts.MatrixRewardsLib,
      ViewFunctionsLib: deploymentInfo.contracts.ViewFunctionsLib
    }
  });
  const contract = LeadFive.attach(contractAddress);

  const testResults = {
    contractInfo: {},
    basicFunctions: {},
    adminFunctions: {},
    userOperations: {},
    compensationLogic: {},
    matrixFunctionality: {},
    emergencyFeatures: {}
  };

  try {
    // 1. Basic Contract Info Tests
    console.log("\n📋 Testing Basic Contract Information...");
    
    testResults.contractInfo.initialized = await contract.initialized();
    testResults.contractInfo.owner = await contract.owner();
    testResults.contractInfo.paused = await contract.paused();
    testResults.contractInfo.totalUsers = await contract.totalUsers();
    testResults.contractInfo.usdtToken = await contract.usdtToken();
    testResults.contractInfo.priceOracle = await contract.priceOracle();

    console.log("✓ Contract initialized:", testResults.contractInfo.initialized);
    console.log("✓ Contract owner:", testResults.contractInfo.owner);
    console.log("✓ Contract paused:", testResults.contractInfo.paused);
    console.log("✓ Total users:", testResults.contractInfo.totalUsers.toString());

    // 2. Admin Function Tests
    console.log("\n👨‍💼 Testing Admin Functions...");
    
    // Test pause/unpause
    await contract.pause();
    testResults.adminFunctions.pauseSuccess = await contract.paused();
    console.log("✓ Pause function:", testResults.adminFunctions.pauseSuccess);
    
    await contract.unpause();
    testResults.adminFunctions.unpauseSuccess = !(await contract.paused());
    console.log("✓ Unpause function:", testResults.adminFunctions.unpauseSuccess);

    // Test admin fee configuration
    try {
      await contract.setAdminFeePercentage(5); // 5%
      testResults.adminFunctions.setAdminFeeSuccess = true;
      console.log("✓ Set admin fee percentage: 5%");
    } catch (error) {
      testResults.adminFunctions.setAdminFeeSuccess = false;
      console.log("✗ Set admin fee failed:", error.message);
    }

    // 3. View Functions Test
    console.log("\n👁️  Testing View Functions...");
    
    try {
      testResults.basicFunctions.getMatrixPrice = await contract.getMatrixPrice(1);
      testResults.basicFunctions.getLeaderPoolPercentage = await contract.getLeaderPoolPercentage();
      testResults.basicFunctions.getRegistrationFee = await contract.getRegistrationFee();
      testResults.basicFunctions.getMaxEarnings = await contract.getMaxEarnings(1);
      
      console.log("✓ Matrix price (level 1):", hre.ethers.utils.formatEther(testResults.basicFunctions.getMatrixPrice));
      console.log("✓ Leader pool percentage:", testResults.basicFunctions.getLeaderPoolPercentage.toString());
      console.log("✓ Registration fee:", hre.ethers.utils.formatEther(testResults.basicFunctions.getRegistrationFee));
      console.log("✓ Max earnings (level 1):", hre.ethers.utils.formatEther(testResults.basicFunctions.getMaxEarnings));
    } catch (error) {
      console.log("✗ View functions failed:", error.message);
      testResults.basicFunctions.viewFunctionsError = error.message;
    }

    // 4. User Registration Test (requires USDT tokens)
    console.log("\n👤 Testing User Registration...");
    
    try {
      // Check if we can get user info (should return default values for non-registered user)
      const userInfo = await contract.getUserInfo(user1.address);
      testResults.userOperations.getUserInfoSuccess = true;
      console.log("✓ Get user info function works");
      
      // Note: Actual registration would require USDT tokens and approval
      console.log("⚠️  Note: Full registration test requires USDT tokens");
      
    } catch (error) {
      testResults.userOperations.getUserInfoError = error.message;
      console.log("✗ Get user info failed:", error.message);
    }

    // 5. Matrix Structure Tests
    console.log("\n🏗️  Testing Matrix Structure...");
    
    try {
      const matrixExists = await contract.isValidMatrixLevel(1);
      testResults.matrixFunctionality.matrixLevel1Valid = matrixExists;
      console.log("✓ Matrix level 1 valid:", matrixExists);
      
      const totalMatrixLevels = await contract.getTotalMatrixLevels();
      testResults.matrixFunctionality.totalMatrixLevels = totalMatrixLevels.toString();
      console.log("✓ Total matrix levels:", totalMatrixLevels.toString());
      
    } catch (error) {
      testResults.matrixFunctionality.error = error.message;
      console.log("✗ Matrix structure test failed:", error.message);
    }

    // 6. Leader Pool Tests
    console.log("\n👑 Testing Leader Pool Logic...");
    
    try {
      const poolBalance = await contract.getLeaderPoolBalance();
      testResults.compensationLogic.leaderPoolBalance = poolBalance.toString();
      console.log("✓ Leader pool balance:", hre.ethers.utils.formatEther(poolBalance));
      
      const poolPercentage = await contract.getLeaderPoolPercentage();
      testResults.compensationLogic.leaderPoolPercentage = poolPercentage.toString();
      console.log("✓ Leader pool percentage:", poolPercentage.toString(), "%");
      
    } catch (error) {
      testResults.compensationLogic.leaderPoolError = error.message;
      console.log("✗ Leader pool test failed:", error.message);
    }

    // 7. Emergency Features Test
    console.log("\n🚨 Testing Emergency Features...");
    
    try {
      // Test emergency pause (should work as owner)
      await contract.emergencyPause();
      testResults.emergencyFeatures.emergencyPauseSuccess = await contract.paused();
      console.log("✓ Emergency pause works:", testResults.emergencyFeatures.emergencyPauseSuccess);
      
      // Unpause for further testing
      await contract.unpause();
      
    } catch (error) {
      testResults.emergencyFeatures.emergencyPauseError = error.message;
      console.log("✗ Emergency pause failed:", error.message);
    }

    // 8. Gas Usage Tests
    console.log("\n⛽ Testing Gas Usage...");
    
    try {
      // Estimate gas for basic operations
      const pauseGas = await contract.estimateGas.pause();
      const setPriceGas = await contract.estimateGas.setAdminFeePercentage(5);
      
      testResults.basicFunctions.pauseGasEstimate = pauseGas.toString();
      testResults.basicFunctions.setPriceGasEstimate = setPriceGas.toString();
      
      console.log("✓ Pause gas estimate:", pauseGas.toString());
      console.log("✓ Set admin fee gas estimate:", setPriceGas.toString());
      
    } catch (error) {
      testResults.basicFunctions.gasEstimateError = error.message;
      console.log("✗ Gas estimation failed:", error.message);
    }

    // 9. Contract Size Verification
    console.log("\n📏 Verifying Contract Size...");
    
    try {
      const deployedBytecode = await hre.ethers.provider.getCode(contractAddress);
      const sizeInBytes = (deployedBytecode.length - 2) / 2; // Remove 0x and convert hex to bytes
      const sizeInKB = sizeInBytes / 1024;
      
      testResults.contractInfo.deployedSizeBytes = sizeInBytes;
      testResults.contractInfo.deployedSizeKB = sizeInKB.toFixed(3);
      testResults.contractInfo.underSizeLimit = sizeInKB < 24;
      
      console.log("✓ Deployed contract size:", sizeInKB.toFixed(3), "KB");
      console.log("✓ Under 24KB limit:", sizeInKB < 24);
      
    } catch (error) {
      testResults.contractInfo.sizeCheckError = error.message;
      console.log("✗ Size check failed:", error.message);
    }

    // Save test results
    const testResultsPath = path.join(__dirname, "../deployments", "testnet-test-results.json");
    const fullResults = {
      timestamp: new Date().toISOString(),
      network: "bsc-testnet",
      contractAddress: contractAddress,
      testResults: testResults
    };
    
    fs.writeFileSync(testResultsPath, JSON.stringify(fullResults, null, 2));

    console.log("\n🎉 Testing Complete!");
    console.log("=" .repeat(60));
    console.log("Test results saved to:", testResultsPath);
    
    // Summary
    console.log("\n📊 Test Summary:");
    console.log("- Contract initialized:", testResults.contractInfo.initialized);
    console.log("- Contract size:", testResults.contractInfo.deployedSizeKB || "Unknown", "KB");
    console.log("- Under size limit:", testResults.contractInfo.underSizeLimit || "Unknown");
    console.log("- Admin functions working:", testResults.adminFunctions.pauseSuccess && testResults.adminFunctions.unpauseSuccess);
    console.log("- View functions working:", !testResults.basicFunctions.viewFunctionsError);
    console.log("- Emergency features working:", testResults.emergencyFeatures.emergencyPauseSuccess);

    const allTestsPassed = 
      testResults.contractInfo.initialized &&
      testResults.adminFunctions.pauseSuccess &&
      testResults.adminFunctions.unpauseSuccess &&
      !testResults.basicFunctions.viewFunctionsError &&
      testResults.emergencyFeatures.emergencyPauseSuccess;

    if (allTestsPassed) {
      console.log("\n✅ All critical tests PASSED! Contract ready for further testing.");
    } else {
      console.log("\n⚠️  Some tests failed. Review results before proceeding.");
    }

    return testResults;

  } catch (error) {
    console.error("\n❌ Testing failed:", error);
    throw error;
  }
}

// Execute testing
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
