require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

const { DEPLOYER_PRIVATE_KEY, BSC_TESTNET_RPC_URL, BSC_MAINNET_RPC_URL, BSCSCAN_API_KEY } = process.env;

// Validate private key format
const isValidPrivateKey = (key) => {
    return key && key.length === 64 && /^[0-9a-fA-F]{64}$/.test(key);
};

// Get accounts array safely
const getAccounts = (privateKey) => {
    if (!privateKey || !isValidPrivateKey(privateKey)) {
        console.warn("⚠️ No valid private key found. Using default hardhat accounts.");
        return undefined; // Use hardhat's default accounts
    }
    return [`0x${privateKey}`]; // Add 0x prefix
};

module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true
    },
    bscTestnet: {
      url: BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: getAccounts(DEPLOYER_PRIVATE_KEY),
      gasPrice: 10000000000,
      timeout: 60000
    },
    bsc: {
      url: BSC_MAINNET_RPC_URL || "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: getAccounts(DEPLOYER_PRIVATE_KEY),
      gasPrice: 5000000000,
      timeout: 60000
    }
  },
  etherscan: {
    apiKey: {
      bsc: BSCSCAN_API_KEY || "",
      bscTestnet: BSCSCAN_API_KEY || ""
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
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
