// Network configurations for LeadFive deployment
export const NETWORKS = {
  bsc: {
    chainId: 56,
    name: 'BSC Mainnet',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorerUrl: 'https://bscscan.com',
    symbol: 'BNB',
    contracts: {
      leadfive: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498',
      usdt: '0x55d398326f99059fF775485246999027B3197955'
    }
  }
};

export const DEFAULT_NETWORK = NETWORKS.bsc;
