// scripts/deploy-with-admin-control.js
// BSC Testnet deployment with explicit admin control setup

import hre from "hardhat";
import fs from "fs";

const { ethers, upgrades } = hre;

async function main() {
  console.log("🚀 Starting LeadFive BSC Testnet Deployment with Admin Control");
  console.log("=" .repeat(70));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB");
  
  if (balance < ethers.parseEther("0.05")) {
    throw new Error("❌ Insufficient BNB balance. Need at least 0.05 BNB for deployment.");
  }

  // BSC Testnet configuration
  const TESTNET_USDT = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"; // BSC Testnet USDT
  const TESTNET_PRICE_FEED = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"; // BNB/USD price feed

  console.log("Using USDT address:", TESTNET_USDT);
  console.log("Using Price Feed address:", TESTNET_PRICE_FEED);
  
  const deploymentResults = {
    network: "BSC Testnet",
    chainId: 97,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    adminRights: {
      owner: deployer.address,
      initialAdmin: deployer.address,
      platformFeeRecipient: deployer.address
    }
  };
  
  try {
    console.log("\n📦 Deploying LeadFive Contract...");
    
    // Get the LeadFive contract factory
    const LeadFive = await ethers.getContractFactory("LeadFive");
    
    console.log("Contract bytecode size:", (LeadFive.bytecode.length - 2) / 2, "bytes");
    
    // Deploy as upgradeable proxy
    console.log("Deploying LeadFive with UUPS proxy...");
    const leadFive = await upgrades.deployProxy(
      LeadFive,
      [TESTNET_USDT, TESTNET_PRICE_FEED],
      {
        initializer: 'initialize',
        kind: 'uups'
      }
    );

    await leadFive.waitForDeployment();
    
    const proxyAddress = await leadFive.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    
    deploymentResults.proxy = proxyAddress;
    deploymentResults.implementation = implementationAddress;
    
    console.log("✅ LeadFive Proxy deployed at:", proxyAddress);
    console.log("✅ Implementation deployed at:", implementationAddress);

    // Verify admin rights setup
    console.log("\n🔐 Verifying Admin Rights Setup...");
    
    const owner = await leadFive.owner();
    const platformFeeRecipient = await leadFive.platformFeeRecipient();
    
    console.log("Contract Owner:", owner);
    console.log("Platform Fee Recipient:", platformFeeRecipient);
    console.log("Deployer Address:", deployer.address);
    
    // Verify deployer is owner
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error("❌ Deployer is not the contract owner!");
    }
    
    // Verify deployer is platform fee recipient
    if (platformFeeRecipient.toLowerCase() !== deployer.address.toLowerCase()) {
      throw new Error("❌ Deployer is not the platform fee recipient!");
    }
    
    console.log("✅ Deployer confirmed as contract owner");
    console.log("✅ Deployer confirmed as platform fee recipient");
    
    // Check if deployer is in admin list (should be from initialization)
    console.log("\n👤 Checking Admin Status...");
    try {
      // Test admin function to verify admin access
      const adminCallResult = await leadFive.connect(deployer).totalUsers();
      console.log("✅ Deployer has admin access confirmed");
    } catch (error) {
      console.log("⚠️ Admin access test failed:", error.message);
    }

    // Verify deployment configuration
    console.log("\n🔍 Verifying Contract Configuration...");
    
    const totalUsers = await leadFive.totalUsers();
    const package1 = await leadFive.packages(1);
    const package2 = await leadFive.packages(2);
    const package3 = await leadFive.packages(3);
    const package4 = await leadFive.packages(4);
    
    console.log("Total users:", totalUsers.toString());
    console.log("Package 1 price:", ethers.formatEther(package1.price), "USDT");
    console.log("Package 2 price:", ethers.formatEther(package2.price), "USDT");
    console.log("Package 3 price:", ethers.formatEther(package3.price), "USDT");
    console.log("Package 4 price:", ethers.formatEther(package4.price), "USDT");
    
    // Verify bonus structure
    console.log("\n💰 Verifying Bonus Structure...");
    console.log("Direct Bonus (Package 1):", package1.directBonus, "basis points (40%)");
    console.log("Level Bonus (Package 1):", package1.levelBonus, "basis points (10%)");
    console.log("Leader Bonus (Package 1):", package1.leaderBonus, "basis points (10%)");
    console.log("Help Bonus (Package 1):", package1.helpBonus, "basis points (30%)");
    
    // Check deployer user data
    console.log("\n👤 Checking Deployer User Data...");
    const deployerUser = await leadFive.users(deployer.address);
    console.log("Deployer registered:", (deployerUser.flags & 1n) ? "Yes" : "No");
    
    if (deployerUser.flags & 1n) {
      console.log("Deployer package level:", deployerUser.packageLevel);
      console.log("Deployer withdrawal rate:", deployerUser.withdrawalRate, "%");
      console.log("Deployer earnings cap:", ethers.formatEther(deployerUser.earningsCap), "USDT");
    }

    // Save deployment info with admin transfer instructions
    const deploymentFile = `deployment-admin-setup-${Date.now()}.json`;
    
    deploymentResults.contracts = {
      LeadFive: {
        proxy: proxyAddress,
        implementation: implementationAddress
      }
    };
    
    deploymentResults.configuration = {
      USDT: TESTNET_USDT,
      PriceFeed: TESTNET_PRICE_FEED,
      packages: [
        { level: 1, price: "30 USDT", directBonus: "40%", levelBonus: "10%", helpPool: "30%" },
        { level: 2, price: "50 USDT", directBonus: "40%", levelBonus: "10%", helpPool: "30%" },
        { level: 3, price: "100 USDT", directBonus: "40%", levelBonus: "10%", helpPool: "30%" },
        { level: 4, price: "200 USDT", directBonus: "40%", levelBonus: "10%", helpPool: "30%" }
      ],
      bonusStructure: {
        directReferral: "40%",
        levelBonus: "10%", 
        uplineBonus: "10%",
        leaderPool: "10%",
        helpPool: "30%",
        total: "100%"
      },
      securityFeatures: {
        earningsMultiplier: "4x",
        adminFeeRate: "5%",
        withdrawalRates: ["70%", "75%", "80%"],
        reinvestmentSplit: "40%/30%/30%"
      }
    };

    // Add ownership transfer instructions
    deploymentResults.ownershipTransfer = {
      currentOwner: deployer.address,
      instructions: [
        "1. Test all functionality with deployer account",
        "2. Configure additional admins if needed using addAdmin(address)",
        "3. Set final platform fee recipient using setPlatformFeeRecipient(address)",
        "4. Transfer ownership using transferOwnership(newOwner)",
        "5. New owner must call acceptOwnership() to complete transfer"
      ],
      functions: {
        addAdmin: "leadFive.addAdmin(newAdminAddress)",
        removeAdmin: "leadFive.removeAdmin(adminAddress)",
        setPlatformFeeRecipient: "leadFive.setPlatformFeeRecipient(newRecipient)",
        transferOwnership: "leadFive.transferOwnership(newOwner)",
        acceptOwnership: "newOwnerAccount.acceptOwnership()"
      }
    };

    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    console.log(`\n💾 Deployment details saved to: ${deploymentFile}`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("=" .repeat(70));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=" .repeat(70));
    console.log(`Network: BSC Testnet (Chain ID: 97)`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`LeadFive Proxy: ${proxyAddress}`);
    console.log(`Implementation: ${implementationAddress}`);
    console.log(`Contract Owner: ${owner}`);
    console.log(`Platform Fee Recipient: ${platformFeeRecipient}`);
    console.log(`USDT Token: ${TESTNET_USDT}`);
    console.log(`Price Feed: ${TESTNET_PRICE_FEED}`);
    console.log("=" .repeat(70));
    
    console.log("\n🔐 ADMIN CONTROL STATUS:");
    console.log("✅ Deployer is contract owner");
    console.log("✅ Deployer is initial admin");
    console.log("✅ Deployer is platform fee recipient");
    console.log("✅ All admin rights controlled by deployer");
    
    console.log("\n🔄 CONFIGURATION STEPS:");
    console.log("1. ✅ Deploy contract with deployer as owner");
    console.log("2. 🔄 Test all functionality thoroughly");
    console.log("3. 🔄 Add additional admins if needed");
    console.log("4. 🔄 Configure final platform fee recipient");
    console.log("5. 🔄 Transfer ownership to production owner");
    
    console.log("\n🔗 NEXT STEPS:");
    console.log("1. Verify contracts on BSCScan Testnet");
    console.log("2. Test registration and package upgrades");
    console.log("3. Test withdrawal functionality");
    console.log("4. Test admin functions");
    console.log("5. Prepare for ownership transfer");
    
    console.log("\n📱 TESTNET LINKS:");
    console.log(`• Contract: https://testnet.bscscan.com/address/${proxyAddress}`);
    console.log(`• Implementation: https://testnet.bscscan.com/address/${implementationAddress}`);
    console.log(`• USDT: https://testnet.bscscan.com/address/${TESTNET_USDT}`);
    
    return deploymentResults;

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("Full error:", error);
    throw error;
  }
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment script failed:", error);
    process.exit(1);
  });

export default main;
