require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      gas: 12000000,
      gasPrice: 20000000000,
      allowUnlimitedContractSize: true,
    },
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gas: 6000000,
      gasPrice: 10000000000, // 10 gwei
      timeout: 120000, // 2 minutes
      confirmations: 3,
    },
    bscMainnet: {
      url: process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
      gas: 6000000,
      gasPrice: 5000000000, // 5 gwei
      timeout: 120000,
      confirmations: 5,
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
    },
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 120000, // 2 minutes for upgradeable deployments
  },
  // OpenZeppelin upgrades configuration
  upgrades: {
    silenceWarnings: false,
  },
};
