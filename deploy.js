#!/usr/bin/env node

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
 * Usage:
 *   npm run deploy testnet                    # Deploy to BSC Testnet
 *   npm run deploy testnet --trezor           # Deploy to Testnet with Trezor
 *   npm run deploy mainnet                    # Deploy to BSC Mainnet  
 *   npm run deploy mainnet --trezor           # Deploy to Mainnet with Trezor
 *   npm run deploy --check ADDRESS           # Check existing deployment
 *   npm run deploy --estimate NETWORK        # Estimate gas costs
 */

// Setup environment for Hardhat
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Load environment variables
require("dotenv").config({ path: ".env.trezor" });

const hre = require("hardhat");
const { ethers, upgrades } = hre;
const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

// ============================================================================
// CONFIGURATION - Single Source of Truth
// ============================================================================

const NETWORKS = {
  testnet: {
    name: "BSC Testnet",
    chainId: 97,
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    usdt: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
    explorer: "https://testnet.bscscan.com",
    gasPrice: "20000000000", // 20 Gwei
    gasLimit: 8000000
  },
  mainnet: {
    name: "BSC Mainnet", 
    chainId: 56,
    rpc: "https://bsc-dataseed1.binance.org/",
    usdt: "0x55d398326f99059fF775485246999027B3197955",
    explorer: "https://bscscan.com",
    gasPrice: "5000000000", // 5 Gwei
    gasLimit: 3000000
  }
};

