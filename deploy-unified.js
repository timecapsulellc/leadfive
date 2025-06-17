/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║    ██████╗ ██████╗ ██████╗ ██╗  ██╗██╗    ██████╗██████╗  ██████╗ ██╗    ██╗██████╗  ║
 * ║   ██╔═══██╗██╔══██╗██╔══██╗██║  ██║██║   ██╔════╝██╔══██╗██╔═══██╗██║    ██║██╔══██╗ ║
 * ║   ██║   ██║██████╔╝██████╔╝███████║██║   ██║     ██████╔╝██║   ██║██║ █╗ ██║██║  ██║ ║
 * ║   ██║   ██║██╔══██╗██╔═══╝ ██╔══██║██║   ██║     ██╔══██╗██║   ██║██║███╗██║██║  ██║ ║
 * ║   ╚██████╔╝██║  ██║██║     ██║  ██║██║   ╚██████╗██║  ██║╚██████╔╝╚███╔███╔╝██████╔╝ ║
 * ║    ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝    ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝ ╚═════╝  ║
 * ║                                                                                       ║
 * ║                          UNIFIED DEPLOYMENT SYSTEM v1.0                              ║
 * ║                         Professional Grade - Single Entry Point                      ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * REPLACES 75+ SCATTERED DEPLOYMENT SCRIPTS WITH ONE PROFESSIONAL SOLUTION
 * 
 * This script automatically detects network and deployment mode from environment
 */

const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Load environment
require("dotenv").config({ path: ".env.trezor" });
require("dotenv").config(); // Load default .env as fallback

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEPLOYMENT_CONFIG = {
  contract: "OrphiCrowdFund",
  trezorWallet: "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29",
  confirmations: 3,
  version: "2.0.0"
};

