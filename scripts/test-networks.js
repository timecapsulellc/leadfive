// Simple test to check network configuration
require('dotenv').config();

const { DEPLOYER_PRIVATE_KEY, BSC_MAINNET_RPC_URL, BSC_TESTNET_RPC_URL, BSCSCAN_API_KEY } = process.env;

console.log('Environment variables:');
console.log('DEPLOYER_PRIVATE_KEY length:', DEPLOYER_PRIVATE_KEY ? DEPLOYER_PRIVATE_KEY.length : 'undefined');
console.log('BSC_TESTNET_RPC_URL:', BSC_TESTNET_RPC_URL || 'using default');

// Check if the key is valid
const isValidPrivateKey = (key) => {
  return key && 
         key !== 'YOUR_PRIVATE_KEY_HERE' && 
         key.length >= 64 && 
         /^[0-9a-fA-F]+$/.test(key.replace('0x', ''));
};

console.log('Private key valid:', isValidPrivateKey(DEPLOYER_PRIVATE_KEY));

// Try importing the config
try {
  const config = require('./hardhat.config.js');
  console.log('Available networks:', Object.keys(config.networks));
} catch (error) {
  console.error('Config error:', error.message);
}
