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
    address: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498', // ✅ UPDATED MAINNET DEPLOYMENT
    network: {
      name: 'BSC Mainnet',
      chainId: 56,
      rpcUrl: 'https://bsc-dataseed.binance.org/',
      explorer: 'https://bscscan.com',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
      },
      tokens: {
        usdt: '0x55d398326f99059fF775485246999027B3197955',
      },
    },
    admin: {
      owner: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // Will be updated to deployer during development
      feeRecipient: '0xeB652c4523f3Cf615D3F3694b14E551145953aD0',
      treasuryWallet: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // Development treasury (changeable)

      // Client handover addresses (for future reference)
      clientOwner: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // Final client owner
      clientTreasury: '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // Final client treasury
    },
  },

  // Social Links
  social: {
    telegram: 'https://t.me/leadfive',
    twitter: 'https://twitter.com/leadfive',
    github: 'https://github.com/timecapsulellc/LeadFive',
  },
};