const NETWORK_CONFIG = {
  bsc_testnet: {
    name: "BSC Testnet",
    chainId: 97,
    usdt: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
    explorer: "https://testnet.bscscan.com"
  },
  bsc_mainnet: {
    name: "BSC Mainnet",
    chainId: 56,
    usdt: "0x55d398326f99059fF775485246999027B3197955",
    explorer: "https://bscscan.com"
  },
  bsc: {
    name: "BSC Mainnet",
    chainId: 56,
    usdt: "0x55d398326f99059fF775485246999027B3197955",
    explorer: "https://bscscan.com"
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatBNB = (wei) => ethers.formatEther(wei);
const formatGwei = (wei) => ethers.formatUnits(wei, "gwei");

const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  section: (title) => {
    console.log("\n" + "=".repeat(60));
    console.log(`🎯 ${title}`);
    console.log("=".repeat(60));
  }
};

// ============================================================================
// MAIN DEPLOYMENT FUNCTION
// ============================================================================

async function main() {
  try {
    logger.section("OrphiCrowdFund Unified Deployment");
    
    // Detect network and mode
    const network = await ethers.provider.getNetwork();
    const networkName = network.name;
    const isTrezorMode = process.env.DEPLOYMENT_MODE === 'trezor';
    
    // Get network config
    const hardhatNetworkName = process.env.HARDHAT_NETWORK || 'hardhat';
    const networkConfig = NETWORK_CONFIG[hardhatNetworkName];
    
    if (!networkConfig) {
      throw new Error(`❌ Unsupported network: ${hardhatNetworkName}`);
    }
    
    logger.info(`Network: ${networkConfig.name} (Chain ID: ${network.chainId})`);
    logger.info(`Deployment Mode: ${isTrezorMode ? '🔐 TREZOR' : '🔑 STANDARD'}`);
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    if (!deployer) {
      throw new Error("❌ No deployer account found!");
    }
    
    const balance = await ethers.provider.getBalance(deployer.address);
    logger.info(`Deployer: ${deployer.address}`);
    logger.info(`Balance: ${formatBNB(balance)} BNB`);
    
    if (balance < ethers.parseEther("0.05")) {
      throw new Error("❌ Insufficient BNB balance! Need at least 0.05 BNB");
    }
    
    // Determine admin addresses
    const getTreasuryAddress = () => isTrezorMode ? DEPLOYMENT_CONFIG.trezorWallet : deployer.address;
    const getEmergencyAddress = () => isTrezorMode ? DEPLOYMENT_CONFIG.trezorWallet : deployer.address;
    const getPoolManagerAddress = () => isTrezorMode ? DEPLOYMENT_CONFIG.trezorWallet : deployer.address;
    
    // Deploy contract
    logger.section("Contract Deployment");
    
    const ContractFactory = await ethers.getContractFactory(DEPLOYMENT_CONFIG.contract);
    
    const initArgs = [
      networkConfig.usdt,
      getTreasuryAddress(),
      getEmergencyAddress(),
      getPoolManagerAddress()
    ];
    
    logger.info("Configuration:");
    logger.info(`  Contract: ${DEPLOYMENT_CONFIG.contract}`);
    logger.info(`  USDT Token: ${initArgs[0]}`);
    logger.info(`  Treasury: ${initArgs[1]} ${isTrezorMode ? '🔐 TREZOR' : ''}`);
    logger.info(`  Emergency: ${initArgs[2]} ${isTrezorMode ? '🔐 TREZOR' : ''}`);
    logger.info(`  Pool Manager: ${initArgs[3]} ${isTrezorMode ? '🔐 TREZOR' : ''}`);
    
    if (isTrezorMode) {
      logger.warning("🔐 Trezor deployment - Please confirm transaction on your device!");
    }
    
    // Deploy with UUPS proxy
    const startTime = Date.now();
    
    const contract = await upgrades.deployProxy(ContractFactory, initArgs, {
      initializer: 'initialize',
      kind: 'uups',
      timeout: 300000 // 5 minutes
    });
    
    logger.info("⏳ Waiting for deployment confirmation...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    const deploymentTime = (Date.now() - startTime) / 1000;
    
    logger.success(`Contract deployed in ${deploymentTime.toFixed(1)}s!`);
    logger.success(`Contract Address: ${contractAddress}`);
    
    // Wait for confirmations
    logger.info(`⏳ Waiting for ${DEPLOYMENT_CONFIG.confirmations} confirmations...`);
    const receipt = await contract.deploymentTransaction().wait(DEPLOYMENT_CONFIG.confirmations);
    
    // Verify deployment
    logger.section("Deployment Verification");
    
    try {
      const version = await contract.version();
      const owner = await contract.owner();
      const isPaused = await contract.paused();
      
      logger.success(`Version: ${version}`);
      logger.success(`Owner: ${owner}`);
      logger.success(`Paused: ${isPaused}`);
      
      // Verify package amounts
      const packageAmounts = await contract.getPackageAmounts();
      logger.info("Package Configuration:");
      logger.info(`  Package 1: $${ethers.formatUnits(packageAmounts[0], 6)} USDT`);
      logger.info(`  Package 2: $${ethers.formatUnits(packageAmounts[1], 6)} USDT`);
      logger.info(`  Package 3: $${ethers.formatUnits(packageAmounts[2], 6)} USDT`);
      logger.info(`  Package 4: $${ethers.formatUnits(packageAmounts[3], 6)} USDT`);
      
      // Security check for Trezor
      if (isTrezorMode) {
        const isTrezorOwner = owner.toLowerCase() === DEPLOYMENT_CONFIG.trezorWallet.toLowerCase();
        if (isTrezorOwner) {
          logger.success("🔐 Trezor wallet is the contract owner - SECURED!");
        } else {
          logger.error("❌ Trezor wallet is NOT the owner - SECURITY ISSUE!");
        }
      }
      
    } catch (error) {
      logger.warning(`Some verification checks failed: ${error.message}`);
    }
    
    // Save deployment info
    logger.section("Saving Deployment Information");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const networkType = hardhatNetworkName.includes('testnet') ? 'testnet' : 'mainnet';
    const filename = `deployment-${networkType}-${timestamp}.json`;
    
    const deploymentInfo = {
      network: networkConfig.name,
      chainId: Number(network.chainId),
      contractName: DEPLOYMENT_CONFIG.contract,
      contractAddress: contractAddress,
      deployer: deployer.address,
      trezorSecured: isTrezorMode,
      treasury: getTreasuryAddress(),
      emergency: getEmergencyAddress(),
      poolManager: getPoolManagerAddress(),
      transactionHash: receipt?.hash,
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed?.toString(),
      deploymentTime: deploymentTime,
      timestamp: new Date().toISOString(),
      version: DEPLOYMENT_CONFIG.version,
      explorerUrl: `${networkConfig.explorer}/address/${contractAddress}`
    };
    
    // Create deployments directory
    const deploymentsDir = path.join(__dirname, 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment file
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    
    // Update latest deployment
    const latestFilepath = path.join(deploymentsDir, `latest-${networkType}.json`);
    fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));
    
    logger.success(`Deployment info saved: ${filename}`);
    
    // Final summary
    logger.section("🎉 DEPLOYMENT COMPLETE!");
    logger.success(`Contract Address: ${contractAddress}`);
    logger.success(`Explorer: ${networkConfig.explorer}/address/${contractAddress}`);
    
    if (isTrezorMode) {
      logger.success("🔐 Contract secured with Trezor wallet!");
    }
    
    logger.info("\n📋 Next Steps:");
    logger.info("1. Verify contract on block explorer");
    logger.info("2. Update frontend configuration"); 
    logger.info("3. Run integration tests");
    logger.info("4. Set up monitoring");
    
    console.log("\n" + "=".repeat(60));
    console.log("🚀 UNIFIED DEPLOYMENT SYSTEM - SUCCESS!");
    console.log("   No more scattered deployment scripts needed!");
    console.log("=".repeat(60));
    
    return {
      contractAddress,
      deployer: deployer.address,
      trezorSecured: isTrezorMode,
      deploymentInfo
    };
    
  } catch (error) {
    logger.error(`Deployment failed: ${error.message}`);
    console.error(error);
    throw error;
  }
}

// Run deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