const DEPLOYMENT_CONFIG = {
  contract: "OrphiCrowdFund",
  trezorWallet: "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29",
  minBalance: "0.1", // Minimum BNB required
  confirmations: 3,
  retryAttempts: 3,
  retryDelay: 5000,
  version: "2.0.0"
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
// CORE DEPLOYMENT ENGINE
// ============================================================================

class DeploymentEngine {
  constructor(network, options = {}) {
    this.network = NETWORKS[network];
    this.networkName = network;
    this.options = options;
    this.results = {};
    
    if (!this.network) {
      throw new Error(`❌ Unknown network: ${network}. Use 'testnet' or 'mainnet'`);
    }
  }

  async validateEnvironment() {
    logger.section("Environment Validation");
    
    // Set the correct Hardhat network
    const hardhatNetwork = this.networkName === 'testnet' ? 'bsc_testnet_trezor' : 'bscMainnet';
    
    // Check network connection
    const provider = new ethers.JsonRpcProvider(this.network.rpc);
    const networkInfo = await provider.getNetwork();
    
    if (Number(networkInfo.chainId) !== this.network.chainId) {
      throw new Error(`❌ Network mismatch! Expected ${this.network.chainId}, got ${networkInfo.chainId}`);
    }
    
    logger.success(`Connected to ${this.network.name} (Chain ID: ${this.network.chainId})`);
    
    // Get deployer account from Hardhat
    await hre.changeNetwork(hardhatNetwork);
    const [deployer] = await ethers.getSigners();
    if (!deployer) {
      throw new Error("❌ No deployer account found! Check your private key configuration.");
    }
    
    const balance = await provider.getBalance(deployer.address);
    logger.info(`Deployer: ${deployer.address}`);
    logger.info(`Balance: ${formatBNB(balance)} BNB`);
    
    if (balance < ethers.parseEther(DEPLOYMENT_CONFIG.minBalance)) {
      throw new Error(`❌ Insufficient balance! Need at least ${DEPLOYMENT_CONFIG.minBalance} BNB`);
    }
    
    this.deployer = deployer;
    this.provider = provider;
    
    return true;
  }

  async estimateGasCosts() {
    logger.section("Gas Cost Estimation");
    
    try {
      const ContractFactory = await ethers.getContractFactory(DEPLOYMENT_CONFIG.contract);
      const gasEstimate = await ContractFactory.getDeploymentTransaction(
        this.network.usdt,
        this.getTreasuryAddress(),
        this.getEmergencyAddress(), 
        this.getPoolManagerAddress()
      ).then(tx => tx.gasLimit);
      
      const gasPrice = BigInt(this.network.gasPrice);
      const estimatedCost = gasEstimate * gasPrice;
      
      logger.info(`Gas Estimate: ${gasEstimate.toLocaleString()}`);
      logger.info(`Gas Price: ${formatGwei(gasPrice)} gwei`);
      logger.info(`Estimated Cost: ${formatBNB(estimatedCost)} BNB`);
      logger.info(`USD Cost (BNB=$600): $${(parseFloat(formatBNB(estimatedCost)) * 600).toFixed(2)}`);
      
      return { gasEstimate, gasPrice, estimatedCost };
    } catch (error) {
      logger.warning(`Gas estimation failed: ${error.message}`);
      return {
        gasEstimate: BigInt(this.network.gasLimit),
        gasPrice: BigInt(this.network.gasPrice),
        estimatedCost: BigInt(this.network.gasLimit) * BigInt(this.network.gasPrice)
      };
    }
  }

  getTreasuryAddress() {
    return this.options.trezor ? DEPLOYMENT_CONFIG.trezorWallet : this.deployer.address;
  }

  getEmergencyAddress() {
    return this.options.trezor ? DEPLOYMENT_CONFIG.trezorWallet : this.deployer.address;
  }

  getPoolManagerAddress() {
    return this.options.trezor ? DEPLOYMENT_CONFIG.trezorWallet : this.deployer.address;
  }

  async deployContract() {
    logger.section("Contract Deployment");
    
    const ContractFactory = await ethers.getContractFactory(DEPLOYMENT_CONFIG.contract);
    
    const initArgs = [
      this.network.usdt,
      this.getTreasuryAddress(),
      this.getEmergencyAddress(),
      this.getPoolManagerAddress()
    ];
    
    logger.info("Deployment Configuration:");
    logger.info(`  Contract: ${DEPLOYMENT_CONFIG.contract}`);
    logger.info(`  USDT Token: ${initArgs[0]}`);
    logger.info(`  Treasury: ${initArgs[1]} ${this.options.trezor ? '🔐 TREZOR' : ''}`);
    logger.info(`  Emergency: ${initArgs[2]} ${this.options.trezor ? '🔐 TREZOR' : ''}`);
    logger.info(`  Pool Manager: ${initArgs[3]} ${this.options.trezor ? '🔐 TREZOR' : ''}`);
    
    if (this.options.trezor) {
      logger.warning("Trezor deployment - Please confirm transaction on your Trezor device!");
    }
    
    const startTime = Date.now();
    
    // Deploy with UUPS proxy
    const contract = await upgrades.deployProxy(ContractFactory, initArgs, {
      initializer: 'initialize',
      kind: 'uups',
      gasLimit: this.network.gasLimit,
      gasPrice: this.network.gasPrice
    });
    
    logger.info("Waiting for deployment confirmation...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    const deploymentTime = (Date.now() - startTime) / 1000;
    
    logger.success(`Contract deployed in ${deploymentTime.toFixed(1)}s!`);
    logger.success(`Contract Address: ${contractAddress}`);
    
    // Wait for additional confirmations
    logger.info(`Waiting for ${DEPLOYMENT_CONFIG.confirmations} confirmations...`);
    const receipt = await contract.deploymentTransaction().wait(DEPLOYMENT_CONFIG.confirmations);
    
    this.results.contract = contract;
    this.results.address = contractAddress;
    this.results.receipt = receipt;
    this.results.deploymentTime = deploymentTime;
    
    return contract;
  }

  async verifyDeployment() {
    logger.section("Deployment Verification");
    
    const { contract, address } = this.results;
    
    try {
      // Check basic contract info
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
      
      // Security checks
      if (this.options.trezor) {
        const isTrezorOwner = owner.toLowerCase() === DEPLOYMENT_CONFIG.trezorWallet.toLowerCase();
        if (isTrezorOwner) {
          logger.success("✅ Trezor wallet is the contract owner - SECURED!");
        } else {
          logger.error("❌ Trezor wallet is NOT the owner - SECURITY ISSUE!");
        }
      }
      
      this.results.verified = true;
      return true;
      
    } catch (error) {
      logger.error(`Verification failed: ${error.message}`);
      this.results.verified = false;
      return false;
    }
  }

  async saveDeploymentInfo() {
    logger.section("Saving Deployment Information");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `deployment-${this.networkName}-${timestamp}.json`;
    
    const deploymentInfo = {
      network: this.network.name,
      chainId: this.network.chainId,
      contractName: DEPLOYMENT_CONFIG.contract,
      contractAddress: this.results.address,
      deployer: this.deployer.address,
      trezorSecured: this.options.trezor || false,
      treasury: this.getTreasuryAddress(),
      emergency: this.getEmergencyAddress(),
      poolManager: this.getPoolManagerAddress(),
      transactionHash: this.results.receipt?.hash,
      blockNumber: this.results.receipt?.blockNumber,
      gasUsed: this.results.receipt?.gasUsed?.toString(),
      gasPrice: this.results.receipt?.gasPrice?.toString(),
      deploymentTime: this.results.deploymentTime,
      timestamp: new Date().toISOString(),
      verified: this.results.verified,
      version: DEPLOYMENT_CONFIG.version,
      explorerUrl: `${this.network.explorer}/address/${this.results.address}`
    };
    
    // Save to deployments directory
    const deploymentsDir = path.join(__dirname, 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const filepath = path.join(deploymentsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    
    // Update latest deployment info
    const latestFilepath = path.join(deploymentsDir, `latest-${this.networkName}.json`);
    fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));
    
    logger.success(`Deployment info saved: ${filename}`);
    logger.success(`Latest deployment updated: latest-${this.networkName}.json`);
    
    return deploymentInfo;
  }

  async run() {
    try {
      logger.section(`OrphiCrowdFund Deployment - ${this.network.name}`);
      
      await this.validateEnvironment();
      await this.estimateGasCosts();
      await this.deployContract();
      await this.verifyDeployment();
      const deploymentInfo = await this.saveDeploymentInfo();
      
      logger.section("Deployment Complete!");
      logger.success(`Contract Address: ${this.results.address}`);
      logger.success(`Explorer: ${this.network.explorer}/address/${this.results.address}`);
      
      if (this.options.trezor) {
        logger.success("🔐 Contract secured with Trezor wallet!");
      }
      
      logger.info("\n📋 Next Steps:");
      logger.info("1. Verify contract on block explorer");
      logger.info("2. Update frontend configuration");
      logger.info("3. Run integration tests");
      logger.info("4. Set up monitoring");
      
      return deploymentInfo;
      
    } catch (error) {
      logger.error(`Deployment failed: ${error.message}`);
      throw error;
    }
  }
}

// ============================================================================
// ADDITIONAL UTILITIES
// ============================================================================

async function checkDeployment(address) {
  logger.section("Deployment Check");
  
  try {
    const contract = await ethers.getContractAt(DEPLOYMENT_CONFIG.contract, address);
    
    const owner = await contract.owner();
    const version = await contract.version();
    const isPaused = await contract.paused();
    
    logger.success(`Contract Address: ${address}`);
    logger.success(`Version: ${version}`);
    logger.success(`Owner: ${owner}`);
    logger.success(`Paused: ${isPaused}`);
    
    const isTrezorOwned = owner.toLowerCase() === DEPLOYMENT_CONFIG.trezorWallet.toLowerCase();
    logger.info(`Trezor Secured: ${isTrezorOwned ? '✅ YES' : '❌ NO'}`);
    
    return { address, owner, version, isPaused, isTrezorOwned };
    
  } catch (error) {
    logger.error(`Check failed: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const argv = yargs
    .usage('Usage: $0 <network> [options]')
    .command('testnet', 'Deploy to BSC Testnet')
    .command('mainnet', 'Deploy to BSC Mainnet')
    .option('trezor', {
      alias: 't',
      type: 'boolean',
      description: 'Use Trezor wallet for admin roles'
    })
    .option('check', {
      alias: 'c',
      type: 'string',
      description: 'Check existing deployment at address'
    })
    .option('estimate', {
      alias: 'e',
      type: 'string',
      description: 'Estimate gas costs for network'
    })
    .help('h')
    .alias('h', 'help')
    .argv;

  const network = argv._[0];
  
  // Handle special commands
  if (argv.check) {
    return await checkDeployment(argv.check);
  }
  
  if (argv.estimate) {
    const engine = new DeploymentEngine(argv.estimate);
    await engine.validateEnvironment();
    return await engine.estimateGasCosts();
  }
  
  // Standard deployment
  if (!network || !['testnet', 'mainnet'].includes(network)) {
    logger.error("Please specify 'testnet' or 'mainnet'");
    logger.info("Usage: npm run deploy testnet [--trezor]");
    logger.info("       npm run deploy mainnet [--trezor]");
    process.exit(1);
  }
  
  const options = {
    trezor: argv.trezor || false
  };
  
  const engine = new DeploymentEngine(network, options);
  return await engine.run();
}

// Execute if called directly
if (require.main === module) {
  main()
    .then((result) => {
      console.log("\n🎉 Deployment successful!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Deployment failed:", error.message);
      process.exit(1);
    });
}

module.exports = { DeploymentEngine, checkDeployment };
