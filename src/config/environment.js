// Environment configuration - using secure app config instead of env variables
// Note: All frontend env variables (VITE_*) are PUBLIC and visible to users
import { APP_CONFIG } from './app.js';

export const ENV = {
  // Use secure app config for contract information (public blockchain data)
  CONTRACT_ADDRESS: APP_CONFIG.contract.address,
  USDT_ADDRESS: APP_CONFIG.contract.network.tokens.usdt,
  NETWORK_ID: APP_CONFIG.contract.network.chainId,
  RPC_URL: APP_CONFIG.contract.network.rpcUrl,
  
  // Optional: Allow environment overrides for development
  DEV_CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
  DEV_USDT_ADDRESS: import.meta.env.VITE_USDT_ADDRESS,
  DEV_NETWORK_ID: import.meta.env.VITE_NETWORK_ID,
  DEV_RPC_URL: import.meta.env.VITE_RPC_URL
};
