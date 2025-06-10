require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

// Trezor Hardware Wallet Support - Commented out for now
// const { LedgerSigner } = require("@anders-t/ethers-ledger");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200 // Reduced for simpler compilation
      },
      viaIR: false, // Disabled for compatibility
      metadata: {
        bytecodeHash: "none" // Reduces deployment gas costs
      }
    }
  },
  networks: {
    bscMainnet: {
      url: process.env.RPC_URL || "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
      // Gas optimization for mainnet
      gasPrice: "auto", // Dynamic gas pricing
      gasMultiplier: 1.1, // 10% buffer for gas estimation
      gas: "auto",
      timeout: 120000, // 2 minutes timeout for Trezor signing
      confirmations: 3,
      // Trezor-specific settings
      allowUnlimitedContractSize: false,
      blockGasLimit: 30000000,
      // Fallback RPC endpoints
      httpHeaders: {
        "User-Agent": "OrphiChain-Mainnet-Deployment/1.0.0"
      }
    },
    // Backup mainnet endpoints
    bscMainnetBackup1: {
      url: "https://bsc-dataseed2.binance.org/",
      chainId: 56,
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 120000
    },
    bscMainnetBackup2: {
      url: "https://bsc-dataseed3.binance.org/",
      chainId: 56,
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 120000
    },
    // Local development with mainnet fork
    mainnetFork: {
      url: "http://127.0.0.1:8545/",
      chainId: 56,
      forking: {
        url: process.env.RPC_URL || "https://bsc-dataseed1.binance.org/",
        blockNumber: undefined // Latest block
      },
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "bscMainnet",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com"
        }
      }
    ]
  },
  // Gas reporting for optimization
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 5, // 5 gwei
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "BNB",
    gasPriceApi: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
    showMethodSig: true,
    maxMethodDiff: 10,
    excludeContracts: ["MockUSDT", "MockPriceOracle"]
  },
  // Contract size reporting
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["OrphichainCrowdfundPlatformUpgradeable"]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache-mainnet",
    artifacts: "./artifacts-mainnet"
  },
  mocha: {
    timeout: 120000, // 2 minutes for Trezor operations
    reporter: "spec",
    slow: 10000
  },
  // Upgrades plugin configuration
  upgrades: {
    silenceWarnings: false,
    unsafeAllow: ["constructor", "state-variable-immutable"],
    timeout: 120000
  },
  // Defender configuration for monitoring
  defender: {
    apiKey: process.env.DEFENDER_API_KEY,
    apiSecret: process.env.DEFENDER_API_SECRET
  },
  // Custom tasks configuration
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5"
  }
};

// Custom task for Trezor deployment
task("deploy-trezor", "Deploy with Trezor hardware wallet")
  .addParam("contract", "Contract name to deploy")
  .addOptionalParam("verify", "Verify contract on BSCScan", false, types.boolean)
  .setAction(async (taskArgs, hre) => {
    console.log("🔐 Preparing Trezor deployment...");
    console.log(`📋 Contract: ${taskArgs.contract}`);
    console.log(`🔍 Verify: ${taskArgs.verify}`);
    
    // Import deployment script
    const deployScript = require("./scripts/deploy-mainnet-trezor.js");
    await deployScript(taskArgs.contract, taskArgs.verify);
  });

// Custom task for gas estimation
task("estimate-gas", "Estimate deployment gas costs")
  .addParam("contract", "Contract name to estimate")
  .setAction(async (taskArgs, hre) => {
    console.log("⛽ Estimating gas costs...");
    const gasEstimator = require("./scripts/gas-estimator.js");
    await gasEstimator(taskArgs.contract);
  });

// Custom task for pre-deployment checks
task("pre-deploy-check", "Run pre-deployment security checks")
  .setAction(async (taskArgs, hre) => {
    console.log("🛡️ Running pre-deployment checks...");
    const preDeployCheck = require("./scripts/pre-deploy-check.js");
    await preDeployCheck();
  });
