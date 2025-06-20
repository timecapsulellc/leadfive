export const APP_CONFIG = {
  // Domain Configuration
  domain: 'https://leadfive.today',
  appName: 'LeadFive',
  
  // API Endpoints (for future use)
  api: {
    baseUrl: 'https://api.leadfive.today',
  },
  
  // Smart Contract Configuration
  contract: {
    address: '0x742d35Cc6634C0532925a3b8D398389b7aaB0F7d',
    network: {
      name: 'BSC Mainnet',
      chainId: 56,
      rpcUrl: 'https://bsc-dataseed.binance.org/',
      explorer: 'https://bscscan.com',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      }
    }
  },
  
  // Social Links
  social: {
    telegram: 'https://t.me/leadfive',
    twitter: 'https://twitter.com/leadfive',
    github: 'https://github.com/timecapsulellc/LeadFive'
  }
};
