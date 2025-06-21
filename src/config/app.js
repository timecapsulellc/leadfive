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
    address: '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569', // ✅ NEW MAINNET DEPLOYMENT
    network: {
      name: 'BSC Mainnet',
      chainId: 56,
      rpcUrl: 'https://bsc-dataseed.binance.org/',
      explorer: 'https://bscscan.com',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      },
      tokens: {
        usdt: '0x55d398326f99059fF775485246999027B3197955'
      }
    },
    admin: {
      owner: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29',
      feeRecipient: '0xeB652c4523f3Cf615D3F3694b14E551145953aD0'
    }
  },
  
  // Social Links
  social: {
    telegram: 'https://t.me/leadfive',
    twitter: 'https://twitter.com/leadfive',
    github: 'https://github.com/timecapsulellc/LeadFive'
  }
};
