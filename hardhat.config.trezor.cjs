require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomicfoundation/hardhat-chai-matchers");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-contract-sizer");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.22",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000
          },
          metadata: {
            bytecodeHash: "none"
          }
        }
      }
    ]
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 70, // Increased account count for extensive testing
      },
    },
    bsc_testnet: {
      url:
        process.env.BSC_TESTNET_RPC_URL ||
        "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : ["0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"],
      gasPrice: 20000000000, // 20 Gwei
    },
    bsc_mainnet: {
      url:
        process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      // Priority: TREASURY_PRIVATE_KEY (for upgrades) > ADMIN_PRIVATE_KEY > DEPLOYER_PRIVATE_KEY
      accounts: process.env.TREASURY_PRIVATE_KEY 
        ? [process.env.TREASURY_PRIVATE_KEY] 
        : process.env.ADMIN_PRIVATE_KEY 
        ? [process.env.ADMIN_PRIVATE_KEY] 
        : process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY] 
        : [],
      gasPrice: 3000000000, // 3 Gwei (BSC optimized)
      gasLimit: 6000000,    // 6M gas limit
      timeout: 60000,       // 60 second timeout
    },
    bsc: {
      url:
        process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed2.defibit.io/",
      chainId: 56,
      // SECURITY: Hardware wallet configuration (recommended)
      accounts: process.env.MNEMONIC 
        ? { mnemonic: process.env.MNEMONIC }
        : process.env.ADMIN_PRIVATE_KEY 
        ? [process.env.ADMIN_PRIVATE_KEY] 
        : process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY] 
        : [],
      gasPrice: 3000000000, // 3 Gwei (BSC optimized)
      gasLimit: 6000000,    // 6M gas limit
      timeout: 60000,       // 60 second timeout
    },
  },
  etherscan: {
    // Set up BSCScan API key in .env file
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
  },
  mocha: {
    timeout: 40000,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false,
    only: ["OrphiCrowdFund"],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Exclude archive, backup, and temp folders from compilation
  solidityExtSettings: {
    ignoreWarnings: true,
    exclude: [
      "contracts/archive/**/*",
      "contracts/backup/**/*", 
      "contracts/temp/**/*",
      "contracts/**/backup_*",
      "contracts/**/*_backup*",
      "contracts/**/*Archived*",
      "contracts/**/*Archive*"
    ]
  },
};
