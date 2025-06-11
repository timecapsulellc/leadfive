
// Application Constants
export const APP_CONFIG = {
  NAME: "Orphi Chain CrowdFund",
  SHORT_NAME: "OrphiChain", 
  TAGLINE: "AI-Powered Cross-Chain Community Platform",
  VERSION: "v4.0",
  DESCRIPTION: "Revolutionary blockchain-based crowdfunding platform with 5-pool compensation system"
};

// Branding Colors
export const BRAND_COLORS = {
  PRIMARY: "#00D4FF",
  SECONDARY: "#59CD90", 
  ACCENT: "#2E86AB",
  SUCCESS: "#7ED321",
  ERROR: "#FF4757",
  WARNING: "#FFA726",
  BACKGROUND: "#1A1A2E",
  CARD_BG: "#16213e",
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "#B8C5D1"
};

// Compensation Pool Configuration
export const COMPENSATION_POOLS = [
  { 
    name: 'Sponsor Commission', 
    percentage: 40, 
    color: BRAND_COLORS.ACCENT,
    description: 'Direct referral commission' 
  },
  { 
    name: 'Level Bonus', 
    percentage: 10, 
    color: '#3FA7D6',
    description: 'Multi-level team bonus' 
  },
  { 
    name: 'Global Upline Bonus', 
    percentage: 10, 
    color: BRAND_COLORS.SECONDARY,
    description: 'Upline support bonus' 
  },
  { 
    name: 'Leader Bonus Pool', 
    percentage: 10, 
    color: BRAND_COLORS.SUCCESS,
    description: 'Leadership rewards' 
  },
  { 
    name: 'Global Help Pool', 
    percentage: 30, 
    color: '#A23B72',
    description: 'Community support fund' 
  }
];

// Withdrawal Rate Configuration
export const WITHDRAWAL_RATES = {
  '0-4': { withdraw: 70, reinvest: 30 },
  '5-19': { withdraw: 75, reinvest: 25 },
  '20+': { withdraw: 80, reinvest: 20 }
};

// Network Configuration
export const NETWORK_CONFIG = {
  BSC_MAINNET: {
    chainId: 56,
    name: "BSC Mainnet",
    rpc: "https://bsc-dataseed.binance.org/",
    explorer: "https://bscscan.com",
    symbol: "BNB"
  },
  BSC_TESTNET: {
    chainId: 97, 
    name: "BSC Testnet",
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    explorer: "https://testnet.bscscan.com",
    symbol: "tBNB"
  }
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  NOTIFICATION_TIMEOUT: 5000,
  REFRESH_INTERVAL: 30000,
  MAX_RETRY_ATTEMPTS: 3
};
