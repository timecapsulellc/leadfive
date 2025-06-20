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
    address: '0x7FEEA22942407407801cCDA55a4392f25975D998',
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
