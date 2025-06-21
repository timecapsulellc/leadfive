// Application Constants
export const APP_CONFIG = {
  NAME: "LeadFive",
  SHORT_NAME: "LeadFive", 
  TAGLINE: "The Decentralized Incentive Platform",
  VERSION: "v1.0",
  DESCRIPTION: "Bank-grade security meets transparent earning potential",
  DEVELOPER: "LeadFive Team"
};

// OrphiChain Official Brand Colors
export const BRAND_COLORS = {
  // Primary Brand Colors
  CYBER_BLUE: "#00D4FF",
  ROYAL_PURPLE: "#7B2CBF",
  ENERGY_ORANGE: "#FF6B35",
  
  // Secondary Colors
  DEEP_SPACE: "#1A1A2E",
  MIDNIGHT_BLUE: "#16213E",
  SILVER_MIST: "#B8C5D1",
  
  // Accent Colors
  SUCCESS_GREEN: "#00FF88",
  ALERT_RED: "#FF4757",
  PREMIUM_GOLD: "#FFD700",
  
  // Neutral Colors
  PURE_WHITE: "#FFFFFF",
  CHARCOAL_GRAY: "#2D3748",
  TRUE_BLACK: "#0A0A0A",
  
  // Legacy mappings for compatibility
  PRIMARY: "#00D4FF",
  SECONDARY: "#00FF88", 
  ACCENT: "#7B2CBF",
  SUCCESS: "#00FF88",
  ERROR: "#FF4757",
  WARNING: "#FFD700",
  BACKGROUND: "#1A1A2E",
  CARD_BG: "#16213E",
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "#B8C5D1"
};

// Compensation Pool Configuration with Brand Colors
export const COMPENSATION_POOLS = [
  { 
    name: 'Referral Reward', 
    percentage: 40, 
    color: BRAND_COLORS.CYBER_BLUE,
    description: 'Direct referral reward' 
  },
  { 
    name: 'Network Bonus', 
    percentage: 10, 
    color: BRAND_COLORS.ROYAL_PURPLE,
    description: 'Network growth bonus' 
  },
  { 
    name: 'Global Upline Bonus', 
    percentage: 10, 
    color: BRAND_COLORS.SUCCESS_GREEN,
    description: 'Upline support bonus' 
  },
  { 
    name: 'Leader Bonus Pool', 
    percentage: 10, 
    color: BRAND_COLORS.PREMIUM_GOLD,
    description: 'Leadership rewards' 
  },
  { 
    name: 'Global Help Pool', 
    percentage: 30, 
    color: BRAND_COLORS.ENERGY_ORANGE,
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
