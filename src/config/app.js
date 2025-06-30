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
    address: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498', // ✅ MAINNET PROXY ADDRESS
    implementation: '0xA4AB35Ab2BA415E6CCf9559e8dcAB0661cC29e2b', // ✅ MAINNET IMPLEMENTATION
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
      owner: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // ✅ TREZOR WALLET (NEW OWNER)
      sponsorAddress: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // ✅ TREZOR WALLET FOR NEW REGISTRATIONS
      feeRecipient: '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335' // ✅ DEPLOYER FOR PLATFORM FEES (can be changed by Trezor)
    }
  },
  
  // Social Links
  social: {
    telegram: 'https://t.me/leadfive',
    twitter: 'https://twitter.com/leadfive',
    github: 'https://github.com/timecapsulellc/LeadFive'
  }
};
