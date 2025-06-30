// Global type declarations for Web3
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (args: any) => void) => void;
      removeAllListeners: (event: string) => void;
      selectedAddress?: string;
      chainId?: string;
    };
  }
}

// Contract types
export interface UserInfo {
  isRegistered: boolean;
  packageLevel: number;
  balance: string;
  totalEarnings: string;
  earningsCap: string;
  directReferrals: number;
  referrer: string;
  teamSize: number;
  withdrawalRate: number;
}

export interface SystemInfo {
  isOperational: boolean;
  userCount: number;
  totalFeesCollected: string;
  contractUSDTBalance: string;
  contractBNBBalance: string;
  circuitBreakerStatus: boolean;
  totalUsers: number;
}

export interface PackageInfo {
  level: number;
  name: string;
  price: string;
  priceWei: string;
}

export interface LeadFiveConfig {
  contractAddress: string;
  implementationAddress: string;
  network: {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorer: string;
  };
  tokens: {
    usdt: {
      address: string;
      decimals: number;
      symbol: string;
    };
  };
  packages: Record<string, PackageInfo>;
  sponsorAddress: string;
  dailyWithdrawalLimit: string;
  platformInfo: {
    name: string;
    description: string;
    version: string;
  };
}

export {};
